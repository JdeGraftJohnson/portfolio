"use client";

import { useMemo, useState } from "react";

interface Trade {
  day: string;
  time_et: string;
  side: string;
  entry: number;
  stop: number;
  tp: number;
  outcome: string;
  pl_usd: number;
  killzone: string;
}

interface Bar {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  bars: Bar[];
  trades: Trade[];
  accent: string;
  decimals: number;
}

const GREEN = "#22c55e";       // candle up
const RED = "#ef4444";         // candle down + SL
const TP_GREEN = "#34d399";    // TP line
const ENTRY_BLUE = "#60a5fa";  // entry line
const MUTED = "rgba(255,255,255,0.55)";
const TEXT = "rgba(255,255,255,0.92)";

export function PriceChart({ bars, trades, accent, decimals }: Props) {
  const [hoverTradeIdx, setHoverTradeIdx] = useState<number | null>(null);

  // Geometry
  const W = 960;
  const H = 440;
  const padL = 72;
  const padR = 28;
  const padT = 24;
  const padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Y-scale: full envelope of all bars (and active trade SL/TP if any)
  const { minY, maxY } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const b of bars) {
      if (b.low < lo) lo = b.low;
      if (b.high > hi) hi = b.high;
    }
    // pad 5%
    const pad = (hi - lo) * 0.06;
    return { minY: lo - pad, maxY: hi + pad };
  }, [bars]);
  const yRange = Math.max(maxY - minY, 1);

  const barW = innerW / Math.max(bars.length, 1);
  const candleBodyW = Math.max(barW * 0.7, 3);

  const xOfBar = (i: number) => padL + i * barW + barW / 2;
  const yOfPrice = (p: number) => padT + innerH - ((p - minY) / yRange) * innerH;

  // Day → bar index
  const dayToIdx = useMemo(() => {
    const m: Record<string, number> = {};
    bars.forEach((b, i) => { m[b.day] = i; });
    return m;
  }, [bars]);

  // Marker positions per trade (group by day handled at render time)
  const tradeMarkers = trades.map((t, idx) => ({
    ...t,
    idx,
    x: xOfBar(dayToIdx[t.day] ?? 0),
    y: yOfPrice(t.entry),
  }));

  // Y-axis ticks (6)
  const yTicks: number[] = [];
  for (let k = 0; k <= 5; k++) yTicks.push(minY + (yRange * k) / 5);

  // X-axis ticks: every Nth day so we get ~6 labels
  const xLabelEvery = Math.max(1, Math.ceil(bars.length / 6));

  const hoverTrade = hoverTradeIdx !== null ? tradeMarkers[hoverTradeIdx] : null;

  // Format helper
  const fmt = (v: number) => v.toFixed(decimals);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ maxWidth: "100%", minWidth: 720, background: "rgba(0,0,0,0.30)", borderRadius: 12 }}
        role="img"
        aria-label="Candlestick chart with trade entry, stop-loss, and take-profit overlays"
      >
        <defs>
          <linearGradient id="pc-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
          </linearGradient>
        </defs>
        <rect x={padL} y={padT} width={innerW} height={innerH} fill="url(#pc-bg)" />

        {/* Y grid + labels */}
        {yTicks.map((v, i) => (
          <g key={`yt-${i}`}>
            <line
              x1={padL}
              y1={yOfPrice(v)}
              x2={W - padR}
              y2={yOfPrice(v)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={yOfPrice(v) + 4}
              textAnchor="end"
              fontSize={10}
              fontFamily="ui-monospace, Menlo, monospace"
              fill={MUTED}
            >
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* X-axis labels (dates) */}
        {bars.map((b, i) => {
          if (i % xLabelEvery !== 0 && i !== bars.length - 1) return null;
          return (
            <text
              key={`xt-${i}`}
              x={xOfBar(i)}
              y={H - 24}
              textAnchor="middle"
              fontSize={10}
              fontFamily="ui-monospace, Menlo, monospace"
              fill={MUTED}
            >
              {b.day.slice(5)}
            </text>
          );
        })}

        {/* Candlesticks */}
        {bars.map((b, i) => {
          const x = xOfBar(i);
          const up = b.close >= b.open;
          const fill = up ? GREEN : RED;
          const bodyTop = yOfPrice(Math.max(b.open, b.close));
          const bodyBottom = yOfPrice(Math.min(b.open, b.close));
          const bodyH = Math.max(bodyBottom - bodyTop, 1);
          return (
            <g key={`bar-${i}`}>
              {/* Wick */}
              <line x1={x} y1={yOfPrice(b.high)} x2={x} y2={yOfPrice(b.low)} stroke={fill} strokeWidth={1.5} />
              {/* Body */}
              <rect
                x={x - candleBodyW / 2}
                y={bodyTop}
                width={candleBodyW}
                height={bodyH}
                fill={fill}
                stroke={fill}
              />
            </g>
          );
        })}

        {/* Hovered trade — horizontal SL, Entry, TP lines + side arrow */}
        {hoverTrade && (
          <g>
            <line
              x1={padL}
              y1={yOfPrice(hoverTrade.stop)}
              x2={W - padR}
              y2={yOfPrice(hoverTrade.stop)}
              stroke={RED}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text x={W - padR + 2} y={yOfPrice(hoverTrade.stop) + 3} fontSize={10} fill={RED} fontFamily="ui-monospace, Menlo, monospace">
              SL {fmt(hoverTrade.stop)}
            </text>

            <line
              x1={padL}
              y1={yOfPrice(hoverTrade.entry)}
              x2={W - padR}
              y2={yOfPrice(hoverTrade.entry)}
              stroke={ENTRY_BLUE}
              strokeWidth={1.5}
              strokeDasharray="2 3"
            />
            <text x={W - padR + 2} y={yOfPrice(hoverTrade.entry) + 3} fontSize={10} fill={ENTRY_BLUE} fontFamily="ui-monospace, Menlo, monospace">
              ENT {fmt(hoverTrade.entry)}
            </text>

            <line
              x1={padL}
              y1={yOfPrice(hoverTrade.tp)}
              x2={W - padR}
              y2={yOfPrice(hoverTrade.tp)}
              stroke={TP_GREEN}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text x={W - padR + 2} y={yOfPrice(hoverTrade.tp) + 3} fontSize={10} fill={TP_GREEN} fontFamily="ui-monospace, Menlo, monospace">
              TP {fmt(hoverTrade.tp)}
            </text>
          </g>
        )}

        {/* Trade markers — small triangles above/below the bar */}
        {tradeMarkers.map((m) => {
          const isBuy = m.side === "BUY";
          const isHover = hoverTradeIdx === m.idx;
          const fill = m.outcome === "tp" ? TP_GREEN : RED;
          const size = isHover ? 8 : 6;
          // Buy = upward triangle below entry; Sell = downward triangle above entry
          const yArr = isBuy ? m.y + 10 : m.y - 10;
          const tri = isBuy
            ? `${m.x},${yArr - size} ${m.x - size},${yArr + size} ${m.x + size},${yArr + size}`
            : `${m.x},${yArr + size} ${m.x - size},${yArr - size} ${m.x + size},${yArr - size}`;
          return (
            <g
              key={`tm-${m.idx}`}
              onMouseEnter={() => setHoverTradeIdx(m.idx)}
              onMouseLeave={() => setHoverTradeIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <polygon points={tri} fill={fill} stroke={isHover ? TEXT : "transparent"} strokeWidth={1.5} />
            </g>
          );
        })}

        {/* Hover detail box (top-right corner of chart) */}
        {hoverTrade && (
          <g>
            <rect
              x={padL + 12}
              y={padT + 12}
              width={244}
              height={132}
              rx={8}
              fill="rgba(10,10,26,0.96)"
              stroke="rgba(96,165,250,0.45)"
            />
            <text x={padL + 24} y={padT + 32} fontSize={11} fill={MUTED} fontFamily="ui-monospace, Menlo, monospace">
              {hoverTrade.day} · {hoverTrade.time_et} ET
            </text>
            <text x={padL + 24} y={padT + 52} fontSize={13} fontWeight={700} fill={hoverTrade.side === "BUY" ? GREEN : RED}>
              {hoverTrade.side}
            </text>
            <text x={padL + 60} y={padT + 52} fontSize={12} fill={TEXT} fontFamily="ui-monospace, Menlo, monospace">
              @ {fmt(hoverTrade.entry)}
            </text>
            <text x={padL + 24} y={padT + 72} fontSize={11} fontFamily="ui-monospace, Menlo, monospace" fill={MUTED}>
              <tspan fill={RED}>SL </tspan>{fmt(hoverTrade.stop)}
              <tspan dx={10} fill={TP_GREEN}>TP </tspan>{fmt(hoverTrade.tp)}
            </text>
            <text x={padL + 24} y={padT + 92} fontSize={11} fill={MUTED}>
              outcome:
              <tspan dx={4} fill={hoverTrade.outcome === "tp" ? TP_GREEN : RED} fontWeight={700}>
                {hoverTrade.outcome.toUpperCase()}
              </tspan>
            </text>
            <text x={padL + 24} y={padT + 110} fontSize={11} fill={MUTED}>
              killzone: <tspan fill={TEXT} fontFamily="ui-monospace, Menlo, monospace">{hoverTrade.killzone}</tspan>
            </text>
            <text x={padL + 24} y={padT + 130} fontSize={13} fontWeight={700} fill={hoverTrade.pl_usd >= 0 ? TP_GREEN : RED}>
              {hoverTrade.pl_usd >= 0 ? "+" : ""}${hoverTrade.pl_usd.toFixed(2)}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${padL}, ${H - 12})`}>
          <line x1={0} y1={-3} x2={12} y2={-3} stroke={ENTRY_BLUE} strokeWidth={1.5} strokeDasharray="2 3" />
          <text x={18} y={0} fontSize={10} fill={MUTED}>entry</text>
          <line x1={56} y1={-3} x2={68} y2={-3} stroke={RED} strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={74} y={0} fontSize={10} fill={MUTED}>stop-loss</text>
          <line x1={128} y1={-3} x2={140} y2={-3} stroke={TP_GREEN} strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={146} y={0} fontSize={10} fill={MUTED}>take-profit</text>
          <polygon points="208,-7 202,-1 214,-1" fill={TP_GREEN} />
          <text x={220} y={0} fontSize={10} fill={MUTED}>BUY win</text>
          <polygon points="266,1 260,-5 272,-5" fill={RED} />
          <text x={280} y={0} fontSize={10} fill={MUTED}>SELL / loss</text>
        </g>
      </svg>
    </div>
  );
}
