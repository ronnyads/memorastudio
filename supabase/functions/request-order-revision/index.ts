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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization", request_id: requestId }, 401);
    }

    const body = await req.json();
    const orderId = String(body?.order_id ?? "").trim();
    const note = String(body?.note ?? "").trim();

    if (!orderId || !note) {
      return jsonResponse({ error: "Missing order_id or note", request_id: requestId }, 400);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await userClient.auth.getUser();
    const userEmail = userData?.user?.email?.toLowerCase();
    if (userError || !userEmail) {
      return jsonResponse({ error: "Invalid user session", request_id: requestId }, 401);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id,status,product_type,customer_email")
      .eq("id", orderId)
      .eq("customer_email", userEmail)
      .maybeSingle();

    if (orderError) {
      console.error("[request-order-revision] order lookup error", { requestId, orderError, orderId });
      return jsonResponse({ error: "Could not validate order", request_id: requestId }, 500);
    }
    if (!order) {
      return jsonResponse({ error: "Order not found", request_id: requestId }, 404);
    }
    if (!["ready", "delivered", "processing"].includes(order.status)) {
      return jsonResponse({ error: "Order status does not allow revision", request_id: requestId }, 403);
    }

    const revisionLog = {
      type: "revision_request",
      at: new Date().toISOString(),
      note,
    };

    const { error: orderUpdateError } = await adminClient
      .from("orders")
      .update({ status: "needs_revision" })
      .eq("id", orderId);
    if (orderUpdateError) {
      console.error("[request-order-revision] order update error", { requestId, orderUpdateError, orderId });
      return jsonResponse({ error: "Could not update order", request_id: requestId }, 500);
    }

    const { error: jobError } = await adminClient.from("jobs").insert({
      order_id: orderId,
      type: order.product_type,
      status: "needs_review",
      logs: [revisionLog],
    });
    if (jobError) {
      console.error("[request-order-revision] job insert error", { requestId, jobError, orderId });
      return jsonResponse({ error: "Could not create revision job", request_id: requestId }, 500);
    }

    return jsonResponse({
      ok: true,
      request_id: requestId,
      order_id: orderId,
      status: "needs_revision",
    });
  } catch (error) {
    console.error("[request-order-revision] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
