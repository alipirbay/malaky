import { useCallback } from "react";
import { motion } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { GAME_LIMITS } from "@/data/constants";
import { ArrowLeft } from "lucide-react";
import { TiltUpIcon } from "@/components/TiltUpIcon";
import { useSounds } from "@/hooks/useSounds";

const InstructionsScreen = () => {
  const startRound = useHeadsUpStore((s) => s.startRound);
  const setScreen = useHeadsUpStore((s) => s.setScreen);
  const currentPlayerIndex = useHeadsUpStore((s) => s.currentPlayerIndex);
  const players = useHeadsUpStore((s) => s.players);
  const selectedCategory = useHeadsUpStore((s) => s.selectedCategory);
  const { playConfirm, vibrate } = useSounds();
  const currentPlayer = players[currentPlayerIndex];

  const handleStart = useCallback(() => {
    playConfirm();
    vibrate(50);
    startRound();
  }, [startRound, playConfirm, vibrate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <div className="absolute top-6 left-6 safe-top">
        <button onClick={() => setScreen("categories")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour aux catégories">
          <ArrowLeft size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full"
      >
        <TiltUpIcon size={64} className="mx-auto mb-4 text-primary" />

        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            backgroundColor: currentPlayer ? `hsl(${currentPlayer.color} / 0.15)` : undefined,
            color: currentPlayer ? `hsl(${currentPlayer.color})` : undefined,
          }}
        >
          <span className="text-lg font-bold">{currentPlayer?.name}</span>
          <span className="text-sm">à toi !</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">Comment jouer</h2>
        <div className="space-y-3 text-left mb-8">
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">1️⃣</span>
            <p className="text-sm text-foreground"><strong>Tourne ton téléphone en paysage</strong> (horizontal)</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">2️⃣</span>
            <p className="text-sm text-foreground">Place-le sur ton <strong>front</strong>, écran face aux autres</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">3️⃣</span>
            <p className="text-sm text-foreground">Les autres te font deviner le mot affiché</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-3">
            <span className="text-xl">4️⃣</span>
            <p className="text-sm text-foreground">
              <strong>Trouvé ?</strong> Incline vers le <strong>bas ↓</strong><br />
              <strong>Passer ?</strong> Incline vers le <strong>haut ↑</strong>
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          Thème : <strong>{selectedCategory?.emoji} {selectedCategory?.name}</strong>
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          ⏱ {GAME_LIMITS.HEADS_UP_ROUND_SECONDS} secondes par manche
        </p>

        <button
          onClick={handleStart}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          C'est parti ! 🚀
        </button>
      </motion.div>
    </div>
  );
};

export default InstructionsScreen;
