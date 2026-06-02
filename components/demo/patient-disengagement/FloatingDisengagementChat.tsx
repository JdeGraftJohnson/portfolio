"use client";

import { useEffect, useRef, useState } from "react";
import { DisengagementChat } from "./DisengagementChat";

export function FloatingDisengagementChat() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Minimize chat" : "Ask the patient-disengagement model"}
        aria-expanded={open}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 9000,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: open ? "0" : "12px 18px",
          width: open ? 44 : "auto",
          height: open ? 44 : "auto",
          justifyContent: "center",
          borderRadius: open ? 22 : 999,
          border: "1px solid rgba(96,165,250,0.50)",
          background: open
            ? "rgba(10,10,20,0.95)"
            : "linear-gradient(135deg, #2563eb, #0e7490)",
          color: open ? "rgba(255,255,255,0.85)" : "white",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          boxShadow: open
            ? "0 6px 24px rgba(0,0,0,0.45)"
            : "0 4px 24px rgba(37,99,235,0.40)",
          transition: "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {open ? (
          <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>—</span>
        ) : (
          <>
            <span>Ask the AI</span>
            <span aria-hidden>↑</span>
          </>
        )}
      </button>

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Patient disengagement model assistant"
        aria-hidden={!open}
        style={{
          position: "fixed",
          right: 24,
          bottom: 80,
          zIndex: 8999,
          width: "min(420px, calc(100vw - 32px))",
          height: "min(640px, calc(100vh - 120px))",
          background: "rgba(10,10,20,0.96)",
          border: "1px solid rgba(96,165,250,0.30)",
          borderRadius: 14,
          boxShadow:
            "0 24px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 60px rgba(37,99,235,0.10)",
          backdropFilter: "blur(14px)",
          display: "flex",
          flexDirection: "column",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 220ms cubic-bezier(0.4, 0, 0.2, 1), transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: "#60a5fa",
                boxShadow: "0 0 0 4px rgba(96,165,250,0.18)",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.94)",
                  margin: 0,
                  letterSpacing: "-0.005em",
                }}
              >
                Ask the AI
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  margin: 0,
                  marginTop: 1,
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  letterSpacing: "0.06em",
                }}
              >
                CPRD · OMOP · SHAP · Gemma 4
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 14px 14px",
          }}
        >
          <DisengagementChat />
        </div>
      </div>
    </>
  );
}
