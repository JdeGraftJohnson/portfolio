"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, GeoJSON, Tooltip } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import {
  type DataDoc,
  type StateRow,
  CLASS_COLORS,
  classColor,
  hexToRgb,
  fmtRx,
  fmtUSD,
  fetchRxData,
} from "./rxData";

// us-atlas uses FIPS codes as feature.id; map to USPS state codes
const FIPS_TO_USPS: Record<string, string> = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC",
  "12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY",
  "22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT",
  "31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH",
  "40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY","60":"AS","66":"GU","69":"MP",
  "72":"PR","78":"VI",
};

const TOPO_URL = "/demo/healthcare/us-states-10m.json";

async function fetchTopo(): Promise<FeatureCollection> {
  const r = await fetch(TOPO_URL);
  const topo = (await r.json()) as Topology;
  const obj = topo.objects.states as GeometryCollection;
  return topojson.feature(topo, obj) as unknown as FeatureCollection;
}

export function USRxMapView() {
  const [data, setData] = useState<DataDoc | null>(null);
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hover, setHover] = useState<StateRow | null>(null);
  const [selected, setSelected] = useState<StateRow | null>(null);

  useEffect(() => {
    Promise.all([fetchRxData(), fetchTopo()])
      .then(([d, g]) => { setData(d); setGeo(g); })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const byUsps = useMemo(() => {
    if (!data) return new Map<string, StateRow>();
    return new Map(data.states.map((s) => [s.state_code, s]));
  }, [data]);
  const maxRx = useMemo(() => {
    if (!data) return 1;
    return Math.max(...data.states.map((s) => s.rx_count));
  }, [data]);

  const styleFor = (feat: Feature) => {
    const fips = (feat.id ?? "") as string;
    const usps = FIPS_TO_USPS[fips];
    const row = usps ? byUsps.get(usps) : undefined;
    if (!row) {
      return { fillColor: "#0e0e1a", fillOpacity: 1, color: "rgba(255,255,255,0.04)", weight: 0.5 };
    }
    const isSelected = selected?.state_code === row.state_code;
    const hex = classColor(row.top_class);
    const rgb = hexToRgb(hex);
    const intensity = 0.30 + 0.62 * Math.sqrt(row.rx_count / maxRx);
    return {
      fillColor: `rgb(${rgb})`,
      fillOpacity: isSelected ? 1 : intensity,
      color: isSelected ? "#22d3ee" : "rgba(255,255,255,0.18)",
      weight: isSelected ? 2.2 : 0.6,
    };
  };

  const onEach = (feat: Feature, layer: import("leaflet").Layer) => {
    const fips = (feat.id ?? "") as string;
    const usps = FIPS_TO_USPS[fips];
    const row = usps ? byUsps.get(usps) : undefined;
    layer.on({
      mouseover: (e) => {
        setHover(row ?? null);
        const t = e.target as import("leaflet").Path;
        if (selected?.state_code !== row?.state_code) {
          t.setStyle({ weight: 1.8, color: "rgba(255,255,255,0.85)" });
        }
        t.bringToFront();
      },
      mouseout: (e) => {
        setHover(null);
        const t = e.target as import("leaflet").Path;
        if (selected?.state_code !== row?.state_code) {
          t.setStyle({ weight: 0.6, color: "rgba(255,255,255,0.18)" });
        }
      },
      click: () => {
        if (row) setSelected(row);
      },
    });
  };

  if (err) {
    return <div style={{ padding: 24, color: "#fca5a5", fontSize: 13 }}>Failed: {err}</div>;
  }
  if (!data || !geo) {
    return (
      <div style={{ height: 640, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.55)", fontSize:13 }}>
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#05050f",
      }}
    >
      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        minZoom={3}
        maxZoom={8}
        style={{ height: 640, width: "100%", background: "#05050f" }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        attributionControl={false}
        dragging={true}
      >
        <GeoJSON data={geo} style={styleFor as never} onEachFeature={onEach as never}>
          {hover && (
            <Tooltip sticky direction="top" opacity={1} className="us-rx-tooltip">
              <div style={{ minWidth: 220 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#fff" }}>{hover.state_name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: 0, marginTop: 2 }}>{hover.region} · {hover.division}</p>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span>Total reimbursed</span><b>{fmtUSD(hover.total_reimb)}</b></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span>Prescriptions</span><b>{fmtRx(hover.rx_count)}</b></div>
                </div>
                <div style={{
                  marginTop: 8, padding: "4px 8px",
                  background: `rgba(${hexToRgb(classColor(hover.top_class))},0.22)`,
                  border: `1px solid rgba(${hexToRgb(classColor(hover.top_class))},0.55)`,
                  borderRadius: 6, fontSize: 11, color: "#fff",
                }}>
                  Top class: <b>{hover.top_class}</b> ({(hover.top_class_share*100).toFixed(0)}%)
                </div>
              </div>
            </Tooltip>
          )}
        </GeoJSON>
      </MapContainer>
      <style>{`
        .us-rx-tooltip {
          background: rgba(10,10,20,0.95) !important;
          border: 1px solid rgba(255,255,255,0.18) !important;
          color: #fff !important;
          padding: 10px 12px !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.5) !important;
        }
        .us-rx-tooltip::before { border-top-color: rgba(10,10,20,0.95) !important; }
        .leaflet-container { outline: none; }
        .leaflet-control-zoom a {
          background: rgba(10,10,20,0.9) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: rgba(255,255,255,0.85) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
          font-weight: 600 !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover {
          background: rgba(34,211,238,0.18) !important;
          border-color: rgba(34,211,238,0.55) !important;
          color: #22d3ee !important;
        }
        .leaflet-control-zoom { margin: 12px !important; }
      `}</style>
      {/* Categorical class legend (bottom-left) — colors that ACTUALLY appear on this map */}
      <MapLegend data={data} />

      {/* Selected-state side panel */}
      {selected && (
        <StatePanel state={selected} onClose={() => setSelected(null)} />
      )}

      {/* Hint when nothing selected */}
      {!selected && (
        <div style={{
          position: "absolute", right: 14, top: 14, zIndex: 1000,
          background: "rgba(10,10,20,0.78)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 6, padding: "6px 10px",
          fontSize: 11, color: "rgba(255,255,255,0.60)",
          backdropFilter: "blur(8px)",
        }}>
          Click a state for details
        </div>
      )}
    </div>
  );
}

function MapLegend({ data }: { data: DataDoc }) {
  const counts = new Map<string, number>();
  for (const s of data.states) counts.set(s.top_class, (counts.get(s.top_class) ?? 0) + 1);
  const items = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{
      position: "absolute", left: 14, bottom: 14, zIndex: 1000,
      background: "rgba(10,10,20,0.88)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 8, padding: "10px 12px",
      backdropFilter: "blur(8px)",
      maxWidth: 280,
    }}>
      <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 8 }}>
        Dominant drug class
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map(([klass, n]) => (
          <li key={klass} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
            <span aria-hidden style={{ width: 12, height: 12, borderRadius: 2, background: classColor(klass), flexShrink: 0, border: "1px solid rgba(255,255,255,0.15)" }} />
            <span style={{ flex: 1 }}>{klass}</span>
            <b style={{ color: "rgba(255,255,255,0.50)", fontVariantNumeric: "tabular-nums" }}>{n}</b>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.40)", margin: 0, marginTop: 8 }}>
        Lighter state = fewer Rx · brighter state = more Rx
      </p>
    </div>
  );
}

function StatePanel({ state, onClose }: { state: StateRow; onClose: () => void }) {
  const top5 = state.top_drugs.slice(0, 5);
  const maxSpend = Math.max(...top5.map(d => d.spend), 1);
  return (
    <div
      style={{
        position: "absolute", right: 14, top: 14, bottom: 14, zIndex: 1000,
        width: "min(340px, calc(100% - 28px))",
        background: "rgba(10,10,20,0.94)",
        border: "1px solid rgba(34,211,238,0.40)",
        borderRadius: 10,
        padding: 16,
        overflowY: "auto",
        backdropFilter: "blur(10px)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.55)",
      }}
      role="dialog"
      aria-label={`${state.state_name} prescription stats`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 4 }}>
            {state.region} · {state.division}
          </p>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.96)", margin: 0, lineHeight: 1.15 }}>
            {state.state_name}
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginLeft: 8, fontWeight: 500 }}>{state.state_code}</span>
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.75)",
            width: 28, height: 28,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 15,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <PanelMetric label="Reimbursed" value={fmtUSD(state.total_reimb)} />
        <PanelMetric label="Prescriptions" value={fmtRx(state.rx_count)} />
      </div>

      {/* Top class pill */}
      <div
        style={{
          padding: "10px 12px",
          background: `rgba(${hexToRgb(classColor(state.top_class))},0.18)`,
          border: `1px solid rgba(${hexToRgb(classColor(state.top_class))},0.50)`,
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", margin: 0, marginBottom: 4 }}>
          Top drug class
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{state.top_class}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0, marginTop: 2 }}>
          {(state.top_class_share * 100).toFixed(0)}% of top-class spend
        </p>
      </div>

      {/* Top-5 drugs */}
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 8 }}>
        Top 5 drugs by spend
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {top5.map((d, i) => (
          <li key={d.ndc11} style={{ padding: "8px 0", borderBottom: i === top5.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
                <span style={{ color: "rgba(255,255,255,0.40)", marginRight: 6 }}>{i + 1}.</span>
                {d.product_name}
              </span>
              <b style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(d.spend)}</b>
            </div>
            <div style={{ marginTop: 5, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: classColor(d.drug_class) }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{d.drug_class}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", marginLeft: "auto" }}>{fmtRx(d.rx_count)} Rx</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${(d.spend / maxSpend) * 100}%`, height: "100%", background: classColor(d.drug_class) }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PanelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: "8px 10px",
      borderRadius: 6,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", margin: 0, marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "ui-monospace, SFMono-Regular, monospace", color: "rgba(255,255,255,0.95)", margin: 0 }}>{value}</p>
    </div>
  );
}
