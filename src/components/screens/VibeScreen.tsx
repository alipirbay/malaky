import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { VIBES, DIFFICULTIES } from "@/data/config";
import { ArrowLeft, Lock } from "lucide-react";
import type { Vibe } from "@/data/types";
import AgeGateModal from "@/components/AgeGateModal";

const vibeStyles: Partial<Record<Vibe, string>> = {
  soft: "vibe-soft",
  fun: "vibe-fun",
  hot: "vibe-hot",
  chaos: "vibe-chaos",
  couple: "vibe-couple",
  apero: "vibe-apero",
  mada: "vibe-mada",
  confessions: "vibe-confessions",
  vip: "vibe-vip",
  afterdark: "vibe-afterdark",
  facile: "vibe-soft",
  intermediaire: "vibe-fun",
  difficile: "vibe-hot",
  expert: "vibe-afterdark",
};

const ADULT_VIBES = ["afterdark", "hot"];

const hasConfirmedAge = (vibe: Vibe) =>
  localStorage.getItem(`malaky-age-confirmed-${vibe}`) === "true";

const VibeScreen = () => {
  const { setScreen, unlockedVibes, selectedMode } = useGameStore();
  const quickChallengeDuration = useGameStore((s) => s.quickChallengeDuration);
  const setQuickChallengeDuration = useGameStore((s) => s.setQuickChallengeDuration);
  const [pendingAdultVibe, setPendingAdultVibe] = useState<Vibe | null>(null);

  const isCultureMode = selectedMode === "culture_generale";
  const items = isCultureMode
    ? DIFFICULTIES.map(d => ({ id: d.id as Vibe, name: d.name, emoji: d.emoji, description: d.description, free: d.free, priceLabel: d.priceLabel }))
    : VIBES;

  const handleSelect = (vibe: Vibe, free: boolean) => {
    if (!free && !unlockedVibes[vibe]) {
      setScreen("packs");
      return;
    }
    if (ADULT_VIBES.includes(vibe) && !hasConfirmedAge(vibe)) {
      setPendingAdultVibe(vibe);
      return;
    }
    useGameStore.getState().setVibe(vibe);
    useGameStore.getState().startGame(vibe);
  };

  const handleAgeConfirmed = () => {
    if (!pendingAdultVibe) return;
    localStorage.setItem(`malaky-age-confirmed-${pendingAdultVibe}`, "true");
    const vibe = pendingAdultVibe;
    setPendingAdultVibe(null);
    useGameStore.getState().setVibe(vibe);
    useGameStore.getState().startGame(vibe);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isCultureMode ? "Choisis la difficulté" : "Choisis l'ambiance"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isCultureMode
              ? "Facile et Intermédiaire inclus. Difficile et Expert dans Packs."
              : "Soft et Fun inclus. Les autres dans Packs."}
          </p>
        </div>
      </div>

      {selectedMode === "quick_challenge" && (
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground mb-2">
            ⏱️ Durée du chrono
          </p>
          <div className="flex gap-2">
            {([10, 15, 20] as const).map((d) => (
              <button
                key={d}
                onClick={() => setQuickChallengeDuration(d)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  quickChallengeDuration === d
                    ? "gradient-primary text-primary-foreground"
                    : "bg-card text-muted-foreground"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 pb-4 overflow-y-auto">
        {items.map((item, i) => {
          const isUnlocked = item.free || unlockedVibes[item.id];

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(item.id, item.free)}
              aria-label={`Choisir l'ambiance ${item.name}${!isUnlocked ? ` — ${item.priceLabel}` : ""}`}
              className={`relative w-full rounded-2xl border-0 p-4 text-left overflow-hidden transition-transform active:scale-[0.97] ${vibeStyles[item.id] || "vibe-soft"} ${
                isUnlocked ? "" : "opacity-80"
              }`}
            >
              <div className="relative flex items-center gap-3">
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">{item.name}</h3>
                    {!isUnlocked && <Lock size={14} className="text-foreground/70" />}
                    {ADULT_VIBES.includes(item.id) && (
                      <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-bold text-destructive">18+</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/70 truncate">{item.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-foreground">
                  {isUnlocked ? (item.free ? "Gratuit" : "✓") : item.priceLabel}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {pendingAdultVibe && (
          <AgeGateModal
            packName={items.find(i => i.id === pendingAdultVibe)?.name ?? ""}
            onConfirm={handleAgeConfirmed}
            onCancel={() => setPendingAdultVibe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VibeScreen;
