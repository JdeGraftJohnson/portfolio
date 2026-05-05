"use client";

import { CSSProperties, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { MetricCard } from "./MetricCard";
import { RagBadge } from "./RagBadge";
import { useAudit } from "./AuditContext";
import type { Core20Result, GapRow } from "./AuditContext";

const API = process.env.NEXT_PUBLIC_AUDIT_API ?? "http://localhost:8001";

// ─── RAG helpers ─────────────────────────────────────────────────────────────

function modelGapRag(gap: number): "Green" | "Amber" | "Red" {
  if (gap < 5) return "Green";
  if (gap <= 15) return "Amber";
  return "Red";
}

function ragLeftBorder(rag: GapRow["rag"]): string {
  switch (rag) {
    case "Green": return tokens.riskLow;
    case "Amber": return tokens.riskMid;
    case "Red":   return tokens.riskHigh;
  }
}

export default function Core20Tab() {
  const [state, dispatch] = useAudit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Core20Result | null>(state.core20Result);

  useEffect(() => {
    if (state.core20Result === null) setResult(null);
  }, [state.core20Result]);

  async function computeGaps() {
    if (!state.csvB64) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/core20`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_b64: state.csvB64 }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data: Core20Result = await res.json();
      setResult(data);
      dispatch({ type: "SET_CORE20", result: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Computation failed");
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
    @keyframes core20Pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;

  const heroCardStyle: CSSProperties = {
    marginTop: 24,
  };

  const tableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    color: tokens.text,
  };

  const thStyle: CSSProperties = {
    padding: "8px 12px",
    textAlign: "left",
    background: "rgba(255,255,255,0.08)",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.muted,
    borderBottom: `1px solid ${tokens.border}`,
    whiteSpace: "nowrap",
  };

  function tdStyle(rag?: GapRow["rag"]): CSSProperties {
    return {
      padding: "8px 12px",
      borderBottom: `1px solid ${tokens.border}`,
      borderLeft: rag ? `3px solid ${ragLeftBorder(rag)}` : undefined,
      color: tokens.text,
    };
  }

  const tdPlainStyle: CSSProperties = {
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.border}`,
    color: tokens.text,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <style>{pulseKeyframes}</style>

      {/* Compute button */}
      <button
        style={buttonStyle}
        onClick={computeGaps}
        disabled={!state.csvB64 || loading}
      >
        {loading ? "Computing…" : "Compute Gaps"}
      </button>

      {/* Loading state */}
      {loading && (
        <div style={loadingStyle}>
          <span
            style={{
              display: "inline-block",
              animation: "core20Pulse 1.4s ease-in-out infinite",
            }}
          >
            ●
          </span>
          Computing Core20PLUS5 gaps…
        </div>
      )}

      {/* Error */}
      {error && <div style={errorBoxStyle}>⚠ {error}</div>}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Hero metric — model IMD gap */}
          <div style={heroCardStyle}>
            <MetricCard
              label="Model IMD Gap"
              value={`${result.model_gap.toFixed(1)}pp`}
              rag={modelGapRag(result.model_gap)}
              sub="Difference in predicted risk between IMD Q1 and Q5"
            />
          </div>

          {/* Flag box */}
          {result.flag && (
            <>
              <p style={sectionLabelStyle}>Flag</p>
              <LiquidGlassCard
                interactive={false}
                padding={14}
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <span style={{ fontSize: 13, color: tokens.riskHigh }}>
                  ⚠ {result.flag}
                </span>
              </LiquidGlassCard>
            </>
          )}

          {/* RAG table */}
          {result.rows && result.rows.length > 0 && (
            <>
              <p style={sectionLabelStyle}>Clinical Area Breakdown</p>
              <LiquidGlassCard interactive={false} padding={0}>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Clinical Area</th>
                        <th style={thStyle}>IMD Q1 Rate</th>
                        <th style={thStyle}>IMD Q5 Rate</th>
                        <th style={thStyle}>Observed Gap</th>
                        <th style={thStyle}>Benchmark</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i}>
                          <td style={tdStyle(row.rag)}>{row.area}</td>
                          <td style={tdPlainStyle}>{(row.q1_rate * 100).toFixed(1)}%</td>
                          <td style={tdPlainStyle}>{(row.q5_rate * 100).toFixed(1)}%</td>
                          <td style={tdPlainStyle}>{row.observed_gap.toFixed(2)}pp</td>
                          <td style={tdPlainStyle}>{row.benchmark_gap.toFixed(2)}pp</td>
                          <td style={tdPlainStyle}>
                            <RagBadge rag={row.rag} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </LiquidGlassCard>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
