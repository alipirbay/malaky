/**
 * Shared types and utilities for the Tilt Up (Heads Up) mode.
 */

export interface AiDeck {
  theme: string;
  wordCount: number;
  createdAt: number;
  words: string[];
}

export const AI_CACHE_KEY = "tiltup-ai-decks";
export const MAX_CACHED_DECKS = 5;
