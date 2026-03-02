import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "heic", "heif", "webp"]);

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
    const fileExtension = String(body?.file_extension ?? "").trim().toLowerCase();
    if (!orderId || !fileExtension) {
      return jsonResponse({ error: "Missing order_id or file_extension", request_id: requestId }, 400);
    }
    if (!ALLOWED_EXTENSIONS.has(fileExtension)) {
      return jsonResponse({ error: "Unsupported file type", request_id: requestId }, 400);
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
      .select("id,status,payment_status,customer_email")
      .eq("id", orderId)
      .eq("customer_email", userEmail)
      .maybeSingle();

    if (orderError) {
      console.error("[upload-order-input-url] order lookup error", { requestId, orderError, orderId });
      return jsonResponse({ error: "Could not validate order", request_id: requestId }, 500);
    }
    if (!order) {
      return jsonResponse({ error: "Order not found", request_id: requestId }, 404);
    }
    if (order.payment_status !== "approved") {
      return jsonResponse({ error: "Payment not approved", request_id: requestId }, 403);
    }
    if (order.status !== "awaiting_upload") {
      return jsonResponse({ error: "Order is not accepting uploads", request_id: requestId }, 403);
    }

    const filePath = `${orderId}/input-${Date.now()}.${fileExtension}`;
    const { data: signedData, error: signedError } = await adminClient.storage
      .from("order-files")
      .createSignedUploadUrl(filePath);

    if (signedError || !signedData) {
      console.error("[upload-order-input-url] signed url error", { requestId, signedError });
      return jsonResponse({ error: "Could not create upload URL", request_id: requestId }, 500);
    }

    return jsonResponse({
      request_id: requestId,
      path: signedData.path,
      signedUrl: signedData.signedUrl,
    });
  } catch (error) {
    console.error("[upload-order-input-url] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
