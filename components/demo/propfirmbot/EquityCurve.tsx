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

interface Props {
  trades: Trade[];
  accent: string;
}

const GREEN = "#22c55e";
const RED = "#ef4444";
const MUTED = "rgba(255,255,255,0.55)";
const TEXT = "rgba(255,255,255,0.92)";
const GRID = "rgba(255,255,255,0.06)";
const BASELINE = "rgba(255,255,255,0.20)";

export function EquityCurve({ trades, accent }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 960;
  const H = 380;
  const padL = 80;
  const padR = 28;
  const padT = 28;
  const padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Cumulative profit/loss per trade
  const cum = useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const t of trades) {
      acc += t.pl_usd;
      out.push(+acc.toFixed(2));
    }
    return out;
  }, [trades]);

  const { minY, maxY } = useMemo(() => {
    const vals = [0, ...cum];
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = Math.max((hi - lo) * 0.10, 50);
    return { minY: lo - pad / 2, maxY: hi + pad };
  }, [cum]);
  const yRange = Math.max(maxY - minY, 1);

  const xOf = (i: number) => padL + (i / Math.max(trades.length - 1, 1)) * innerW;
  const yOf = (v: number) => padT + innerH - ((v - minY) / yRange) * innerH;

  // Build smoothed area path (closed to baseline) for fill, plus the line on top
  const linePath = cum
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`)
    .join(" ");
  const areaPath = trades.length
    ? `${linePath} L ${xOf(trades.length - 1)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`
    : "";

  // Y ticks (clean dollar values)
  const tickStep = niceStep(yRange / 5);
  const yTicks: number[] = [];
  const startTick = Math.ceil(minY / tickStep) * tickStep;
  for (let v = startTick; v <= maxY; v += tickStep) yTicks.push(v);

  // X ticks (every Nth trade — show date)
  const xTickEvery = Math.max(1, Math.ceil(trades.length / 6));

  // Anchor stats
  const startBalance = 0;
  const endBalance = cum[cum.length - 1] ?? 0;
  const bestTrade = Math.max(...trades.map((t) => t.pl_usd));
  const worstTrade = Math.min(...trades.map((t) => t.pl_usd));
  const peak = Math.max(...cum, 0);
  const trough = Math.min(...cum, 0);

  const hover = hoverIdx !== null ? trades[hoverIdx] : null;
  const hoverCum = hoverIdx !== null ? cum[hoverIdx] : null;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ maxWidth: "100%", minWidth: 720, background: "rgba(0,0,0,0.30)", borderRadius: 12 }}
        role="img"
        aria-label="Cumulative profit and loss over the trading window"
      >
        <defs>
          <linearGradient id="ec-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.30} />
            <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((v, i) => (
          <g key={`yt-${i}`}>
            <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke={GRID} />
            <text
              x={padL - 8}
              y={yOf(v) + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily="ui-monospace, Menlo, monospace"
              fill={MUTED}
            >
              ${v >= 0 ? v : `−${Math.abs(v)}`}
            </text>
          </g>
        ))}

        {/* Zero baseline */}
        <line
          x1={padL}
          y1={yOf(0)}
          x2={W - padR}
          y2={yOf(0)}
          stroke={BASELINE}
          strokeWidth={1.25}
          strokeDasharray="4 4"
        />
        <text x={W - padR - 4} y={yOf(0) - 4} textAnchor="end" fontSize={10} fill={MUTED}>
          $0 starting balance
        </text>

        {/* Area + line */}
        {trades.length > 0 && <path d={areaPath} fill="url(#ec-fill)" />}
        <path d={linePath} fill="none" stroke={accent} strokeWidth={2.5} />

        {/* Anchor labels: start + end */}
        {trades.length > 0 && (
          <g>
            <text x={xOf(0)} y={yOf(0) - 8} fontSize={10} fill={MUTED}>start</text>
            <circle cx={xOf(trades.length - 1)} cy={yOf(endBalance)} r={5} fill={accent} />
            <text
              x={xOf(trades.length - 1) - 8}
              y={yOf(endBalance) - 10}
              textAnchor="end"
              fontSize={12}
              fontWeight={700}
              fill={endBalance >= 0 ? GREEN : RED}
              fontFamily="ui-monospace, Menlo, monospace"
            >
              {endBalance >= 0 ? "+" : ""}${endBalance.toFixed(0)}
            </text>
          </g>
        )}

        {/* Trade dots */}
        {trades.map((t, i) => {
          const cx = xOf(i);
          const cy = yOf(cum[i]);
          const win = t.outcome === "tp";
          const isHover = hoverIdx === i;
          return (
            <g
              key={`pt-${i}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHover ? 7 : 4.5}
                fill={win ? GREEN : RED}
                stroke={isHover ? TEXT : "rgba(0,0,0,0.45)"}
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* X ticks — dates */}
        {trades.map((t, i) => {
          if (i % xTickEvery !== 0 && i !== trades.length - 1) return null;
          return (
            <text
              key={`xt-${i}`}
              x={xOf(i)}
              y={H - 26}
              textAnchor="middle"
              fontSize={10}
              fontFamily="ui-monospace, Menlo, monospace"
              fill={MUTED}
            >
              {t.day.slice(5)}
            </text>
          );
        })}

        {/* Hover detail card */}
        {hover && (
          <g>
            <rect
              x={padL + 14}
              y={padT + 14}
              width={244}
              height={142}
              rx={8}
              fill="rgba(10,10,26,0.96)"
              stroke="rgba(96,165,250,0.45)"
            />
            <text x={padL + 26} y={padT + 34} fontSize={11} fill={MUTED} fontFamily="ui-monospace, Menlo, monospace">
              Trade #{(hoverIdx ?? 0) + 1} · {hover.day}
            </text>
            <text x={padL + 26} y={padT + 54} fontSize={13} fontWeight={700} fill={hover.side === "BUY" ? GREEN : RED}>
              {hover.side === "BUY" ? "Buy" : "Sell"}
            </text>
            <text x={padL + 70} y={padT + 54} fontSize={12} fill={TEXT} fontFamily="ui-monospace, Menlo, monospace">
              entry {hover.entry}
            </text>
            <text x={padL + 26} y={padT + 74} fontSize={11} fontFamily="ui-monospace, Menlo, monospace" fill={MUTED}>
              <tspan fill={RED}>stop </tspan>{hover.stop}
              <tspan dx={10} fill={GREEN}>target </tspan>{hover.tp}
            </text>
            <text x={padL + 26} y={padT + 94} fontSize={11} fill={MUTED}>
              outcome:
              <tspan dx={4} fill={hover.outcome === "tp" ? GREEN : RED} fontWeight={700}>
                {hover.outcome === "tp" ? "Take-Profit hit" : "Stop-Loss hit"}
              </tspan>
            </text>
            <text x={padL + 26} y={padT + 114} fontSize={13} fontWeight={700} fill={hover.pl_usd >= 0 ? GREEN : RED}>
              {hover.pl_usd >= 0 ? "+" : ""}${hover.pl_usd.toFixed(2)}
              <tspan dx={8} fill={MUTED} fontSize={10} fontWeight={400}>
                running total ${hoverCum?.toFixed(0)}
              </tspan>
            </text>
            <text x={padL + 26} y={padT + 134} fontSize={10} fill={MUTED} fontFamily="ui-monospace, Menlo, monospace">
              {hover.time_et} ET · {hover.killzone.replace("kz_", "").replace("_", " ")} session
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${padL}, ${H - 10})`}>
          <circle cx={4} cy={-4} r={4} fill={GREEN} />
          <text x={14} y={0} fontSize={11} fill={MUTED}>winning trade</text>
          <circle cx={114} cy={-4} r={4} fill={RED} />
          <text x={124} y={0} fontSize={11} fill={MUTED}>losing trade</text>
          <line x1={210} y1={-4} x2={232} y2={-4} stroke={accent} strokeWidth={2.5} />
          <text x={238} y={0} fontSize={11} fill={MUTED}>cumulative profit & loss</text>
        </g>
      </svg>

      {/* Anchor stats row below the chart */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
        <Anchor label="Starting balance" value="$0" />
        <Anchor label="Ending balance" value={`${endBalance >= 0 ? "+" : ""}$${endBalance.toFixed(0)}`} accent={endBalance >= 0 ? GREEN : RED} />
        <Anchor label="Best single trade" value={`+$${bestTrade.toFixed(0)}`} accent={GREEN} />
        <Anchor label="Worst single trade" value={`-$${Math.abs(worstTrade).toFixed(0)}`} accent={RED} />
      </div>
    </div>
  );
}

function Anchor({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
      <p className="text-base md:text-lg font-bold font-mono" style={{ color: accent ?? TEXT }}>{value}</p>
    </div>
  );
}

function niceStep(rough: number): number {
  if (rough <= 0) return 100;
  const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
  const r = rough / pow10;
  let step;
  if (r < 1.5) step = 1;
  else if (r < 3) step = 2;
  else if (r < 7) step = 5;
  else step = 10;
  return step * pow10;
}
