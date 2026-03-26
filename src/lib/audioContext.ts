/**
 * Safe AudioContext factory with mobile/browser restriction handling.
 */

let sharedCtx: AudioContext | null = null;

/** Get or create a shared AudioContext, resuming if suspended. Returns null if unavailable. */
export async function getAudioContext(): Promise<AudioContext | null> {
  try {
    if (sharedCtx && sharedCtx.state !== "closed") {
      if (sharedCtx.state === "suspended") {
        await sharedCtx.resume().catch(() => {});
      }
      return sharedCtx.state === "running" ? sharedCtx : null;
    }
    sharedCtx = new AudioContext();
    if (sharedCtx.state === "suspended") {
      await sharedCtx.resume().catch(() => {});
    }
    if (sharedCtx.state !== "running") {
      closeAudioContext();
      return null;
    }
    return sharedCtx;
  } catch {
    sharedCtx = null;
    return null;
  }
}

/** Close the shared AudioContext and release resources. */
export function closeAudioContext(): void {
  if (sharedCtx) {
    try { sharedCtx.close(); } catch { /* ignore */ }
    sharedCtx = null;
  }
}

/** Check if the shared AudioContext is running. */
export function isAudioContextRunning(): boolean {
  return sharedCtx !== null && sharedCtx.state === "running";
}
