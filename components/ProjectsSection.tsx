"use client";

import { useState, type ReactNode } from "react";
import { ProposalJudgeMap } from "./architecture/ProposalJudgeMap";
import { PropfirmbotMap } from "./architecture/PropfirmbotMap";
import { HealthcareDashboardMap } from "./architecture/HealthcareDashboardMap";

type ProjectCategory =
  | "LLM Evaluation & Oversight"
  | "RAG / LLM Systems"
  | "Machine Learning & Algorithms"
  | "Geospatial Analytics"
  | "Responsible AI & Governance"
  | "Capital Markets & Quant";

const CATEGORY_ORDER: ProjectCategory[] = [
  "LLM Evaluation & Oversight",
  "RAG / LLM Systems",
  "Machine Learning & Algorithms",
  "Geospatial Analytics",
  "Responsible AI & Governance",
  "Capital Markets & Quant",
];

interface Project {
  id: string;
  category: ProjectCategory;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  summary: string;
  tech: string[];
  dataAndAI: string[];
  standards?: string[];
  useCases: string[];
  status: "live" | "pilot" | "open-source";
  architecture?: ReactNode;
  actions: {
    repo?: string;
    tryItOut?: { kind: "demo" | "live"; href: string };
  };
}

const PROJECTS: Project[] = [
  {
    id: "ai-proposal-intelligence",
    category: "LLM Evaluation & Oversight",
    badge: "LLM Eval · Oversight",
    badgeColor: "#f59e0b",
    title: "AI Proposal Intelligence",
    subtitle: "Production LLM Evaluation Harness · Scalable-Oversight Pattern",
    summary: `LLM-as-judge evaluation harness with paired auditors and a weighted composite scorecard — gates AI outputs before release.`,
    tech: ["Python", "FastAPI", "pydantic", "pytest", "CI/CD"],
    dataAndAI: ["Frontier LLM", "LLM evaluation", "LLM-as-judge", "paired auditors", "scalable oversight"],
    useCases: [
      "Government / FSI proposal QA",
      "AI eval pipelines",
      "Scalable-oversight tooling",
    ],
    status: "open-source",
    architecture: <ProposalJudgeMap />,
    actions: {
      repo: "https://github.com/JdeGraftJohnson/proposal-ops-judges",
      tryItOut: { kind: "demo", href: "/projects/proposal-intelligence" },
    },
  },
  {
    id: "healthcare-dashboard-ops",
    category: "LLM Evaluation & Oversight",
    badge: "AI Eval Harness",
    badgeColor: "#22d3ee",
    title: "Healthcare Dashboard Ops",
    subtitle: "LLM-as-Judge platform · Power BI · GIS · Forecast models",
    summary: `One spec produces a Power BI dashboard, GIS choropleth, and 12-month forecast — gated by 16 deterministic + LLM evaluators on 31M CMS Medicaid rows.`,
    tech: ["Python", "Leaflet", "Azure Container Apps"],
    dataAndAI: ["DuckDB", "dbt", "Power BI", "Frontier LLM", "LLM evaluation", "SARIMA", "Prophet"],
    standards: ["CMS Medicaid (T-MSIS)"],
    useCases: [
      "Healthcare AI platforms",
      "BI release gating",
      "Medicaid / payer analytics",
    ],
    status: "open-source",
    architecture: <HealthcareDashboardMap />,
    actions: {
      repo: "https://github.com/JdeGraftJohnson/healthcare-cost-ops",
      tryItOut: { kind: "demo", href: "/projects/healthcare-dashboard" },
    },
  },
  // intentional anchor: home tile now lands on /projects/healthcare-dashboard (intro page)
  // which itself routes to /dashboard, /map, or GitHub
  {
    id: "clinical-rag",
    category: "RAG / LLM Systems",
    badge: "Clinical RAG",
    badgeColor: "#22d3ee",
    title: "Clinical Decision Support RAG Assistant",
    subtitle: "Evidence-grounded answers · DOI-cited",
    summary: `DOI-anchored RAG over peer-reviewed biomedical evidence with knowledge-graph entity resolution and low-evidence fallback.`,
    tech: ["Python", "TypeScript", "Next.js", "FastAPI"],
    dataAndAI: ["RAG", "LangChain", "pgvector", "Neo4j (knowledge graph)"],
    standards: ["DOI citations", "peer-reviewed sources"],
    useCases: [
      "Biomedical evidence assembly",
      "Member triage",
      "Drug-target dossiers",
      "Rare-disease cohorts",
    ],
    status: "live",
    actions: {
      tryItOut: { kind: "live", href: "/rag" },
    },
  },
  {
    id: "patient-disengagement",
    category: "Machine Learning & Algorithms",
    badge: "Clinical AI",
    badgeColor: "#60a5fa",
    title: "Patient Disengagement Prediction",
    subtitle: "NHS Primary Care · AI Decision Support",
    summary: `XGBoost early-warning model (AUC 0.94) for GP disengagement, with SHAP explainability, IMD fairness audit, and UK GDPR Art. 22 compliance.`,
    tech: ["Python", "FastAPI", "Next.js"],
    dataAndAI: ["XGBoost", "SHAP", "Neo4j", "Responsible AI", "fairness audit"],
    standards: ["OMOP CDM", "SNOMED CT", "QOF", "UK GDPR Art. 22"],
    useCases: [
      "NHS GP practices",
      "ICB risk stratification",
      "Equity-audited clinical AI",
    ],
    status: "live",
    actions: {
      tryItOut: { kind: "live", href: "/projects/patient-disengagement" },
    },
  },
  {
    id: "uk-health-map",
    category: "Geospatial Analytics",
    badge: "Geospatial AI",
    badgeColor: "#34d399",
    title: "UK Health Map",
    subtitle: "NHS ICB Risk Visualisation",
    summary: `Drill-down NHS choropleth (national → ICB → practice) layered with disengagement risk, IMD, and CQC ratings on a Delta Lake silver layer.`,
    tech: ["Next.js", "TypeScript", "Leaflet", "Python"],
    dataAndAI: ["Delta Lake", "GeoJSON"],
    standards: ["NHS ICB", "IMD quintiles", "CQC ratings"],
    useCases: [
      "ICB commissioning intelligence",
      "NHS England planning",
      "Population-health overlays",
    ],
    status: "live",
    actions: {
      tryItOut: { kind: "demo", href: "/projects/uk-health-map" },
    },
  },
  {
    id: "health-equity-audit",
    category: "Responsible AI & Governance",
    badge: "Responsible AI",
    badgeColor: "#a78bfa",
    title: "AI Health Equity Audit Tool",
    subtitle: "Bias Detection · NICE ESF Tier B",
    summary: `Automated fairness pipeline producing NICE ESF Tier B / Core20PLUS5-aligned equity reports as PDF + machine-readable JSON.`,
    tech: ["Python", "FastAPI", "ReportLab"],
    dataAndAI: ["fairlearn", "Responsible AI", "equalized-odds difference"],
    standards: ["NICE ESF Tier B", "NHS Core20PLUS5", "UK GDPR Art. 22"],
    useCases: [
      "Clinical AI governance",
      "NHS equity audits",
      "Model-monitoring artifacts",
    ],
    status: "pilot",
    actions: {
      tryItOut: { kind: "live", href: "/audit" },
    },
  },
  {
    id: "propfirmbot",
    category: "Capital Markets & Quant",
    badge: "Algo Trading",
    badgeColor: "#10b981",
    title: "propfirmbot",
    subtitle: "Futures Strategy Framework · IBKR Adapter",
    summary: `MIT-licensed futures-trading framework with a DXY-confluence ORB strategy, broker-agnostic adapter boundary, and HTML backtest reports.`,
    tech: ["Python", "pandas", "ib_insync", "pytest"],
    dataAndAI: ["backtest harness", "DXY confluence gate", "ORB / VCP / liquidity-sweep"],
    standards: ["MIT OSS", "Interactive Brokers paper account"],
    useCases: [
      "Prop-firm evaluation runs",
      "Micro-gold ORB trading",
      "Broker-portable strategy research",
    ],
    status: "open-source",
    architecture: <PropfirmbotMap />,
    actions: {
      repo: "https://github.com/JdeGraftJohnson/propfirmbot",
      tryItOut: { kind: "demo", href: "/projects/propfirmbot" },
    },
  },
  {
    id: "stockhub",
    category: "Capital Markets & Quant",
    badge: "Capital Markets",
    badgeColor: "#f472b6",
    title: "StockHub",
    subtitle: "Equity Research · Macro Signals",
    summary: `Live equity-research workspace with macro overlays, cached fundamentals, and portfolio risk analytics on a real-time market-data pipeline.`,
    tech: ["Next.js", "TypeScript", "Python", "FastAPI", "WebSockets"],
    dataAndAI: ["real-time market data", "technical indicators", "portfolio analytics"],
    useCases: [
      "Retail equity research",
      "Macro-overlay screening",
      "Portfolio risk monitoring",
    ],
    status: "live",
    actions: {
      tryItOut: { kind: "live", href: "https://stockhub.work" },
    },
  },
];

