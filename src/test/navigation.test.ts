import { describe, it, expect } from "vitest";
import { hashToScreen } from "@/lib/hashUtils";

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

  it("returns null for game/end (not directly navigable)", () => {
    expect(hashToScreen("game")).toBeNull();
    expect(hashToScreen("end")).toBeNull();
  });

  it("returns null for unknown screens", () => {
    expect(hashToScreen("unknown")).toBeNull();
    expect(hashToScreen("")).toBeNull();
  });
});
