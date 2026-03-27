import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme } = await req.json();

    if (!theme || typeof theme !== "string") {
      return new Response(
        JSON.stringify({ error: "Le champ 'theme' est requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmed = theme.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      return new Response(
        JSON.stringify({ error: "Le thème doit faire entre 2 et 100 caractères." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un générateur de mots/termes pour un jeu de devinette style "Heads Up" / "Time's Up".

RÈGLES STRICTES :
- Génère exactement 30 mots/termes/noms liés au thème demandé
- Chaque entrée doit être COURTE (1 à 5 mots max)
- Chaque entrée doit être DEVINABLE par des indices verbaux ou mimes
- PAS de doublons ni quasi-doublons
- PAS de termes obscènes, offensants, ou inappropriés
- PAS de phrases longues — juste des mots ou noms courts
- Les entrées doivent être variées et intéressantes
- Si le thème est vague, interprète-le au mieux
- Langue : français sauf si le thème implique une autre langue

IMPORTANT : Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication.
Format : { "words": ["mot1", "mot2", ...] }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Thème : "${trimmed}"` },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessaie dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed: { words?: string[] };
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return new Response(
        JSON.stringify({ error: "Réponse IA invalide. Réessaie." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!parsed.words || !Array.isArray(parsed.words)) {
      return new Response(
        JSON.stringify({ error: "Format de réponse invalide." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean and deduplicate
    const seen = new Set<string>();
    const cleanWords: string[] = [];

    for (const raw of parsed.words) {
      if (typeof raw !== "string") continue;
      const word = raw.trim();
      if (word.length < 1 || word.length > 60) continue;
      const key = word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleanWords.push(word);
    }

    if (cleanWords.length < 10) {
      return new Response(
        JSON.stringify({ error: "Pas assez de mots générés. Essaie un thème plus précis." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        theme: trimmed,
        words: cleanWords,
        count: cleanWords.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-guess-rush-theme error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
