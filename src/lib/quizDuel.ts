/**
 * Quiz Duel utilities: deterministic QCM generation, seeded shuffle, scoring.
 */
import type { Difficulty } from "@/data/types";
import { cultureQuestions } from "@/data/culture_questions";

export interface DuelQuestion {
  question: string;
  correctAnswer: string;
  options: string[]; // 4 options, shuffled deterministically
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Generate a set of duel questions deterministically from a seed.
 * Uses inline distractors from each QuizEntry (field `d`).
 */
export function generateDuelQuestions(
  difficulty: Difficulty,
  seed: string,
  count: number = 10
): DuelQuestion[] {
  const allEntries = cultureQuestions[difficulty] || cultureQuestions.facile;
  const rng = mulberry32(hashSeed(seed));
  const shuffledEntries = seededShuffle(allEntries, rng);
  const selected = shuffledEntries.slice(0, Math.min(count, shuffledEntries.length));

  return selected.map((entry) => {
    const options = seededShuffle([entry.a, ...entry.d.slice(0, 3)], rng);
    return {
      question: entry.q,
      correctAnswer: entry.a,
      options,
    };
  });
}

/**
 * Generate a short, readable invite code.
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Get or create a persistent device ID.
 */
export function getDeviceId(): string {
  const { storageGet, storageSet } = await_storage();
  const id = storageGet<string>("device-id", "");
  if (id) return id;
  const newId = crypto.randomUUID();
  storageSet("device-id", newId);
  return newId;
}

// Lazy import to avoid circular deps
function await_storage() {
  // Use direct localStorage with malaky- prefix (same as storage.ts)
  return {
    storageGet<T>(key: string, fallback: T): T {
      try {
        const raw = localStorage.getItem(`malaky-${key}`);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      } catch { return fallback; }
    },
    storageSet(key: string, value: unknown): void {
      try { localStorage.setItem(`malaky-${key}`, JSON.stringify(value)); }
      catch { /* ignore */ }
    },
  };
}

/**
 * Scoring: compare two attempts.
 */
export interface DuelAttempt {
  score: number;
  timeMs: number;
  playerName: string;
}

export type DuelResult = "win" | "lose" | "draw";

export function computeDuelResult(
  myAttempt: DuelAttempt,
  opponentAttempt: DuelAttempt
): DuelResult {
  if (myAttempt.score > opponentAttempt.score) return "win";
  if (myAttempt.score < opponentAttempt.score) return "lose";
  if (myAttempt.timeMs < opponentAttempt.timeMs) return "win";
  if (myAttempt.timeMs > opponentAttempt.timeMs) return "lose";
  return "draw";
}

export function formatTimeMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
