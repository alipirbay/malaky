import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { GAME_MODES } from "@/data/config";
import { ArrowLeft, Lock } from "lucide-react";

type ModeEntry = typeof GAME_MODES[number];

const SECTIONS: { title: string; subtitle: string; ids: string[] }[] = [
  {
    title: "🎉 Party",
    subtitle: "2+ joueurs • Ambiance garantie",
    ids: ["truth_dare", "never_have_i_ever", "most_likely", "would_you_rather", "guess_rush"],
  },
  {
    title: "🧠 Quiz",
    subtitle: "Solo ou en groupe",
    ids: ["culture_generale", "quiz_duel"],
  },
];

const colorMap: Record<string, string> = {
  coral: "gradient-coral glow-coral",
  primary: "gradient-primary glow-primary",
  mango: "gradient-mango glow-mango",
  emerald: "gradient-emerald glow-emerald",
  violet: "gradient-violet glow-violet",
  rose: "gradient-rose glow-rose",
  sky: "gradient-sky glow-sky",
};

const ModeScreen = () => {
  const setMode = useGameStore((s) => s.setMode);
  const setScreen = useGameStore((s) => s.setScreen);
  const players = useGameStore((s) => s.players);

  const handleSelectMode = (modeId: ModeEntry["id"]) => {
    setMode(modeId);
    if (modeId === "quiz_duel") {
      setScreen("duel_hub");
    } else {
      setScreen("vibe");
    }
  };

  const modesById = Object.fromEntries(GAME_MODES.map((m) => [m.id, m]));

  let cardIndex = 0;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("players")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour aux joueurs">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis le mode</h2>
          <p className="text-sm text-muted-foreground">{GAME_MODES.length} modes disponibles</p>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {SECTIONS.map((section) => {
          const modes = section.ids.map((id) => modesById[id]).filter(Boolean) as ModeEntry[];
          if (modes.length === 0) return null;

          return (
            <div key={section.title}>
              <div className="mb-2.5 px-1">
                <h3 className="text-sm font-bold text-foreground/80 tracking-wide">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.subtitle}</p>
              </div>
              <div className="space-y-2.5" role="radiogroup" aria-label={section.title}>
                {modes.map((mode) => {
                  const i = cardIndex++;
                  const minPlayers = mode.minPlayers ?? 2;
                  const hasEnoughPlayers = players.length >= minPlayers;
                  const isDisabled = !hasEnoughPlayers;

                  return (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      role="radio"
                      aria-checked={false}
                      onClick={() => !isDisabled && handleSelectMode(mode.id)}
                      disabled={isDisabled}
                      className={`w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.98] ${colorMap[mode.color] || "gradient-primary glow-primary"} ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mode.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-foreground leading-tight">{mode.name}</h3>
                          <p className="text-xs text-foreground/60 truncate">{mode.subtitle}</p>
                          {isDisabled && (
                            <p className="text-[10px] text-foreground/40 mt-0.5 flex items-center gap-1">
                              <Lock size={9} /> {minPlayers}+ joueurs requis
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-[10px] font-bold text-foreground/70 uppercase tracking-wide whitespace-nowrap">
                          {mode.badge}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModeScreen;
