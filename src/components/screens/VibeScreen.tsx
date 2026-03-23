import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { VIBES } from "@/data/cards";
import { ArrowLeft, Lock } from "lucide-react";
import type { Vibe } from "@/data/cards";

const vibeStyles: Record<Vibe, string> = {
  soft: "bg-primary/20 border-primary/40",
  fun: "gradient-primary glow-primary",
  hot: "gradient-coral glow-coral",
  chaos: "gradient-mango glow-mango",
};

const VibeScreen = () => {
  const { setVibe, setScreen, unlockedVibes } = useGameStore();

  const handleSelect = (vibe: Vibe, free: boolean) => {
    if (!free && !unlockedVibes[vibe]) {
      setScreen("packs");
      return;
    }

    setVibe(vibe);
    setTimeout(() => {
      useGameStore.getState().startGame();
    }, 0);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis l'ambiance</h2>
          <p className="text-sm text-muted-foreground">Soft et Fun inclus. Hot et Chaos dans Packs.</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {VIBES.map((vibe, i) => {
          const isUnlocked = vibe.free || unlockedVibes[vibe.id];

          return (
            <motion.button
              key={vibe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(vibe.id, vibe.free)}
              className={`w-full rounded-2xl border-2 p-6 text-left transition-transform active:scale-[0.97] ${vibeStyles[vibe.id]} ${
                isUnlocked ? "" : "opacity-80"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{vibe.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-foreground">{vibe.name}</h3>
                    {!isUnlocked && <Lock size={16} className="text-foreground/70" />}
                  </div>
                  <p className="text-sm text-foreground/70">{vibe.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground/80">
                    {vibe.tag}
                  </span>
                  <span className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-foreground">
                    {isUnlocked ? (vibe.free ? "Gratuit" : "Acheté") : vibe.priceLabel}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeScreen;
