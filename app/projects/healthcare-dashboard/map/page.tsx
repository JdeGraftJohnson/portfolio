import fs from "node:fs";
import path from "node:path";
import { USRxMap } from "@/components/demo/healthcare/USRxMap";
import { ClassByRegionChart } from "@/components/demo/healthcare/ClassByRegionChart";
import { StateRankingTable } from "@/components/demo/healthcare/StateRankingTable";
import { NationalTopDrugs } from "@/components/demo/healthcare/NationalTopDrugs";

export const metadata = {
  title: "US Medicaid Rx Map · John DeGraft-Johnson",
  description:
    "Editorial dataviz of CMS Medicaid State Drug Utilization Data — where 2024's $100B in Medicaid prescription spend went, by state, region, and drug.",
};

function fmtUSD(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  return "$" + n.toFixed(0);
}
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

export default function HealthcareMapPage() {
  const dataPath = path.join(process.cwd(), "public", "demo", "healthcare", "us-rx-by-state.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const meta = data._meta;
  const topState = data.states[0];

  return (
    <main className="min-h-screen" style={{ background: "#05050f", color: "rgba(255,255,255,0.92)" }}>
      {/* HERO */}
      <header style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 16px 8px" }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "#34d399", fontWeight: 700, margin: 0, marginBottom: 10 }}>
          Geospatial · Editorial dataviz
        </p>
        <h1 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: "rgba(255,255,255,0.96)", margin: 0, marginBottom: 10, letterSpacing: "-0.015em", lineHeight: 1.1, maxWidth: 920 }}>
          Where Medicaid&apos;s $100B prescription bill goes
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.2vw, 17px)", color: "rgba(255,255,255,0.70)", margin: 0, maxWidth: 780, lineHeight: 1.55 }}>
          A state-by-state read on the 2024 CMS Medicaid State Drug Utilization Data. {meta.states_count} states &amp; territories
          dispensed {fmtNum(meta.total_rx_count)} prescriptions for{" "}
          <b style={{ color: "rgba(255,255,255,0.92)" }}>{fmtUSD(meta.total_reimb)}</b> in reimbursement.
          Autoimmune biologics and GLP-1 diabetes drugs dominate — but the local picture is more interesting than the average.
        </p>

        {/* KPI ribbon */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 20 }}>
          <KPI label="Total Medicaid Rx spend" value={fmtUSD(meta.total_reimb)} sub="2024 · CMS SDUD" />
          <KPI label="Prescriptions filled" value={fmtNum(meta.total_rx_count)} sub="claim-level records" />
          <KPI label="States &amp; territories" value={String(meta.states_count)} sub="incl. DC + US territories" />
          <KPI label="Top spender" value={topState.state_code} sub={`${fmtUSD(topState.total_reimb)} · ${topState.top_class}`} />
        </div>
      </header>

      {/* MAP (full-width) */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 16px 0" }}>
        <USRxMap />
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", margin: "10px 4px 0", maxWidth: 1100 }}>
          State-level choropleth. Color = dominant drug class · alpha = prescription volume. Scroll to zoom, drag to pan, hover for detail.
        </p>
      </section>

      {/* REGION CHART (collapsible) */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 0" }}>
        <details
          style={{
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
          open
        >
          <summary
            style={{
              listStyle: "none",
              cursor: "pointer",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 4 }}>
                Regional breakdown
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: 0 }}>
                Top-5 drug class composition by US census region
              </p>
            </div>
            <span
              aria-hidden
              style={{
                fontSize: 12, color: "rgba(255,255,255,0.55)",
                padding: "5px 10px", borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap",
              }}
            >
              Toggle
            </span>
          </summary>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <ClassByRegionChart />
          </div>
        </details>
      </section>

      {/* RANKING TABLE */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
        <StateRankingTable />
      </section>

      {/* NATIONAL TOP DRUGS */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 24px" }}>
        <NationalTopDrugs />
      </section>

      {/* FOOTER */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "8px 16px 64px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, maxWidth: 720 }}>
            Source: CMS Medicaid State Drug Utilization Data (2024) ·
            refreshed quarterly by an Azure Container Apps Job
            (<code style={{ color: "rgba(255,255,255,0.65)" }}>caj-medicaid-rx-gis-prod1</code>) ·
            data committed to{" "}
            <code style={{ color: "rgba(255,255,255,0.65)" }}>stasiprod1eus2/healthcare-public</code>.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/projects/healthcare-dashboard"
              style={{
                fontSize: 13, color: "#22d3ee", textDecoration: "none",
                padding: "8px 14px", borderRadius: 6,
                border: "1px solid rgba(34,211,238,0.35)",
                background: "rgba(34,211,238,0.06)",
              }}
            >
              ← Project overview
            </a>
            <a
              href="/projects/healthcare-dashboard/dashboard"
              style={{
                fontSize: 13, color: "#34d399", textDecoration: "none",
                padding: "8px 14px", borderRadius: 6,
                border: "1px solid rgba(52,211,153,0.35)",
                background: "rgba(52,211,153,0.06)",
              }}
            >
              Power BI dashboard →
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .editorial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function KPI({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 14,
      }}
    >
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "ui-monospace, SFMono-Regular, monospace", color: "rgba(255,255,255,0.96)", margin: 0, lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", margin: 0, marginTop: 4 }}>{sub}</p>
    </div>
  );
}
