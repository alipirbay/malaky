import { describe, it, expect } from "vitest";
import {
  getMadagascarDateString,
  getMsUntilMadagascarMidnight,
  formatCountdown,
} from "@/lib/dateUtils";

describe("getMadagascarDateString", () => {
  it("returns a YYYY-MM-DD string", () => {
    const result = getMadagascarDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses Madagascar timezone (UTC+3)", () => {
    // At 2026-01-15 22:00 UTC → 2026-01-16 01:00 in Madagascar
    const lateUtc = new Date("2026-01-15T22:00:00Z");
    const result = getMadagascarDateString(lateUtc);
    expect(result).toBe("2026-01-16");
  });

  it("same UTC day stays same date when still before midnight Madagascar", () => {
    // At 2026-01-15 10:00 UTC → 2026-01-15 13:00 in Madagascar
    const earlyUtc = new Date("2026-01-15T10:00:00Z");
    const result = getMadagascarDateString(earlyUtc);
    expect(result).toBe("2026-01-15");
  });

  it("handles day transition edge case at 21:00 UTC", () => {
    // 21:00 UTC = 00:00 Madagascar → next day
    const midnight = new Date("2026-06-10T21:00:00Z");
    const result = getMadagascarDateString(midnight);
    expect(result).toBe("2026-06-11");
  });
});

describe("getMsUntilMadagascarMidnight", () => {
  it("returns a positive number", () => {
    const ms = getMsUntilMadagascarMidnight();
    expect(ms).toBeGreaterThan(0);
  });

  it("is at most 24 hours", () => {
    const ms = getMsUntilMadagascarMidnight();
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});

describe("formatCountdown", () => {
  it("formats zero", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
  });

  it("formats hours, minutes, seconds", () => {
    const ms = 3 * 3600 * 1000 + 15 * 60 * 1000 + 42 * 1000;
    expect(formatCountdown(ms)).toBe("03:15:42");
  });

  it("pads single digits", () => {
    const ms = 1 * 3600 * 1000 + 2 * 60 * 1000 + 3 * 1000;
    expect(formatCountdown(ms)).toBe("01:02:03");
  });

  it("handles negative values gracefully", () => {
    expect(formatCountdown(-1000)).toBe("00:00:00");
  });
});
