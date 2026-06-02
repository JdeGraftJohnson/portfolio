import Link from "next/link";
import { FloatingDisengagementChat } from "@/components/demo/patient-disengagement/FloatingDisengagementChat";

export const metadata = {
  title: "Patient Disengagement Risk · UK Biotech Project 01",
  description:
    "AI-powered early warning system for GP practices. Identifies high-risk patients using XGBoost + SHAP, built on NHS data standards.",
};

const PERF_CARDS: { icon: string; tone: string; label: string; value: string; sub: string }[] = [
  {
    icon: "📈",
    tone: "#60a5fa",
    label: "Model Accuracy",
    value: "AUC 0.94",
    sub: "XGBoost · out-of-fold validation · 10,000 synthetic CPRD Gold patients",
  },
  {
    icon: "🔴",
    tone: "#f87171",
    label: "High-Risk Patients",
    value: "20 Flagged",
    sub: "≥96% disengagement risk · ranked by SHAP feature importance",
  },
  {
    icon: "⚖️",
    tone: "#14b8a6",
    label: "Fairness Audit",
    value: "EOD 0.21",
    sub: "IMD quintile equalized-odds difference · NICE ESF Tier B monitoring",
  },
];

const ABOUT_CARDS: { tag: string; tone: string; title: string; body: string }[] = [
  {
    tag: "Data Source",
    tone: "#60a5fa",
    title: "CPRD Gold → CPRD Aurum",
    body:
      "This project is built on the Clinical Practice Research Datalink (CPRD) — the NHS's gold-standard anonymised GP records dataset, used by researchers at NICE, the Wellcome Trust, and the NHS itself. We use CPRD Gold (Read Code–coded) as our training cohort, representing a realistic snapshot of 10,000 UK primary care patients. As NHS practices migrate to CPRD Aurum (EMIS-native), our pipeline is designed to ingest both formats without re-engineering.",
  },
  {
    tag: "Terminology Standard",
    tone: "#a78bfa",
    title: "Legacy Read Codes → SNOMED CT",
    body:
      "The NHS mandated SNOMED CT (Systematized Nomenclature of Medicine Clinical Terms) as the single clinical terminology for all GP systems from April 2018 — replacing the older Read Code system (CTV3 / Read v2) that underpinned decades of UK GP records. Our OMOP CDM transformation layer bridges this gap: historical Read Code diagnoses are mapped to SNOMED CT concept IDs, ensuring this model works correctly whether a practice is still mid-migration or fully on SNOMED CT. This future-proofs the pipeline for NHS England's Long Term Plan mandate that all providers be SNOMED CT–compliant by 2025.",
  },
  {
    tag: "Data Model",
    tone: "#34d399",
    title: "OMOP Common Data Model",
    body:
      "Raw GP data passes through a Delta Lake medallion pipeline (Bronze → Silver → Gold) before being standardised into the OMOP CDM — the international standard for observational health data used by the FDA, EMA, and NHS England's OpenSAFELY platform. This means every feature in our risk model — consultations, diagnoses, prescriptions — is expressed in a vendor-neutral, internationally portable format. Any NHS trust or ICS wishing to replicate this model against their own OMOP data can do so without bespoke ETL work.",
  },
  {
    tag: "Clinical Coding",
    tone: "#fbbf24",
    title: "QOF & ICD-10 Conditions",
    body:
      "Long-term conditions are flagged using the Quality and Outcomes Framework (QOF) register codes — the same coding system GP practices use for their annual contract reporting to NHS England. Conditions covered include Type 2 diabetes (qof_dm2), Hypertension (qof_ht), Asthma, COPD, Depression, Obesity, CKD, and Cancer. ICD-10 mappings are maintained in the Silver layer for hospital linkage readiness, and SNOMED CT equivalents are stored in the OMOP Gold layer.",
  },
  {
    tag: "Deprivation",
    tone: "#f87171",
    title: "IMD — Index of Multiple Deprivation",
    body:
      "Every patient is assigned an IMD quintile using the English Indices of Multiple Deprivation (MHCLG, 2019) — the official UK government measure of relative deprivation at LSOA level. IMD is the second-strongest predictor of disengagement in our model, after age. The model's fairness audit measures whether the algorithm treats deprived communities equitably — a NICE ESF Tier B requirement for AI tools used in NHS settings. Equalized odds difference by IMD quintile is reported transparently with every model run.",
  },
  {
    tag: "Regulation",
    tone: "#fb923c",
    title: "NICE ESF · UK GDPR · NHS DSP Toolkit",
    body:
      "This tool is designed to meet the NICE Evidence Standards Framework (ESF) for Digital Health Technologies — specifically Tier B (AI supporting clinical decisions). All risk scores are model outputs, not clinical findings, and require human review before any action — complying with UK GDPR Article 22 (automated decision-making safeguards). Data governance follows the NHS Data Security and Protection (DSP) Toolkit. The underlying dataset is synthetic (no real patient data leaves the NHS boundary), making this safe for demonstration and external validation.",
  },
  {
    tag: "Wider Ecosystem",
    tone: "#14b8a6",
    title: "NHS Datasets & Linkage Awareness",
    body:
      "The pipeline is architecturally aware of the broader NHS data ecosystem. Regional performance is benchmarked against Fingertips (UKHSA Public Health Profiles) at ICB level. Mental health outcomes reference IAPT (Improving Access to Psychological Therapies) waiting time standards. Practice quality ratings from the CQC (Care Quality Commission) are included as model features. NHS England Integrated Care Board (ICB) boundaries — which replaced CCGs in 2022 — are used for geographic aggregation. Future linkage to HES (Hospital Episode Statistics), ONS mortality, and NHS 111/999 data is supported by the OMOP schema already in place.",
  },
];

