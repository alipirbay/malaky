import { storageGet, storageSet, storageRemove } from "@/lib/storage";
import { getCardContentHash } from "@/lib/cardUtils";

const STORAGE_KEY = "seen-cards";
const MAX_SEEN = 3000;

export function getSeenCardHashes(): Set<string> {
  const arr = storageGet<string[]>(STORAGE_KEY, []);
  return new Set(arr);
}

export function markCardsSeen(cardTexts: string[]): void {
  try {
    const existing = storageGet<string[]>(STORAGE_KEY, []);
    const newHashes = cardTexts.map(t => getCardContentHash(t));
    const updated = [...new Set([...existing, ...newHashes])].slice(-MAX_SEEN);
    storageSet(STORAGE_KEY, updated);
  } catch (e) {
    console.warn("Failed to save seen cards:", e);
  }
}

export function clearSeenCards(): void {
  storageRemove(STORAGE_KEY);
}

// Backward compat
export function getSeenCardIds(): string[] {
  return storageGet<string[]>(STORAGE_KEY, []);
}
