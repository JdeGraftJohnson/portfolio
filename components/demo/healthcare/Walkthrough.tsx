"use client";

import { useState } from "react";
import { HealthcareDisclaimer } from "./HypotheticalDisclaimer";

type Tier = "deterministic" | "llm" | "auditor";

interface Judge {
  name: string;
  weight: number;
  tier: Tier;
  what: string;
}

interface Manifest {
  name: string;
  domain: string;
  audience: string;
  bronze: { rows_total: number; years: number[]; compressed_mb: number; per_year: { year: number; rows: number; mb_gz: number }[] };
  tom_model: { tables: number; measures: number; relationships: number; rls_roles: number };
  layout: { pages: number; visuals: number; page_names: string[] };
  templates: { id: string; label: string; measures: number }[];
  judges: { deterministic: Judge[]; llm: Judge[]; auditors: Judge[] };
  github: string;
}

const STAGES: { key: string; label: string; blurb: string }[] = [
  { key: "spec",      label: "1 · Spec",        blurb: "dashboard_spec.yml drives every downstream phase." },
  { key: "bronze",    label: "2 · Bronze",      blurb: "Pull SDUD year-partitioned CSVs to Azure Blob (gzipped)." },
  { key: "silver",    label: "3 · Silver",      blurb: "DuckDB star schema → fact_sdud, dim_state, dim_drug, dim_date." },
  { key: "forecast",  label: "4 · Forecast",    blurb: "SARIMA + Prophet ensemble, 12-month horizon, 80% band." },
  { key: "generate",  label: "5 · Generate",    blurb: "DAX measures + TOM model.bim + page-layout JSON + narrative." },
  { key: "audit",     label: "6 · Audit",       blurb: "16 evaluators in parallel · auditors re-check deterministic findings." },
  { key: "verdict",   label: "7 · Verdict",     blurb: "Severity-banded audit.md + weighted composite_scorecard.md." },
];

const ACCENT_BY_TIER: Record<Tier, { bg: string; border: string; text: string; label: string }> = {
  deterministic: { bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.40)",  text: "#a7f3d0", label: "Deterministic" },
  llm:           { bg: "rgba(168,85,247,0.10)",  border: "rgba(168,85,247,0.40)",  text: "#e9d5ff", label: "LLM judge" },
  auditor:       { bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.40)",  text: "#fde68a", label: "Paired auditor" },
};

function fmtRows(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function HealthcareWalkthrough({ manifest }: { manifest: Manifest }) {
  const [stage, setStage] = useState<number>(0);
  const [selected, setSelected] = useState<Judge | null>(null);

  const allJudges: Judge[] = [
    ...manifest.judges.deterministic,
    ...manifest.judges.llm,
    ...manifest.judges.auditors,
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#22d3ee", fontWeight: 700 }}>
          Healthcare Dashboard Ops
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "rgba(255,255,255,0.95)" }}>
          Power BI evaluation harness · scalable-oversight pattern
        </h1>
        <p className="text-base md:text-lg" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
          16 evaluators across three tiers run against a generated Power BI dataset and emit a
          severity-banded AUDIT.md plus a weighted composite verdict. The canonical run uses
          CMS Medicaid State Drug Utilization Data — {fmtRows(manifest.bronze.rows_total)} rows
          across {manifest.bronze.years.length} years.
        </p>
      </header>

      <HealthcareDisclaimer />

      {/* Stage stepper */}
      <div className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-4">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStage(i)}
              className="text-left p-2 rounded-lg transition"
              style={{
                background: i === stage ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${i === stage ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
                {s.label}
              </p>
            </button>
          ))}
        </div>
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            {STAGES[stage].blurb}
          </p>

          {stage === 1 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
              {manifest.bronze.per_year.map((y) => (
                <div key={y.year} className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>year={y.year}</p>
                  <p className="text-base font-bold font-mono" style={{ color: "rgba(255,255,255,0.92)" }}>{fmtRows(y.rows)}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{y.mb_gz} MB gz</p>
                </div>
              ))}
            </div>
          )}

          {stage === 4 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {manifest.templates.map((t) => (
                <div key={t.id} className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>template {t.id}</p>
                  <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>{t.label}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{t.measures} measures</p>
                </div>
              ))}
            </div>
          )}

          {stage === 6 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="p-3 rounded-lg" style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.40)" }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#a7f3d0" }}>Ship ≥ 0.85</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>weighted composite passes, no [MISS]</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.40)" }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#fde68a" }}>Tighten 0.70 – 0.85</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>address [WARN] before ship</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "rgba(252,165,165,0.10)", border: "1px solid rgba(252,165,165,0.40)" }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#fca5a5" }}>Re-work &lt; 0.70</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>any [MISS] auto-falls here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Headline counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Bronze rows" value={fmtRows(manifest.bronze.rows_total)} />
        <Stat label="DAX measures" value={String(manifest.tom_model.measures)} />
        <Stat label="Pages × visuals" value={`${manifest.layout.pages} × ${manifest.layout.visuals}`} />
        <Stat label="Evaluators" value="16" />
      </div>

      {/* Judge grid */}
      <h2 className="text-xl font-bold mb-4" style={{ color: "rgba(255,255,255,0.92)" }}>
        16 evaluators · click for rubric detail
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {allJudges.map((j) => {
          const accent = ACCENT_BY_TIER[j.tier];
          return (
            <button
              key={j.name}
              onClick={() => setSelected(j)}
              className="text-left p-4 rounded-lg transition"
              style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: accent.text }}>
                {accent.label} · weight {j.weight.toFixed(1)}
              </p>
              <p className="text-sm font-bold font-mono mb-1" style={{ color: "rgba(255,255,255,0.92)" }}>
                {j.name}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>
                {j.what}
              </p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full rounded-xl p-6"
            style={{ background: "#0B1020", border: `1px solid ${ACCENT_BY_TIER[selected.tier].border}` }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: ACCENT_BY_TIER[selected.tier].text }}>
              {ACCENT_BY_TIER[selected.tier].label} · weight {selected.weight.toFixed(1)}
            </p>
            <p className="text-lg font-bold font-mono mb-3" style={{ color: "rgba(255,255,255,0.95)" }}>
              {selected.name}
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.80)" }}>
              {selected.what}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="text-xs uppercase tracking-wider px-3 py-1.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 p-5 rounded-xl" style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.25)" }}>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#22d3ee", fontWeight: 700 }}>
          Reuse
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.55 }}>
          Drop in a new dashboard_spec.yml with a different domain and data sources — every judge
          except domain_relevance runs unchanged. The full harness, DAX templates, judge code,
          and the canonical Medicaid run are on GitHub.
        </p>
        <a
          href={manifest.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm font-bold"
          style={{ color: "#22d3ee" }}
        >
          github.com/JdeGraftJohnson/healthcare-cost-ops →
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color: "rgba(255,255,255,0.95)" }}>{value}</p>
    </div>
  );
}
