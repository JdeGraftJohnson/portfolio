"use client";

import Link from "next/link";

const TAGS = ["LLM-as-judge", "Scalable oversight", "Power BI", "GIS / Leaflet", "Azure Container Apps", "SARIMA + Prophet"];

const TRUST_PILLS = [
  { label: "CMS · Public data",  classes: "border-cyan-300/40 bg-cyan-300/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.18)]",        dot: "bg-cyan-300" },
  { label: "No PHI",             classes: "border-emerald-300/40 bg-emerald-300/10 text-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.18)]", dot: "bg-emerald-300" },
  { label: "Power BI Pro / FTL", classes: "border-violet-300/40 bg-violet-300/10 text-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.18)]",   dot: "bg-violet-300" },
  { label: "WCAG 2.1 AA target", classes: "border-emerald-300/40 bg-emerald-300/10 text-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.18)]", dot: "bg-emerald-300" },
  { label: "Azure Blob · DuckDB",classes: "border-cyan-300/40 bg-cyan-300/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.18)]",        dot: "bg-cyan-300" },
  { label: "Anthropic Claude",   classes: "border-amber-200/50 bg-amber-200/10 text-amber-200 shadow-[0_0_20px_rgba(254,215,170,0.20)]",      dot: "bg-amber-200" },
];

const DATASETS = [
  {
    name: "CMS Medicaid State Drug Utilization Data",
    blurb: "Federal claim-level prescription utilization, every state, every quarter, since 1991. The canonical run ingests 2020–2025 = 31M rows / $480B reimbursed.",
    chips: ["31M rows", "52 states + territories", "Refreshed quarterly", "Public domain"],
    href: "https://data.medicaid.gov/dataset/state-drug-utilization-data",
  },
  {
    name: "US Census ACS5 (American Community Survey, 5-yr)",
    blurb: "State + county population denominators for per-capita normalization — \"$/person\" makes Wyoming and California comparable.",
    chips: ["Vintage 2024", "Block-group resolution"],
    href: "https://www.census.gov/programs-surveys/acs",
  },
  {
    name: "US Census TIGER state boundaries",
    blurb: "10m-simplified TopoJSON for the GIS choropleth. ~115 KB, no tile basemap dependency.",
    chips: ["TopoJSON", "us-atlas 3.0"],
    href: "https://www.census.gov/geographies/mapping-files.html",
  },
  {
    name: "FDA Orange Book (Approved Drug Products)",
    blurb: "Brand–generic mappings, therapeutic equivalence ratings, and approval dates to drive the substitution-opportunity panels.",
    chips: ["Brand ↔ generic", "TE codes"],
    href: "https://www.fda.gov/drugs/drug-approvals-and-databases/approved-drug-products-therapeutic-equivalence-evaluations-orange-book",
  },
];

const USE_CASES = [
  {
    glyph: "▲",
    persona: "State Medicaid agencies",
    title: "Spend-driver attribution & rebate forecasting",
    body: "Where is the next $1B coming from? Per-state break-out by drug class shows that GLP-1 spend grew faster than total Rx volume in 31 states. The 12-month SARIMA + Prophet ensemble flags states whose budgets are mis-forecasting GLP-1 exposure.",
    chip: "Forecast · cohort",
  },
  {
    glyph: "●",
    persona: "Health plans (Humana, BCBS, Centene)",
    title: "Formulary benchmarking vs the public baseline",
    body: "Plan analysts overlay their internal spend mix on top of the public Medicaid baseline to quantify negotiated-rate effectiveness by drug class — and identify substitution opportunity where a plan's branded usage runs above public utilization.",
    chip: "Brand–generic substitution",
  },
  {
    glyph: "◆",
    persona: "Pharma commercial ops (Gilead, AbbVie, Novo Nordisk)",
    title: "Brand performance by state × payer mix",
    body: "BIKTARVY, OZEMPIC, HUMIRA each show distinct regional patterns. The pipeline surfaces per-state share-of-class trajectories so brand teams see uptake plateaus and competitive switching in near-real-time.",
    chip: "Share of class · YoY",
  },
  {
    glyph: "✦",
    persona: "Public health & policy researchers",
    title: "GLP-1 surge tracking, opioid stewardship",
    body: "Time-series cohorts on prescription classes (GLP-1 agonists, opioid analgesics, biologics) feed into Brookings / KFF / Commonwealth-style policy briefs — with reproducible AUDIT.md provenance for every chart.",
    chip: "Reproducible briefs",
  },
  {
    glyph: "⬢",
    persona: "AI evaluation engineers",
    title: "Reference implementation of scalable oversight",
    body: "Three-tier judge hierarchy (deterministic → LLM → paired auditor) applied to a non-trivial production artifact (a 5-page BI dashboard + GIS layer + forecast). Drop-in pattern for any team building automated quality gates around generated content.",
    chip: "Anthropic-style oversight",
  },
  {
    glyph: "⟡",
    persona: "BI engineering teams in regulated industries",
    title: "Automated quality gates for dashboard delivery",
    body: "Every PR that touches dashboard_spec.yml triggers the 16-evaluator harness in CI. Reviewers see severity-banded AUDIT.md before they merge — no more \"works on my machine\" Power BI surprises in production.",
    chip: "CI / governance",
  },
];

