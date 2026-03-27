import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameMode, Vibe, GameCard, Player } from "@/data/types";
import { GAME_LIMITS } from "@/data/constants";

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
  currentScreen: "home" | "players" | "mode" | "vibe" | "game" | "end" | "packs" | "settings" | "history" | "payment_return" | "duel_hub" | "heads_up";
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
        // Dynamic import to avoid pulling shuffleUtils into main chunk
        import("@/lib/shuffleUtils").then(({ fisherYatesShuffle }) => {
          set((state) => ({ players: fisherYatesShuffle(state.players) }));
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
        if (!selectedMode || !selectedVibe || players.length < 1) return;
        // For party modes, enforce min 2 players
        if (selectedMode !== "quiz_duel" && players.length < GAME_LIMITS.MIN_PLAYERS) return;

        const merged = { ...defaultUnlockedVibes, ...unlockedVibes };
        if (!merged[selectedVibe]) {
          set({ currentScreen: "packs" });
          return;
        }

        // Single barrel import
        const {
          loadDeckInstant, enrichDeckInBackground, getCachedServerCards,
          initPlayerData, deduplicateShuffle, fisherYatesShuffle,
          getSeenCardHashes, markCardsSeen, clearSeenCards,
        } = await import("@/lib/gameInit");
        const { getCardContentHash } = await import("@/lib/cardUtils");
        const { storageGet, storageSet } = await import("@/lib/storage");

        const { passes, playerStats } = initPlayerData(players);
        const params = { mode: selectedMode, vibe: selectedVibe, players };

        // STEP 1: Build full card pool from local data
        let pool = await loadDeckInstant(params);

        // Merge with cached server cards from previous sessions
        const cachedCards = getCachedServerCards(selectedMode, selectedVibe);
        if (cachedCards.length > 0) {
          pool = deduplicateShuffle([...pool, ...cachedCards]);
        }

        if (pool.length === 0) {
          console.error("No cards available for", selectedMode, selectedVibe);
          set({ currentScreen: "vibe" });
          return;
        }

        // STEP 2: Filter out recently seen cards by content hash
        const seenHashes = getSeenCardHashes();
        let unseen = pool.filter(c => !seenHashes.has(getCardContentHash(c.text)));

        if (unseen.length < GAME_LIMITS.CARDS_PER_GAME) {
          // Partial reset: keep 50% most recent hashes
          const existing = storageGet<string[]>("seen-cards", []);
          const halfPoint = Math.floor(existing.length / 2);
          storageSet("seen-cards", existing.slice(halfPoint));
          const refreshedHashes = new Set(existing.slice(halfPoint));
          unseen = pool.filter(c => !refreshedHashes.has(getCardContentHash(c.text)));
          if (unseen.length < GAME_LIMITS.CARDS_PER_GAME) {
            clearSeenCards();
            unseen = pool;
          }
        }

        const shuffledUnseen = fisherYatesShuffle(unseen);
        const deck = shuffledUnseen.slice(0, GAME_LIMITS.CARDS_PER_GAME);

        markCardsSeen(deck.map(c => c.text));

        // STEP 3: Show game IMMEDIATELY
        set({
          deck,
          currentPlayerIndex: 0,
          currentCardIndex: 0,
          stats: { cardsPlayed: 0, refusals: 0, quizScore: 0, playerStats },
          passesRemaining: passes,
          currentScreen: "game",
        });

        // STEP 4: Enrich in background for future sessions (NON-BLOCKING)
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
      }),
    }
  )
);
