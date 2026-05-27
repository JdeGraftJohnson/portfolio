"use client";

import { useEffect, useState } from "react";
import { type DataDoc, classColor, fmtUSD, fetchRxData } from "./rxData";

const REGION_ORDER = ["Northeast", "Midwest", "South", "West"];

interface Stack {
  region: string;
  total: number;
  parts: { klass: string; spend: number }[];
}

function aggregate(d: DataDoc): Stack[] {
  const byRegion = new Map<string, Map<string, number>>();
  for (const s of d.states) {
    const region = s.region || "Other";
    if (!byRegion.has(region)) byRegion.set(region, new Map());
    const m = byRegion.get(region)!;
    for (const dr of s.top_drugs) {
      m.set(dr.drug_class, (m.get(dr.drug_class) ?? 0) + dr.spend);
    }
  }
  const stacks: Stack[] = [];
  for (const region of REGION_ORDER) {
    const m = byRegion.get(region);
    if (!m) continue;
    const parts = Array.from(m.entries())
      .map(([klass, spend]) => ({ klass, spend }))
      .sort((a, b) => b.spend - a.spend);
    stacks.push({ region, total: parts.reduce((a, b) => a + b.spend, 0), parts });
  }
  return stacks;
}

export function ClassByRegionChart() {
  const [data, setData] = useState<DataDoc | null>(null);
  useEffect(() => { fetchRxData().then(setData).catch(() => {}); }, []);

  if (!data) {
    return <div style={{ height: 240 }} />;
  }
  const stacks = aggregate(data);
  // For uniform-scale comparison, find the largest region total
  const maxTotal = Math.max(...stacks.map((s) => s.total));

  return (
    <div
      style={{
        padding: "18px 20px 22px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, marginBottom: 16 }}>
        Each bar = sum of state-level top-5 drug spend in that region · width = absolute spend, color split = class share
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {stacks.map((s) => (
          <div key={s.region}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{s.region}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(s.total)}</span>
            </div>
            <div
              style={{
                position: "relative",
                width: `${(s.total / maxTotal) * 100}%`,
                height: 26,
                display: "flex",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              role="img"
              aria-label={`${s.region}: ${s.parts.slice(0,3).map(p => `${p.klass} ${fmtUSD(p.spend)}`).join(", ")}`}
            >
              {s.parts.map((p, i) => (
                <span
                  key={p.klass + i}
                  title={`${p.klass} · ${fmtUSD(p.spend)} · ${((p.spend / s.total) * 100).toFixed(1)}%`}
                  style={{
                    width: `${(p.spend / s.total) * 100}%`,
                    background: classColor(p.klass),
                    minWidth: p.spend / s.total > 0.015 ? 0 : 0,
                  }}
                />
              ))}
            </div>
            {/* Top-3 inline labels */}
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              {s.parts.slice(0, 3).map((p) => (
                <span key={p.klass} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: classColor(p.klass) }} />
                  {p.klass.replace(" / ", "/")}
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>{((p.spend / s.total) * 100).toFixed(0)}%</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
