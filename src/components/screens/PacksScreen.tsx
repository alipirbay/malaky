import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { STORE_PACKS } from "@/data/config";
import { ArrowLeft, Check, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Vibe } from "@/data/types";
import PrivacyModal from "@/components/PrivacyModal";

const PacksScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const unlockVibe = useGameStore((s) => s.unlockVibe);
  const unlockBundle = useGameStore((s) => s.unlockBundle);
  const unlockedVibes = useGameStore((s) => s.unlockedVibes);
  const [cguOpen, setCguOpen] = useState(false);

  const handleBuy = async (pack: (typeof STORE_PACKS)[number]) => {
    if (pack.id === "bundle_all") {
      const allVibes: Vibe[] = ["hot", "chaos", "couple", "apero", "mada", "confessions", "vip", "afterdark", "difficile", "expert"];
      unlockBundle(allVibes);
      toast.success("Pack débloqué ! Téléchargement des cartes en cours...");
      const { downloadPack } = await import("@/lib/packManager");
      const results = await Promise.allSettled(allVibes.map(v => downloadPack(v)));
      const succeeded = results.filter(r => r.status === "fulfilled" && r.value).length;
      const failed = allVibes.length - succeeded;
      if (failed > 0) {
        toast.warning(`${succeeded}/${allVibes.length} packs téléchargés. ${failed} échoué(s) — rejoue en ligne pour les récupérer.`);
      } else {
        toast.success("Tous les packs sont prêts ! Jouable hors-ligne ✈️");
      }
    } else if (pack.vibe) {
      unlockVibe(pack.vibe as Vibe);
      toast.success(`Pack "${pack.name}" débloqué ! Téléchargement...`);
      const { downloadPack } = await import("@/lib/packManager");
      const success = await downloadPack(pack.vibe as Vibe);
      if (success) {
        toast.success("Cartes prêtes ! Jouable hors-ligne ✈️");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Boutique</h2>
          <p className="text-sm text-muted-foreground">Débloque de nouvelles ambiances</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-card/80 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Inclus gratuitement</p>
        <p className="mt-1">😇 Soft (famille) • 😏 Fun (amis)</p>
      </div>

      {/* Adult content warning */}
      <div className="mb-4 rounded-2xl bg-destructive/5 border border-destructive/10 p-4">
        <p className="text-sm font-semibold text-destructive">⚠️ Contenu mature</p>
        <p className="text-xs text-muted-foreground mt-1">
          Les packs Hot 🔥 et After Dark 🔞 contiennent du contenu pour adultes (+18 ans).
          Une confirmation d'âge sera demandée avant de jouer.
        </p>
      </div>

      <div className="space-y-3 pb-6 overflow-y-auto flex-1">
        {STORE_PACKS.map((pack, i) => {
          const purchased =
            pack.id === "bundle_all"
              ? Object.values(unlockedVibes).every(Boolean)
              : pack.vibe
                ? unlockedVibes[pack.vibe as Vibe]
                : false;

          const isBundle = pack.id.startsWith("bundle");
          const isAdult = pack.id === "afterdark" || pack.id === "hot";

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`card-game flex items-center gap-3 ${isBundle ? "border-2 border-accent/30" : ""}`}
            >
              <span className="text-2xl">{pack.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-foreground text-sm">{pack.name}</h3>
                  {isBundle && <Sparkles size={12} className="text-accent" />}
                  {isAdult && (
                    <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-bold text-destructive">18+</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{pack.description}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">{pack.cardCount}+ cartes</p>
              </div>

              {purchased ? (
                <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary shrink-0">
                  <Check size={12} /> Acheté
                </span>
              ) : (
                <button
                  onClick={() => handleBuy(pack)}
                  className="flex items-center gap-1 shrink-0 rounded-full gradient-mango px-3 py-2 text-xs font-bold text-mango-foreground transition-transform active:scale-95"
                >
                  <Lock size={10} /> {pack.price}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setScreen("home")}
        className="rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground transition-transform active:scale-95"
      >
        Retour à l'accueil
      </button>

      <p className="text-center text-[10px] text-muted-foreground/40 mt-3">
        Prix en Ariary malgache (MGA) · Achat unique, sans abonnement
        <br />
        <button
          onClick={() => setCguOpen(true)}
          className="underline text-muted-foreground/60"
        >
          Conditions
        </button>
        {" · "}
        <button
          onClick={() => window.open("/privacy.html", "_blank")}
          className="underline text-muted-foreground/60"
        >
          Confidentialité
        </button>
      </p>

      <PrivacyModal open={cguOpen} onClose={() => setCguOpen(false)} type="cgu" />
    </div>
  );
};

export default PacksScreen;
