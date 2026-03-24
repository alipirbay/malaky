import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { usePayment, type PaymentMode } from "@/hooks/usePayment";
import { STORE_PACKS } from "@/data/cards";
import { ArrowLeft, Check, Lock, Sparkles, CreditCard, Smartphone, Loader2 } from "lucide-react";
import type { Vibe } from "@/data/cards";

const PacksScreen = () => {
  const { setScreen, unlockVibe, unlockBundle, unlockedVibes, setPendingTransaction } = useGameStore();
  const { initiatePayment, loading } = usePayment();
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<(typeof STORE_PACKS)[number] | null>(null);

  const handleBuy = (pack: (typeof STORE_PACKS)[number]) => {
    setSelectedPack(pack);
    setShowPaymentModal(true);
  };

  const processPayment = async (paymentMode: PaymentMode) => {
    if (!selectedPack) return;
    setBuyingPackId(selectedPack.id);

    const currency = paymentMode === "mobile_money" ? "MGA" as const : "MGA" as const;
    const reference = `MALAKY-${selectedPack.id}-${Date.now()}`;
    const amount = parseFloat(selectedPack.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

    // Use a placeholder amount if price parsing fails
    const finalAmount = amount > 0 ? amount : 5000;

    const result = await initiatePayment({
      amount: finalAmount,
      reference,
      panier: `Pack ${selectedPack.name}`,
      currency,
      payment_mode: paymentMode,
      redirect_url: window.location.origin + "/?payment_return=true",
    });

    if (result?.payment_url) {
      setPendingTransaction(result.transaction_id);
      // Redirect to VPI payment page
      window.location.href = result.payment_url;
    }

    setBuyingPackId(null);
    setShowPaymentModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 gradient-surface">
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

      <div className="space-y-3 pb-6 overflow-y-auto flex-1">
        {STORE_PACKS.map((pack, i) => {
          const purchased =
            pack.id === "bundle_all"
              ? Object.values(unlockedVibes).every(Boolean)
              : pack.vibe
                ? unlockedVibes[pack.vibe as Vibe]
                : false;

          const isBundle = pack.id.startsWith("bundle");
          const isBuying = buyingPackId === pack.id;

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
                  disabled={isBuying}
                  className="flex items-center gap-1 shrink-0 rounded-full gradient-mango px-3 py-2 text-xs font-bold text-mango-foreground transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isBuying ? <Loader2 size={10} className="animate-spin" /> : <Lock size={10} />} {pack.price}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setScreen("vibe")}
        className="rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground transition-transform active:scale-95"
      >
        Retour aux ambiances
      </button>

      {/* Payment Mode Modal */}
      {showPaymentModal && selectedPack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted-foreground/30" />
            <h3 className="text-lg font-bold text-foreground mb-1">Payer {selectedPack.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">{selectedPack.price} — Choisissez votre mode de paiement</p>

            <div className="space-y-3">
              <button
                onClick={() => processPayment("mobile_money")}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-2xl bg-secondary p-4 text-left transition-all hover:bg-secondary/80 active:scale-[0.98] disabled:opacity-50"
              >
                <div className="rounded-xl bg-primary/20 p-3">
                  <Smartphone size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">MVola, Orange Money, Airtel Money</p>
                </div>
              </button>

              <button
                onClick={() => processPayment("international")}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-2xl bg-secondary p-4 text-left transition-all hover:bg-secondary/80 active:scale-[0.98] disabled:opacity-50"
              >
                <div className="rounded-xl bg-accent/20 p-3">
                  <CreditCard size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Carte bancaire / PayPal</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, PayPal</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-4 w-full rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground transition-transform active:scale-95"
            >
              Annuler
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PacksScreen;
