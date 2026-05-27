"use client";

const AMBER = "#f59e0b";
const MUTED = "rgba(255,255,255,0.65)";

// CMS Medicaid SDUD is a public dataset; the dashboard is illustrative.
export function HealthcareDisclaimer() {
  return (
    <div
      className="rounded-2xl p-5 mb-8"
      style={{ background: `${AMBER}10`, border: `1px solid ${AMBER}55` }}
    >
      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: AMBER, fontWeight: 700 }}>
        Portfolio demonstration · public data only
      </p>
      <p className="text-xs leading-relaxed mb-2" style={{ color: MUTED }}>
        This page is a portfolio demonstration of a Power BI evaluation
        harness applied to the CMS Medicaid State Drug Utilization Data
        — a publicly-available dataset published by the Centers for
        Medicare & Medicaid Services. No protected health information,
        beneficiary identifiers, or claim-level records are included.
        SDUD is state-level aggregated by drug and quarter.
      </p>
      <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
        Forecasts shown are illustrative model output, not policy
        guidance. Figures are for software-design demonstration purposes
        and should not be used for clinical, financial, or regulatory
        decision-making.
      </p>
    </div>
  );
}
