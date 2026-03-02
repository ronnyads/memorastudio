import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-worker-secret",
};

type JobRow = {
  id: string;
  order_id: string;
  type: "restore" | "upscale" | "theme";
  status: string;
  attempts: number | null;
  logs: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 1000);
}

function normalizeLogs(logs: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(logs)) {
    return logs.filter((item) => item && typeof item === "object") as Array<Record<string, unknown>>;
  }
  return [];
}

function buildPrompt(productType: "restore" | "upscale" | "theme", briefData: Record<string, unknown>) {
  if (productType === "theme") {
    const theme = String(briefData.themeName ?? "tema elegante");
    const personName = String(briefData.personName ?? "");
    const age = String(briefData.age ?? "");
    const colors = String(briefData.colors ?? "");
    const phrase = String(briefData.phrase ?? "");
    return `Transforme a foto em arte temática ${theme}. Preserve identidade facial. Nome: ${personName}. Idade: ${age}. Cores: ${colors}. Texto: ${phrase}.`;
  }

  if (productType === "upscale") {
    const usage = String(briefData.usage ?? "impressão");
    const notes = String(briefData.notes ?? "");
    return `Restaure e faça upscale de alta qualidade para uso ${usage}. Preserve identidade, textura natural e detalhes. Instruções: ${notes}`;
  }

  const notes = String(briefData.notes ?? "");
  const fidelity = String(briefData.fidelity ?? "maxima");
  return `Restaure foto antiga com fidelidade ${fidelity}. Remova riscos/manchas e ruído, preserve traços faciais e naturalidade. Instruções adicionais: ${notes}`;
}

async function callOpenAIEdit(inputBlob: Blob, prompt: string, model: string, apiKey: string): Promise<Uint8Array> {
  const formData = new FormData();
  formData.append("model", model);
  formData.append("prompt", prompt);
  formData.append("size", "1536x1536");
  formData.append("response_format", "b64_json");
  formData.append("image", new File([inputBlob], "input.png", { type: inputBlob.type || "image/png" }));

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const b64 = payload?.data?.[0]?.b64_json as string | undefined;
  if (!b64) {
    throw new Error("OpenAI response missing b64 image data");
  }

  const binary = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
  return binary;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const requestId = crypto.randomUUID();
  const workerSecret = Deno.env.get("WORKER_SECRET");
  if (workerSecret && req.headers.get("x-worker-secret") !== workerSecret) {
    return jsonResponse({ error: "Unauthorized worker invocation", request_id: requestId }, 401);
  }

  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured", request_id: requestId }, 500);
  }
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-image-1";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const workerId = `worker-${crypto.randomUUID()}`;
    const limit = 3;

    const { data: claimedJobs, error: claimError } = await supabase.rpc("claim_jobs", {
      p_limit: limit,
      p_worker: workerId,
    });

    if (claimError) {
      console.error("[process-jobs] claim error", { requestId, claimError });
      return jsonResponse({ error: "Could not claim jobs", request_id: requestId }, 500);
    }

    const jobs = (claimedJobs ?? []) as JobRow[];
    if (jobs.length === 0) {
      return jsonResponse({
        ok: true,
        request_id: requestId,
        processed: 0,
        message: "No jobs available",
      });
    }

    const results: Array<Record<string, unknown>> = [];

    for (const job of jobs) {
      const jobLogs = normalizeLogs(job.logs);
      const attempts = job.attempts ?? 1;

      try {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("id,product_type,status")
          .eq("id", job.order_id)
          .single();

        if (orderError || !order) {
          throw new Error("Order not found for job");
        }

        const { data: asset, error: assetError } = await supabase
          .from("order_assets")
          .select("id,input_url")
          .eq("order_id", job.order_id)
          .not("input_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (assetError || !asset?.input_url) {
          throw new Error("Input asset not found");
        }

        const { data: brief } = await supabase
          .from("order_brief")
          .select("data")
          .eq("order_id", job.order_id)
          .maybeSingle();
        const briefData = (brief?.data ?? {}) as Record<string, unknown>;

        const inputPath = String(asset.input_url).replace(/^order-files\//, "");
        const { data: inputSignedData, error: inputSignedError } = await supabase.storage
          .from("order-files")
          .createSignedUrl(inputPath, 600);
        if (inputSignedError || !inputSignedData?.signedUrl) {
          throw new Error("Could not create signed URL for input asset");
        }

        const inputRes = await fetch(inputSignedData.signedUrl);
        if (!inputRes.ok) {
          throw new Error(`Could not fetch input image (${inputRes.status})`);
        }
        const inputBlob = await inputRes.blob();

        const prompt = buildPrompt(job.type, briefData);
        const outputBytes = await callOpenAIEdit(inputBlob, prompt, model, openaiApiKey);

        const outputPath = `${job.order_id}/output-${job.id}.png`;
        const { error: uploadOutputError } = await supabase.storage
          .from("order-files")
          .upload(outputPath, outputBytes, {
            contentType: "image/png",
            upsert: true,
          });
        if (uploadOutputError) {
          throw new Error(`Could not upload output image: ${uploadOutputError.message}`);
        }

        const outputUrl = `order-files/${outputPath}`;
        const { error: assetUpdateError } = await supabase
          .from("order_assets")
          .update({ output_url: outputUrl })
          .eq("id", asset.id);
        if (assetUpdateError) {
          throw new Error(`Could not update output asset: ${assetUpdateError.message}`);
        }

        const doneLog = [
          ...jobLogs,
          {
            type: "processing_done",
            at: new Date().toISOString(),
            model,
            output_path: outputPath,
          },
        ];

        const { error: jobUpdateError } = await supabase
          .from("jobs")
          .update({
            status: "done",
            finished_at: new Date().toISOString(),
            next_retry_at: null,
            locked_by: null,
            last_error: null,
            logs: doneLog,
          })
          .eq("id", job.id);
        if (jobUpdateError) {
          throw new Error(`Could not finalize job: ${jobUpdateError.message}`);
        }

        await supabase.from("orders").update({ status: "ready" }).eq("id", job.order_id);

        results.push({ job_id: job.id, status: "done" });
      } catch (error) {
        const errorMessage = toErrorMessage(error);
        const retryInMinutes = Math.min(16, Math.pow(2, attempts));
        const nextRetryAt = new Date(Date.now() + retryInMinutes * 60 * 1000).toISOString();
        const exhausted = attempts >= 3;

        const failedLogs = [
          ...jobLogs,
          {
            type: "processing_failed",
            at: new Date().toISOString(),
            attempt: attempts,
            error: errorMessage,
          },
        ];

        await supabase
          .from("jobs")
          .update({
            status: "failed",
            finished_at: exhausted ? new Date().toISOString() : null,
            next_retry_at: exhausted ? null : nextRetryAt,
            locked_by: null,
            last_error: errorMessage,
            logs: failedLogs,
          })
          .eq("id", job.id);

        if (exhausted) {
          await supabase.from("orders").update({ status: "needs_revision" }).eq("id", job.order_id);
        } else {
          await supabase.from("orders").update({ status: "processing" }).eq("id", job.order_id);
        }

        results.push({
          job_id: job.id,
          status: exhausted ? "failed" : "retry_scheduled",
          next_retry_at: exhausted ? null : nextRetryAt,
          error: errorMessage,
        });
      }
    }

    return jsonResponse({
      ok: true,
      request_id: requestId,
      processed: jobs.length,
      results,
    });
  } catch (error) {
    console.error("[process-jobs] unhandled error", { requestId, error });
    return jsonResponse({ error: "Unexpected worker error", request_id: requestId }, 500);
  }
});
