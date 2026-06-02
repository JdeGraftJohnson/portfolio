"use client";

import { useEffect, useState } from "react";

interface ParsedResponse {
  body: string;
}

const SUGGESTED_QUERIES = [
  "What features drive the highest disengagement risk in the cohort?",
  "How is the model's fairness audited across IMD quintiles?",
  "Why use CPRD Gold as the training cohort instead of CPRD Aurum?",
  "How does the OMOP CDM transformation handle legacy Read Codes?",
  "What's the workflow for a GP practice receiving a high-risk patient flag?",
  "How does this model comply with NICE ESF Tier B?",
];

interface LoadingStage {
  threshold_s: number;
  label: string;
  detail: string;
}

const STAGES: LoadingStage[] = [
  {
    threshold_s: 0,
    label: "Sending query to disengagement model layer",
    detail: "Routing through Cloudflare → Azure Container Apps",
  },
  {
    threshold_s: 4,
    label: "Retrieving CPRD / OMOP / SHAP reference data",
    detail: "Searching the patient-disengagement metadata, feature-importance ranks, and fairness audit corpus",
  },
  {
    threshold_s: 10,
    label: "Warming up Gemma 4",
    detail:
      "First request after idle triggers a ~30–45s cold start on Azure Container Apps Consumption tier. Subsequent calls return in 1–3s.",
  },
  {
    threshold_s: 25,
    label: "Almost there — finalizing response",
    detail: "Gemma 4 is composing the model-behaviour answer",
  },
  {
    threshold_s: 50,
    label: "Still working — upstream is slow",
    detail: "If this stalls past 90s, the container may have failed to start. Try again.",
  },
];

function parse(raw: string): ParsedResponse {
  const body = raw.trim();
  return { body };
}

export function DisengagementChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [loadingElapsed, setLoadingElapsed] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const start = performance.now();
    const id = setInterval(() => {
      setLoadingElapsed(Math.round((performance.now() - start) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    fetch("https://johndegraft-app.pages.dev/api/disengagement-chat", { method: "GET", cache: "no-store" }).catch(() => {});
  }, []);

  const currentStage = STAGES.reduce((acc, s) =>
    loadingElapsed >= s.threshold_s ? s : acc
  );

  async function submit(text: string) {
    const q = text.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setParsed(null);
    setLastQuestion(q);
    setInput("");
    setLoadingElapsed(0);
    const t0 = performance.now();
    const callApi = async () => {
      const r = await fetch("https://johndegraft-app.pages.dev/api/disengagement-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = (await r.json().catch(() => ({}))) as { reply?: string; error?: string };
      return { status: r.status, data };
    };
    try {
      let res = await callApi();
      if (res.status === 502 || res.status === 524 || res.data.error?.includes("524")) {
        await new Promise((r) => setTimeout(r, 3000));
        res = await callApi();
      }
      if (res.status !== 200 || res.data.error) {
        throw new Error(res.data.error ?? `HTTP ${res.status}`);
      }
      setParsed(parse(res.data.reply ?? ""));
      setElapsedMs(Math.round(performance.now() - t0));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", width: "100%" }}>
      <div
        style={{
          padding: "10px 14px",
          marginBottom: 16,
          borderRadius: 8,
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.30)",
          fontSize: 12,
          color: "rgba(191,219,254,0.95)",
        }}
      >
        ⓘ <b>Decision support only:</b> Risk scores are model outputs — not clinical findings.
        Human review required before any patient action (UK GDPR Article 22).
      </div>

      {!parsed && !loading && !error && (
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.55)",
              margin: 0,
              marginBottom: 10,
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
            }}
          >
            Suggested queries · Patient disengagement model
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => submit(q)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(96,165,250,0.20)",
                  background: "rgba(96,165,250,0.04)",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 160ms ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(96,165,250,0.10)";
                  e.currentTarget.style.borderColor = "rgba(96,165,250,0.55)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(96,165,250,0.04)";
                  e.currentTarget.style.borderColor = "rgba(96,165,250,0.20)";
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {lastQuestion && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(96,165,250,0.06)",
            border: "1px solid rgba(96,165,250,0.25)",
            color: "rgba(255,255,255,0.92)",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#60a5fa",
              marginBottom: 4,
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
            }}
          >
            Query
          </span>
          {lastQuestion}
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(96,165,250,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#60a5fa",
                animation: "disengage-pulse 1.4s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.92)", margin: 0, minWidth: 0 }}>
              {currentStage.label}…
            </p>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", fontVariantNumeric: "tabular-nums", fontFamily: "ui-monospace, SFMono-Regular, monospace", flexShrink: 0 }}>
              {loadingElapsed}s
            </span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", margin: 0, marginLeft: 24, lineHeight: 1.5 }}>
            {currentStage.detail}
          </p>
          <div style={{ display: "flex", gap: 4, marginTop: 12, marginLeft: 24 }}>
            {STAGES.map((s) => {
              const reached = loadingElapsed >= s.threshold_s;
              const active = currentStage === s;
              return (
                <span
                  key={s.threshold_s}
                  title={`${s.threshold_s}s+ · ${s.label}`}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: active
                      ? "#60a5fa"
                      : reached
                      ? "rgba(96,165,250,0.45)"
                      : "rgba(255,255,255,0.08)",
                    transition: "background 200ms ease",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "rgba(252,165,165,0.08)",
            border: "1px solid rgba(252,165,165,0.40)",
            color: "#fca5a5",
            fontSize: 13,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>⚠ Unable to reach the disengagement model assistant.</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(252,165,165,0.85)" }}>{error}</p>
        </div>
      )}

      {parsed && !loading && (
        <div
          style={{
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(96,165,250,0.22)",
            padding: "16px 18px",
          }}
        >
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.92)", margin: 0, whiteSpace: "pre-wrap" }}>
            {parsed.body}
          </p>
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexWrap: "wrap",
              fontSize: 11,
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <span>Synthetic CPRD Gold · SHAP feature importance · IMD-stratified fairness</span>
            {elapsedMs !== null && (
              <span style={{ marginLeft: "auto" }}>
                ⚡ {(elapsedMs / 1000).toFixed(1)}s · Gemma 4
              </span>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        style={{ display: "flex", gap: 8, marginTop: 16 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the disengagement model, fairness, or NHS standards…"
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background:
              loading || !input.trim()
                ? "rgba(96,165,250,0.20)"
                : "linear-gradient(135deg, #2563eb, #0e7490)",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Ask
        </button>
      </form>
      <p
        style={{
          marginTop: 10,
          textAlign: "center",
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}
      >
        Powered by Gemma 4 · Synthetic CPRD Gold · NHS ESF Tier B compliant
      </p>

      <style>{`
        @keyframes disengage-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
