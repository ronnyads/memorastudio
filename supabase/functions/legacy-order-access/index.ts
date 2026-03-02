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

function getClientIp(req: Request): string | null {
  return req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const requestId = crypto.randomUUID();
  const requestIp = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const cutoffRaw = Deno.env.get("LEGACY_ACCESS_CUTOFF_UTC");
    if (!cutoffRaw) {
      return jsonResponse({ error: "Legacy access is not configured", request_id: requestId }, 403);
    }
    const cutoffDate = new Date(cutoffRaw);
    if (Number.isNaN(cutoffDate.getTime())) {
      return jsonResponse({ error: "Legacy access is not configured", request_id: requestId }, 403);
    }
    if (new Date() > cutoffDate) {
      return jsonResponse({ error: "Legacy access window expired", request_id: requestId }, 403);
    }

    const body = await req.json();
    const orderId = String(body?.order_id ?? "").trim();
    const token = String(body?.token ?? "").trim();
    if (!orderId || !token) {
      return jsonResponse({ error: "Missing order_id or token", request_id: requestId }, 400);
    }

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id,order_number,customer_name,product_type,status,payment_status,total,created_at,updated_at")
      .eq("id", orderId)
      .eq("public_access_token", token)
      .maybeSingle();

    if (orderError || !order) {
      await adminClient.from("legacy_access_audit").insert({
        order_id: orderId,
        request_ip: requestIp,
        user_agent: userAgent,
        success: false,
        reason: "invalid_order_or_token",
      });
      return jsonResponse({ error: "Invalid order link", request_id: requestId }, 403);
    }

    // Only pre-release orders are allowed in the legacy flow.
    if (new Date(order.created_at) >= cutoffDate) {
      await adminClient.from("legacy_access_audit").insert({
        order_id: orderId,
        request_ip: requestIp,
        user_agent: userAgent,
        success: false,
        reason: "not_legacy_order",
      });
      return jsonResponse({ error: "Legacy access is not available for this order", request_id: requestId }, 403);
    }

    const [assetsRes, jobsRes] = await Promise.all([
      adminClient
        .from("order_assets")
        .select("id,input_url,output_url,preview_url,created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
      adminClient
        .from("jobs")
        .select("id,type,status,attempts,created_at,updated_at,last_error")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (assetsRes.error || jobsRes.error) {
      console.error("[legacy-order-access] relation query error", {
        requestId,
        assetsError: assetsRes.error,
        jobsError: jobsRes.error,
      });
      return jsonResponse({ error: "Could not load legacy order details", request_id: requestId }, 500);
    }

    await adminClient.from("legacy_access_audit").insert({
      order_id: orderId,
      request_ip: requestIp,
      user_agent: userAgent,
      success: true,
      reason: "ok",
    });

    return jsonResponse({
      request_id: requestId,
      legacy: true,
      order,
      assets: assetsRes.data ?? [],
      jobs: jobsRes.data ?? [],
    });
  } catch (error) {
    console.error("[legacy-order-access] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
