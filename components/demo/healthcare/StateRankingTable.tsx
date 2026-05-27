"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type DataDoc,
  type StateRow,
  classColor,
  hexToRgb,
  fmtRx,
  fmtUSD,
  fetchRxData,
} from "./rxData";

type SortKey = "spend" | "rx" | "alpha";

export function StateRankingTable() {
  const [data, setData] = useState<DataDoc | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [query, setQuery] = useState("");

  useEffect(() => { fetchRxData().then(setData).catch(() => {}); }, []);

  const sorted = useMemo(() => {
    if (!data) return [] as StateRow[];
    const rows = [...data.states];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) =>
          r.state_name.toLowerCase().includes(q) ||
          r.state_code.toLowerCase().includes(q) ||
          r.top_class.toLowerCase().includes(q))
      : rows;
    if (sortKey === "spend") filtered.sort((a, b) => b.total_reimb - a.total_reimb);
    else if (sortKey === "rx") filtered.sort((a, b) => b.rx_count - a.rx_count);
    else filtered.sort((a, b) => a.state_name.localeCompare(b.state_name));
    return filtered;
  }, [data, sortKey, query]);

  const maxSpend = useMemo(() => {
    if (!data) return 1;
    return Math.max(...data.states.map((s) => s.total_reimb));
  }, [data]);

  if (!data) return null;

  return (
    <section
      style={{
        marginTop: 24,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 4 }}>
            All 52 states & territories
          </p>
          <h3 style={{ fontSize: 16, color: "rgba(255,255,255,0.92)", margin: 0, fontWeight: 700 }}>
            Medicaid Rx spend ranking
          </h3>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search state or class…"
            style={{
              fontSize: 12, padding: "6px 10px",
              borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.92)",
              outline: "none", minWidth: 180,
            }}
          />
          {(["spend","rx","alpha"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              style={{
                fontSize: 11, padding: "5px 10px",
                borderRadius: 6,
                border: `1px solid ${sortKey === k ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.12)"}`,
                background: sortKey === k ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
                color: sortKey === k ? "#22d3ee" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}
            >
              {k === "spend" ? "Sort: $" : k === "rx" ? "Sort: Rx" : "Sort: A→Z"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <th style={{ textAlign: "left", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)", width: 36 }}>#</th>
              <th style={{ textAlign: "left", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>State</th>
              <th style={{ textAlign: "left", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>Top class</th>
              <th style={{ textAlign: "right", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)", width: 110 }}>Reimbursed</th>
              <th style={{ textAlign: "right", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)", width: 90 }}>Rx</th>
              <th style={{ textAlign: "left", padding: "8px 8px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>Top 3 drugs (spend share within state)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const top3 = row.top_drugs.slice(0, 3);
              const top3Sum = top3.reduce((a, b) => a + b.spend, 0);
              const stateBarWidth = (row.total_reimb / maxSpend) * 100;
              return (
                <tr key={row.state_code} style={{ color: "rgba(255,255,255,0.88)" }}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontWeight: 700 }}>{row.state_name}</span>
                    <span style={{ color: "rgba(255,255,255,0.40)", fontSize: 11, marginLeft: 6 }}>{row.state_code}</span>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)" }}>{row.region}</div>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: classColor(row.top_class) }} />
                      <span style={{ fontSize: 12 }}>{row.top_class}</span>
                    </span>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{(row.top_class_share * 100).toFixed(0)}% of top-class spend</div>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    <div style={{ fontWeight: 700 }}>{fmtUSD(row.total_reimb)}</div>
                    <div style={{ marginTop: 4, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${stateBarWidth}%`, height: "100%", background: `rgba(${hexToRgb(classColor(row.top_class))},0.85)` }} />
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.65)" }}>
                    {fmtRx(row.rx_count)}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", height: 22, borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {top3.map((d) => (
                        <span
                          key={d.ndc11}
                          title={`${d.product_name} · ${d.drug_class} · ${fmtUSD(d.spend)}`}
                          style={{
                            width: top3Sum ? `${(d.spend / top3Sum) * 100}%` : "33%",
                            background: classColor(d.drug_class),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingLeft: 6,
                            fontSize: 10,
                            color: "rgba(255,255,255,0.92)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          {d.product_name.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
