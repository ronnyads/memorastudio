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

function cleanStoragePath(raw: string) {
  return raw.replace(/^order-files\//, "");
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
    if (!orderId) {
      return jsonResponse({ error: "Missing order_id", request_id: requestId }, 400);
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
      .select("id,status,customer_email")
      .eq("id", orderId)
      .eq("customer_email", userEmail)
      .maybeSingle();

    if (orderError) {
      console.error("[request-order-download-url] order lookup error", { requestId, orderError, orderId });
      return jsonResponse({ error: "Could not validate order", request_id: requestId }, 500);
    }
    if (!order) {
      return jsonResponse({ error: "Order not found", request_id: requestId }, 404);
    }
    if (!["ready", "delivered"].includes(order.status)) {
      return jsonResponse({ error: "Result is not available yet", request_id: requestId }, 403);
    }

    const { data: asset, error: assetError } = await adminClient
      .from("order_assets")
      .select("output_url")
      .eq("order_id", orderId)
      .not("output_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assetError) {
      console.error("[request-order-download-url] asset lookup error", { requestId, assetError, orderId });
      return jsonResponse({ error: "Could not load result asset", request_id: requestId }, 500);
    }
    if (!asset?.output_url) {
      return jsonResponse({ error: "Result file not found", request_id: requestId }, 404);
    }

    const path = cleanStoragePath(asset.output_url);
    const { data: signedData, error: signedError } = await adminClient.storage
      .from("order-files")
      .createSignedUrl(path, 60 * 30);

    if (signedError || !signedData) {
      console.error("[request-order-download-url] signed url error", { requestId, signedError, path });
      return jsonResponse({ error: "Could not create download URL", request_id: requestId }, 500);
    }

    return jsonResponse({
      request_id: requestId,
      signedUrl: signedData.signedUrl,
      expires_in_seconds: 1800,
    });
  } catch (error) {
    console.error("[request-order-download-url] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
