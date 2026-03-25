import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import malakyLogo from "@/assets/malaky-logo.png";

interface FirstLaunchModalProps {
  onAccept: () => void;
  onShowPrivacy: () => void;
  onShowCGU: () => void;
}

const FirstLaunchModal = ({ onAccept, onShowPrivacy, onShowCGU }: FirstLaunchModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-4xl font-black tracking-tight text-gradient mb-2">MALAKY</h1>
        <p className="text-sm text-muted-foreground mb-8">Le jeu de soirée des Malgaches 🇲🇬</p>

        <div className="rounded-2xl bg-card p-5 text-left space-y-4 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            En continuant, vous acceptez nos{" "}
            <button onClick={onShowCGU} className="underline text-primary font-semibold">
              Conditions d'utilisation
            </button>{" "}
            et notre{" "}
            <button onClick={onShowPrivacy} className="underline text-primary font-semibold">
              Politique de confidentialité
            </button>.
          </p>

          <div className="flex items-start gap-2">
            <Shield size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Certains packs contiennent du contenu adulte (+18). Une vérification d'âge sera demandée.
            </p>
          </div>
        </div>

        <button
          onClick={onAccept}
          className="w-full rounded-2xl gradient-primary py-4 text-base font-bold text-primary-foreground glow-primary transition-transform active:scale-95"
        >
          Commencer à jouer
        </button>

        <p className="text-[10px] text-muted-foreground/30 mt-6">
          Malaky v1.0 · APli · Antananarivo 🇲🇬
        </p>
      </motion.div>
    </div>
  );
};

export default FirstLaunchModal;
