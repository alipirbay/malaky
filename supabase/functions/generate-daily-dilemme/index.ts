import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if today's dilemme already exists
    const today = new Date().toISOString().split("T")[0];
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

    // Generate dilemme via AI
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

EXEMPLES DE BONS DILEMMES MADA :
"Vivre toute ta vie à Tana ou en province ?" → "Tana pour toujours" / "Province et liberté"
"Taxi-be ou taxi particulier ?" → "Taxi-be, c'est la vie" / "Taxi toujours"
"Jirama ou groupe électrogène ?" → "On supporte Jirama" / "Groupe, point final"

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
    
    let dilemmeData;
    if (toolCall?.function?.arguments) {
      dilemmeData = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        dilemmeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    // Insert into DB
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
