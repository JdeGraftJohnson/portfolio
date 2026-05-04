"use client";

import { ReactNode, CSSProperties } from "react";

interface LiquidGlassCardProps {
  children: ReactNode;
  interactive?: boolean;
  radius?: number;
  padding?: number;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export function LiquidGlassCard({
  children,
  interactive = true,
  radius = 20,
  padding = 32,
  className = "",
  onClick,
  style,
}: LiquidGlassCardProps) {
  const base: CSSProperties = {
    borderRadius: `${radius}px`,
    padding: `${padding}px`,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 1px 2px 0 rgba(0,0,0,0.05)",
    transition: interactive
      ? "transform 400ms cubic-bezier(0.16,1,0.3,1), background 400ms ease, border-color 400ms ease"
      : undefined,
    cursor: interactive && onClick ? "pointer" : undefined,
    ...style,
  };

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      style={base}
      className={`${interactive ? "hover:-translate-y-1 hover:bg-white/10 hover:border-white/20" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
