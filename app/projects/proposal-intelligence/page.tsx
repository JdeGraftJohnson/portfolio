import fs from "node:fs";
import path from "node:path";
import { ProposalWalkthrough } from "@/components/demo/proposal/Walkthrough";

export const metadata = {
  title: "AI Proposal Intelligence — Try It Out | John de Graft-Johnson",
  description:
    "Static walkthrough of a real proposal-ops run against a State/Local Government IT Professional Services RFP. Multi-judge evaluation pipeline with composite scorecard.",
};

function loadJson<T>(rel: string): T {
  const p = path.join(process.cwd(), "public", "demo", "proposal-intelligence", rel);
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function loadText(rel: string): string {
  const p = path.join(process.cwd(), "public", "demo", "proposal-intelligence", rel);
  return fs.readFileSync(p, "utf8");
}

export default function Page() {
  const rfp = loadJson<Parameters<typeof ProposalWalkthrough>[0]["rfp"]>("rfp_summary.json");
  const scorecard = loadJson<Parameters<typeof ProposalWalkthrough>[0]["scorecard"]>("scorecard.json");
  const composite = loadJson<Parameters<typeof ProposalWalkthrough>[0]["composite"]>("composite_scorecard.json");
  const technical = loadJson<Parameters<typeof ProposalWalkthrough>[0]["technical"]>("technical_preview.json");
  const auditPlan = loadJson<Parameters<typeof ProposalWalkthrough>[0]["auditPlan"]>("audit_plan.json");
  const auditMd = loadText("audit.md");

  return (
    <ProposalWalkthrough
      rfp={rfp}
      scorecard={scorecard}
      composite={composite}
      technical={technical}
      auditPlan={auditPlan}
      auditMd={auditMd}
    />
  );
}
