import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameMode, Vibe, GameCard } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";

interface Player {
  name: string;
  color: string;
}

interface GameStats {
  cardsPlayed: number;
  refusals: number;
  quizScore: number;
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
  quickChallengeDuration: 10 | 15 | 20;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  shufflePlayers: () => void;
  setMode: (mode: GameMode) => void;
  setVibe: (vibe: Vibe) => void;
  setScreen: (screen: GameState["currentScreen"]) => void;
  unlockVibe: (vibe: Vibe) => void;
  unlockBundle: (vibes: Vibe[]) => void;
  startGame: (vibeOverride?: Vibe) => Promise<void>;
  nextCard: (action: "done" | "refuse" | "skip", wasCorrect?: boolean) => void;
  resetGame: () => void;
  toggleSound: () => void;
  setSoundVolume: (vol: number) => void;
  toggleVibration: () => void;
  setPendingTransaction: (id: string | null) => void;
  setQuickChallengeDuration: (d: 10 | 15 | 20) => void;
}

const PLAYER_COLORS = [
  "217 91% 60%", "350 96% 72%", "38 92% 50%", "142 71% 45%",
  "280 65% 60%", "190 80% 50%", "25 95% 53%", "330 80% 60%",
  "200 80% 50%", "60 70% 50%", "160 60% 45%", "300 60% 50%",
];

const defaultUnlockedVibes: Record<Vibe, boolean> = {
  soft: true, fun: true, hot: false, chaos: false, couple: false,
  apero: false, mada: false, confessions: false, vip: false, afterdark: false,
  facile: true, intermediaire: true, difficile: false, expert: false,
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
      stats: { cardsPlayed: 0, refusals: 0, quizScore: 0, playerStats: {} },
      passesRemaining: {},
      soundEnabled: true,
      soundVolume: 80,
      vibrationEnabled: true,
      pendingTransactionId: null,
      quickChallengeDuration: 15,

      addPlayer: (name) => {
        const { players } = get();
        if (players.length >= GAME_LIMITS.MAX_PLAYERS) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return;
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

      startGame: async (vibeOverride?: Vibe) => {
        const state = get();
        const selectedVibe = vibeOverride ?? state.selectedVibe;
        const { selectedMode, players, unlockedVibes } = state;
        if (vibeOverride) set({ selectedVibe: vibeOverride });
        if (!selectedMode || !selectedVibe || players.length < GAME_LIMITS.MIN_PLAYERS) return;

        const isTsimoa = selectedMode === "tsimoa";

        if (!isTsimoa) {
          const merged = { ...defaultUnlockedVibes, ...unlockedVibes };
          if (!merged[selectedVibe]) {
            set({ currentScreen: "packs" });
            return;
          }
        }

        // Dynamic import — lightweight, no card_content pulled in at top level
        const { loadDeckInstant, enrichDeckInBackground, getCachedServerCards, initPlayerData } =
          await import("@/lib/deckLoader");
        const { passes, playerStats } = initPlayerData(players);
        const params = { mode: selectedMode, vibe: selectedVibe, players };

        // STEP 1: Build deck LOCAL instantly
        let deck = await loadDeckInstant(params);

        // Bonus: merge with cached server cards from previous sessions
        const cachedCards = getCachedServerCards(selectedMode, selectedVibe);
        if (cachedCards.length > 0) {
          const { deduplicateShuffle } = await import("@/lib/shuffleUtils");
          deck = deduplicateShuffle([...deck, ...cachedCards]);
        }

        if (deck.length === 0) {
          console.error("No cards available for", selectedMode, selectedVibe);
          set({ currentScreen: "vibe" });
          return;
        }

        // STEP 2: Show game IMMEDIATELY
        set({
          deck,
          currentPlayerIndex: 0,
          currentCardIndex: 0,
          stats: { cardsPlayed: 0, refusals: 0, quizScore: 0, playerStats },
          passesRemaining: passes,
          currentScreen: "game",
        });

        // STEP 3: Enrich in background for future sessions (NON-BLOCKING)
        enrichDeckInBackground(params);
      },

      nextCard: (action, wasCorrect) => {
        const { currentCardIndex, currentPlayerIndex, players, deck, stats, passesRemaining } = get();
        if (!players.length || !deck.length) return;

        const currentPlayer = players[currentPlayerIndex]?.name;
        if (!currentPlayer) return;

        const newStats: GameStats = {
          cardsPlayed: stats.cardsPlayed,
          refusals: stats.refusals,
          quizScore: stats.quizScore ?? 0,
          playerStats: { ...stats.playerStats },
        };
        const newPasses = { ...passesRemaining };
        const currentCard = deck[currentCardIndex];

        if (action === "done") {
          newStats.cardsPlayed += 1;
          newStats.playerStats[currentPlayer] = {
            played: (newStats.playerStats[currentPlayer]?.played || 0) + 1,
            refused: newStats.playerStats[currentPlayer]?.refused || 0,
          };
          if (currentCard?.card_type === "quiz" && wasCorrect === true) {
            newStats.quizScore += 1;
          }
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
          stats: { cardsPlayed: 0, refusals: 0, quizScore: 0, playerStats: {} },
          passesRemaining: {},
          unlockedVibes: get().unlockedVibes,
        });
      },

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setSoundVolume: (vol) => set({ soundVolume: vol }),
      toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
      setPendingTransaction: (id) => set({ pendingTransactionId: id }),
      setQuickChallengeDuration: (d) => set({ quickChallengeDuration: d }),
    }),
    {
      name: "malaky-store",
      partialize: (state) => ({
        unlockedVibes: state.unlockedVibes,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        vibrationEnabled: state.vibrationEnabled,
        pendingTransactionId: state.pendingTransactionId,
        quickChallengeDuration: state.quickChallengeDuration,
        players: state.players,
        selectedMode: state.selectedMode,
        selectedVibe: state.selectedVibe,
        currentScreen: state.currentScreen,
        currentCardIndex: state.currentCardIndex,
        currentPlayerIndex: state.currentPlayerIndex,
        stats: state.stats,
        passesRemaining: state.passesRemaining,
        deck: state.deck,
      }),
    }
  )
);
