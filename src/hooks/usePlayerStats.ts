import { useState, useCallback } from "react";
import { storageGet, storageSet, storageRemove } from "@/lib/storage";
import type { GameSession } from "@/data/types";

const STORAGE_KEY = "sessions";
const MAX_SESSIONS = 20;

function loadSessions(): GameSession[] {
  return storageGet<GameSession[]>(STORAGE_KEY, []);
}

function saveSessions(sessions: GameSession[]) {
  storageSet(STORAGE_KEY, sessions);
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
    storageRemove(STORAGE_KEY);
    setSessions([]);
  }, []);

  const getBestSession = useCallback((): GameSession | null => {
    const all = loadSessions();
    if (!all.length) return null;
    return all.reduce((best, s) => s.score > best.score ? s : best, all[0]);
  }, []);

  return { sessions, recordGame, clearStats, getBestSession };
}
