import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const {
      token,
      payment_method_id,
      installments,
      issuer_id,
      payer_email,
      product,
      price,
      customer_name,
      customer_phone,
      product_type,
      identification_type,
      identification_number,
    } = await req.json();

    if (!token || !payment_method_id || !payer_email || !product || !price || !customer_name || !product_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: payer_email.trim().toLowerCase(),
        customer_name: customer_name.trim(),
        customer_phone: customer_phone?.trim() || null,
        product_type,
        status: "created",
        payment_status: "pending",
        total: parseFloat(price),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Call Mercado Pago Payments API
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": order.id,
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(price),
        token,
        description: product,
        installments: installments || 1,
        payment_method_id,
        issuer_id: issuer_id || undefined,
        payer: {
          email: payer_email.trim().toLowerCase(),
          identification: identification_type && identification_number
            ? { type: identification_type, number: identification_number }
            : undefined,
        },
        external_reference: order.id,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MP payment error:", mpResponse.status, JSON.stringify(mpData));
      // Clean up order
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({
          error: "Payment failed",
          mp_status: mpData.status,
          mp_detail: mpData.status_detail || mpData.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save payment record
    await supabase.from("payments").insert({
      order_id: order.id,
      gateway: "mercadopago",
      payment_id: String(mpData.id),
      status: mpData.status,
      details: mpData,
    });

    // Update order based on payment status
    if (mpData.status === "approved") {
      await supabase
        .from("orders")
        .update({ payment_status: "approved", status: "awaiting_upload" })
        .eq("id", order.id);
    } else if (mpData.status === "rejected") {
      await supabase
        .from("orders")
        .update({ payment_status: "rejected" })
        .eq("id", order.id);
    }

    return new Response(
      JSON.stringify({
        status: mpData.status,
        status_detail: mpData.status_detail,
        order_id: order.id,
        public_access_token: order.public_access_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("process-payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
