import { describe, it, expect } from "vitest";
import { fillCardTemplate } from "@/lib/cardUtils";

describe("fillCardTemplate", () => {
  const allPlayers = ["Alice", "Bob", "Charlie"];

  it("replaces {player} with the current player", () => {
    const result = fillCardTemplate("{player}, dis la vérité", "Bob", allPlayers);
    expect(result).toBe("Bob, dis la vérité");
  });

  it("replaces {player2} with a different player than the current one", () => {
    const result = fillCardTemplate(
      "Entre {player} et {player2}, qui est le plus drôle ?",
      "Alice",
      allPlayers,
      0
    );
    expect(result).toContain("Alice");
    // player2 should NOT be Alice
    expect(result).not.toContain("et Alice,");
  });

  it("does NOT always inject the first player", () => {
    const result1 = fillCardTemplate("{player}, avoue !", "Alice", allPlayers);
    const result2 = fillCardTemplate("{player}, avoue !", "Bob", allPlayers);
    const result3 = fillCardTemplate("{player}, avoue !", "Charlie", allPlayers);

    expect(result1).toBe("Alice, avoue !");
    expect(result2).toBe("Bob, avoue !");
    expect(result3).toBe("Charlie, avoue !");
  });

  it("handles templates with no placeholders", () => {
    const result = fillCardTemplate("Je n'ai jamais menti", "Alice", allPlayers);
    expect(result).toBe("Je n'ai jamais menti");
  });

  it("handles empty template", () => {
    expect(fillCardTemplate("", "Alice", allPlayers)).toBe("");
  });

  it("falls back to currentPlayer when only one player", () => {
    const result = fillCardTemplate("{player} vs {player2}", "Alice", ["Alice"]);
    expect(result).toBe("Alice vs Alice");
  });
});

describe("player2 stability across rerenders", () => {
  it("returns the same player2 for the same cardIndex", () => {
    const players = ["Rivo", "Haja", "Fara"];
    const result1 = fillCardTemplate("{player2}", "Rivo", players, 5);
    const result2 = fillCardTemplate("{player2}", "Rivo", players, 5);
    const result3 = fillCardTemplate("{player2}", "Rivo", players, 5);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    // Must not be the current player
    expect(result1).not.toBe("Rivo");
  });

  it("selects different player2 for different cardIndexes", () => {
    const players = ["A", "B", "C", "D", "E"];
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(fillCardTemplate("{player2}", "A", players, i));
    }
    // With 4 other players and 20 cards, should see more than 1 unique pick
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("player rotation across multiple cards", () => {
  it("cycles through players correctly over several cards", () => {
    const players = ["Rivo", "Haja", "Fara"];
    const templates = [
      "{player}, avoue !",
      "{player}, fais 10 pompes",
      "{player}, chante",
      "{player}, danse",
      "{player}, imite quelqu'un",
      "{player}, raconte un secret",
    ];

    const results = templates.map((tpl, i) => {
      const currentPlayer = players[i % players.length];
      return fillCardTemplate(tpl, currentPlayer, players, i);
    });

    expect(results[0]).toBe("Rivo, avoue !");
    expect(results[1]).toBe("Haja, fais 10 pompes");
    expect(results[2]).toBe("Fara, chante");
    expect(results[3]).toBe("Rivo, danse");
    expect(results[4]).toBe("Haja, imite quelqu'un");
    expect(results[5]).toBe("Fara, raconte un secret");
  });
});
