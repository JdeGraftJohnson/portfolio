"use client";

import { useState } from "react";
import { ProposalJudgeMap } from "@/components/architecture/ProposalJudgeMap";

interface Finding {
  tier?: string;
  severity?: string;
  issue?: string;
  text?: string;
  fix?: string;
}

interface Judge {
  judge_id: string;
  weighted_total: number;
  verdict: string;
  findings: Finding[];
  notes?: string;
  dim_scores?: Record<string, number>;
}

interface Criterion {
  name: string;
  points: number;
  section: string;
}

interface RfpSummary {
  title: string;
  agency: string;
  due_date: string;
  page_count: number;
  total_points: number;
  evaluation_criteria: Criterion[];
  hard_disqualifiers: string[];
  requirements_count: number;
  notes: string;
}

interface Scorecard {
  composite_weighted_total: number;
  judges: Judge[];
}

interface Composite {
  composite_pre: number;
  composite_post: number;
  threshold: number;
  verdict: string;
}

interface TechnicalPreview {
  filename: string;
  note: string;
  sections: { name: string; sentences: number }[];
}

interface AuditPlan {
  auditors_to_run: { auditor: string; judge_id: string; score: number; findings_count: number; reason: string }[];
  skip: { auditor: string; judge_id: string; reason: string }[];
  parallel_groups: string[][];
}

interface Props {
  rfp: RfpSummary;
  scorecard: Scorecard;
  composite: Composite;
  technical: TechnicalPreview;
  auditPlan: AuditPlan;
  auditMd: string;
}

