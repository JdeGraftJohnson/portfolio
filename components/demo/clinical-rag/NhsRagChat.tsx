"use client";

import { useEffect, useState } from "react";

interface ParsedResponse {
  body: string;
  confidence: number;
  citation: string;
  snomed: string;
  reviewRequired: boolean;
}

const SUGGESTED_QUERIES = [
  "What is the NICE guidance on managing type 2 diabetes in primary care?",
  "What are the BNF contraindications for metformin?",
  "Summarise NICE NG12 — suspected cancer referral thresholds.",
  "What does NICE say about antibiotic prescribing for UTI in adults?",
  "First-line treatment for hypertension in adults under 55?",
  "When should anticoagulation be initiated in atrial fibrillation?",
];

function extract(raw: string, key: string): string | null {
  const m = raw.match(new RegExp(`${key}:\\s*(.+)`));
  return m ? m[1].trim() : null;
}

function parse(raw: string): ParsedResponse {
  const cRaw = extract(raw, "CONFIDENCE");
  const niceRaw = extract(raw, "NICE_CITATION");
  const snomedRaw = extract(raw, "SNOMED_CT");
  const reviewRaw = extract(raw, "CLINICAL_REVIEW");
  const body = raw
    .replace(/CONFIDENCE:\s*.+/g, "")
    .replace(/NICE_CITATION:\s*.+/g, "")
    .replace(/SNOMED_CT:\s*.+/g, "")
    .replace(/CLINICAL_REVIEW:\s*.+/g, "")
    .trim();
  const c = cRaw ? parseInt(cRaw, 10) : 75;
  return {
    body,
    confidence: isNaN(c) ? 75 : c,
    citation: niceRaw ?? "—",
    snomed: snomedRaw ?? "—",
    reviewRequired:
      reviewRaw ? /required|yes|true|mandatory/i.test(reviewRaw) : true,
  };
}

interface LoadingStage {
  threshold_s: number;
  label: string;
  detail: string;
}

const STAGES: LoadingStage[] = [
  {
    threshold_s: 0,
    label: "Sending query to clinical RAG",
    detail: "Routing through Cloudflare → Azure Container Apps",
  },
  {
    threshold_s: 4,
    label: "Retrieving NICE / BNF guidelines",
    detail: "Searching the 50k-chunk knowledge base for relevant evidence",
  },
  {
    threshold_s: 10,
    label: "Warming up Gemma 4",
    detail:
      "The model is on Azure Container Apps Consumption tier — first request after idle triggers a ~30–45s cold start. Subsequent calls return in 1–3s.",
  },
  {
    threshold_s: 25,
    label: "Almost there — finalizing response",
    detail: "Gemma 4 is generating the evidence-grounded answer with citations",
  },
  {
    threshold_s: 50,
    label: "Still working — upstream is slow",
    detail: "If this stalls past 90s, the container may have failed to start. Try again.",
  },
];

