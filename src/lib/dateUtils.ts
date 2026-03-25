/**
 * Date utilities for Madagascar timezone (Indian/Antananarivo, UTC+3).
 * All "day" logic in the app should use these helpers to ensure consistency.
 */

const MADAGASCAR_TZ = "Indian/Antananarivo";

/**
 * Returns today's date string (YYYY-MM-DD) in Madagascar timezone.
 */
export function getMadagascarDateString(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: MADAGASCAR_TZ });
}

/**
 * Returns milliseconds until the next midnight in Madagascar timezone.
 */
export function getMsUntilMadagascarMidnight(): number {
  const now = new Date();
  // Get current date in Madagascar
  const madagascarDateStr = getMadagascarDateString(now);
  // Build tomorrow midnight in Madagascar: parse the date, add 1 day, construct in UTC+3
  const [year, month, day] = madagascarDateStr.split("-").map(Number);
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
