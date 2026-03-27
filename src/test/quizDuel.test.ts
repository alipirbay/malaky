import { describe, it, expect } from "vitest";
import { computeDuelResult, generateInviteCode, generateDuelQuestions } from "@/lib/quizDuel";
import { GAME_LIMITS } from "@/data/constants";

describe("Quiz Duel utilities", () => {
  it("computeDuelResult returns win when score higher", () => {
    expect(computeDuelResult({ score: 8, timeMs: 5000, playerName: "A" }, { score: 5, timeMs: 4000, playerName: "B" })).toBe("win");
  });

  it("computeDuelResult uses time as tiebreaker", () => {
    expect(computeDuelResult({ score: 7, timeMs: 3000, playerName: "A" }, { score: 7, timeMs: 5000, playerName: "B" })).toBe("win");
    expect(computeDuelResult({ score: 7, timeMs: 6000, playerName: "A" }, { score: 7, timeMs: 5000, playerName: "B" })).toBe("lose");
  });

  it("computeDuelResult returns draw on same score and time", () => {
    expect(computeDuelResult({ score: 5, timeMs: 3000, playerName: "A" }, { score: 5, timeMs: 3000, playerName: "B" })).toBe("draw");
  });

  it("generateInviteCode returns 6-char string", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
    expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
  });

  it("generateDuelQuestions is deterministic for same seed", () => {
    const q1 = generateDuelQuestions("facile", "test-seed-123");
    const q2 = generateDuelQuestions("facile", "test-seed-123");
    expect(q1.map(q => q.question)).toEqual(q2.map(q => q.question));
    // Options order must also match (same seed)
    expect(q1.map(q => q.options)).toEqual(q2.map(q => q.options));
  });

  it("generateDuelQuestions produces 4 options per question", () => {
    const questions = generateDuelQuestions("facile", "seed-abc");
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer);
    }
  });

  it("DUEL_TIME_PER_QUESTION is 15 seconds", () => {
    expect(GAME_LIMITS.DUEL_TIME_PER_QUESTION).toBe(15);
  });

  it("HEADS_UP_ROUND_SECONDS is 30 seconds", () => {
    expect(GAME_LIMITS.HEADS_UP_ROUND_SECONDS).toBe(30);
  });
});
