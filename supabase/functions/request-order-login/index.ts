import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const orderNumber = String(body?.order_number ?? "").trim().toUpperCase();
    const redirectPath = String(body?.redirect_path ?? "/acompanhar").trim();

    if (!email) {
      return jsonResponse({ error: "Missing email", request_id: requestId }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ error: "Invalid email", request_id: requestId }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_email", email);
    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    }
    const { count, error: orderCheckError } = await query;

    if (orderCheckError) {
      console.error("[request-order-login] order check error", { requestId, orderCheckError });
      return jsonResponse({ error: "Could not validate order", request_id: requestId }, 500);
    }

    // Do not leak if an order exists or not
    if (!count || count < 1) {
      return jsonResponse({
        ok: true,
        request_id: requestId,
        message: "Se existir pedido para este e-mail, você receberá o link de acesso.",
      });
    }

    const baseUrl = Deno.env.get("APP_BASE_URL") || new URL(req.url).origin;
    const emailRedirectTo = `${baseUrl}/acesso-pedido?redirect=${encodeURIComponent(redirectPath)}`;
    const authUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/otp`;
    const authApiKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const otpRes = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": authApiKey!,
        "Authorization": `Bearer ${authApiKey!}`,
      },
      body: JSON.stringify({
        email,
        create_user: true,
        email_redirect_to: emailRedirectTo,
      }),
    });

    if (!otpRes.ok) {
      const details = await otpRes.text();
      console.error("[request-order-login] otp error", { requestId, status: otpRes.status, details });
      return jsonResponse({ error: "Could not send login email", request_id: requestId }, 500);
    }

    return jsonResponse({
      ok: true,
      request_id: requestId,
      message: "Se existir pedido para este e-mail, você receberá o link de acesso.",
    });
  } catch (error) {
    console.error("[request-order-login] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
