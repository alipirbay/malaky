/**
 * Deck loading logic — LOCAL-FIRST architecture.
 */
import type { GameCard, GameMode, Vibe, Player, StoredCard } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";
import { deduplicateShuffle } from "@/lib/shuffleUtils";
import { storageGet, storageSet } from "@/lib/storage";

interface LoadDeckParams {
  mode: GameMode;
  vibe: Vibe;
  players: Player[];
}

/**
 * Load deck INSTANTLY from local cards + downloaded packs.
 */
export async function loadDeckInstant(params: LoadDeckParams): Promise<GameCard[]> {
  const { getFilteredCards } = await import("@/data/cards");
  const { getDownloadedPackCards } = await import("@/lib/packManager");

  const localCards = getFilteredCards(params.mode, params.vibe, params.players.length);
  const packCards = getDownloadedPackCards(params.vibe)
    .filter(c => c.mode === params.mode);

  return deduplicateShuffle([...localCards, ...packCards]);
}

/**
 * Enrich card catalogue in background for FUTURE sessions.
 */
export function enrichDeckInBackground(params: LoadDeckParams): void {
  // Skip if offline
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  (async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { getSeenCardIds, markCardsSeen } = await import("@/hooks/useSeenCards");
      const seenIds = getSeenCardIds();

      const { data } = await supabase.functions.invoke("get-cards", {
        body: {
          mode: params.mode,
          vibe: params.vibe,
          players: params.players.map(p => p.name),
          seen_ids: seenIds,
          count: 50,
          skip_ai: true,
        },
      });

      if (data?.cards?.length) {
        cacheCardsLocally(params.mode, params.vibe, data.cards as StoredCard[]);
        markCardsSeen(
          (data.cards as StoredCard[])
            .map(c => c.id)
            .filter((id): id is string => Boolean(id))
        );
      }
    } catch (e) {
      console.debug("[enrichDeck] Background sync skipped:", e);
    }
  })();
}

/**
 * Cache server cards in localStorage for future sessions.
 */
const CACHE_KEY_PREFIX = "cards-cache-";
const MAX_CACHED_PER_COMBO = 200;

function cacheCardsLocally(mode: GameMode, vibe: Vibe, cards: StoredCard[]): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${mode}-${vibe}`;
    const existing = storageGet<StoredCard[]>(key, []);
    const merged = [...existing, ...cards];
    const unique = merged.filter((c, i, arr) =>
      arr.findIndex(x => x.template === c.template) === i
    );
    storageSet(key, unique.slice(-MAX_CACHED_PER_COMBO));
  } catch (e) {
    console.debug("[cacheCards] Storage full or error:", e);
  }
}

/**
 * Get cached server cards from previous sessions.
 */
export function getCachedServerCards(mode: GameMode, vibe: Vibe): GameCard[] {
  const key = `${CACHE_KEY_PREFIX}${mode}-${vibe}`;
  const cards = storageGet<StoredCard[]>(key, []);
  return cards.map((c, i) => ({
    id: c.id ?? `cached-${mode}-${vibe}-${i}`,
    mode,
    vibe,
    lang: (c.lang ?? "fr") as "fr" | "mg",
    card_type: c.card_type as GameCard["card_type"],
    text: c.template,
    answer: c.answer ?? undefined,
    requires_prop: "none" as const,
    player_min: 2,
    player_max: GAME_LIMITS.MAX_PLAYERS,
  }));
}

/**
 * Initialize per-player passes and stats.
 */
export function initPlayerData(players: Player[]) {
  const passes: Record<string, number> = {};
  const playerStats: Record<string, { played: number; refused: number }> = {};
  for (const player of players) {
    passes[player.name] = GAME_LIMITS.MAX_PASSES_PER_PLAYER;
    playerStats[player.name] = { played: 0, refused: 0 };
  }
  return { passes, playerStats };
}
