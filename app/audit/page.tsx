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
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Audit-run metadata strip */}
      <div
        style={{
          background: "#0b0b1a",
          color: "rgba(255,255,255,0.7)",
          padding: "8px 24px",
          fontSize: 12,
          display: "flex",
          justifyContent: "flex-end",
          gap: 18,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span>
          Audit Run:{" "}
          <span style={{ color: "#fff", fontWeight: 500 }}>
            #audit-2026-05-07-001
          </span>
        </span>
        <span>
          Model:{" "}
          <span style={{ color: "#fff", fontWeight: 500 }}>
            disengagement-xgb-v1.2
          </span>
        </span>
        <span>
          Date: <span style={{ color: "#fff", fontWeight: 500 }}>2026-05-07</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Status:
          <span
            style={{
              background: "#16a34a",
              color: "#fff",
              padding: "2px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ● Ready
          </span>
        </span>
      </div>

      {/* Brand-gradient hero */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(to right, #312e81, #6b46c1)",
          color: "#fff",
          padding: "56px 24px 72px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              opacity: 0.85,
              marginBottom: "0.6rem",
              fontWeight: 600,
            }}
          >
            PROJECT 05 · NHS EDITION
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "0.85rem",
              letterSpacing: "-0.02em",
            }}
          >
            AI Health Equity Audit Tool
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.92, maxWidth: 720, margin: "0 auto" }}>
            Automated fairness audit for clinical AI models · NICE ESF Tier B ·
            NHS Core20PLUS5 · UK GDPR Article 22.
          </p>
        </div>
        {/* skewed transition into dark canvas */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 60,
            background: tokens.bg,
            transform: "skewY(-2deg)",
            transformOrigin: "bottom left",
            zIndex: 1,
          }}
        />
      </div>

      {/* Tab shell */}
      <div style={{ flex: 1, marginTop: -32, position: "relative", zIndex: 3 }}>
        <AuditShell />
      </div>

      {/* Sticky export footer */}
      <footer
        style={{
          position: "sticky",
          bottom: 0,
          background: "rgba(11,11,26,0.92)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          zIndex: 40,
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0 }}>
          © 2026 AI Health Equity Audit Tool · johndegraft.app/audit
        </p>
        <button
          type="button"
          style={{
            background: "linear-gradient(to right, #4338ca, #6b46c1)",
            color: "#fff",
            border: "none",
            padding: "9px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
          }}
          onClick={() => {
            const ev = new CustomEvent("audit:export");
            window.dispatchEvent(ev);
          }}
        >
          ⤓ Export Audit Report
        </button>
      </footer>
    </main>
  );
}
