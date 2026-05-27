"use client";

import { useEffect, useState } from "react";
import { type DataDoc, classColor, fmtUSD, fetchRxData } from "./rxData";

interface DrugAgg {
  product_name: string;
  drug_class: string;
  spend: number;
  rx_count: number;
  states: number;
}

function aggregate(d: DataDoc, topN = 20): DrugAgg[] {
  const m = new Map<string, DrugAgg>();
  for (const s of d.states) {
    for (const dr of s.top_drugs) {
      const key = dr.product_name.toUpperCase().replace(/\s+/g, " ").trim();
      const existing = m.get(key);
      if (existing) {
        existing.spend += dr.spend;
        existing.rx_count += dr.rx_count;
        existing.states += 1;
      } else {
        m.set(key, {
          product_name: key,
          drug_class: dr.drug_class,
          spend: dr.spend,
          rx_count: dr.rx_count,
          states: 1,
        });
      }
    }
  }
  return Array.from(m.values())
    .sort((a, b) => b.spend - a.spend)
    .slice(0, topN);
}

export function NationalTopDrugs() {
  const [data, setData] = useState<DataDoc | null>(null);
  useEffect(() => { fetchRxData().then(setData).catch(() => {}); }, []);
  if (!data) return null;
  const drugs = aggregate(data, 20);
  const max = drugs[0]?.spend ?? 1;

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
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 4 }}>
        Most expensive prescriptions · national
      </p>
      <h3 style={{ fontSize: 16, color: "rgba(255,255,255,0.92)", margin: 0, marginBottom: 4, fontWeight: 700 }}>
        Top 20 drugs by Medicaid reimbursement
      </h3>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, marginBottom: 16 }}>
        Aggregated across each state&apos;s top-5 list (the spike of US Medicaid spend lives in 20–30 brand drugs)
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {drugs.map((d, i) => (
          <li
            key={d.product_name}
            style={{
              display: "grid",
              gridTemplateColumns: "28px minmax(140px, 220px) 1fr 100px 60px",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px",
              borderRadius: 6,
              background: i < 3 ? "rgba(255,255,255,0.035)" : "transparent",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.40)", fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
              {d.product_name}
              <span style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{d.drug_class}</span>
            </span>
            <div style={{ height: 12, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${(d.spend / max) * 100}%`,
                  height: "100%",
                  background: classColor(d.drug_class),
                  opacity: 0.85,
                }}
              />
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
              {fmtUSD(d.spend)}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "right" }}>
              {d.states} {d.states === 1 ? "state" : "states"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
