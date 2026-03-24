import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PaymentMode = "mobile_money" | "international";
export type PaymentStatus = "INITIATED" | "PENDING" | "SUCCESS" | "FAILED";

interface InitiatePaymentParams {
  amount: number;
  reference: string;
  panier?: string;
  currency: "MGA" | "EUR";
  payment_mode: PaymentMode;
  redirect_url: string;
  user_id?: string;
}

interface PaymentTransaction {
  id: string;
  order_id: string;
  reference: string;
  amount: number;
  currency: string;
  payment_mode: string;
  status: PaymentStatus;
  payment_url: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(async (params: InitiatePaymentParams) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("vpi-initiate-payment", {
        body: params,
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data as { success: boolean; transaction_id: string; order_id: string; payment_url: string };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de paiement";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("vpi-check-status", {
        body: { transaction_id: transactionId },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data?.transaction as PaymentTransaction | null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de vérification";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransaction = useCallback(async (transactionId: string) => {
    const { data, error: dbError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (dbError) return null;
    return data as PaymentTransaction;
  }, []);

  return { initiatePayment, checkStatus, getTransaction, loading, error };
}
