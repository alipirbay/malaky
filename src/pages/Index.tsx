import { useGameStore } from "@/store/gameStore";
import HomeScreen from "@/components/screens/HomeScreen";
import PlayersScreen from "@/components/screens/PlayersScreen";
import ModeScreen from "@/components/screens/ModeScreen";
import VibeScreen from "@/components/screens/VibeScreen";
import GameScreen from "@/components/screens/GameScreen";
import EndScreen from "@/components/screens/EndScreen";
import PacksScreen from "@/components/screens/PacksScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

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
  const Screen = SCREENS[currentScreen];

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Screen />
    </div>
  );
};

export default Index;
