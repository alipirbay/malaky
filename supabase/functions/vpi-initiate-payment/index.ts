import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VPI_BASE_URL = Deno.env.get("VPI_BASE_URL") ?? "https://preprod.vanilla-pay.net";
const VPI_VERSION = "2023-01-12";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const VPI_CLIENT_ID = Deno.env.get("VPI_CLIENT_ID");
    const VPI_CLIENT_SECRET = Deno.env.get("VPI_CLIENT_SECRET");
    if (!VPI_CLIENT_ID) throw new Error("VPI_CLIENT_ID not configured");
    if (!VPI_CLIENT_SECRET) throw new Error("VPI_CLIENT_SECRET not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { amount, reference, panier, currency, payment_mode, redirect_url, notif_url, user_id } = body;

    // Validation
    if (!amount || !reference || !currency || !payment_mode) {
      return new Response(JSON.stringify({ error: "Missing required fields: amount, reference, currency, payment_mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["mobile_money", "international"].includes(payment_mode)) {
      return new Response(JSON.stringify({ error: "payment_mode must be 'mobile_money' or 'international'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (payment_mode === "mobile_money" && currency !== "MGA") {
      return new Response(JSON.stringify({ error: "Mobile money requires currency MGA" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["MGA", "EUR"].includes(currency)) {
      return new Response(JSON.stringify({ error: "Currency must be MGA or EUR" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Generate VPI token
    console.log("[VPI] Generating token...");
    const tokenRes = await fetch(`${VPI_BASE_URL}/webpayment/token`, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "Client-Id": VPI_CLIENT_ID,
        "Client-Secret": VPI_CLIENT_SECRET,
        "VPI-Version": VPI_VERSION,
      },
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[VPI] Token error:", tokenRes.status, errText);
      throw new Error(`VPI token generation failed [${tokenRes.status}]: ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData?.Data?.Token;
    if (!token) throw new Error("No token received from VPI");
    console.log("[VPI] Token obtained successfully");

    // Step 2: Initiate payment
    const order_id = `MLK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const initiateBody = {
      montant: amount,
      reference,
      panier: panier || order_id,
      notif_url: notif_url || `${supabaseUrl}/functions/v1/vpi-webhook`,
      redirect_url: redirect_url || "",
      devise: currency,
      mode_paiement: payment_mode,
    };

    console.log("[VPI] Initiating payment:", JSON.stringify(initiateBody));
    const initiateRes = await fetch(`${VPI_BASE_URL}/api/webpayment/v2/initiate`, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Authorization": token,
        "VPI-Version": VPI_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(initiateBody),
    });

    if (!initiateRes.ok) {
      const errText = await initiateRes.text();
      console.error("[VPI] Initiate error:", initiateRes.status, errText);
      throw new Error(`VPI initiate failed [${initiateRes.status}]: ${errText}`);
    }

    const initiateData = await initiateRes.json();
    console.log("[VPI] Initiate response:", JSON.stringify(initiateData));

    if (initiateData.CodeRetour !== 200) {
      throw new Error(`VPI initiate error: ${initiateData.DescRetour} - ${initiateData.DetailRetour}`);
    }

    const payment_url = initiateData?.Data?.url;
    if (!payment_url) throw new Error("No payment URL received from VPI");

    // Extract VPI transaction ID from URL
    const urlObj = new URL(payment_url);
    const vpiId = urlObj.searchParams.get("id") || "";

    // Step 3: Save transaction to DB
    const { data: txn, error: insertError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user_id || null,
        order_id,
        reference,
        panier: panier || order_id,
        amount,
        currency,
        payment_mode,
        vpi_transaction_id: vpiId,
        payment_url,
        status: "INITIATED",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[VPI] DB insert error:", insertError);
      throw new Error("Failed to save transaction");
    }

    console.log("[VPI] Transaction saved:", txn.id);

    return new Response(JSON.stringify({
      success: true,
      transaction_id: txn.id,
      order_id,
      payment_url,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[VPI] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
