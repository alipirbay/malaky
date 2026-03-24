import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { ArrowLeft, Volume2, VolumeX, Vibrate, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const SettingsScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const vibrationEnabled = useGameStore((s) => s.vibrationEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const setSoundVolume = useGameStore((s) => s.setSoundVolume);
  const toggleVibration = useGameStore((s) => s.toggleVibration);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
      </div>

      <div className="space-y-2">
        {/* Sound toggle */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full card-game flex items-center gap-4"
        >
          {soundEnabled ? (
            <Volume2 size={20} className="text-muted-foreground" />
          ) : (
            <VolumeX size={20} className="text-muted-foreground" />
          )}
          <span className="flex-1 font-medium text-foreground">Sons</span>
          <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
        </motion.div>

        {/* Volume slider */}
        {soundEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full card-game flex items-center gap-4"
          >
            <div className="w-5" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Volume</span>
            <Slider
              value={[soundVolume]}
              onValueChange={(v) => setSoundVolume(v[0])}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-xs font-bold text-muted-foreground w-8 text-right">{soundVolume}%</span>
          </motion.div>
        )}

        {/* Vibration toggle */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full card-game flex items-center gap-4"
        >
          <Vibrate size={20} className="text-muted-foreground" />
          <span className="flex-1 font-medium text-foreground">Vibrations</span>
          <Switch checked={vibrationEnabled} onCheckedChange={toggleVibration} />
        </motion.div>

        {/* Privacy */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => {}}
          className="w-full card-game flex items-center gap-4 text-left"
        >
          <Shield size={20} className="text-muted-foreground" />
          <span className="flex-1 font-medium text-foreground">Confidentialité</span>
        </motion.button>
      </div>

      <div className="mt-auto pt-8 text-center">
        <p className="text-xs text-muted-foreground/40">Malaky v1.0</p>
        <p className="text-xs text-muted-foreground/30 mt-1">Made with ❤️ by APli</p>
      </div>
    </div>
  );
};

export default SettingsScreen;
