import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { VIBES } from "@/data/cards";
import { ArrowLeft, Lock } from "lucide-react";
import type { Vibe } from "@/data/cards";

const vibeStyles: Record<Vibe, string> = {
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
};

/* Recognizable outline icons per vibe, placed densely across each card */
const VibePattern = ({ vibe }: { vibe: Vibe }) => {
  const patterns: Record<Vibe, React.ReactNode> = {
    soft: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Cloud */}
          <path d="M25 35a8 8 0 0 1 15 0h1a5 5 0 0 1 0 10H22a6 6 0 0 1 0-12z"/>
          {/* Star */}
          <path d="M70 20l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>
          {/* Butterfly */}
          <path d="M105 30c-6-8-15-5-12 2 3 7 12 5 12 5s9 2 12-5c3-7-6-10-12-2z"/>
          {/* Rainbow arc */}
          <path d="M140 48a18 18 0 0 1 36 0" /><path d="M144 48a14 14 0 0 1 28 0"/>
          {/* Small cloud */}
          <path d="M195 30a5 5 0 0 1 10 0 4 4 0 0 1 0 7h-13a4 4 0 0 1 0-8z"/>
          {/* Sparkle */}
          <path d="M240 25l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
          {/* Sun */}
          <circle cx="280" cy="35" r="6"/><path d="M280 25v-4M280 45v4M270 35h-4M290 35h4M273 28l-3-3M287 42l3 3M273 42l-3 3M287 28l3-3"/>
        </g>
      </svg>
    ),
    fun: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Balloon */}
          <ellipse cx="25" cy="25" rx="9" ry="11"/><path d="M25 36l-1 3 2 0-1 3"/><path d="M25 42v10"/>
          {/* Confetti */}
          <rect x="60" y="20" width="6" height="6" rx="1" transform="rotate(25 63 23)"/>
          <rect x="80" y="38" width="5" height="5" rx="1" transform="rotate(-15 82 40)"/>
          {/* Party hat */}
          <path d="M110 50l12-35 12 35z"/><path d="M114 42h16"/><ellipse cx="122" cy="15" rx="4" ry="3"/>
          {/* Smiley */}
          <circle cx="165" cy="32" r="12"/><circle cx="160" cy="28" r="2"/><circle cx="170" cy="28" r="2"/><path d="M158 37a8 8 0 0 0 14 0"/>
          {/* Musical note */}
          <path d="M205 20v25"/><circle cx="205" cy="45" r="5"/><path d="M205 20l15-5v5l-15 5"/>
          {/* Star burst */}
          <path d="M250 30l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
        </g>
      </svg>
    ),
    hot: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Flame */}
          <path d="M20 50c0-15 8-22 8-30 4 8 10 12 10 30a14 14 0 0 1-18 0z"/><path d="M24 50c0-8 4-12 4-18 2 5 5 8 5 18"/>
          {/* Lips */}
          <path d="M65 32c5-6 12-6 17 0-5 8-12 8-17 0z"/><path d="M65 32c5 4 12 4 17 0"/>
          {/* Chili pepper */}
          <path d="M110 15c2-5 5-7 8-5s3 8-2 20c-3 8-8 15-12 18"/><path d="M110 15c-3-4-2-8 2-10"/>
          {/* Heart */}
          <path d="M155 30c0-6 5-11 10-11s10 5 10 11c0 12-10 20-10 20s-10-8-10-20z"/>
          {/* Fire spark */}
          <path d="M205 25l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>
          {/* Small flame */}
          <path d="M250 50c0-10 5-15 5-22 3 6 7 10 7 22a10 10 0 0 1-12 0z"/>
        </g>
      </svg>
    ),
    chaos: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Skull */}
          <path d="M15 35a12 12 0 1 1 24 0v4l-4 5h-16l-4-5z"/><circle cx="22" cy="31" r="3"/><circle cx="34" cy="31" r="3"/><path d="M25 40v4M28 40v4M31 40v4"/>
          {/* Lightning */}
          <path d="M70 10l-8 22h10l-10 28 20-30h-10z"/>
          {/* Bomb */}
          <circle cx="125" cy="40" r="12"/><path d="M133 28l5-10"/><path d="M136 16l3-2M140 18l2 3M136 20l4 1"/>
          {/* Explosion */}
          <path d="M180 35l5-15 5 10 8-8-3 12 10 2-10 5 5 10-10-5-5 10-3-12-10 3 8-12z"/>
          {/* Dice */}
          <rect x="235" y="22" width="22" height="22" rx="3" transform="rotate(10 246 33)"/><circle cx="242" cy="29" r="1.5"/><circle cx="250" cy="37" r="1.5"/><circle cx="246" cy="33" r="1.5"/>
        </g>
      </svg>
    ),
    couple: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Big heart */}
          <path d="M20 30c0-7 6-12 12-12s12 5 12 12c0 14-12 22-12 22S20 44 20 30z"/>
          {/* Ring */}
          <circle cx="75" cy="35" r="9"/><path d="M70 26l5-6 5 6"/><path d="M72 26h6"/>
          {/* Love letter */}
          <rect x="100" y="22" width="25" height="18" rx="2"/><path d="M100 24l12.5 10L125 24"/>
          {/* Small hearts scattered */}
          <path d="M150 20c0-4 3-6 6-6s6 2 6 6c0 7-6 11-6 11s-6-4-6-11z"/>
          <path d="M185 40c0-3 2-5 5-5s5 2 5 5c0 5-5 9-5 9s-5-4-5-9z"/>
          {/* Rose */}
          <circle cx="230" cy="30" r="8"/><path d="M226 30c4-3 8 0 8 0s-1 5-4 4"/><path d="M230 38v18"/><path d="M230 45c-5-2-7 2-7 2"/>
          {/* Tiny heart */}
          <path d="M270 25c0-3 2-5 4-5s4 2 4 5c0 5-4 8-4 8s-4-3-4-8z"/>
        </g>
      </svg>
    ),
    apero: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Wine glass */}
          <path d="M15 15l-5 18a8 8 0 0 0 16 0l-5-18z"/><path d="M18 33v15"/><path d="M12 48h12"/>
          {/* Beer mug */}
          <rect x="55" y="18" width="16" height="28" rx="3"/><path d="M71 24h6a4 4 0 0 1 0 16h-6"/><path d="M58 18c2-4 5-6 10-4"/>
          {/* Cheese */}
          <path d="M105 45l25-15v20z"/><circle cx="115" cy="42" r="2"/><circle cx="122" cy="38" r="1.5"/>
          {/* Cocktail */}
          <path d="M150 15l-12 20h24z"/><path d="M150 35v15"/><path d="M142 50h16"/><circle cx="157" cy="20" r="3"/><path d="M157 20l8-8"/>
          {/* Olive on pick */}
          <path d="M200 15v35"/><circle cx="200" cy="25" r="5"/><ellipse cx="200" cy="25" rx="2" ry="3"/>
          {/* Pretzel */}
          <path d="M240 25a10 10 0 0 1 10 10 10 10 0 0 1-20 0 10 10 0 0 1 10-10z"/><path d="M235 22l5 8 5-8"/>
          {/* Bottle */}
          <path d="M275 18h8v6l2 4v20h-12v-20l2-4z"/><path d="M277 12h4v6h-4z"/>
        </g>
      </svg>
    ),
    mada: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Palm tree */}
          <path d="M25 55v-30"/><path d="M25 25c-10-3-15 3-15 3"/><path d="M25 25c10-3 15 3 15 3"/><path d="M25 28c-8 0-12 5-12 5"/><path d="M25 28c8 0 12 5 12 5"/>
          {/* Baobab */}
          <path d="M75 55v-20h10v20"/><path d="M72 35a12 12 0 0 1 16 0"/><path d="M70 35c-5-8 0-15 0-15"/><path d="M90 35c5-8 0-15 0-15"/>
          {/* Vanilla pod */}
          <path d="M120 15c2 12 0 30-5 40"/><path d="M122 15c2 12 4 30-1 40"/>
          {/* Chameleon */}
          <circle cx="175" cy="30" r="10"/><path d="M185 30h12c0 8-6 10-6 10"/><circle cx="172" cy="28" r="2.5"/><path d="M165 35c-5 5-5 15-5 15"/>
          {/* Flower */}
          <circle cx="230" cy="35" r="4"/><circle cx="230" cy="27" r="4"/><circle cx="230" cy="43" r="4"/><circle cx="224" cy="31" r="4"/><circle cx="236" cy="31" r="4"/><circle cx="224" cy="39" r="4"/><circle cx="236" cy="39" r="4"/>
          {/* Zebu horn */}
          <path d="M270 50c0-15 5-30 12-35"/><path d="M280 50c0-15-5-30-12-35"/>
        </g>
      </svg>
    ),
    confessions: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Theater mask happy */}
          <path d="M15 20a15 15 0 0 1 25 0v10a15 13 0 0 1-25 0z"/><circle cx="23" cy="28" r="2.5"/><circle cx="34" cy="28" r="2.5"/><path d="M24 37a6 6 0 0 0 10 0"/>
          {/* Theater mask sad */}
          <path d="M70 20a15 15 0 0 1 25 0v10a15 13 0 0 1-25 0z"/><circle cx="78" cy="28" r="2.5"/><circle cx="89" cy="28" r="2.5"/><path d="M79 40a6 6 0 0 1 8 0"/>
          {/* Key */}
          <circle cx="130" cy="25" r="7"/><path d="M137 25h20"/><path d="M150 25v6"/><path d="M155 25v4"/>
          {/* Eye */}
          <path d="M180 35c8-12 22-12 30 0-8 12-22 12-30 0z"/><circle cx="195" cy="35" r="5"/><circle cx="195" cy="35" r="2"/>
          {/* Whisper bubble */}
          <path d="M240 20c12 0 20 6 20 14s-8 14-20 14c-4 0-7-1-10-2l-8 5 3-7c-3-3-5-6-5-10 0-8 8-14 20-14z"/>
          <circle cx="233" cy="34" r="1.5"/><circle cx="240" cy="34" r="1.5"/><circle cx="247" cy="34" r="1.5"/>
        </g>
      </svg>
    ),
    vip: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Crown */}
          <path d="M10 45l5-20 8 10 8-15 8 15 8-10 5 20z"/><path d="M10 45h42"/>
          {/* Diamond */}
          <path d="M80 20h20l-10 25z"/><path d="M80 20l4-8h12l4 8"/>
          {/* Champagne glass */}
          <path d="M125 15l-6 18a6 6 0 0 0 12 0l-6-18z"/><path d="M125 33v14"/><path d="M119 47h12"/><circle cx="130" cy="18" r="2"/>
          {/* Star */}
          <path d="M175 15l5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z"/>
          {/* Trophy */}
          <path d="M220 18h20v15a10 10 0 0 1-20 0z"/><path d="M220 25h-6a6 6 0 0 1 6-6"/><path d="M240 25h6a6 6 0 0 0-6-6"/><path d="M230 43v5"/><path d="M224 48h12"/>
          {/* Gem */}
          <path d="M270 25h16l-8 20z"/><path d="M270 25l3-6h10l3 6"/><path d="M278 25v20"/>
        </g>
      </svg>
    ),
    afterdark: (
      <svg viewBox="0 0 300 70" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <g fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Peach */}
          <path d="M20 50c0-14 6-25 12-25s12 11 12 25"/><path d="M32 25v-5"/><path d="M27 50a5 10 0 0 0 10 0"/>
          {/* Eggplant */}
          <path d="M75 15c-3-3 0-8 5-7"/><path d="M77 15c8 2 12 10 10 25-1 10-6 15-12 13s-8-10-7-20c1-10 5-16 9-18z"/>
          {/* Cherry */}
          <circle cx="130" cy="42" r="8"/><circle cx="148" cy="38" r="8"/><path d="M130 34c2-10 10-18 15-20"/><path d="M148 30c-2-10-5-15-5-22"/>
          {/* Lips */}
          <path d="M180 35c6-8 14-8 20 0-6 10-14 10-20 0z"/><path d="M180 35c6 5 14 5 20 0"/>
          {/* Devil horns */}
          <path d="M230 45a12 12 0 1 1 24 0"/><path d="M232 35c-3-12 2-20 2-20"/><path d="M252 35c3-12-2-20-2-20"/>
          {/* Flame */}
          <path d="M280 55c0-12 6-18 6-25 3 6 6 10 6 25a10 10 0 0 1-12 0z"/>
        </g>
      </svg>
    ),
  };

  return patterns[vibe];
};

