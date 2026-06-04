"use client";

import { useEffect, useMemo, useState } from "react";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";

// All Solana RPC calls happen server-side in functions/api/propfirmbot-memos.ts.
// The wallet pubkey is held only in the Cloudflare Pages env var
// PROPFIRMBOT_SOLANA_PUBKEY and never reaches the browser.

type LastEvent = {
  action?: string;
  ts?: string;
  side?: string;
  qty?: number;
  entry?: number;
  stop?: number;
  take_profit?: number;
  pnl?: number;
};

type Memo = {
  v: string;
  ts: string;
  status: "up" | "down";
  strategy: string;
  session: string;
  fires_24h: number;
  last?: LastEvent;
};

type Row = { sig: string; blockTime: number | null; memo: Memo };

function statusPill(latest: Row | null): { label: string; bg: string; fg: string } {
  if (!latest) return { label: "No data", bg: "rgba(120,120,120,0.18)", fg: "#9ca3af" };
  if (latest.memo.status === "up") {
    return { label: "Live", bg: "rgba(34,197,94,0.18)", fg: "#22c55e" };
  }
  return { label: "Offline", bg: "rgba(239,68,68,0.18)", fg: "#ef4444" };
}

function fmtTime(ts: string | undefined): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ts; }
}

function fmtNum(n: number | undefined, digits = 2): string {
  if (n === undefined || n === null) return "—";
  return n.toFixed(digits);
}

export function SolanaLiveTracker() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/propfirmbot-memos", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (json.error) { setError(json.error); setLoading(false); return; }
        setRows(Array.isArray(json.rows) ? json.rows : []);
        setLoading(false);
      } catch (e: any) {
        if (alive) { setError(e?.message ?? String(e)); setLoading(false); }
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const latest = rows[0] ?? null;
  const pill = useMemo(() => statusPill(latest), [latest]);

  // "View on Solana" button: jumps to the most recent on-chain memo, if any.
  const latestExplorerHref = latest
    ? `https://explorer.solana.com/tx/${latest.sig}?cluster=devnet`
    : null;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0 24px" }}>
      <LiquidGlassCard radius={20} padding={28} interactive={false}>
        <header style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#e5e7eb", letterSpacing: 0.2 }}>
            Live bot status
          </h2>
          <span
            style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: pill.bg, color: pill.fg, border: `1px solid ${pill.fg}33`,
              textTransform: "uppercase", letterSpacing: 0.6,
            }}
          >
            ● {pill.label}
          </span>
          {latestExplorerHref && (
            <a
              href={latestExplorerHref}
              target="_blank" rel="noopener noreferrer"
              style={{
                marginLeft: "auto",
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(96,165,250,0.10)",
                border: "1px solid rgba(96,165,250,0.35)",
                color: "#60a5fa", fontSize: 12, fontWeight: 600,
                textDecoration: "none", letterSpacing: 0.4,
              }}
            >
              View on Solana ↗
            </a>
          )}
        </header>

        <p style={{ marginTop: 10, marginBottom: 18, fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
          The bot publishes a small redacted status memo to Solana devnet
          every 10 minutes. The recent on-chain memos are shown below.
          Account identifiers and credentials are stripped before publishing.
        </p>

        {loading && (
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading on-chain memos…</p>
        )}
        {error && (
          <p style={{ fontSize: 13, color: "#ef4444" }}>Error: {error}</p>
        )}

        {!loading && !error && rows.length === 0 && (
          <p style={{ fontSize: 13, color: "#9ca3af" }}>
            No memos yet. The publisher runs every 10 minutes; first memo
            should appear within the next cycle.
          </p>
        )}

        {!loading && rows.length > 0 && (
          <>
            <div
              style={{
                display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 12, marginBottom: 16, fontSize: 12,
              }}
            >
              <Stat label="Last seen" value={latest && latest.blockTime ? fmtTime(new Date(latest.blockTime * 1000).toISOString()) : "—"} />
              <Stat label="Strategy" value={latest?.memo.strategy ?? "—"} />
              <Stat label="Session" value={latest?.memo.session ?? "—"} />
              <Stat label="Fires (24h)" value={String(latest?.memo.fires_24h ?? 0)} />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%", borderCollapse: "collapse", fontSize: 12,
                  color: "#cbd5e1",
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                    <Th>Anchored</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                    <Th>Side</Th>
                    <Th>Qty</Th>
                    <Th>Entry</Th>
                    <Th>Stop</Th>
                    <Th>TP</Th>
                    <Th>P&L</Th>
                    <Th>tx</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map(r => {
                    const last = r.memo.last;
                    return (
                      <tr key={r.sig} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <Td>{r.blockTime ? fmtTime(new Date(r.blockTime * 1000).toISOString()) : "—"}</Td>
                        <Td>
                          <span style={{ color: r.memo.status === "up" ? "#22c55e" : "#ef4444" }}>
                            {r.memo.status}
                          </span>
                        </Td>
                        <Td>{last?.action ?? "—"}</Td>
                        <Td>{last?.side ?? "—"}</Td>
                        <Td>{last?.qty ?? "—"}</Td>
                        <Td>{fmtNum(last?.entry)}</Td>
                        <Td>{fmtNum(last?.stop)}</Td>
                        <Td>{fmtNum(last?.take_profit)}</Td>
                        <Td style={{ color: (last?.pnl ?? 0) >= 0 ? "#34d399" : "#f87171" }}>
                          {last?.pnl !== undefined ? `$${last.pnl.toFixed(2)}` : "—"}
                        </Td>
                        <Td>
                          <a
                            href={`https://explorer.solana.com/tx/${r.sig}?cluster=devnet`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: "#60a5fa", textDecoration: "none" }}
                          >
                            ↗
                          </a>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </LiquidGlassCard>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 12,
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </div>
      <div style={{ color: "#e5e7eb", fontSize: 14, fontWeight: 600, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: "8px 10px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "8px 10px", whiteSpace: "nowrap", ...style }}>{children}</td>;
}