export function NhsRagChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [loadingElapsed, setLoadingElapsed] = useState(0);

  // Tick a counter every 500ms while loading so the stage hint can advance
  useEffect(() => {
    if (!loading) return;
    const start = performance.now();
    const id = setInterval(() => {
      setLoadingElapsed(Math.round((performance.now() - start) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [loading]);

  // Fire-and-forget pre-warm on mount so the Azure Container App is warming
  // up while the user reads the suggested queries.
  useEffect(() => {
    fetch("https://johndegraft-app.pages.dev/api/clinical-chat", { method: "GET", cache: "no-store" }).catch(() => {});
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
      const r = await fetch("https://johndegraft-app.pages.dev/api/clinical-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = (await r.json().catch(() => ({}))) as { reply?: string; error?: string };
      return { status: r.status, data };
    };
    try {
      let res = await callApi();
      // Retry once on 502 / 524-equivalent (cold-start timeout). Container is
      // warmed by the first attempt; the retry typically returns in 1–3 s.
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
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Compliance banner */}
      <div
        style={{
          padding: "10px 14px",
          marginBottom: 16,
          borderRadius: 8,
          background: "rgba(254,215,170,0.08)",
          border: "1px solid rgba(254,215,170,0.30)",
          fontSize: 12,
          color: "rgba(254,215,170,0.95)",
        }}
      >
        ⚠ <b>UK GDPR Art.22 — Automated Decision-Making:</b> Every response
        requires clinical review before acting. This system never makes
        autonomous clinical decisions.
      </div>

      {/* Suggested queries */}
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
            Suggested queries · NICE/BNF knowledge base
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
                  border: "1px solid rgba(249,168,212,0.20)",
                  background: "rgba(249,168,212,0.04)",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 160ms ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(249,168,212,0.10)";
                  e.currentTarget.style.borderColor = "rgba(249,168,212,0.55)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(249,168,212,0.04)";
                  e.currentTarget.style.borderColor = "rgba(249,168,212,0.20)";
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Last question */}
      {lastQuestion && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(249,168,212,0.08)",
            border: "1px solid rgba(249,168,212,0.25)",
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
              color: "#f9a8d4",
              marginBottom: 4,
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
            }}
          >
            Clinical query
          </span>
          {lastQuestion}
        </div>
      )}

      {/* Loading — multi-stage hint */}
      {loading && (
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(249,168,212,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#f9a8d4",
                animation: "nhsrag-pulse 1.4s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  margin: 0,
                }}
              >
                {currentStage.label}…
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.50)",
                fontVariantNumeric: "tabular-nums",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                flexShrink: 0,
              }}
            >
              {loadingElapsed}s
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.60)",
              margin: 0,
              marginLeft: 24,
              lineHeight: 1.5,
            }}
          >
            {currentStage.detail}
          </p>
          {/* Stage progress dots */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginTop: 12,
              marginLeft: 24,
            }}
          >
            {STAGES.map((s, i) => {
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
                      ? "#f9a8d4"
                      : reached
                      ? "rgba(249,168,212,0.45)"
                      : "rgba(255,255,255,0.08)",
                    transition: "background 200ms ease",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
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
          <p style={{ margin: 0, fontWeight: 600 }}>
            ⚠ Unable to reach the clinical assistant.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(252,165,165,0.85)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Parsed response */}
      {parsed && !loading && (
        <div
          style={{
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(249,168,212,0.20)",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 12,
                background:
                  parsed.confidence >= 80
                    ? "rgba(110,231,183,0.12)"
                    : parsed.confidence >= 50
                    ? "rgba(251,191,36,0.12)"
                    : "rgba(252,165,165,0.12)",
                color:
                  parsed.confidence >= 80
                    ? "#6ee7b7"
                    : parsed.confidence >= 50
                    ? "#fbbf24"
                    : "#fca5a5",
                border:
                  "1px solid " +
                  (parsed.confidence >= 80
                    ? "rgba(110,231,183,0.40)"
                    : parsed.confidence >= 50
                    ? "rgba(251,191,36,0.40)"
                    : "rgba(252,165,165,0.40)"),
              }}
            >
              Confidence {parsed.confidence}%
            </span>
            {parsed.reviewRequired && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 12,
                  background: "rgba(254,215,170,0.12)",
                  color: "#fde68a",
                  border: "1px solid rgba(254,215,170,0.45)",
                }}
              >
                ⚠ Requires clinical review
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.92)",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
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
            }}
          >
            <span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>NICE: </span>
              <span style={{ color: "#f9a8d4" }}>{parsed.citation}</span>
            </span>
            <span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>SNOMED CT: </span>
              <span style={{ color: "#c4b5fd" }}>{parsed.snomed}</span>
            </span>
            {elapsedMs !== null && (
              <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.40)" }}>
                ⚡ {(elapsedMs / 1000).toFixed(1)}s · Gemma 4
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a clinical protocol question…"
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
                ? "rgba(249,168,212,0.20)"
                : "linear-gradient(135deg, #f472b6, #d946ef)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
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
        Powered by Gemma 4 · NICE/BNF knowledge base · UK GDPR Art.22 compliant
      </p>

      <style>{`
        @keyframes nhsrag-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
