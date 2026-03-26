import type { GameCard } from "@/data/types";
import { getCardContentHash } from "@/lib/cardUtils";

/**
 * Pure Fisher-Yates shuffle — returns a new array.
 */
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Fisher-Yates shuffle + deduplicate by content hash + space similar cards apart.
 */
export function deduplicateShuffle(cards: GameCard[]): GameCard[] {
  // 1. Deduplicate by content hash (catches semantic duplicates)
  const seen = new Set<string>();
  const unique = cards.filter((c) => {
    const hash = getCardContentHash(c.text);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });

  // 2. Fisher-Yates shuffle
  const shuffled = fisherYatesShuffle(unique);

  // 3. Space cards with similar content apart
  const MIN_GAP = 5;
  const result: GameCard[] = [];
  const recentSet = new Set<string>();
  const recentQueue: string[] = [];
  const remaining = [...shuffled];
  let stuckCount = 0;

  while (remaining.length > 0 && stuckCount < remaining.length * 2) {
    const idx = remaining.findIndex((c) => {
      const hash = getCardContentHash(c.text);
      return !recentSet.has(hash);
    });

    if (idx === -1) {
      result.push(remaining.shift()!);
      stuckCount++;
    } else {
      const card = remaining.splice(idx, 1)[0];
      result.push(card);
      const hash = getCardContentHash(card.text);
      recentSet.add(hash);
      recentQueue.push(hash);
      if (recentQueue.length > MIN_GAP) {
        const oldest = recentQueue.shift()!;
        recentSet.delete(oldest);
      }
      stuckCount = 0;
    }
  }

  result.push(...remaining);
  return result;
}
