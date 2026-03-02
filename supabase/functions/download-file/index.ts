import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, token, file_path } = await req.json();

    if (!order_id || !file_path || !token) {
      return new Response(JSON.stringify({ error: "Missing order_id, token or file_path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate token (required)
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", order_id)
      .eq("public_access_token", token)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["ready", "delivered"].includes(order.status)) {
      return new Response(JSON.stringify({ error: "Result not ready" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip bucket prefix if present
    const cleanPath = file_path.replace(/^order-files\//, "");

    // Generate signed download URL (7 days)
    const { data, error } = await supabase.storage
      .from("order-files")
      .createSignedUrl(cleanPath, 60 * 60 * 24 * 7);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
