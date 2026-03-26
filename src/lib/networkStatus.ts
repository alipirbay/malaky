type NetworkListener = (online: boolean) => void;
const listeners = new Set<NetworkListener>();
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnline = true;
    listeners.forEach((l) => l(true));
  });
  window.addEventListener("offline", () => {
    isOnline = false;
    listeners.forEach((l) => l(false));
  });
}

export function getNetworkStatus(): boolean {
  return isOnline;
}

export function onNetworkChange(listener: NetworkListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; timeoutMs?: number; label?: string } = {}
): Promise<T> {
  const { maxRetries = 2, timeoutMs = 8000, label = "request" } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        ),
      ]);
      return result;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  console.warn(`[${label}] Failed after ${maxRetries + 1} attempts:`, lastError);
  throw lastError;
}
