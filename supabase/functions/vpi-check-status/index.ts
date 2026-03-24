import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VPI_BASE_URL = "https://preprod.vanilla-pay.net";
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

    const { transaction_id } = await req.json();
    if (!transaction_id) {
      return new Response(JSON.stringify({ error: "Missing transaction_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get transaction from DB
    const { data: txn, error: fetchError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("id", transaction_id)
      .single();

    if (fetchError || !txn) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!txn.vpi_transaction_id) {
      return new Response(JSON.stringify({ transaction: txn }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate token
    console.log("[VPI Status] Generating token...");
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
      console.error("[VPI Status] Token error:", tokenRes.status, errText);
      throw new Error(`VPI token failed [${tokenRes.status}]: ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData?.Data?.Token;
    if (!token) throw new Error("No token from VPI");

    // Check status
    console.log("[VPI Status] Checking:", txn.vpi_transaction_id);
    const statusRes = await fetch(`${VPI_BASE_URL}/api/webpayment/v2/status/${txn.vpi_transaction_id}`, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "Authorization": token,
        "VPI-Version": VPI_VERSION,
      },
    });

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      console.error("[VPI Status] Error:", statusRes.status, errText);
      throw new Error(`VPI status check failed [${statusRes.status}]: ${errText}`);
    }

    const statusData = await statusRes.json();
    console.log("[VPI Status] Response:", JSON.stringify(statusData));

    const vpiStatus = statusData?.Data?.etat || txn.status;
    const updateData: Record<string, unknown> = {
      status: vpiStatus,
      updated_at: new Date().toISOString(),
    };
    if (statusData?.Data?.reference_VPI) updateData.vpi_reference = statusData.Data.reference_VPI;
    if (statusData?.Data?.initiateur) updateData.initiator = statusData.Data.initiateur;
    if (statusData?.Data?.referenceMM) updateData.reference_mm = statusData.Data.referenceMM;

    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update(updateData)
      .eq("id", transaction_id);

    if (updateError) {
      console.error("[VPI Status] DB update error:", updateError);
    }

    return new Response(JSON.stringify({
      transaction: { ...txn, status: vpiStatus, ...updateData },
      vpi_data: statusData?.Data || null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[VPI Status] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
