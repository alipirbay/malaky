import { describe, it, expect } from "vitest";
import { GAME_MODES } from "@/data/config";

describe("Game modes consistency", () => {
  it("should not include quick_challenge", () => {
    const ids = GAME_MODES.map(m => m.id);
    expect(ids).not.toContain("quick_challenge");
  });

  it("should have exactly 7 modes", () => {
    expect(GAME_MODES.length).toBe(7);
  });

  it("all modes should have required fields", () => {
    for (const mode of GAME_MODES) {
      expect(mode.id).toBeTruthy();
      expect(mode.name).toBeTruthy();
      expect(mode.emoji).toBeTruthy();
      expect(typeof mode.minPlayers).toBe("number");
    }
  });
});
