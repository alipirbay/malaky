import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { STORE_PACKS } from "@/data/cards";
import { ArrowLeft, Lock, Check } from "lucide-react";

const PacksScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Boutique de packs</h2>
          <p className="text-sm text-muted-foreground">Plus de cartes, plus de fun</p>
        </div>
      </div>

      <div className="space-y-3">
        {STORE_PACKS.map((pack, i) => (
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
              <p className="text-xs text-muted-foreground/60 mt-1">{pack.cardCount} cartes</p>
            </div>
            {pack.free ? (
              <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary">
                <Check size={12} /> Inclus
              </span>
            ) : (
              <button className="flex items-center gap-1 rounded-full gradient-mango px-4 py-2 text-xs font-bold text-mango-foreground transition-transform active:scale-95">
                <Lock size={12} /> {pack.price}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground/40 mt-8">
        Les achats seront bientôt disponibles 🚀
      </p>
    </div>
  );
};

export default PacksScreen;
