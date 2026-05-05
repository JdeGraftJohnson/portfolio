import { tokens } from "@/lib/tokens";

type ProjectStatus = "live" | "in-development" | "open-source";

interface Project {
  name: string;
  description: string;
  href: string;
  tag: string;
  status: ProjectStatus;
}

const STATUS: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  "live":           { label: "Live",           color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  "in-development": { label: "In Development", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  "open-source":    { label: "Open Source",    color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

const projects: Project[] = [
  {
    name: "UK NHS Health Risk Map",
    description: "Patient disengagement risk visualised by ICB and LSOA across NHS England.",
    href: "/map",
    tag: "GIS · ArcGIS · Next.js",
    status: "live",
  },
  {
    name: "Patient Behaviour Prediction Pipeline",
    description: "Early-warning AI that scores every patient on their risk of disengaging from GP care — before it happens.",
    href: "https://chat.johndegraft.app",
    tag: "FastAPI · Gemma · Neo4j",
    status: "live",
  },
  {
    name: "StockHub",
    description: "Options activity dashboard that surfaces unusual open interest shifts across all 12 GICS sectors.",
    href: "https://stockhub.work",
    tag: "React · Options Flow · AI Town",
    status: "live",
  },
  {
    name: "NHS Clinical Decision Support RAG Assistant",
    description: "Answers NICE guideline queries in plain language with exact citations, SNOMED CT codes, and a mandatory human-review flag on every response.",
    href: "/rag",
    tag: "Clinical AI · RAG · FHIR",
    status: "in-development",
  },
  {
    name: "AI Proposal Intelligence",
    description: "Auto-generates AI architecture diagrams and embeds them inline into .docx proposals. Includes a 32-tool MCP server for LLM-driven deck generation.",
    href: "https://ai-proposal-intelligence.vercel.app/aiwriter",
    tag: "Document AI · MCP · Agentic",
    status: "live",
  },
  {
    name: "Responsible AI Health Equity Audit",
    description: "NHS Edition audit tool that stress-tests AI clinical models for triage bias, equity deprioritisation, and MHRA GMLP compliance — with inspect_petri red-teaming and LangSmith observability.",
    href: "#",
    tag: "Python · Fairlearn · LangSmith · inspect_petri · MHRA GMLP",
    status: "in-development",
  },
];

export default function Portfolio() {
  return (
    <main style={{
      minHeight: "100vh",
      background: tokens.bg,
      color: tokens.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Header video */}
      <div style={{ position: "relative", width: "100%", height: "40vh", overflow: "hidden" }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.7,
          }}
        >
          <source src="/header_video.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, transparent 40%, ${tokens.bg})`,
        }} />
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 640,
          padding: "0 2rem",
        }}>
          <p style={{ color: tokens.accent, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Portfolio
          </p>
          <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "0.25rem" }}>
            John DeGraft-Johnson
          </h1>
          <p style={{ color: tokens.muted, fontSize: 15 }}>
            Machine Learning / Systems Engineer SME · AI · data infrastructure
          </p>
        </div>
      </div>

      {/* Project cards */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}>
        <div style={{ maxWidth: 640, width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {projects.map((p) => {
            const s = STATUS[p.status];
            const clickable = p.href !== "#";
            const Tag = clickable ? "a" : "div";
            return (
              <Tag
                key={p.name}
                {...(clickable ? { href: p.href } : {})}
                style={{
                  display: "block",
                  padding: "1.25rem 1.5rem",
                  background: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "inherit",
                  cursor: clickable ? "pointer" : "default",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      color: s.color, background: s.bg,
                      padding: "2px 8px", borderRadius: 4,
                      border: `1px solid ${s.color}30`,
                    }}>{s.label}</span>
                    {clickable && <span style={{ color: tokens.muted, fontSize: 12 }}>↗</span>}
                  </div>
                </div>
                <p style={{ color: tokens.muted, fontSize: 14, margin: "0 0 0.75rem" }}>{p.description}</p>
                <span style={{
                  fontSize: 12,
                  color: tokens.accentAlt,
                  background: "rgba(20,184,166,0.1)",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}>{p.tag}</span>
              </Tag>
            );
          })}
        </div>
      </div>
    </main>
  );
}
