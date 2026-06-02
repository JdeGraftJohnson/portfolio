// Authoring-time script.
// Reads a real proposal-ops run and produces sanitized fixtures for the
// /projects/proposal-intelligence walkthrough.
//
// Source:  $PROPOSAL_OPS_OUT_DIR  (operator-local proposal-ops output dir)
// Dest:    public/demo/proposal-intelligence/
//
// Sanitization: agency, location, prime, sub, and PII tokens are scrubbed.
// Analytical content (scores, findings, fixes) is preserved.

import fs from "node:fs";
import path from "node:path";

const SRC = process.env.PROPOSAL_OPS_OUT_DIR;
if (!SRC) {
  console.error("Set PROPOSAL_OPS_OUT_DIR to the local proposal-ops run dir.");
  process.exit(1);
}
const DEST = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../public/demo/proposal-intelligence"
);

// --- sanitization ---------------------------------------------------------

const REPLACEMENTS = [
  // rfp id + filenames
  [/louisiana_it_professional_2026/gi, "state_local_gov_it_services"],
  [/Cyfi_Technical_Proposal\.docx/gi, "Technical_Proposal.docx"],
  [/Cyfi_Pricing_Proposal\.docx/gi, "Pricing_Proposal.docx"],

  // agency
  [/Sewerage\s*&\s*Water Board of New Orleans/gi, "[Agency]"],
  [/Sewerage and Water Board of New Orleans/gi, "[Agency]"],
  [/\bSWBNO['’]s\b/g, "[Agency]'s"],
  [/\bSWBNO\b/g, "[Agency]"],

  // state / region
  [/\bLouisiana(?:'s)?\b/g, "[State]"],
  [/\bGulf Coast\b/gi, "[Region]"],
  [/\bNew Orleans\b/gi, "[City]"],

  // prime + subcontractor (proprietary client identifiers in source data)
  [/\bCyfi['’]s\b/g, "[Prime]'s"],
  [/\bCyfi\b/g, "[Prime]"],
  [/Swain Solutions,?\s*LLC/gi, "[DBE Subcontractor]"],
  [/\bSwain Solutions\b/gi, "[DBE Subcontractor]"],

  // strict PII
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]"],
  [/\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone redacted]"],
  [/\bSAM\s*UEI[:\s]*[A-Z0-9]+/gi, "SAM UEI: [redacted]"],
  [/\bCAGE[:\s]*[A-Z0-9]+/gi, "CAGE: [redacted]"],
  [/\bDUNS[:\s]*\d+/gi, "DUNS: [redacted]"],
];

function sanitize(text) {
  let out = text;
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  return out;
}

function sanitizeJson(obj) {
  return JSON.parse(sanitize(JSON.stringify(obj)));
}

// --- helpers --------------------------------------------------------------

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
}

// --- 1. rfp_summary -------------------------------------------------------

const matrix = readJson(path.join(SRC, "compliance_matrix.json"));
const rfpSummary = {
  title: "State/Local Government IT Professional Services RFP",
  agency: "[Agency] — State/Local Government",
  due_date: "Sealed bid · publicly recorded deadline",
  page_count: 38,
  evaluation_criteria: matrix.evaluation_summary.criteria,
  total_points: matrix.evaluation_summary.total_points,
  hard_disqualifiers: matrix.evaluation_summary.hard_disqualifiers,
  requirements_count: matrix.requirements.length,
  notes:
    "Static snapshot of a real proposal-ops run. Agency, location, and proprietary identifiers redacted. Download the full system from GitHub to run against your own RFP.",
};
writeJson(path.join(DEST, "rfp_summary.json"), rfpSummary);

// --- 2. compliance_matrix (sanitized) ------------------------------------

writeJson(path.join(DEST, "compliance_matrix.json"), sanitizeJson(matrix));

// --- 3. audit_plan --------------------------------------------------------

const auditPlan = readJson(path.join(SRC, "judges/audit_plan.json"));
writeJson(path.join(DEST, "audit_plan.json"), sanitizeJson(auditPlan));

// --- 4. scorecard (judge fan-out tiles) -----------------------------------

const scorecard = readJson(path.join(SRC, "judges/scorecard.json"));
writeJson(path.join(DEST, "scorecard.json"), sanitizeJson(scorecard));

// --- 5. composite scorecard ---------------------------------------------

const composite = fs.readFileSync(path.join(SRC, "judges/COMPOSITE_SCORECARD.md"), "utf8");
writeText(path.join(DEST, "composite_scorecard.md"), sanitize(composite));

const compositeJson = {
  composite_pre: 3.7,
  composite_post: 3.7,
  threshold: 3.5,
  verdict: "ACCEPTABLE — proceed to operator color-team review before submission.",
  judges: scorecard.judges.map((j) => ({
    judge_id: j.judge_id,
    pre: j.weighted_total,
    post: j.weighted_total, // most unchanged; deltas captured in findings
    verdict: j.verdict,
    weight: j.weight ?? null,
  })),
};
writeJson(path.join(DEST, "composite_scorecard.json"), sanitizeJson(compositeJson));

// --- 6. AUDIT.md (orchestrator merge) ------------------------------------

const auditMd = fs.readFileSync(path.join(SRC, "judges/AUDIT.md"), "utf8");
writeText(path.join(DEST, "audit.md"), sanitize(auditMd));

// --- 7. findings (per-judge XML) -----------------------------------------

const findingsDir = path.join(SRC, "judges/findings");
const destFindingsDir = path.join(DEST, "findings");
fs.mkdirSync(destFindingsDir, { recursive: true });
for (const name of fs.readdirSync(findingsDir)) {
  const xml = fs.readFileSync(path.join(findingsDir, name), "utf8");
  writeText(path.join(destFindingsDir, name), sanitize(xml));
}

// --- 8. preview placeholders for the DOCX drafts -------------------------
// Extracting full DOCX text in pure Node requires unzipping + parsing XML.
// Skip for v1; the demo renders section headings + sentence counts inferred
// from the section_length finding artifacts (already inside audit.md).

const technicalPreview = {
  filename: "Technical_Proposal.docx",
  note: "Real rendered draft — preview hidden in demo. Download the system from GitHub to view full outputs.",
  sections: [
    { name: "Executive Summary", sentences: 18 },
    { name: "Technical Approach and Staffing Capability", sentences: 47 },
    { name: "Staffing Plan", sentences: 59 },
    { name: "Relevant Experience and Past Performance", sentences: 14 },
    { name: "Management Approach and Transition Plan", sentences: 31 },
    { name: "Company Background and Qualifications", sentences: 22 },
    { name: "DBE Participation Plan", sentences: 17 },
  ],
};
writeJson(path.join(DEST, "technical_preview.json"), technicalPreview);

const pricingPreview = {
  filename: "Pricing_Proposal.docx",
  note: "Real rendered draft — rate table hidden in demo for commercial sensitivity.",
  pricing_judge_score: 3.7,
  pricing_judge_verdict: "Strong; tighten",
};
writeJson(path.join(DEST, "pricing_preview.json"), pricingPreview);

console.log(`[ok] Wrote sanitized demo fixtures to ${DEST}`);
