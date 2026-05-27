"use client";

const GREEN = "#10b981";
const BLUE = "#60a5fa";
const TEAL = "#14b8a6";
const VIOLET = "#a78bfa";
const AMBER = "#f59e0b";
const PINK = "#f472b6";
const RED = "#f87171";
const STROKE = "rgba(255,255,255,0.22)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.55)";
const SUBTLE = "rgba(255,255,255,0.32)";

const CHIP_H = 26;
const CHIP_PAD_X = 10;
const CHIP_GAP = 6;
const CHAR_W = 6.6;

function Chip({ x, y, label, accent, w }: { x: number; y: number; label: string; accent: string; w?: number }) {
  const width = w ?? Math.max(70, Math.ceil(label.length * CHAR_W) + CHIP_PAD_X * 2);
  return (
    <g>
      <rect x={x} y={y} width={width} height={CHIP_H} rx={6} fill={`${accent}1A`} stroke={accent} strokeOpacity={0.5} />
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

function Cluster({
  x, y, w, title, meta, accent, chips, output,
}: {
  x: number; y: number; w: number; title: string; meta?: string; accent: string; chips: string[]; output?: string;
}) {
  const innerPadX = 16;
  const titleH = 36;
  const chipRowY = y + titleH + 8;
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
      <rect x={x} y={y} width={w} height={h} rx={14} fill="rgba(255,255,255,0.03)" stroke={accent} strokeOpacity={0.5} />
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
        let cxRow = x + (w - rowTotal) / 2;
        return row.map((c) => {
          const node = <Chip key={`${title}-${c.label}`} x={cxRow} y={rowYy} label={c.label} accent={accent} w={c.cw} />;
          cxRow += c.cw + CHIP_GAP;
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
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth={1.5} markerEnd="url(#pfb-arrow)" />;
}

export function PropfirmbotMap() {
  const VBW = 1080;
  const cx = VBW / 2;
  const colW = 700;
  const colX = cx - colW / 2;

  const Y = {
    feeds: 16,
    indicators: 120,
    strategies: 280,
    confluence: 460,
    risk: 600,
    router: 740,
    audit: 880,
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${VBW} 1010`}
        className="w-full h-auto"
        style={{ maxWidth: "100%", minWidth: 760 }}
        role="img"
        aria-label="propfirmbot — strategy stack architecture"
      >
        <defs>
          <marker id="pfb-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={STROKE} />
          </marker>
        </defs>

        {/* Feeds */}
        <Cluster
          x={colX}
          y={Y.feeds}
          w={colW}
          title="Market Data"
          meta="streaming + replay"
          accent={AMBER}
          chips={[
            "BrokerClient (streaming)",
            "Interactive Brokers · ib_insync",
            "replay_csv (backtest)",
          ]}
          output="bar stream · 1m / 5m / 15m"
        />
        <Arrow x1={cx} y1={Y.feeds + 116} x2={cx} y2={Y.indicators} />

        {/* Indicators */}
        <Cluster
          x={colX}
          y={Y.indicators}
          w={colW}
          title="Indicators"
          meta="src/propfirmbot/indicators/"
          accent={TEAL}
          chips={[
            "ema",
            "killzones",
            "synthetic_dxy",
            "session",
            "levels",
            "cohorts",
            "regime",
            "cointegration",
          ]}
        />
        <Arrow x1={cx} y1={Y.indicators + 136} x2={cx} y2={Y.strategies} />

        {/* Strategy registry */}
        <Cluster
          x={colX}
          y={Y.strategies}
          w={colW}
          title="Strategy Registry"
          meta="src/propfirmbot/strategy/"
          accent={VIOLET}
          chips={[
            "bdm_orb",
            "dxy_orb",
            "mgc_vcp",
            "mgc_liquidity_sweep",
            "mgc_fibonacci",
            "mgc_session_reversal",
            "macro_consolidation",
            "mgc_regime_align",
            "mgc_regime_pullback",
            "level_touch",
          ]}
          output="emits Play(side, entry, stop, tp, qty, ctx)"
        />
        <Arrow x1={cx} y1={Y.strategies + 156} x2={cx} y2={Y.confluence} />

        {/* Confluence gate */}
        <Cluster
          x={colX}
          y={Y.confluence}
          w={colW}
          title="Confluence Gate"
          meta="veto / scale"
          accent={BLUE}
          chips={["DXY veto", "level_confluence", "ema_alignment", "regime stack"]}
        />
        <Arrow x1={cx} y1={Y.confluence + 116} x2={cx} y2={Y.risk} />

        {/* Risk engine */}
        <Cluster
          x={colX}
          y={Y.risk}
          w={colW}
          title="Risk Engine"
          meta="caps + limits"
          accent={RED}
          chips={["per_trade_cap", "daily_loss_limit", "max_trades_per_day", "qty_scaler"]}
        />
        <Arrow x1={cx} y1={Y.risk + 116} x2={cx} y2={Y.router} />

        {/* Order router */}
        <Cluster
          x={colX}
          y={Y.router}
          w={colW}
          title="Order Router"
          meta="broker abstraction"
          accent={GREEN}
          chips={["BrokerClient (ABC)", "IBKRClient", "paper_account adapter"]}
          output="filled position + bracket OCO"
        />
        <Arrow x1={cx} y1={Y.router + 132} x2={cx} y2={Y.audit} />

        {/* Audit + position tracker */}
        <Cluster
          x={colX}
          y={Y.audit}
          w={colW}
          title="Position Tracker + Audit"
          meta="append-only"
          accent={PINK}
          chips={["position_tracker", "play_log.jsonl", "execution/audit"]}
          output="HTML report · per-play P&L"
        />
      </svg>
    </div>
  );
}
