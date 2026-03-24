import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { ArrowLeft, Globe, Volume2, Vibrate, Shield } from "lucide-react";

const SettingsScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);

  const settingsItems = [
    { icon: Globe, label: "Langue", value: "Français", action: () => {} },
    { icon: Volume2, label: "Sons", value: "Activé", action: () => {} },
    { icon: Vibrate, label: "Vibrations", value: "Activé", action: () => {} },
    { icon: Shield, label: "Confidentialité", value: "", action: () => {} },
  ];

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
      </div>

      <div className="space-y-2">
        {settingsItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={item.action}
            className="w-full card-game flex items-center gap-4 text-left"
          >
            <item.icon size={20} className="text-muted-foreground" />
            <span className="flex-1 font-medium text-foreground">{item.label}</span>
            {item.value && (
              <span className="text-sm text-muted-foreground">{item.value}</span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-auto pt-8 text-center">
        <p className="text-xs text-muted-foreground/40">Malaky v1.0</p>
        <p className="text-xs text-muted-foreground/30 mt-1">Made with ❤️ in Madagascar</p>
      </div>
    </div>
  );
};

export default SettingsScreen;
