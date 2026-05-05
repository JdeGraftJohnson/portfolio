"use client";

import { CSSProperties, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { MetricCard } from "./MetricCard";
import { PlotlyChart } from "./PlotlyChart";
import { useAudit } from "./AuditContext";
import type { DisparityResult } from "./AuditContext";

const API = process.env.NEXT_PUBLIC_AUDIT_API ?? "http://localhost:8001";

// ─── RAG helpers ─────────────────────────────────────────────────────────────

function accuracyRag(v: number): "Green" | "Amber" | "Red" {
  if (v > 0.8) return "Green";
  if (v >= 0.6) return "Amber";
  return "Red";
}

function brierRag(v: number): "Green" | "Amber" | "Red" {
  if (v < 0.15) return "Green";
  if (v <= 0.25) return "Amber";
  return "Red";
}

function dispRag(v: number): "Green" | "Amber" | "Red" {
  const abs = Math.abs(v);
  if (abs < 0.05) return "Green";
  if (abs <= 0.10) return "Amber";
  return "Red";
}

function fmtDisp(v: number): string {
  return (v >= 0 ? "+" : "") + v.toFixed(3);
}

export default function DisparityTab() {
  const [state, dispatch] = useAudit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DisparityResult | null>(state.disparityResult);

  useEffect(() => {
    if (state.disparityResult === null) setResult(null);
  }, [state.disparityResult]);

  async function runAnalysis() {
    if (!state.csvB64) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/disparity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_b64: state.csvB64 }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data: DisparityResult = await res.json();
      setResult(data);
      dispatch({ type: "SET_DISPARITY", result: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  // ─── Styles ──────────────────────────────────────────────────────────────

  const buttonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 24px",
    borderRadius: 20,
    background: state.csvB64 && !loading ? tokens.accent : "rgba(255,255,255,0.08)",
    color: state.csvB64 && !loading ? "#05050f" : tokens.muted,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: state.csvB64 && !loading ? "pointer" : "not-allowed",
    transition: "background 200ms ease, color 200ms ease",
  };

  const metricRowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginTop: 24,
  };

  const sectionLabelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.muted,
    marginBottom: 8,
    marginTop: 24,
  };

  const errorBoxStyle: CSSProperties = {
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: tokens.riskHigh,
    fontSize: 13,
  };

  const loadingStyle: CSSProperties = {
    marginTop: 24,
    color: tokens.muted,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const pulseKeyframes = `
    @keyframes auditPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <style>{pulseKeyframes}</style>

      {/* Run button */}
      <button
        style={buttonStyle}
        onClick={runAnalysis}
        disabled={!state.csvB64 || loading}
      >
        {loading ? "Computing…" : "Run Analysis"}
      </button>

      {/* Loading state */}
      {loading && (
        <div style={loadingStyle}>
          <span
            style={{
              display: "inline-block",
              animation: "auditPulse 1.4s ease-in-out infinite",
            }}
          >
            ●
          </span>
          Computing Fairlearn metrics…
        </div>
      )}

      {/* Error */}
      {error && <div style={errorBoxStyle}>⚠ {error}</div>}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Overall performance metrics */}
          <p style={sectionLabelStyle}>Overall Performance</p>
          <div style={metricRowStyle}>
            <MetricCard
              label="Accuracy"
              value={result.overall.accuracy.toFixed(3)}
              rag={accuracyRag(result.overall.accuracy)}
            />
            <MetricCard
              label="Precision"
              value={result.overall.precision.toFixed(3)}
              rag={accuracyRag(result.overall.precision)}
            />
            <MetricCard
              label="Recall"
              value={result.overall.recall.toFixed(3)}
              rag={accuracyRag(result.overall.recall)}
            />
            <MetricCard
              label="Brier Score"
              value={result.overall.brier_score.toFixed(3)}
              rag={brierRag(result.overall.brier_score)}
            />
          </div>

          {/* Disparity metrics */}
          <p style={sectionLabelStyle}>Fairness Metrics</p>
          <div style={metricRowStyle}>
            <MetricCard
              label="EOD Ethnicity"
              value={fmtDisp(result.overall.eod_ethnicity)}
              rag={dispRag(result.overall.eod_ethnicity)}
            />
            <MetricCard
              label="EOD IMD"
              value={fmtDisp(result.overall.eod_imd)}
              rag={dispRag(result.overall.eod_imd)}
            />
            <MetricCard
              label="SPD Ethnicity"
              value={fmtDisp(result.overall.spd_ethnicity)}
              rag={dispRag(result.overall.spd_ethnicity)}
            />
            <MetricCard
              label="SPD IMD"
              value={fmtDisp(result.overall.spd_imd)}
              rag={dispRag(result.overall.spd_imd)}
            />
          </div>

          {/* Flag boxes */}
          {result.flags.length > 0 && (
            <>
              <p style={sectionLabelStyle}>Flags</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.flags.map((flag, i) => (
                  <LiquidGlassCard
                    key={i}
                    interactive={false}
                    padding={14}
                    style={{
                      background: "rgba(239,68,68,0.10)",
                      border: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <span style={{ fontSize: 13, color: tokens.riskHigh }}>
                      ⚠ {flag}
                    </span>
                  </LiquidGlassCard>
                ))}
              </div>
            </>
          )}

          {/* Heatmap */}
          {result.heatmap_plotly && (
            <>
              <p style={sectionLabelStyle}>Disparity Heatmap</p>
              <LiquidGlassCard interactive={false} padding={16}>
                <PlotlyChart figure={result.heatmap_plotly} height={420} />
              </LiquidGlassCard>
            </>
          )}

          {/* KM section */}
          {result.km_plotly && (
            <>
              <p style={sectionLabelStyle}>Kaplan–Meier Survival</p>
              <LiquidGlassCard interactive={false} padding={16}>
                <PlotlyChart figure={result.km_plotly} height={380} />
              </LiquidGlassCard>
              {result.km_p_value !== null && (
                <div style={{ marginTop: 16, maxWidth: 220 }}>
                  <MetricCard
                    label="Log-rank p"
                    value={result.km_p_value < 0.001 ? "< 0.001" : result.km_p_value.toFixed(4)}
                    rag={result.km_significant === true ? "Red" : result.km_significant === false ? "Green" : "Amber"}
                    sub={result.km_significant == null ? "Significance unknown" : result.km_significant ? "Significant disparity (p < 0.05)" : "No significant disparity"}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
