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
    const inputPath = String(body?.input_path ?? "").trim();
    const briefData = body?.brief_data ?? {};

    if (!orderId || !inputPath) {
      return jsonResponse({ error: "Missing order_id or input_path", request_id: requestId }, 400);
    }
    if (!inputPath.startsWith(`${orderId}/`)) {
      return jsonResponse({ error: "Invalid input_path", request_id: requestId }, 400);
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
      .select("id,customer_email,status,product_type")
      .eq("id", orderId)
      .eq("customer_email", userEmail)
      .maybeSingle();

    if (orderError) {
      console.error("[finalize-order-upload] order lookup error", { requestId, orderError, orderId });
      return jsonResponse({ error: "Could not validate order", request_id: requestId }, 500);
    }
    if (!order) {
      return jsonResponse({ error: "Order not found", request_id: requestId }, 404);
    }
    if (!["awaiting_upload", "needs_revision"].includes(order.status)) {
      return jsonResponse({ error: "Order is not accepting upload finalization", request_id: requestId }, 403);
    }

    const normalizedInputUrl = `order-files/${inputPath}`;

    const { data: existingAsset } = await adminClient
      .from("order_assets")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingAsset?.id) {
      const { error: assetUpdateError } = await adminClient
        .from("order_assets")
        .update({ input_url: normalizedInputUrl, output_url: null, preview_url: null })
        .eq("id", existingAsset.id);
      if (assetUpdateError) {
        console.error("[finalize-order-upload] asset update error", { requestId, assetUpdateError, orderId });
        return jsonResponse({ error: "Could not save uploaded asset", request_id: requestId }, 500);
      }
    } else {
      const { error: assetInsertError } = await adminClient
        .from("order_assets")
        .insert({ order_id: orderId, input_url: normalizedInputUrl });
      if (assetInsertError) {
        console.error("[finalize-order-upload] asset insert error", { requestId, assetInsertError, orderId });
        return jsonResponse({ error: "Could not save uploaded asset", request_id: requestId }, 500);
      }
    }

    const { error: briefUpsertError } = await adminClient
      .from("order_brief")
      .upsert(
        { order_id: orderId, data: briefData },
        { onConflict: "order_id" },
      );
    if (briefUpsertError) {
      console.error("[finalize-order-upload] brief upsert error", { requestId, briefUpsertError, orderId });
      return jsonResponse({ error: "Could not save order brief", request_id: requestId }, 500);
    }

    const { error: jobInsertError } = await adminClient
      .from("jobs")
      .insert({
        order_id: orderId,
        type: order.product_type,
        status: "queued",
        attempts: 0,
        logs: [{ type: "upload_finalized", at: new Date().toISOString() }],
        next_retry_at: null,
        locked_by: null,
      });
    if (jobInsertError) {
      console.error("[finalize-order-upload] job insert error", { requestId, jobInsertError, orderId });
      return jsonResponse({ error: "Could not enqueue processing job", request_id: requestId }, 500);
    }

    const { error: orderUpdateError } = await adminClient
      .from("orders")
      .update({ status: "processing" })
      .eq("id", orderId);
    if (orderUpdateError) {
      console.error("[finalize-order-upload] order update error", { requestId, orderUpdateError, orderId });
      return jsonResponse({ error: "Could not update order status", request_id: requestId }, 500);
    }

    return jsonResponse({
      ok: true,
      request_id: requestId,
      order_id: orderId,
      status: "processing",
    });
  } catch (error) {
    console.error("[finalize-order-upload] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
