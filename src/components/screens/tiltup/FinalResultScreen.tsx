import { motion } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { useGameStore } from "@/store/gameStore";
import { RotateCcw, Home } from "lucide-react";

const FinalResultScreen = () => {
  const store = useHeadsUpStore();
  const setGameScreen = useGameStore((s) => s.setScreen);

  const sortedPlayers = [...store.players].sort(
    (a, b) => (store.scores[b.name] || 0) - (store.scores[a.name] || 0)
  );

  const winner = sortedPlayers[0];

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-3xl font-black text-foreground mb-2">{winner?.name} gagne !</h2>
          <p className="text-lg text-muted-foreground mb-8">
            avec {store.scores[winner?.name || ""] || 0} mots trouvés
          </p>

          <div className="space-y-3 mb-8">
            {sortedPlayers.map((player, idx) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-3 rounded-2xl p-4 ${idx === 0 ? "gradient-mango" : "bg-card"}`}
              >
                <span className="text-2xl font-black w-8">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}</span>
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `hsl(${player.color} / 0.2)`, color: `hsl(${player.color})` }}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <span className="flex-1 font-bold text-foreground">{player.name}</span>
                <span className={`text-xl font-black ${idx === 0 ? "text-accent-foreground" : "text-primary"}`}>
                  {store.scores[player.name] || 0}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => { store.resetGame(); store.setScreen("categories"); }}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          <RotateCcw size={20} className="inline mr-2" /> Rejouer
        </button>
        <button
          onClick={() => { store.resetGame(); setGameScreen("mode"); }}
          className="w-full rounded-2xl bg-card px-6 py-3 font-semibold text-foreground transition-transform active:scale-95"
        >
          ← Changer de mode
        </button>
        <button
          onClick={() => { store.resetGame(); setGameScreen("home"); }}
          className="w-full rounded-2xl bg-card/60 px-6 py-2.5 text-sm font-medium text-muted-foreground transition-transform active:scale-95"
        >
          <Home size={14} className="inline mr-1" /> Accueil
        </button>
      </div>
    </div>
  );
};

export default FinalResultScreen;
