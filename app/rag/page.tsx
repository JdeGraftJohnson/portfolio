"use client";

import Link from "next/link";

const TAGS = ["RAG", "FHIR", "Clinical NLP", "Gemma 4", "Azure OpenAI", "NICE Guidelines"];

// Static colour map — Tailwind cannot pick up dynamic class strings (e.g. `bg-${c}-300`),
// so each accent is enumerated as a literal class set the JIT can see.
const TRUST_PILLS = [
  { label: "NHS Digital",     classes: "border-pink-300/40 bg-pink-300/10 text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.18)]",       dot: "bg-pink-300" },
  { label: "NICE Guidelines", classes: "border-violet-300/40 bg-violet-300/10 text-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.18)]", dot: "bg-violet-300" },
  { label: "MHRA GMLP",       classes: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-300 shadow-[0_0_20px_rgba(240,171,252,0.18)]", dot: "bg-fuchsia-300" },
  { label: "UK GDPR Art.22",  classes: "border-orange-200/50 bg-orange-200/10 text-orange-200 shadow-[0_0_20px_rgba(254,215,170,0.20)]", dot: "bg-orange-200" },
  { label: "FHIR R4",         classes: "border-pink-300/40 bg-pink-300/10 text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.18)]",       dot: "bg-pink-300" },
  { label: "SNOMED CT",       classes: "border-violet-300/40 bg-violet-300/10 text-violet-300 shadow-[0_0_20px_rgba(196,181,253,0.18)]", dot: "bg-violet-300" },
  { label: "Azure OpenAI",    classes: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-300 shadow-[0_0_20px_rgba(240,171,252,0.18)]", dot: "bg-fuchsia-300" },
  { label: "Gemma 4",         classes: "border-orange-200/50 bg-orange-200/10 text-orange-200 shadow-[0_0_20px_rgba(254,215,170,0.20)]", dot: "bg-orange-200" },
];

// Use Cases mapped to specific companies in the active health / biotech /
// research application pipeline. Each card frames a clinical-RAG capability
// in that company's actual problem domain.
const USE_CASES = [
  {
    glyph: "▲",
    company: "Causaly",
    title: "Biomedical evidence assembly",
    body: "Surface a defensible chain of evidence across millions of biomedical papers, patents, and trial registries — every claim returns with the source paragraph, DOI, and SNOMED-mapped concept so reviewers can verify in one click.",
    chip: "Knowledge graph · DOI",
  },
  {
    glyph: "●",
    company: "Maven Clinic",
    title: "Specialty-aware care guidance",
    body: "OB/GYN, fertility, and paediatric queries return guideline-grounded answers overlaid with provider state, payor, and trimester context — so the same prompt yields a different, locally compliant pathway depending on member geography.",
    chip: "RCOG · ACOG · state",
  },
  {
    glyph: "◆",
    company: "Onsera Health",
    title: "Chronic-condition pathway lookup",
    body: "For a patient on a long-term care pathway, the assistant retrieves the relevant NICE step, the next escalation criterion, and the eligible interventions — keeping community clinicians aligned with the latest published pathway.",
    chip: "NICE pathway · escalation",
  },
  {
    glyph: "✦",
    company: "Heim Health",
    title: "Point-of-care home-visit support",
    body: "Runs on a clinician's tablet during a home visit. Voice or typed query returns a concise NICE-grounded answer plus a one-tap audit-trail entry — designed for low-bandwidth visits where the clinician can't open a 60-page PDF.",
    chip: "NICE · offline-cache",
  },
  {
    glyph: "⬢",
    company: "Gilead Sciences",
    title: "Trial-protocol & evidence retrieval",
    body: "Query an internal trial-protocol corpus alongside published oncology and antiviral literature; the response cites the protocol section, the published source, and any superseding amendment so clinical-ops and regulatory teams stay synchronised.",
    chip: "Protocol · amendment trail",
  },
  {
    glyph: "⟡",
    company: "Genomics England",
    title: "Variant-to-evidence retrieval",
    body: "A genomic variant maps to the relevant ClinVar entry, OMIM phenotype, and any NICE-recognised genomic test pathway — every output flagged with a confidence score and a mandatory clinical-scientist review before release.",
    chip: "ClinVar · OMIM · review",
  },
];

const STEPS = [
  { n: "01", title: "Clinician submits query",     body: "Submitted through the secure NHS-authenticated interface. All queries are logged and auditable." },
  { n: "02", title: "Semantic vector search",      body: "Embedded and matched against 50,000+ NICE guideline chunks using cosine similarity." },
  { n: "03", title: "NICE guideline retrieval",    body: "The top-k most relevant guideline sections are retrieved with full source metadata." },
  { n: "04", title: "Gemma 4 generation",          body: "Retrieved context is passed to Gemma 4 on Azure AI with a clinically constrained system prompt." },
  { n: "05", title: "Mandatory review flag applied", body: "A non-bypassable review flag is attached — the system cannot return a response without it." },
  { n: "06", title: "Clinician reviews & acts",    body: "The clinician receives the evidence, citations, SNOMED codes, and review flag — and decides." },
];

const ARCH_NODES = [
  { label: "Query Input",      sub: "Clinical question" },
  { label: "Vector Search",    sub: "Azure Cognitive" },
  { label: "NICE Retrieval",   sub: "50k+ chunks" },
  { label: "LLM Generation",   sub: "Gemma 4 · Azure" },
  { label: "Review Flag",      sub: "Non-bypassable" },
  { label: "Citation",         sub: "SNOMED + NG ref" },
  { label: "Clinician",        sub: "Final decision" },
];

const SUBNOTES = [
  { label: "Vector Store",     value: "Azure Cognitive Search · ada-002 embeddings · cosine similarity" },
  { label: "Knowledge Base",   value: "NICE guidelines · BNF drug data · SNOMED CT ontology" },
  { label: "Compliance Layer", value: "UK GDPR Art.22 · MHRA GMLP · NHS DSP Toolkit" },
];

export default function RagPage() {
  return (
    <div className="min-h-screen bg-[#16091c] font-sans text-pink-50 antialiased">
      {/* Ambient orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-pink-400/20 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[600px] w-[600px] rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-300/15 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-[500px] w-[500px] rounded-full bg-orange-200/10 blur-3xl" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#16091c]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="font-mono text-sm text-pink-300 transition hover:text-pink-200">
            ← johndegraft.app
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pink-300" />
            <span className="font-mono text-xs text-violet-200">In Development</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex items-center rounded-full border border-pink-300/40 bg-pink-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink-300 backdrop-blur-lg">
              Project 04 · Clinical AI
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
            <h1 className="mb-6 bg-gradient-to-r from-pink-200 via-fuchsia-300 to-violet-300 bg-clip-text font-serif text-4xl font-semibold leading-tight text-transparent md:text-5xl lg:text-6xl">
              NHS Clinical Decision Support RAG Assistant
            </h1>
            <p className="mb-4 font-serif text-xl italic text-pink-200/80">
              &ldquo;Clinical decisions, evidence first&rdquo;
            </p>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-violet-200">
              Answers NICE guideline queries in plain language with exact citations, SNOMED CT codes,
              and a mandatory human-review flag on every response. Built for NHS clinical settings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/nhs-rag"
                className="rounded-lg bg-gradient-to-br from-pink-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(244,114,182,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(244,114,182,0.55)]"
              >
                Try the Clinical Assistant →
              </Link>
              <Link
                href="/projects/patient-disengagement"
                className="rounded-lg border border-violet-300/30 bg-white/[0.02] px-4 py-3 text-xs font-medium text-violet-300/80 backdrop-blur-lg transition hover:-translate-y-0.5 hover:bg-white/[0.05]"
              >
                Related: Patient Disengagement chat →
              </Link>
            </div>
          </div>

          {/* Floating preview card */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                <span className="ml-2 font-mono text-xs text-violet-300/70">clinical-rag · query</span>
              </div>

              <div className="mb-3 rounded-lg border border-pink-300/25 bg-pink-300/[0.06] px-4 py-3">
                <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-pink-300">Clinical Query</p>
                <p className="text-sm font-medium text-pink-50">First-line treatment for type 2 diabetes in adults?</p>
              </div>

              <div className="mb-4 rounded-lg border border-violet-300/25 bg-violet-300/[0.05] px-4 py-3">
                <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-300">Evidence-Based Response</p>
                <p className="text-sm leading-relaxed text-violet-100/90">
                  Metformin is first-line unless contraindicated (eGFR &lt;30). Target HbA1c 48 mmol/mol for monotherapy.
                </p>
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-pink-300/40 bg-pink-300/10 px-3 py-2 text-xs backdrop-blur-lg">
                <span className="font-mono font-semibold text-pink-300">NICE NG28 · Rec. 1.6.1</span>
                <span className="font-mono text-violet-300/80">SNOMED CT 44054006</span>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-orange-200/50 bg-orange-200/10 px-3 py-2.5 text-xs font-semibold text-orange-200 shadow-[0_0_30px_rgba(254,215,170,0.25)] backdrop-blur-lg">
                <span className="h-2 w-2 animate-pulse rounded-full bg-orange-200" />
                <span className="font-mono uppercase tracking-wider">Mandatory Human Review Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="mr-1 font-mono text-xs uppercase tracking-wider text-violet-300/70">Compliance &amp; Standards</span>
            {TRUST_PILLS.map(({ label, classes, dot }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-lg ${classes}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 flex items-center justify-between rounded-2xl border border-pink-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-pink-200/10 backdrop-blur-2xl">
          <div>
            <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-300">Use Cases</p>
            <h2 className="bg-gradient-to-r from-pink-200 via-fuchsia-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
              Evidence-grade clinical scenarios
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-violet-300/60 md:inline">06 active</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map(({ glyph, company, title, body, chip }) => (
            <article
              key={company}
              className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-pink-200/30 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-pink-300/40 bg-pink-300/10 text-xl text-pink-300 backdrop-blur-lg">
                  {glyph}
                </span>
                <span className="inline-flex items-center rounded-full border border-pink-200/30 bg-pink-200/[0.08] px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-pink-200">
                  Built for {company}
                </span>
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-pink-50">{title}</h3>
              <p className="mb-5 flex-grow text-sm leading-relaxed text-violet-200/90">{body}</p>
              <span className="inline-flex w-fit items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-violet-300">
                {chip}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 rounded-2xl border border-pink-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-pink-200/10 backdrop-blur-2xl">
          <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-300">How It Works</p>
          <h2 className="bg-gradient-to-r from-pink-200 via-fuchsia-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
            From query to verified answer
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-3 bottom-3 hidden w-px bg-gradient-to-b from-pink-300/40 via-violet-300/30 to-pink-300/10 sm:block" />
          <ol className="relative space-y-6">
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className="flex items-start gap-5 sm:gap-6">
                <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-pink-300/50 bg-[#16091c] font-mono text-xs font-semibold text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.25)] backdrop-blur-lg">
                  {n}
                </span>
                <div className="flex-grow rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.05]">
                  <h3 className="mb-1 font-serif text-lg font-semibold text-pink-50">{title}</h3>
                  <p className="text-sm leading-relaxed text-violet-200/85">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* System architecture */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-12 rounded-2xl border border-pink-200/30 bg-white/[0.04] px-6 py-5 ring-1 ring-pink-200/10 backdrop-blur-2xl">
          <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-300">System Architecture</p>
          <h2 className="bg-gradient-to-r from-pink-200 via-fuchsia-300 to-violet-300 bg-clip-text font-serif text-3xl font-semibold text-transparent md:text-4xl">
            RAG pipeline at a glance
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {ARCH_NODES.map((node, i) => (
              <div key={node.label} className="flex items-center gap-3">
                <div className="flex h-24 w-32 flex-col items-center justify-center rounded-xl border border-pink-300/30 bg-pink-300/[0.06] px-2 text-center backdrop-blur-lg transition hover:-translate-y-0.5 hover:border-pink-300/50 hover:bg-pink-300/10">
                  <span className="font-mono text-xs font-semibold text-pink-300">{node.label}</span>
                  <span className="mt-1 text-[10px] text-violet-300/80">{node.sub}</span>
                </div>
                {i < ARCH_NODES.length - 1 && (
                  <span className="text-lg text-violet-300/50">❯</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/5 pt-8 md:grid-cols-3">
            {SUBNOTES.map(({ label, value }) => (
              <div key={label}>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-300">{label}</p>
                <p className="text-sm leading-relaxed text-violet-200/80">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample interaction */}
      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-300">Sample Interaction</p>
          <h2 className="bg-gradient-to-r from-pink-200 via-fuchsia-300 to-violet-300 bg-clip-text font-serif text-2xl font-semibold text-transparent md:text-3xl">
            Evidence-grounded in every response
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_50px_rgba(255,255,255,0.04)] backdrop-blur-2xl">
          <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <span className="h-3 w-3 rounded-full bg-rose-400/70" />
            <span className="h-3 w-3 rounded-full bg-amber-300/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-300/70" />
            <span className="ml-2 font-mono text-xs text-violet-300/70">NHS Clinical RAG · Session #7391</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Authenticated
            </span>
          </div>

          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-pink-300">Clinical Query</p>
          <div className="mb-5 rounded-lg border border-pink-300/25 bg-pink-300/[0.06] px-4 py-3">
            <p className="text-sm font-medium text-pink-50">First-line treatment for type 2 diabetes in adults?</p>
          </div>

          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-300">Evidence-Based Response</p>
          <div className="mb-6 rounded-lg border border-violet-300/25 bg-violet-300/[0.05] px-4 py-3">
            <p className="text-sm leading-relaxed text-violet-100/90">
              Metformin is first-line unless contraindicated (eGFR &lt;30). Target HbA1c 48 mmol/mol for monotherapy.
            </p>
          </div>

          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">Guideline Citation</p>
          <div className="mb-6 rounded-lg border border-fuchsia-300/30 bg-fuchsia-300/[0.06] px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <div>
                <p className="font-mono font-semibold text-pink-300">NICE NG28</p>
                <p className="font-mono text-violet-300/70">Recommendation 1.6.1</p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div>
                <p className="font-mono font-semibold text-violet-300">SNOMED CT 44054006</p>
                <p className="font-mono text-violet-300/70">Type 2 diabetes mellitus</p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div>
                <p className="font-mono text-violet-300/70">Confidence</p>
                <p className="font-mono font-semibold text-emerald-300">0.94</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-orange-200/50 bg-orange-200/10 px-4 py-3 shadow-[0_0_30px_rgba(254,215,170,0.30)] backdrop-blur-lg">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-orange-200/30 bg-orange-200/15 text-orange-200">
              ⚠
            </span>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-orange-200">Mandatory Human Review Required</p>
              <p className="text-xs text-orange-200/70">
                This AI-generated response must be reviewed by a qualified clinician. UK GDPR Art.22 · MHRA GMLP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <Link href="/" className="font-mono text-sm text-pink-300 transition hover:text-pink-200">
            ← Back to portfolio
          </Link>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="font-mono text-xs text-violet-300/60">
              Project 04 · NHS Clinical Decision Support RAG Assistant · In Development
            </p>
            <div className="flex flex-wrap gap-2">
              {["RAG", "FHIR", "Azure OpenAI", "NICE"].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-violet-300"
                >
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
