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
    period: "2025 – 2026",
    highlights: [
      "Built LLM evaluation harnesses end-to-end in Python — deterministic judges, paired LLM auditors, weighted composite scorecards — covering fairness, factuality, and compliance dimensions across regulated proposal and clinical pipelines.",
      "Fine-tuned open-weights models (Gemma family) with LoRA and preference-optimization workflows; instrumented training with red-teaming harnesses (inspect_petri), Fairlearn fairness audits, and LangSmith observability.",
      "Owned the medallion data architecture (dbt-duckdb, bronze → silver → gold) and GPU inference path (CUDA, sub-1ms latency) for a nine-service Azure-native AI platform, including federated learning across 217 tickers and a live calibration model over 19K+ rows.",
      "Embedded a thirteen-point responsible-AI framework (HIPAA, NIST, CMMC, MHRA GMLP) into CI gates; every deployment ships with an evidence pack rather than a checklist.",
    ],
    tags: ["Python", "LLM eval", "LoRA / SFT", "Red-teaming", "dbt", "Azure"],
  },
  {
    title: "Product Analytics Manager",
    org: "W.R. Grace",
    location: "Columbia, MD",
    period: "2024 – 2025",
    highlights: [
      "Designed evaluation and drift-detection frameworks for enterprise forecasting models; reduced forecast-to-actual variance by 18% through systematic empirical iteration rather than ad-hoc tuning.",
      "Owned the medallion data architecture (bronze / silver / gold) and feature engineering layer; coached analysts on model evaluation, feature selection, and production deployment standards.",
      "Translated ambiguous business questions into reproducible Python experiments and decision-ready artefacts for Finance, Operations, and the executive team.",
    ],
    tags: ["Python", "Model eval", "Drift detection", "dbt", "Forecasting"],
  },
  {
    title: "Senior Data Analyst",
    org: "W.R. Grace",
    location: "New Orleans, LA",
    period: "2022 – 2024",
    highlights: [
      "Directed an enterprise revenue-intelligence program covering $600MM+ in monthly performance; built statistical forecasting models that reduced planning cycle time by 25%.",
      "Engineered production data pipelines (Python, SQL, dbt, Airflow) with data-quality gates, partitioning strategy, and CI/CD for analytics infrastructure.",
      "Applied experimentation frameworks for customer segmentation and cohort analysis; used model-driven evidence to influence go-to-market prioritization.",
    ],
    tags: ["Python", "SQL", "Airflow", "Forecasting", "Experimentation"],
  },
  {
    title: "Data Engineer",
    org: "W.R. Grace",
    location: "Baltimore, MD",
    period: "2019 – 2022",
    highlights: [
      "Established the data-integrity, governance, and compliance programs later scaled across the enterprise; built audit frameworks for regulated reporting environments.",
      "Designed Power BI dashboards with automated anomaly detection; data-driven interventions cut system downtime by 28% and lifted SLA compliance.",
      "Raised data accuracy by 14% through predictive modelling, outlier remediation, and systematic root-cause analysis.",
    ],
    tags: ["Python", "Anomaly detection", "Governance", "SQL", "Power BI"],
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
