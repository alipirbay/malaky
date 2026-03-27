import { useEffect } from "react";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { useGameStore } from "@/store/gameStore";
import CategoryPicker from "./tiltup/CategoryPicker";
import AiThemeScreen from "./tiltup/AiThemeScreen";
import InstructionsScreen from "./tiltup/InstructionsScreen";
import TiltUpPlaying from "./tiltup/TiltUpPlaying";
import RoundResultScreen from "./tiltup/RoundResultScreen";
import FinalResultScreen from "./tiltup/FinalResultScreen";

const HeadsUpScreen = () => {
  const screen = useHeadsUpStore((s) => s.screen);
  const initGame = useHeadsUpStore((s) => s.initGame);
  const players = useGameStore((s) => s.players);

  useEffect(() => {
    if (players.length >= 2) {
      initGame(players);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  switch (screen) {
    case "categories": return <CategoryPicker />;
    case "ai_theme": return <AiThemeScreen />;
    case "instructions": return <InstructionsScreen />;
    case "playing": return <TiltUpPlaying />;
    case "round_result": return <RoundResultScreen />;
    case "final_result": return <FinalResultScreen />;
    default: return null;
  }
};

export default HeadsUpScreen;
