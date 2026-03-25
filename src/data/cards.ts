export type { GameCard, GameMode, Vibe } from "./types";
export { GAME_MODES, VIBES, STORE_PACKS } from "./config";

import type { GameCard, GameMode, Vibe } from "./types";
import { GAME_MODES, VIBES } from "./config";
import {
  truthPrompts, dareActions, neverBase, likelyBase,
  ratherA, ratherB, challengeActions,
} from "./card_content";

const MINIMUM_CARDS_PER_COMBO = 150;
const MAX_PLAYERS = 12;

type CardType = GameCard["card_type"];

const createCard = (
  mode: GameMode, vibe: Vibe, index: number, cardType: CardType,
  text: string, requiresProp: GameCard["requires_prop"] = "none"
): GameCard => ({
  id: `${mode}-${vibe}-${index}`,
  mode, vibe, lang: "fr", card_type: cardType, text,
  requires_prop: requiresProp, player_min: 2, player_max: MAX_PLAYERS,
});

const hasExplicitDuration = (text: string) => /(\d+)\s*(?:s|sec|secondes?|minute|minutes)/i.test(text) || /une?\s+minute/i.test(text);

// Deduplicate and space out cards so no similar text appears within a window
export function deduplicateShuffle(cards: GameCard[]): GameCard[] {
  const seen = new Set<string>();
  const unique = cards.filter(c => {
    if (seen.has(c.text)) return false;
    seen.add(c.text);
    return true;
  });

  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  const getBase = (text: string) => text.split('.')[0].trim();

  const MIN_GAP = 8;
  const result: GameCard[] = [];
  const recentBases: string[] = [];
  const remaining = [...unique];
  let stuckCount = 0;

  while (remaining.length > 0 && stuckCount < remaining.length * 2) {
    const idx = remaining.findIndex(c => {
      const base = getBase(c.text);
      return !recentBases.includes(base);
    });

    if (idx === -1) {
      result.push(remaining.shift()!);
      stuckCount++;
    } else {
      const card = remaining.splice(idx, 1)[0];
      result.push(card);
      recentBases.push(getBase(card.text));
      if (recentBases.length > MIN_GAP) recentBases.shift();
      stuckCount = 0;
    }
  }

  result.push(...remaining);
  return result;
}

// === DECK BUILDERS ===
// No more awkward cross-product suffixes. Cards use prompts directly.

const buildTruthDareDeck = (vibe: Vibe): GameCard[] => {
  const prompts = truthPrompts[vibe] || [];
  const dares = dareActions[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  // Truth cards — each prompt used directly with {player}
  for (const p of prompts) {
    cards.push(createCard("truth_dare", vibe, idx++, "truth", `{player}, ${p}`));
  }

  // Dare cards — each action used directly with {player}
  for (let i = 0; i < dares.length; i++) {
    cards.push(createCard("truth_dare", vibe, idx++, "dare", `{player}, ${dares[i]}`, i % 5 === 0 ? "phone" : "none"));
  }

  // Fill to minimum by cycling through prompts with player2 variant
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

  // Each "never" statement used directly
  for (const entry of base) {
    cards.push(createCard("never_have_i_ever", vibe, idx++, "vote", `Je n'ai jamais ${entry}`));
  }

  // Fill to minimum by adding player-targeted variants
  let fillIdx = 0;
  while (cards.length < MINIMUM_CARDS_PER_COMBO) {
    const entry = base[fillIdx % base.length];
    cards.push(createCard("never_have_i_ever", vibe, idx++, "vote", `{player}, as-tu déjà ${entry}`));
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

  // Fill to minimum
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

  // Direct pairs first
  for (let i = 0; i < len; i++) {
    cards.push(createCard("would_you_rather", vibe, idx++, "truth", `{player}, tu préfères ${aList[i]} ou ${bList[i]} ?`));
  }

  // Cross-pair to fill (offset pairing to create new combos)
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

  // Truth cards → auto timer (15s)
  for (const t of truths) {
    cards.push(createCard("quick_challenge", vibe, idx++, "truth", `{player}, ${t}`));
  }

  // Never have I ever → auto timer (15s)
  for (const n of nevers) {
    cards.push(createCard("quick_challenge", vibe, idx++, "vote", `Je n'ai jamais ${n}`));
  }

  // Most likely → auto timer (15s)
  for (const l of likelys) {
    cards.push(createCard("quick_challenge", vibe, idx++, "vote", `Qui est le plus susceptible de ${l}`));
  }

  // Would you rather → auto timer (15s)
  const rLen = Math.min(rathersA.length, rathersB.length);
  for (let i = 0; i < rLen; i++) {
    cards.push(createCard("quick_challenge", vibe, idx++, "truth", `Tu préfères ${rathersA[i]} ou ${rathersB[i]} ?`));
  }

  // Action/dare cards → manual timer with explicit duration
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

// Build all cards
export const CARDS: GameCard[] = [];

const ALL_VIBES: Vibe[] = ["soft", "fun", "hot", "chaos", "couple", "apero", "mada", "confessions", "vip", "afterdark"];
const builders = [buildTruthDareDeck, buildNeverDeck, buildMostLikelyDeck, buildWouldYouRatherDeck, buildQuickChallengeDeck];

for (const vibe of ALL_VIBES) {
  for (const builder of builders) {
    CARDS.push(...builder(vibe));
  }
}

// Validate coverage
const validateCardCoverage = () => {
  for (const mode of GAME_MODES) {
    for (const vibe of VIBES) {
      const total = CARDS.filter(c => c.mode === mode.id && c.vibe === vibe.id).length;
      if (total < MINIMUM_CARDS_PER_COMBO) {
        console.warn(`Low card count for ${mode.id}/${vibe.id}: ${total}`);
      }
    }
  }
};

validateCardCoverage();

export function getFilteredCards(mode: GameMode, vibe: Vibe, playerCount: number): GameCard[] {
  const filtered = CARDS.filter(
    c => c.mode === mode && c.vibe === vibe && c.player_min <= playerCount && c.player_max >= playerCount
  );
  if (filtered.length >= MINIMUM_CARDS_PER_COMBO) return filtered;
  return CARDS.filter(c => c.mode === mode && c.vibe === vibe);
}

export function fillPlayerNames(text: string, currentPlayer: string, allPlayers: string[]): string {
  const otherPlayers = allPlayers.filter(p => p !== currentPlayer);
  const fallback = otherPlayers[0] || currentPlayer;
  let result = text.split("{player}").join(currentPlayer);
  result = result.split("{player2}").join(fallback);
  return result;
}
