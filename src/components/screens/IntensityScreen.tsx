import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { INTENSITIES, PACKS } from "@/data/cards";
import { ArrowLeft } from "lucide-react";
import type { Intensity } from "@/data/cards";

const IntensityScreen = () => {
  const { selectedIntensity, selectedPack, setIntensity, setPack, setScreen, startGame } = useGameStore();

  const handleStart = () => {
    startGame();
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis l'ambiance</h2>
          <p className="text-sm text-muted-foreground">Ça commence tranquille… ou pas.</p>
        </div>
      </div>

      {/* Pack selection */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pack</h3>
      <div className="grid grid-cols-2 gap-2 mb-8">
        {PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setPack(pack.id)}
            className={`rounded-xl px-3 py-3 text-left transition-all ${
              selectedPack === pack.id
                ? "bg-primary/20 border-2 border-primary"
                : "bg-card border-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{pack.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pack.age} {!pack.free && "• 💎"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Intensity selection */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Intensité</h3>
      <div className="space-y-2 mb-8">
        {INTENSITIES.map((intensity, i) => (
          <motion.button
            key={intensity.level}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setIntensity(intensity.level as Intensity)}
            className={`w-full rounded-xl px-4 py-4 text-left flex items-center gap-3 transition-all ${
              selectedIntensity === intensity.level
                ? "bg-primary/20 border-2 border-primary"
                : "bg-card border-2 border-transparent"
            }`}
          >
            <span className="text-2xl">{intensity.emoji}</span>
            <div>
              <p className="font-semibold text-foreground">{intensity.name}</p>
              <p className="text-xs text-muted-foreground">{intensity.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
      >
        🔥 C'est parti !
      </button>
    </div>
  );
};

export default IntensityScreen;
