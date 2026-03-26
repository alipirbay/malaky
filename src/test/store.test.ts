import { describe, it, expect } from "vitest";
import { GAME_LIMITS } from "@/data/constants";
import { initPlayerData } from "@/lib/deckLoader";
import { hashToScreen, isHashNavigable } from "@/lib/hashUtils";
import { fillCardTemplate } from "@/lib/cardUtils";
import { deduplicateShuffle } from "@/lib/shuffleUtils";
import type { GameCard } from "@/data/types";

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

describe("hashToScreen", () => {
  it("maps valid hash to screen name", () => {
    expect(hashToScreen("players")).toBe("players");
    expect(hashToScreen("mode")).toBe("mode");
    expect(hashToScreen("vibe")).toBe("vibe");
    expect(hashToScreen("packs")).toBe("packs");
    expect(hashToScreen("settings")).toBe("settings");
    expect(hashToScreen("home")).toBe("home");
  });

  it("strips # prefix", () => {
    expect(hashToScreen("#players")).toBe("players");
  });

  it("returns null for game/end", () => {
    expect(hashToScreen("game")).toBeNull();
    expect(hashToScreen("end")).toBeNull();
  });

  it("returns null for unknown screens", () => {
    expect(hashToScreen("unknown")).toBeNull();
    expect(hashToScreen("")).toBeNull();
  });
});

describe("isHashNavigable", () => {
  it("returns true for navigable screens", () => {
    expect(isHashNavigable("home")).toBe(true);
    expect(isHashNavigable("players")).toBe(true);
  });

  it("returns false for non-navigable screens", () => {
    expect(isHashNavigable("game")).toBe(false);
    expect(isHashNavigable("end")).toBe(false);
    expect(isHashNavigable("payment_return")).toBe(false);
  });
});

describe("fillCardTemplate", () => {
  const allPlayers = ["Alice", "Bob", "Charlie"];

  it("replaces {player} with the current player", () => {
    expect(fillCardTemplate("{player}, dis la vérité", "Bob", allPlayers)).toBe("Bob, dis la vérité");
  });

  it("handles empty template", () => {
    expect(fillCardTemplate("", "Alice", allPlayers)).toBe("");
  });

  it("player2 is deterministic for same cardIndex", () => {
    const r1 = fillCardTemplate("{player2}", "Alice", allPlayers, 5);
    const r2 = fillCardTemplate("{player2}", "Alice", allPlayers, 5);
    expect(r1).toBe(r2);
    expect(r1).not.toBe("Alice");
  });
});

describe("deduplicateShuffle", () => {
  const makeCard = (text: string, id = text): GameCard => ({
    id,
    mode: "truth_dare",
    vibe: "soft",
    lang: "fr",
    card_type: "truth",
    text,
    requires_prop: "none",
    player_min: 2,
    player_max: 12,
  });

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

  it("handles empty array", () => {
    expect(deduplicateShuffle([])).toHaveLength(0);
  });

  it("handles single card", () => {
    const result = deduplicateShuffle([makeCard("Only")]);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Only");
  });
});
