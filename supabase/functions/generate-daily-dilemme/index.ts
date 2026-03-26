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

// Fallback pool — questions d'opinion croustillantes sur Madagascar
const FALLBACK_DILEMMES = [
  { question: "Êtes-vous satisfait de la gouvernance actuelle de Madagascar ?", option_a: "Oui, ça avance", option_b: "Non, c'est pire", topic: "politique" },
  { question: "Pour ou contre le changement de l'Ariary en nouvelle monnaie ?", option_a: "Pour, il faut changer", option_b: "Contre, inutile", topic: "économie" },
  { question: "Voyez-vous un avenir positif pour Madagascar ?", option_a: "Oui, optimiste", option_b: "Non, mal parti", topic: "société" },
  { question: "Les jeunes ont-ils raison de vouloir quitter Madagascar ?", option_a: "Oui, zéro opportunité", option_b: "Non, il faut rester", topic: "société" },
  { question: "Faut-il nationaliser les mines de Madagascar ?", option_a: "Oui, nos richesses", option_b: "Non, besoin d'investisseurs", topic: "économie" },
  { question: "Le Fihavanana est-il encore une réalité ?", option_a: "Oui, notre force", option_b: "Non, chacun pour soi", topic: "société" },
  { question: "L'Ariary va-t-il continuer à perdre de la valeur ?", option_a: "Oui, inévitable", option_b: "Non, ça va se stabiliser", topic: "économie" },
  { question: "Le système éducatif prépare-t-il bien les jeunes ?", option_a: "Oui, correct", option_b: "Non, obsolète", topic: "société" },
  { question: "Internet à Madagascar est-il trop cher ?", option_a: "Oui, beaucoup trop", option_b: "Non, raisonnable", topic: "technologie" },
  { question: "Les Barea peuvent-ils se qualifier pour la prochaine CAN ?", option_a: "Oui, on y croit !", option_b: "Non, soyons réalistes", topic: "sport" },
  { question: "Le prix du riz devrait-il être fixé par l'État ?", option_a: "Oui, c'est vital", option_b: "Non, marché libre", topic: "économie" },
  { question: "La déforestation peut-elle être stoppée ?", option_a: "Oui, si on agit", option_b: "Non, c'est trop tard", topic: "environnement" },
  { question: "Les coupures de Jirama sont-elles acceptables en 2026 ?", option_a: "Non, inacceptable", option_b: "Normal, on s'y fait", topic: "société" },
  { question: "Madagascar devrait-elle se rapprocher de la Chine ou de la France ?", option_a: "La Chine", option_b: "La France", topic: "politique" },
  { question: "Faut-il limiter le mandat présidentiel à un seul mandat ?", option_a: "Oui, un seul", option_b: "Non, garder 2", topic: "politique" },
  { question: "Les zones franches profitent-elles aux Malgaches ?", option_a: "Oui, emplois", option_b: "Non, exploitation", topic: "économie" },
  { question: "TikTok influence-t-il trop la jeunesse malgache ?", option_a: "Oui, c'est toxique", option_b: "Non, c'est fun", topic: "société" },
  { question: "Le Sénat malgache est-il utile ?", option_a: "Oui, nécessaire", option_b: "Non, à supprimer", topic: "politique" },
  { question: "Faut-il augmenter le SMIG à 300 000 Ar ?", option_a: "Oui, trop bas", option_b: "Non, entreprises ferment", topic: "économie" },
  { question: "Tana est-elle une ville vivable ?", option_a: "Oui, malgré tout", option_b: "Non, invivable", topic: "société" },
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

    // Check if already exists
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
              content: `Tu es un générateur de sondages/questions d'opinion quotidiennes pour Malaky, le jeu des Malgaches.

OBJECTIF : Générer UNE question d'OPINION sur l'actualité malgache qui divise vraiment les gens.

SUJETS (alterne chaque jour, priorise politique et économie) :
- POLITIQUE : gouvernance, élections, institutions, relations diplomatiques, décentralisation
- ÉCONOMIE : Ariary, inflation, mines, emploi, SMIG, prix du riz, zones franches, vanille
- SOCIÉTÉ : éducation, insécurité, exode des jeunes, réseaux sociaux, Fihavanana, Jirama
- SPORT : Barea, football malgache, investissement sportif
- TECH : Internet, opérateurs, IA, startups malgaches
- ENVIRONNEMENT : déforestation, charbon de bois, tourisme

STYLE :
- Question directe type sondage : "Pour ou contre...", "Êtes-vous satisfait de...", "Faut-il..."
- Options COURTES (3-6 mots max), claires et opposées
- Ton accessible, pas académique
- Les questions politiques et économiques sont ENCOURAGÉES
- Doit créer un vrai débat (50/50 idéalement)

INTERDIT :
- Questions hypothétiques fantaisistes
- Insultes ou propos haineux
- Fausses informations

Réponds UNIQUEMENT avec un JSON valide sans markdown.`,
            },
            {
              role: "user",
              content: `Génère LA question d'opinion du jour (${today}) sur Madagascar. Format JSON :
{"question": "La question", "option_a": "Choix A court", "option_b": "Choix B court", "topic": "catégorie"}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_dilemme",
                description: "Create a daily opinion poll for Madagascar",
                parameters: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "The opinion question" },
                    option_a: { type: "string", description: "First choice (3-6 words)" },
                    option_b: { type: "string", description: "Second choice (3-6 words)" },
                    topic: {
                      type: "string",
                      enum: ["politique", "économie", "société", "culture", "sport", "technologie", "environnement"],
                    },
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
          return new Response(JSON.stringify({ error: "Rate limited" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted" }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      dilemmeData = FALLBACK_DILEMMES[dayOfYear % FALLBACK_DILEMMES.length];
    }

    const { data: newDilemme, error: insertError } = await supabase
      .from("daily_dilemmes")
      .upsert({
        question: dilemmeData.question,
        option_a: dilemmeData.option_a,
        option_b: dilemmeData.option_b,
        topic: dilemmeData.topic,
        active_date: today,
      }, { onConflict: "active_date" })
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
