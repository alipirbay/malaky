import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface AgeGateModalProps {
  packName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AgeGateModal = ({ packName, onConfirm, onCancel }: AgeGateModalProps) => {
  const [checked, setChecked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-destructive/10 p-2.5">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Contenu adulte</h3>
            <p className="text-sm text-muted-foreground">{packName}</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <p className="text-sm font-semibold text-destructive/80">
            ⚠️ Ce pack contient du contenu réservé aux adultes (+18 ans)
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Il inclut des questions et défis à caractère sexuel, des références à l'alcool
            et du contenu explicite. Strictement réservé aux personnes majeures.
          </p>
        </div>

        <button
          onClick={() => setChecked(!checked)}
          className="flex items-start gap-3 mb-5 text-left w-full"
        >
          <div
            className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
              checked ? "bg-primary border-primary" : "border-muted-foreground/30"
            }`}
          >
            {checked && (
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground">
                <path d="M2 6l3 3 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-xs text-muted-foreground leading-relaxed">
            Je confirme avoir 18 ans ou plus et accepter de voir du contenu adulte.
          </span>
        </button>

        <div className="space-y-2">
          <button
            onClick={onConfirm}
            disabled={!checked}
            className="w-full rounded-2xl gradient-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-30 transition-transform active:scale-95"
          >
            Confirmer mon âge et continuer
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-2xl bg-secondary py-3 text-sm font-semibold text-muted-foreground transition-transform active:scale-95"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgeGateModal;
