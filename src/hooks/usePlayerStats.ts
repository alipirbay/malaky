import { useState, useCallback } from "react";
import type { PlayerAllTimeStats } from "@/data/types";

const STORAGE_KEY = "malaky-player-stats";

function loadStats(): Record<string, PlayerAllTimeStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, PlayerAllTimeStats>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function usePlayerStats() {
  const [allStats, setAllStats] = useState<Record<string, PlayerAllTimeStats>>(loadStats);

  const recordGame = useCallback((
    playerStats: Record<string, { played: number; refused: number }>
  ) => {
    const current = loadStats();
    Object.entries(playerStats).forEach(([name, s]) => {
      const existing = current[name] ?? { name, totalPlayed: 0, totalRefused: 0, totalGames: 0, lastPlayed: "" };
      current[name] = {
        name,
        totalPlayed: existing.totalPlayed + s.played,
        totalRefused: existing.totalRefused + s.refused,
        totalGames: existing.totalGames + 1,
        lastPlayed: new Date().toISOString(),
      };
    });
    saveStats(current);
    setAllStats({ ...current });
  }, []);

  const getTopPlayers = useCallback((): PlayerAllTimeStats[] => {
    return Object.values(allStats)
      .sort((a, b) => b.totalPlayed - a.totalPlayed)
      .slice(0, 10);
  }, [allStats]);

  const clearStats = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAllStats({});
  }, []);

  return { allStats, recordGame, getTopPlayers, clearStats };
}
