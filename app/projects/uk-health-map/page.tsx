import Link from "next/link";
import { FloatingUkHealthChat } from "@/components/demo/uk-health-map/FloatingUkHealthChat";

const EMBED_URL = "https://blue-smoke-00f20d403.7.azurestaticapps.net/map/explore";

export const metadata = {
  title: "UK Health Map · John DeGraft-Johnson",
  description:
    "Interactive choropleth of NHS Integrated Care Board regions — disengagement risk, IMD quintiles, CQC practice ratings.",
};

export default function UKHealthMapPage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#05050f", color: "rgba(255,255,255,0.92)" }}
    >
      <nav
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "14px 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "#34d399",
            textDecoration: "none",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
          }}
        >
          ← johndegraft.app
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#34d399",
              fontWeight: 700,
            }}
          >
            Geospatial AI · NHS ICB
          </span>
          <a
            href={EMBED_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: "#34d399",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid rgba(52,211,153,0.35)",
              background: "rgba(52,211,153,0.06)",
            }}
          >
            Open in new tab ↗
          </a>
        </div>
      </nav>

      <header style={{ maxWidth: 1280, margin: "0 auto", width: "100%", padding: "8px 16px 12px" }}>
        <h1
          style={{
            fontSize: "clamp(22px, 2.6vw, 32px)",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.96)",
          }}
        >
          UK Health Map · NHS Integrated Care Board risk visualisation
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
            margin: "6px 0 0",
            maxWidth: 820,
            lineHeight: 1.55,
          }}
        >
          Interactive choropleth of NHS ICB regions layered with patient-disengagement risk, IMD quintile distributions,
          and CQC practice ratings. Drill from national → regional → ICB → practice. Built with Next.js, Leaflet, and a
          Delta Lake silver layer; deployed on Azure Static Web Apps.
        </p>
      </header>

      <div
        style={{
          flex: 1,
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "0 16px 24px",
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            overflow: "hidden",
            background: "#000",
            boxShadow: "0 10px 32px rgba(0,0,0,0.45)",
            height: "min(82vh, 820px)",
            minHeight: 540,
          }}
        >
          <iframe
            src={EMBED_URL}
            title="UK Health Map · NHS ICB risk visualisation"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="geolocation"
            style={{
              width: "100%",
              height: "100%",
              border: "0",
              display: "block",
              background: "#0e1116",
            }}
          />
        </div>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            margin: "10px 4px 0",
            maxWidth: 1100,
          }}
        >
          Embedded from Azure Static Web Apps. Click <b style={{ color: "#6ee7b7" }}>Ask the map</b> (bottom right) for an
          ICB / IMD / CQC RAG assistant. If interactivity feels constrained inside the iframe, use{" "}
          <a href={EMBED_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#34d399" }}>
            Open in new tab ↗
          </a>
          .
        </p>
      </div>

      <FloatingUkHealthChat />
    </main>
  );
}
