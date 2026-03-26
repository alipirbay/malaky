import { storageGet, storageSet } from "./storage";
import type { GameSession } from "@/data/types";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (sessions: GameSession[], currentSession?: GameSession) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_game",
    name: "Première partie",
    description: "Joue ta première partie",
    emoji: "🎮",
    condition: (sessions) => sessions.length >= 1,
  },
  {
    id: "ten_games",
    name: "Habitué",
    description: "Joue 10 parties",
    emoji: "🔟",
    condition: (sessions) => sessions.length >= 10,
  },
  {
    id: "no_refuse",
    name: "Sans peur",
    description: "Termine une partie avec 0 refus",
    emoji: "💪",
    condition: (_, current) => current?.refusals === 0,
  },
  {
    id: "full_squad",
    name: "Full squad",
    description: "Joue avec 8 joueurs ou plus",
    emoji: "👥",
    condition: (_, current) => (current?.players.length ?? 0) >= 8,
  },
  {
    id: "perfect_quiz",
    name: "Einstein",
    description: "20/20 en Culture Générale",
    emoji: "🧠",
    condition: (_, current) =>
      current?.mode === "culture_generale" && (current?.quizScore ?? 0) >= 20,
  },
  {
    id: "night_owl",
    name: "Noctambule",
    description: "Joue après minuit",
    emoji: "🦉",
    condition: () => new Date().getHours() < 5,
  },
  {
    id: "all_modes",
    name: "Touche-à-tout",
    description: "Joue tous les modes",
    emoji: "🌈",
    condition: (sessions) => {
      const modes = new Set(sessions.map((s) => s.mode));
      return modes.size >= 5;
    },
  },
  {
    id: "high_score",
    name: "Record battu",
    description: "Atteins un score de 15+",
    emoji: "🏆",
    condition: (_, current) => (current?.score ?? 0) >= 15,
  },
];

export function getUnlockedAchievements(): string[] {
  return storageGet<string[]>("achievements", []);
}

export function checkNewAchievements(
  sessions: GameSession[],
  currentSession?: GameSession
): Achievement[] {
  const unlocked = new Set(getUnlockedAchievements());
  const newOnes: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) continue;
    if (achievement.condition(sessions, currentSession)) {
      newOnes.push(achievement);
      unlocked.add(achievement.id);
    }
  }

  if (newOnes.length > 0) {
    storageSet("achievements", Array.from(unlocked));
  }

  return newOnes;
}
