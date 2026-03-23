import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

const HomeScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-12 text-center"
      >
        <h1 className="text-5xl font-black tracking-tight text-gradient mb-3">
          TSY MENATRA
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Party game malgache 🇲🇬
        </p>
        <p className="text-muted-foreground/60 text-sm mt-2 max-w-xs mx-auto">
          L'app qui transforme n'importe quel moment entre amis en souvenir légendaire.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-sm space-y-4"
      >
        <button
          onClick={() => setScreen("players")}
          className="w-full rounded-2xl gradient-primary px-6 py-5 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          🎮 Créer une partie
        </button>

        <div className="flex gap-3">
          <button className="flex-1 rounded-2xl bg-card px-4 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            📦 Packs
          </button>
          <button className="flex-1 rounded-2xl bg-card px-4 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            ⚙️ Paramètres
          </button>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-xs text-muted-foreground/40"
      >
        Ose tout. Assume rien.
      </motion.p>
    </div>
  );
};

export default HomeScreen;