function glassCard(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    borderRadius: 16,
    padding: 28,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow:
      "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 1px 2px 0 rgba(0,0,0,0.05)",
    ...extra,
  };
}

export default function PatientDisengagementPage() {
  return (
    <main style={{ background: "#05050f", minHeight: "100vh", color: "white" }}>
      {/* Hero */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: "#05050f", minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <nav className="relative z-20 flex items-center justify-between px-8 py-6">
          <Link href="/" style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, textDecoration: "none" }}>
            ← johndegraft.app
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="text-white font-semibold tracking-tight text-sm">UK Biotech · Patient Intelligence</span>
            <span className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/60">Project 01 Pilot</span>
          </div>
        </nav>

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(5,5,15,0) 40%, rgba(5,5,15,0.75) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
          <div style={glassCard({ padding: 48, maxWidth: 720, width: "100%", textAlign: "center" })}>
            <p className="text-xs font-medium tracking-widest uppercase text-blue-400 mb-4">
              NHS Primary Care · AI Decision Support
            </p>
            <h1
              className="text-white font-semibold"
              style={{ fontSize: "clamp(1.75rem,4vw,3rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
            >
              Predicting Patient Disengagement
              <br />
              <span style={{ color: "#60a5fa" }}>Before It Happens</span>
            </h1>
            <p className="mt-5 text-white/70 text-base leading-relaxed max-w-xl mx-auto">
              An AI early-warning system for GP practices — identifying the patients most at risk of stopping care
              before their health deteriorates. Built on UK clinical standards and openly audited for fairness.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#project"
                className="px-6 py-3 rounded-lg border border-white/20 text-white/80 font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Learn more ↓
              </a>
            </div>
          </div>
          <div className="mt-6 flex gap-6 text-xs text-white/50">
            <span className="flex items-center gap-2">
              <span className="inline-block" style={{ width: 10, height: 10, borderRadius: 5, background: "#60a5fa" }} />
              High-risk patients (20)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block" style={{ width: 8, height: 8, borderRadius: 4, background: "#475569" }} />
              General cohort (10,000)
            </span>
          </div>
        </div>
      </section>

      {/* Model performance */}
      <section
        className="py-24 px-6"
        style={{ background: "linear-gradient(180deg, #05050f 0%, #0a0a1f 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium tracking-widest uppercase text-teal-400 text-center mb-3">
            Model Performance
          </p>
          <h2 className="text-white text-center font-semibold text-2xl mb-12">What the model tells us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERF_CARDS.map((c) => (
              <div key={c.label} style={glassCard()}>
                <div className="text-2xl mb-3">{c.icon}</div>
                <p
                  className="text-xs font-medium tracking-wider uppercase mb-1"
                  style={{ color: c.tone }}
                >
                  {c.label}
                </p>
                <p className="text-white font-semibold text-2xl mb-2">{c.value}</p>
                <p className="text-white/50 text-sm leading-relaxed">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="project"
        className="py-24 px-6"
        style={{ background: "linear-gradient(180deg, #0a0a1f 0%, #050510 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium tracking-widest uppercase text-blue-400 text-center mb-3">
            About This Project
          </p>
          <h2 className="text-white text-center font-semibold text-2xl mb-4">
            Built for the UK healthcare system, from the ground up
          </h2>
          <p className="text-white/60 text-center text-base leading-relaxed max-w-3xl mx-auto mb-16">
            Patient disengagement — when someone stops attending their GP — often precedes serious health decline.
            This model identifies who is most at risk before that happens, giving practice teams the information
            they need to intervene early. Every technical decision in this project reflects NHS data standards,
            UK regulation, and clinical workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ABOUT_CARDS.map((c) => (
              <div key={c.title} style={glassCard()}>
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-semibold tracking-wider uppercase px-2 py-1 rounded-full shrink-0 mt-0.5"
                    style={{
                      color: c.tone,
                      background: `${c.tone}18`,
                      border: `1px solid ${c.tone}30`,
                    }}
                  >
                    {c.tag}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-base mt-3 mb-2">{c.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <div style={glassCard({ display: "inline-block", padding: 20, borderRadius: 12 })}>
              <p className="text-white/50 text-xs leading-relaxed max-w-2xl">
                <span className="text-white/80 font-medium">Synthetic data only.</span> All patients in this pilot
                are generated from CPRD statistical distributions — no real NHS patient records are processed
                outside secure NHS environments. This makes the model safe to demonstrate, evaluate, and validate
                externally before NHS IG approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="py-10 px-6 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#05050f" }}
      >
        <p className="text-white/30 text-xs leading-relaxed max-w-2xl mx-auto">
          ⚠ Decision support tool only. All risk scores are model outputs — not clinical findings. Human review
          required before any patient action (UK GDPR Article 22).
          <br />
          Synthetic CPRD Gold data · NHS England SNOMED CT compliant · NICE ESF Tier B
        </p>
      </footer>

      <FloatingDisengagementChat />
    </main>
  );
}
