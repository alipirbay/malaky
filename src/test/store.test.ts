import { describe, it, expect } from "vitest";
import { GAME_LIMITS } from "@/data/constants";
import { initPlayerData } from "@/lib/deckLoader";

describe("GAME_LIMITS", () => {
  it("has expected values", () => {
    expect(GAME_LIMITS.MIN_PLAYERS).toBe(2);
    expect(GAME_LIMITS.MAX_PLAYERS).toBe(12);
    expect(GAME_LIMITS.CARDS_PER_GAME).toBe(20);
    expect(GAME_LIMITS.MAX_PASSES_PER_PLAYER).toBe(2);
  });
});

describe("initPlayerData", () => {
  it("creates passes and stats for all players", () => {
    const players = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];
    const { passes, playerStats } = initPlayerData(players);

    expect(Object.keys(passes)).toHaveLength(3);
    expect(passes["Alice"]).toBe(GAME_LIMITS.MAX_PASSES_PER_PLAYER);
    expect(passes["Bob"]).toBe(GAME_LIMITS.MAX_PASSES_PER_PLAYER);

    expect(playerStats["Alice"]).toEqual({ played: 0, refused: 0 });
    expect(playerStats["Charlie"]).toEqual({ played: 0, refused: 0 });
  });

  it("handles empty players array", () => {
    const { passes, playerStats } = initPlayerData([]);
    expect(Object.keys(passes)).toHaveLength(0);
    expect(Object.keys(playerStats)).toHaveLength(0);
  });
});
