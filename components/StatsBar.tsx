"use client";

interface Chip {
  label: string;
  href: string;
}

interface ChipGroup {
  title: string;
  chips: Chip[];
}

const GROUPS: ChipGroup[] = [
  {
    title: "Languages & Frameworks",
    chips: [
      { label: "Python", href: "#ai-proposal-intelligence" },
      { label: "TypeScript", href: "#stockhub" },
      { label: "SQL", href: "#healthcare-dashboard-ops" },
      { label: "FastAPI", href: "#ai-proposal-intelligence" },
      { label: "Next.js", href: "#clinical-rag" },
    ],
  },
  {
    title: "AI & ML",
    chips: [
      { label: "RAG", href: "#clinical-rag" },
      { label: "LLM-as-judge", href: "#ai-proposal-intelligence" },
      { label: "Agentic AI", href: "#ai-proposal-intelligence" },
      { label: "Anthropic Claude", href: "#ai-proposal-intelligence" },
      { label: "LangChain", href: "#clinical-rag" },
      { label: "Embeddings", href: "#clinical-rag" },
      { label: "pgvector", href: "#clinical-rag" },
      { label: "Knowledge Graphs", href: "#clinical-rag" },
      { label: "Neo4j", href: "#patient-disengagement" },
      { label: "XGBoost", href: "#patient-disengagement" },
      { label: "SHAP", href: "#patient-disengagement" },
      { label: "scikit-learn", href: "#health-equity-audit" },
      { label: "Prompt Engineering", href: "#ai-proposal-intelligence" },
      { label: "Responsible AI", href: "#health-equity-audit" },
    ],
  },
  {
    title: "Data, Cloud & Ops",
    chips: [
      { label: "Azure", href: "#healthcare-dashboard-ops" },
      { label: "Azure Container Apps", href: "#healthcare-dashboard-ops" },
      { label: "Cosmos DB", href: "#stockhub" },
      { label: "AWS", href: "#stockhub" },
      { label: "AWS Lambda", href: "#stockhub" },
      { label: "AWS S3", href: "#stockhub" },
      { label: "AWS DynamoDB", href: "#stockhub" },
      { label: "CloudFront", href: "#stockhub" },
      { label: "API Gateway", href: "#stockhub" },
      { label: "EventBridge", href: "#stockhub" },
      { label: "dbt", href: "#healthcare-dashboard-ops" },
      { label: "DuckDB", href: "#healthcare-dashboard-ops" },
      { label: "Delta Lake", href: "#uk-health-map" },
      { label: "PostgreSQL", href: "#clinical-rag" },
      { label: "Docker", href: "#healthcare-dashboard-ops" },
      { label: "CI/CD", href: "#ai-proposal-intelligence" },
      { label: "LLMOps", href: "#ai-proposal-intelligence" },
      { label: "MLOps", href: "#healthcare-dashboard-ops" },
      { label: "Evals", href: "#ai-proposal-intelligence" },
      { label: "Time series", href: "#healthcare-dashboard-ops" },
    ],
  },
  {
    title: "Healthcare & Compliance",
    chips: [
      { label: "HIPAA", href: "#healthcare-dashboard-ops" },
      { label: "FHIR", href: "#clinical-rag" },
      { label: "SNOMED CT", href: "#patient-disengagement" },
      { label: "OMOP CDM", href: "#patient-disengagement" },
      { label: "NICE ESF Tier B", href: "#health-equity-audit" },
      { label: "NHS Core20PLUS5", href: "#health-equity-audit" },
      { label: "UK GDPR Art. 22", href: "#patient-disengagement" },
    ],
  },
];

export function StatsBar() {
  return (
    <section
      className="py-16 md:py-20"
      style={{ background: "linear-gradient(to right, #eef2ff, #faf5ff)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">
          Skills &amp; Technology
        </h2>
        <div className="space-y-4 text-left">
          {GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
              <p
                className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 md:w-56 md:shrink-0"
              >
                {g.title}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.chips.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-gray-800 border border-gray-200 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-sm transition"
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                  >
                    {c.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
