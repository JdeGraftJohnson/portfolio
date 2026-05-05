"use client";

import { CSSProperties, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { MetricCard } from "./MetricCard";

const API = process.env.NEXT_PUBLIC_AUDIT_API ?? "http://localhost:8001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RunRow {
  id: string;
  name: string;
  status: string;
  started: string;
  latency_s: number | null;
  tags: string[];
}

interface TracesResponse {
  runs: RunRow[];
  total: number;
  successful: number;
  avg_latency_s: number;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ObservabilityTab() {
  const [data, setData]       = useState<TracesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  async function fetchTraces() {
    setLoading(true);
    setFetchErr(null);
    try {
      const resp = await fetch(`${API}/traces`);
      if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
      const json: TracesResponse = await resp.json();
      setData(json);
    } catch (err) {
      setFetchErr(err instanceof Error ? err.message : "Failed to load traces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTraces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Styles ────────────────────────────────────────────────────────────────

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: tokens.muted,
    marginBottom: 10,
    marginTop: 24,
  };

  const warnBoxStyle: CSSProperties = {
    padding: "14px 18px",
    borderRadius: 12,
    background: "rgba(243,156,18,0.12)",
    border: "1px solid rgba(243,156,18,0.30)",
    color: "#f39c12",
    fontSize: 13,
    marginTop: 16,
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

  const tdStyle: CSSProperties = {
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.border}`,
    color: tokens.text,
  };

  const btnStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 20px",
    borderRadius: 16,
    background: loading ? "rgba(255,255,255,0.08)" : tokens.accent,
    color: loading ? tokens.muted : "#05050f",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "background 200ms, color 200ms",
  };

  function statusColor(status: string): string {
    if (status === "success" || status === "succeeded") return tokens.riskLow;
    if (status === "error"   || status === "failed")    return tokens.riskHigh;
    return tokens.muted;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Refresh button */}
      <button style={btnStyle} onClick={fetchTraces} disabled={loading} type="button">
        {loading ? "Loading…" : "↻ Refresh"}
      </button>

      {/* Fetch error */}
      {fetchErr && (
        <div style={{ ...warnBoxStyle, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", color: tokens.riskHigh, marginTop: 16 }}>
          ⚠ {fetchErr}
        </div>
      )}

      {/* API key warning */}
      {data?.error && (
        <div style={warnBoxStyle}>
          ⚠ {data.error === "LANGSMITH_API_KEY not set"
            ? "Set LANGSMITH_API_KEY to enable tracing"
            : data.error}
        </div>
      )}

      {/* Metric cards */}
      {data && !data.error && (
        <>
          <p style={sectionLabel}>Summary</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <MetricCard label="Total Runs"  value={data.total}     rag="Blue" />
            <MetricCard label="Successful"  value={data.successful} rag="Green" />
            <MetricCard
              label="Avg Latency"
              value={`${data.avg_latency_s.toFixed(1)}s`}
              rag={data.avg_latency_s > 30 ? "Amber" : "Green"}
            />
          </div>

          {/* Runs table */}
          {data.runs.length > 0 && (
            <>
              <p style={sectionLabel}>Recent Runs</p>
              <LiquidGlassCard interactive={false} padding={0}>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Started</th>
                        <th style={thStyle}>Latency</th>
                        <th style={thStyle}>Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.runs.map((run) => (
                        <tr key={run.id}>
                          <td style={tdStyle}>{run.name}</td>
                          <td style={{ ...tdStyle, color: statusColor(run.status), fontWeight: 600 }}>
                            {run.status}
                          </td>
                          <td style={tdStyle}>{run.started || "—"}</td>
                          <td style={tdStyle}>
                            {run.latency_s != null ? `${run.latency_s.toFixed(1)}s` : "—"}
                          </td>
                          <td style={tdStyle}>
                            {run.tags.length > 0 ? run.tags.join(", ") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </LiquidGlassCard>
            </>
          )}

          {/* LangSmith link */}
          <div style={{ marginTop: 16 }}>
            <a
              href="https://smith.langchain.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: tokens.accent, textDecoration: "none" }}
            >
              Open in LangSmith ↗
            </a>
          </div>
        </>
      )}

      {/* Caption */}
      <p style={{ marginTop: 24, fontSize: 11, color: tokens.muted, fontStyle: "italic" }}>
        Token counts not available — inspect_petri runs as subprocess
      </p>
    </motion.div>
  );
}
