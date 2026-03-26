import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { usePayment, type PaymentStatus } from "@/hooks/usePayment";
import { CheckCircle, Clock, XCircle, Loader2, ArrowLeft } from "lucide-react";

interface PaymentReturnScreenProps {
  transactionId: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { icon: typeof CheckCircle; label: string; description: string; color: string }> = {
  SUCCESS: {
    icon: CheckCircle,
    label: "Paiement réussi !",
    description: "Votre transaction a été confirmée. Merci pour votre achat !",
    color: "text-green-500",
  },
  PENDING: {
    icon: Clock,
    label: "Paiement en cours...",
    description: "Votre transaction est en attente de confirmation. Veuillez patienter.",
    color: "text-yellow-500",
  },
  FAILED: {
    icon: XCircle,
    label: "Paiement échoué",
    description: "La transaction n'a pas pu aboutir. Veuillez réessayer.",
    color: "text-red-500",
  },
  INITIATED: {
    icon: Clock,
    label: "En attente",
    description: "Le paiement a été initié. Veuillez compléter le paiement.",
    color: "text-muted-foreground",
  },
};

const MAX_POLLS = 60; // 5 min max at 5s interval

const PaymentReturnScreen = ({ transactionId, onBack }: PaymentReturnScreenProps) => {
  const { checkStatus } = usePayment();
  const [status, setStatus] = useState<PaymentStatus>("INITIATED");
  const [checking, setChecking] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const txn = await checkStatus(transactionId);
      if (cancelled) return;

      if (txn) {
        setStatus(txn.status as PaymentStatus);
        if (txn.status === "SUCCESS" || txn.status === "FAILED") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
      setChecking(false);
      pollCountRef.current++;

      if (pollCountRef.current >= MAX_POLLS && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    check();
    intervalRef.current = setInterval(check, 5000);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transactionId, checkStatus]);

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  if (checking && status === "INITIATED") {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 gradient-surface safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Icon className={`mx-auto h-20 w-20 ${config.color}`} />
        </motion.div>

        <h2 className="mt-6 text-2xl font-bold text-foreground">{config.label}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{config.description}</p>

        {status === "PENDING" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Vérification automatique...
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-8 flex items-center justify-center gap-2 w-full rounded-2xl bg-card px-4 py-3 text-sm font-semibold text-foreground transition-transform active:scale-95"
        >
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentReturnScreen;
