interface ChatRequest {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

interface OllamaChatResponse {
  message?: { role: string; content: string };
  error?: string;
}

const BACKEND =
  "https://aca-portfolio-llm-prod1.proudbeach-01a5e1df.eastus2.azurecontainerapps.io/api/chat";
const MODEL = "gemma3:4b";

const CLINICAL_SYSTEM =
  "You are an NHS clinical decision-support assistant grounded in NICE guidelines and the British National Formulary (BNF). " +
  "Answer concisely with: (1) a direct reference to the relevant NICE guideline (e.g., NG28 for type 2 diabetes), " +
  "(2) a SNOMED CT code where applicable, " +
  "(3) a brief evidence-grounded summary, " +
  "(4) a mandatory closing note that every response REQUIRES human clinical review before any clinical action — " +
  "the system never makes autonomous clinical decisions (UK GDPR Article 22). " +
  "Never identify individual patients or practices. Stick to publicly published guidance.";

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
    const history = Array.isArray(body.history) ? body.history : [];
    const messages = [
      { role: "system", content: CLINICAL_SYSTEM },
      ...history,
      { role: "user", content: body.message.trim() },
    ];

    const upstream = await fetch(BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        options: { num_ctx: 4096, num_predict: 512, temperature: 0.3 },
      }),
    });
    const text = await upstream.text();
    let json: OllamaChatResponse;
    try {
      json = JSON.parse(text) as OllamaChatResponse;
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
    const reply = json.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
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
