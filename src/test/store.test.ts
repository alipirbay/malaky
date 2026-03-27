import { describe, it, expect, beforeEach, vi } from "vitest";
import { GAME_LIMITS } from "@/data/constants";
import { initPlayerData } from "@/lib/deckLoader";
import { hashToScreen, isHashNavigable } from "@/lib/hashUtils";
import { fillCardTemplate } from "@/lib/cardUtils";
import { deduplicateShuffle } from "@/lib/shuffleUtils";
import { getSeenCardIds, markCardsSeen, clearSeenCards } from "@/hooks/useSeenCards";
import { getMood, DIFFICULTY_MOOD_MAP } from "@/lib/ambientMoods";
import { generateDuelQuestions, computeDuelResult } from "@/lib/quizDuel";
import type { GameCard } from "@/data/types";

const makeCard = (text: string, id = text): GameCard => ({
  id, mode: "truth_dare", vibe: "soft", lang: "fr",
  card_type: "truth", text, requires_prop: "none", player_min: 2, player_max: 12,
});

describe("GAME_LIMITS", () => {
  it("has expected values", () => {
    expect(GAME_LIMITS.MIN_PLAYERS).toBe(2);
    expect(GAME_LIMITS.MAX_PLAYERS).toBe(12);
    expect(GAME_LIMITS.CARDS_PER_GAME).toBe(20);
  });
});

describe("initPlayerData", () => {
  it("creates passes and stats for all players", () => {
    const players = [{ name: "Alice", color: "0 0% 0%" }, { name: "Bob", color: "0 0% 0%" }];
    const { passes, playerStats } = initPlayerData(players);
    expect(Object.keys(passes)).toHaveLength(2);
    expect(passes["Alice"]).toBe(GAME_LIMITS.MAX_PASSES_PER_PLAYER);
    expect(playerStats["Alice"]).toEqual({ played: 0, refused: 0 });
  });

  it("handles empty players array", () => {
    const { passes, playerStats } = initPlayerData([]);
    expect(Object.keys(passes)).toHaveLength(0);
    expect(Object.keys(playerStats)).toHaveLength(0);
  });
});

describe("hashToScreen", () => {
  it("maps valid hash to screen name", () => {
    expect(hashToScreen("players")).toBe("players");
    expect(hashToScreen("mode")).toBe("mode");
    expect(hashToScreen("vibe")).toBe("vibe");
    expect(hashToScreen("duel_hub")).toBe("duel_hub");
    expect(hashToScreen("duel_hub")).toBe("duel_hub");
  });

  it("strips # prefix", () => {
    expect(hashToScreen("#players")).toBe("players");
  });

  it("returns null for game/end (non-navigable)", () => {
    expect(hashToScreen("game")).toBeNull();
    expect(hashToScreen("end")).toBeNull();
  });

  it("returns null for non-navigable screens", () => {
    expect(hashToScreen("game")).toBeNull();
    expect(hashToScreen("end")).toBeNull();
  });

  it("guess_rush is navigable", () => {
    expect(hashToScreen("guess_rush")).toBe("guess_rush");
  });
});

describe("isHashNavigable", () => {
  it("returns true for navigable screens", () => {
    expect(isHashNavigable("home")).toBe(true);
    expect(isHashNavigable("duel_hub")).toBe(true);
  });

  it("returns false for non-navigable screens", () => {
    expect(isHashNavigable("game")).toBe(false);
    expect(isHashNavigable("end")).toBe(false);
  });
});

describe("fillCardTemplate", () => {
  const allPlayers = ["Alice", "Bob", "Charlie"];

  it("replaces {player} with current player", () => {
    expect(fillCardTemplate("{player}, dis la vérité", "Bob", allPlayers)).toBe("Bob, dis la vérité");
  });

  it("player2 is deterministic for same cardIndex", () => {
    const r1 = fillCardTemplate("{player2}", "Alice", allPlayers, 5);
    const r2 = fillCardTemplate("{player2}", "Alice", allPlayers, 5);
    expect(r1).toBe(r2);
    expect(r1).not.toBe("Alice");
  });
});

describe("deduplicateShuffle", () => {
  it("removes exact text duplicates", () => {
    const cards = [makeCard("Hello", "1"), makeCard("Hello", "2"), makeCard("World", "3")];
    const result = deduplicateShuffle(cards);
    expect(result).toHaveLength(2);
  });

  it("preserves all unique cards", () => {
    const cards = Array.from({ length: 10 }, (_, i) => makeCard(`Card ${i}`, `${i}`));
    const result = deduplicateShuffle(cards);
    expect(result).toHaveLength(10);
  });
});

