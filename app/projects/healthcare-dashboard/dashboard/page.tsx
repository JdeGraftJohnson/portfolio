import fs from "node:fs";
import path from "node:path";
import { HealthcareWalkthrough } from "@/components/demo/healthcare/Walkthrough";
import { HealthcareEmbed } from "@/components/demo/healthcare/HealthcareEmbed";
import { HealthcareHero } from "@/components/demo/healthcare/HealthcareHero";

export const metadata = {
  title: "Medicaid Rx Cost Analytics · John DeGraft-Johnson",
  description:
    "Power BI report on CMS Medicaid State Drug Utilization Data — 2020–2025 prescription spend, brand-to-generic substitution opportunity, 12-month forecast.",
};

const STATES_COUNT = 57;
const FORECAST_MONTHS = 12;

export default function HealthcareDashboardPage() {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "demo",
    "healthcare",
    "manifest.json"
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  return (
    <main className="min-h-screen" style={{ background: "#05050f" }}>
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 0" }}>
        <a
          href="/projects/healthcare-dashboard"
          style={{
            fontSize: 12, color: "#22d3ee", textDecoration: "none",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
          }}
        >
          ← Project overview
        </a>
      </nav>
      <HealthcareHero
        prescriptions={manifest.bronze.rows_total}
        years={manifest.bronze.years}
        states={STATES_COUNT}
        forecastMonths={FORECAST_MONTHS}
        pages={manifest.layout.pages}
        visuals={manifest.layout.visuals}
      />

      <HealthcareEmbed />

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 16px 80px",
        }}
      >
        <details
          style={{
            borderRadius: 14,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <summary
            style={{
              listStyle: "none",
              cursor: "pointer",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#22d3ee",
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                For technical reviewers
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.94)",
                  margin: 0,
                }}
              >
                How this was built — pipeline + 16-evaluator LLM audit harness
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.60)",
                  margin: 0,
                  marginTop: 4,
                }}
              >
                Spec → bronze → silver → forecast → TOM model → 3-tier scalable-oversight pass
              </p>
            </div>
            <span
              aria-hidden
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap",
              }}
            >
              Expand
            </span>
          </summary>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <HealthcareWalkthrough manifest={manifest} />
          </div>
        </details>
      </section>
    </main>
  );
}
