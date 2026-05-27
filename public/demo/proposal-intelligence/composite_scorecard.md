# Composite Scorecard — state_local_gov_it_services
Merged: 2026-05-18T23:26:41.637659+00:00
Pre-audit composite: **3.70 / 5**
Post-audit composite: **3.70 / 5**  (Strong; tighten)

| Judge | Pre-audit | Δ | Post-audit | Verdict |
|---|---|---|---|---|
| `pii_leak` | 5.00 | 0.00 | 5.00 | Submit as-is |
| `unresolved_tokens` | 5.00 | 0.00 | 5.00 | Submit as-is |
| `styling` | 4.80 | 0.00 | 4.80 | Submit as-is |
| `formatting_alignment` | 4.55 | +0.05 | 4.60 | Submit as-is |
| `section_length` | 4.20 | -0.20 | 4.00 | Submit as-is |
| `compliance_coverage` | 5.00 | 0.00 | 5.00 | Submit as-is |
| `pricing_math` | 3.70 | 0.00 | 3.70 | Strong; tighten |
| `past_perf_coverage` | 5.00 | 0.00 | 5.00 | Submit as-is |
| `named_personnel` | 0.00 | — | 0.00 | not_implemented |

## New Findings from Audit (12)

- **IMPORTANT**: Management Approach missing 85% retention target, compensation practices statement, and professional development framework
  Fix: Add to data/methodology/state_local_gov_it_services.yml: "[Prime] targets ≥85% practitioner retention annually; compensation aligned to [State] Living Wage and market-rate IT bands; annual professional development budget available per practitioner"
- **IMPORTANT**: Management Approach missing ER1/ER2 emergency personnel categories and hurricane season mobilization plan
  Fix: Add ER1 (mission-critical 24/7) and ER2 (essential business-hours) personnel tier definitions and explicit hurricane season continuity provisions
- **IMPORTANT**: Management Approach missing weekly status reports, monthly metrics dashboard, and quarterly DBE reporting cadence
  Fix: Add explicit reporting schedule: weekly status report by COB Friday, monthly KPI dashboard, quarterly DBE participation actuals to [Agency]'s DBE office
- **IMPORTANT**: Management Approach missing no non-compete/no conversion fee policy statement
  Fix: Add explicit language: "[Prime] imposes no non-compete restrictions on placed practitioners and charges no conversion fee should [Agency] choose to hire directly"
- **IMPORTANT**: Management Approach missing vacancy response standards: 1-hour critical response, vacancy SLA table, and performance penalty triggers
  Fix: Add SLA table with critical (1-hour), urgent (4-hour), standard (72-hour) vacancy response times and performance penalty schedule
- **IMPORTANT**: Staffing Plan missing named Contract Manager role, [State]-based personnel statement, and technical leads category
  Fix: Add "Contract Manager" as dedicated [Agency] account lead; state "[State]-based or immediately relocatable technical leads available for all IT discipline areas"
- **IMPORTANT**: Technical Approach missing 2-hour cybersecurity incident notification SLA and cybersecurity safeguards list
  Fix: Add explicit "2-hour [Agency] notification for any cybersecurity incident" SLA and enumerate safeguards (MFA, audit logging, access control, background screening)
- **SUGGESTION**: Company Background should explicitly name subcontractors ([DBE Subcontractor]) with their role description and DBE certification status
  Fix: Add "[DBE Subcontractor] serves as [Prime]'s primary DBE subcontractor; certified under [State] USDOT DBE program"
- **SUGGESTION**: Staffing Plan over target (59 sentences vs. 20-40 target)
  Fix: Consider compressing KP bios from 4-5 sentences to 2-3 each to reduce section to ~40 sentences
- **SUGGESTION**: Past Performance needs expansion to 30+ sentences
  Fix: Add reference contact details, documented fill-rate/retention outcomes, explicit 5-year lookback statement, and [State]/[Region] proximity language for each of the 4 entries
- **SUGGESTION**: Company Background missing financial stability evidence (D&B rating or revenue range), insurance certificate summary, and litigation/debarment statement
  Fix: Add 3 sentences covering these evaluator-scored items
- **SUGGESTION**: DBE Participation Plan should reference the mandatory EDBP Participation Summary Sheet and EDBP Acknowledgement of Negotiated Terms attachments explicitly
  Fix: These are non-responsive disqualifiers if missing from submission
