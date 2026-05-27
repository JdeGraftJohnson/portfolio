import Link from "next/link";
import { NhsRagChat } from "@/components/demo/clinical-rag/NhsRagChat";

export const metadata = {
  title: "NHS Clinical RAG Chat · John DeGraft-Johnson",
  description:
    "Evidence-grounded clinical Q&A — NICE guideline citations, SNOMED CT codes, mandatory human review on every response. Powered by Gemma 4.",
};

export default function NhsRagChatPage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#16091c", color: "rgba(255,255,255,0.92)" }}
    >
      {/* Ambient orbs */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -10,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(244,114,182,0.18)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: 0,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(168,85,247,0.16)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <nav
        style={{
          maxWidth: 1080,
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
          href="/rag"
          style={{
            fontSize: 13,
            color: "#f9a8d4",
            textDecoration: "none",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
          }}
        >
          ← Clinical RAG overview
        </Link>
        <span
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#f9a8d4",
            fontWeight: 700,
          }}
        >
          Clinical AI · NICE · SNOMED CT · Gemma 4
        </span>
      </nav>

      <header style={{ maxWidth: 1080, margin: "0 auto", width: "100%", padding: "16px 16px 8px" }}>
        <h1
          style={{
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.01em",
            background: "linear-gradient(to right, #fce7f3, #f0abfc, #c4b5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          NHS Clinical Decision Support · RAG Chat
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.70)",
            margin: "8px 0 0",
            maxWidth: 820,
            lineHeight: 1.55,
          }}
        >
          Evidence-grounded answers to NICE guideline + BNF queries. Every response carries a NICE reference, a SNOMED
          CT code, and a mandatory human-review flag — non-bypassable. Powered by Gemma 4 on Azure AI; UK GDPR Article
          22 aligned.
        </p>
      </header>

      <div
        style={{
          flex: 1,
          width: "100%",
          padding: "20px 16px 64px",
        }}
      >
        <NhsRagChat />
      </div>
    </main>
  );
}
