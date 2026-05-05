"use client";

import { CSSProperties, useRef, useState, DragEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { MetricCard } from "./MetricCard";
import { useAudit } from "./AuditContext";
import type { UploadResult } from "./AuditContext";

const API = process.env.NEXT_PUBLIC_AUDIT_API ?? "http://localhost:8001";

// ─── RAG helpers ─────────────────────────────────────────────────────────────

function lapseRag(pct: number): "Green" | "Amber" | "Red" {
  if (pct < 20) return "Green";
  if (pct <= 40) return "Amber";
  return "Red";
}

function ethnicityRag(pct: number): "Green" | "Amber" | "Red" {
  if (pct > 90) return "Green";
  if (pct >= 70) return "Amber";
  return "Red";
}

// ─── Required columns ────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = [
  "patient_id",
  "age",
  "sex",
  "ethnicity",
  "imd_decile",
  "diagnosis_date",
  "outcome",
  "predicted_risk",
];

export default function UploadTab() {
  const [, dispatch] = useAudit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);

    try {
      // Encode as base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const csvB64 = btoa(binary);

      // POST to API
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

      const data: UploadResult = await res.json();
      setResult(data);
      dispatch({
        type: "SET_UPLOAD",
        csvFile: file,
        csvB64,
        result: data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  // ─── Styles ──────────────────────────────────────────────────────────────

  const dropZoneStyle: CSSProperties = {
    border: `2px dashed ${dragOver ? tokens.accent : tokens.border}`,
    borderRadius: 16,
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-color 200ms ease",
    fontSize: 14,
    color: dragOver ? tokens.accent : tokens.muted,
    userSelect: "none",
  };

  const metricRowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 24,
  };

  const validationGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginTop: 16,
  };

  const colBadgeStyle = (present: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 8,
    background: present ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
    border: `1px solid ${present ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
    fontSize: 13,
    color: present ? tokens.riskLow : tokens.riskHigh,
  });

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

  const survivalBannerStyle: CSSProperties = {
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(96,165,250,0.10)",
    border: `1px solid rgba(96,165,250,0.25)`,
    color: tokens.accent,
    fontSize: 13,
  };

  const tableWrapperStyle: CSSProperties = {
    overflowX: "auto",
    marginTop: 16,
  };

  const tableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
    color: tokens.text,
  };

  const thStyle: CSSProperties = {
    padding: "6px 10px",
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
    padding: "6px 10px",
    borderBottom: `1px solid ${tokens.border}`,
    whiteSpace: "nowrap",
    color: tokens.text,
  };

  // Determine which required columns are present from preview keys
  const previewKeys = result?.preview?.[0] ? Object.keys(result.preview[0]) : [];
  const missingSet = new Set(result?.missing_required ?? []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Drop zone */}
      <div
        style={dropZoneStyle}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Upload CSV file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={onInputChange}
        />
        {loading ? (
          <span style={{ color: tokens.muted }}>Uploading…</span>
        ) : (
          <span>Drop CSV here or click to browse</span>
        )}
      </div>

      {/* Error */}
      {error && <div style={errorBoxStyle}>⚠ {error}</div>}

      {/* Success state */}
      {result && !loading && (
        <>
          {/* Metric cards */}
          <div style={metricRowStyle}>
            <MetricCard
              label="Patients"
              value={result.patient_count.toLocaleString()}
              rag={null}
            />
            <MetricCard
              label="Lapse Rate"
              value={`${result.lapse_rate_pct.toFixed(1)}%`}
              rag={lapseRag(result.lapse_rate_pct)}
            />
            <MetricCard
              label="Ethnicity Coverage"
              value={`${result.ethnicity_coverage_pct.toFixed(1)}%`}
              rag={ethnicityRag(result.ethnicity_coverage_pct)}
            />
          </div>

          {/* Validation badges */}
          <p style={sectionLabelStyle}>Column Validation</p>
          <div style={validationGridStyle}>
            {REQUIRED_COLUMNS.map((col) => {
              const present = !missingSet.has(col);
              return (
                <div key={col} style={colBadgeStyle(present)}>
                  <span>{present ? "✓" : "✗"}</span>
                  <span style={{ fontFamily: "monospace" }}>{col}</span>
                </div>
              );
            })}
          </div>

          {/* Survival banner */}
          {result.has_survival && (
            <div style={survivalBannerStyle}>
              ⚠ Survival columns present — KM analysis available
            </div>
          )}

          {/* Preview table */}
          {result.preview && result.preview.length > 0 && (
            <>
              <p style={sectionLabelStyle}>Preview (first {result.preview.length} rows)</p>
              <LiquidGlassCard interactive={false} padding={0}>
                <div style={tableWrapperStyle}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        {previewKeys.map((k) => (
                          <th key={k} style={thStyle}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row, i) => (
                        <tr key={i}>
                          {previewKeys.map((k) => (
                            <td key={k} style={tdStyle}>
                              {String(row[k] ?? "")}
                            </td>
                          ))}
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
