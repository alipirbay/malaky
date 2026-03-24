import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { STORE_PACKS } from "@/data/cards";
import { ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import type { Vibe } from "@/data/cards";

const PacksScreen = () => {
  const { setScreen, unlockVibe, unlockBundle, unlockedVibes } = useGameStore();

  const handleBuy = (packId: (typeof STORE_PACKS)[number]["id"]) => {
    if (packId === "bundle_hot_chaos") {
      unlockBundle(["hot", "chaos"]);
      return;
    }
    if (packId === "bundle_all") {
      unlockBundle(["hot", "chaos", "couple", "apero", "mada", "confessions", "vip", "afterdark"]);
      return;
    }
    // Single pack
    const pack = STORE_PACKS.find(p => p.id === packId);
    if (pack?.vibe) {
      unlockVibe(pack.vibe as Vibe);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Boutique</h2>
          <p className="text-sm text-muted-foreground">Débloque de nouvelles ambiances</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-card/80 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Inclus gratuitement</p>
        <p className="mt-1">😇 Soft (famille) • 😏 Fun (amis)</p>
      </div>

      <div className="space-y-3 pb-6 overflow-y-auto flex-1">
        {STORE_PACKS.map((pack, i) => {
          const purchased =
            pack.id === "bundle_hot_chaos"
              ? unlockedVibes.hot && unlockedVibes.chaos
              : pack.id === "bundle_all"
                ? Object.values(unlockedVibes).every(Boolean)
                : pack.vibe
                  ? unlockedVibes[pack.vibe as Vibe]
                  : false;

          const isBundle = pack.id.startsWith("bundle");

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`card-game flex items-center gap-3 ${isBundle ? "border-2 border-accent/30" : ""}`}
            >
              <span className="text-2xl">{pack.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-foreground text-sm">{pack.name}</h3>
                  {isBundle && <Sparkles size={12} className="text-accent" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{pack.description}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">{pack.cardCount}+ cartes</p>
              </div>

              {purchased ? (
                <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary shrink-0">
                  <Check size={12} /> Acheté
                </span>
              ) : (
                <button
                  onClick={() => handleBuy(pack.id)}
                  className="flex items-center gap-1 shrink-0 rounded-full gradient-mango px-3 py-2 text-xs font-bold text-mango-foreground transition-transform active:scale-95"
                >
                  <Lock size={10} /> {pack.price}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setScreen("vibe")}
        className="rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground transition-transform active:scale-95"
      >
        Retour aux ambiances
      </button>
    </div>
  );
};

export default PacksScreen;
