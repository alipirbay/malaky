/**
 * Date utilities for Madagascar timezone (Indian/Antananarivo, UTC+3).
 * All "day" logic in the app should use these helpers to ensure consistency.
 *
 * Uses Intl.DateTimeFormat.formatToParts for robust cross-browser support,
 * avoiding locale-dependent string formatting.
 */

const MADAGASCAR_TZ = "Indian/Antananarivo";

// Reusable formatters (created once)
const datePartFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MADAGASCAR_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MADAGASCAR_TZ,
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
});

/**
 * Returns today's date string (YYYY-MM-DD) in Madagascar timezone.
 * Uses formatToParts for robustness across browsers.
 */
export function getMadagascarDateString(date: Date = new Date()): string {
  const parts = datePartFormatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Returns milliseconds until the next midnight in Madagascar timezone.
 */
export function getMsUntilMadagascarMidnight(): number {
  const now = new Date();
  const madagascarDateStr = getMadagascarDateString(now);
  // Build tomorrow midnight in Madagascar: parse the date, add 1 day, construct in UTC+3
  const [year, month, day] = madagascarDateStr.split("-").map(Number);
  // Madagascar is UTC+3, so midnight Mada = 21:00 UTC previous day
  const tomorrowMada = new Date(Date.UTC(year, month - 1, day + 1, -3, 0, 0, 0));
  return Math.max(0, tomorrowMada.getTime() - now.getTime());
}

/**
 * Formats milliseconds as HH:MM:SS countdown string.
 */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
