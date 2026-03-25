import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import HomeScreen from "@/components/screens/HomeScreen";
import PlayersScreen from "@/components/screens/PlayersScreen";
import ModeScreen from "@/components/screens/ModeScreen";
import VibeScreen from "@/components/screens/VibeScreen";
import GameScreen from "@/components/screens/GameScreen";
import EndScreen from "@/components/screens/EndScreen";
import PacksScreen from "@/components/screens/PacksScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import PaymentReturnScreen from "@/components/screens/PaymentReturnScreen";
import FirstLaunchModal from "@/components/FirstLaunchModal";
import PrivacyModal from "@/components/PrivacyModal";

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

const VALID_SCREENS = ['home', 'players', 'mode', 'vibe', 'packs', 'settings'];

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
    if (state.currentScreen === 'game' && state.deck.length === 0) {
      if (state.selectedMode && state.selectedVibe && state.players.length >= 2) {
        state.startGame(state.selectedVibe);
      } else {
        state.setScreen('home');
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

  // Sync screen to hash
  useEffect(() => {
    window.location.hash = currentScreen === 'home' ? '' : currentScreen;
  }, [currentScreen]);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace('#', '') as typeof currentScreen;
      if (VALID_SCREENS.includes(hash) && hash !== currentScreen) {
        setScreen(hash);
      } else if (!hash) {
        setScreen('home');
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [currentScreen, setScreen]);

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
        <PaymentReturnScreen
          transactionId={pendingTransactionId}
          onBack={() => {
            setPendingTransaction(null);
            setScreen("home");
          }}
        />
      </div>
    );
  }

  const Screen = SCREENS[currentScreen as keyof typeof SCREENS] || HomeScreen;

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Screen />
    </div>
  );
};

export default Index;
