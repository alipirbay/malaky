/**
 * Deck loading logic extracted from gameStore for testability and clarity.
 * Handles both server-side and local fallback card loading.
 */
import type { GameCard, GameMode, Vibe } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";

interface Player {
  name: string;
}

interface LoadDeckParams {
  mode: GameMode;
  vibe: Vibe;
  players: Player[];
}

/**
 * Load deck from the server (Supabase edge function).
 * Throws on failure so the caller can fall back to local.
 */
export async function loadDeckFromServer(params: LoadDeckParams): Promise<GameCard[]> {
  const { getSeenCardIds, markCardsSeen } = await import("@/hooks/useSeenCards");
  const seenIds = getSeenCardIds();

  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.functions.invoke("get-cards", {
    body: {
      mode: params.mode,
      vibe: params.vibe,
      players: params.players.map(p => p.name),
      seen_ids: seenIds,
      count: GAME_LIMITS.CARDS_PER_GAME,
    },
  });

  if (error || !data?.cards?.length) {
    throw new Error(error?.message ?? "No cards returned from server");
  }

  const cards: GameCard[] = data.cards.map(
    (c: { id?: string; lang?: string; card_type: string; template: string; answer?: string }, i: number) => ({
      id: c.id ?? `${params.mode}-${params.vibe}-${i}`,
      mode: params.mode,
      vibe: params.vibe,
      lang: (c.lang ?? "fr") as "fr" | "mg",
      card_type: c.card_type as GameCard["card_type"],
      text: c.template,
      answer: c.answer ?? undefined,
      requires_prop: "none" as const,
      player_min: 2,
      player_max: GAME_LIMITS.MAX_PLAYERS,
    })
  );

  markCardsSeen(
    data.cards
      .map((c: { id?: string }) => c.id)
      .filter((id: string | undefined): id is string => Boolean(id))
  );

  const { deduplicateShuffle } = await import("@/data/cards");
  return deduplicateShuffle(cards);
}

/**
 * Load deck from local card data (offline fallback).
 * Returns empty array if no cards are available.
 */
export async function loadDeckLocally(params: LoadDeckParams): Promise<GameCard[]> {
  const { getFilteredCards, deduplicateShuffle } = await import("@/data/cards");
  const localCards = deduplicateShuffle([
    ...getFilteredCards(params.mode, params.vibe, params.players.length),
  ]);
  return localCards;
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
