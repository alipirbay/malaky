import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Share2 } from "lucide-react";
import { getDailyChallenge } from "@/hooks/useDailyChallenge";
import { toast } from "sonner";

const CARD_TYPE_LABELS: Record<string, string> = {
  truth: "Vérité", dare: "Action", vote: "Vote", group: "Groupe",
};

const DailyChallenge = () => {
  const [revealed, setRevealed] = useState(false);
  const card = getDailyChallenge();

  const cardText = card.text
    .replace("{player}", "Toi")
    .replace("{player2}", "Quelqu'un");

  const handleShare = async () => {
    const text = `🎯 Défi du jour Malaky :\n\n"${cardText}"\n\nRespecteras-tu le défi ? 👀\nmalaky.app`;
    if (navigator.share) {
      try { await navigator.share({ title: "Défi du jour Malaky", text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    toast.success("Défi copié !");
  };

  return (
    <div className="w-full">
      <div className="card-game relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full bg-accent/20 p-2">
            <Zap size={16} className="text-accent" />
          </div>
          <span className="text-sm font-bold text-foreground">
            Défi du jour
          </span>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {CARD_TYPE_LABELS[card.card_type] ?? card.card_type}
          </span>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full rounded-2xl bg-primary/10 px-4 py-4 text-sm font-bold text-primary transition-transform active:scale-95"
          >
            👁️ Révéler mon défi du jour
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-base font-bold text-foreground leading-relaxed mb-3">
              {cardText}
            </p>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 size={14} /> Partager ce défi
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
