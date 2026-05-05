"use client";

import { CSSProperties, useState } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { useAudit } from "./AuditContext";

const API = process.env.NEXT_PUBLIC_AUDIT_API ?? "http://localhost:8001";

// ─── Readiness row ─────────────────────────────────────────────────────────

interface ReadinessRowProps {
  label: string;
  ready: boolean;
}

function ReadinessRow({ label, ready }: ReadinessRowProps) {
  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: `1px solid ${tokens.border}`,
  };

  const iconStyle: CSSProperties = {
    fontSize: 16,
    color: ready ? tokens.riskLow : tokens.riskHigh,
    flexShrink: 0,
    width: 20,
    textAlign: "center",
  };

  const badgeStyle: CSSProperties = {
    marginLeft: "auto",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: 12,
    background: ready ? "rgba(39,174,96,0.15)" : "rgba(239,68,68,0.12)",
    color: ready ? tokens.riskLow : tokens.riskHigh,
    border: `1px solid ${ready ? "rgba(39,174,96,0.3)" : "rgba(239,68,68,0.25)"}`,
  };

  return (
    <div style={rowStyle}>
      <span style={iconStyle}>{ready ? "✓" : "✗"}</span>
      <span style={{ fontSize: 13, color: tokens.text }}>{label}</span>
      <span style={badgeStyle}>{ready ? "Ready" : "Incomplete"}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportTab() {
  const [state, dispatch] = useAudit();
  const [modelLabel, setModelLabel] = useState(state.modelLabel || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Readiness checks
  const gmlpReady   = Object.keys(state.gmlpResponses).length > 0;
  const esfReady    = state.niceEsfState.tier !== null;
  const core20Ready = state.core20Result !== null;
  const allReady    = gmlpReady && esfReady && core20Ready;

  async function bundleReports() {
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Keep model label in context
    if (modelLabel !== state.modelLabel) {
      dispatch({ type: "SET_MODEL_LABEL", label: modelLabel });
    }

    try {
      const resp = await fetch(`${API}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gmlp_responses:  state.gmlpResponses,
          nice_esf_state:  state.niceEsfState,
          core20_result:   state.core20Result,
          disparity_result: state.disparityResult,
          model_label:     modelLabel || "Patient Disengagement Risk",
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Server error ${resp.status}`);
      }

      const blob = await resp.blob();
      const today = new Date().toISOString().split("T")[0];
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `governance_reports_${today}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  // ─── Styles ───────────────────────────────────────────────────────────────

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.muted,
    marginBottom: 10,
    marginTop: 24,
  };

  const inputStyle: CSSProperties = {
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    color: tokens.text,
    fontSize: 13,
    borderRadius: 8,
    padding: "8px 12px",
    width: "100%",
    maxWidth: 400,
    outline: "none",
  };

  const btnStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: "10px 24px",
    borderRadius: 20,
    background: allReady && !loading ? tokens.accent : "rgba(255,255,255,0.08)",
    color: allReady && !loading ? "#05050f" : tokens.muted,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: allReady && !loading ? "pointer" : "not-allowed",
    transition: "background 200ms, color 200ms",
  };

  const errorStyle: CSSProperties = {
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: tokens.riskHigh,
    fontSize: 13,
  };

  const successStyle: CSSProperties = {
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(39,174,96,0.12)",
    border: "1px solid rgba(39,174,96,0.30)",
    color: tokens.riskLow,
    fontSize: 13,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Readiness checklist */}
      <p style={sectionLabel}>Report Readiness</p>
      <LiquidGlassCard interactive={false} padding={16}>
        <ReadinessRow label="MHRA GMLP Compliance"           ready={gmlpReady}   />
        <ReadinessRow label="NICE Evidence Standards Framework" ready={esfReady} />
        <ReadinessRow label="Core20PLUS5 Inequality Gap"     ready={core20Ready} />
      </LiquidGlassCard>

      {/* Model label input */}
      <p style={sectionLabel}>Model Name for Report Cover</p>
      <input
        style={inputStyle}
        type="text"
        placeholder="e.g. XGBoost Patient Risk"
        value={modelLabel}
        onChange={(e) => setModelLabel(e.target.value)}
      />

      {/* Bundle button */}
      <div>
        <button
          style={btnStyle}
          onClick={bundleReports}
          disabled={!allReady || loading}
          type="button"
        >
          {loading ? "Generating PDFs…" : "📥 Bundle Reports"}
        </button>
      </div>

      {/* Feedback */}
      {error   && <div style={errorStyle}>⚠ {error}</div>}
      {success && <div style={successStyle}>3 PDFs bundled and downloaded.</div>}
    </motion.div>
  );
}
