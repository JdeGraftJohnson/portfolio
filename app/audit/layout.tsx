import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NHS Health Equity Audit · johndegraft.app",
  description: "Responsible AI Health Equity Audit Tool — audit ML models for demographic disparities, MHRA GMLP compliance, and NHS Core20PLUS5 equity gaps.",
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#05050f" /* tokens.bg */ }}>
      {children}
    </div>
  );
}