const STAGES = [
  { id: "rfp",     label: "RFP loaded" },
  { id: "intake",  label: "Intake" },
  { id: "render",  label: "Render" },
  { id: "plan",    label: "Audit plan" },
  { id: "judges",  label: "Judge fan-out" },
  { id: "merge",   label: "Orchestrator merge" },
  { id: "score",   label: "Composite scorecard" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

const TEAL = "#14b8a6";
const BLUE = "#60a5fa";
const VIOLET = "#a78bfa";
const AMBER = "#f59e0b";
const PINK = "#f472b6";
const GREEN = "#34d399";
const RED = "#f87171";

function scoreColor(score: number, max = 5): string {
  const r = score / max;
  if (score === 0) return "rgba(255,255,255,0.30)";
  if (r >= 0.9) return GREEN;
  if (r >= 0.75) return TEAL;
  if (r >= 0.6) return AMBER;
  return RED;
}

function severityStyle(severity: string): { color: string; label: string } {
  const s = severity.toLowerCase();
  if (s.includes("critical")) return { color: RED, label: "CRITICAL" };
  if (s.includes("important")) return { color: AMBER, label: "IMPORTANT" };
  return { color: BLUE, label: "SUGGESTION" };
}

export function ProposalWalkthrough({ rfp, scorecard, composite, technical, auditPlan, auditMd }: Props) {
  const [stage, setStage] = useState<StageId>("rfp");
  const [selectedJudge, setSelectedJudge] = useState<string | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [showFixList, setShowFixList] = useState(false);

  const stageIdx = STAGES.findIndex((s) => s.id === stage);
  const next = () => {
    if (stageIdx < STAGES.length - 1) setStage(STAGES[stageIdx + 1].id);
  };
  const prev = () => {
    if (stageIdx > 0) setStage(STAGES[stageIdx - 1].id);
  };

  const judge = selectedJudge ? scorecard.judges.find((j) => j.judge_id === selectedJudge) : null;

  return (
    <div className="min-h-screen" style={{ background: "#05050f", color: "rgba(255,255,255,0.92)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">

        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            ← Back to portfolio
          </a>
          <h1 className="font-bold text-3xl md:text-4xl mt-3 mb-2">
            AI Proposal Intelligence <span style={{ color: BLUE }}>—</span>{" "}
            <span style={{ color: "rgba(255,255,255,0.75)" }}>Try It Out</span>
          </h1>
          <p className="text-sm md:text-base max-w-3xl mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
            Production LLM evaluation harness — 11 deterministic judges, 5 LLM graders, 5 paired
            auditors. Demonstrates a scalable-oversight pattern: every deterministic finding is
            re-inspected by an LLM auditor before it counts toward the composite score.
          </p>
          <p className="text-sm md:text-base max-w-3xl" style={{ color: "rgba(255,255,255,0.55)" }}>
            Frozen snapshot of a real run against the{" "}
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{rfp.title}</span>. Walk the seven
            stages; every visitor sees the same canonical output.
          </p>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.40)" }}>
            {rfp.notes}
          </p>
        </div>

        {/* Stepper rail */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {STAGES.map((s, i) => {
            const active = s.id === stage;
            const done = i < stageIdx;
            return (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-xs md:text-sm transition"
                style={{
                  background: active ? `${BLUE}20` : done ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${active ? BLUE : done ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}`,
                  color: active ? BLUE : done ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)",
                }}
              >
                <span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stage controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prev}
            disabled={stageIdx === 0}
            className="text-sm px-3 py-1.5 rounded transition disabled:opacity-30"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            ← Prev
          </button>
          <button
            onClick={() => setShowArchitecture((v) => !v)}
            className="text-sm px-3 py-1.5 rounded"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)" }}
          >
            {showArchitecture ? "Hide architecture ↑" : "Show architecture ↓"}
          </button>
          <button
            onClick={next}
            disabled={stageIdx === STAGES.length - 1}
            className="text-sm px-4 py-1.5 rounded transition disabled:opacity-30"
            style={{ background: `${BLUE}25`, border: `1px solid ${BLUE}`, color: BLUE }}
          >
            Next →
          </button>
        </div>

        {/* Architecture toggle */}
        {showArchitecture && (
          <div
            className="mb-8 p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <p className="text-xs uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Architecture · current stage highlighted in the SVG
            </p>
            <ProposalJudgeMap />
          </div>
        )}

        {/* Stage content */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          {stage === "rfp" && <RfpStage rfp={rfp} />}
          {stage === "intake" && <IntakeStage rfp={rfp} />}
          {stage === "render" && <RenderStage technical={technical} />}
          {stage === "plan" && <PlanStage plan={auditPlan} />}
          {stage === "judges" && (
            <JudgesStage scorecard={scorecard} onSelect={setSelectedJudge} />
          )}
          {stage === "merge" && <MergeStage auditMd={auditMd} />}
          {stage === "score" && (
            <ScoreStage
              composite={composite}
              scorecard={scorecard}
              showFixList={showFixList}
              setShowFixList={setShowFixList}
              auditMd={auditMd}
            />
          )}
        </div>

        {/* Slide-over for judge detail */}
        {judge && (
          <JudgeDetail judge={judge} onClose={() => setSelectedJudge(null)} />
        )}

        {/* Footer CTA */}
        <div className="mt-10 p-6 rounded-2xl text-center" style={{ background: "rgba(96,165,250,0.06)", border: `1px solid ${BLUE}40` }}>
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
            Want to run this against your own RFP?
          </p>
          <a
            href="https://github.com/JdeGraftJohnson/proposal-ops-judges"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold px-5 py-2.5 rounded"
            style={{ background: BLUE, color: "#05050f" }}
          >
            Download the system on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------- Stage components ---------------------------------------------

function RfpStage({ rfp }: { rfp: RfpSummary }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: BLUE }}>
        Stage 01 · RFP loaded
      </p>
      <h2 className="text-2xl font-bold mb-2">{rfp.title}</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
        {rfp.agency} · {rfp.page_count} pp · {rfp.requirements_count} parsed requirements · {rfp.total_points} pts total
      </p>

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
        Evaluation criteria
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {rfp.evaluation_criteria.map((c) => (
          <div key={c.section} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{c.name}</span>
              <span className="text-xs font-mono" style={{ color: BLUE }}>{c.points} pts</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: RED }}>
        Hard disqualifiers ({rfp.hard_disqualifiers.length})
      </h3>
      <ul className="space-y-2">
        {rfp.hard_disqualifiers.map((d, i) => (
          <li key={i} className="text-sm pl-4" style={{ borderLeft: `2px solid ${RED}`, color: "rgba(255,255,255,0.75)" }}>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IntakeStage({ rfp }: { rfp: RfpSummary }) {
  const microComponents = ["pdf_to_text", "criteria_extractor", "submittal_scanner", "disqualifier_detector"];
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: AMBER }}>
        Stage 02 · rfp-intake
      </p>
      <h2 className="text-2xl font-bold mb-2">Parsed compliance matrix</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
        Four micro-components run in sequence to extract structured requirements.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {microComponents.map((m) => (
          <span key={m} className="text-xs px-3 py-1.5 rounded font-mono" style={{ background: `${AMBER}1A`, border: `1px solid ${AMBER}50`, color: "rgba(255,255,255,0.85)" }}>
            {m} ✓
          </span>
        ))}
      </div>

      <div className="p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto" style={{ background: "rgba(0,0,0,0.40)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ color: "rgba(255,255,255,0.45)" }}># compliance_matrix.json (summary)</div>
        <div><span style={{ color: BLUE }}>total_points</span>: {rfp.total_points}</div>
        <div><span style={{ color: BLUE }}>requirements</span>: {rfp.requirements_count} parsed</div>
        <div><span style={{ color: BLUE }}>criteria</span>: [{rfp.evaluation_criteria.length} scored items]</div>
        <div><span style={{ color: BLUE }}>hard_disqualifiers</span>: [{rfp.hard_disqualifiers.length}]</div>
      </div>
    </div>
  );
}

function RenderStage({ technical }: { technical: TechnicalPreview }) {
  const micro = ["section_composer", "past_perf_picker", "pricing_calculator", "docx_writer"];
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: BLUE }}>
        Stage 03 · render_proposal.py
      </p>
      <h2 className="text-2xl font-bold mb-2">Drafts rendered</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
        Section composer pulls from the knowledge base; past-perf picker scores case studies against the RFP; pricing calculator applies the GSA benchmark.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {micro.map((m) => (
          <span key={m} className="text-xs px-3 py-1.5 rounded font-mono" style={{ background: `${BLUE}1A`, border: `1px solid ${BLUE}50` }}>
            {m} ✓
          </span>
        ))}
      </div>

      <div className="p-4 rounded-lg" style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <p className="text-xs font-mono mb-3" style={{ color: "rgba(255,255,255,0.50)" }}>
          {technical.filename}
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "rgba(255,255,255,0.45)" }}>
              <th className="text-left pb-2 font-medium text-xs uppercase tracking-wider">Section</th>
              <th className="text-right pb-2 font-medium text-xs uppercase tracking-wider">Sentences</th>
            </tr>
          </thead>
          <tbody>
            {technical.sections.map((s) => (
              <tr key={s.name} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <td className="py-2">{s.name}</td>
                <td className="py-2 text-right font-mono" style={{ color: BLUE }}>{s.sentences}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.40)" }}>{technical.note}</p>
      </div>
    </div>
  );
}

function PlanStage({ plan }: { plan: AuditPlan }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: BLUE }}>
        Stage 04 · audit_runner.py --plan
      </p>
      <h2 className="text-2xl font-bold mb-2">{plan.auditors_to_run.length} auditors scheduled, {plan.skip.length} skipped</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
        Scheduler reads the pre-audit composite, ranks judges with low scores or many findings, and groups auditors into parallel waves.
      </p>

      <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>To run</h3>
      <div className="space-y-2 mb-6">
        {plan.auditors_to_run.map((a) => (
          <div key={a.auditor} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div>
              <div className="text-sm font-mono">{a.auditor}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{a.reason}</div>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: `${scoreColor(a.score)}20`, color: scoreColor(a.score) }}>
              {a.score.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Skipped</h3>
      {plan.skip.map((s) => (
        <div key={s.auditor} className="text-xs p-3 rounded-lg mb-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}>
          <span className="font-mono">{s.auditor}</span> — {s.reason}
        </div>
      ))}

      <h3 className="text-xs uppercase tracking-wider mt-6 mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Parallel waves</h3>
      <div className="space-y-2">
        {plan.parallel_groups.map((group, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Wave {i + 1}:</span>
            {group.map((g) => (
              <span key={g} className="text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(96,165,250,0.10)", border: `1px solid ${BLUE}40` }}>
                {g}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function JudgesStage({ scorecard, onSelect }: { scorecard: Scorecard; onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: VIOLET }}>
        Stage 05 · Judge fan-out (parallel)
      </p>
      <h2 className="text-2xl font-bold mb-2">{scorecard.judges.length} judges scored</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
        Click any judge to see its findings and notes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scorecard.judges.map((j) => {
          const col = scoreColor(j.weighted_total);
          const isMissing = j.weighted_total === 0;
          return (
            <button
              key={j.judge_id}
              onClick={() => onSelect(j.judge_id)}
              className="text-left p-4 rounded-lg transition hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${isMissing ? "rgba(255,255,255,0.15)" : `${col}50`}`,
              }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-mono">{j.judge_id}</span>
                <span className="text-lg font-bold font-mono" style={{ color: col }}>
                  {isMissing ? "—" : j.weighted_total.toFixed(2)}
                </span>
              </div>
              <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                {j.verdict}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                {j.findings.length} finding{j.findings.length === 1 ? "" : "s"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MergeStage({ auditMd }: { auditMd: string }) {
  // pull "All New Findings" block from audit.md for a clean rendered list
  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: AMBER }}>
        Stage 06 · judge-orchestrator
      </p>
      <h2 className="text-2xl font-bold mb-2">Merged AUDIT.md</h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.60)" }}>
        Orchestrator collects auditor XMLs, deduplicates findings, and writes the human-readable AUDIT.md.
      </p>

      <div
        className="p-5 rounded-lg max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap"
        style={{ background: "rgba(0,0,0,0.40)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.80)" }}
      >
        {auditMd}
      </div>
    </div>
  );
}

function ScoreStage({
  composite,
  scorecard,
  showFixList,
  setShowFixList,
  auditMd,
}: {
  composite: Composite;
  scorecard: Scorecard;
  showFixList: boolean;
  setShowFixList: (v: boolean) => void;
  auditMd: string;
}) {
  const verdictColor = composite.composite_post >= 4 ? GREEN : composite.composite_post >= composite.threshold ? AMBER : RED;
  const fixes = extractFixes(auditMd);

  return (
    <div>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: TEAL }}>
        Stage 07 · Composite scorecard
      </p>

      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Bid-readiness verdict</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>{composite.verdict}</p>
        </div>
        <div className="text-center p-6 rounded-2xl" style={{ background: `${verdictColor}15`, border: `1px solid ${verdictColor}` }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: verdictColor }}>Composite</div>
          <div className="text-4xl font-bold font-mono" style={{ color: verdictColor }}>
            {composite.composite_post.toFixed(2)}
            <span className="text-lg" style={{ color: "rgba(255,255,255,0.40)" }}> / 5</span>
          </div>
          <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>threshold {composite.threshold.toFixed(1)}</div>
        </div>
      </div>

      {/* per-judge bar list */}
      <div className="space-y-2 mb-6">
        {scorecard.judges.map((j) => {
          const col = scoreColor(j.weighted_total);
          const pct = (j.weighted_total / 5) * 100;
          return (
            <div key={j.judge_id} className="flex items-center gap-3">
              <div className="w-44 text-xs font-mono" style={{ color: "rgba(255,255,255,0.70)" }}>{j.judge_id}</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: col }} />
              </div>
              <div className="w-12 text-right text-xs font-mono" style={{ color: col }}>
                {j.weighted_total === 0 ? "—" : j.weighted_total.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowFixList(!showFixList)}
        className="text-sm font-semibold"
        style={{ color: BLUE }}
      >
        {showFixList ? "Hide fix list ↑" : `Show ${fixes.length} prioritized fixes ↓`}
      </button>

      {showFixList && (
        <div className="mt-4 space-y-3">
          {fixes.map((f, i) => {
            const sev = severityStyle(f.severity);
            return (
              <div key={i} className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${sev.color}` }}>
                <div className="text-xs font-semibold mb-1" style={{ color: sev.color }}>{sev.label}</div>
                <div className="text-sm mb-2">{f.issue}</div>
                {f.fix && (
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                    <span style={{ color: BLUE }}>Fix:</span> {f.fix}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Judge detail slide-over -------------------------------------

function JudgeDetail({ judge, onClose }: { judge: Judge; onClose: () => void }) {
  const col = scoreColor(judge.weighted_total);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.70)" }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: "#0a0a1a", border: `1px solid ${col}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>Judge</p>
            <h3 className="text-xl font-bold font-mono">{judge.judge_id}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono" style={{ color: col }}>
              {judge.weighted_total === 0 ? "—" : judge.weighted_total.toFixed(2)}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{judge.verdict}</div>
          </div>
        </div>

        {judge.dim_scores && Object.keys(judge.dim_scores).length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Dimensions</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(judge.dim_scores).map(([k, v]) => (
                <div key={k} className="flex justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>{k}</span>
                  <span className="font-mono" style={{ color: scoreColor(v) }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {judge.findings.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Findings</p>
            <div className="space-y-2">
              {judge.findings.map((f, i) => {
                const tier = f.tier ?? f.severity ?? "suggestion";
                const sev = severityStyle(tier);
                return (
                  <div key={i} className="p-3 rounded text-sm" style={{ borderLeft: `2px solid ${sev.color}`, background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: sev.color }}>{sev.label}</div>
                    <div className="mb-1">{f.issue ?? f.text}</div>
                    {f.fix && <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}><span style={{ color: BLUE }}>Fix:</span> {f.fix}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {judge.notes && (
          <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.50)" }}>{judge.notes}</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-xs px-3 py-1.5 rounded"
          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ---------- helpers --------------------------------------------------------

function extractFixes(auditMd: string): { severity: string; issue: string; fix: string }[] {
  // parses "- **IMPORTANT**: <issue>\n  Fix: <fix>" blocks
  const out: { severity: string; issue: string; fix: string }[] = [];
  const blocks = auditMd.split(/^- /m);
  for (const b of blocks) {
    const m = b.match(/\*\*(IMPORTANT|CRITICAL|SUGGESTION)\*\*:\s*([\s\S]*?)(?:\n\s+Fix:\s*([\s\S]*?))?(?=\n\n|\n- |$)/i);
    if (m) {
      out.push({ severity: m[1], issue: m[2].trim(), fix: (m[3] || "").trim() });
    } else {
      const m2 = b.match(/^(suggestion|important|critical):\s*([^—]+?)\s*—\s*(.+)/i);
      if (m2) {
        out.push({ severity: m2[1], issue: m2[2].trim(), fix: m2[3].trim() });
      }
    }
  }
  return out;
}
