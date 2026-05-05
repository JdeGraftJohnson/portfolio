"use client";

import { tokens } from "@/lib/tokens";
import { AuditShell } from "./_components/AuditShell";

export default function AuditPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: tokens.bg,
        color: tokens.text,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Hero section */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 24px 0",
        }}
      >
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: tokens.accentAlt,
            marginBottom: "0.6rem",
            fontWeight: 600,
          }}
        >
          PROJECT 05 · NHS EDITION
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: tokens.text,
            lineHeight: 1.15,
            marginBottom: "0.75rem",
          }}
        >
          Responsible AI Health Equity Audit
        </h1>
        <p
          style={{
            color: tokens.muted,
            fontSize: 15,
            maxWidth: 680,
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Upload ML model predictions and audit for demographic disparities, MHRA GMLP
          compliance, and NHS Core20PLUS5 equity gaps.
        </p>
      </div>

      {/* Tab shell */}
      <AuditShell />
    </main>
  );
}
