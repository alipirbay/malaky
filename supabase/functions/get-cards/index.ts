import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

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
- Pour "confessions/couple" : émotions, relations, introspection

FORMAT ATTENDU selon card_type :
- truth: "{player}, avoue/raconte/dis..."
- dare: "{player}, fais/chante/imite..."
- vote: "Je n'ai jamais..." ou "Entre {player} et {player2}, qui est le plus susceptible de..."
- truth (would_you_rather): "{player}, tu préfères [option a] ou [option b] ?"
- timer: "{player}, [défi] pendant X secondes."`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const { mode, vibe, players, seen_ids = [], count = 50, skip_ai = false } = await req.json();

    if (!mode || !vibe) {
      return new Response(JSON.stringify({ error: "mode and vibe required" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch cards from DB that the user hasn't seen
    let query = supabase
      .from("cards")
      .select("id, mode, vibe, card_type, template, answer, lang")
      .eq("mode", mode)
      .eq("vibe", vibe)
      .eq("active", true)
      .order("play_count", { ascending: true });

    if (seen_ids.length > 0) {
      query = query.not("id", "in", `(${seen_ids.slice(0, 500).join(",")})`);
    }

    const { data: dbCards, error: dbError } = await query.limit(count * 2);

    if (dbError) throw dbError;

    const cardsFromDb = dbCards ?? [];
    const needed = count - cardsFromDb.length;

    // 2. If not enough unseen cards AND AI is allowed → generate with AI
    let aiCards: any[] = [];
    if (needed > 0 && !skip_ai) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      if (LOVABLE_API_KEY) {
        try {
          const generateCount = Math.max(20, needed);
          const playerNames = (players ?? ["Joueur"]).join(", ");

          const typeMap: Record<string, string> = {
            truth_dare: "truth (50%) et dare (50%)",
            never_have_i_ever: "vote (Je n'ai jamais...)",
            most_likely: "vote (Entre {player} et {player2}...)",
            would_you_rather: "truth (tu préfères... ou... ?)",
            quick_challenge: "timer (défi avec durée)",
            culture_generale: "quiz (question avec réponse)",
          };
          const types = typeMap[mode] ?? "truth et dare";

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
                  content: `Génère exactement ${generateCount} cartes nouvelles pour :
- Mode : ${mode}
- Ambiance : ${vibe}
- Types à générer : ${types}
- Joueurs dans la partie : ${playerNames}

Renvoie UNIQUEMENT un tableau JSON du type :
[{"card_type":"truth","template":"{player}, avoue..."},...]

${mode === "culture_generale" ? 'Pour les quiz, inclure "answer":"La réponse" dans chaque objet.' : ""}
Varie les formulations, sois créatif, ancre dans la culture malgache pour le mode "mada".`,
                },
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content ?? "";
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const generated = JSON.parse(jsonMatch[0]);
              aiCards = generated.map((c: any) => ({
                ...c,
                mode,
                vibe,
                lang: "fr",
                source: "ai",
              }));

              // Save AI cards to DB for future use (fire and forget)
              if (aiCards.length > 0) {
                supabase.from("cards").insert(
                  aiCards.map((c: any) => ({
                    mode: c.mode,
                    vibe: c.vibe,
                    card_type: c.card_type,
                    template: c.template,
                    answer: c.answer ?? null,
                    lang: c.lang,
                    source: "ai",
                    quality_score: 0.8,
                  }))
                ).then(({ error }) => {
                  if (error) console.error("Failed to save AI cards:", error);
                });
              }
            }
          } else {
            const errText = await aiResponse.text();
            console.error("AI gateway error:", aiResponse.status, errText);
          }
        } catch (aiErr) {
          console.error("AI generation failed, using DB only:", aiErr);
        }
      }
    }

    // 3. Merge DB + AI cards, shuffle, return
    const allCards = [...cardsFromDb, ...aiCards];

    // Fisher-Yates shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    // Fill with DB cards if still not enough (reuse old seen cards)
    if (allCards.length < count) {
      const { data: fallback } = await supabase
        .from("cards")
        .select("id, mode, vibe, card_type, template, answer, lang")
        .eq("mode", mode)
        .eq("vibe", vibe)
        .eq("active", true)
        .limit(count - allCards.length);
      allCards.push(...(fallback ?? []));
    }

    // Update play_count for served cards (fire and forget)
    const servedIds = allCards.slice(0, count).map((c: any) => c.id).filter(Boolean);
    if (servedIds.length > 0) {
      supabase.rpc("increment_play_count", { card_ids: servedIds }).then(() => {});
    }

    return new Response(
      JSON.stringify({ cards: allCards.slice(0, count), source_db: cardsFromDb.length, source_ai: aiCards.length }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("get-cards error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
