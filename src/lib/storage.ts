const STORAGE_PREFIX = "malaky-";

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      clearNonCriticalStorage();
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
        return true;
      } catch {
        console.warn("[storage] Quota exceeded even after cleanup");
        return false;
      }
    }
    return false;
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    /* ignore */
  }
}

export function storageKeys(prefix?: string): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const shortKey = key.slice(STORAGE_PREFIX.length);
        if (!prefix || shortKey.startsWith(prefix)) keys.push(shortKey);
      }
    }
  } catch {
    /* ignore */
  }
  return keys;
}

function clearNonCriticalStorage(): void {
  const cacheKeys = storageKeys("cards-cache-");
  for (const key of cacheKeys) {
    storageRemove(key);
  }
  storageRemove("dilemme-cache");
}

export function getStorageUsage(): { used: string; percent: number } {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        total += (localStorage.getItem(key) || "").length * 2; // UTF-16
      }
    }
  } catch {
    /* ignore */
  }
  const mb = total / (1024 * 1024);
  return { used: `${mb.toFixed(1)} MB`, percent: Math.round((mb / 5) * 100) };
}
