import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

const HomeScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);

  const stats = [
    { label: "Modes", value: "5", emoji: "🎯" },
    { label: "Ambiances", value: "4", emoji: "🎭" },
    { label: "Cartes", value: "3200+", emoji: "🃏" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-6 py-10 gradient-surface">
      {/* Top section */}
      <div className="flex-1" />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        {/* Logo / Title */}
        <div className="mb-2 text-6xl">🔥</div>
        <h1 className="text-5xl font-black tracking-tight text-gradient mb-2">
          TSY MENATRA
        </h1>
        <p className="text-muted-foreground text-lg font-medium flex items-center justify-center gap-2">
          Party game malgache
          <span className="text-2xl leading-none">🇲🇬</span>
        </p>
        <p className="text-muted-foreground/50 text-sm mt-3 max-w-[280px] mx-auto leading-relaxed">
          L'app qui transforme n'importe quel moment entre amis en souvenir légendaire.
        </p>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-6 flex items-center justify-center gap-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-2xl bg-card/60 px-4 py-3 backdrop-blur-sm">
              <span className="text-lg">{stat.emoji}</span>
              <span className="text-sm font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-10 w-full max-w-sm space-y-3"
      >
        <button
          onClick={() => setScreen("players")}
          className="group relative w-full overflow-hidden rounded-2xl gradient-primary px-6 py-5 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            🎮 Créer une partie
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setScreen("packs")}
            className="flex-1 rounded-2xl bg-card px-4 py-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
          >
            📦 Packs
          </button>
          <button
            onClick={() => setScreen("settings")}
            className="flex-1 rounded-2xl bg-card px-4 py-4 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-95"
          >
            ⚙️ Paramètres
          </button>
        </div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-col items-center gap-1"
      >
        <p className="text-xs font-medium text-muted-foreground/40 tracking-widest uppercase">
          Ose tout. Assume rien.
        </p>
      </motion.div>

      <div className="flex-1" />
    </div>
  );
};

export default HomeScreen;
