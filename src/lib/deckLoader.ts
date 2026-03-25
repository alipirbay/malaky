/**
 * Deck loading logic — LOCAL-FIRST architecture.
 * 
 * Strategy:
 * 1. Build deck INSTANTLY from local cards (< 100ms)
 * 2. Enrich in background for FUTURE sessions (non-blocking)
 */
import type { GameCard, GameMode, Vibe } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";
import { deduplicateShuffle } from "@/lib/shuffleUtils";

interface Player {
  name: string;
}

interface LoadDeckParams {
  mode: GameMode;
  vibe: Vibe;
  players: Player[];
}

/**
 * Load deck INSTANTLY from local cards + downloaded packs.
 * No network call — always synchronous after dynamic import.
 */
export async function loadDeckInstant(params: LoadDeckParams): Promise<GameCard[]> {
  const { getFilteredCards } = await import("@/data/cards");
  const { getDownloadedPackCards } = await import("@/lib/packManager");

  // Local cards from code (always available)
  const localCards = getFilteredCards(params.mode, params.vibe, params.players.length);

  // Cards from downloaded packs (purchased, stored locally)
  const packCards = getDownloadedPackCards(params.vibe)
    .filter(c => c.mode === params.mode);

  // Combine and deduplicate
  return deduplicateShuffle([...localCards, ...packCards]);
}

/**
 * Enrich card catalogue in background for FUTURE sessions.
 * Calls Supabase to fetch new DB cards. NEVER blocking.
 */
export function enrichDeckInBackground(params: LoadDeckParams): void {
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
          skip_ai: true, // Never trigger AI in background sync
        },
      });

      if (data?.cards?.length) {
        cacheCardsLocally(params.mode, params.vibe, data.cards);
        markCardsSeen(
          data.cards
            .map((c: { id?: string }) => c.id)
            .filter((id: string | undefined): id is string => Boolean(id))
        );
      }
    } catch (e) {
      // Silent — not critical, we have local cards
      console.debug("[enrichDeck] Background sync skipped:", e);
    }
  })();
}

/**
 * Cache server cards in localStorage for future sessions.
 */
const CACHE_KEY_PREFIX = "malaky-cards-cache-";
const MAX_CACHED_PER_COMBO = 200;

function cacheCardsLocally(mode: GameMode, vibe: Vibe, cards: any[]): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${mode}-${vibe}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const merged = [...existing, ...cards];
    // Deduplicate by template
    const unique = merged.filter((c: any, i: number, arr: any[]) =>
      arr.findIndex((x: any) => x.template === c.template) === i
    );
    localStorage.setItem(key, JSON.stringify(unique.slice(-MAX_CACHED_PER_COMBO)));
  } catch (e) {
    console.debug("[cacheCards] Storage full or error:", e);
  }
}

/**
 * Get cached server cards from previous sessions.
 */
export function getCachedServerCards(mode: GameMode, vibe: Vibe): GameCard[] {
  try {
    const key = `${CACHE_KEY_PREFIX}${mode}-${vibe}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const cards = JSON.parse(raw);
    return cards.map((c: any, i: number) => ({
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
  } catch {
    return [];
  }
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
