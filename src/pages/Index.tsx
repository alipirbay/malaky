import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useAppBootstrap, useHashSync } from "@/hooks/useAppBootstrap";
import HomeScreen from "@/components/screens/HomeScreen";
import PlayersScreen from "@/components/screens/PlayersScreen";
import ModeScreen from "@/components/screens/ModeScreen";
import VibeScreen from "@/components/screens/VibeScreen";
import PacksScreen from "@/components/screens/PacksScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import HistoryScreen from "@/components/screens/HistoryScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import FirstLaunchModal from "@/components/FirstLaunchModal";
import PrivacyModal from "@/components/PrivacyModal";

const GameScreen = lazy(() => import("@/components/screens/GameScreen"));
const EndScreen = lazy(() => import("@/components/screens/EndScreen"));
const PaymentReturnScreen = lazy(() => import("@/components/screens/PaymentReturnScreen"));
const DuelHubScreen = lazy(() => import("@/components/screens/DuelHubScreen"));
const HeadsUpScreen = lazy(() => import("@/components/screens/HeadsUpScreen"));
const SCREENS = {
  home: HomeScreen,
  players: PlayersScreen,
  mode: ModeScreen,
  vibe: VibeScreen,
  game: GameScreen,
  end: EndScreen,
  packs: PacksScreen,
  settings: SettingsScreen,
  history: HistoryScreen,
  duel_hub: DuelHubScreen,
  guess_rush: HeadsUpScreen,
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

  const { showFirstLaunch, acceptTerms } = useAppBootstrap();
  useHashSync();

  const [legalModal, setLegalModal] = useState<"privacy" | "cgu" | null>(null);

  // Handle redirect back from VPI payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_return") === "true" && pendingTransactionId) {
      setScreen("payment_return");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [pendingTransactionId, setScreen]);

  if (showFirstLaunch) {
    return (
      <>
        <FirstLaunchModal
          onAccept={acceptTerms}
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
