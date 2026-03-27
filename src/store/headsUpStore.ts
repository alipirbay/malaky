import { create } from "zustand";
import { HEADS_UP_CATEGORIES, type HeadsUpCategory } from "@/data/heads_up_categories";
import { GAME_LIMITS } from "@/data/constants";
import type { Player } from "@/data/types";

type HeadsUpScreen = "categories" | "ai_theme" | "instructions" | "playing" | "round_result" | "final_result";

interface RoundResult {
  playerName: string;
  found: string[];
  passed: string[];
  score: number;
}

interface HeadsUpState {
  screen: HeadsUpScreen;
  selectedCategory: HeadsUpCategory | null;
  players: Player[];
  currentPlayerIndex: number;
  currentWord: string;
  wordIndex: number;
  words: string[];
  roundTimeLeft: number;
  roundRunning: boolean;
  found: string[];
  passed: string[];
  passesLeft: number;
  scores: Record<string, number>;
  roundResults: RoundResult[];
  roundComplete: boolean;

  setScreen: (s: HeadsUpScreen) => void;
  selectCategory: (catId: string) => void;
  selectCustomDeck: (theme: string, words: string[]) => void;
  initGame: (players: Player[]) => void;
  startRound: () => void;
  markFound: () => void;
  markPassed: () => void;
  tickTimer: () => void;
  endRound: () => void;
  nextPlayer: () => void;
  replayCurrentPlayer: () => void;
  showFinalResults: () => void;
  resetGame: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const useHeadsUpStore = create<HeadsUpState>()((set, get) => ({
  screen: "categories",
  selectedCategory: null,
  players: [],
  currentPlayerIndex: 0,
  currentWord: "",
  wordIndex: 0,
  words: [],
  roundTimeLeft: GAME_LIMITS.HEADS_UP_ROUND_SECONDS,
  roundRunning: false,
  found: [],
  passed: [],
  passesLeft: GAME_LIMITS.HEADS_UP_PASS_LIMIT,
  scores: {},
  roundResults: [],
  roundComplete: false,

  setScreen: (s) => set({ screen: s }),

  selectCategory: (catId) => {
    const cat = HEADS_UP_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      set({ selectedCategory: cat, screen: "instructions" });
    }
  },

  selectCustomDeck: (theme, words) => {
    const cat: HeadsUpCategory = {
      id: `ai_${Date.now()}`,
      name: theme,
      emoji: "✨",
      description: `Deck IA : ${theme}`,
      words,
    };
    set({ selectedCategory: cat, screen: "instructions" });
  },

  initGame: (players) => {
    const scores: Record<string, number> = {};
    players.forEach((p) => { scores[p.name] = 0; });
    set({
      players,
      currentPlayerIndex: 0,
      scores,
      roundResults: [],
      roundComplete: false,
    });
  },

  startRound: () => {
    const { selectedCategory } = get();
    if (!selectedCategory) return;
    const shuffled = shuffleArray(selectedCategory.words);
    set({
      words: shuffled,
      wordIndex: 0,
      currentWord: shuffled[0] || "",
      roundTimeLeft: GAME_LIMITS.HEADS_UP_ROUND_SECONDS,
      roundRunning: true,
      found: [],
      passed: [],
      passesLeft: GAME_LIMITS.HEADS_UP_PASS_LIMIT,
      roundComplete: false,
      screen: "playing",
    });
  },

  markFound: () => {
    const { currentWord, found, words, wordIndex, roundRunning } = get();
    if (!roundRunning || !currentWord) return;
    const newFound = [...found, currentWord];
    const nextIdx = wordIndex + 1;
    if (nextIdx >= words.length) {
      set({ found: newFound, roundRunning: false, roundComplete: true });
      get().endRound();
      return;
    }
    set({
      found: newFound,
      wordIndex: nextIdx,
      currentWord: words[nextIdx],
    });
  },

  markPassed: () => {
    const { currentWord, passed, passesLeft, words, wordIndex, roundRunning } = get();
    if (!roundRunning || !currentWord || passesLeft <= 0) return;
    const newPassed = [...passed, currentWord];
    const nextIdx = wordIndex + 1;
    if (nextIdx >= words.length) {
      set({ passed: newPassed, passesLeft: passesLeft - 1, roundRunning: false, roundComplete: true });
      get().endRound();
      return;
    }
    set({
      passed: newPassed,
      passesLeft: passesLeft - 1,
      wordIndex: nextIdx,
      currentWord: words[nextIdx],
    });
  },

  tickTimer: () => {
    const { roundTimeLeft, roundRunning } = get();
    if (!roundRunning) return;
    if (roundTimeLeft <= 1) {
      set({ roundTimeLeft: 0, roundRunning: false, roundComplete: true });
      get().endRound();
      return;
    }
    set({ roundTimeLeft: roundTimeLeft - 1 });
  },

  endRound: () => {
    const { players, currentPlayerIndex, found, passed, scores } = get();
    const player = players[currentPlayerIndex];
    if (!player) return;
    const roundScore = found.length;
    const newScores = { ...scores, [player.name]: (scores[player.name] || 0) + roundScore };
    const result: RoundResult = { playerName: player.name, found: [...found], passed: [...passed], score: roundScore };
    set((s) => ({
      scores: newScores,
      roundResults: [...s.roundResults, result],
      screen: "round_result",
    }));
  },

  nextPlayer: () => {
    const { currentPlayerIndex, players } = get();
    const nextIdx = currentPlayerIndex + 1;
    if (nextIdx >= players.length) {
      set({ screen: "final_result" });
    } else {
      set({
        currentPlayerIndex: nextIdx,
        screen: "instructions",
        roundComplete: false,
      });
    }
  },

  replayCurrentPlayer: () => {
    set({ roundComplete: false });
    get().startRound();
  },

  showFinalResults: () => {
    set({ screen: "final_result" });
  },

  resetGame: () =>
    set({
      screen: "categories",
      selectedCategory: null,
      currentPlayerIndex: 0,
      currentWord: "",
      wordIndex: 0,
      words: [],
      roundTimeLeft: GAME_LIMITS.HEADS_UP_ROUND_SECONDS,
      roundRunning: false,
      found: [],
      passed: [],
      passesLeft: GAME_LIMITS.HEADS_UP_PASS_LIMIT,
      scores: {},
      roundResults: [],
      roundComplete: false,
    }),
}));
