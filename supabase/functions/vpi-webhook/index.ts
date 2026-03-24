import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const VPI_KEY_SECRET = Deno.env.get("VPI_KEY_SECRET");
    if (!VPI_KEY_SECRET) throw new Error("VPI_KEY_SECRET not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // VPI sends application/x-www-form-urlencoded or JSON
    const contentType = req.headers.get("content-type") || "";
    let bodyData: Record<string, string>;
    let rawBody: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      rawBody = await req.text();
      const params = new URLSearchParams(rawBody);
      bodyData = Object.fromEntries(params.entries());
      // For signature verification, use the JSON-stringified version of parsed data
      // VPI docs say: "hashage du body avec la clé secrète"
    } else {
      rawBody = await req.text();
      bodyData = JSON.parse(rawBody);
    }

    console.log("[VPI Webhook] Received:", JSON.stringify(bodyData));

    // Verify HMAC SHA256 signature
    const vpiSignature = req.headers.get("VPI-Signature") || req.headers.get("vpi-signature") || "";
    
    if (vpiSignature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(VPI_KEY_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      // Hash the raw body
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const hexHash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      if (hexHash !== vpiSignature.toUpperCase()) {
        console.error("[VPI Webhook] Signature mismatch. Expected:", hexHash, "Got:", vpiSignature);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("[VPI Webhook] Signature verified ✓");
    } else {
      console.warn("[VPI Webhook] No VPI-Signature header present");
    }

    // Extract fields
    const reference_vpi = bodyData.reference_VPI || bodyData.reference_vpi || "";
    const reference = bodyData.reference || "";
    const panier = bodyData.panier || "";
    const montant = bodyData.montant || "";
    const etat = bodyData.etat || "";
    const initiateur = bodyData.initiateur || null;
    const referenceMM = bodyData.referenceMM || bodyData.referencemm || null;

    if (!etat || !reference) {
      console.error("[VPI Webhook] Missing etat or reference");
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map VPI status
    const statusMap: Record<string, string> = {
      SUCCESS: "SUCCESS",
      PENDING: "PENDING",
      FAILED: "FAILED",
    };
    const dbStatus = statusMap[etat.toUpperCase()] || "FAILED";

    // Update transaction
    const updateData: Record<string, unknown> = {
      status: dbStatus,
      vpi_reference: reference_vpi,
      updated_at: new Date().toISOString(),
    };
    if (initiateur) updateData.initiator = initiateur;
    if (referenceMM) updateData.reference_mm = referenceMM;

    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update(updateData)
      .eq("reference", reference);

    if (updateError) {
      console.error("[VPI Webhook] DB update error:", updateError);
      throw new Error("Failed to update transaction");
    }

    console.log("[VPI Webhook] Transaction updated:", reference, "→", dbStatus);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[VPI Webhook] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
