"use client";

// 16-evaluator Power BI dashboard harness — adapted from ProposalJudgeMap
// pattern. Three parallel tiers (deterministic / LLM / paired auditors)
// converge into a judge-orchestrator + composite scorecard.

const BG_PANEL = "rgba(15,17,35,0.55)";
const BORDER_PANEL = "rgba(96,165,250,0.25)";
const BORDER_DET = "rgba(74,222,128,0.35)";
const BORDER_LLM = "rgba(168,85,247,0.35)";
const BORDER_AUD = "rgba(251,191,36,0.45)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.55)";
const CHIP_BG = "rgba(255,255,255,0.04)";

interface ChipProps {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  accent?: string;
}

function Chip({ x, y, w = 220, h = 26, label, accent = TEXT }: ChipProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={CHIP_BG} stroke="rgba(255,255,255,0.10)" />
      <text x={x + 10} y={y + h / 2 + 4} fontSize={11} fill={accent} fontFamily="ui-monospace, Menlo, monospace">
        {label}
      </text>
    </g>
  );
}

interface ClusterProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle?: string;
  border: string;
  children?: React.ReactNode;
}

function Cluster({ x, y, w, h, title, subtitle, border, children }: ClusterProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12}
        fill={BG_PANEL} stroke={border} strokeWidth={1.5} />
      <text x={x + 18} y={y + 22} fontSize={12} fontWeight={700}
        fill={TEXT} style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </text>
      {subtitle && (
        <text x={x + 18} y={y + 38} fontSize={10} fill={MUTED}>
          {subtitle}
        </text>
      )}
      {children}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(125,211,252,0.45)" strokeWidth={1.5}
      markerEnd="url(#hd-arrow)" />
  );
}

