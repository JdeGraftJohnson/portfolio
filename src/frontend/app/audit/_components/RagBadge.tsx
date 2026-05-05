"use client";

import { CSSProperties } from "react";
import { tokens } from "@/lib/tokens";

interface RagBadgeProps {
  rag: "Green" | "Amber" | "Red" | "Grey";
}

interface RagStyle {
  color: string;
  background: string;
}

function getRagStyle(rag: RagBadgeProps["rag"]): RagStyle {
  switch (rag) {
    case "Green":
      return {
        color: tokens.riskLow,
        background: "rgba(34,197,94,0.15)",
      };
    case "Amber":
      return {
        color: tokens.riskMid,
        background: "rgba(245,158,11,0.15)",
      };
    case "Red":
      return {
        color: tokens.riskHigh,
        background: "rgba(239,68,68,0.15)",
      };
    case "Grey":
    default:
      return {
        color: tokens.muted,
        background: tokens.surface,
      };
  }
}

export function RagBadge({ rag }: RagBadgeProps) {
  const { color, background } = getRagStyle(rag);

  const style: CSSProperties = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color,
    background,
    lineHeight: 1,
  };

  return <span style={style}>{rag}</span>;
}
