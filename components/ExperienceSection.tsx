"use client";

interface Role {
  title: string;
  org: string;
  location: string;
  period: string;
  highlights: string[];
  tags: string[];
}

const ROLES: Role[] = [
  {
    title: "AI Engineering Lead",
    org: "Swain Solutions LLC",
    location: "Washington, D.C.",
    period: "Oct 2025 – Present",
    highlights: [
      "Shipped production agentic LLM systems end-to-end for regulated customers — a 32-tool MCP server for AI proposal intelligence, a Clinical Decision RAG grounded in NICE / SNOMED / FHIR R4, and a LangSmith-instrumented chat inspector with 7 evaluators — embedding with stakeholders to translate ambiguous requirements into shipped, customer-facing surfaces.",
      "Owned a 9-service Azure-native LLM platform plus a 37-Lambda AWS counterpart: TypeScript / Next.js front-ends on Vercel, FastAPI handlers, Cosmos DB / ADLS medallion data (dbt-duckdb bronze → silver → gold), sub-1ms CUDA GPU inference (BART/BERT); federated learning across 217 tickers with a live options calibration model over 19K+ rows.",
      "Fine-tuned open-weights models (Gemma family) with LoRA and preference-optimization workflows; built deterministic judges, paired LLM auditors, and weighted composite scorecards covering fairness, factuality, and compliance — instrumented with inspect_petri red-teaming, Fairlearn audits, and LangSmith observability so customers see evidence, not assertions.",
      "Embedded a 13-point Responsible-AI framework (HIPAA per NIST SP 800-66r2, CMMC, MHRA GMLP) into CI gates, IaC, and Solana-anchored audit trails; every customer deployment ships with a reproducible evidence pack rather than a checklist. Mentored engineers on cross-domain ownership (data + ML + infra + frontend) and customer-facing delivery standards.",
    ],
    tags: ["Python", "TypeScript", "Next.js", "LangChain / LangGraph / LangSmith", "MCP", "RAG", "LoRA / SFT", "vLLM", "Azure", "AWS"],
  },
  {
    title: "Product Analytics Manager",
    org: "W.R. Grace",
    location: "Columbia, MD",
    period: "Apr 2024 – Oct 2025",
    highlights: [
      "Spearheaded enterprise commercial and volume forecasting systems powering $700MM+ revenue planning, capital allocation, and scenario-based performance modeling; embedded with Finance, Operations, and executive stakeholders to translate ambiguous business questions into decision-ready forecasts.",
      "Shipped a forecast-accuracy measurement and reconciliation framework — instrumented as a production evaluation harness across business units — reducing forecast-to-actual variance by 18%.",
      "Set analytics platform strategy and cloud data architecture (AWS / Azure) for enterprise-scale modeling and demand planning; advanced ML and predictive-modeling frameworks for product performance, adoption velocity, and market risk; owned data integrity and enterprise analytics standards.",
    ],
    tags: ["Forecasting", "Scenario Modeling", "ML / Predictive", "AWS / Azure", "Governance"],
  },
  {
    title: "Senior Business Management Analyst (Senior Data Analyst function)",
    org: "W.R. Grace",
    location: "Columbia, MD",
    period: "Aug 2022 – Apr 2024",
    highlights: [
      "Directed enterprise revenue-intelligence program across SAP and Salesforce ecosystems using SQL-driven analytics, delivering visibility into $600MM+ monthly performance and growth signals to executive stakeholders.",
      "Deployed statistical forecasting and performance models to production, reducing planning cycle time by 25% and stabilizing revenue predictability; engineered centralized pipelines integrating SAP, Salesforce, and operational datasets.",
      "Shipped executive-facing KPI visualization frameworks (Tableau, Power BI); applied segmentation and cohort modeling to surface evidence-based signals for go-to-market prioritization.",
    ],
    tags: ["SAP / Salesforce", "SQL", "Statistical Forecasting", "Tableau / Power BI", "Segmentation"],
  },
  {
    title: "Manufacturing Leadership Program — Data & Process Engineering Rotations",
    org: "W.R. Grace",
    location: "Baltimore, MD",
    period: "Jul 2019 – Aug 2022",
    highlights: [
      "Led data integrity, governance, and compliance programs across regulated reporting environments; established standards and audit frameworks later scaled at the enterprise level.",
      "Designed Power BI dashboards with automated anomaly detection and process-deviation monitoring across multi-site operations; evidence-based interventions reduced system downtime by 28% and sustained 99% product quality.",
      "Formulated capacity-planning algorithms and volume-forecasting models in SQL and Python that reduced bottlenecks by 20% and stabilized production planning; refined predictive-modeling frameworks through algorithm tuning and feature engineering.",
      "Raised data accuracy by 14% through systematic predictive modeling, outlier remediation, and root-cause analysis; maintained scalable data models supporting performance monitoring and early volume forecasting.",
    ],
    tags: ["Power BI", "Anomaly Detection", "Predictive Modeling", "Governance", "SQL / Python"],
  },
];

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="pt-10 md:pt-12 pb-20 md:pb-24 px-4 md:px-8 lg:px-16 text-white"
      style={{ background: "#05050f" }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center font-bold text-3xl md:text-4xl mb-3 leading-tight">
          Experience <span style={{ color: "#60a5fa" }}>—</span>
        </h2>
        <p
          className="text-center text-base md:text-lg max-w-2xl mx-auto mb-14"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Eight years across data engineering, applied ML, and AI platform delivery — recently
          focused on evaluation frameworks, fine-tuning, and responsible-AI tooling.
        </p>

        <ol className="relative">
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-3 md:left-4 w-px"
            style={{ background: "rgba(255,255,255,0.12)" }}
          />

          {ROLES.map((role, idx) => (
            <li key={`${role.title}-${role.period}`} className="relative pl-12 md:pl-16 pb-12 last:pb-0">
              <span
                aria-hidden
                className="absolute left-0 top-1 flex items-center justify-center text-xs font-semibold"
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "9999px",
                  background: "rgba(96,165,250,0.12)",
                  border: "1px solid rgba(96,165,250,0.45)",
                  color: "#60a5fa",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                <h3 className="font-semibold text-lg md:text-xl">
                  {role.title}{" "}
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>·</span>{" "}
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>{role.org}</span>
                </h3>
                <span
                  className="text-xs md:text-sm uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.50)" }}
                >
                  {role.period}
                </span>
              </div>
              <p
                className="text-xs uppercase tracking-wider mb-4"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {role.location}
              </p>

              <ul className="space-y-2 mb-4">
                {role.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="text-sm md:text-[15px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.78)" }}
                  >
                    <span aria-hidden style={{ color: "#60a5fa" }}>›</span>{" "}
                    {h}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.70)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