const VibeScreen = () => {
  const { setVibe, setScreen, unlockedVibes } = useGameStore();

  const handleSelect = (vibe: Vibe, free: boolean) => {
    if (!free && !unlockedVibes[vibe]) {
      setScreen("packs");
      return;
    }
    setVibe(vibe);
    setTimeout(() => {
      useGameStore.getState().startGame();
    }, 0);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => setScreen("mode")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Choisis l'ambiance</h2>
          <p className="text-sm text-muted-foreground">Soft et Fun inclus. Les autres dans Packs.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 pb-4 overflow-y-auto">
        {VIBES.map((vibe, i) => {
          const isUnlocked = vibe.free || unlockedVibes[vibe.id];

          return (
            <motion.button
              key={vibe.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(vibe.id, vibe.free)}
              className={`relative w-full rounded-2xl border-0 p-4 text-left overflow-hidden transition-transform active:scale-[0.97] ${vibeStyles[vibe.id]} ${
                isUnlocked ? "" : "opacity-80"
              }`}
            >
              {/* Dense recognizable outlined icons */}
              <div className="absolute inset-0 pointer-events-none select-none opacity-[0.12]">
                <VibePattern vibe={vibe.id} />
              </div>

              <div className="relative flex items-center gap-3">
                <span className="text-3xl">{vibe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">{vibe.name}</h3>
                    {!isUnlocked && <Lock size={14} className="text-foreground/70" />}
                  </div>
                  <p className="text-xs text-foreground/70 truncate">{vibe.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-foreground">
                  {isUnlocked ? (vibe.free ? "Gratuit" : "✓") : vibe.priceLabel}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeScreen;
