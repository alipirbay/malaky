import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { hashToScreen, isHashNavigable } from "@/lib/hashUtils";
import HomeScreen from "@/components/screens/HomeScreen";
import PlayersScreen from "@/components/screens/PlayersScreen";
import ModeScreen from "@/components/screens/ModeScreen";
import VibeScreen from "@/components/screens/VibeScreen";
import PacksScreen from "@/components/screens/PacksScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import FirstLaunchModal from "@/components/FirstLaunchModal";
import PrivacyModal from "@/components/PrivacyModal";

// Only lazy-load screens that truly need heavy deps or are rarely hit
const GameScreen = lazy(() => import("@/components/screens/GameScreen"));
const EndScreen = lazy(() => import("@/components/screens/EndScreen"));
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

  // First-launch + deck rebuild on mount
  useEffect(() => {
    if (!localStorage.getItem("malaky-terms-accepted")) {
      setShowFirstLaunch(true);
    }

    // Sync initial hash → screen (e.g. user bookmarked #players)
    const initialHash = window.location.hash.replace("#", "");
    const initialScreen = hashToScreen(initialHash);
    if (initialScreen && initialScreen !== useGameStore.getState().currentScreen) {
      setScreen(initialScreen as typeof currentScreen);
    }

    // Deck is excluded from persist — rebuild on refresh if needed
    const state = useGameStore.getState();
    if (state.currentScreen === "game" && state.deck.length === 0) {
      if (state.selectedMode && state.selectedVibe && state.players.length >= 2) {
        state.startGame(state.selectedVibe);
      } else {
        state.setScreen("home");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Sync screen → hash
  useEffect(() => {
    const targetHash = currentScreen === "home" ? "" : currentScreen;
    const currentHash = window.location.hash.replace("#", "");
    if (targetHash !== currentHash) {
      if (isHashNavigable(currentScreen)) {
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
  }, [setScreen, currentScreen]);

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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<ScreenFallback />}>
            <Screen />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
