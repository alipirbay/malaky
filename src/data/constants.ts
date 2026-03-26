/**
 * Centralized game constants. Import from here instead of hardcoding.
 */
export const GAME_LIMITS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 12,
  CARDS_PER_GAME: 20,
  MAX_PASSES_PER_PLAYER: 2,
  MAX_SAVED_SESSIONS: 20,
  MAX_SEEN_CARDS: 2000,
  SWIPE_THRESHOLD_PX: 80,
  HEARTBEAT_INTERVAL_MS: 60_000,
} as const;
