/**
 * Hash ↔ screen mapping utility.
 */

const HASH_NAVIGABLE = new Set(["home", "players", "mode", "vibe", "packs", "settings", "history", "duel_hub", "guess_rush"]);

export function hashToScreen(hash: string): string | null {
  const screen = hash.replace("#", "");
  return HASH_NAVIGABLE.has(screen) ? screen : null;
}

export function isHashNavigable(screen: string): boolean {
  return HASH_NAVIGABLE.has(screen);
}
