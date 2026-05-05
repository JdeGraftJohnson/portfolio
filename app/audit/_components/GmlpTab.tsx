"use client";

import { CSSProperties, useState } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { MetricCard } from "./MetricCard";
import { RagBadge } from "./RagBadge";
import { useAudit } from "./AuditContext";
import type { GmlpResponse } from "./AuditContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  { id: "p1",  name: "Patient safety is paramount" },
  { id: "p2",  name: "Clinical and technical validity" },
  { id: "p3",  name: "Fairness and bias mitigation" },
  { id: "p4",  name: "Transparency and explainability" },
  { id: "p5",  name: "Data governance and quality" },
  { id: "p6",  name: "Cybersecurity and resilience" },
  { id: "p7",  name: "Deployment and monitoring" },
  { id: "p8",  name: "Clinical integration and usability" },
  { id: "p9",  name: "Regulatory compliance and approval" },
  { id: "p10", name: "Accountability and governance" },
] as const;

type Rating = GmlpResponse["rating"];
const RATINGS: Rating[] = ["Yes", "Partial", "No", "N/A"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ratingToRag(rating: Rating): "Green" | "Amber" | "Red" | "Grey" {
  switch (rating) {
    case "Yes":     return "Green";
    case "Partial": return "Amber";
    case "No":      return "Red";
    default:        return "Grey";
  }
}

function ratingFillColor(rating: Rating): string {
  switch (rating) {
    case "Yes":     return tokens.riskLow;
    case "Partial": return tokens.riskMid;
    case "No":      return tokens.riskHigh;
    default:        return tokens.muted;
  }
}

function scoreToRag(score: number): "Green" | "Amber" | "Red" {
  if (score >= 80) return "Green";
  if (score >= 50) return "Amber";
  return "Red";
}

function scoreBarFill(score: number): string {
  if (score >= 80) return tokens.riskLow;
  if (score >= 50) return tokens.riskMid;
  return tokens.riskHigh;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GmlpTab() {
  const [, dispatch] = useAudit();

  // Local state: responses keyed by principle id
  const [responses, setResponses] = useState<Record<string, GmlpResponse>>(() =>
    Object.fromEntries(PRINCIPLES.map((p) => [p.id, { rating: "N/A", evidence: "" }]))
  );

  // Which accordion panels are open
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // ── Score calculation
  const nonNa = PRINCIPLES.filter((p) => responses[p.id].rating !== "N/A");
  const yesCount = PRINCIPLES.filter((p) => responses[p.id].rating === "Yes").length;
  const score = nonNa.length === 0 ? 0 : Math.round((yesCount / nonNa.length) * 100);

  // ── Mutation helpers
  function updateRating(id: string, rating: Rating) {
    const next = { ...responses, [id]: { ...responses[id], rating } };
    setResponses(next);
    dispatch({ type: "SET_GMLP", questionId: id, response: next[id] });
  }

  function updateEvidence(id: string, evidence: string) {
    const next = { ...responses, [id]: { ...responses[id], evidence } };
    setResponses(next);
    dispatch({ type: "SET_GMLP", questionId: id, response: next[id] });
  }

  function toggleOpen(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // ── Styles
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  };

  const headerRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  };

  const progressTrackStyle: CSSProperties = {
    width: "100%",
    height: 6,
    borderRadius: 3,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  };

  const progressFillStyle: CSSProperties = {
    height: "100%",
    width: `${score}%`,
    background: scoreBarFill(score),
    borderRadius: 3,
    transition: "width 400ms ease, background 400ms ease",
  };

  const accordionListStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={containerStyle}
    >
      {/* Section header */}
      <div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: tokens.text,
            margin: "0 0 16px",
          }}
        >
          MHRA Good Machine Learning Practice · 10 Principles
        </h2>

        <div style={headerRowStyle}>
          <div style={{ minWidth: 220 }}>
            <MetricCard
              label="GMLP Compliance"
              value={`${score}%`}
              sub={nonNa.length === 0 ? "No principles answered yet" : `${yesCount} of ${nonNa.length} answered principles met`}
              rag={scoreToRag(score)}
            />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={progressTrackStyle}>
        <div style={progressFillStyle} />
      </div>

      {/* Accordion principles */}
      <div style={accordionListStyle}>
        {PRINCIPLES.map((principle, idx) => {
          const resp = responses[principle.id];
          const isOpen = !!open[principle.id];

          const headerBtnStyle: CSSProperties = {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            gap: 12,
            textAlign: "left",
          };

          const principleNameStyle: CSSProperties = {
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
          };

          const chevronStyle: CSSProperties = {
            color: tokens.muted,
            fontSize: 12,
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
          };

          const radioRowStyle: CSSProperties = {
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
          };

          const textareaStyle: CSSProperties = {
            width: "100%",
            minHeight: 80,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8,
            color: tokens.text,
            fontSize: 13,
            padding: "8px 12px",
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          };

          return (
            <LiquidGlassCard key={principle.id} interactive={false} padding={14} radius={12}>
              {/* Header row */}
              <button style={headerBtnStyle} onClick={() => toggleOpen(principle.id)}>
                <div style={principleNameStyle}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: tokens.muted,
                      flexShrink: 0,
                      minWidth: 28,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: tokens.text }}>
                    {principle.name}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <RagBadge rag={ratingToRag(resp.rating)} />
                  <span style={chevronStyle}>▼</span>
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                  {/* Rating toggles */}
                  <div style={radioRowStyle}>
                    {RATINGS.map((r) => {
                      const selected = resp.rating === r;
                      const fillColor = ratingFillColor(r);
                      const btnStyle: CSSProperties = {
                        padding: "6px 16px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: selected ? `1px solid ${fillColor}` : "1px solid rgba(255,255,255,0.15)",
                        background: selected ? `${fillColor}26` : "rgba(255,255,255,0.04)",
                        color: selected ? fillColor : tokens.muted,
                        transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
                        outline: "none",
                      };
                      return (
                        <button key={r} style={btnStyle} onClick={() => updateRating(principle.id, r)}>
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  {/* Evidence textarea */}
                  <label>
                    <span
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: tokens.muted,
                        marginBottom: 6,
                      }}
                    >
                      Evidence / Notes
                    </span>
                    <textarea
                      rows={4}
                      style={textareaStyle}
                      placeholder="Evidence / notes"
                      value={resp.evidence}
                      onChange={(e) => updateEvidence(principle.id, e.target.value)}
                    />
                  </label>
                </div>
              )}
            </LiquidGlassCard>
          );
        })}
      </div>
    </motion.div>
  );
}
