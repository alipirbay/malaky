import { describe, it, expect } from "vitest";
import { GAME_MODES, DIFFICULTIES } from "@/data/config";
import { GAME_LIMITS } from "@/data/constants";

describe("Game modes consistency", () => {
  it("should not include quick_challenge", () => {
    const ids = GAME_MODES.map(m => m.id);
    expect(ids).not.toContain("quick_challenge");
  });

  it("should not include tsimoa", () => {
    const ids = GAME_MODES.map(m => m.id);
    expect(ids).not.toContain("tsimoa");
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

  it("contains all expected modes", () => {
    const ids = GAME_MODES.map(m => m.id);
    expect(ids).toContain("truth_dare");
    expect(ids).toContain("never_have_i_ever");
    expect(ids).toContain("most_likely");
    expect(ids).toContain("would_you_rather");
    expect(ids).toContain("culture_generale");
    expect(ids).toContain("quiz_duel");
    expect(ids).toContain("guess_rush");
  });

  it("Tilt Up requires minPlayers 2", () => {
    const tiltUp = GAME_MODES.find(m => m.id === "guess_rush");
    expect(tiltUp).toBeDefined();
    expect(tiltUp!.minPlayers).toBe(2);
  });

  it("quiz_duel requires minPlayers 1", () => {
    const duel = GAME_MODES.find(m => m.id === "quiz_duel");
    expect(duel).toBeDefined();
    expect(duel!.minPlayers).toBe(1);
  });
});

describe("Difficulties", () => {
  it("has 4 difficulties", () => {
    expect(DIFFICULTIES).toHaveLength(4);
  });

  it("facile and intermediaire are free, others are paid", () => {
    const freeOnes = DIFFICULTIES.filter(d => d.free);
    expect(freeOnes).toHaveLength(2);
    expect(freeOnes.map(d => d.id)).toEqual(expect.arrayContaining(["facile", "intermediaire"]));
  });
});

describe("Timer constants", () => {
  it("duel timer is 15 seconds", () => {
    expect(GAME_LIMITS.DUEL_TIME_PER_QUESTION).toBe(15);
  });

  it("heads up round is 30 seconds", () => {
    expect(GAME_LIMITS.HEADS_UP_ROUND_SECONDS).toBe(30);
  });
});

describe("Tilt Up score replay", () => {
  it("replay replaces score instead of stacking", async () => {
    const { useHeadsUpStore } = await import("@/store/headsUpStore");
    const store = useHeadsUpStore.getState();

    store.initGame([
      { name: "Alice", color: "0 0% 50%" },
      { name: "Bob", color: "120 50% 50%" },
    ]);

    store.selectCustomDeck("Test", ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"]);
    store.startRound();
    store.markFound();
    store.markFound();
    useHeadsUpStore.setState({ roundRunning: false, roundComplete: true });
    store.endRound();

    let state = useHeadsUpStore.getState();
    expect(state.scores["Alice"]).toBe(2);

    // Replay — should replace, not stack
    store.replayCurrentPlayer();
    store.markFound();
    store.markFound();
    store.markFound();
    useHeadsUpStore.setState({ roundRunning: false, roundComplete: true });
    store.endRound();

    state = useHeadsUpStore.getState();
    expect(state.scores["Alice"]).toBe(3);
    expect(state.roundResults.filter(r => r.playerName === "Alice")).toHaveLength(1);
  });
});

describe("Tilt Up route guards", () => {
  it("Tilt Up mode requires minPlayers >= 2", () => {
    const tiltUp = GAME_MODES.find(m => m.id === "guess_rush");
    expect(tiltUp!.minPlayers).toBeGreaterThanOrEqual(2);
  });
});

describe("Difficulty gating", () => {
  it("difficile and expert are paid (not free)", () => {
    const paid = DIFFICULTIES.filter(d => !d.free);
    expect(paid.map(d => d.id)).toEqual(expect.arrayContaining(["difficile", "expert"]));
  });

  it("facile and intermediaire are free", () => {
    const free = DIFFICULTIES.filter(d => d.free);
    expect(free.map(d => d.id)).toEqual(expect.arrayContaining(["facile", "intermediaire"]));
  });
});
