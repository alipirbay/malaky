import { getFilteredCards, deduplicateShuffle } from "@/data/cards";
import type { GameCard, Vibe } from "@/data/types";

const STORAGE_KEY = "malaky-daily-challenge";

interface DailyChallengeData {
  date: string;
  card: GameCard;
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDailyChallenge(): GameCard {
  const today = getTodayKey();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: DailyChallengeData = JSON.parse(stored);
      if (data.date === today) return data.card;
    }
  } catch {}

  const freeModes = ["truth_dare", "never_have_i_ever", "most_likely", "would_you_rather"] as const;
  const freeVibes: Vibe[] = ["soft", "fun"];
  const allFreeCards: GameCard[] = [];
  for (const mode of freeModes) {
    for (const vibe of freeVibes) {
      allFreeCards.push(...getFilteredCards(mode, vibe, 4));
    }
  }

  const shuffled = deduplicateShuffle(allFreeCards);
  const dateNum = parseInt(today.replace(/-/g, ""), 10);
  const card = shuffled[dateNum % shuffled.length];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, card }));
  } catch {}

  return card;
}
