"use client";

import { useState } from "react";
import { PropfirmbotMap } from "@/components/architecture/PropfirmbotMap";
import { EquityCurve } from "./EquityCurve";
import { SingleTradeExplainer } from "./SingleTradeExplainer";
import { PriceChart } from "./PriceChart";
import { HypotheticalDisclaimer } from "./HypotheticalDisclaimer";
import { InfoTip, TIPS } from "./InfoTip";

const BLUE = "#60a5fa";
const GREEN = "#34d399";
const RED = "#f87171";
const MUTED = "rgba(255,255,255,0.55)";

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

interface SubsetStats {
  n_trades: number;
  wins: number;
  losses: number;
  win_rate: string;
  gross_usd: string;
  net_usd_after_commission: string;
  avg_per_trade: string;
}

interface Instrument {
  id: string;
  label: string;
  sublabel: string;
  accent: string;
  description: string;
  contract: string;
  tick_spec: string;
  n_trades: number;
  trades: Trade[];
  ohlc: Bar[];
  chart_window: { start: string; end: string; days: number };
  subset_filter: string;
  subset_stats: SubsetStats;
}

interface Manifest {
  strategy: string;
  strategy_long_name: string;
  description: string;
  framework: {
    indicators: string[];
    confluence_filters: string[];
    risk_engine: string[];
    brokers_supported: string[];
  };
  instruments: Instrument[];
  notes: string;
}

function parseUsd(s: string): number {
  const m = s.match(/-?\$?\+?(-?[\d,]+(?:\.\d+)?)/);
  if (!m) return 0;
  const sign = s.includes("-") ? -1 : 1;
  return sign * Math.abs(Number(m[1].replace(/,/g, "")));
}

// Map an indicator code id to its TIPS key so we can wrap chips with tooltips.
const INDICATOR_TIPS: Record<string, keyof typeof TIPS> = {
  ema: "EMA",
  killzones: "KILLZONE",
  synthetic_dxy: "SYNTHETIC_DXY",
  session: "SESSION",
  levels: "LEVELS",
  cohorts: "COHORTS",
  regime: "REGIME",
  cointegration: "COINTEGRATION",
};

const INDICATOR_LABELS: Record<string, string> = {
  ema: "Exponential Moving Average",
  killzones: "ICT Killzones",
  synthetic_dxy: "Synthetic US Dollar Index",
  session: "Trading Session",
  levels: "Reference Levels",
  cohorts: "Cohort Analysis",
  regime: "Market Regime",
  cointegration: "Cointegration",
};

const FILTER_TIPS: Record<string, keyof typeof TIPS> = {
  "DXY veto": "DXY",
  "level confluence": "LEVELS",
  "EMA alignment": "EMA",
};

const FILTER_LABELS: Record<string, string> = {
  "DXY veto": "US Dollar Index veto",
  "level confluence": "Reference-level confluence",
  "EMA alignment": "Exponential moving average alignment",
};

