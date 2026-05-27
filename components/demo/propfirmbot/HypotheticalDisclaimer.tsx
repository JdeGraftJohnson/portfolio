"use client";

const AMBER = "#f59e0b";
const MUTED = "rgba(255,255,255,0.65)";

// CFTC Regulation 4.41(b) / NFA Compliance Rule 2-29(c)(6) require a
// hypothetical-performance disclaimer when simulated or back-tested results
// are presented to the public. The wording below tracks the regulatory model
// language as closely as is practical for a portfolio context.
export function HypotheticalDisclaimer() {
  return (
    <div
      className="rounded-2xl p-5 mb-8"
      style={{ background: `${AMBER}10`, border: `1px solid ${AMBER}55` }}
    >
      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: AMBER, fontWeight: 700 }}>
        Hypothetical performance disclosure
      </p>
      <p className="text-xs leading-relaxed mb-2" style={{ color: MUTED }}>
        Hypothetical or simulated performance results have certain inherent
        limitations. Unlike an actual performance record, simulated results
        do not represent actual trading. Because the trades have not actually
        been executed, the results may have under- or over-compensated for the
        impact, if any, of certain market factors, such as lack of liquidity.
        Simulated trading programs in general are also subject to the fact
        that they are designed with the benefit of hindsight. No representation
        is being made that any account will or is likely to achieve profits or
        losses similar to those shown.
      </p>
      <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
        This page is a portfolio demonstration of a software project. It is
        not investment advice, not a solicitation, and not an offer to buy or
        sell any security or derivative. Trading futures involves substantial
        risk of loss. The figures shown are from a curated subset of
        back-tested signals and are intentionally not representative of the
        full unfiltered run; see the GitHub repository for the complete
        back-test suite.
      </p>
    </div>
  );
}
