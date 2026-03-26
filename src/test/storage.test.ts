import { describe, it, expect, beforeEach } from "vitest";
import { storageGet, storageSet, storageRemove, storageKeys, getStorageUsage } from "@/lib/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("storageGet", () => {
  it("returns fallback when key does not exist", () => {
    expect(storageGet("nonexistent", 42)).toBe(42);
    expect(storageGet("nope", [])).toEqual([]);
  });

  it("round-trips with storageSet", () => {
    storageSet("test-key", { a: 1, b: "hello" });
    expect(storageGet("test-key", null)).toEqual({ a: 1, b: "hello" });
  });

  it("returns fallback for corrupted data", () => {
    localStorage.setItem("malaky-bad", "not json{{{");
    expect(storageGet("bad", "default")).toBe("default");
  });
});

describe("storageRemove", () => {
  it("removes a key", () => {
    storageSet("to-remove", true);
    storageRemove("to-remove");
    expect(storageGet("to-remove", false)).toBe(false);
  });
});

describe("storageKeys", () => {
  it("lists keys with prefix", () => {
    storageSet("pack-hot", []);
    storageSet("pack-fun", []);
    storageSet("other", true);
    const keys = storageKeys("pack-");
    expect(keys).toContain("pack-hot");
    expect(keys).toContain("pack-fun");
    expect(keys).not.toContain("other");
  });
});

describe("getStorageUsage", () => {
  it("returns usage info", () => {
    storageSet("test", "x".repeat(100));
    const usage = getStorageUsage();
    expect(usage.used).toMatch(/MB$/);
    expect(typeof usage.percent).toBe("number");
  });
});