const STEPS = [
  { n: "01", title: "Spec submitted",   body: "dashboard_spec.yml declares domain, data sources, audience, KPIs, RLS roles, forecast methodology. Single source of truth." },
  { n: "02", title: "Bronze ingest",    body: "Year-partitioned CSVs pulled from data.medicaid.gov to Azure Blob (stasiprod1eus2/healthcare/bronze). ~600 MB compressed, refreshed quarterly." },
  { n: "03", title: "Silver model",     body: "DuckDB star schema: fact_sdud + dim_state + dim_drug + dim_date. Drug-class taxonomy applied (brand-name aware so HUMIRA → Autoimmune, OZEMPIC → GLP-1)." },
  { n: "04", title: "Forecast",         body: "12-month SARIMA + Prophet ensemble per state × class. Equal-weight blend; 6-month holdout for backtest." },
  { n: "05", title: "Generate",         body: "DAX measures + Tabular Object Model + page-layout JSON + narrative. Published to Power BI via Fabric REST." },
  { n: "06", title: "Audit",            body: "16 evaluators run in parallel: 8 deterministic Python + 5 Claude judges + 3 paired auditors re-inspecting deterministic findings." },
  { n: "07", title: "Verdict",          body: "Severity-banded AUDIT.md + weighted composite scorecard. ≥ 0.85 = Ship · 0.70–0.85 = Tighten · < 0.70 or any MISS = Re-work." },
];

const ARCH_NODES = [
  { label: "Spec",          sub: "dashboard_spec.yml" },
  { label: "Bronze",        sub: "Azure Blob CSV" },
  { label: "Silver",        sub: "DuckDB star schema" },
  { label: "Forecast",      sub: "SARIMA + Prophet" },
  { label: "Generate",      sub: "TOM + DAX + JSON" },
  { label: "Audit",         sub: "16 evaluators" },
  { label: "Verdict",       sub: "Ship / Tighten / Re-work" },
];

const SUBNOTES = [
  { label: "Eval framework", value: "8 deterministic Python · 5 Claude LLM · 3 paired auditors · severity-banded AUDIT.md" },
  { label: "Compute",        value: "Azure Container Apps Jobs (quarterly cron) · DuckDB in-process · Power BI Fabric REST" },
  { label: "Reproducibility",value: "Every artifact regenerable from one dashboard_spec.yml · domain-neutral by design" },
];

