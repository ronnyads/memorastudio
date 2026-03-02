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

    if (!order_id || !file_path) {
      return new Response(JSON.stringify({ error: "Missing order_id or file_path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate token
    if (token) {
      const { data: order, error } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("id", order_id)
        .eq("public_access_token", token)
        .single();

      if (error || !order) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (order.payment_status !== "approved") {
        return new Response(JSON.stringify({ error: "Payment not approved" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate signed upload URL
    const { data, error } = await supabase.storage
      .from("order-files")
      .createSignedUploadUrl(file_path);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl, path: data.path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
