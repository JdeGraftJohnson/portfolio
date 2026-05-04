"use client";

import { LiquidGlassCard } from "./LiquidGlassCard";

interface Project {
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  body: string;
  stack: string[];
  links: { label: string; href: string }[];
  status: "live" | "pilot" | "open-source";
}

const PROJECTS: Project[] = [
  {
    badge: "Document AI",
    badgeColor: "#f59e0b",
    title: "AI Proposal Intelligence",
    subtitle: "Proposal Writer · Agentic Document Pipeline",
    body: `End-to-end pipeline that auto-generates professional AI diagrams and embeds them inline into .docx proposal documents. Sentinel blocks in the source document are resolved via the Napkin AI API — parsed, generated, and reinserted at the XML level with zero dependency on python-docx. Includes a 32-tool FastMCP server for LLM-agent-driven .pptx generation, full UK/US AI governance compliance (NIST AI RMF 1.0, UK AI White Paper 2023, UK GDPR), PII detection, prompt injection blocking, and an append-only audit log.`,
    stack: ["Python", "FastMCP", "Napkin AI API", "docx XML", "NIST AI RMF", "UK GDPR"],
    links: [
      { label: "GitHub →", href: "https://github.com/JdeGraftJohnson/ai-proposal-intelligence" },
    ],
    status: "open-source",
  },
  {
    badge: "Clinical AI",
    badgeColor: "#60a5fa",
    title: "Patient Disengagement Prediction",
    subtitle: "NHS Primary Care · AI Decision Support",
    body: `Early-warning system for GP practices that identifies patients most at risk of stopping care — before their health deteriorates. XGBoost model (AUC 0.94) trained on 10,000 synthetic CPRD Gold patients, with SHAP explainability, IMD fairness audit (equalized-odds difference), and a Neo4j graph query layer for cohort traversal. Built on OMOP CDM, SNOMED CT, and QOF condition codes. UK GDPR Article 22 compliant. Live with a Next.js + FastAPI chat interface backed by Gemma 4.`,
    stack: ["XGBoost", "SHAP", "Neo4j", "FastAPI", "Next.js", "OMOP CDM", "SNOMED CT", "Azure"],
    links: [],
    status: "pilot",
  },
  {
    badge: "Geospatial AI",
    badgeColor: "#34d399",
    title: "UK Health Map",
    subtitle: "NHS ICB Risk Visualisation",
    body: `Interactive choropleth map of NHS Integrated Care Board regions, layered with disengagement risk scores, IMD quintile distributions, and CQC practice ratings. Drill-down from national → regional → ICB → practice level. Built with Next.js, Leaflet, and Delta Lake silver-layer data. Designed as a commissioning intelligence tool for ICB analysts and NHS England planners.`,
    stack: ["Next.js", "Leaflet", "Delta Lake", "Azure Static Web Apps", "Python"],
    links: [],
    status: "pilot",
  },
  {
    badge: "Responsible AI",
    badgeColor: "#a78bfa",
    title: "AI Health Equity Audit Tool",
    subtitle: "Bias Detection · NICE ESF Tier B",
    body: `Automated fairness audit pipeline for clinical AI models. Takes model predictions and patient demographics and produces a structured equity report: equalized-odds difference by IMD quintile, ethnicity, age band, and rurality. References NICE ESF Tier B monitoring requirements, NHS Core20PLUS5 health inequalities framework, and UK GDPR Article 22. Output is a human-readable PDF audit report plus a machine-readable JSON record for governance tracking.`,
    stack: ["Python", "NICE ESF", "NHS Core20PLUS5", "Fairlearn", "UK GDPR Art.22"],
    links: [],
    status: "pilot",
  },
];

const STATUS_STYLES: Record<Project["status"], { label: string; color: string }> = {
  "live":        { label: "Live",        color: "#34d399" },
  "pilot":       { label: "Pilot",       color: "#60a5fa" },
  "open-source": { label: "Open Source", color: "#f59e0b" },
};

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="py-24 px-6"
      style={{ background: "linear-gradient(180deg, #05050f 0%, #0a0a1f 50%, #050510 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-medium tracking-widest uppercase text-blue-400 text-center mb-3">
          Portfolio
        </p>
        <h2 className="text-white text-center font-semibold text-2xl mb-4">
          Production AI systems
        </h2>
        <p className="text-white/55 text-center text-base leading-relaxed max-w-2xl mx-auto mb-16">
          Each project is built end-to-end — from data pipeline to deployed interface — using
          real-world standards and governance frameworks, not toy demos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((p) => {
            const statusStyle = STATUS_STYLES[p.status];
            return (
              <LiquidGlassCard key={p.title} interactive={false} radius={16} padding={28}>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className="text-xs font-semibold tracking-wider uppercase px-2 py-1 rounded-full shrink-0"
                    style={{
                      color: p.badgeColor,
                      background: `${p.badgeColor}18`,
                      border: `1px solid ${p.badgeColor}30`,
                    }}
                  >
                    {p.badge}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                    style={{
                      color: statusStyle.color,
                      background: `${statusStyle.color}15`,
                      border: `1px solid ${statusStyle.color}25`,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-base mb-1">{p.title}</h3>
                <p className="text-white/40 text-xs mb-3">{p.subtitle}</p>

                {/* Body */}
                <p className="text-white/60 text-sm leading-relaxed mb-5">{p.body}</p>

                {/* Stack tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.stack.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                {p.links.length > 0 && (
                  <div className="flex gap-3">
                    {p.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium transition-colors"
                        style={{ color: p.badgeColor }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </LiquidGlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
