"use client";

const BLUE = "#60a5fa";
const TEAL = "#14b8a6";
const VIOLET = "#a78bfa";
const AMBER = "#f59e0b";
const PINK = "#f472b6";
const STROKE = "rgba(255,255,255,0.22)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.55)";
const SUBTLE = "rgba(255,255,255,0.32)";

const CHIP_H = 26;
const CHIP_PAD_X = 10;
const CHIP_GAP = 6;
const CHAR_W = 6.6; // monospace approx

interface ChipProps {
  x: number;
  y: number;
  label: string;
  accent: string;
  w?: number;
}

function Chip({ x, y, label, accent, w }: ChipProps) {
  const width = w ?? Math.max(70, Math.ceil(label.length * CHAR_W) + CHIP_PAD_X * 2);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={CHIP_H}
        rx={6}
        fill={`${accent}1A`}
        stroke={accent}
        strokeOpacity={0.5}
      />
      <text
        x={x + width / 2}
        y={y + 17}
        textAnchor="middle"
        fontSize={11}
        fill={TEXT}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {label}
      </text>
    </g>
  );
}

interface ClusterProps {
  x: number;
  y: number;
  w: number;
  title: string;
  meta?: string;
  accent: string;
  chips: string[];
  output?: string;
}

// Returns { height } so callers can chain vertically.
function Cluster({ x, y, w, title, meta, accent, chips, output }: ClusterProps) {
  const innerPadX = 16;
  const titleH = 36;
  const chipRowY = y + titleH + 8;

  // Lay out chips into rows that fit inside the cluster width.
  const maxRowW = w - innerPadX * 2;
  const rows: { label: string; cw: number }[][] = [[]];
  let rowW = 0;
  for (const label of chips) {
    const cw = Math.max(70, Math.ceil(label.length * CHAR_W) + CHIP_PAD_X * 2);
    const next = rowW === 0 ? cw : rowW + CHIP_GAP + cw;
    if (next > maxRowW) {
      rows.push([{ label, cw }]);
      rowW = cw;
    } else {
      rows[rows.length - 1].push({ label, cw });
      rowW = next;
    }
  }
  const rowCount = rows.length;
  const chipsBlockH = rowCount * CHIP_H + (rowCount - 1) * CHIP_GAP;
  const outputH = output ? 22 : 0;
  const h = titleH + 8 + chipsBlockH + 12 + outputH + 14;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill="rgba(255,255,255,0.03)"
        stroke={accent}
        strokeOpacity={0.5}
      />
      <text x={x + innerPadX} y={y + 22} fontSize={13} fontWeight={700} fill={accent} letterSpacing="0.06em">
        {title.toUpperCase()}
      </text>
      {meta && (
        <text x={x + w - innerPadX} y={y + 22} textAnchor="end" fontSize={11} fill={MUTED}>
          {meta}
        </text>
      )}

      {rows.map((row, ri) => {
        const rowYy = chipRowY + ri * (CHIP_H + CHIP_GAP);
        const rowTotal = row.reduce((s, c, i) => s + c.cw + (i > 0 ? CHIP_GAP : 0), 0);
        let cx = x + (w - rowTotal) / 2;
        return row.map((c) => {
          const node = <Chip key={`${title}-${c.label}`} x={cx} y={rowYy} label={c.label} accent={accent} w={c.cw} />;
          cx += c.cw + CHIP_GAP;
          return node;
        });
      })}

      {output && (
        <text
          x={x + w / 2}
          y={y + h - 10}
          textAnchor="middle"
          fontSize={11}
          fill={SUBTLE}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          → {output}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={STROKE}
      strokeWidth={1.5}
      markerEnd="url(#arrowhead)"
    />
  );
}

export function ProposalJudgeMap() {
  // ---- Layout constants ----
  const VBW = 1280;
  const cx = VBW / 2;

  // Single-column clusters (centered)
  const colW = 640;
  const colX = cx - colW / 2;

  // Cluster Y origins (computed manually for spacing clarity)
  const yInput = 16;             // RFP PDF chip
  const inputH = 36;

  const yIntake = yInput + inputH + 26;
  const intakeH = 36 + 8 + (CHIP_H * 1) + 12 + 22 + 14; // ~1 row, w/ output
  // We will let Cluster auto-size; estimate spacing using guesses, then verify by eye.
  // For arrows we use computed Y guesses; final viewBox tall enough for the worst case.

  // We'll just place absolute y values for arrows and rely on cluster intrinsic height (clusters are ~98–124px).

  // Realistic spacing — pick generous gaps:
  const Y = {
    rfp: 16,
    intake: 90,
    render: 230,
    audit: 380,
    lanes: 520,
    orchestrator: 800,
    composite: 940,
  };

  // RFP chip width
  const rfpW = 160;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${VBW} 1080`}
        className="w-full h-auto"
        style={{ maxWidth: "100%", minWidth: 760 }}
        role="img"
        aria-label="AI Proposal Intelligence — Judge pipeline architecture, micro-component view"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={STROKE} />
          </marker>
        </defs>

        {/* ===== INPUT ===== */}
        <g>
          <rect
            x={cx - rfpW / 2}
            y={Y.rfp}
            width={rfpW}
            height={36}
            rx={8}
            fill={`${AMBER}1A`}
            stroke={AMBER}
            strokeOpacity={0.6}
          />
          <text x={cx} y={Y.rfp + 23} textAnchor="middle" fontSize={13} fontWeight={700} fill={TEXT}>
            RFP PDF
          </text>
        </g>
        <Arrow x1={cx} y1={Y.rfp + 36} x2={cx} y2={Y.intake} />

        {/* ===== INTAKE ===== */}
        <Cluster
          x={colX}
          y={Y.intake}
          w={colW}
          title="rfp-intake"
          meta="extract scope + criteria"
          accent={AMBER}
          chips={["pdf_to_text", "criteria_extractor", "submittal_scanner", "disqualifier_detector"]}
          output="compliance_matrix.json"
        />
        <Arrow x1={cx} y1={Y.intake + 130} x2={cx} y2={Y.render} />

        {/* ===== RENDER ===== */}
        <Cluster
          x={colX}
          y={Y.render}
          w={colW}
          title="render_proposal.py"
          meta="compose Cyfi DOCX drafts"
          accent={BLUE}
          chips={["section_composer", "past_perf_picker", "pricing_calculator", "docx_writer"]}
          output="Cyfi_Technical.docx · Cyfi_Pricing.docx"
        />
        <Arrow x1={cx} y1={Y.render + 130} x2={cx} y2={Y.audit} />

        {/* ===== AUDIT PLAN ===== */}
        <Cluster
          x={colX}
          y={Y.audit}
          w={colW}
          title="audit_runner.py --plan"
          meta="schedule judges"
          accent={BLUE}
          chips={["matrix_reader", "judge_selector", "parallelism_planner"]}
          output="audit_plan.json"
        />

        {/* Fan-out to three lanes */}
        <Arrow x1={cx - 200} y1={Y.audit + 124} x2={40 + 200} y2={Y.lanes} />
        <Arrow x1={cx} y1={Y.audit + 124} x2={cx} y2={Y.lanes} />
        <Arrow x1={cx + 200} y1={Y.audit + 124} x2={VBW - 40 - 200} y2={Y.lanes} />

        {/* ===== LANES (parallel) ===== */}
        <Cluster
          x={40}
          y={Y.lanes}
          w={400}
          title="Deterministic · Python"
          meta="11 judges"
          accent={TEAL}
          chips={[
            "pii_leak",
            "unresolved_tokens",
            "section_length",
            "named_personnel",
            "pricing_math",
            "formatting_alignment",
            "styling",
            "compliance_coverage",
            "past_perf_coverage",
            "prose_style",
            "onedrive_topology_drift",
          ]}
        />
        <Cluster
          x={(VBW - 400) / 2}
          y={Y.lanes}
          w={400}
          title="LLM Judges · Claude"
          meta="5 judges"
          accent={VIOLET}
          chips={[
            "technical",
            "executive_summary",
            "pricing",
            "past_perf",
            "wmbe_narrative",
          ]}
        />
        <Cluster
          x={VBW - 40 - 400}
          y={Y.lanes}
          w={400}
          title="Paired Auditors · verify"
          meta="5 auditors"
          accent={PINK}
          chips={[
            "styling",
            "formatting",
            "named_personnel",
            "past_perf",
            "section_length",
          ]}
        />

        {/* Converge — lane height varies (deterministic lane is tallest with 11 chips) */}
        <Arrow x1={240} y1={Y.lanes + 230} x2={cx - 120} y2={Y.orchestrator} />
        <Arrow x1={cx} y1={Y.lanes + 230} x2={cx} y2={Y.orchestrator} />
        <Arrow x1={VBW - 240} y1={Y.lanes + 230} x2={cx + 120} y2={Y.orchestrator} />

        {/* ===== ORCHESTRATOR ===== */}
        <Cluster
          x={colX}
          y={Y.orchestrator}
          w={colW}
          title="judge-orchestrator"
          meta="merge findings"
          accent={AMBER}
          chips={["xml_collector", "finding_merger", "audit_md_writer"]}
          output="AUDIT.md"
        />
        <Arrow x1={cx} y1={Y.orchestrator + 130} x2={cx} y2={Y.composite} />

        {/* ===== COMPOSITE ===== */}
        <Cluster
          x={colX}
          y={Y.composite}
          w={colW}
          title="audit_runner.py --merge"
          meta="weighted bid-readiness"
          accent={TEAL}
          chips={["weighted_aggregator", "verdict_renderer"]}
          output="COMPOSITE_SCORECARD.md"
        />
      </svg>
    </div>
  );
}
