import { storageGet, storageSet, storageRemove } from "@/lib/storage";

const STORAGE_KEY = "seen-cards";
const MAX_SEEN = 2000;

export function getSeenCardIds(): string[] {
  return storageGet<string[]>(STORAGE_KEY, []);
}

export function markCardsSeen(ids: string[]): void {
  try {
    const existing = getSeenCardIds();
    const updated = [...new Set([...existing, ...ids])].slice(-MAX_SEEN);
    storageSet(STORAGE_KEY, updated);
  } catch (e) {
    console.warn("Failed to save seen cards:", e);
  }
}

export function clearSeenCards(): void {
  storageRemove(STORAGE_KEY);
}
