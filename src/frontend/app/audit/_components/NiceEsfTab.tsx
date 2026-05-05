"use client";

import { CSSProperties, useState } from "react";
import { motion } from "framer-motion";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";
import { MetricCard } from "./MetricCard";
import { useAudit } from "./AuditContext";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tier = "A" | "B" | "C";

const TIER_META: Record<Tier, { label: string; description: string; criteria: string[] }> = {
  A: {
    label: "Tier A",
    description: "Informing clinical management",
    criteria: [
      "Clinical evidence of safety and accuracy",
      "Explanation of algorithm outputs provided",
      "Model performance documented (AUC, sensitivity, specificity)",
      "Data source and training set described",
      "Limitations clearly stated",
    ],
  },
  B: {
    label: "Tier B",
    description: "Supporting clinical decision-making",
    criteria: [
      "Prospective clinical validation study",
      "Equalized Odds Difference ≤ 0.10 (NICE ESF fairness threshold)",
      "Explainability for individual predictions (SHAP or equivalent)",
      "Data Protection Impact Assessment (DPIA) completed",
      "Integration with clinical workflow described",
      "Ongoing monitoring plan specified",
      "NHS ethnicity code compliance (16+1 standard)",
    ],
  },
  C: {
    label: "Tier C",
    description: "Replacing clinical decision-making",
    criteria: [
      "UKCA/CE marking or MHRA registration",
      "Randomised controlled trial evidence",
      "Real-world performance data post-deployment",
      "Clinician override mechanism documented",
      "Adverse event reporting process defined",
    ],
  },
};

const DEFAULT_NARRATIVES: Record<Tier, string> = {
  A: "This model is intended to inform clinical management. Clinical accuracy and algorithmic explainability have been evaluated per NICE ESF Tier A standards.",
  B: "This model supports clinical decision-making. Prospective validation, fairness evaluation (EOD ≤ 0.10), and NHS ethnicity compliance have been addressed.",
  C: "This model is intended to replace a clinical decision. UKCA marking, RCT evidence, and adverse event reporting processes are documented below.",
};

