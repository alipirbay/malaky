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
  couple: "bg-pink-500/20 border-pink-500/40",
  apero: "bg-amber-500/20 border-amber-500/40",
  mada: "bg-emerald-500/20 border-emerald-500/40",
  confessions: "bg-purple-500/20 border-purple-500/40",
  vip: "bg-yellow-500/20 border-yellow-500/40",
  afterdark: "bg-red-900/30 border-red-800/40",
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
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis l'ambiance</h2>
          <p className="text-sm text-muted-foreground">Soft et Fun inclus. Les autres dans Packs.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 pb-4 overflow-y-auto">
        {VIBES.map((vibe, i) => {
          const isUnlocked = vibe.free || unlockedVibes[vibe.id];

          return (
            <motion.button
              key={vibe.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(vibe.id, vibe.free)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-transform active:scale-[0.97] ${vibeStyles[vibe.id]} ${
                isUnlocked ? "" : "opacity-70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{vibe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">{vibe.name}</h3>
                    {!isUnlocked && <Lock size={14} className="text-foreground/70" />}
                  </div>
                  <p className="text-xs text-foreground/70 truncate">{vibe.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-foreground">
                  {isUnlocked ? (vibe.free ? "Gratuit" : "✓") : vibe.priceLabel}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeScreen;
