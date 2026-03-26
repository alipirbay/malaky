import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { hashToScreen, isHashNavigable } from "@/lib/hashUtils";
import { storageGet, storageSet } from "@/lib/storage";

/**
 * App bootstrap hook — handles:
 * - First launch modal check
 * - Hash → screen sync on mount
 * - Safe redirect if refresh left app in broken state
 */
export function useAppBootstrap() {
  const [showFirstLaunch, setShowFirstLaunch] = useState(false);

  useEffect(() => {
    if (!storageGet<boolean>("terms-accepted", false)) {
      setShowFirstLaunch(true);
    }

    const state = useGameStore.getState();

    // Sync initial hash → screen
    const hash = window.location.hash.replace("#", "");
    const target = hashToScreen(hash);
    if (target && target !== state.currentScreen) {
      useGameStore.getState().setScreen(target as typeof state.currentScreen);
    }

    // Safe redirect: game with no deck or end with no stats → home
    if (state.currentScreen === "game" && state.deck.length === 0) {
      useGameStore.getState().setScreen("home");
    }
    if (state.currentScreen === "end" && state.stats.cardsPlayed === 0) {
      useGameStore.getState().setScreen("home");
    }
  }, []);

  const acceptTerms = () => {
    storageSet("terms-accepted", true);
    setShowFirstLaunch(false);
  };

  return { showFirstLaunch, acceptTerms };
}

/**
 * Bidirectional hash ↔ screen synchronization.
 */
export function useHashSync() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const setScreen = useGameStore((s) => s.setScreen);

  // Screen → hash
  useEffect(() => {
    const targetHash = currentScreen === "home" ? "" : currentScreen;
    const currentHash = window.location.hash.replace("#", "");
    if (targetHash !== currentHash && isHashNavigable(currentScreen)) {
      window.history.pushState(
        null,
        "",
        currentScreen === "home" ? window.location.pathname : `#${currentScreen}`
      );
    }
  }, [currentScreen]);

  // Hash → screen (back/forward)
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      const screen = hashToScreen(hash);
      const current = useGameStore.getState().currentScreen;
      if (screen && screen !== current) {
        setScreen(screen as typeof current);
      } else if (!hash && current !== "home") {
        setScreen("home");
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [setScreen]);
}
