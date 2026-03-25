import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { Trophy, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";

const endings = [
  "Ity no fialam-boly gasy tena izy! 🇲🇬",
  "Mahagaga ny mpiara-milalao!",
  "Bon… maintenant ça devient intéressant.",
  "La vérité sort toujours en soirée.",
  "Mora mora, mais personne n'a été soft ce soir.",
];

const EndScreen = () => {
  const { stats, players, resetGame, setScreen, selectedMode } = useGameStore();

  // Find bravest player (most cards played, least refused)
  let bravest = players[0]?.name || "";
  let bestScore = -1;
  Object.entries(stats.playerStats).forEach(([name, s]) => {
    const score = s.played - s.refused;
    if (score > bestScore) {
      bestScore = score;
      bravest = name;
    }
  });

  // Find laziest player (most refusals)
  let laziest = players[0]?.name || "";
  let worstScore = -Infinity;
  Object.entries(stats.playerStats).forEach(([name, s]) => {
    const score = s.refused - s.played;
    if (score > worstScore) {
      worstScore = score;
      laziest = name;
    }
  });

  const ending = endings[Math.floor(Math.random() * endings.length)];
  const isCultureG = selectedMode === "culture_generale";

  const handleReplay = () => {
    setScreen("vibe");
  };

  const handleNewGame = () => {
    resetGame();
  };

  const handleShare = async () => {
    const text = `Je viens de finir une partie de Malaky ! 🎉\n${stats.cardsPlayed} cartes jouées • ${stats.refusals} refus\nLe plus téméraire : ${bravest}\n\nJoue sur malaky.app`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Malaky", text });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papier !");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-foreground mb-2">Partie terminée !</h2>
        <p className="text-muted-foreground">{ending}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-3 mb-10"
      >
        <div className="card-game flex items-center gap-4">
          <div className="rounded-full bg-primary/20 p-3">
            <Trophy className="text-primary" size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Le plus téméraire</p>
            <p className="text-lg font-bold text-foreground">{bravest}</p>
          </div>
        </div>

        {laziest !== bravest && (
          <div className="card-game flex items-center gap-4">
            <div className="rounded-full bg-destructive/20 p-3">
              <span className="text-xl">😴</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Le plus fainéant</p>
              <p className="text-lg font-bold text-foreground">{laziest}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="card-game text-center">
            <p className="text-2xl font-black text-primary">{stats.cardsPlayed}</p>
            <p className="text-xs text-muted-foreground">cartes jouées</p>
          </div>
          <div className="card-game text-center">
            <p className="text-2xl font-black text-coral">{stats.refusals}</p>
            <p className="text-xs text-muted-foreground">refus</p>
          </div>
        </div>

        {isCultureG && stats.quizScore !== undefined && (
          <div className="card-game text-center">
            <p className="text-2xl font-black text-accent">{stats.quizScore}</p>
            <p className="text-xs text-muted-foreground">bonnes réponses quiz</p>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <button
          onClick={handleReplay}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw size={20} /> Rejouer
        </button>
        <button
          onClick={handleNewGame}
          className="w-full rounded-2xl bg-card px-6 py-4 text-lg font-semibold text-foreground flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          Nouvelle partie
        </button>
        <button
          onClick={handleShare}
          className="w-full rounded-2xl bg-card/50 px-6 py-3 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Share2 size={16} /> Partager une carte souvenir
        </button>
      </motion.div>
    </div>
  );
};

export default EndScreen;
