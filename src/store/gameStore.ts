import { create } from "zustand";
import type { GameMode, Vibe, GameCard } from "@/data/cards";
import { getFilteredCards } from "@/data/cards";

interface Player {
  name: string;
  color: string;
}

interface GameStats {
  cardsPlayed: number;
  refusals: number;
  playerStats: Record<string, { played: number; refused: number }>;
}

interface GameState {
  players: Player[];
  selectedMode: GameMode | null;
  selectedVibe: Vibe | null;

  currentScreen: "home" | "players" | "mode" | "vibe" | "game" | "end" | "packs" | "settings";
  currentPlayerIndex: number;
  currentCardIndex: number;
  deck: GameCard[];
  stats: GameStats;
  passesRemaining: Record<string, number>;

  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  shufflePlayers: () => void;
  setMode: (mode: GameMode) => void;
  setVibe: (vibe: Vibe) => void;
  setScreen: (screen: GameState["currentScreen"]) => void;
  startGame: () => void;
  nextCard: (action: "done" | "refuse" | "skip") => void;
  resetGame: () => void;
}

const PLAYER_COLORS = [
  "217 91% 60%", "350 96% 72%", "38 92% 50%", "142 71% 45%",
  "280 65% 60%", "190 80% 50%", "25 95% 53%", "330 80% 60%",
  "200 80% 50%", "60 70% 50%", "160 60% 45%", "300 60% 50%",
];

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  selectedMode: null,
  selectedVibe: null,
  currentScreen: "home",
  currentPlayerIndex: 0,
  currentCardIndex: 0,
  deck: [],
  stats: { cardsPlayed: 0, refusals: 0, playerStats: {} },
  passesRemaining: {},

  addPlayer: (name) => {
    const { players } = get();
    if (players.length >= 12) return;
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    set({ players: [...players, { name, color }] });
  },

  removePlayer: (index) => {
    set((s) => ({ players: s.players.filter((_, i) => i !== index) }));
  },

  shufflePlayers: () => {
    set((s) => {
      const shuffled = [...s.players];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { players: shuffled };
    });
  },

  setMode: (mode) => set({ selectedMode: mode }),
  setVibe: (vibe) => set({ selectedVibe: vibe }),
  setScreen: (screen) => set({ currentScreen: screen }),

  startGame: () => {
    const { selectedMode, selectedVibe, players } = get();
    if (!selectedMode || !selectedVibe) return;

    let cards = getFilteredCards(selectedMode, selectedVibe, players.length);
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    const passes: Record<string, number> = {};
    const playerStats: Record<string, { played: number; refused: number }> = {};
    players.forEach((p) => {
      passes[p.name] = 2;
      playerStats[p.name] = { played: 0, refused: 0 };
    });

    set({
      deck: cards,
      currentPlayerIndex: 0,
      currentCardIndex: 0,
      stats: { cardsPlayed: 0, refusals: 0, playerStats },
      passesRemaining: passes,
      currentScreen: "game",
    });
  },

  nextCard: (action) => {
    const { currentCardIndex, currentPlayerIndex, players, deck, stats, passesRemaining } = get();
    const currentPlayer = players[currentPlayerIndex].name;

    const newStats = { ...stats };
    const newPasses = { ...passesRemaining };

    if (action === "done") {
      newStats.cardsPlayed++;
      newStats.playerStats[currentPlayer] = {
        ...newStats.playerStats[currentPlayer],
        played: (newStats.playerStats[currentPlayer]?.played || 0) + 1,
      };
    } else if (action === "refuse") {
      newStats.refusals++;
      newStats.playerStats[currentPlayer] = {
        ...newStats.playerStats[currentPlayer],
        refused: (newStats.playerStats[currentPlayer]?.refused || 0) + 1,
      };
    } else if (action === "skip") {
      newPasses[currentPlayer] = Math.max(0, (newPasses[currentPlayer] || 0) - 1);
    }

    const nextCardIdx = currentCardIndex + 1;
    const nextPlayerIdx = (currentPlayerIndex + 1) % players.length;

    if (nextCardIdx >= deck.length) {
      set({ stats: newStats, passesRemaining: newPasses, currentScreen: "end" });
    } else {
      set({
        currentCardIndex: nextCardIdx,
        currentPlayerIndex: nextPlayerIdx,
        stats: newStats,
        passesRemaining: newPasses,
      });
    }
  },

  resetGame: () => {
    set({
      players: [],
      selectedMode: null,
      selectedVibe: null,
      currentScreen: "home",
      currentPlayerIndex: 0,
      currentCardIndex: 0,
      deck: [],
      stats: { cardsPlayed: 0, refusals: 0, playerStats: {} },
      passesRemaining: {},
    });
  },
}));
