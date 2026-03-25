import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { GAME_MODES } from "@/data/config";
import { ArrowLeft } from "lucide-react";

const ModeScreen = () => {
  const { setMode, setScreen } = useGameStore();

  const handleSelectMode = (modeId: typeof GAME_MODES[number]["id"]) => {
    setMode(modeId);
    if (modeId === "tsimoa") {
      useGameStore.getState().setVibe("fun");
      useGameStore.getState().startGame();
    } else {
      setScreen("vibe");
    }
  };

  const colorMap = {
    coral: "gradient-coral glow-coral",
    primary: "gradient-primary glow-primary",
    mango: "gradient-mango glow-mango",
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("players")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis le mode</h2>
          <p className="text-sm text-muted-foreground">6 modes de jeu disponibles</p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {GAME_MODES.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => handleSelectMode(mode.id)}
            className={`w-full rounded-2xl p-5 text-left transition-transform active:scale-[0.98] ${colorMap[mode.color]}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{mode.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{mode.name}</h3>
                <p className="text-sm text-foreground/70">{mode.subtitle}</p>
              </div>
              <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground/80">
                {mode.badge}
              </span>
              {mode.id === "tsimoa" && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Gratuit
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ModeScreen;
