"use client";

import { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { tokens } from "@/lib/tokens";
import type { PlotlyFigure } from "./AuditContext";

import type { PlotParams } from "react-plotly.js";
const Plot = dynamic<PlotParams>(() => import("react-plotly.js"), { ssr: false });

interface PlotlyChartProps {
  figure: PlotlyFigure;
  height?: number;
}

export function PlotlyChart({ figure, height = 400 }: PlotlyChartProps) {
  const darkLayout = {
    ...(figure.layout as Record<string, unknown>),
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      color: tokens.text,
      family: "system-ui, -apple-system, sans-serif",
    },
    xaxis: {
      ...((figure.layout as Record<string, unknown>)?.xaxis as Record<string, unknown> | undefined),
      gridcolor: "rgba(255,255,255,0.08)",
      color: tokens.muted,
    },
    yaxis: {
      ...((figure.layout as Record<string, unknown>)?.yaxis as Record<string, unknown> | undefined),
      gridcolor: "rgba(255,255,255,0.08)",
      color: tokens.muted,
    },
    height,
    margin: { t: 40, r: 20, b: 40, l: 50 },
  };

  const wrapperStyle: CSSProperties = {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  };

  return (
    <div style={wrapperStyle}>
      <Plot
        data={figure.data as Plotly.Data[]}
        layout={darkLayout as Partial<Plotly.Layout>}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: "100%", height }}
        useResizeHandler
      />
    </div>
  );
}
