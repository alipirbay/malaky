import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MADAGASCAR_TZ = "Indian/Antananarivo";

function getMadagascarDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: MADAGASCAR_TZ });
}

// Fallback dilemmes in case AI generation fails
const FALLBACK_DILEMMES = [
  { question: "Taxi-be bondé ou marcher 5km sous la pluie ?", option_a: "Taxi-be bondé", option_b: "Marcher sous la pluie", topic: "société" },
  { question: "Jirama stable pendant 1 an ou WiFi gratuit pendant 1 an ?", option_a: "Jirama stable", option_b: "WiFi gratuit", topic: "technologie" },
  { question: "Vivre à Tana toute ta vie ou ne jamais y retourner ?", option_a: "Tana pour toujours", option_b: "Jamais y retourner", topic: "société" },
  { question: "Manger que du riz pendant 1 mois ou jamais de riz pendant 1 mois ?", option_a: "Que du riz", option_b: "Zéro riz", topic: "culture" },
  { question: "Avoir le pouvoir de parler toutes les langues ou de jouer tous les instruments ?", option_a: "Toutes les langues", option_b: "Tous les instruments", topic: "culture" },
  { question: "Être célèbre à Madagascar ou riche à l'étranger ?", option_a: "Célèbre à Mada", option_b: "Riche à l'étranger", topic: "société" },
  { question: "Revivre ton enfance ou avancer de 10 ans ?", option_a: "Revivre l'enfance", option_b: "Avancer de 10 ans", topic: "société" },
  { question: "Supprimer Instagram ou supprimer TikTok ?", option_a: "Supprimer Insta", option_b: "Supprimer TikTok", topic: "technologie" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = getMadagascarDateString();
    const { data: existing } = await supabase
      .from("daily_dilemmes")
      .select("*")
      .eq("active_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ dilemme: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let dilemmeData;

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Tu es un générateur de dilemmes quotidiens pour Malaky, le jeu préféré des Malgaches.
Génère UN dilemme ancré dans la réalité malgache ou dans des sujets qui parlent aux Malgaches.

SUJETS PRIORITAIRES (alterne chaque jour) :
- Vie quotidienne à Mada : taxi-be, Jirama, Tana, mora mora, heure gasy
- Culture gasy : fady, famadihana, fihavanana, hira gasy, kabary
- Nourriture : riz vs pain, romazava, brochettes, mofo baolina, trembo
- Société : vazaha vs gasy, exode rural, jeunesse, réseaux sociaux
- Rivalités régionales et inter-ethniques (traiter avec humour)
- Actualité Madagascar et Afrique
- Questions universelles mais formulées à la sauce malgache

RÈGLES :
- Options ultra courtes : 3 à 6 mots max
- Ton fun et accessible, pas académique
- Doit diviser vraiment les gens (ni trop évident, ni trop clivant)
- Pas de politique partisane, pas de religion
- Peut alterner français et quelques mots malgaches courants

Réponds UNIQUEMENT avec un JSON valide sans markdown.`,
            },
            {
              role: "user",
              content: `Génère le dilemme du jour (${today}). Options courtes sans parenthèses. Format JSON :
{"question": "La question du dilemme", "option_a": "Choix A court", "option_b": "Choix B court", "topic": "catégorie"}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_dilemme",
                description: "Create a daily dilemme question with two options",
                parameters: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "The dilemme question" },
                    option_a: { type: "string", description: "First choice" },
                    option_b: { type: "string", description: "Second choice" },
                    topic: { type: "string", enum: ["politique", "économie", "société", "culture", "sport", "technologie", "environnement"] },
                  },
                  required: ["question", "option_a", "option_b", "topic"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_dilemme" } },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI error:", response.status, errText);

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

      if (toolCall?.function?.arguments) {
        dilemmeData = JSON.parse(toolCall.function.arguments);
      } else {
        const content = aiData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          dilemmeData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse AI response");
        }
      }
    } catch (aiErr) {
      console.warn("AI generation failed, using fallback:", aiErr);
      // Deterministic fallback based on day of year
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      dilemmeData = FALLBACK_DILEMMES[dayOfYear % FALLBACK_DILEMMES.length];
    }

    const { data: newDilemme, error: insertError } = await supabase
      .from("daily_dilemmes")
      .insert({
        question: dilemmeData.question,
        option_a: dilemmeData.option_a,
        option_b: dilemmeData.option_b,
        topic: dilemmeData.topic,
        active_date: today,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save dilemme");
    }

    return new Response(JSON.stringify({ dilemme: newDilemme, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
