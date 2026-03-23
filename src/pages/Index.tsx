import { useGameStore } from "@/store/gameStore";
import HomeScreen from "@/components/screens/HomeScreen";
import PlayersScreen from "@/components/screens/PlayersScreen";
import ModeScreen from "@/components/screens/ModeScreen";
import IntensityScreen from "@/components/screens/IntensityScreen";
import GameScreen from "@/components/screens/GameScreen";
import EndScreen from "@/components/screens/EndScreen";

const SCREENS = {
  home: HomeScreen,
  players: PlayersScreen,
  mode: ModeScreen,
  intensity: IntensityScreen,
  game: GameScreen,
  end: EndScreen,
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
