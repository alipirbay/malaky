import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { GAME_MODES } from "@/data/config";
import { Trophy, RotateCcw, Share2, Zap } from "lucide-react";
import { toast } from "sonner";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { generateShareImage } from "@/hooks/useShareImage";

const endings = [
  "Ity no fialam-boly gasy tena izy! 🇲🇬",
  "Mahagaga ny mpiara-milalao!",
  "Bon… maintenant ça devient intéressant.",
  "La vérité sort toujours en soirée.",
  "Mora mora, mais personne n'a été soft ce soir.",
];

const EndScreen = () => {
  const stats = useGameStore((s) => s.stats);
  const players = useGameStore((s) => s.players);
  const resetGame = useGameStore((s) => s.resetGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const selectedMode = useGameStore((s) => s.selectedMode);
  const selectedVibe = useGameStore((s) => s.selectedVibe);
  const { recordGame, getBestSession } = usePlayerStats();

  const isCultureG = selectedMode === "culture_generale";
  const modeName = useMemo(
    () => GAME_MODES.find(m => m.id === selectedMode)?.name ?? "",
    [selectedMode]
  );

  const { bravest, laziest, sessionScore } = useMemo(() => {
    let _bravest = players[0]?.name || "";
    let bestScore = -1;
    let _laziest = players[0]?.name || "";
    let worstScore = -Infinity;

    Object.entries(stats.playerStats).forEach(([name, s]) => {
      const score = s.played - s.refused;
      if (score > bestScore) { bestScore = score; _bravest = name; }
      const wscore = s.refused - s.played;
      if (wscore > worstScore) { worstScore = wscore; _laziest = name; }
    });

    return { bravest: _bravest, laziest: _laziest, sessionScore: stats.cardsPlayed - stats.refusals };
  }, [stats, players]);

  // Record game in useEffect (side effect), with guard against double-fire in StrictMode
  const hasRecorded = useRef(false);
  const sessionRef = useRef<ReturnType<typeof recordGame> | null>(null);
  const bestSessionRef = useRef<ReturnType<typeof getBestSession>>(null);

  useEffect(() => {
    if (!hasRecorded.current) {
      hasRecorded.current = true;
      sessionRef.current = recordGame({
        players: players.map(p => p.name),
        mode: selectedMode ?? "",
        vibe: selectedVibe ?? "",
        cardsPlayed: stats.cardsPlayed,
        refusals: stats.refusals,
        score: sessionScore,
        bravest,
        quizScore: isCultureG ? stats.quizScore : undefined,
      });
      bestSessionRef.current = getBestSession();
    }
  }); // intentionally no deps — runs once via ref guard

  const thisSession = sessionRef.current;
  const bestSession = bestSessionRef.current ?? getBestSession();

  const isNewRecord = thisSession?.id === bestSession?.id && sessionScore > 0;
  const ending = useMemo(() => endings[Math.floor(Math.random() * endings.length)], []);

  const handleShare = async () => {
    const blob = await generateShareImage({
      bravest,
      cardsPlayed: stats.cardsPlayed,
      refusals: stats.refusals,
      mode: modeName,
      vibe: selectedVibe ?? "",
    });
    const text = `Je viens de finir une partie de Malaky ! 🎉\n${stats.cardsPlayed} cartes · ${bravest} était le plus brave\n\nmalaky.app`;
    if (blob && navigator.share) {
      try {
        const file = new File([blob], "malaky-score.png", { type: "image/png" });
        await navigator.share({ title: "Malaky", text, files: [file] });
        return;
      } catch (e) {
        console.warn("Share failed:", e);
      }
    }
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "malaky-score.png"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Image téléchargée !");
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 gradient-surface safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="text-6xl mb-4">{isNewRecord ? "🏆" : "🎉"}</div>
        <h2 className="text-3xl font-black text-foreground mb-2">
          {isNewRecord ? "Nouveau record !" : "Partie terminée !"}
        </h2>
        <p className="text-muted-foreground">{ending}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-3 mb-10"
      >
        <div className="card-game text-center">
          <p className="text-sm text-muted-foreground mb-1">Cette partie</p>
          <div className="flex items-center justify-center gap-2">
            <Zap size={20} className="text-primary" />
            <span className="text-3xl font-black text-foreground">{sessionScore} pts</span>
          </div>
        </div>

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
            <p className="text-xs text-muted-foreground">bonnes réponses</p>
          </div>
        )}

        <div className="card-game space-y-2">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/20 p-3">
              <Trophy className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Le plus téméraire</p>
              <p className="text-lg font-bold text-foreground">{bravest}</p>
            </div>
          </div>
          {laziest !== bravest && (
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <span className="text-xl">😴</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Le plus fainéant</p>
                <p className="text-lg font-bold text-foreground">{laziest}</p>
              </div>
            </div>
          )}
        </div>

        {bestSession && !isNewRecord && bestSession.score > 0 && (
          <div className="card-game">
            <p className="text-sm font-bold text-foreground mb-2">🥇 Record à battre</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  {bestSession.players.slice(0, 3).join(", ")}
                  {bestSession.players.length > 3 ? "…" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {bestSession.mode} · {bestSession.cardsPlayed} cartes
                </p>
              </div>
              <span className="text-lg font-black text-primary">{bestSession.score} pts</span>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <button
          onClick={() => setScreen("vibe")}
          className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw size={20} /> Rejouer
        </button>
        <button
          onClick={() => resetGame()}
          className="w-full rounded-2xl bg-card px-6 py-4 text-lg font-semibold text-foreground flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          Nouvelle partie
        </button>
        <button
          onClick={handleShare}
          className="w-full rounded-2xl bg-card/50 px-6 py-3 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Share2 size={16} /> Partager le score
        </button>
      </motion.div>
    </div>
  );
};

export default EndScreen;
