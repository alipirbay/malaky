const STORAGE_KEY = "malaky-seen-cards";
const MAX_SEEN = 2000;

export function getSeenCardIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to read seen cards:", e);
    return [];
  }
}

export function markCardsSeen(ids: string[]): void {
  try {
    const existing = getSeenCardIds();
    const updated = [...new Set([...existing, ...ids])].slice(-MAX_SEEN);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save seen cards:", e);
  }
}

export function clearSeenCards(): void {
  localStorage.removeItem(STORAGE_KEY);
}
