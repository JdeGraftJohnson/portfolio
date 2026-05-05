"use client";

import { CSSProperties } from "react";
import { tokens } from "@/lib/tokens";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  rag?: "Green" | "Amber" | "Red" | "Blue" | null;
}

function ragBorderColor(rag: MetricCardProps["rag"]): string {
  switch (rag) {
    case "Green": return tokens.riskLow;
    case "Amber": return tokens.riskMid;
    case "Red":   return tokens.riskHigh;
    case "Blue":  return tokens.accent;
    default:      return "rgba(255,255,255,0.15)";
  }
}

export function MetricCard({ label, value, sub, rag = null }: MetricCardProps) {
  const borderColor = ragBorderColor(rag);

  const innerStyle: CSSProperties = {
    borderLeft: `3px solid ${borderColor}`,
    paddingLeft: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  return (
    <LiquidGlassCard interactive={false} padding={16}>
      <div style={innerStyle}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: tokens.muted,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: tokens.text,
            lineHeight: 1.2,
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            style={{
              fontSize: 12,
              color: tokens.muted,
              lineHeight: 1.4,
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </LiquidGlassCard>
  );
}
