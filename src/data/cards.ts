export type { GameCard, GameMode, Vibe, Difficulty } from "./types";
export { GAME_MODES, VIBES, DIFFICULTIES, STORE_PACKS } from "./config";

import type { GameCard, GameMode, Vibe, Difficulty } from "./types";
import { GAME_MODES, VIBES, DIFFICULTIES } from "./config";
import {
  truthPrompts, dareActions, neverBase, likelyBase,
  ratherA, ratherB, challengeActions, madaCardsMg,
  tsimoaTruths, tsimoaDares, tsimoaNever, tsimoaLikely,
  tsimoaRatherA, tsimoaRatherB,
} from "./card_content";
import { cultureQuestions } from "./culture_questions";

const MINIMUM_CARDS_PER_COMBO = 150;
const MAX_PLAYERS = 12;

type CardType = GameCard["card_type"];

const createCard = (
  mode: GameMode, vibe: Vibe, index: number, cardType: CardType,
  text: string, requiresProp: GameCard["requires_prop"] = "none",
  answer?: string
): GameCard => ({
  id: `${mode}-${vibe}-${index}`,
  mode, vibe, lang: "fr", card_type: cardType, text,
  answer,
  requires_prop: requiresProp, player_min: 2, player_max: MAX_PLAYERS,
});

const hasExplicitDuration = (text: string) => /(\d+)\s*(?:s|sec|secondes?|minute|minutes)/i.test(text) || /une?\s+minute/i.test(text);

// === Deduplicate & Shuffle — O(n) lookups ===

