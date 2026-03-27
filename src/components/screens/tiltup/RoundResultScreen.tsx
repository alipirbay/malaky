import { motion } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { useGameStore } from "@/store/gameStore";
import { RotateCcw, Layers, Home } from "lucide-react";
import { TiltUpIcon } from "@/components/TiltUpIcon";

const RoundResultScreen = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);
  const lastResult = store.roundResults[store.roundResults.length - 1];
  const nextPlayerObj = store.players[store.currentPlayerIndex + 1];
  const isLastPlayer = store.currentPlayerIndex >= store.players.length - 1;
  const currentPlayer = store.players[store.currentPlayerIndex];

  if (!lastResult) return null;

  const handleReplayThemeSamePlayer = () => store.replayCurrentPlayer();
  const handleNextPlayer = () => store.nextPlayer();
  const handleFinalResults = () => store.showFinalResults();
  const handleChangeTheme = () => { store.resetGame(); store.setScreen("categories"); };
  const handleGoHome = () => { store.resetGame(); setGameScreen("home"); };
  const handleGoModes = () => { store.resetGame(); setGameScreen("mode"); };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <TiltUpIcon size={48} className="mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{lastResult.playerName}</h2>
          <p className="text-4xl font-black text-primary mb-6">{lastResult.score} mots trouvés !</p>

          {lastResult.found.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-green-400 mb-2">✓ Trouvés</p>
              <div className="flex flex-wrap justify-center gap-2">
                {lastResult.found.map((w, i) => (
                  <span key={i} className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">{w}</span>
                ))}
              </div>
            </div>
          )}

          {lastResult.passed.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">✗ Passés</p>
              <div className="flex flex-wrap justify-center gap-2">
                {lastResult.passed.map((w, i) => (
                  <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{w}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="space-y-3">
        <button onClick={handleReplayThemeSamePlayer} className="w-full rounded-2xl bg-card px-4 py-3 font-semibold text-foreground transition-transform active:scale-95">
          <RotateCcw size={16} className="inline mr-2" /> Rejouer — {currentPlayer?.name}
        </button>

        {!isLastPlayer && nextPlayerObj && (
          <button onClick={handleNextPlayer} className="w-full rounded-2xl gradient-primary px-4 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95">
            Au tour de {nextPlayerObj.name} ➡️
          </button>
        )}

        {isLastPlayer && (
          <button onClick={handleFinalResults} className="w-full rounded-2xl gradient-primary px-4 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95">
            Voir les résultats 🏆
          </button>
        )}

        <button onClick={handleChangeTheme} className="w-full rounded-2xl bg-card px-4 py-3 font-semibold text-foreground transition-transform active:scale-95">
          <Layers size={16} className="inline mr-2" /> Changer de thème
        </button>

        <div className="flex gap-3">
          <button onClick={handleGoModes} className="flex-1 rounded-2xl bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground">
            ← Modes
          </button>
          <button onClick={handleGoHome} className="flex-1 rounded-2xl bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <Home size={14} className="inline mr-1" /> Accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundResultScreen;
