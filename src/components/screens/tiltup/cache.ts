import { storageGet, storageSet } from "@/lib/storage";
import type { AiDeck } from "./types";
import { AI_CACHE_KEY, MAX_CACHED_DECKS } from "./types";

export function getCachedDecks(): AiDeck[] {
  return storageGet<AiDeck[]>(AI_CACHE_KEY, []);
}

export function cacheDeck(deck: AiDeck) {
  const existing = getCachedDecks();
  const updated = [deck, ...existing.filter(d => d.theme !== deck.theme)].slice(0, MAX_CACHED_DECKS);
  storageSet(AI_CACHE_KEY, updated);
}