export function deduplicateShuffle(cards: GameCard[]): GameCard[] {
  const seen = new Set<string>();
  const unique = cards.filter(c => {
    const key = c.text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fisher-Yates shuffle
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  // Space cards with similar bases apart using Set for O(1) lookups
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

// === DECK BUILDERS ===

const buildTruthDareDeck = (vibe: Vibe): GameCard[] => {
  const prompts = truthPrompts[vibe] || [];
  const dares = dareActions[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  for (const p of prompts) {
    cards.push(createCard("truth_dare", vibe, idx++, "truth", `{player}, ${p}`));
  }

  for (let i = 0; i < dares.length; i++) {
    cards.push(createCard("truth_dare", vibe, idx++, "dare", `{player}, ${dares[i]}`, i % 5 === 0 ? "phone" : "none"));
  }

  // For mada vibe, add bilingual cards (30% of deck)
  if (vibe === "mada") {
    for (const mgCard of madaCardsMg) {
      cards.push(createCard("truth_dare", vibe, idx++, "truth", `{player}, ${mgCard}`));
    }
  }

  const allBase = [...prompts, ...dares];
  let fillIdx = 0;
  while (cards.length < MINIMUM_CARDS_PER_COMBO) {
    const base = allBase[fillIdx % allBase.length];
    const isAction = fillIdx % allBase.length >= prompts.length;
    if (isAction) {
      cards.push(createCard("truth_dare", vibe, idx++, "dare", `{player2}, ${base}`));
    } else {
      cards.push(createCard("truth_dare", vibe, idx++, "truth", `{player2}, ${base}`));
    }
    fillIdx++;
  }

  return cards;
};

const buildNeverDeck = (vibe: Vibe): GameCard[] => {
  const base = neverBase[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  for (const entry of base) {
    cards.push(createCard("never_have_i_ever", vibe, idx++, "vote", `Je n'ai jamais ${entry}`));
  }

  let fillIdx = 0;
  while (cards.length < MINIMUM_CARDS_PER_COMBO) {
    const entry = base[fillIdx % base.length];
    cards.push(createCard("never_have_i_ever", vibe, idx++, "vote", `Je n'ai jamais ${entry}`));
    fillIdx++;
  }

  return cards;
};

const buildMostLikelyDeck = (vibe: Vibe): GameCard[] => {
  const base = likelyBase[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  for (const entry of base) {
    cards.push(createCard("most_likely", vibe, idx++, "vote", `Qui est le plus susceptible de ${entry}`));
  }

  let fillIdx = 0;
  while (cards.length < MINIMUM_CARDS_PER_COMBO) {
    const entry = base[fillIdx % base.length];
    cards.push(createCard("most_likely", vibe, idx++, "vote", `Entre {player} et {player2}, qui est le plus susceptible de ${entry}`));
    fillIdx++;
  }

  return cards;
};

const buildWouldYouRatherDeck = (vibe: Vibe): GameCard[] => {
  const aList = ratherA[vibe] || [];
  const bList = ratherB[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;
  const len = Math.min(aList.length, bList.length);

  for (let i = 0; i < len; i++) {
    cards.push(createCard("would_you_rather", vibe, idx++, "truth", `{player}, tu préfères ${aList[i]} ou ${bList[i]} ?`));
  }

  for (let offset = 1; cards.length < MINIMUM_CARDS_PER_COMBO && offset < len; offset++) {
    for (let i = 0; i < len && cards.length < MINIMUM_CARDS_PER_COMBO; i++) {
      const j = (i + offset) % len;
      cards.push(createCard("would_you_rather", vibe, idx++, "truth", `{player}, tu préfères ${aList[i]} ou ${bList[j]} ?`));
    }
  }

  return cards;
};

const buildQuickChallengeDeck = (vibe: Vibe): GameCard[] => {
  const cards: GameCard[] = [];
  let idx = 1;

  const truths = (truthPrompts[vibe] || []).slice(0, 10);
  const dares = challengeActions[vibe] || [];
  const nevers = (neverBase[vibe] || []).slice(0, 10);
  const likelys = (likelyBase[vibe] || []).slice(0, 10);
  const rathersA = (ratherA[vibe] || []).slice(0, 10);
  const rathersB = (ratherB[vibe] || []).slice(0, 10);

  for (const t of truths) {
    cards.push(createCard("quick_challenge", vibe, idx++, "truth", `{player}, ${t}`));
  }

  for (const n of nevers) {
    cards.push(createCard("quick_challenge", vibe, idx++, "vote", `Je n'ai jamais ${n}`));
  }

  for (const l of likelys) {
    cards.push(createCard("quick_challenge", vibe, idx++, "vote", `Qui est le plus susceptible de ${l}`));
  }

  const rLen = Math.min(rathersA.length, rathersB.length);
  for (let i = 0; i < rLen; i++) {
    cards.push(createCard("quick_challenge", vibe, idx++, "truth", `Tu préfères ${rathersA[i]} ou ${rathersB[i]} ?`));
  }

  for (const action of dares) {
    const hasDuration = hasExplicitDuration(action);
    if (hasDuration) {
      cards.push(createCard("quick_challenge", vibe, idx++, "timer", `{player}, ${action}`));
    } else {
      const durations = [10, 15, 20];
      const dur = durations[idx % durations.length];
      cards.push(createCard("quick_challenge", vibe, idx++, "timer", `{player}, ${action.replace(/\.$/, "")} pendant ${dur} secondes.`));
    }
  }

  return cards;
};

const buildCultureDeck = (difficulty: Difficulty): GameCard[] => {
  const questions = cultureQuestions[difficulty] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  for (const { q, a } of questions) {
    cards.push(createCard("culture_generale", difficulty as Vibe, idx++, "quiz", q, "none", a));
  }

  return cards;
};

// === Tsimoa deck builder ===

const buildTsimoaDeck = (): GameCard[] => {
  const cards: GameCard[] = [];
  let idx = 1;
  const vibe: Vibe = "fun"; // Tsimoa uses fun vibe styling

  for (const t of tsimoaTruths) {
    cards.push(createCard("tsimoa", vibe, idx++, "truth", `{player}, ${t}`));
  }
  for (const d of tsimoaDares) {
    cards.push(createCard("tsimoa", vibe, idx++, "dare", `{player}, ${d}`));
  }
  for (const n of tsimoaNever) {
    cards.push(createCard("tsimoa", vibe, idx++, "vote", `Je n'ai jamais ${n}`));
  }
  for (const l of tsimoaLikely) {
    cards.push(createCard("tsimoa", vibe, idx++, "vote", `Qui est le plus susceptible de ${l}`));
  }
  const rLen = Math.min(tsimoaRatherA.length, tsimoaRatherB.length);
  for (let i = 0; i < rLen; i++) {
    cards.push(createCard("tsimoa", vibe, idx++, "truth", `{player}, tu préfères ${tsimoaRatherA[i]} ou ${tsimoaRatherB[i]} ?`));
  }

  // Fill to minimum
  const allBase = [...tsimoaTruths, ...tsimoaDares];
  let fillIdx = 0;
  while (cards.length < MINIMUM_CARDS_PER_COMBO) {
    const base = allBase[fillIdx % allBase.length];
    cards.push(createCard("tsimoa", vibe, idx++, fillIdx % 2 === 0 ? "truth" : "dare", `{player2}, ${base}`));
    fillIdx++;
  }

  return cards;
};

// === Lazy deck cache ===
const deckCache = new Map<string, GameCard[]>();

function getDeck(mode: GameMode, vibe: Vibe): GameCard[] {
  const key = `${mode}::${vibe}`;
  if (deckCache.has(key)) return deckCache.get(key)!;

  let cards: GameCard[] = [];

  if (mode === "culture_generale") {
    cards = buildCultureDeck(vibe as Difficulty);
  } else if (mode === "tsimoa") {
    cards = buildTsimoaDeck();
  } else {
    const builderMap: Record<string, (v: Vibe) => GameCard[]> = {
      truth_dare: buildTruthDareDeck,
      never_have_i_ever: buildNeverDeck,
      most_likely: buildMostLikelyDeck,
      would_you_rather: buildWouldYouRatherDeck,
      quick_challenge: buildQuickChallengeDeck,
    };
    const builder = builderMap[mode];
    if (builder) cards = builder(vibe);
  }

  deckCache.set(key, cards);
  return cards;
}

// Lazy CARDS getter for backward compat
export function getAllCards(): GameCard[] {
  const ALL_VIBES: Vibe[] = ["soft", "fun", "hot", "chaos", "couple", "apero", "mada", "confessions", "vip", "afterdark"];
  const ALL_DIFFICULTIES: Difficulty[] = ["facile", "intermediaire", "difficile", "expert"];
  const modes: GameMode[] = ["truth_dare", "never_have_i_ever", "most_likely", "would_you_rather", "quick_challenge"];

  const all: GameCard[] = [];
  for (const vibe of ALL_VIBES) {
    for (const mode of modes) {
      all.push(...getDeck(mode, vibe));
    }
  }
  for (const diff of ALL_DIFFICULTIES) {
    all.push(...getDeck("culture_generale", diff as Vibe));
  }
  return all;
}

// Keep CARDS export for compat — built lazily on first access
let _cardsBuilt = false;
let _cards: GameCard[] = [];
export const CARDS: GameCard[] = new Proxy([] as GameCard[], {
  get(target, prop, receiver) {
    if (!_cardsBuilt) {
      _cards = getAllCards();
      _cardsBuilt = true;
    }
    return Reflect.get(_cards, prop, receiver);
  },
});

export function validateCardCoverage() {
  const allCards = getAllCards();
  for (const mode of GAME_MODES) {
    if (mode.id === "culture_generale") {
      for (const diff of DIFFICULTIES) {
        const total = allCards.filter(c => c.mode === mode.id && c.vibe === diff.id).length;
        if (total < 10) {
          console.warn(`Low card count for ${mode.id}/${diff.id}: ${total}`);
        }
      }
    } else {
      for (const vibe of VIBES) {
        const total = allCards.filter(c => c.mode === mode.id && c.vibe === vibe.id).length;
        if (total < MINIMUM_CARDS_PER_COMBO) {
          console.warn(`Low card count for ${mode.id}/${vibe.id}: ${total}`);
        }
      }
    }
  }
}

export function getFilteredCards(mode: GameMode, vibe: Vibe, playerCount: number): GameCard[] {
  const deck = getDeck(mode, vibe);
  if (mode === "culture_generale") return deck;
  const filtered = deck.filter(c => c.player_min <= playerCount && c.player_max >= playerCount);
  if (filtered.length >= MINIMUM_CARDS_PER_COMBO) return filtered;
  return deck;
}

export function fillPlayerNames(text: string, currentPlayer: string, allPlayers: string[]): string {
  const otherPlayers = allPlayers.filter(p => p !== currentPlayer);
  const fallback = otherPlayers[0] || currentPlayer;
  let result = text.split("{player}").join(currentPlayer);
  result = result.split("{player2}").join(fallback);
  return result;
}
