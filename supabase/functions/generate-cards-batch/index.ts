/**
 * generate-cards-batch: Cron job to pre-fill the cards table.
 * Called by Supabase cron, NOT by the client.
 * Generates AI cards for mode/vibe combos that are below TARGET_PER_COMBO.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GeneratedCard {
  card_type: string;
  template: string;
  answer?: string;
}

interface CardInsertRow {
  mode: string;
  vibe: string;
  card_type: string;
  template: string;
  answer: string | null;
  lang: string;
  source: string;
  quality_score: number;
}

interface BatchResult {
  mode: string;
  vibe: string;
  generated: number;
}

const ALLOWED_ORIGINS = [
  "https://id-preview--34120b7e-54be-4ea1-86b8-6edf122c8b82.lovable.app",
  "https://malaky.app",
  "https://www.malaky.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const MODES = ["truth_dare", "never_have_i_ever", "most_likely", "would_you_rather", "quick_challenge"];
const VIBES = ["soft", "fun", "hot", "chaos", "couple", "apero", "mada", "confessions", "vip", "afterdark"];
const TARGET_PER_COMBO = 200;

const SYSTEM_PROMPT = `Tu es un générateur de cartes pour Malaky, le jeu de soirée des Malgaches.
Tu génères des cartes fun, authentiques, ancrées dans la culture malgache et la vie quotidienne.
Tu renvoies UNIQUEMENT un tableau JSON valide, sans markdown, sans commentaires.

RÈGLES :
- Utilise {player} pour le joueur actif, {player2} pour un second joueur
- Cartes courtes : 10 à 20 mots maximum
- Ton décalé, un peu provocateur mais jamais blessant
- Références malgaches bienvenues : taxi-be, Jirama, mora mora, fady, riz, Tana, etc.
- Pour le mode "soft" : contenu famille tout public, jamais d'alcool ni de sexe
- Pour "fun/chaos/apero" : humour potache, situations gênantes, alcool léger OK
- Pour "hot/afterdark" : contenu adulte assumé, explicite OK
- Pour "mada" : culture malgache authentique dans chaque carte
- Pour "confessions/couple" : émotions, relations, introspection`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: BatchResult[] = [];

    for (const mode of MODES) {
      for (const vibe of VIBES) {
        const { count } = await supabase
          .from("cards")
          .select("id", { count: "exact", head: true })
          .eq("mode", mode)
          .eq("vibe", vibe)
          .eq("active", true);

        if ((count ?? 0) >= TARGET_PER_COMBO) continue;

        const needed = Math.min(30, TARGET_PER_COMBO - (count ?? 0));

        const typeMap: Record<string, string> = {
          truth_dare: "truth (50%) et dare (50%)",
          never_have_i_ever: "vote (Je n'ai jamais...)",
          most_likely: "vote (Entre {player} et {player2}...)",
          would_you_rather: "truth (tu préfères... ou... ?)",
          quick_challenge: "timer (défi avec durée)",
        };
        const types = typeMap[mode] ?? "truth et dare";

        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              max_tokens: 3000,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `Génère exactement ${needed} cartes pour mode=${mode}, ambiance=${vibe}. Types: ${types}.
Renvoie UNIQUEMENT un tableau JSON: [{"card_type":"...","template":"..."}]`,
                },
              ],
            }),
          });

          if (!aiResponse.ok) {
            console.error(`AI error for ${mode}/${vibe}:`, aiResponse.status);
            continue;
          }

          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content ?? "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (!jsonMatch) continue;

          const generated: unknown = JSON.parse(jsonMatch[0]);
          if (!Array.isArray(generated)) continue;

          const toInsert: CardInsertRow[] = generated
            .filter((c): c is GeneratedCard =>
              typeof c === "object" && c !== null &&
              typeof (c as Record<string, unknown>).card_type === "string" &&
              typeof (c as Record<string, unknown>).template === "string"
            )
            .map((c) => ({
              mode,
              vibe,
              card_type: c.card_type,
              template: c.template,
              answer: c.answer ?? null,
              lang: "fr",
              source: "ai",
              quality_score: 0.8,
            }));

          const { error } = await supabase.from("cards").insert(toInsert);
          if (error) console.error(`Insert error ${mode}/${vibe}:`, error);
          else results.push({ mode, vibe, generated: toInsert.length });

          // Rate limit: wait 1s between AI calls
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.error(`Failed ${mode}/${vibe}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-cards-batch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
