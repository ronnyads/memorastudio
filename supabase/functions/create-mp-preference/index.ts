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

    const { product, price, customer_email, customer_name, customer_phone, product_type } =
      await req.json();

    if (!product || !price || !customer_email || !customer_name || !product_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order with pending payment
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customer_email.trim().toLowerCase(),
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

    // Determine back URLs
    const baseUrl = req.headers.get("origin") || "https://id-preview--08fa6be4-9ff5-4acf-9ec2-d8d96b082545.lovable.app";
    const successUrl = `${baseUrl}/pedido/${order.id}/enviar?token=${order.public_access_token}`;
    const failureUrl = `${baseUrl}/checkout?error=payment_failed`;
    const pendingUrl = `${baseUrl}/pedido/${order.id}/status?token=${order.public_access_token}`;

    // Webhook URL
    const webhookUrl = `${SUPABASE_URL}/functions/v1/mp-webhook`;

    // Create Mercado Pago preference
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: product,
            quantity: 1,
            unit_price: parseFloat(price),
            currency_id: "BRL",
          },
        ],
        payer: {
          email: customer_email.trim().toLowerCase(),
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        auto_return: "approved",
        external_reference: order.id,
        notification_url: webhookUrl,
      }),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.text();
      console.error("MP preference error:", mpResponse.status, mpError);
      // Clean up the order since payment failed to initialize
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(`Mercado Pago API error [${mpResponse.status}]: ${mpError}`);
    }

    const mpData = await mpResponse.json();

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        order_id: order.id,
        preference_id: mpData.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-mp-preference error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
