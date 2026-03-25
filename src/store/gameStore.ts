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
  facile: true,
  intermediaire: true,
  difficile: false,
  expert: false,
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
        if (players.length >= 12) return;
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
        if (!selectedMode || !selectedVibe || players.length < 2) return;

        const isTsimoa = selectedMode === "tsimoa";

        if (!isTsimoa) {
          const merged = { ...defaultUnlockedVibes, ...unlockedVibes };
          if (!merged[selectedVibe]) {
            set({ currentScreen: "packs" });
            return;
          }
        }

        // Show loading state
        set({ currentScreen: "game", deck: [], currentCardIndex: 0, currentPlayerIndex: 0 });

        const passes: Record<string, number> = {};
        const playerStats: Record<string, { played: number; refused: number }> = {};
        players.forEach((player) => {
          passes[player.name] = 2;
          playerStats[player.name] = { played: 0, refused: 0 };
        });

        try {
          const { getSeenCardIds, markCardsSeen } = await import("@/hooks/useSeenCards");
          const seen_ids = getSeenCardIds();

          const { supabase } = await import("@/integrations/supabase/client");
          const { data, error } = await supabase.functions.invoke("get-cards", {
            body: {
              mode: selectedMode,
              vibe: selectedVibe,
              players: players.map(p => p.name),
              seen_ids,
              count: 150,
            },
          });

          if (error || !data?.cards?.length) throw new Error("No cards returned");

          const cards: GameCard[] = data.cards.map((c: { id?: string; lang?: string; card_type: string; template: string; answer?: string }, i: number) => ({
            id: c.id ?? `${selectedMode}-${selectedVibe}-${i}`,
            mode: selectedMode,
            vibe: selectedVibe,
            lang: (c.lang ?? "fr") as "fr" | "mg",
            card_type: c.card_type as GameCard["card_type"],
            text: c.template, // Keep raw template — personalized at render time
            answer: c.answer ?? undefined,
            requires_prop: "none" as const,
            player_min: 2,
            player_max: 12,
          }));

          markCardsSeen(data.cards.map((c: { id?: string }) => c.id).filter((id): id is string => Boolean(id)));

          set({
            deck: deduplicateShuffle(cards),
            currentPlayerIndex: 0,
            currentCardIndex: 0,
            stats: { cardsPlayed: 0, refusals: 0, quizScore: 0, playerStats },
            passesRemaining: passes,
            currentScreen: "game",
          });

        } catch (err) {
          console.error("get-cards failed, falling back to local:", err);

          const localCards = deduplicateShuffle([...getFilteredCards(selectedMode, selectedVibe, players.length)]);

          set({
            deck: localCards,
            currentPlayerIndex: 0,
            currentCardIndex: 0,
            stats: { cardsPlayed: 0, refusals: 0, quizScore: 0, playerStats },
            passesRemaining: passes,
            currentScreen: "game",
          });
        }
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
          // Increment quiz score for quiz cards
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
      }),
    }
  )
);
