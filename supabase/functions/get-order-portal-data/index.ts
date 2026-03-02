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
      .select("id,order_number,customer_email,customer_name,customer_phone,product_type,status,payment_status,total,created_at,updated_at")
      .eq("id", orderId)
      .eq("customer_email", userEmail)
      .maybeSingle();

    if (orderError) {
      console.error("[get-order-portal-data] order error", { requestId, orderError, orderId });
      return jsonResponse({ error: "Could not load order", request_id: requestId }, 500);
    }
    if (!order) {
      return jsonResponse({ error: "Order not found", request_id: requestId }, 404);
    }

    const [assetsRes, briefRes, jobsRes] = await Promise.all([
      adminClient
        .from("order_assets")
        .select("id,order_id,input_url,output_url,preview_url,created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
      adminClient
        .from("order_brief")
        .select("id,order_id,data,created_at,updated_at")
        .eq("order_id", orderId)
        .maybeSingle(),
      adminClient
        .from("jobs")
        .select("id,order_id,type,status,attempts,logs,created_at,updated_at,started_at,finished_at,last_error")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (assetsRes.error || briefRes.error || jobsRes.error) {
      console.error("[get-order-portal-data] relation query error", {
        requestId,
        assetsError: assetsRes.error,
        briefError: briefRes.error,
        jobsError: jobsRes.error,
      });
      return jsonResponse({ error: "Could not load order details", request_id: requestId }, 500);
    }

    return jsonResponse({
      request_id: requestId,
      order,
      assets: assetsRes.data ?? [],
      brief: briefRes.data ?? null,
      jobs: jobsRes.data ?? [],
    });
  } catch (error) {
    console.error("[get-order-portal-data] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected error", request_id: requestId }, 500);
  }
});
