export interface GameCard {
  id: string;
  mode: GameMode;
  pack: Pack;
  lang: "fr" | "mg";
  age_rating: "10+" | "13+" | "16+" | "18+";
  intensity: 1 | 2 | 3 | 4;
  card_type: "truth" | "dare" | "group" | "duel" | "vote" | "timer";
  text: string;
  requires_prop: "none" | "phone" | "chair" | "paper" | "coin";
  player_min: number;
  player_max: number;
}

export type GameMode = "truth_dare" | "never_have_i_ever" | "most_likely" | "would_you_rather" | "quick_challenge";
export type Pack = "family" | "chill" | "chaos_mada" | "adult" | "couple" | "campus";
export type Intensity = 1 | 2 | 3 | 4;

export const GAME_MODES = [
  {
    id: "truth_dare" as GameMode,
    name: "Action ou Vérité",
    subtitle: "Avoue ou ose",
    emoji: "🔥",
    badge: "Hilarant",
    color: "coral" as const,
  },
  {
    id: "never_have_i_ever" as GameMode,
    name: "Je n'ai jamais",
    subtitle: "Qui l'a déjà fait ?",
    emoji: "🙈",
    badge: "Confessionnel",
    color: "primary" as const,
  },
  {
    id: "most_likely" as GameMode,
    name: "Qui est le plus…",
    subtitle: "Vote et débat",
    emoji: "👆",
    badge: "Social",
    color: "mango" as const,
  },
  {
    id: "would_you_rather" as GameMode,
    name: "Tu préfères ?",
    subtitle: "Choix impossibles",
    emoji: "🤔",
    badge: "Intime",
    color: "primary" as const,
  },
  {
    id: "quick_challenge" as GameMode,
    name: "Défis express",
    subtitle: "Chrono, pas de pitié",
    emoji: "⚡",
    badge: "Tendu",
    color: "mango" as const,
  },
];

export const PACKS = [
  { id: "family" as Pack, name: "Fianakaviana Safe", age: "10+", emoji: "👨‍👩‍👧‍👦", free: true },
  { id: "chill" as Pack, name: "Chill entre amis", age: "13+", emoji: "😎", free: true },
  { id: "chaos_mada" as Pack, name: "Chaos Mada", age: "16+", emoji: "🇲🇬", free: true },
  { id: "adult" as Pack, name: "Soirée Sans Filtre", age: "18+", emoji: "🌶️", free: false },
  { id: "couple" as Pack, name: "Couple / Date", age: "18+", emoji: "💕", free: false },
  { id: "campus" as Pack, name: "Campus / Coloc", age: "16+", emoji: "🎓", free: true },
];

export const INTENSITIES = [
  { level: 1 as Intensity, name: "Safe", emoji: "😇", description: "Tranquille, pour tout le monde" },
  { level: 2 as Intensity, name: "Chill", emoji: "😏", description: "Un peu de piquant" },
  { level: 3 as Intensity, name: "Osez", emoji: "😈", description: "Ça chauffe sérieusement" },
  { level: 4 as Intensity, name: "Sans filtre", emoji: "💀", description: "Vous êtes prévenus" },
];

