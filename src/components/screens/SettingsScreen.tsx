import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Vibrate,
  Shield,
  FileText,
  Trash2,
  Mail,
  ChevronRight,
  AlertTriangle,
  Smartphone,
  HelpCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import PrivacyModal from "@/components/PrivacyModal";

const SettingsScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const vibrationEnabled = useGameStore((s) => s.vibrationEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const setSoundVolume = useGameStore((s) => s.setSoundVolume);
  const toggleVibration = useGameStore((s) => s.toggleVibration);
  const resetGame = useGameStore((s) => s.resetGame);
  const unlockedVibes = useGameStore((s) => s.unlockedVibes);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [cguOpen, setCguOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const purchasedPacksCount = Object.values(unlockedVibes).filter(Boolean).length - 4;

  const handleResetProgress = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    resetGame();
    useGameStore.setState({
      unlockedVibes: {
        soft: true, fun: true, hot: false, chaos: false, couple: false,
        apero: false, mada: false, confessions: false, vip: false, afterdark: false,
        facile: true, intermediaire: true, difficile: false, expert: false,
      },
      soundEnabled: true,
      soundVolume: 80,
      vibrationEnabled: true,
      pendingTransactionId: null,
    });
    setShowResetConfirm(false);
    toast.success("Données réinitialisées");
  };

  const handleContact = () => {
    window.open("mailto:contact@malaky.app?subject=Support Malaky", "_blank");
  };

  const rowClass = "w-full card-game flex items-center gap-4";
  const labelClass = "flex-1 font-medium text-foreground text-sm";

  return (
    <>
      <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setScreen("home")}
            className="rounded-xl bg-card p-2.5 text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pb-8">

          {/* ─── SECTION : SON & VIBRATIONS ─── */}
          <div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
              Son & Vibrations
            </p>
            <div className="space-y-2">
              <div className={rowClass}>
                {soundEnabled ? (
                  <Volume2 size={20} className="text-muted-foreground shrink-0" />
                ) : (
                  <VolumeX size={20} className="text-muted-foreground shrink-0" />
                )}
                <span className={labelClass}>Sons du jeu</span>
                <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
              </div>

              {soundEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={rowClass}
                >
                  <div className="w-5" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Volume
                  </span>
                  <Slider
                    value={[soundVolume]}
                    onValueChange={(v) => setSoundVolume(v[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs font-bold text-muted-foreground w-8 text-right">
                    {soundVolume}%
                  </span>
                </motion.div>
              )}

              <div className={rowClass}>
                <Vibrate size={20} className="text-muted-foreground shrink-0" />
                <span className={labelClass}>Vibrations</span>
                <Switch checked={vibrationEnabled} onCheckedChange={toggleVibration} />
              </div>
            </div>
          </div>

          {/* ─── SECTION : MON COMPTE ─── */}
          <div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
              Mon compte
            </p>
            <div className="space-y-2">
              <div className={rowClass}>
                <Smartphone size={20} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">Packs achetés</p>
                  <p className="text-xs text-muted-foreground">
                    {purchasedPacksCount > 0
                      ? `${purchasedPacksCount} pack${purchasedPacksCount > 1 ? "s" : ""} débloqué${purchasedPacksCount > 1 ? "s" : ""}`
                      : "Aucun pack acheté pour l'instant"}
                  </p>
                </div>
                <button
                  onClick={() => setScreen("packs")}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  Voir
                </button>
              </div>

              <button onClick={handleContact} className={`${rowClass} text-left`}>
                <Mail size={20} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">Restaurer mes achats</p>
                  <p className="text-xs text-muted-foreground">Changé d'appareil ? Contactez-nous</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
              </button>
            </div>
          </div>

          {/* ─── SECTION : LÉGAL ─── */}
          <div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
              Légal
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setPrivacyOpen(true)}
                className={`${rowClass} text-left`}
              >
                <Shield size={20} className="text-muted-foreground shrink-0" />
                <span className={labelClass}>Politique de confidentialité</span>
                <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
              </button>

              <button
                onClick={() => setCguOpen(true)}
                className={`${rowClass} text-left`}
              >
                <FileText size={20} className="text-muted-foreground shrink-0" />
                <span className={labelClass}>Conditions d'utilisation</span>
                <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
              </button>

              <button onClick={handleContact} className={`${rowClass} text-left`}>
                <Mail size={20} className="text-muted-foreground shrink-0" />
                <span className={labelClass}>Nous contacter</span>
                <span className="text-xs text-muted-foreground/50">contact@malaky.app</span>
              </button>

              <button
                onClick={() => window.open("/support.html", "_blank")}
                className={`${rowClass} text-left`}
              >
                <HelpCircle size={20} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">Page de support</p>
                  <p className="text-xs text-muted-foreground">malaky.app/support</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
              </button>
            </div>
          </div>

          {/* ─── SECTION : DANGER ZONE ─── */}
          <div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
              Données
            </p>
            <button
              onClick={handleResetProgress}
              className={`${rowClass} text-left ${showResetConfirm ? "border-2 border-destructive/30" : ""}`}
            >
              {showResetConfirm ? (
                <AlertTriangle size={20} className="text-destructive shrink-0" />
              ) : (
                <Trash2 size={20} className="text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${showResetConfirm ? "text-destructive" : "text-foreground"}`}>
                  {showResetConfirm ? "Confirmer la réinitialisation ?" : "Réinitialiser les données"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {showResetConfirm
                    ? "Cette action est irréversible. Appuie encore pour confirmer."
                    : "Efface les préférences et l'historique local"}
                </p>
              </div>
              {showResetConfirm && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowResetConfirm(false); }}
                  className="rounded-lg bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground ml-2"
                >
                  Annuler
                </button>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-muted-foreground/40">Malaky v1.0.0</p>
          <p className="text-xs text-muted-foreground/30 mt-1">
            Made with ❤️ à Antananarivo 🇲🇬
          </p>
        </div>
      </div>

      {/* Modals */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} type="privacy" />
      <PrivacyModal open={cguOpen} onClose={() => setCguOpen(false)} type="cgu" />
    </>
  );
};

export default SettingsScreen;
