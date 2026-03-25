import { useState, useCallback } from "react";
import type { GameSession } from "@/data/types";

const STORAGE_KEY = "malaky-sessions";
const MAX_SESSIONS = 20;

function loadSessions(): GameSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: GameSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

export function usePlayerStats() {
  const [sessions, setSessions] = useState<GameSession[]>(loadSessions);

  const recordGame = useCallback((session: Omit<GameSession, "id" | "date">): GameSession => {
    const newSession: GameSession = {
      ...session,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    const updated = [newSession, ...loadSessions()].slice(0, MAX_SESSIONS);
    saveSessions(updated);
    setSessions(updated);
    return newSession;
  }, []);

  const clearStats = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessions([]);
  }, []);

  const getBestSession = useCallback((): GameSession | null => {
    const all = loadSessions();
    if (!all.length) return null;
    return all.reduce((best, s) => s.score > best.score ? s : best, all[0]);
  }, []);

  return { sessions, recordGame, clearStats, getBestSession };
}
