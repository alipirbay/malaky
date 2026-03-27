import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useHeadsUpStore } from "@/store/headsUpStore";
import { ArrowLeft, Sparkles, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedDecks, cacheDeck } from "./cache";

const AiThemeScreen = () => {
  const setScreen = useHeadsUpStore((s) => s.setScreen);
  const selectCustomDeck = useHeadsUpStore((s) => s.selectCustomDeck);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<{ theme: string; count: number; words: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cachedDecks = getCachedDecks();

  const handleGenerate = useCallback(async () => {
    const trimmed = theme.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setError("Le thème doit faire entre 2 et 100 caractères.");
      return;
    }
    setLoading(true);
    setError(null);
    setGenerated(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-guess-rush-theme", {
        body: { theme: trimmed },
      });

      if (fnError) throw new Error(fnError.message || "Erreur de génération");

      const words = data?.words as string[] | undefined;
      if (!words || words.length < 10) throw new Error("Pas assez de mots générés. Essaie un autre thème.");

      setGenerated({ theme: trimmed, count: words.length, words });
      cacheDeck({ theme: trimmed, wordCount: words.length, createdAt: Date.now(), words });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      if (msg.includes("429")) setError("Trop de requêtes. Attends quelques secondes.");
      else if (msg.includes("402")) setError("Crédits IA épuisés.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, [theme]);

  const handlePlay = useCallback((words: string[], deckTheme: string) => {
    selectCustomDeck(deckTheme, words);
  }, [selectCustomDeck]);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("categories")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour aux catégories">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">✨ Thème IA</h2>
          <p className="text-sm text-muted-foreground">Tilt Up — Deck personnalisé</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Quel thème veux-tu ?</label>
          <input
            value={theme}
            onChange={(e) => { setTheme(e.target.value); setGenerated(null); }}
            placeholder="Ex : Célébrités malgaches, Films Disney, Plats japonais..."
            maxLength={100}
            className="w-full rounded-2xl bg-card px-4 py-4 text-foreground placeholder:text-muted-foreground/40 border border-border focus:border-primary focus:outline-none text-sm"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {!generated && (
          <button
            onClick={handleGenerate}
            disabled={loading || theme.trim().length < 2}
            className="w-full rounded-2xl gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground glow-primary disabled:opacity-40 transition-transform active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Génération en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={20} /> Générer le deck
              </span>
            )}
          </button>
        )}
      </div>

      {generated && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="rounded-2xl bg-card p-5 mb-4 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-foreground mb-1">Deck prêt !</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Thème : <strong>{generated.theme}</strong>
            </p>
            <p className="text-2xl font-black text-primary">{generated.count} mots à deviner</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => handlePlay(generated.words, generated.theme)}
              className="w-full rounded-2xl gradient-primary px-4 py-4 text-lg font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
            >
              Jouer ! 🚀
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => { setGenerated(null); handleGenerate(); }}
                disabled={loading}
                className="flex-1 rounded-2xl bg-card px-4 py-3 font-semibold text-foreground transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Regénérer
              </button>
              <button
                onClick={() => { setGenerated(null); setTheme(""); }}
                className="flex-1 rounded-2xl bg-card px-4 py-3 font-semibold text-foreground transition-transform active:scale-95"
              >
                Changer de thème
              </button>
            </div>
            <button
              onClick={() => { setGenerated(null); setScreen("categories"); }}
              className="w-full rounded-2xl bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-transform active:scale-95"
            >
              ← Retour aux catégories
            </button>
          </div>
        </motion.div>
      )}

      {cachedDecks.length > 0 && !generated && (
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Decks récents</h3>
          <div className="space-y-2">
            {cachedDecks.map((deck, i) => (
              <button
                key={i}
                onClick={() => handlePlay(deck.words, deck.theme)}
                className="w-full rounded-xl bg-card p-3 text-left transition-transform active:scale-[0.97]"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{deck.theme}</p>
                    <p className="text-xs text-muted-foreground">{deck.wordCount} mots</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/50" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiThemeScreen;
