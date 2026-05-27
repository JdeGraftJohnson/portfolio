interface HeroProps {
  prescriptions: number;
  years: number[];
  states: number;
  forecastMonths: number;
  pages: number;
  visuals: number;
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function HealthcareHero({
  prescriptions,
  years,
  states,
  forecastMonths,
  pages,
  visuals,
}: HeroProps) {
  const yearStart = Math.min(...years);
  const yearEnd = Math.max(...years);
  const yearSpan = `${yearStart}–${yearEnd}`;
  const kpis = [
    { label: "Medicaid prescriptions", value: fmtCompact(prescriptions), sub: "claim-level records" },
    { label: "Years analyzed", value: yearSpan, sub: `${years.length}-year history` },
    { label: "States & territories", value: String(states), sub: "incl. DC + US territories" },
    { label: "Forecast horizon", value: `${forecastMonths} mo`, sub: "SARIMA + Prophet ensemble" },
  ];

  return (
    <header className="max-w-6xl mx-auto px-4 pt-10 pb-6">
      <p
        className="text-[11px] uppercase tracking-[0.18em] mb-3"
        style={{ color: "#22d3ee", fontWeight: 700 }}
      >
        Healthcare · Public Sector Analytics
      </p>
      <h1
        className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
        style={{ color: "rgba(255,255,255,0.96)", letterSpacing: "-0.01em" }}
      >
        Medicaid prescription cost analytics, 2020–2025
      </h1>
      <p
        className="text-base md:text-lg max-w-3xl"
        style={{ color: "rgba(255,255,255,0.70)", lineHeight: 1.6 }}
      >
        A Power BI report on CMS Medicaid State Drug Utilization Data — spend
        concentration, brand-to-generic substitution opportunity, per-capita
        state outliers, and a 12-month ensemble forecast. {pages} report pages,
        {" "}{visuals} interactive visuals, refreshable on demand.
      </p>

      {/* Provenance strip */}
      <div
        className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-1 rounded"
          style={{
            background: "rgba(74,222,128,0.12)",
            color: "#a7f3d0",
            border: "1px solid rgba(74,222,128,0.35)",
            fontWeight: 700,
          }}
        >
          Public data
        </span>
        <span
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Source:{" "}
          <a
            href="https://data.medicaid.gov/dataset/state-drug-utilization-data"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#22d3ee", textDecoration: "underline" }}
          >
            CMS State Drug Utilization Data
          </a>
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
          Coverage: {yearSpan}
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
          Refreshed quarterly by CMS
        </span>
      </div>

      {/* KPI ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              {k.label}
            </p>
            <p
              className="text-2xl md:text-3xl font-bold font-mono leading-none mb-1"
              style={{ color: "rgba(255,255,255,0.96)" }}
            >
              {k.value}
            </p>
            <p
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {k.sub}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
}
