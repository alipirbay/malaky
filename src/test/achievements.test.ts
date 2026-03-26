import { describe, it, expect, beforeEach } from "vitest";
import { checkNewAchievements, getUnlockedAchievements } from "@/lib/achievements";
import type { GameSession } from "@/data/types";

beforeEach(() => {
  localStorage.clear();
});

const makeSession = (overrides: Partial<GameSession> = {}): GameSession => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString(),
  players: ["Alice", "Bob"],
  mode: "truth_dare",
  vibe: "soft",
  cardsPlayed: 10,
  refusals: 2,
  score: 8,
  bravest: "Alice",
  ...overrides,
});

describe("checkNewAchievements", () => {
  it("returns first_game after 1 session", () => {
    const session = makeSession();
    const result = checkNewAchievements([session], session);
    const ids = result.map(a => a.id);
    expect(ids).toContain("first_game");
  });

  it("does not return already unlocked achievements", () => {
    const session = makeSession();
    checkNewAchievements([session], session); // unlocks first_game
    const result = checkNewAchievements([session, makeSession()], makeSession());
    const ids = result.map(a => a.id);
    expect(ids).not.toContain("first_game");
  });

  it("triggers no_refuse when refusals === 0", () => {
    const session = makeSession({ refusals: 0 });
    const result = checkNewAchievements([session], session);
    const ids = result.map(a => a.id);
    expect(ids).toContain("no_refuse");
  });

  it("does not trigger no_refuse when refusals > 0", () => {
    const session = makeSession({ refusals: 3 });
    const result = checkNewAchievements([session], session);
    const ids = result.map(a => a.id);
    expect(ids).not.toContain("no_refuse");
  });

  it("triggers high_score when score >= 15", () => {
    const session = makeSession({ score: 18 });
    const result = checkNewAchievements([session], session);
    const ids = result.map(a => a.id);
    expect(ids).toContain("high_score");
  });

  it("persists unlocked achievements", () => {
    const session = makeSession();
    checkNewAchievements([session], session);
    const unlocked = getUnlockedAchievements();
    expect(unlocked).toContain("first_game");
  });
});
