"use client";

import { useState } from "react";

const TIP_BG = "rgba(10,10,26,0.98)";
const TIP_BORDER = "rgba(96,165,250,0.45)";

export function InfoTip({ term, children }: { term: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <span>{term}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`What is ${term}?`}
        className="ml-1 inline-flex items-center justify-center text-[10px] font-bold"
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: "rgba(96,165,250,0.15)",
          border: "1px solid rgba(96,165,250,0.45)",
          color: "#60a5fa",
          lineHeight: 1,
        }}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 text-xs leading-relaxed p-3 rounded-lg"
          style={{
            bottom: "calc(100% + 8px)",
            left: 0,
            width: 280,
            background: TIP_BG,
            border: `1px solid ${TIP_BORDER}`,
            color: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.50)",
            whiteSpace: "normal",
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

// Library of standard tooltips for trading concepts. Each tooltip lists the
// full name first, then a plain-English explanation aimed at a non-trader.
export const TIPS = {
  ORB: (
    <>
      <b>Opening Range Breakout.</b> The first 15–30 minutes after a trading
      session opens define a price range. A buy fires when price breaks above
      the range high; a sell fires when it breaks below the low. The range
      captures overnight liquidity and where institutional orders are waiting.
    </>
  ),
  DXY: (
    <>
      <b>DXY confluence.</b> The US Dollar Index is built synthetically from five
      CME currency futures (6E, 6J, 6B, 6C, 6S). Gold and USD are negatively
      correlated, so a falling DXY supports gold longs and vice versa. The
      strategy uses DXY direction as a veto on counter-trend entries.
    </>
  ),
  KILLZONE: (
    <>
      <b>ICT killzone.</b> High-liquidity intraday windows where institutional
      order flow concentrates: London open (03:00–05:00 ET), New York open
      (08:00–11:00 ET), London close (10:00–12:00 ET). Trading outside these
      windows reduces fill quality and edge.
    </>
  ),
  RR: (
    <>
      <b>Risk:Reward ratio.</b> The take-profit distance divided by the stop
      distance. RR 2:1 means a winner is twice the size of a loser; the strategy
      can lose 2 of 3 trades and still break even. propfirmbot defaults to
      adjustable RR per strategy.
    </>
  ),
  TP: (
    <>
      <b>Take Profit.</b> The price level at which the position is closed
      automatically with a gain. Sits a fixed distance above entry on longs and
      below on shorts.
    </>
  ),
  SL: (
    <>
      <b>Stop Loss.</b> The price level at which the position is closed
      automatically with a loss. Caps per-trade risk and is required by
      prop-firm rules.
    </>
  ),
  ATR: (
    <>
      <b>Average True Range.</b> A volatility measure averaging the daily
      true-range over N bars. Used to size stops as a multiple of recent
      volatility, so a stop is "tight" or "wide" relative to how the instrument
      is actually moving — not a fixed dollar amount.
    </>
  ),
  CONFLUENCE: (
    <>
      <b>Confluence gate.</b> A filter that only allows trades when multiple
      independent signals agree (e.g., DXY direction + EMA stack + level
      proximity). Reduces fire count but raises win rate when calibrated.
    </>
  ),
  EOD: (
    <>
      <b>End-of-Day exit.</b> If neither the stop-loss nor the take-profit is
      hit by the session close, the position is closed at the closing price.
      Marked "EOD" in the trade log.
    </>
  ),
  NETUSD: (
    <>
      <b>Net of commissions.</b> Gross profit minus the broker's roundtrip
      commission (approximately $0.74 per micro-futures contract). On
      low-edge strategies, commission alone can turn a positive gross result
      into a negative net.
    </>
  ),
  GROSS: (
    <>
      <b>Gross profit / loss.</b> The sum of all per-trade outcomes before any
      broker commission is deducted. Useful for comparing strategy edge across
      brokers with different fee structures.
    </>
  ),
  WINRATE: (
    <>
      <b>Win rate.</b> The percentage of trades that closed at the take-profit
      level. A high win rate by itself does not mean a strategy is profitable —
      it has to be combined with the risk-to-reward ratio to know the expected
      value per trade.
    </>
  ),
  EQUITYCURVE: (
    <>
      <b>Cumulative profit & loss.</b> Each point on the line is the running
      total of profit (or loss) up to and including that trade. A line rising
      from left to right means the strategy made money over the period; a
      flat or falling line means it lost or broke even.
    </>
  ),
  EMA: (
    <>
      <b>Exponential Moving Average.</b> A running average of closing prices
      that puts more weight on recent bars than older ones. The strategy uses
      multiple EMAs at once to read trend direction — when shorter EMAs are
      above longer ones, the market is in an up-trend.
    </>
  ),
  LEVELS: (
    <>
      <b>Reference levels.</b> Specific prices that tend to attract trading
      activity: previous-day high/low, prior-week high/low, session open. The
      strategy uses proximity to these levels as one of its confluence inputs.
    </>
  ),
  COHORTS: (
    <>
      <b>Cohort analysis.</b> Groups historical trades by setup conditions
      (time of day, trend regime, level proximity) to measure which buckets
      have historically been profitable.
    </>
  ),
  REGIME: (
    <>
      <b>Market regime.</b> A label for the broad state of the market:
      trending, ranging, expanding, contracting. The strategy adjusts its
      filters based on the current regime so it doesn't run trend setups in a
      ranging market.
    </>
  ),
  COINTEGRATION: (
    <>
      <b>Cointegration.</b> A statistical test for whether two instruments
      tend to revert to a stable price relationship over time. Used to size
      pair-based hedges and to detect when historical correlations have
      broken.
    </>
  ),
  SESSION: (
    <>
      <b>Trading session.</b> The market is split into named sessions —
      London (overnight US), New York (US morning), and London-close (US
      mid-day). Each has a different volatility and liquidity profile.
    </>
  ),
  SYNTHETIC_DXY: (
    <>
      <b>Synthetic US Dollar Index.</b> A real-time approximation of the US
      Dollar Index built from five US currency-futures contracts (Euro,
      Japanese Yen, British Pound, Canadian Dollar, Swiss Franc). Used to gate
      gold trades — gold and the dollar move opposite each other, so a rising
      dollar vetoes a gold long.
    </>
  ),
};
