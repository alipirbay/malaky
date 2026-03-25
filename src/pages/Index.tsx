import { useState, useEffect, lazy, Suspense } from "react";
import { useGameStore } from "@/store/gameStore";
import HomeScreen from "@/components/screens/HomeScreen";
import FirstLaunchModal from "@/components/FirstLaunchModal";
import PrivacyModal from "@/components/PrivacyModal";

// Lazy-load non-home screens for better initial bundle size
const PlayersScreen = lazy(() => import("@/components/screens/PlayersScreen"));
const ModeScreen = lazy(() => import("@/components/screens/ModeScreen"));
const VibeScreen = lazy(() => import("@/components/screens/VibeScreen"));
const GameScreen = lazy(() => import("@/components/screens/GameScreen"));
const EndScreen = lazy(() => import("@/components/screens/EndScreen"));
const PacksScreen = lazy(() => import("@/components/screens/PacksScreen"));
const SettingsScreen = lazy(() => import("@/components/screens/SettingsScreen"));
const PaymentReturnScreen = lazy(() => import("@/components/screens/PaymentReturnScreen"));

const SCREENS = {
  home: HomeScreen,
  players: PlayersScreen,
  mode: ModeScreen,
  vibe: VibeScreen,
  game: GameScreen,
  end: EndScreen,
  packs: PacksScreen,
  settings: SettingsScreen,
} as const;

/** Screens that can be navigated to via hash (excludes game/end which require state) */
const HASH_NAVIGABLE = new Set(["home", "players", "mode", "vibe", "packs", "settings"]);

/** Maps a hash string to a valid screen name, or null */
export function hashToScreen(hash: string): string | null {
  const screen = hash.replace("#", "");
  return HASH_NAVIGABLE.has(screen) ? screen : null;
}

const ScreenFallback = () => (
  <div className="flex min-h-screen items-center justify-center gradient-surface">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const Index = () => {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const pendingTransactionId = useGameStore((s) => s.pendingTransactionId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setPendingTransaction = useGameStore((s) => s.setPendingTransaction);

  const [showFirstLaunch, setShowFirstLaunch] = useState(false);
  const [legalModal, setLegalModal] = useState<"privacy" | "cgu" | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("malaky-terms-accepted")) {
      setShowFirstLaunch(true);
    }
    // If reloaded on game screen with empty deck, rebuild or go home
    const state = useGameStore.getState();
    if (state.currentScreen === "game" && state.deck.length === 0) {
      if (state.selectedMode && state.selectedVibe && state.players.length >= 2) {
        state.startGame(state.selectedVibe);
      } else {
        state.setScreen("home");
      }
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem("malaky-terms-accepted", "true");
    setShowFirstLaunch(false);
  };

  // Handle redirect back from VPI payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_return") === "true" && pendingTransactionId) {
      setScreen("payment_return");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [pendingTransactionId, setScreen]);

  // Sync screen → hash (push state only when screen changes to avoid loops)
  useEffect(() => {
    const targetHash = currentScreen === "home" ? "" : currentScreen;
    const currentHash = window.location.hash.replace("#", "");
    if (targetHash !== currentHash) {
      if (HASH_NAVIGABLE.has(currentScreen)) {
        window.history.pushState(null, "", currentScreen === "home" ? window.location.pathname : `#${currentScreen}`);
      }
    }
  }, [currentScreen]);

  // Sync hash → screen (on back/forward navigation)
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      const screen = hashToScreen(hash);
      if (screen && screen !== useGameStore.getState().currentScreen) {
        setScreen(screen as typeof currentScreen);
      } else if (!hash && useGameStore.getState().currentScreen !== "home") {
        setScreen("home");
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [setScreen]);

  if (showFirstLaunch) {
    return (
      <>
        <FirstLaunchModal
          onAccept={handleAcceptTerms}
          onShowPrivacy={() => setLegalModal("privacy")}
          onShowCGU={() => setLegalModal("cgu")}
        />
        <PrivacyModal
          open={legalModal !== null}
          onClose={() => setLegalModal(null)}
          type={legalModal ?? "privacy"}
        />
      </>
    );
  }

  if (currentScreen === "payment_return" && pendingTransactionId) {
    return (
      <div className="max-w-md mx-auto min-h-screen">
        <Suspense fallback={<ScreenFallback />}>
          <PaymentReturnScreen
            transactionId={pendingTransactionId}
            onBack={() => {
              setPendingTransaction(null);
              setScreen("home");
            }}
          />
        </Suspense>
      </div>
    );
  }

  const Screen = SCREENS[currentScreen as keyof typeof SCREENS] || HomeScreen;

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Suspense fallback={<ScreenFallback />}>
        <Screen />
      </Suspense>
    </div>
  );
};

export default Index;