export default function HealthcareLandingPage() {
  return (
    <div className="min-h-screen bg-[#040a14] font-sans text-cyan-50 antialiased">
      {/* Ambient orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[600px] w-[600px] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-violet-300/10 blur-3xl" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#040a14]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="font-mono text-sm text-cyan-300 transition hover:text-cyan-200">
            ← johndegraft.app
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            <span className="font-mono text-xs text-emerald-200">Live · refreshed quarterly</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-16 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-lg">
              Project 05 · AI Eval Harness
            </span>
            <div className="mb-8 flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-violet-300/40 bg-violet-300/10 px-3 py-1 text-xs font-medium text-violet-300 backdrop-blur-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-6 bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-4xl font-semibold leading-tight text-transparent md:text-5xl lg:text-6xl">
              Healthcare Dashboard Ops
            </h1>
            <p className="mb-4 font-serif text-xl italic text-cyan-200/80">
              &ldquo;Scalable oversight for production BI.&rdquo;
            </p>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-cyan-100/80">
              LLM-as-judge platform that gates a Medicaid Rx delivery pipeline — embedded Power BI dashboard,
              GIS choropleth, and a 12-month forecast — behind a 16-evaluator quality harness. Pick the surface to explore.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects/healthcare-dashboard/dashboard"
                className="rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 px-6 py-3 text-sm font-semibold text-[#031018] shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(34,211,238,0.55)]"
              >
                Open the dashboard →
              </Link>
              <Link
                href="/projects/healthcare-dashboard/map"
                className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-6 py-3 text-sm font-semibold text-emerald-200 backdrop-blur-lg transition hover:-translate-y-0.5 hover:bg-emerald-300/15"
              >
                Explore the map ↗
              </Link>
              <a
                href="https://github.com/JdeGraftJohnson/healthcare-cost-ops"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-cyan-100/80 backdrop-blur-lg transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
              >
                Source on GitHub
              </a>
            </div>
          </div>

          {/* Use cases — compact list in hero right column */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Who this is for</p>
                <span className="font-mono text-[10px] text-cyan-300/60">06 personas</span>
              </div>
              <ul className="space-y-3">
                {USE_CASES.map(({ glyph, persona, title, chip }) => (
                  <li key={persona} className="group flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition hover:border-cyan-200/30 hover:bg-white/[0.05]">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-cyan-300/40 bg-cyan-300/10 text-sm text-cyan-300">
                      {glyph}
                    </span>
                    <div className="min-w-0 flex-grow">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/70 truncate">{persona}</p>
                      <p className="text-sm font-medium text-cyan-50 leading-snug">{title}</p>
                    </div>
                    <span className="hidden lg:inline-flex items-center self-center rounded-full border border-violet-300/30 bg-violet-300/10 px-2 py-0.5 font-mono text-[9px] font-medium text-violet-300 whitespace-nowrap">
                      {chip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="mr-1 font-mono text-xs uppercase tracking-wider text-cyan-300/70">Data &amp; compliance</span>
            {TRUST_PILLS.map(({ label, classes, dot }) => (
              <span key={label} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-lg ${classes}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Datasets */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 flex items-center justify-between rounded-2xl border border-cyan-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-cyan-200/10 backdrop-blur-2xl">
          <div>
            <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Datasets</p>
            <h2 className="bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
              What powers the pipeline
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-cyan-300/60 md:inline">04 sources · public</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {DATASETS.map(({ name, blurb, chips, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/[0.05]"
            >
              <p className="mb-2 font-serif text-lg font-semibold text-cyan-50 group-hover:text-cyan-200">{name} ↗</p>
              <p className="mb-4 flex-grow text-sm leading-relaxed text-cyan-100/75">{blurb}</p>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span key={c} className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-300/[0.08] px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-200">
                    {c}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Use cases — expanded body */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 flex items-center justify-between rounded-2xl border border-cyan-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-cyan-200/10 backdrop-blur-2xl">
          <div>
            <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Use cases · detail</p>
            <h2 className="bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
              How each persona uses the pipeline
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-cyan-300/60 md:inline">06 personas</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map(({ glyph, persona, title, body, chip }) => (
            <article
              key={persona}
              className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 text-xl text-cyan-300 backdrop-blur-lg">
                  {glyph}
                </span>
                <span className="inline-flex items-center rounded-full border border-cyan-200/30 bg-cyan-200/[0.08] px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-cyan-200 max-w-[60%] truncate">
                  {persona}
                </span>
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-cyan-50">{title}</h3>
              <p className="mb-5 flex-grow text-sm leading-relaxed text-cyan-100/80">{body}</p>
              <span className="inline-flex w-fit items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-violet-300">
                {chip}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Sample audit output */}
      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Sample audit</p>
          <h2 className="bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-2xl font-semibold text-transparent md:text-3xl">
            What ships with every release
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_50px_rgba(34,211,238,0.06)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
            <span className="ml-2 font-mono text-xs text-cyan-300/70">AUDIT.md · run #142 · medicaid_sdud_2026</span>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/[0.06] py-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">Composite</p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-200">0.91</p>
            </div>
            <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/[0.06] py-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">Judges passed</p>
              <p className="mt-1 font-mono text-2xl font-bold text-cyan-200">16/16</p>
            </div>
            <div className="rounded-lg border border-emerald-300/40 bg-emerald-300/[0.10] py-4 shadow-[0_0_30px_rgba(110,231,183,0.20)]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">Verdict</p>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-200">SHIP</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <Finding tag="[OK]"   color="emerald" label="dax_syntax · 1.00 · 0 errors across 39 measures" />
            <Finding tag="[OK]"   color="emerald" label="phi_leakage · 1.00 · no patient identifiers detected" />
            <Finding tag="[WARN]" color="amber"   label="viz_choice · 0.78 · Pareto chart on Page 1 could be a bar" />
            <Finding tag="[OK]"   color="emerald" label="forecast_methodology · 0.92 · ensemble blend justified" />
            <Finding tag="[OK]"   color="emerald" label="domain_relevance · 0.95 · Medicaid spend framing on-target" />
            <Finding tag="[OK]"   color="emerald" label="star_schema_design · 0.97 · 4 relationships, no fact-to-fact joins" />
            <Finding tag="[OK]"   color="emerald" label="accessibility_wcag · 0.88 · contrast 4.7:1 on all text" />
            <Finding tag="[OK]"   color="emerald" label="governance_rls · 1.00 · state_code RLS role enforced" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 rounded-2xl border border-cyan-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-cyan-200/10 backdrop-blur-2xl">
          <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">How it works</p>
          <h2 className="bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
            From spec to shipped artifact
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-3 bottom-3 hidden w-px bg-gradient-to-b from-cyan-300/40 via-emerald-300/30 to-cyan-300/10 sm:block" />
          <ol className="relative space-y-6">
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className="flex items-start gap-5 sm:gap-6">
                <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cyan-300/50 bg-[#040a14] font-mono text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] backdrop-blur-lg">
                  {n}
                </span>
                <div className="flex-grow rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.05]">
                  <h3 className="mb-1 font-serif text-lg font-semibold text-cyan-50">{title}</h3>
                  <p className="text-sm leading-relaxed text-cyan-100/80">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* System architecture */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 rounded-2xl border border-cyan-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-cyan-200/10 backdrop-blur-2xl">
          <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">System architecture</p>
          <h2 className="bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
            Pipeline at a glance
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {ARCH_NODES.map((node, i) => (
              <div key={node.label} className="flex items-center gap-3">
                <div className="flex h-24 w-32 flex-col items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/[0.06] px-2 text-center backdrop-blur-lg transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-300/10">
                  <span className="font-mono text-xs font-semibold text-cyan-300">{node.label}</span>
                  <span className="mt-1 text-[10px] text-cyan-100/75">{node.sub}</span>
                </div>
                {i < ARCH_NODES.length - 1 && <span className="text-lg text-cyan-300/50">❯</span>}
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/5 pt-8 md:grid-cols-3">
            {SUBNOTES.map(({ label, value }) => (
              <div key={label}>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-300">{label}</p>
                <p className="text-sm leading-relaxed text-cyan-100/80">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
        <div className="rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/[0.06] via-white/[0.02] to-emerald-300/[0.06] p-10 text-center shadow-[0_0_60px_rgba(34,211,238,0.10)] backdrop-blur-2xl">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Pick a surface</p>
          <h2 className="mb-6 bg-gradient-to-r from-cyan-200 via-emerald-300 to-violet-300 bg-clip-text font-serif text-2xl font-semibold text-transparent md:text-3xl">
            Three ways to read the same $100B
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <CtaCard href="/projects/healthcare-dashboard/dashboard" label="Power BI dashboard" sub="5 pages · 17 visuals · live embed" />
            <CtaCard href="/projects/healthcare-dashboard/map"       label="GIS choropleth"     sub="state-level · click for detail" />
            <CtaCard href="https://github.com/JdeGraftJohnson/healthcare-cost-ops" external label="GitHub source"   sub="harness · spec · runbooks" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <Link href="/" className="font-mono text-sm text-cyan-300 transition hover:text-cyan-200">← Back to portfolio</Link>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="font-mono text-xs text-cyan-200/60">
              Project 05 · Healthcare Dashboard Ops · CMS Medicaid SDUD 2024
            </p>
            <div className="flex flex-wrap gap-2">
              {["Power BI", "Leaflet", "Azure", "Claude SDK", "DuckDB"].map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-violet-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Finding({ tag, color, label }: { tag: string; color: "emerald" | "amber" | "rose"; label: string }) {
  const tagClass =
    color === "emerald" ? "text-emerald-300 bg-emerald-300/10 border-emerald-300/30" :
    color === "amber"   ? "text-amber-300 bg-amber-300/10 border-amber-300/30" :
                          "text-rose-300 bg-rose-300/10 border-rose-300/30";
  return (
    <div className="flex items-start gap-2 rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
      <span className={`font-mono text-[10px] font-semibold rounded px-1.5 py-0.5 border ${tagClass}`}>{tag}</span>
      <span className="font-mono text-[11px] text-cyan-100/80">{label}</span>
    </div>
  );
}

function CtaCard({ href, label, sub, external }: { href: string; label: string; sub: string; external?: boolean }) {
  const inner = (
    <>
      <p className="font-serif text-base font-semibold text-cyan-50">{label} {external ? "↗" : "→"}</p>
      <p className="mt-1 font-mono text-[11px] text-cyan-200/70">{sub}</p>
    </>
  );
  const classes = "block rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.06]";
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{inner}</a>
    : <Link href={href} className={classes}>{inner}</Link>;
}
