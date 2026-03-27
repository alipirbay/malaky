import { motion } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { useGameStore } from "@/store/gameStore";
import { HEADS_UP_CATEGORIES } from "@/data/heads_up_categories";
import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { TiltUpIcon } from "@/components/TiltUpIcon";

const CategoryPicker = () => {
  const setScreen = useHeadsUpStore((s) => s.setScreen);
  const selectCategory = useHeadsUpStore((s) => s.selectCategory);
  const setGameScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setGameScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour aux modes">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><TiltUpIcon size={22} /> Tilt Up</h2>
          <p className="text-sm text-muted-foreground">Choisis un thème</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setScreen("ai_theme")}
          className="w-full rounded-2xl gradient-violet p-5 text-left transition-transform active:scale-[0.97] glow-violet"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={28} className="text-primary-foreground" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary-foreground">Thème IA ✨</h3>
              <p className="text-sm text-primary-foreground/70">Génère un deck custom sur n'importe quel sujet</p>
            </div>
            <ChevronRight size={16} className="text-primary-foreground/50" />
          </div>
        </motion.button>

        {HEADS_UP_CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.04 }}
            onClick={() => selectCategory(cat.id)}
            className="w-full rounded-2xl bg-card p-5 text-left transition-transform active:scale-[0.97]"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">{cat.words.length} mots</span>
                <ChevronRight size={16} className="text-muted-foreground/50 ml-1 inline" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPicker;
