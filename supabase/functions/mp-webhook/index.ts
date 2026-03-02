import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // MP can send as query param or body
    const url = new URL(req.url);
    let type = url.searchParams.get("type") || url.searchParams.get("topic");
    let dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

    // Also check body
    if (!type || !dataId) {
      try {
        const body = await req.json();
        type = type || body.type || body.topic;
        dataId = dataId || body.data?.id || body.id;
      } catch {
        // body may not be JSON
      }
    }

    console.log("Webhook received:", { type, dataId });

    // Only process payment notifications
    if (type !== "payment" && type !== "payment.created" && type !== "payment.updated") {
      // Respond 200 to acknowledge non-payment notifications
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dataId) {
      console.error("No payment ID in webhook");
      return new Response(JSON.stringify({ error: "No payment ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mercado Pago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${dataId}`,
      {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      }
    );

    if (!paymentResponse.ok) {
      const errText = await paymentResponse.text();
      console.error("MP payment fetch error:", paymentResponse.status, errText);
      throw new Error(`MP API error [${paymentResponse.status}]: ${errText}`);
    }

    const payment = await paymentResponse.json();
    const orderId = payment.external_reference;
    const mpStatus = payment.status; // approved, rejected, pending, in_process, etc.

    console.log("Payment details:", { orderId, mpStatus, paymentId: payment.id });

    if (!orderId) {
      console.error("No external_reference in payment");
      return new Response(JSON.stringify({ error: "No order reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map MP status to our status
    let paymentStatus: string;
    let orderStatus: string | null = null;

    switch (mpStatus) {
      case "approved":
        paymentStatus = "approved";
        orderStatus = "awaiting_upload";
        break;
      case "rejected":
      case "cancelled":
        paymentStatus = "rejected";
        orderStatus = "cancelled";
        break;
      case "refunded":
        paymentStatus = "refunded";
        break;
      default: // pending, in_process, authorized
        paymentStatus = "pending";
        break;
    }

    // Update order
    const updateData: Record<string, string> = { payment_status: paymentStatus };
    if (orderStatus) {
      updateData.status = orderStatus;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Insert payment record
    await supabase.from("payments").insert({
      order_id: orderId,
      gateway: "mercadopago",
      payment_id: String(payment.id),
      status: paymentStatus,
      details: {
        mp_status: mpStatus,
        mp_payment_id: payment.id,
        mp_payment_type: payment.payment_type_id,
        mp_payment_method: payment.payment_method_id,
        amount: payment.transaction_amount,
      },
    });

    console.log("Webhook processed successfully for order:", orderId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mp-webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