const STATUS_STYLES: Record<Project["status"], { label: string; color: string }> = {
  "live":        { label: "Live",        color: "#34d399" },
  "pilot":       { label: "Pilot",       color: "#60a5fa" },
  "open-source": { label: "Open Source", color: "#f59e0b" },
};

function isExternal(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function ActionButton({
  href,
  label,
  accent,
  disabled,
  title,
  onClick,
}: {
  href?: string;
  label: string;
  accent: string;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
}) {
  const baseStyle = {
    color: disabled ? "rgba(255,255,255,0.30)" : accent,
    background: disabled ? "rgba(255,255,255,0.03)" : `${accent}15`,
    border: `1px solid ${disabled ? "rgba(255,255,255,0.10)" : `${accent}55`}`,
  };
  const cls =
    "text-xs md:text-sm font-semibold px-3 py-1.5 rounded text-center transition flex-1 min-w-0";
  if (disabled || (!href && !onClick)) {
    return (
      <span className={cls} style={{ ...baseStyle, cursor: "not-allowed" }} title={title}>
        {label}
      </span>
    );
  }
  if (onClick) {
    return (
      <button onClick={onClick} className={cls} style={baseStyle} title={title}>
        {label}
      </button>
    );
  }
  const external = isExternal(href!);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cls + " hover:brightness-125"}
      style={baseStyle}
      title={title}
    >
      {label}
    </a>
  );
}

