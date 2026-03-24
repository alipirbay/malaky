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

const truthTopics: string[] = [
  "et pourquoi ?", "sans mentir.", "avec tous les détails.", "en une phrase.",
  "et ce que ça dit de toi.", "honnêtement.", "sans hésiter.", "et assume.",
];

const dareTwists: string[] = [
  "Tu as 15 secondes.", "Le groupe note sur 10.", "Sans rire.", "Avec conviction.",
  "Comme si ta vie en dépendait.", "Et tout le monde regarde.",
];

const neverSuffix: string[] = [
  "et assumé.", "sans le dire à personne.", "en le regrettant après.", "comme si c'était normal.",
];

const likelySuffix: string[] = [
  "ce soir ?", "sans aucune honte ?", "dans les 24h ?", "si personne ne regardait ?",
];

const challengeVariants: string[] = [
  "",
  " Le groupe juge.",
  " Sans préparation.",
  " Fais-le maintenant.",
];

const hasExplicitDuration = (text: string) => /(\d+)\s*(?:s|sec|secondes?|minute|minutes)/i.test(text) || /une?\s+minute/i.test(text);

const crossTexts = (left: string[], right: string[], mapper: (a: string, b: string) => string) =>
  left.flatMap((a) => right.map((b) => mapper(a, b)));

const pairTexts = (base: string[], suffixes: string[]) =>
  base.flatMap((entry) => suffixes.map((suffix) => `${entry} ${suffix}`));

const buildTruthDareDeck = (vibe: Vibe): GameCard[] => {
  const prompts = truthPrompts[vibe] || [];
  const dares = dareActions[vibe] || [];
  const cards: GameCard[] = [];
  let idx = 1;

  // Truth cards
  crossTexts(prompts, truthTopics, (p, t) => `{player}, ${p} ${t}`)
    .slice(0, 80)
    .forEach(text => cards.push(createCard("truth_dare", vibe, idx++, "truth", text)));

  // Dare cards  
  crossTexts(dares, dareTwists, (a, t) => `{player}, ${a} ${t}`)
    .slice(0, 70)
    .forEach((text, i) => cards.push(createCard("truth_dare", vibe, idx++, "dare", text, i % 5 === 0 ? "phone" : "none")));

  // Fill to minimum if needed
  while (cards.length < MINIMUM_CARDS_PER_COMBO) {
    const extraTruth = prompts[cards.length % prompts.length];
    cards.push(createCard("truth_dare", vibe, idx++, "truth", `{player}, ${extraTruth} Et explique.`));
  }

  return cards;
};

const buildNeverDeck = (vibe: Vibe): GameCard[] =>
  crossTexts(
    (neverBase[vibe] || []).map(e => `Je n'ai jamais ${e}`),
    neverSuffix,
    (l, r) => `${l} ${r}`
  )
    .flatMap(text => [text, `${text} Le groupe veut un exemple.`, `${text} Assume si c'est vrai.`])
    .slice(0, Math.max(160, MINIMUM_CARDS_PER_COMBO))
    .map((text, i) => createCard("never_have_i_ever", vibe, i + 1, "vote", text));

const buildMostLikelyDeck = (vibe: Vibe): GameCard[] =>
  crossTexts(
    (likelyBase[vibe] || []).map(e => `Qui est le plus susceptible de ${e}`),
    likelySuffix,
    (l, r) => `${l} ${r}`
  )
    .flatMap(text => [text, `${text} Vote immédiat.`, `${text} La personne citée se défend.`])
    .slice(0, Math.max(160, MINIMUM_CARDS_PER_COMBO))
    .map((text, i) => createCard("most_likely", vibe, i + 1, "vote", text));

const buildWouldYouRatherDeck = (vibe: Vibe): GameCard[] =>
  crossTexts(ratherA[vibe] || [], ratherB[vibe] || [], (a, b) => `Tu préfères ${a} ou ${b} ?`)
    .flatMap(text => [text, `${text} Réponds immédiatement.`, `${text} Et explique ton choix.`])
    .slice(0, Math.max(160, MINIMUM_CARDS_PER_COMBO))
    .map((text, i) => createCard("would_you_rather", vibe, i + 1, "truth", text));

const buildQuickChallengeDeck = (vibe: Vibe): GameCard[] =>
  (challengeActions[vibe] || [])
    .flatMap((action) => {
      const variants = hasExplicitDuration(action)
        ? [action]
        : [10, 15, 20, 30].map((seconds) => `${action.replace(/\.$/, "")} pendant ${seconds} secondes.`);

      return variants.flatMap((variant) =>
        challengeVariants.map((suffix) => `${variant}${suffix}`.trim())
      );
    })
    .slice(0, Math.max(160, MINIMUM_CARDS_PER_COMBO))
    .map((text, i) => createCard("quick_challenge", vibe, i + 1, "timer", `{player}, ${text}`));

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
