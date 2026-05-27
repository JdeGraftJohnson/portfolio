interface ChatRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

interface BackendResponse {
  reply?: string;
  error?: string;
}

const BACKEND = "https://p01-llm-api.greenmeadow-f26c79a5.uksouth.azurecontainerapps.io/chat";

const ICB_SYSTEM_PRIMER =
  "You are answering a question about the NHS Integrated Care Board (ICB) " +
  "regional risk map, which layers patient-disengagement risk, IMD quintile " +
  "distributions, CQC practice ratings, and urbanity across England. Provide " +
  "concise, evidence-grounded answers grounded in NHS publicly-reported data. " +
  "Never identify individual practices or patients; speak only in aggregates. " +
  "QUESTION: ";

const ALLOWED_ORIGINS = new Set<string>([
  "https://johndegraft.app",
  "https://www.johndegraft.app",
  "https://johndegraft-app.pages.dev",
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && (
      ALLOWED_ORIGINS.has(origin) ||
      /^https:\/\/[a-z0-9-]+\.johndegraft-app\.pages\.dev$/.test(origin)
    )
    ? origin
    : "https://johndegraft.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "3600",
    Vary: "Origin",
  };
}

export const onRequestOptions: PagesFunction = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin")),
  });
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  const origin = request.headers.get("Origin");
  const cors = corsHeaders(origin);
  try {
    const body = (await request.json()) as ChatRequest;
    if (!body?.message || typeof body.message !== "string") {
      return new Response(
        JSON.stringify({ error: "missing 'message' field" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
    const wrapped = ICB_SYSTEM_PRIMER + body.message.trim();
    const upstream = await fetch(BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: wrapped,
        history: Array.isArray(body.history) ? body.history : [],
      }),
    });
    const text = await upstream.text();
    let json: BackendResponse;
    try {
      json = JSON.parse(text) as BackendResponse;
    } catch {
      return new Response(
        JSON.stringify({ error: `upstream non-JSON: ${text.slice(0, 200)}` }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: json.error ?? `upstream ${upstream.status}` }),
        { status: upstream.status, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ reply: json.reply ?? "" }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
};

export const onRequestGet: PagesFunction = async ({ request }) =>
  new Response(JSON.stringify({ status: "ok", method: "POST only" }), {
    status: 200,
    headers: { ...corsHeaders(request.headers.get("Origin")), "Content-Type": "application/json" },
  });