export function HealthcareDashboardMap() {
  const W = 1280;
  const H = 1080;
  const cx = W / 2;

  const Y = {
    source: 30,
    intake: 130,
    silver: 230,
    forecast: 330,
    generate: 430,
    lanes: 560,
    laneH: 230,
    orchestrator: 870,
    composite: 990,
  };

  const laneW = 360;
  const laneGap = 40;
  const totalLanesW = laneW * 3 + laneGap * 2;
  const lanesStartX = (W - totalLanesW) / 2;
  const lane1X = lanesStartX;
  const lane2X = lanesStartX + laneW + laneGap;
  const lane3X = lanesStartX + 2 * (laneW + laneGap);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label="Healthcare dashboard ops 16-evaluator architecture map">
      <defs>
        <marker id="hd-arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(125,211,252,0.65)" />
        </marker>
      </defs>

      {/* Tier 1: Data sources */}
      <Cluster x={cx - 380} y={Y.source} w={760} h={80}
        title="Data Sources" border={BORDER_PANEL}
        subtitle="CMS Medicaid SDUD · US Census ACS · FDA Orange Book">
        <Chip x={cx - 360} y={Y.source + 46} w={220} label="data.medicaid.gov · SDUD 2020-2025" />
        <Chip x={cx - 120} y={Y.source + 46} w={140} label="US Census ACS5" />
        <Chip x={cx + 40}  y={Y.source + 46} w={180} label="FDA Orange Book (brand/generic)" />
      </Cluster>
      <Arrow x1={cx} y1={Y.source + 80} x2={cx} y2={Y.intake} />

      {/* Tier 2: Bronze ingest */}
      <Cluster x={cx - 320} y={Y.intake} w={640} h={70}
        title="Bronze ingest" border={BORDER_PANEL}
        subtitle="sdud_pull.py · year-partitioned, gzip → Azure Blob">
        <Chip x={cx - 300} y={Y.intake + 38} w={620} label="bronze/sdud/year=YYYY/data.csv.gz · 31M rows total" />
      </Cluster>
      <Arrow x1={cx} y1={Y.intake + 70} x2={cx} y2={Y.silver} />

      {/* Tier 3: Silver DuckDB */}
      <Cluster x={cx - 320} y={Y.silver} w={640} h={70}
        title="Silver star schema" border={BORDER_PANEL}
        subtitle="sdud_silver.py · DuckDB → Parquet/ZSTD">
        <Chip x={cx - 300} y={Y.silver + 38} w={140} label="fact_sdud" />
        <Chip x={cx - 150} y={Y.silver + 38} w={140} label="dim_state" />
        <Chip x={cx} y={Y.silver + 38} w={140} label="dim_drug" />
        <Chip x={cx + 150} y={Y.silver + 38} w={140} label="dim_date" />
      </Cluster>
      <Arrow x1={cx} y1={Y.silver + 70} x2={cx} y2={Y.forecast} />

      {/* Tier 4: Forecast */}
      <Cluster x={cx - 320} y={Y.forecast} w={640} h={70}
        title="Forecast" border={BORDER_PANEL}
        subtitle="forecast.py · SARIMA + Prophet ensemble · 12-mo horizon">
        <Chip x={cx - 300} y={Y.forecast + 38} w={620} label="fact_forecast.parquet · point / lo80 / hi80 / mape_holdout" />
      </Cluster>
      <Arrow x1={cx} y1={Y.forecast + 70} x2={cx} y2={Y.generate} />

      {/* Tier 5: Generate */}
      <Cluster x={cx - 380} y={Y.generate} w={760} h={100}
        title="Generate" border={BORDER_PANEL}
        subtitle="Claude → DAX measures · TOM model.bim · page layout · narrative">
        <Chip x={cx - 360} y={Y.generate + 46} w={170} label="services/dax/templates.py" />
        <Chip x={cx - 180} y={Y.generate + 46} w={170} label="dax/generate.py (Claude)" />
        <Chip x={cx}       y={Y.generate + 46} w={170} label="powerbi/model_build.py" />
        <Chip x={cx + 180} y={Y.generate + 46} w={170} label="powerbi/layout_build.py" />

        <Chip x={cx - 360} y={Y.generate + 76} w={350} label="10 DAX templates · cost / forecast / Pareto / brand-mix" />
        <Chip x={cx}       y={Y.generate + 76} w={350} label="5 pages · 17 visuals · WCAG-AA color pairs" />
      </Cluster>
      <Arrow x1={cx} y1={Y.generate + 100} x2={cx} y2={Y.lanes} />

      {/* Tier 6: Three parallel evaluator lanes */}
      <Cluster x={lane1X} y={Y.lanes} w={laneW} h={Y.laneH}
        title="Deterministic · 8" border={BORDER_DET}
        subtitle="Python · cheap, fast, byte-stable">
        {[
          "dax_syntax",
          "dax_perf",
          "model_design",
          "pii_leak",
          "accessibility",
          "governance",
          "refresh_health",
          "template_fit",
        ].map((n, i) => (
          <Chip key={n} x={lane1X + 16} y={Y.lanes + 50 + i * 22} w={laneW - 32} label={n} accent="#a7f3d0" />
        ))}
      </Cluster>

      <Cluster x={lane2X} y={Y.lanes} w={laneW} h={Y.laneH}
        title="LLM Judges · 5" border={BORDER_LLM}
        subtitle="Claude · qualitative rubrics">
        {[
          "business_narrative",
          "visualization_choice",
          "forecast_method",
          "dax_review",
          "domain_relevance",
        ].map((n, i) => (
          <Chip key={n} x={lane2X + 16} y={Y.lanes + 50 + i * 22} w={laneW - 32} label={n} accent="#e9d5ff" />
        ))}
      </Cluster>

      <Cluster x={lane3X} y={Y.lanes} w={laneW} h={Y.laneH}
        title="Paired Auditors · 3" border={BORDER_AUD}
        subtitle="Scalable oversight on deterministic findings">
        {[
          "dax_auditor",
          "model_auditor",
          "narrative_auditor",
        ].map((n, i) => (
          <Chip key={n} x={lane3X + 16} y={Y.lanes + 50 + i * 22} w={laneW - 32} label={n} accent="#fde68a" />
        ))}
      </Cluster>

      {/* Lane convergence into orchestrator */}
      <Arrow x1={lane1X + laneW / 2} y1={Y.lanes + Y.laneH} x2={cx} y2={Y.orchestrator} />
      <Arrow x1={lane2X + laneW / 2} y1={Y.lanes + Y.laneH} x2={cx} y2={Y.orchestrator} />
      <Arrow x1={lane3X + laneW / 2} y1={Y.lanes + Y.laneH} x2={cx} y2={Y.orchestrator} />

      {/* Tier 7: Orchestrator */}
      <Cluster x={cx - 280} y={Y.orchestrator} w={560} h={70}
        title="judge-orchestrator" border={BORDER_PANEL}
        subtitle="Claude subagent · merges 16 results → severity-banded AUDIT.md">
        <Chip x={cx - 260} y={Y.orchestrator + 38} w={520} label="audit_runner.py --merge → audit.md · composite_scorecard.md" />
      </Cluster>
      <Arrow x1={cx} y1={Y.orchestrator + 70} x2={cx} y2={Y.composite} />

      {/* Tier 8: Verdict */}
      <Cluster x={cx - 220} y={Y.composite} w={440} h={70}
        title="Composite verdict" border={BORDER_PANEL}
        subtitle="Weighted sum · banded · Ship / Tighten / Re-work">
        <Chip x={cx - 200} y={Y.composite + 38} w={130} label="Ship ≥ 0.85" accent="#a7f3d0" />
        <Chip x={cx - 65}  y={Y.composite + 38} w={130} label="Tighten 0.70-0.85" accent="#fde68a" />
        <Chip x={cx + 70}  y={Y.composite + 38} w={130} label="Re-work < 0.70" accent="#fca5a5" />
      </Cluster>
    </svg>
  );
}
