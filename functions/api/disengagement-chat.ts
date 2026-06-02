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

const DISENGAGEMENT_SYSTEM =
  "You are an AI decision-support assistant for the UK Biotech Project 01 patient-disengagement model — " +
  "an XGBoost + SHAP early-warning system for GP practices, trained on synthetic CPRD Gold patients (10,000 cohort). " +
  "Answer questions about the model's behaviour, fairness audit results, NHS data standards (CPRD, OMOP CDM, SNOMED CT, " +
  "Read Codes, QOF, ICD-10), IMD deprivation, NICE ESF Tier B compliance, and clinical-workflow integration. " +
  "Reported metrics: AUC 0.94 (out-of-fold), 20 patients flagged ≥96% disengagement risk, IMD equalized-odds difference 0.21. " +
  "Be concise and evidence-grounded. End every response with: 'Decision support only — not a clinical finding. " +
  "Human review required before any patient action (UK GDPR Article 22).'";

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
      { role: "system", content: DISENGAGEMENT_SYSTEM },
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
