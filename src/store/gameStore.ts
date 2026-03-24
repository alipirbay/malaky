import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameMode, Vibe, GameCard } from "@/data/cards";
import { getFilteredCards, deduplicateShuffle } from "@/data/cards";

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
  unlockedVibes: Record<Vibe, boolean>;
  currentScreen: "home" | "players" | "mode" | "vibe" | "game" | "end" | "packs" | "settings" | "payment_return";
  pendingTransactionId: string | null;
  currentPlayerIndex: number;
  currentCardIndex: number;
  deck: GameCard[];
  stats: GameStats;
  passesRemaining: Record<string, number>;
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  shufflePlayers: () => void;
  setMode: (mode: GameMode) => void;
  setVibe: (vibe: Vibe) => void;
  setScreen: (screen: GameState["currentScreen"]) => void;
  unlockVibe: (vibe: Vibe) => void;
  unlockBundle: (vibes: Vibe[]) => void;
  startGame: () => void;
  nextCard: (action: "done" | "refuse" | "skip") => void;
  resetGame: () => void;
  toggleSound: () => void;
  setSoundVolume: (vol: number) => void;
  toggleVibration: () => void;
}

const PLAYER_COLORS = [
  "217 91% 60%", "350 96% 72%", "38 92% 50%", "142 71% 45%",
  "280 65% 60%", "190 80% 50%", "25 95% 53%", "330 80% 60%",
  "200 80% 50%", "60 70% 50%", "160 60% 45%", "300 60% 50%",
];

const defaultUnlockedVibes: Record<Vibe, boolean> = {
  soft: true,
  fun: true,
  hot: false,
  chaos: false,
  couple: false,
  apero: false,
  mada: false,
  confessions: false,
  vip: false,
  afterdark: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      selectedMode: null,
      selectedVibe: null,
      unlockedVibes: { ...defaultUnlockedVibes },
      currentScreen: "home",
      currentPlayerIndex: 0,
      currentCardIndex: 0,
      deck: [],
      stats: { cardsPlayed: 0, refusals: 0, playerStats: {} },
      passesRemaining: {},
      soundEnabled: true,
      soundVolume: 80,
      vibrationEnabled: true,

      addPlayer: (name) => {
        const { players } = get();
        if (players.length >= 12) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
        set({ players: [...players, { name: trimmed, color }] });
      },

      removePlayer: (index) => {
        set((state) => ({ players: state.players.filter((_, i) => i !== index) }));
      },

      shufflePlayers: () => {
        set((state) => {
          const shuffled = [...state.players];
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

      unlockVibe: (vibe) => {
        set((state) => ({
          unlockedVibes: { ...state.unlockedVibes, [vibe]: true },
        }));
      },

      unlockBundle: (vibes) => {
        set((state) => {
          const updated = { ...state.unlockedVibes };
          vibes.forEach(v => { updated[v] = true; });
          return { unlockedVibes: updated };
        });
      },

      startGame: () => {
        const { selectedMode, selectedVibe, players, unlockedVibes } = get();
        if (!selectedMode || !selectedVibe || players.length < 2) return;
        if (!unlockedVibes[selectedVibe]) {
          set({ currentScreen: "packs" });
          return;
        }

        const cards = deduplicateShuffle([...getFilteredCards(selectedMode, selectedVibe, players.length)]);

        const passes: Record<string, number> = {};
        const playerStats: Record<string, { played: number; refused: number }> = {};
        players.forEach((player) => {
          passes[player.name] = 2;
          playerStats[player.name] = { played: 0, refused: 0 };
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
        if (!players.length || !deck.length) return;

        const currentPlayer = players[currentPlayerIndex]?.name;
        if (!currentPlayer) return;

        const newStats: GameStats = {
          cardsPlayed: stats.cardsPlayed,
          refusals: stats.refusals,
          playerStats: { ...stats.playerStats },
        };
        const newPasses = { ...passesRemaining };

        if (action === "done") {
          newStats.cardsPlayed += 1;
          newStats.playerStats[currentPlayer] = {
            played: (newStats.playerStats[currentPlayer]?.played || 0) + 1,
            refused: newStats.playerStats[currentPlayer]?.refused || 0,
          };
        } else if (action === "refuse") {
          newStats.refusals += 1;
          newStats.playerStats[currentPlayer] = {
            played: newStats.playerStats[currentPlayer]?.played || 0,
            refused: (newStats.playerStats[currentPlayer]?.refused || 0) + 1,
          };
        } else if (action === "skip") {
          newPasses[currentPlayer] = Math.max(0, (newPasses[currentPlayer] || 0) - 1);
        }

        const nextCardIdx = currentCardIndex + 1;
        const nextPlayerIdx = (currentPlayerIndex + 1) % players.length;

        if (nextCardIdx >= deck.length) {
          set({ stats: newStats, passesRemaining: newPasses, currentScreen: "end" });
          return;
        }

        set({
          currentCardIndex: nextCardIdx,
          currentPlayerIndex: nextPlayerIdx,
          stats: newStats,
          passesRemaining: newPasses,
        });
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
          unlockedVibes: get().unlockedVibes,
        });
      },

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setSoundVolume: (vol) => set({ soundVolume: vol }),
      toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
    }),
    {
      name: "malaky-store",
      partialize: (state) => ({
        unlockedVibes: state.unlockedVibes,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        vibrationEnabled: state.vibrationEnabled,
      }),
    }
  )
);
