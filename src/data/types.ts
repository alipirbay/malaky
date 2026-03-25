export interface GameCard {
  id: string;
  mode: GameMode;
  vibe: Vibe;
  lang: "fr" | "mg";
  card_type: "truth" | "dare" | "group" | "duel" | "vote" | "timer" | "quiz";
  text: string;
  answer?: string;
  requires_prop: "none" | "phone" | "chair" | "paper" | "coin";
  player_min: number;
  player_max: number;
}

export type GameMode = "truth_dare" | "never_have_i_ever" | "most_likely" | "would_you_rather" | "quick_challenge" | "culture_generale" | "tsimoa";
export type Vibe = "soft" | "fun" | "hot" | "chaos" | "couple" | "apero" | "mada" | "confessions" | "vip" | "afterdark" | "facile" | "intermediaire" | "difficile" | "expert";
export type Difficulty = "facile" | "intermediaire" | "difficile" | "expert";

export interface GameSession {
  id: string;
  date: string;
  players: string[];
  mode: string;
  vibe: string;
  cardsPlayed: number;
  refusals: number;
  score: number;
  bravest: string;
  quizScore?: number;
}