describe("seenCards", () => {
  beforeEach(() => clearSeenCards());

  it("marks and retrieves seen cards", () => {
    markCardsSeen(["a", "b", "c"]);
    expect(getSeenCardIds()).toContain("a");
  });

  it("clears seen cards", () => {
    markCardsSeen(["a", "b"]);
    clearSeenCards();
    expect(getSeenCardIds()).toEqual([]);
  });
});

describe("ambientMoods", () => {
  it("resolves known vibes", () => {
    const mood = getMood("soft");
    expect(mood.tempo).toBe(70);
  });

  it("mada has drums and salegy pattern", () => {
    const mood = getMood("mada");
    expect(mood.hasDrums).toBe(true);
    expect(mood.tempo).toBe(125);
  });
});

// ─── Quiz Duel Tests ───

describe("generateDuelQuestions", () => {
  it("generates 10 questions by default", () => {
    const questions = generateDuelQuestions("facile", "test-seed");
    expect(questions).toHaveLength(10);
  });

  it("each question has 4 options", () => {
    const questions = generateDuelQuestions("facile", "test-seed");
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer);
    }
  });

  it("is deterministic — same seed gives same questions", () => {
    const q1 = generateDuelQuestions("facile", "same-seed-123");
    const q2 = generateDuelQuestions("facile", "same-seed-123");
    expect(q1.map(q => q.question)).toEqual(q2.map(q => q.question));
    expect(q1.map(q => q.options)).toEqual(q2.map(q => q.options));
  });

  it("different seeds give different question order", () => {
    const q1 = generateDuelQuestions("facile", "seed-a");
    const q2 = generateDuelQuestions("facile", "seed-b");
    const same = q1.every((q, i) => q.question === q2[i].question);
    expect(same).toBe(false);
  });

  it("distractors are not duplicates of correct answer", () => {
    const questions = generateDuelQuestions("facile", "distractor-test");
    for (const q of questions) {
      const dups = q.options.filter(o => o === q.correctAnswer);
      expect(dups).toHaveLength(1); // only the correct answer itself
    }
  });
});

describe("computeDuelResult", () => {
  it("higher score wins", () => {
    expect(computeDuelResult(
      { score: 8, timeMs: 60000, playerName: "A" },
      { score: 5, timeMs: 30000, playerName: "B" }
    )).toBe("win");
  });

  it("lower score loses", () => {
    expect(computeDuelResult(
      { score: 3, timeMs: 30000, playerName: "A" },
      { score: 7, timeMs: 60000, playerName: "B" }
    )).toBe("lose");
  });

  it("same score — faster time wins", () => {
    expect(computeDuelResult(
      { score: 6, timeMs: 30000, playerName: "A" },
      { score: 6, timeMs: 45000, playerName: "B" }
    )).toBe("win");
  });

  it("exact same score and time = draw", () => {
    expect(computeDuelResult(
      { score: 6, timeMs: 30000, playerName: "A" },
      { score: 6, timeMs: 30000, playerName: "B" }
    )).toBe("draw");
  });
});

// ─── Mode removal verification ───

describe("quick_challenge removal", () => {
  it("quick_challenge is not in GameMode types or config", async () => {
    const { GAME_MODES } = await import("@/data/config");
    const modeIds = GAME_MODES.map(m => m.id);
    expect(modeIds).not.toContain("quick_challenge");
  });

  it("guess_rush is present in config", async () => {
    const { GAME_MODES } = await import("@/data/config");
    const modeIds = GAME_MODES.map(m => m.id);
    expect(modeIds).toContain("guess_rush");
  });

  it("has exactly 7 modes", async () => {
    const { GAME_MODES } = await import("@/data/config");
    expect(GAME_MODES).toHaveLength(7);
  });
});

// ─── Store tests ───

describe("gameStore — startGame validation", () => {
  let store: typeof import("@/store/gameStore").useGameStore;

  beforeEach(async () => {
    store = (await import("@/store/gameStore")).useGameStore;
    store.getState().resetGame();
  });

  it("refuses to start with fewer than MIN_PLAYERS for party modes", async () => {
    store.getState().addPlayer("Solo");
    store.getState().setMode("truth_dare");
    store.getState().setVibe("soft");
    await store.getState().startGame();
    expect(store.getState().currentScreen).toBe("home");
  });

  it("starts game successfully with valid setup", async () => {
    store.getState().addPlayer("A");
    store.getState().addPlayer("B");
    store.getState().setMode("truth_dare");
    store.getState().setVibe("soft");
    await store.getState().startGame();
    expect(store.getState().currentScreen).toBe("game");
    expect(store.getState().deck.length).toBeGreaterThan(0);
  });
});
