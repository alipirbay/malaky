import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { STORE_PACKS } from "@/data/cards";
import { ArrowLeft, Check, Lock } from "lucide-react";

const PacksScreen = () => {
  const { setScreen, unlockVibe, unlockBundle, unlockedVibes } = useGameStore();
  const bundleUnlocked = unlockedVibes.hot && unlockedVibes.chaos;

  const handleBuy = (packId: (typeof STORE_PACKS)[number]["id"]) => {
    if (packId === "bundle") {
      unlockBundle();
      return;
    }

    if (packId === "hot" || packId === "chaos") {
      unlockVibe(packId);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Packs</h2>
          <p className="text-sm text-muted-foreground">Soft et Fun sont inclus. Débloque Hot et Chaos ici.</p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-card/80 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Inclus de base</p>
        <p className="mt-1">😇 Soft (famille) • 😏 Fun (amis)</p>
      </div>

      <div className="space-y-3">
        {STORE_PACKS.map((pack, i) => {
          const purchased =
            pack.id === "bundle"
              ? bundleUnlocked
              : pack.vibe
                ? unlockedVibes[pack.vibe]
                : false;

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-game flex items-center gap-4"
            >
              <span className="text-3xl">{pack.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{pack.name}</h3>
                <p className="text-xs text-muted-foreground">{pack.description}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{pack.cardCount}+ cartes</p>
              </div>

              {purchased ? (
                <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">
                  <Check size={12} /> Acheté
                </span>
              ) : (
                <button
                  onClick={() => handleBuy(pack.id)}
                  className="flex items-center gap-1 rounded-full gradient-mango px-4 py-2 text-xs font-bold text-mango-foreground transition-transform active:scale-95"
                >
                  <Lock size={12} /> {pack.price}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setScreen("vibe")}
        className="mt-6 rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground transition-transform active:scale-95"
      >
        Retour aux ambiances
      </button>
    </div>
  );
};

export default PacksScreen;
