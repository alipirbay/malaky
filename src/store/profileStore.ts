import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AVATAR_OPTIONS = [
  "🦎", "🦁", "🐊", "🦅", "🐢", "🦋",
  "😎", "🤠", "👑", "🎭", "🥷", "🧙",
  "🔥", "💀", "🎯", "⚡", "🌟", "💎",
  "🌴", "🌺", "🦜", "🐙", "🌊", "🏝️",
  "🍚", "🥥", "🎵", "🎲", "🏆", "👻",
] as const;

export const TITLE_UNLOCKS = [
  { id: "newbie", title: "Débutant", condition: "games", threshold: 0 },
  { id: "regular", title: "Habitué", condition: "games", threshold: 5 },
  { id: "veteran", title: "Vétéran", condition: "games", threshold: 20 },
  { id: "legend", title: "Légende", condition: "games", threshold: 50 },
  { id: "brave", title: "Intrépide", condition: "cardsPlayed", threshold: 100 },
  { id: "fearless", title: "Sans Peur", condition: "zeroRefusals", threshold: 3 },
  { id: "quizmaster", title: "Maître Quiz", condition: "quizCorrect", threshold: 50 },
  { id: "duelist", title: "Duelliste", condition: "duelsWon", threshold: 5 },
  { id: "social", title: "Rassembleur", condition: "uniquePlayers", threshold: 20 },
  { id: "allrounder", title: "Polyvalent", condition: "modesPlayed", threshold: 7 },
] as const;

interface ProfileState {
  username: string;
  avatar: string;
  avatarUrl: string | null; // URL of uploaded photo
  selectedTitle: string;
  totalGamesPlayed: number;
  totalCardsPlayed: number;
  totalRefusals: number;
  totalQuizCorrect: number;
  totalDuelsPlayed: number;
  totalDuelsWon: number;
  uniquePlayersPlayed: string[];
  modesPlayed: string[];
  gamesWithZeroRefusals: number;
  joinedAt: string;
  xp: number;
  setUsername: (name: string) => void;
  setAvatar: (emoji: string) => void;
  setAvatarUrl: (url: string | null) => void;
  setTitle: (titleId: string) => void;
  addGameStats: (stats: {
    cardsPlayed: number;
    refusals: number;
    quizCorrect: number;
    mode: string;
    players: string[];
  }) => void;
  addDuelResult: (won: boolean) => void;
  getLevel: () => number;
  getUnlockedTitles: () => typeof TITLE_UNLOCKS[number][];
}

function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  return Math.floor(Math.log(xp / 50) / Math.log(1.5)) + 1;
}

function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * Math.pow(1.5, level - 1));
}

export function getXpProgress(xp: number): { level: number; current: number; needed: number; percent: number } {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const current = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return { level, current, needed, percent: Math.min(100, Math.round((current / needed) * 100)) };
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      username: "",
      avatar: "😎",
      avatarUrl: null,
      selectedTitle: "newbie",
      totalGamesPlayed: 0,
      totalCardsPlayed: 0,
      totalRefusals: 0,
      totalQuizCorrect: 0,
      totalDuelsPlayed: 0,
      totalDuelsWon: 0,
      uniquePlayersPlayed: [],
      modesPlayed: [],
      gamesWithZeroRefusals: 0,
      joinedAt: new Date().toISOString(),
      xp: 0,

      setUsername: (name) => set({ username: name.trim().slice(0, 20) }),
      setAvatar: (emoji) => set({ avatar: emoji, avatarUrl: null }),
      setAvatarUrl: (url) => set({ avatarUrl: url }),
      setTitle: (titleId) => set({ selectedTitle: titleId }),

      addGameStats: (stats) => {
        const state = get();
        const newPlayers = [...new Set([...state.uniquePlayersPlayed, ...stats.players])];
        const newModes = [...new Set([...state.modesPlayed, stats.mode])];
        const zeroRefusals = stats.refusals === 0 ? state.gamesWithZeroRefusals + 1 : state.gamesWithZeroRefusals;

        let xpGained = 10;
        xpGained += stats.cardsPlayed * 2;
        xpGained += stats.quizCorrect * 5;
        if (stats.refusals === 0) xpGained += 20;
        if (stats.players.length >= 6) xpGained += 15;

        set({
          totalGamesPlayed: state.totalGamesPlayed + 1,
          totalCardsPlayed: state.totalCardsPlayed + stats.cardsPlayed,
          totalRefusals: state.totalRefusals + stats.refusals,
          totalQuizCorrect: state.totalQuizCorrect + stats.quizCorrect,
          uniquePlayersPlayed: newPlayers,
          modesPlayed: newModes,
          gamesWithZeroRefusals: zeroRefusals,
          xp: state.xp + xpGained,
        });
      },

      addDuelResult: (won) => {
        const state = get();
        const xpGained = won ? 30 : 10;
        set({
          totalDuelsPlayed: state.totalDuelsPlayed + 1,
          totalDuelsWon: won ? state.totalDuelsWon + 1 : state.totalDuelsWon,
          xp: state.xp + xpGained,
        });
      },

      getLevel: () => calculateLevel(get().xp),

      getUnlockedTitles: () => {
        const state = get();
        return TITLE_UNLOCKS.filter((t) => {
          switch (t.condition) {
            case "games": return state.totalGamesPlayed >= t.threshold;
            case "cardsPlayed": return state.totalCardsPlayed >= t.threshold;
            case "zeroRefusals": return state.gamesWithZeroRefusals >= t.threshold;
            case "quizCorrect": return state.totalQuizCorrect >= t.threshold;
            case "duelsWon": return state.totalDuelsWon >= t.threshold;
            case "uniquePlayers": return state.uniquePlayersPlayed.length >= t.threshold;
            case "modesPlayed": return state.modesPlayed.length >= t.threshold;
            default: return false;
          }
        });
      },
    }),
    { name: "malaky-profile" }
  )
);
