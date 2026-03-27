import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useProfileStore, AVATAR_OPTIONS, TITLE_UNLOCKS, getXpProgress } from "@/store/profileStore";
import { ACHIEVEMENTS, getUnlockedAchievements } from "@/lib/achievements";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Pencil, Check, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProfileScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const store = useProfileStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(store.username);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const xpData = getXpProgress(store.xp);
  const unlockedTitles = useMemo(() => store.getUnlockedTitles(), [store]);
  const currentTitle = TITLE_UNLOCKS.find((t) => t.id === store.selectedTitle);
  const unlockedAchievementIds = useMemo(() => new Set(getUnlockedAchievements()), []);

  const handleSaveName = () => {
    store.setUsername(nameInput);
    setEditingName(false);
  };

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Fichier non supporté. Choisis une image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (max 5 Mo).");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      store.setAvatarUrl(urlData.publicUrl);
      toast.success("Photo de profil mise à jour !");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Échec de l'upload. Réessaie.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [store]);

  const stats = [
    { label: "Parties jouées", value: store.totalGamesPlayed, emoji: "🎮" },
    { label: "Cartes jouées", value: store.totalCardsPlayed, emoji: "🃏" },
    { label: "Quiz correct", value: store.totalQuizCorrect, emoji: "🧠" },
    { label: "Duels gagnés", value: `${store.totalDuelsWon}/${store.totalDuelsPlayed}`, emoji: "⚔️" },
    { label: "Joueurs rencontrés", value: store.uniquePlayersPlayed.length, emoji: "👥" },
    { label: "Modes explorés", value: `${store.modesPlayed.length}/${GAME_MODES.length}`, emoji: "🌈" },
    { label: "Parties sans refus", value: store.gamesWithZeroRefusals, emoji: "💪" },
    { label: "Membre depuis", value: new Date(store.joinedAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }), emoji: "📅" },
  ];

  const hasPhoto = !!store.avatarUrl;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-card p-2.5 text-foreground" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-foreground">Mon Profil</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl ring-4 ring-primary/30 overflow-hidden">
              {hasPhoto ? (
                <img src={store.avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                store.avatar
              )}
            </div>
            {/* Camera button overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -left-1 rounded-full bg-card border-2 border-background p-1.5 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Changer la photo de profil"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              Niv.{xpData.level}
            </div>
          </div>

          {editingName ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                maxLength={20}
                className="rounded-lg bg-card px-3 py-1.5 text-lg font-bold text-foreground text-center border border-primary focus:outline-none w-40"
              />
              <button onClick={handleSaveName} className="rounded-lg bg-primary p-1.5 text-primary-foreground">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => { setNameInput(store.username); setEditingName(true); }} className="flex items-center gap-1.5 mb-1">
              <span className="text-lg font-bold text-foreground">{store.username || "Anonyme"}</span>
              <Pencil size={12} className="text-muted-foreground" />
            </button>
          )}

          <p className="text-sm text-primary font-medium">{currentTitle?.title ?? "Débutant"}</p>

          {/* XP bar */}
          <div className="w-full max-w-[200px] mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Niv. {xpData.level}</span>
              <span>{xpData.current}/{xpData.needed} XP</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${xpData.percent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Avatar picker */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Avatar</h3>
          {hasPhoto && (
            <button
              onClick={() => store.setAvatarUrl(null)}
              className="text-xs text-muted-foreground underline underline-offset-2 mb-2 block"
            >
              Retirer la photo et utiliser un emoji
            </button>
          )}
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => store.setAvatar(emoji)}
                className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-all active:scale-90 ${
                  !hasPhoto && store.avatar === emoji ? "ring-2 ring-primary bg-primary/20 scale-110" : "bg-card hover:bg-secondary"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Title picker */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Titre</h3>
          <div className="space-y-2">
            {TITLE_UNLOCKS.map((t) => {
              const isUnlocked = unlockedTitles.some((u) => u.id === t.id);
              const isActive = store.selectedTitle === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => isUnlocked && store.setTitle(t.id)}
                  disabled={!isUnlocked}
                  className={`w-full rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all ${
                    isActive ? "bg-primary/20 border border-primary/40" : isUnlocked ? "bg-card" : "bg-card/50 opacity-50"
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-foreground">{t.title}</span>
                    {!isUnlocked && (
                      <p className="text-[11px] text-muted-foreground">
                        {t.condition === "games" && `${t.threshold} parties`}
                        {t.condition === "cardsPlayed" && `${t.threshold} cartes jouées`}
                        {t.condition === "zeroRefusals" && `${t.threshold} parties sans refus`}
                        {t.condition === "quizCorrect" && `${t.threshold} réponses correctes`}
                        {t.condition === "duelsWon" && `${t.threshold} duels gagnés`}
                        {t.condition === "uniquePlayers" && `${t.threshold} joueurs rencontrés`}
                        {t.condition === "modesPlayed" && `${t.threshold} modes joués`}
                      </p>
                    )}
                  </div>
                  {isActive && <Check size={16} className="text-primary" />}
                  {!isUnlocked && <span className="text-muted-foreground">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Statistiques</h3>
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-card p-3 text-center">
                <span className="text-lg">{s.emoji}</span>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Badges</h3>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievementIds.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-xl p-3 flex items-start gap-2.5 ${unlocked ? "bg-card" : "bg-card/40 opacity-50"}`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
