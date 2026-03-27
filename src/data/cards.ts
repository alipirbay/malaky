import type { GameCard, GameMode, Vibe, Difficulty } from "./types";
import {
  truthPrompts, dareActions, neverBase, likelyBase,
  ratherA, ratherB, madaCardsMg,
} from "./card_content";
import { cultureQuestions } from "./culture_questions";

const MINIMUM_CARDS_PER_COMBO = 40;
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

/**
 * French elision: "de" + vowel → "d'", "que" + vowel → "qu'", etc.
 */
function elide(prefix: string, text: string): string {
  const firstChar = text.charAt(0).toLowerCase();
  const isVowel = "aeiouyàâéèêëîïôùûü".includes(firstChar);
  
  if (isVowel) {
    if (prefix.endsWith("de ")) return prefix.slice(0, -3) + "d'" + text;
    if (prefix.endsWith("que ")) return prefix.slice(0, -4) + "qu'" + text;
    if (prefix.endsWith("le ")) return prefix.slice(0, -3) + "l'" + text;
    if (prefix.endsWith("la ")) return prefix.slice(0, -3) + "l'" + text;
    if (prefix.endsWith("ne ")) return prefix.slice(0, -3) + "n'" + text;
    if (prefix.endsWith("se ")) return prefix.slice(0, -3) + "s'" + text;
  }
  return prefix + text;
}

/** Strip trailing '?' and whitespace from card entries. */
function clean(entry: string): string {
  return entry.replace(/\s*\?\s*$/, "").trim();
}

// Re-export from shuffleUtils to keep backward compat
export { deduplicateShuffle } from "@/lib/shuffleUtils";

// === DECK BUILDERS (no artificial padding) ===

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

  // For mada vibe, add bilingual cards
  if (vibe === "mada") {
    for (const mgCard of madaCardsMg) {
      cards.push(createCard("truth_dare", vibe, idx++, "truth", `{player}, ${mgCard}`));
    }
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

  return cards;
};

const buildMostLikelyDeck = (vibe: Vibe): GameCard[] => {
  const base = likelyBase[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  for (const entry of base) {
    const prefix = "Qui est le plus susceptible de ";
    cards.push(createCard("most_likely", vibe, idx++, "vote", `${elide(prefix, clean(entry))} ?`));
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


// === Lazy deck cache ===
const deckCache = new Map<string, GameCard[]>();

function getDeck(mode: GameMode, vibe: Vibe): GameCard[] {
  const key = `${mode}::${vibe}`;
  if (deckCache.has(key)) return deckCache.get(key)!;

  let cards: GameCard[] = [];

  if (mode === "culture_generale") {
    cards = buildCultureDeck(vibe as Difficulty);
  } else {
    const builderMap: Record<string, (v: Vibe) => GameCard[]> = {
      truth_dare: buildTruthDareDeck,
      never_have_i_ever: buildNeverDeck,
      most_likely: buildMostLikelyDeck,
      would_you_rather: buildWouldYouRatherDeck,
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
  const modes: GameMode[] = ["truth_dare", "never_have_i_ever", "most_likely", "would_you_rather"];

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

/** @deprecated Use getAllCards() or getFilteredCards() instead */
export const CARDS = getAllCards;

export function getFilteredCards(mode: GameMode, vibe: Vibe, playerCount: number): GameCard[] {
  const deck = getDeck(mode, vibe);
  if (mode === "culture_generale") return deck;
  const filtered = deck.filter(c => c.player_min <= playerCount && c.player_max >= playerCount);
  if (filtered.length >= MINIMUM_CARDS_PER_COMBO) return filtered;
  return deck;
}
