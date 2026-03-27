import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { GAME_MODES } from "@/data/config";
import { ArrowLeft, Lock } from "lucide-react";

const ModeScreen = () => {
  const setMode = useGameStore((s) => s.setMode);
  const setScreen = useGameStore((s) => s.setScreen);
  const players = useGameStore((s) => s.players);

  const handleSelectMode = (modeId: typeof GAME_MODES[number]["id"]) => {
    setMode(modeId);
    if (modeId === "quiz_duel") {
      setScreen("duel_hub");
    } else if (modeId === "guess_rush") {
      setScreen("guess_rush");
    } else {
      setScreen("vibe");
    }
  };

  const colorMap: Record<string, string> = {
    coral: "gradient-coral glow-coral",
    primary: "gradient-primary glow-primary",
    mango: "gradient-mango glow-mango",
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("players")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour aux joueurs">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis le mode</h2>
          <p className="text-sm text-muted-foreground">{GAME_MODES.length} modes de jeu disponibles</p>
        </div>
      </div>

      <div className="flex-1 space-y-3" role="radiogroup" aria-label="Choix du mode de jeu">
        {GAME_MODES.map((mode, i) => {
          const minPlayers = mode.minPlayers ?? 2;
          const hasEnoughPlayers = players.length >= minPlayers;
          const isDisabled = !hasEnoughPlayers;

          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              role="radio"
              aria-checked={false}
              onClick={() => !isDisabled && handleSelectMode(mode.id)}
              disabled={isDisabled}
              className={`w-full rounded-2xl p-5 text-left transition-transform active:scale-[0.98] ${colorMap[mode.color] || "gradient-primary glow-primary"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{mode.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{mode.name}</h3>
                  <p className="text-sm text-foreground/70">{mode.subtitle}</p>
                  {isDisabled && (
                    <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1">
                      <Lock size={10} /> {minPlayers}+ joueurs requis
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground/80">
                  {mode.badge}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeScreen;
