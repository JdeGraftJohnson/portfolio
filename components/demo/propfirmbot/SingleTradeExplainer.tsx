"use client";

import { useState } from "react";

interface Trade {
  day: string;
  time_et: string;
  side: string;
  entry: number;
  stop: number;
  tp: number;
  outcome: string;
  pl_usd: number;
}

interface Props {
  trades: Trade[];
  decimals: number;
}

const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#60a5fa";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.55)";

export function SingleTradeExplainer({ trades, decimals }: Props) {
  const [idx, setIdx] = useState(Math.floor(trades.length / 2));
  const t = trades[idx];
  if (!t) return null;

  const isBuy = t.side === "BUY";
  // Buy: stop < entry < tp.  Sell: tp < entry < stop.
  const high = isBuy ? t.tp : t.stop;
  const low = isBuy ? t.stop : t.tp;
  const span = high - low;

  const W = 720;
  const H = 220;
  const padL = 140;
  const padR = 140;
  const padT = 30;
  const padB = 30;
  const innerH = H - padT - padB;

  const yOf = (p: number) => padT + innerH - ((p - low) / span) * innerH;

  const yTp = yOf(t.tp);
  const yEntry = yOf(t.entry);
  const yStop = yOf(t.stop);

  const fmt = (v: number) => v.toFixed(decimals);
  const won = t.outcome === "tp";

  // Risk-to-reward
  const stopDist = Math.abs(t.entry - t.stop);
  const tpDist = Math.abs(t.tp - t.entry);
  const rr = (tpDist / stopDist).toFixed(2);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>
          Pick a trade
        </span>
        <input
          type="range"
          min={0}
          max={trades.length - 1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="flex-1 min-w-[180px]"
          style={{ accentColor: BLUE }}
        />
        <span className="text-xs font-mono" style={{ color: TEXT }}>
          #{idx + 1} of {trades.length} · {t.day}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ maxWidth: "100%", minWidth: 520, background: "rgba(0,0,0,0.25)", borderRadius: 12 }}
        role="img"
        aria-label="Single-trade explainer showing entry, stop-loss, and take-profit levels"
      >
        {/* Vertical price axis line */}
        <line x1={W / 2} y1={padT - 10} x2={W / 2} y2={H - padB + 10} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />

        {/* TP rung */}
        <line x1={padL} y1={yTp} x2={W - padR} y2={yTp} stroke={GREEN} strokeWidth={2} />
        <text x={padL - 12} y={yTp + 5} textAnchor="end" fontSize={12} fontWeight={600} fill={GREEN}>
          Take-Profit
        </text>
        <text x={W - padR + 12} y={yTp + 5} fontSize={12} fill={GREEN} fontFamily="ui-monospace, Menlo, monospace">
          {fmt(t.tp)}
        </text>

        {/* Entry rung */}
        <line x1={padL} y1={yEntry} x2={W - padR} y2={yEntry} stroke={BLUE} strokeWidth={2} strokeDasharray="6 4" />
        <text x={padL - 12} y={yEntry + 5} textAnchor="end" fontSize={12} fontWeight={600} fill={BLUE}>
          Entry
        </text>
        <text x={W - padR + 12} y={yEntry + 5} fontSize={12} fill={BLUE} fontFamily="ui-monospace, Menlo, monospace">
          {fmt(t.entry)}
        </text>

        {/* SL rung */}
        <line x1={padL} y1={yStop} x2={W - padR} y2={yStop} stroke={RED} strokeWidth={2} />
        <text x={padL - 12} y={yStop + 5} textAnchor="end" fontSize={12} fontWeight={600} fill={RED}>
          Stop-Loss
        </text>
        <text x={W - padR + 12} y={yStop + 5} fontSize={12} fill={RED} fontFamily="ui-monospace, Menlo, monospace">
          {fmt(t.stop)}
        </text>

        {/* Side + outcome badge in the middle */}
        <g transform={`translate(${W / 2}, ${padT - 8})`}>
          <text textAnchor="middle" fontSize={11} fill={MUTED} fontFamily="ui-monospace, Menlo, monospace">
            {isBuy ? "Buy — profit if price rises" : "Sell — profit if price falls"}
          </text>
        </g>

        {/* Vertical risk/reward markers between rungs */}
        <g>
          {/* Reward zone */}
          <rect
            x={W / 2 - 8}
            y={isBuy ? yTp : yEntry}
            width={16}
            height={Math.abs(yEntry - yTp)}
            fill={GREEN}
            opacity={0.18}
          />
          {/* Risk zone */}
          <rect
            x={W / 2 - 8}
            y={isBuy ? yEntry : yStop}
            width={16}
            height={Math.abs(yStop - yEntry)}
            fill={RED}
            opacity={0.18}
          />
        </g>

        {/* Outcome label */}
        <g transform={`translate(${W / 2}, ${H - padB + 22})`}>
          <text textAnchor="middle" fontSize={12} fontWeight={700} fill={won ? GREEN : RED}>
            {won ? "Result: Take-Profit hit" : "Result: Stop-Loss hit"}
            <tspan dx={6} fontSize={11} fill={MUTED} fontWeight={400}>
              ({t.pl_usd >= 0 ? "+" : ""}${t.pl_usd.toFixed(2)})
            </tspan>
          </text>
        </g>
      </svg>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Cell title="Risk per trade" value={`${fmt(stopDist)} points`} hint="Stop-Loss distance from Entry" />
        <Cell title="Reward target" value={`${fmt(tpDist)} points`} hint="Take-Profit distance from Entry" />
        <Cell title="Risk-to-Reward ratio" value={`1 : ${rr}`} hint={`For every $1 risked, target $${rr}`} />
      </div>
    </div>
  );
}

function Cell({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{title}</p>
      <p className="text-base font-bold font-mono mb-1" style={{ color: TEXT }}>{value}</p>
      <p className="text-[11px]" style={{ color: MUTED }}>{hint}</p>
    </div>
  );
}