export function ProjectsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = CATEGORY_ORDER
    .map((cat) => ({ category: cat, projects: PROJECTS.filter((p) => p.category === cat) }))
    .filter((g) => g.projects.length > 0);

  return (
    <section
      id="projects"
      className="py-20 md:py-24 px-4 md:px-8 lg:px-16 text-white"
      style={{ background: "linear-gradient(to bottom right, #312e81, #6b46c1)" }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-bold text-3xl md:text-4xl mb-3 leading-tight">
          Selected Projects <span className="text-yellow-300">★</span>
        </h2>
        <p className="text-white/70 text-center text-base md:text-lg max-w-2xl mx-auto mb-12">
          Each project is shipped end-to-end — data pipeline, model, governance, deployed UI.
          Cards with an architecture map can be expanded inline.
        </p>

        {grouped.map(({ category, projects }) => (
          <div key={category} className="mb-12 last:mb-0">
            <h3
              className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-5 pb-2"
              style={{
                color: "rgba(255,255,255,0.7)",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {category}
              <span className="ml-2 text-white/40 font-normal normal-case tracking-normal">
                ({projects.length})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
            const statusStyle = STATUS_STYLES[p.status];
            const isExpanded = expandedId === p.id;
            const hasMap = !!p.architecture;
            return (
              <div
                key={p.id}
                id={p.id}
                className={`relative flex flex-col p-6 rounded-2xl backdrop-blur-md transition transform hover:-translate-y-1 scroll-mt-24 ${
                  isExpanded ? "md:col-span-2 lg:col-span-3" : ""
                }`}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className="text-xs font-semibold tracking-wider uppercase px-2 py-1 rounded-full shrink-0"
                    style={{
                      color: p.badgeColor,
                      background: `${p.badgeColor}25`,
                      border: `1px solid ${p.badgeColor}55`,
                    }}
                  >
                    {p.badge}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                    style={{
                      color: statusStyle.color,
                      background: `${statusStyle.color}20`,
                      border: `1px solid ${statusStyle.color}40`,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <p className="text-white/55 text-xs mb-3">{p.subtitle}</p>

                <dl className="text-sm leading-relaxed mb-4 flex-grow space-y-2">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">
                      Summary
                    </dt>
                    <dd className="text-white/85">{p.summary}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">
                      Tech
                    </dt>
                    <dd className="text-white/70">{p.tech.join(" · ")}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">
                      Data &amp; AI
                    </dt>
                    <dd className="text-white/70">{p.dataAndAI.join(" · ")}</dd>
                  </div>
                  {p.standards && p.standards.length > 0 && (
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">
                        Standards
                      </dt>
                      <dd className="text-white/70">{p.standards.join(" · ")}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">
                      Use Cases
                    </dt>
                    <dd className="text-white/70">{p.useCases.join(" · ")}</dd>
                  </div>
                </dl>

                <div className="flex flex-row items-stretch gap-2 mt-auto">
                  <ActionButton
                    href={p.actions.repo}
                    label="GitHub →"
                    accent={p.badgeColor}
                    disabled={!p.actions.repo}
                    title={p.actions.repo ? "Open repo" : "Repo private"}
                  />
                  <ActionButton
                    label={isExpanded ? "Hide map ↑" : "Architecture"}
                    accent={p.badgeColor}
                    disabled={!hasMap}
                    title={hasMap ? "Toggle architecture map" : "Architecture map coming soon"}
                    onClick={hasMap ? () => setExpandedId(isExpanded ? null : p.id) : undefined}
                  />
                  <ActionButton
                    href={p.actions.tryItOut?.href}
                    label={p.actions.tryItOut?.kind === "demo" ? "Try It Out →" : "Try It Out →"}
                    accent={p.badgeColor}
                    disabled={!p.actions.tryItOut}
                    title={p.actions.tryItOut ? "Open live demo" : "Demo not yet published"}
                  />
                </div>

                {hasMap && isExpanded && (
                  <div
                    className="mt-6 pt-6"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <p
                      className="text-xs uppercase tracking-wider mb-4"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      Architecture · pipeline overview
                    </p>
                    {p.architecture}
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