// Sample cards for v1
export const CARDS: GameCard[] = [
  // Truth or Dare - Chill
  { id: "td_ch_001", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "truth", text: "C'est quoi le mensonge le plus bête que tu as raconté cette semaine ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_ch_002", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "dare", text: "{player}, imite la personne à ta gauche pendant 30 secondes.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "td_ch_003", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "truth", text: "{player}, c'est qui la dernière personne que tu as stalkée sur les réseaux ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_ch_004", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "dare", text: "{player}, envoie un vocal à ton dernier contact WhatsApp en chantant.", requires_prop: "phone", player_min: 2, player_max: 12 },
  { id: "td_ch_005", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "group", text: "Tout le monde : levez la main si vous avez déjà menti pour éviter une sortie.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "td_ch_006", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "duel", text: "{player} vs {player2} : celui qui tient le plus longtemps sans rire gagne.", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_ch_007", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "truth", text: "{player}, c'est quoi ton talent caché le plus inutile ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_ch_008", mode: "truth_dare", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "dare", text: "{player}, fais ta meilleure danse pendant 15 secondes. Maintenant.", requires_prop: "none", player_min: 2, player_max: 12 },

  // Chaos Mada
  { id: "td_cm_001", mode: "truth_dare", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 2, card_type: "truth", text: "{player}, dis le mensonge le plus bête que tu as déjà raconté pour éviter quelqu'un.", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_cm_002", mode: "truth_dare", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 2, card_type: "dare", text: "{player}, appelle ta mère et dis-lui que tu as raté un examen. Tiens 10 secondes.", requires_prop: "phone", player_min: 2, player_max: 12 },
  { id: "td_cm_003", mode: "truth_dare", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 3, card_type: "truth", text: "{player}, c'est quoi ta plus grosse honte dans un taxi-be ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_cm_004", mode: "truth_dare", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 2, card_type: "dare", text: "{player}, fais une imitation de quelqu'un qui négocie le prix au marché.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "td_cm_005", mode: "truth_dare", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 3, card_type: "truth", text: "{player}, raconte ta pire excuse quand la Jirama a coupé et que t'avais pas de bougie.", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_cm_006", mode: "truth_dare", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 2, card_type: "group", text: "Levez la main si vous avez déjà dit 'j'arrive dans 5 minutes' alors que vous étiez encore chez vous.", requires_prop: "none", player_min: 3, player_max: 12 },

  // Family
  { id: "td_fm_001", mode: "truth_dare", pack: "family", lang: "fr", age_rating: "10+", intensity: 1, card_type: "truth", text: "{player}, c'est quoi ton plat préféré de maman ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_fm_002", mode: "truth_dare", pack: "family", lang: "fr", age_rating: "10+", intensity: 1, card_type: "dare", text: "{player}, fais deviner un film en mimant. Tu as 30 secondes.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "td_fm_003", mode: "truth_dare", pack: "family", lang: "fr", age_rating: "10+", intensity: 1, card_type: "truth", text: "{player}, si tu pouvais avoir un super-pouvoir, ce serait quoi ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "td_fm_004", mode: "truth_dare", pack: "family", lang: "fr", age_rating: "10+", intensity: 1, card_type: "dare", text: "{player}, chante le refrain de ta chanson préférée.", requires_prop: "none", player_min: 2, player_max: 12 },

  // Never Have I Ever
  { id: "nh_ch_001", mode: "never_have_i_ever", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "vote", text: "Je n'ai jamais fait semblant de ne pas voir quelqu'un dans la rue.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "nh_ch_002", mode: "never_have_i_ever", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "vote", text: "Je n'ai jamais lu les messages de quelqu'un d'autre en cachette.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "nh_ch_003", mode: "never_have_i_ever", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "vote", text: "Je n'ai jamais ri à une blague que je n'avais pas comprise.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "nh_ch_004", mode: "never_have_i_ever", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "vote", text: "Je n'ai jamais mangé un truc tombé par terre quand personne ne regardait.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "nh_cm_001", mode: "never_have_i_ever", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 2, card_type: "vote", text: "Je n'ai jamais inventé une excuse pour éviter un kabary.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "nh_cm_002", mode: "never_have_i_ever", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 3, card_type: "vote", text: "Je n'ai jamais fait semblant d'avoir du réseau pour éviter un appel.", requires_prop: "none", player_min: 3, player_max: 12 },

  // Most Likely To
  { id: "ml_ch_001", mode: "most_likely", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "vote", text: "Qui est le plus susceptible de s'endormir en premier en soirée ?", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "ml_ch_002", mode: "most_likely", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "vote", text: "Qui est le plus susceptible de ghoster quelqu'un sans raison ?", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "ml_ch_003", mode: "most_likely", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "vote", text: "Qui est le plus susceptible de devenir célèbre ?", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "ml_cm_001", mode: "most_likely", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 2, card_type: "vote", text: "Qui est le plus susceptible de se perdre dans Analakely ?", requires_prop: "none", player_min: 3, player_max: 12 },

  // Would You Rather
  { id: "wr_ch_001", mode: "would_you_rather", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "truth", text: "Tu préfères ne plus jamais utiliser ton téléphone ou ne plus jamais manger de vary ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "wr_ch_002", mode: "would_you_rather", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "truth", text: "Tu préfères que tout le monde lise tes messages ou voie ton historique de recherche ?", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "wr_ch_003", mode: "would_you_rather", pack: "chill", lang: "fr", age_rating: "13+", intensity: 1, card_type: "truth", text: "Tu préfères avoir le pouvoir de voler ou d'être invisible ?", requires_prop: "none", player_min: 2, player_max: 12 },

  // Quick Challenge
  { id: "qc_ch_001", mode: "quick_challenge", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "timer", text: "{player}, cite 5 pays d'Afrique en 10 secondes !", requires_prop: "none", player_min: 2, player_max: 12 },
  { id: "qc_ch_002", mode: "quick_challenge", pack: "chill", lang: "fr", age_rating: "13+", intensity: 2, card_type: "timer", text: "{player}, fais rire quelqu'un en 15 secondes ou tu perds.", requires_prop: "none", player_min: 3, player_max: 12 },
  { id: "qc_cm_001", mode: "quick_challenge", pack: "chaos_mada", lang: "fr", age_rating: "16+", intensity: 3, card_type: "timer", text: "{player}, imite 3 vendeurs de rue différents en 20 secondes.", requires_prop: "none", player_min: 3, player_max: 12 },
];

export function getFilteredCards(mode: GameMode, pack: Pack, intensity: Intensity, playerCount: number): GameCard[] {
  return CARDS.filter(
    (c) =>
      c.mode === mode &&
      c.pack === pack &&
      c.intensity <= intensity &&
      c.player_min <= playerCount &&
      c.player_max >= playerCount
  );
}

export function fillPlayerNames(text: string, currentPlayer: string, allPlayers: string[]): string {
  let result = text.replace("{player}", currentPlayer);
  const otherPlayers = allPlayers.filter((p) => p !== currentPlayer);
  if (otherPlayers.length > 0) {
    const randomOther = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    result = result.replace("{player2}", randomOther);
  }
  return result;
}
