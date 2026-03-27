/**
 * Hash ↔ screen mapping utility.
 * Extracted from Index.tsx to avoid fast-refresh warnings
 * (Index exports both a component and this function).
 */

/** Screens that can be navigated to via hash (excludes game/end which require state) */
const HASH_NAVIGABLE = new Set(["home", "players", "mode", "vibe", "packs", "settings", "history", "duel_hub", "heads_up"]);

/** Maps a hash string to a valid screen name, or null */
export function hashToScreen(hash: string): string | null {
  const screen = hash.replace("#", "");
  return HASH_NAVIGABLE.has(screen) ? screen : null;
}

/** Whether a screen should be reflected in the URL hash */
export function isHashNavigable(screen: string): boolean {
  return HASH_NAVIGABLE.has(screen);
}