export function StrategyLab({ manifest }: { manifest: Manifest }) {
  const [activeId, setActiveId] = useState(manifest.instruments[0].id);
  const [showArch, setShowArch] = useState(false);
  const [showPriceChart, setShowPriceChart] = useState(false);
  const active = manifest.instruments.find((i) => i.id === activeId)!;
  const decimals = active.id === "MCL" ? 2 : active.id === "MGC" ? 1 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#05050f", color: "rgba(255,255,255,0.92)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        {/* Header */}
        <a href="/" className="text-sm" style={{ color: MUTED }}>← Back to portfolio</a>
        <h1 className="font-bold text-3xl md:text-4xl mt-3 mb-2">
          propfirmbot <span style={{ color: GREEN }}>—</span>{" "}
          <span style={{ color: "rgba(255,255,255,0.75)" }}>Strategy Lab</span>
        </h1>
        <p className="text-sm md:text-base max-w-3xl mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
          <span className="font-mono" style={{ color: GREEN }}>{manifest.strategy}</span> ·{" "}
          {manifest.strategy_long_name}
        </p>
        <p className="text-sm md:text-base max-w-3xl mb-8" style={{ color: MUTED }}>
          {manifest.description}
        </p>

        <HypotheticalDisclaimer />

        {/* Instrument filter + architecture toggle */}
        <div className="flex flex-wrap gap-2 mb-6">
          {manifest.instruments.map((inst) => {
            const isActive = inst.id === activeId;
            return (
              <button
                key={inst.id}
                onClick={() => setActiveId(inst.id)}
                className="px-4 py-2.5 rounded-lg text-sm transition"
                style={{
                  background: isActive ? `${inst.accent}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? inst.accent : "rgba(255,255,255,0.10)"}`,
                  color: isActive ? inst.accent : "rgba(255,255,255,0.65)",
                }}
              >
                <span className="font-mono mr-2">{inst.id}</span>
                <span>{inst.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setShowArch((v) => !v)}
            className="ml-auto px-4 py-2.5 rounded-lg text-sm transition"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)" }}
          >
            {showArch ? "Hide architecture ↑" : "Show architecture ↓"}
          </button>
        </div>

        {showArch && (
          <div className="mb-8 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <p className="text-xs uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Strategy stack
            </p>
            <PropfirmbotMap />
          </div>
        )}

        {/* Active instrument: contract + subset headline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${active.accent}40` }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: active.accent }}>
              Contract
            </p>
            <h2 className="text-2xl font-bold mb-1">{active.label}</h2>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{active.sublabel}</p>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between"><span style={{ color: MUTED }}>symbol</span><span>{active.contract}</span></div>
              <div className="flex justify-between"><span style={{ color: MUTED }}>tick</span><span>{active.tick_spec}</span></div>
            </div>
            <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.65)" }}>{active.description}</p>
          </div>

          <div className="p-6 rounded-2xl lg:col-span-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>
                <InfoTip term="High-confluence subset">{TIPS.CONFLUENCE}</InfoTip>
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                {active.subset_filter}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Trades" value={String(active.subset_stats.n_trades)} />
              <Stat label="Win / Loss" value={`${active.subset_stats.wins} / ${active.subset_stats.losses}`} />
              <Stat label={<InfoTip term="Win rate">{TIPS.WINRATE}</InfoTip>} value={active.subset_stats.win_rate} accent={GREEN} />
              <Stat label="Average per trade" value={active.subset_stats.avg_per_trade} accent={GREEN} />
              <Stat label={<InfoTip term="Gross profit">{TIPS.GROSS}</InfoTip>} value={active.subset_stats.gross_usd} accent={GREEN} />
              <Stat label={<InfoTip term="Net (after commissions)">{TIPS.NETUSD}</InfoTip>} value={active.subset_stats.net_usd_after_commission} accent={parseUsd(active.subset_stats.net_usd_after_commission) >= 0 ? GREEN : RED} />
            </div>
          </div>
        </div>

        {/* Equity curve — primary chart */}
        <div className="p-6 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>
              <InfoTip term="Cumulative profit & loss">{TIPS.EQUITYCURVE}</InfoTip>{" "}· {active.chart_window.days}-day window · hover any dot for trade detail
            </p>
          </div>
          <EquityCurve trades={active.trades} accent={active.accent} />
          <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.40)" }}>
            Each dot is one trade. Green = the price reached the Take-Profit target. Red = the price reached the Stop-Loss first. The line is the running total of profit and loss since the first trade.
          </p>
        </div>

        {/* Single trade explainer */}
        <div className="p-6 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: MUTED }}>
            Anatomy of a single trade
          </p>
          <p className="text-xs mb-5 max-w-3xl" style={{ color: "rgba(255,255,255,0.60)" }}>
            Every trade has three price levels set in advance: the <span style={{ color: BLUE }}>Entry</span> price where the position opens, the <span style={{ color: RED }}>Stop-Loss</span> that caps the loss if price moves against the trade, and the <span style={{ color: GREEN }}>Take-Profit</span> that closes the trade with a gain. Use the slider to step through real trades from the window above.
          </p>
          <SingleTradeExplainer trades={active.trades} decimals={decimals} />
        </div>

        {/* Optional: price chart (collapsed by default) */}
        <div className="p-6 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>
              Price chart · candlesticks (advanced)
            </p>
            <button
              onClick={() => setShowPriceChart((v) => !v)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)" }}
            >
              {showPriceChart ? "Hide price chart ↑" : "Show price chart ↓"}
            </button>
          </div>
          {showPriceChart && (
            <>
              <p className="text-xs mb-4 max-w-3xl" style={{ color: "rgba(255,255,255,0.55)" }}>
                Each candlestick is one trading day. Green bodies mean the day closed higher than it opened; red bodies mean it closed lower. The thin line above and below each body is the day's price range (the wick). Trade markers sit next to the bar on which the trade fired — hover for entry / stop-loss / take-profit overlays.
              </p>
              <PriceChart
                bars={active.ohlc}
                trades={active.trades}
                accent={active.accent}
                decimals={decimals}
              />
            </>
          )}
        </div>

        {/* Full trade log */}
        <div className="p-6 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: MUTED }}>
            Full trade log · {active.trades.length} trades
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: MUTED }}>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Time (Eastern)</th>
                  <th className="text-left pb-2 font-medium">Direction</th>
                  <th className="text-right pb-2 font-medium">Entry</th>
                  <th className="text-right pb-2 font-medium">
                    <InfoTip term="Stop-Loss">{TIPS.SL}</InfoTip>
                  </th>
                  <th className="text-right pb-2 font-medium">
                    <InfoTip term="Take-Profit">{TIPS.TP}</InfoTip>
                  </th>
                  <th className="text-left pb-2 font-medium">
                    <InfoTip term="Session">{TIPS.KILLZONE}</InfoTip>
                  </th>
                  <th className="text-center pb-2 font-medium">Outcome</th>
                  <th className="text-right pb-2 font-medium">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {active.trades.map((t, i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="py-1.5">{t.day}</td>
                    <td className="py-1.5">{t.time_et}</td>
                    <td className="py-1.5" style={{ color: t.side === "BUY" ? GREEN : RED }}>{t.side === "BUY" ? "Buy" : "Sell"}</td>
                    <td className="py-1.5 text-right">{t.entry}</td>
                    <td className="py-1.5 text-right" style={{ color: "rgba(248,113,113,0.85)" }}>{t.stop}</td>
                    <td className="py-1.5 text-right" style={{ color: "rgba(52,211,153,0.85)" }}>{t.tp}</td>
                    <td className="py-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {t.killzone === "kz_london" ? "London" : t.killzone === "kz_new_york" ? "New York" : t.killzone}
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="px-2 py-0.5 rounded" style={{
                        background: t.outcome === "tp" ? `${GREEN}20` : `${RED}20`,
                        color: t.outcome === "tp" ? GREEN : RED,
                      }}>
                        {t.outcome === "tp" ? "Take-Profit" : "Stop-Loss"}
                      </span>
                    </td>
                    <td className="py-1.5 text-right" style={{ color: t.pl_usd >= 0 ? GREEN : RED }}>
                      {t.pl_usd >= 0 ? "+" : ""}${t.pl_usd.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Framework summary with indicator tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FrameworkCard title="Indicators" items={manifest.framework.indicators} accent="#14b8a6" tipMap={INDICATOR_TIPS} labelMap={INDICATOR_LABELS} />
          <FrameworkCard title="Confluence Filters" items={manifest.framework.confluence_filters} accent={BLUE} tipMap={FILTER_TIPS} labelMap={FILTER_LABELS} />
          <FrameworkCard title="Risk Engine" items={manifest.framework.risk_engine} accent={RED} />
          <FrameworkCard title="Brokers" items={manifest.framework.brokers_supported} accent={GREEN} />
        </div>

        <p className="text-xs max-w-3xl mb-8" style={{ color: "rgba(255,255,255,0.40)" }}>
          {manifest.notes}
        </p>

        {/* CTA */}
        <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(16,185,129,0.06)", border: `1px solid ${GREEN}40` }}>
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
            Want to run your own back-tests, tune the confluence gate, or wire a different broker?
          </p>
          <a
            href="https://github.com/JdeGraftJohnson/propfirmbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded"
            style={{ background: GREEN, color: "#05050f" }}
          >
            Download propfirmbot on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: React.ReactNode; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>{label}</p>
      <p className="text-lg md:text-xl font-bold font-mono" style={{ color: accent ?? "rgba(255,255,255,0.92)" }}>
        {value}
      </p>
    </div>
  );
}

function FrameworkCard({
  title,
  items,
  accent,
  tipMap,
  labelMap,
}: {
  title: string;
  items: string[];
  accent: string;
  tipMap?: Record<string, keyof typeof TIPS>;
  labelMap?: Record<string, string>;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}30` }}>
      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: accent }}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((it) => {
          const tipKey = tipMap?.[it];
          const label = labelMap?.[it] ?? it;
          const display = (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.78)" }}>
              {label}
            </span>
          );
          return (
            <li key={it} className="flex items-center">
              {tipKey ? (
                <InfoTip term={label}>{TIPS[tipKey]}</InfoTip>
              ) : (
                display
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
