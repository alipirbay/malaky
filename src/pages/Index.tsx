import { useEffect } from "react";
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

const Index = () => {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const pendingTransactionId = useGameStore((s) => s.pendingTransactionId);
  const setScreen = useGameStore((s) => s.setScreen);
  const setPendingTransaction = useGameStore((s) => s.setPendingTransaction);

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
    const hash = window.location.hash.replace("#", "");
    if (hash && hash !== currentScreen && hash !== "payment_return") {
      setScreen(hash as any);
    }
  }, []);

  useEffect(() => {
    if (currentScreen !== "payment_return") {
      window.location.hash = currentScreen;
    }
  }, [currentScreen]);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && hash !== currentScreen) setScreen(hash as any);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [currentScreen, setScreen]);

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
