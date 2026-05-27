"use client";

import { useEffect, useRef, useState } from "react";

interface PbiToken {
  reportId: string;
  embedUrl: string;
  token: string;
  expiration: string;
}

declare global {
  interface Window {
    powerbi?: {
      embed: (element: HTMLElement, config: unknown) => unknown;
      reset: (element: HTMLElement) => void;
    };
  }
}

const POWERBI_CLIENT_CDN =
  "https://cdn.jsdelivr.net/npm/powerbi-client@2.23.1/dist/powerbi.min.js";

function loadPowerBiClient(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.powerbi) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${POWERBI_CLIENT_CDN}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("powerbi-client failed to load"))
      );
      return;
    }
    const s = document.createElement("script");
    s.src = POWERBI_CLIENT_CDN;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("powerbi-client failed to load"));
    document.head.appendChild(s);
  });
}

async function fetchToken(): Promise<PbiToken> {
  const res = await fetch("/api/pbi-token", { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`/api/pbi-token ${res.status}: ${body}`);
  }
  return (await res.json()) as PbiToken;
}

function Skeleton() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: 24,
        gap: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 78,
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flex: 1 }}>
        <div
          style={{
            flex: 2,
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            flex: 1,
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.45)",
          fontSize: 12,
        }}
      >
        Loading live Power BI report…
      </p>
    </div>
  );
}

export function HealthcareEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openInPbiUrl, setOpenInPbiUrl] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    async function embed() {
      try {
        await loadPowerBiClient();
        if (cancelled || !containerRef.current || !window.powerbi) return;
        const t = await fetchToken();
        if (cancelled || !containerRef.current) return;

        const models = {
          TokenType: { Embed: 1 },
          Permissions: { Read: 0 },
          ViewMode: { View: 0 },
          BackgroundType: { Transparent: 1 },
        };

        const config = {
          type: "report",
          id: t.reportId,
          embedUrl: t.embedUrl,
          accessToken: t.token,
          tokenType: models.TokenType.Embed,
          permissions: models.Permissions.Read,
          viewMode: models.ViewMode.View,
          settings: {
            background: models.BackgroundType.Transparent,
            panes: {
              filters: { visible: true, expanded: false },
              pageNavigation: { visible: true, position: 0 },
              bookmarks: { visible: false },
              fields: { visible: false },
              selection: { visible: false },
              syncSlicers: { visible: false },
              visualizations: { visible: false },
            },
            bars: {
              statusBar: { visible: false },
              actionBar: { visible: false },
            },
          },
        };

        window.powerbi.reset(containerRef.current);
        window.powerbi.embed(containerRef.current, config);
        setOpenInPbiUrl(
          `https://app.powerbi.com/reportEmbed?reportId=${t.reportId}`
        );
        setRefreshedAt(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }));
        setStatus("ready");

        const expiresAt = new Date(t.expiration).getTime();
        const refreshIn = Math.max(expiresAt - Date.now() - 5 * 60_000, 60_000);
        refreshTimer = setTimeout(() => {
          embed();
        }, refreshIn);
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    embed();

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (containerRef.current && window.powerbi) {
        window.powerbi.reset(containerRef.current);
      }
    };
  }, []);

  return (
    <section
      aria-label="Live Power BI report"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 64px" }}
    >
      <div
        style={{
          borderRadius: 14,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
          overflow: "hidden",
        }}
      >
        {/* Card title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: status === "ready" ? "#22d3ee" : status === "error" ? "#f87171" : "#fbbf24",
                boxShadow:
                  status === "ready"
                    ? "0 0 0 4px rgba(34,211,238,0.15)"
                    : status === "error"
                    ? "0 0 0 4px rgba(248,113,113,0.15)"
                    : "0 0 0 4px rgba(251,191,36,0.15)",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.94)",
                  margin: 0,
                  letterSpacing: "-0.005em",
                }}
              >
                Medicaid State Drug Utilization Dashboard
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  margin: 0,
                  marginTop: 2,
                }}
              >
                5 pages · 17 visuals · CMS public data ·{" "}
                {status === "ready" && refreshedAt
                  ? `Live · loaded ${refreshedAt}`
                  : status === "error"
                  ? "Connection error"
                  : "Connecting to Power BI…"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/projects/healthcare-dashboard/map"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#34d399",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgba(52,211,153,0.35)",
                background: "rgba(52,211,153,0.06)",
                whiteSpace: "nowrap",
              }}
            >
              View map ↗
            </a>
            {openInPbiUrl && status === "ready" && (
              <a
                href={openInPbiUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#22d3ee",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(34,211,238,0.35)",
                  background: "rgba(34,211,238,0.06)",
                  whiteSpace: "nowrap",
                }}
              >
                Open in Power BI ↗
              </a>
            )}
          </div>
        </div>

        {/* Embed surface */}
        <div style={{ position: "relative", width: "100%" }}>
          <div
            ref={containerRef}
            className="pbi-embed-surface"
            style={{
              width: "100%",
              height: "min(78vh, 760px)",
              background: "#0b0b18",
              opacity: status === "ready" ? 1 : 0,
              transition: "opacity 220ms ease",
            }}
          />
          <style>{`
            .pbi-embed-surface { min-height: 540px; }
            @media (max-width: 768px) {
              .pbi-embed-surface { min-height: 420px; height: 60vh; }
            }
          `}</style>
          {status === "loading" && <Skeleton />}
          {status === "ready" && (
            <p
              className="mobile-hint"
              style={{
                display: "none",
                textAlign: "center",
                padding: "10px 14px",
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              Best viewed on desktop · rotate phone or open on a larger screen
              for full interactivity
            </p>
          )}
          <style>{`@media (max-width: 768px) { .mobile-hint { display: block !important; } }`}</style>
          {status === "error" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#fca5a5",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Couldn&apos;t load the embedded report.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, maxWidth: 480 }}>
                {errorMsg}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
