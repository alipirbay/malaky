import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { VIBES } from "@/data/cards";
import { ArrowLeft } from "lucide-react";
import type { Vibe } from "@/data/cards";

const vibeStyles: Record<Vibe, string> = {
  soft: "bg-primary/20 border-primary/40",
  fun: "gradient-primary glow-primary",
  hot: "gradient-coral glow-coral",
  chaos: "gradient-mango glow-mango",
};

const VibeScreen = () => {
  const { setVibe, setScreen, startGame } = useGameStore();

  const handleSelect = (vibe: Vibe) => {
    setVibe(vibe);
    // Start immediately after vibe selection
    setTimeout(() => {
      useGameStore.getState().startGame();
    }, 0);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis l'ambiance</h2>
          <p className="text-sm text-muted-foreground">Ça commence tranquille… ou pas.</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {VIBES.map((vibe, i) => (
          <motion.button
            key={vibe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleSelect(vibe.id)}
            className={`w-full rounded-2xl p-6 text-left transition-transform active:scale-[0.97] border-2 ${vibeStyles[vibe.id]}`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{vibe.emoji}</span>
              <div className="flex-1">
                <h3 className="text-xl font-black text-foreground">{vibe.name}</h3>
                <p className="text-sm text-foreground/60">{vibe.description}</p>
              </div>
              <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground/70">
                {vibe.tag}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default VibeScreen;