const TIERS: Tier[] = ["A", "B", "C"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function criteriaRag(met: number, total: number): "Green" | "Amber" | "Red" {
  if (met === total) return "Green";
  if (total === 0) return "Red";
  const pct = met / total;
  return pct >= 0.5 ? "Amber" : "Red";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NiceEsfTab() {
  const [, dispatch] = useAudit();

  const [tier, setTier] = useState<Tier>("A");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [narrative, setNarrative] = useState<string>(DEFAULT_NARRATIVES["A"]);
  // Track whether the narrative has been edited away from the default
  const [narrativeEdited, setNarrativeEdited] = useState(false);

  const currentCriteria = TIER_META[tier].criteria;
  const metCount = currentCriteria.filter((c) => checked[`${tier}:${c}`]).length;
  const total = currentCriteria.length;

  // ── Handlers
  function selectTier(t: Tier) {
    setTier(t);
    if (!narrativeEdited) {
      setNarrative(DEFAULT_NARRATIVES[t]);
    }
    dispatch({
      type: "SET_NICE_ESF",
      state: { tier: t, checked, narrative: narrativeEdited ? narrative : DEFAULT_NARRATIVES[t] },
    });
  }

  function toggleCriterion(criterionKey: string) {
    const next = { ...checked, [criterionKey]: !checked[criterionKey] };
    setChecked(next);
    dispatch({ type: "SET_NICE_ESF", state: { tier, checked: next, narrative } });
  }

  function handleNarrativeChange(val: string) {
    setNarrative(val);
    setNarrativeEdited(true);  // never revert — once user edits, always protect
    dispatch({ type: "SET_NICE_ESF", state: { tier, checked, narrative: val } });
  }

  // ── Styles
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  };

  const tierGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  };

  const checklistStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  const textareaStyle: CSSProperties = {
    width: "100%",
    minHeight: 160,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 8,
    color: tokens.text,
    fontSize: 13,
    padding: "10px 14px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={containerStyle}
    >
      {/* Section header */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: tokens.text,
          margin: 0,
        }}
      >
        NICE Evidence Standards Framework
      </h2>

      {/* Tier selector */}
      <div style={tierGridStyle}>
        {TIERS.map((t) => {
          const selected = tier === t;
          const meta = TIER_META[t];
          const tierCriteria = meta.criteria;
          const tierMet = tierCriteria.filter((c) => checked[`${t}:${c}`]).length;

          const cardStyle: CSSProperties = {
            border: selected
              ? `1px solid ${tokens.accent}`
              : "1px solid rgba(255,255,255,0.10)",
            opacity: selected ? 1 : 0.55,
            transition: "border-color 200ms ease, opacity 200ms ease, transform 200ms ease",
            transform: selected ? "translateY(-2px)" : "translateY(0)",
            cursor: "pointer",
            textAlign: "center",
          };

          const tierLetterStyle: CSSProperties = {
            fontSize: 32,
            fontWeight: 800,
            color: selected ? tokens.accent : tokens.text,
            lineHeight: 1,
            marginBottom: 6,
            transition: "color 200ms ease",
          };

          const badgeStyle: CSSProperties = {
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 600,
            background: selected ? `${tokens.accent}26` : "rgba(255,255,255,0.08)",
            color: selected ? tokens.accent : tokens.muted,
            marginTop: 6,
          };

          return (
            <LiquidGlassCard
              key={t}
              interactive
              padding={16}
              radius={14}
              style={cardStyle}
              onClick={() => selectTier(t)}
            >
              <div style={tierLetterStyle}>{t}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: tokens.text, marginBottom: 4 }}>
                {meta.label}
              </div>
              <div style={{ fontSize: 11, color: tokens.muted, lineHeight: 1.4 }}>
                {meta.description}
              </div>
              <span style={badgeStyle}>
                {tierMet}/{tierCriteria.length} criteria
              </span>
            </LiquidGlassCard>
          );
        })}
      </div>

      {/* Criteria checklist + progress */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: tokens.text }}>
            {TIER_META[tier].label} Criteria
          </span>
          <div style={{ minWidth: 180 }}>
            <MetricCard
              label="Criteria Met"
              value={`${metCount}/${total}`}
              rag={criteriaRag(metCount, total)}
            />
          </div>
        </div>

        <LiquidGlassCard interactive={false} padding={16} radius={12}>
          <div style={checklistStyle}>
            {currentCriteria.map((criterion) => {
              const key = `${tier}:${criterion}`;
              const isChecked = !!checked[key];

              const rowStyle: CSSProperties = {
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
              };

              const checkboxStyle: CSSProperties = {
                width: 18,
                height: 18,
                borderRadius: 4,
                border: isChecked
                  ? `2px solid ${tokens.accent}`
                  : "2px solid rgba(255,255,255,0.25)",
                background: isChecked ? `${tokens.accent}26` : "rgba(255,255,255,0.04)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                outline: "none",
                transition: "background 150ms ease, border-color 150ms ease",
                marginTop: 1,
              };

              const checkmarkStyle: CSSProperties = {
                width: 10,
                height: 10,
                color: tokens.accent,
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
              };

              return (
                <div key={key} style={rowStyle} onClick={() => toggleCriterion(key)}>
                  <button
                    style={checkboxStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCriterion(key);
                    }}
                    aria-checked={isChecked}
                    role="checkbox"
                    aria-label={criterion}
                  >
                    {isChecked && <span style={checkmarkStyle}>✓</span>}
                  </button>
                  <span
                    style={{
                      fontSize: 13,
                      color: isChecked ? tokens.text : tokens.muted,
                      lineHeight: 1.5,
                      transition: "color 150ms ease",
                    }}
                  >
                    {criterion}
                  </span>
                </div>
              );
            })}
          </div>
        </LiquidGlassCard>
      </div>

      {/* Evidence narrative */}
      <LiquidGlassCard interactive={false} padding={16} radius={12}>
        <label>
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tokens.muted,
              marginBottom: 8,
            }}
          >
            Evidence Narrative
          </span>
          <textarea
            rows={8}
            style={textareaStyle}
            value={narrative}
            onChange={(e) => handleNarrativeChange(e.target.value)}
            placeholder="Describe the evidence supporting this tier classification..."
          />
        </label>
      </LiquidGlassCard>
    </motion.div>
  );
}
