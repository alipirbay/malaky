import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { VIBES, DIFFICULTIES } from "@/data/config";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import type { Vibe } from "@/data/types";
import AgeGateModal from "@/components/AgeGateModal";
import { isPackDownloaded } from "@/lib/packManager";
import { storageGet, storageSet } from "@/lib/storage";
import { toast } from "sonner";

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
const LAUNCH_TIMEOUT_MS = 8000;

const hasConfirmedAge = (vibe: Vibe) =>
  storageGet<boolean>(`age-confirmed-${vibe}`, false);

const VibeScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const unlockedVibes = useGameStore((s) => s.unlockedVibes);
  const selectedMode = useGameStore((s) => s.selectedMode);
  const quickChallengeDuration = useGameStore((s) => s.quickChallengeDuration);
  const setQuickChallengeDuration = useGameStore((s) => s.setQuickChallengeDuration);
  const [pendingAdultVibe, setPendingAdultVibe] = useState<Vibe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const launchingRef = useRef(false);

  const isCultureMode = selectedMode === "culture_generale";
  const items = isCultureMode
    ? DIFFICULTIES.map(d => ({ id: d.id as Vibe, name: d.name, emoji: d.emoji, description: d.description, free: d.free, priceLabel: d.priceLabel }))
    : VIBES;

  const launchGame = useCallback(async (vibe: Vibe) => {
    // Prevent double launch
    if (launchingRef.current) return;
    launchingRef.current = true;
    setIsLoading(true);

    // Safety timeout — if game doesn't navigate within LAUNCH_TIMEOUT_MS, reset
    const timeoutId = setTimeout(() => {
      if (launchingRef.current) {
        launchingRef.current = false;
        setIsLoading(false);
        toast.error("Impossible de charger les cartes. Réessaie.");
      }
    }, LAUNCH_TIMEOUT_MS);

    try {
      useGameStore.getState().setVibe(vibe);
      await useGameStore.getState().startGame(vibe);
      // If we're still here (startGame redirected to packs or failed without navigating to game)
      const currentScreen = useGameStore.getState().currentScreen;
      if (currentScreen !== "game") {
        launchingRef.current = false;
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to start game:", err);
      toast.error("Erreur au lancement. Réessaie.");
      launchingRef.current = false;
      setIsLoading(false);
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const handleSelect = useCallback((vibe: Vibe, free: boolean) => {
    if (launchingRef.current || isLoading) return;
    if (!free && !useGameStore.getState().unlockedVibes[vibe]) {
      setScreen("packs");
      return;
    }
    if (ADULT_VIBES.includes(vibe) && !hasConfirmedAge(vibe)) {
      setPendingAdultVibe(vibe);
      return;
    }
    launchGame(vibe);
  }, [isLoading, setScreen, launchGame]);

  const handleAgeConfirmed = useCallback(() => {
    if (!pendingAdultVibe) return;
    localStorage.setItem(`malaky-age-confirmed-${pendingAdultVibe}`, "true");
    const vibe = pendingAdultVibe;
    setPendingAdultVibe(null);
    launchGame(vibe);
  }, [pendingAdultVibe, launchGame]);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => !isLoading && setScreen("mode")}
          className="rounded-xl bg-card p-2.5 text-foreground"
          disabled={isLoading}
          aria-label="Retour au choix du mode"
        >
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

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Préparation des cartes...</p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 pb-4 overflow-y-auto">
        {items.map((item, i) => {
          const isUnlocked = item.free || unlockedVibes[item.id];
          const isOfflineReady = item.free || isPackDownloaded(item.id);

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(item.id, item.free)}
              disabled={isLoading}
              aria-label={`Choisir l'ambiance ${item.name}${!isUnlocked ? ` — ${item.priceLabel}` : ""}`}
              className={`relative w-full rounded-2xl border-0 p-4 text-left overflow-hidden transition-transform active:scale-[0.97] ${vibeStyles[item.id] || "vibe-soft"} ${
                isUnlocked ? "" : "opacity-80"
              } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
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
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-foreground/70 truncate">{item.description}</p>
                    {isOfflineReady && (
                      <span className="shrink-0 text-[10px] text-primary/60 font-medium">✓ Offline</span>
                    )}
                  </div>
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
