"use client";

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
    badge: "Clinical RAG",
    badgeColor: "#22d3ee",
    title: "Clinical Decision Support RAG Assistant",
    subtitle: "Evidence-grounded answers · DOI-cited",
    body: `Retrieval-augmented assistant that grounds clinical answers in peer-reviewed evidence. Each response cites DOI-anchored sources, traverses a biomedical knowledge graph for entity resolution, and falls back gracefully when evidence is thin. Designed for the workflows of teams like Causaly, Maven Clinic, Onsera Health, Heim Health, Gilead Sciences, and Genomics England — biomedical evidence assembly, member triage, drug-target dossiers, and rare-disease cohort traversal.`,
    stack: ["RAG", "Knowledge Graph", "DOI citations", "Next.js", "FastAPI", "Gemini", "Vector DB"],
    links: [
      { label: "Open Assistant →", href: "/rag" },
    ],
    status: "live",
  },
  {
    badge: "Clinical AI",
    badgeColor: "#60a5fa",
    title: "Patient Disengagement Prediction",
    subtitle: "NHS Primary Care · AI Decision Support",
    body: `Early-warning system for GP practices that identifies patients most at risk of stopping care — before their health deteriorates. XGBoost model (AUC 0.94) trained on 10,000 synthetic CPRD Gold patients, with SHAP explainability, IMD fairness audit (equalized-odds difference), and a Neo4j graph query layer for cohort traversal. Built on OMOP CDM, SNOMED CT, and QOF condition codes. UK GDPR Article 22 compliant. Pilot deployment with a Next.js + FastAPI chat interface backed by Gemma 4.`,
    stack: ["XGBoost", "SHAP", "Neo4j", "FastAPI", "Next.js", "OMOP CDM", "SNOMED CT", "Azure"],
    links: [
      { label: "Open Chat →", href: "https://chat.johndegraft.app" },
    ],
    status: "live",
  },
  {
    badge: "Geospatial AI",
    badgeColor: "#34d399",
    title: "UK Health Map",
    subtitle: "NHS ICB Risk Visualisation",
    body: `Interactive choropleth map of NHS Integrated Care Board regions, layered with disengagement risk scores, IMD quintile distributions, and CQC practice ratings. Drill-down from national → regional → ICB → practice level. Built with Next.js, Leaflet, and Delta Lake silver-layer data. Designed as a commissioning intelligence tool for ICB analysts and NHS England planners.`,
    stack: ["Next.js", "Leaflet", "Delta Lake", "Azure Static Web Apps", "Python"],
    links: [
      { label: "Open Map →", href: "https://blue-smoke-00f20d403.7.azurestaticapps.net/map" },
    ],
    status: "live",
  },
  {
    badge: "Responsible AI",
    badgeColor: "#a78bfa",
    title: "AI Health Equity Audit Tool",
    subtitle: "Bias Detection · NICE ESF Tier B",
    body: `Automated fairness audit pipeline for clinical AI models. Takes model predictions and patient demographics and produces a structured equity report: equalized-odds difference by IMD quintile, ethnicity, age band, and rurality. References NICE ESF Tier B monitoring requirements, NHS Core20PLUS5 health inequalities framework, and UK GDPR Article 22. Output is a human-readable PDF audit report plus a machine-readable JSON record for governance tracking.`,
    stack: ["Python", "NICE ESF", "NHS Core20PLUS5", "Fairlearn", "LangSmith", "inspect_petri", "FastAPI"],
    links: [
      { label: "Open Audit →", href: "/audit" },
    ],
    status: "pilot",
  },
  {
    badge: "Algo Trading",
    badgeColor: "#10b981",
    title: "propfirmbot",
    subtitle: "Futures Strategy Framework · IBKR Adapter",
    body: `Open-source futures-trading framework built around a DXY-confluence opening-range-breakout strategy on micro gold futures. Strategy, risk engine, indicators, and a streaming-rate confluence gate sit above an abstract BrokerClient boundary so adapters can target any license-clean venue. Ships with a reference Interactive Brokers adapter via ib_insync (paper-account capable), a multi-strategy registry covering ORB / liquidity-sweep / VCP / regime-aligned variants, and a backtest harness with HTML report output. MIT licensed.`,
    stack: ["Python", "ib_insync", "Interactive Brokers", "pandas", "pytest", "Pine Script"],
    links: [
      { label: "GitHub →", href: "https://github.com/JdeGraftJohnson/propfirmbot" },
    ],
    status: "open-source",
  },
  {
    badge: "Capital Markets",
    badgeColor: "#f472b6",
    title: "StockHub",
    subtitle: "Equity Research · Macro Signals",
    body: `Live equity-research workspace with macro signal overlays, fundamentals screening, and portfolio risk analytics. Built on a real-time market-data pipeline with cached fundamentals, technical-indicator computation, and a clean charting surface. Designed for retail investors who want institutional-grade tooling without the Bloomberg price tag.`,
    stack: ["Next.js", "FastAPI", "PostgreSQL", "Redis", "Cloudflare", "Plotly"],
    links: [
      { label: "Open StockHub →", href: "https://stockhub.work" },
    ],
    status: "live",
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

export function ProjectsSection() {
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
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((p) => {
            const statusStyle = STATUS_STYLES[p.status];
            return (
              <div
                key={p.title}
                className="relative flex flex-col p-6 rounded-2xl backdrop-blur-md transition transform hover:-translate-y-1"
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

                <p className="text-white/75 text-sm leading-relaxed mb-4 flex-grow">{p.body}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.stack.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {p.links.length > 0 && (
                  <div className="flex gap-3 mt-auto">
                    {p.links.map((link) => {
                      const external = isExternal(link.href);
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="text-sm font-semibold inline-flex items-center hover:underline"
                          style={{ color: p.badgeColor }}
                        >
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
