import type { GameCard } from "@/data/types";

/**
 * Fisher-Yates shuffle + deduplicate by text + space similar cards apart.
 * This is a pure utility — no card data dependency.
 */
export function deduplicateShuffle(cards: GameCard[]): GameCard[] {
  // 1. Deduplicate
  const seen = new Set<string>();
  const unique = cards.filter(c => {
    const key = c.text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 2. Fisher-Yates shuffle
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  // 3. Space cards with similar bases apart
  const getBase = (text: string) => text
    .replace(/^(Je n'ai jamais )/i, "")
    .split('.')[0]
    .trim();

  const MIN_GAP = 8;
  const result: GameCard[] = [];
  const recentSet = new Set<string>();
  const recentQueue: string[] = [];
  const remaining = [...unique];
  let stuckCount = 0;

  while (remaining.length > 0 && stuckCount < remaining.length * 2) {
    const idx = remaining.findIndex(c => {
      const base = getBase(c.text);
      return !recentSet.has(base);
    });

    if (idx === -1) {
      result.push(remaining.shift()!);
      stuckCount++;
    } else {
      const card = remaining.splice(idx, 1)[0];
      result.push(card);
      const base = getBase(card.text);
      recentSet.add(base);
      recentQueue.push(base);
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
