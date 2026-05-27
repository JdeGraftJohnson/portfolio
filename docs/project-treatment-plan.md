# Project Treatment Plan — 4 Health/RAG Cards

**Scope.** Adds GitHub repo + Architecture map + Try It Out demo to four cards in
`/Users/john/Git/johndegraft-app/components/ProjectsSection.tsx`:

1. `clinical-rag` — Clinical Decision Support RAG Assistant
2. `patient-disengagement` — Patient Disengagement Prediction (NHS)
3. `uk-health-map` — UK Health Map (NHS ICB choropleth)
4. `health-equity-audit` — AI Health Equity Audit Tool

**Reference implementations** (read these first, do not modify):

- `/Users/john/Git/johndegraft-app/components/architecture/ProposalJudgeMap.tsx` (355 LOC)
- `/Users/john/Git/johndegraft-app/components/architecture/PropfirmbotMap.tsx` (251 LOC)
- `/Users/john/Git/johndegraft-app/components/architecture/HealthcareDashboardMap.tsx` (228 LOC)
- `/Users/john/Git/johndegraft-app/components/demo/proposal/Walkthrough.tsx` (684 LOC)
- `/Users/john/Git/johndegraft-app/components/demo/healthcare/Walkthrough.tsx` (240 LOC)
- `/Users/john/Git/johndegraft-app/components/demo/propfirmbot/StrategyLab.tsx` (+ siblings)
- `/Users/john/Git/johndegraft-app/public/demo/healthcare/manifest.json` (fixture shape model)

**Global design constraints (apply to all four):**

- Static-fixture demos only. No runtime backend, no Azure tokens, no LLM calls.
  Cloudflare Pages SSG output (`next build && next export` path) must produce
  the demo with all data pre-baked under `public/demo/<slug>/`.
- SVG architecture maps in dark-glass palette: bg `#05050f`, glass cluster
  `rgba(255,255,255,0.04)` with `1px` stroke at `rgba(255,255,255,0.08)`,
  accent per badgeColor. viewBox `0 0 1280 1080` to match siblings.
- No emojis anywhere. Use `[OK]` / `[WARN]` / `[MISS]` tags if status pills
  are needed inside demos.
- Disclaimer chip component is reusable; model it on
  `components/demo/healthcare/HypotheticalDisclaimer.tsx` (32 LOC).
- Shared primitive: extract a `QnaPicker` component
  (`/Users/john/Git/johndegraft-app/components/demo/_shared/QnaPicker.tsx`)
  used by both clinical-rag and patient-disengagement. ~180 LOC. Renders a
  pill row of questions, an answer panel with Markdown rendering, a DOI/source
  citation strip, and an optional chart slot.

---

## BLOCKER — Source of Q&A pairs

**Operator stated:** pre-generated Q&A pairs live under
`/Users/john/Documents/Claude/Projects/`.

**Actual contents of that directory (verified 2026-05-23):**

```
/Users/john/Documents/Claude/Projects/
  AI Government Proposal/        # proposal-ops backend; not Q&A
  AI Proposal Intelligence/      # already-shipped project
  Architecture Example.png
  Dribble Referenece.png
  Government Proposals/          # SOP + GSA library; not Q&A
  LangChainAPIKey.txt
  stockhub_header.mp4
```

No `clinical-rag` / `patient-disengagement` / `qna*.json` / `responses*.json`
/ `answers*.md` files exist under any subdirectory. A broader search across
`/Users/john` (excluding `node_modules`) returned **zero candidate Q&A
files**. Only matches were code scratchpads:

- `/Users/john/Git/johndegraft-app/scratch/disengagement/v1-crm-workspace-var75.html` (UI mock, no Q&A)
- `/Users/john/Git/johndegraft-app/scratch/rag-variants/m1-warm-clinical/` (UI variants, no Q&A)

**Action required from operator before execution begins.**

The plan below specifies the Q&A fixture *shape* and treats the actual
content as a TODO that the operator supplies. Without it, clinical-rag and
patient-disengagement demos cannot be produced authentically (the constraint
forbids fabricating synthetic answers). Two acceptable resolutions:

1. Operator points to the real path (likely a different Claude desktop
   workspace, a Cosmos `kb_chunks` row set, or an unindexed iCloud folder).
2. Operator authors the Q&A pairs directly into the fixture schema below
   (4–6 questions × ~300-word answer × 2–4 DOI citations each).

Estimated content cost if authored from scratch: ~3 hrs per project (12
high-quality answers total, ~25 min each).

---

## clinical-rag

### 1. GitHub repo

- **Target name:** `JdeGraftJohnson/clinical-rag-assistant`
- **Visibility:** **public**. The implementation pattern (RAG + DOI
  traversal + knowledge-graph fallback) is portfolio-grade and contains no
  PHI. Public repo strengthens the "evidence-grounded, not clinical
  authority" pitch in the card body.
- **Existing local code:** none found under `~/Git` or `~/Documents` beyond
  the UI scratchpad in `scratch/rag-variants/`. The Gemini-backed live
  endpoint at `/rag` route (referenced in card line 83) is the only running
  artifact — confirm whether it lives in a separate repo before scaffolding
  fresh. **Open question — operator: where does `/rag` route's backend live?**
- **Scrub checklist (run before first push):**
  - No real patient data, no NHS practice IDs, no de-identified-but-linkable
    record samples
  - No `OPENAI_API_KEY`, `GEMINI_API_KEY`, `LANGCHAIN_API_KEY`
    (cf. `LangChainAPIKey.txt` in `~/Documents/Claude/Projects/` — must
    never enter repo history)
  - No client names from card body (Causaly, Maven Clinic, Onsera, Heim
    Health, Gilead, Genomics England) used as if they were customers —
    keep them only in the marketing card, not in repo README
  - No internal Azure resource names (`func-agents-prod-eus2`,
    `cosmos-asi-prod1`, etc.)
- **README outline (~150 words):**
  1. *What it is* — RAG assistant for clinical questions; grounded in
     peer-reviewed evidence with DOI citations
  2. *Architecture* — embed-and-retrieve loop, knowledge-graph fallback,
     refusal pattern when evidence is thin
  3. *Quickstart* — `pip install -e .`, `make ingest`, `python -m
     clinical_rag.serve`
  4. *Evidence corpus* — describes how the corpus is built (PubMed E-utils
     + Crossref + Semantic Scholar Graph API), shipped as a small public
     sample manifest, *not* the corpus itself
  5. *Non-goals* — not a clinical decision authority; no PHI; not
     CE-marked; not FDA-cleared
  6. *Citation* — how to cite this repo
- **License:** MIT
- **Repo layout:**
  ```
  clinical-rag-assistant/
    README.md  LICENSE
    pyproject.toml
    clinical_rag/
      retriever/     # embed + ANN
      graph/         # neo4j or simple JSON KG fallback
      cite/          # DOI resolver + Crossref enrichment
      serve/         # FastAPI app
      eval/          # answer-faithfulness + citation-coverage judges
    corpus/
      sample_manifest.json     # 50 pubmed IDs, public
      ingest.py
    tests/
    docs/
      ARCHITECTURE.md
      EVAL.md
  ```

### 2. Architecture map (`components/architecture/ClinicalRagMap.tsx`)

- **viewBox:** `0 0 1280 1080`
- **5 tiers:** *User Question → Retrieval → Evidence Graph → Answer
  Synthesis → Citation Layer*
- **Per-tier chips:**
  - User Question: `Clinical question`, `Entity extraction (UMLS)`,
    `Intent classifier`, `PHI scrubber`, `Refusal gate`
  - Retrieval: `Dense embed (BGE-large)`, `Sparse BM25`,
    `Hybrid rerank (Cohere)`, `Top-k = 12`, `Score floor 0.62`,
    `Time-window filter`
  - Evidence Graph: `PubMed sample (50 IDs)`, `Crossref DOI resolver`,
    `Semantic Scholar refs`, `MeSH topic walk`, `Drug-target edges`,
    `KG fallback when ANN thin`
  - Answer Synthesis: `Gemini 1.5 (pre-baked in demo)`,
    `System prompt: cite-or-refuse`, `Max 3 unsupported claims`,
    `Faithfulness judge`, `Hallucination guard`
  - Citation Layer: `DOI strip`, `Inline footnotes`,
    `Evidence-thin warning`, `Quote span highlight`,
    `Out-of-corpus refusal`
- **Accent palette:** `#22d3ee` (badgeColor) for primary chips, `#60a5fa`
  for graph-tier accents, `#f59e0b` for guard/refusal callouts
- **Narrative:** "Every claim either resolves to a DOI or the assistant
  refuses to answer."
- **Primitives:** inline Cluster/Chip/Arrow defs mirroring
  `HealthcareDashboardMap.tsx` style (do not add a shared module yet —
  three siblings each ship inline and that's working)
- **Estimated size:** ~230 LOC

### 3. Try It Out demo

- **Route:** `/Users/john/Git/johndegraft-app/app/projects/clinical-rag/page.tsx`
- **Mode:** **static fixture.** The card currently links to live `/rag` —
  redirect the Try It Out to the new demo route (which packs 4-6 pre-
  baked answers) and keep `/rag` as a separately advertised live endpoint
  under a small "Open live assistant" secondary link inside the demo page.
- **Fixture path:** `/Users/john/Git/johndegraft-app/public/demo/clinical-rag/qna.json`
- **Fixture schema:**
  ```jsonc
  {
    "version": "1.0",
    "generated_at": "2026-05-23",
    "model_disclosure": "Pre-generated with Gemini 1.5 Pro on 2026-05-21",
    "questions": [
      {
        "id": "q1",
        "question": "What is the evidence for SGLT2 inhibitor use in heart failure with preserved ejection fraction?",
        "answer_md": "## Short answer\n...full ~250-400 word markdown...",
        "citations": [
          { "title": "EMPEROR-Preserved Trial", "doi": "10.1056/NEJMoa2107038", "url": "https://doi.org/10.1056/NEJMoa2107038", "year": 2021, "venue": "NEJM" }
        ],
        "evidence_quality": "high",
        "related_chart_id": null,
        "refusal": false
      }
    ]
  }
  ```
- **Recommended questions (operator confirms / authors answers):**
  1. SGLT2 inhibitors in HFpEF — evidence summary
  2. GLP-1 receptor agonists for obesity in adolescents — guideline status
  3. Apixaban dose adjustment in CKD stage 4 — renal threshold
  4. CGRP antagonists for chronic migraine — when first-line vs second-line
  5. RSV vaccine in pregnancy — timing and contraindications
  6. *Refusal example:* "Does ivermectin treat COVID-19?" — shows the
     refusal-with-evidence pattern (this is a powerful demonstrator)
- **Components:**
  - `components/demo/clinical-rag/QnaWalkthrough.tsx` (~150 LOC) — wraps
    the shared `QnaPicker`
  - `components/demo/_shared/QnaPicker.tsx` (~180 LOC, shared) — pill row,
    Markdown body via `react-markdown` (already a dep? confirm in
    `package.json`; if not, ship a 40-line minimal MD renderer instead),
    DOI citation strip, evidence-quality badge, refusal styling
  - `components/demo/clinical-rag/EvidenceQualityLegend.tsx` (~40 LOC)
- **Interaction model:** pill row of 4-6 question pills + a "Try a
  refusal" pill last; click → answer panel slides in below; citation
  strip renders as DOI-pill row with hover→full citation tooltip
- **Disclaimers required:**
  - "Evidence-grounded retrieval demonstration. Not a clinical decision
    authority. Not CE-marked or FDA-cleared. Answers were pre-generated
    on a fixed date; pre-baked to keep this page backendless."
- **Estimated total LOC:** demo components ~370 LOC, fixture ~5–8 KB JSON

### 4. Card-level changes in `ProjectsSection.tsx`

- `actions.repo`: `https://github.com/JdeGraftJohnson/clinical-rag-assistant`
- `actions.tryItOut`: `{ kind: "demo", href: "/projects/clinical-rag" }`
  (was `{ kind: "live", href: "/rag" }`)
- `architecture`: `<ClinicalRagMap />` (add import line 7)
- `status`: keep `live`
- `badgeColor`: keep `#22d3ee`
- Body: append one sentence — "Demo ships 6 pre-baked clinical Q&A pairs
  with DOI citations; full live assistant remains at `/rag`."

### 5. Effort estimate

- GitHub repo + README scrub + sample corpus: **4 hrs**
- Architecture map: **3 hrs**
- Try It Out demo (incl. shared `QnaPicker` primitive shared with
  disengagement project): **5 hrs** (3 hrs for shared primitive +
  2 hrs for clinical-rag wrapper); shared primitive cost amortized
- **Subtotal: 12 hrs** (8 hrs if `QnaPicker` cost is charged to
  disengagement instead)
- **Dependencies:** Operator must supply 6 Q&A pairs OR confirm they
  exist somewhere we can reach
- **Risks:** Markdown rendering library bloat — confirm `react-markdown`
  or roll a minimal renderer (lists/bold/inline-code/blockquote only)

---

## patient-disengagement

### 1. GitHub repo

- **Target name:** `JdeGraftJohnson/patient-disengagement-nhs`
- **Visibility:** **public**. Built on **synthetic** CPRD Gold data
  (card body confirms this at line 92). Real CPRD is licensed and must
  never ship — confirmed.
- **Existing local code:** none found beyond
  `scratch/disengagement/v1-crm-workspace-var75.html` (UI mock only). The
  card references a live chat at `https://chat.johndegraft.app` — confirm
  source repo. **Open question — operator: where does
  `chat.johndegraft.app` live?**
- **Scrub checklist:**
  - No real CPRD extracts, no real practice list IDs, no real NHS numbers
    (even hashed)
  - SHAP plots and patient features synthetic only; never seed from real
    data even for demo
  - Synthesizer must be deterministic + seeded so notebook is
    reproducible; document the seed
  - No Azure ML workspace names; no internal `kv-asi-*` references
  - QOF / SNOMED / OMOP CDM code lists are public — fine to ship
- **README outline (~150 words):**
  1. *What it is* — XGBoost early-warning classifier for patient
     disengagement risk in UK primary care, with SHAP explainability
     and an IMD-quintile fairness audit
  2. *Synthetic data* — 10,000-patient synthetic CPRD-shaped cohort;
     generation notebook included
  3. *Compliance posture* — UK GDPR Article 22 design (meaningful human
     review, right to explanation, appeal path); NICE ESF Tier B
     reporting scaffolding
  4. *Quickstart* — `make data && make train && make audit`
  5. *Outputs* — model artefact, SHAP global+local plots, fairness JSON
  6. *Non-goals* — not clinically validated; not a CE-marked SaMD; not
     production-ready for NHS deployment without a sponsor trust
- **License:** MIT for code; CC-BY 4.0 for the synthetic dataset card
- **Repo layout:**
  ```
  patient-disengagement-nhs/
    data/
      generate_synthetic_cprd.ipynb
      synthetic_cohort_v1.parquet   # 10k rows, < 5 MB
      dataset_card.md
    models/
      train_xgb.py
      model_v1.joblib
    explain/
      shap_global.py
      shap_local.py
    fairness/
      equalized_odds.py
      audit_report.py
    serve/
      fastapi_app.py            # demo only, no auth
    docs/
      MODEL_CARD.md             # follows Mitchell et al. 2019
      ARTICLE22_DESIGN.md
      NICE_ESF_TIER_B.md
    tests/
  ```

### 2. Architecture map (`components/architecture/DisengagementMap.tsx`)

- **viewBox:** `0 0 1280 1080`
- **6 tiers:** *Synthetic Data → Feature Engineering → Model → SHAP
  Explainability → Fairness Audit → Decision Surface*
- **Per-tier chips:**
  - Synthetic Data: `10k patient cohort`, `OMOP CDM 5.4`, `SNOMED CT`,
    `QOF condition codes`, `Seed 42 reproducible`, `Dataset card`,
    `CC-BY 4.0`
  - Feature Engineering: `Appointment gap features`, `Prescription
    adherence`, `IMD quintile`, `Ethnicity (synthetic)`, `Comorbidity
    count`, `Age band`, `Rurality (RUC11)`
  - Model: `XGBoost`, `AUC 0.94 (synthetic)`, `Stratified 5-fold`,
    `Class-weight balanced`, `Hyperopt 50 trials`, `Calibration
    (isotonic)`
  - SHAP Explainability: `Global summary`, `Local force plot`,
    `Top-3 drivers per patient`, `Cohort-level waterfall`,
    `Feature interaction heatmap`
  - Fairness Audit: `Equalized-odds difference`, `IMD-quintile gap`,
    `Ethnicity slice`, `Age-band slice`, `Rurality slice`,
    `Threshold sweep`
  - Decision Surface: `Risk tier (Low/Mid/High)`,
    `Recommended action`, `Article 22 review prompt`,
    `Appeal pathway`, `Explanation export`
- **Accent palette:** `#60a5fa` (badgeColor) primary, `#a78bfa` for
  fairness tier (signals the NICE ESF / equity angle), `#f59e0b` for
  Article 22 callouts
- **Narrative:** "Every prediction ships with a SHAP explanation, a
  fairness check, and a human-review prompt — not just a score."
- **Estimated size:** ~250 LOC

### 3. Try It Out demo

- **Route:** `/Users/john/Git/johndegraft-app/app/projects/patient-disengagement/page.tsx`
- **Mode:** **static fixture.** The Try It Out becomes a chat-shaped
  Q&A picker, NOT a live model inference page. Existing live chat at
  `chat.johndegraft.app` stays linked as a secondary CTA.
- **Fixture path:** `/Users/john/Git/johndegraft-app/public/demo/patient-disengagement/qna.json`
- **Fixture schema:** same shape as `clinical-rag/qna.json`, plus optional
  `related_chart_id` referring to a second fixture
  `/Users/john/Git/johndegraft-app/public/demo/patient-disengagement/charts.json`:
  ```jsonc
  {
    "charts": {
      "shap_global": { "type": "bar", "data": [ { "feature": "appointment_gap_90d", "shap": 0.32 } ] },
      "shap_local_patient_42": { "type": "waterfall", "data": [...] },
      "fairness_imd": { "type": "grouped_bar", "data": [...] },
      "calibration": { "type": "scatter", "data": [...] }
    }
  }
  ```
- **Recommended questions (operator authors answers):**
  1. "What features drive this model's disengagement predictions?"
     → `shap_global` chart
  2. "Why was patient #42 flagged as high-risk?" → `shap_local_patient_42`
  3. "How fair is the model across IMD quintiles?" → `fairness_imd`
  4. "What does the model do when it's uncertain?" → calibration +
     refusal pattern
  5. "How does the system comply with Article 22?" → text-only, links
     to repo `docs/ARTICLE22_DESIGN.md`
  6. "What datasets was this trained on?" → text-only, dataset-card
     summary + "synthetic, not real CPRD" emphatic statement
- **Components:**
  - `components/demo/patient-disengagement/QnaWalkthrough.tsx` (~180 LOC)
    wraps shared `QnaPicker` and adds a chart-slot renderer
  - `components/demo/patient-disengagement/MiniChart.tsx` (~120 LOC) —
    pure-SVG bar / waterfall / scatter renderer (avoid Plotly per repo
    convention; mirror PropfirmbotMap chart primitives)
- **Interaction model:** pill row of 6 questions; selecting → answer
  Markdown + optional chart; "Show feature" hover on SHAP bars reveals
  short feature description
- **Disclaimers required:**
  - "Synthetic CPRD-Gold demonstration cohort only. No real patient
    data. Not clinically validated. UK GDPR Article 22 compliant design
    pattern, not a production NHS deployment."
- **Estimated total LOC:** ~300 LOC + ~12 KB charts JSON + ~6 KB qna JSON

### 4. Card-level changes in `ProjectsSection.tsx`

- `actions.repo`: `https://github.com/JdeGraftJohnson/patient-disengagement-nhs`
- `actions.tryItOut`: `{ kind: "demo", href: "/projects/patient-disengagement" }`
  (was `{ kind: "live", href: "https://chat.johndegraft.app" }`)
- `architecture`: `<DisengagementMap />`
- `status`: keep `live`
- `badgeColor`: keep `#60a5fa`
- Body: no edit; existing copy already names synthetic CPRD Gold

### 5. Effort estimate

- GitHub repo (synthetic-cohort generator + model + SHAP + audit): **8 hrs**
  (heaviest of the four — actual model training notebook is real work)
- Architecture map: **3 hrs**
- Try It Out demo (assumes `QnaPicker` already exists from clinical-rag):
  **6 hrs** (chart primitives are extra)
- **Subtotal: 17 hrs**
- **Dependencies:** Operator supplies 6 Q&A pairs; deterministic seed
  chosen and documented; live `chat.johndegraft.app` source repo
  identified (so we know what we're mirroring)
- **Risks:**
  - SHAP-on-synthetic-data plots must look real but not too clean —
    over-pretty plots will read as fake. Add slight noise / realistic
    feature names.
  - Fairness audit on synthetic data only proves the *pipeline* works,
    not the model. Disclaimer must be crisp.

---

## uk-health-map

### 1. GitHub repo

- **Target name:** `JdeGraftJohnson/uk-health-map`
- **Visibility:** **public**. NHS ICB boundaries are public
  (ONS Open Geography Portal). IMD is public (MHCLG). CQC ratings are
  public. Nothing licensed.
- **Existing local code:** Card links to live deployment at
  `https://blue-smoke-00f20d403.7.azurestaticapps.net/map`. **Open
  question — operator: which repo currently builds and deploys that
  Azure Static Web App?** If a repo already exists, target is to clean
  + rename it, not scaffold fresh. Scratch dir
  `scratch/ukmap/v1-analytics-studio-var75.html` is mock only.
- **Scrub checklist:**
  - Any disengagement-risk overlays must use synthetic numbers (cf.
    patient-disengagement repo) — flag if real values exist
  - No NHS practice-level data even if technically public-via-CQC; ICB
    level is the floor
  - No Azure Static Web App deploy tokens in repo
- **README outline (~150 words):**
  1. *What it is* — choropleth visualizer for NHS ICB regions overlaid
     with IMD quintile + CQC rating + (synthetic) disengagement risk
  2. *Data sources* — ONS ICB boundaries, MHCLG IMD 2019, CQC public
     API, synthetic disengagement scores
  3. *Quickstart* — `pnpm install && pnpm dev`
  4. *Drill-down model* — National → Region → ICB → (no further)
  5. *Deployment* — Azure Static Web Apps via GitHub Actions (workflow
     committed); free tier
- **License:** MIT (code) + data license note (ICB shapes © Crown
  copyright + database right; OGL v3)
- **Repo layout:**
  ```
  uk-health-map/
    app/                      # Next.js
      map/page.tsx
      regions/page.tsx
      api/                    # static route handlers; output: 'export'
    components/map/           # Leaflet wrappers
    data/
      icb_2024.geojson        # simplified to < 2MB
      imd_quintile_by_icb.csv
      cqc_rating_by_icb.csv
      disengagement_synth.csv
      build_layers.py         # rebuilds the silver layer
    docs/
      DATA_SOURCES.md
      ATTRIBUTION.md
  ```

### 2. Architecture map (`components/architecture/UkHealthMapMap.tsx`)

- **viewBox:** `0 0 1280 1080`
- **4 tiers:** *Open Data Sources → Silver Layer (Delta) → Static
  Build → Interactive Surface*
- **Per-tier chips:**
  - Open Data Sources: `ONS ICB 2024`, `MHCLG IMD 2019`, `CQC ratings`,
    `Disengagement (synthetic)`, `OGL v3 attribution`
  - Silver Layer (Delta): `topojson simplify`, `ICB ←→ practice
    rollup`, `IMD quintile join`, `CQC last-rating join`,
    `Versioned by build_layers.py`
  - Static Build: `Next.js export`, `Cloudflare Pages / Azure SWA`,
    `~1.6 MB total payload`, `No runtime API`, `CSP locked`
  - Interactive Surface: `Leaflet (MapLibre fallback)`,
    `National → Regional → ICB drill`, `Tooltip composer`,
    `Layer toggle (IMD / CQC / risk)`, `Colorblind-safe palette`
- **Accent palette:** `#34d399` (badgeColor) for primary chips,
  `#22d3ee` for data-source tier, `#f59e0b` for license/attribution
  callouts
- **Narrative:** "Public NHS data + a static build target = zero-cost
  intelligence surface."
- **Estimated size:** ~220 LOC

### 3. Try It Out demo

- **Route:** `/Users/john/Git/johndegraft-app/app/projects/uk-health-map/page.tsx`
- **Mode:** **frozen snapshot embed** — recommended.
  - **Option A (recommended):** Iframe the live Azure SWA with a
    `sandbox="allow-scripts allow-same-origin"` attribute and a "Open in
    new tab" link. Pros: no double-maintenance; live data; fast to
    ship. Cons: cross-origin layout shifts; iframe sandbox can break
    Leaflet pinch-zoom on mobile.
  - **Option B:** Frozen snapshot. Pre-render 3-4 PNG screenshots
    (national, regional, ICB drill, risk overlay) at 2x density and
    show them as a click-through gallery. Pros: zero runtime
    dependency; cacheable. Cons: not actually interactive.
  - **Recommendation: Option A primary** with Option B PNGs as
    fallback (loaded only if iframe fails / `prefers-reduced-motion`).
    The card's badge already says "Live" — Option A keeps that honest.
- **Fixture path:** `/Users/john/Git/johndegraft-app/public/demo/uk-health-map/snapshots/{national,regional,icb,risk}.png`
  (only used in fallback)
- **Components:**
  - `components/demo/uk-health-map/MapEmbed.tsx` (~140 LOC) — iframe
    + load-fail detector + snapshot fallback gallery
  - `components/demo/uk-health-map/LayerLegend.tsx` (~80 LOC) —
    explains IMD / CQC / risk legends *outside* the iframe so they're
    legible on small screens
- **Interaction model:** above-fold iframe (1024x720); below-fold
  legend + "What you're looking at" explainer text + "Open full
  experience" CTA pointing to the Azure SWA URL
- **Disclaimers required:**
  - "ICB boundaries © Crown copyright and database right 2024.
    Contains OS data © Crown copyright; OGL v3."
  - "Disengagement risk overlay is synthetic, illustrative only — see
    `patient-disengagement-nhs` repo for the underlying model."
- **Estimated total LOC:** ~220 LOC (incl. fallback gallery)

### 4. Card-level changes in `ProjectsSection.tsx`

- `actions.repo`: `https://github.com/JdeGraftJohnson/uk-health-map`
- `actions.tryItOut`: change to `{ kind: "demo", href: "/projects/uk-health-map" }`
  (the new embed page that wraps the Azure SWA + legend + disclaimers).
  Existing direct Azure SWA URL becomes the "Open full experience" CTA
  inside that page.
- `architecture`: `<UkHealthMapMap />`
- `status`: keep `live`
- `badgeColor`: keep `#34d399`
- Body: add stack item `Cloudflare Pages` to make clear the demo route
  is static; or leave stack alone since the live app is Azure SWA.

### 5. Effort estimate

- GitHub repo (clean + rename existing, write docs, attribute OGL):
  **4 hrs** — assumes existing repo exists; **+6 hrs** if scaffolding
  fresh from the live deploy
- Architecture map: **2.5 hrs** (simpler tier count)
- Try It Out demo (iframe wrapper + fallback): **3 hrs**
- **Subtotal: 9.5 hrs** (assumes existing repo) / **15.5 hrs** (fresh)
- **Dependencies:** Identify the source repo for the live Azure SWA
- **Risks:** iframe sandbox + Leaflet on iOS Safari — test on real
  device before shipping

---

## health-equity-audit

### 1. GitHub repo

- **Target name:** `JdeGraftJohnson/ai-health-equity-audit`
- **Visibility:** **public**. NICE ESF Tier B requirements are public,
  Fairlearn is public, no licensed inputs.
- **Existing local code:** none found. Card links to `/audit` route on
  this same site. **Open question — operator: is there a backend
  for `/audit` or is it presently a stub?** Scratch dir
  `scratch/audit/v1-analytics-studio-var75.html` is mock only.
- **Scrub checklist:**
  - No real model artefacts from any actual clinical model under audit
  - Synthetic example model only (e.g., a deliberately biased toy
    classifier on synthetic patients), licensed under MIT
  - No NHS trust names or pilot client identifiers in repo
- **README outline (~150 words):**
  1. *What it is* — takes a model's predictions and a demographics
     parquet, emits a structured equity audit report (PDF + JSON)
     against NICE ESF Tier B and NHS Core20PLUS5
  2. *Inputs* — `predictions.parquet` (id, score, label),
     `demographics.parquet` (id, imd_quintile, ethnicity, age_band,
     rurality)
  3. *Outputs* — `audit_report.pdf`, `audit_record.json` (machine-
     readable governance record), `audit_report.md`
  4. *Frameworks referenced* — NICE ESF Tier B, NHS Core20PLUS5,
     UK GDPR Article 22, Fairlearn metrics
  5. *Quickstart* — `pip install ai-health-equity-audit && ai-audit
     run --predictions ./preds.parquet --demographics ./demo.parquet`
- **License:** MIT
- **Repo layout:**
  ```
  ai-health-equity-audit/
    src/equity_audit/
      metrics/      # equalized_odds, demographic_parity, calibration_gap
      slices/       # imd, ethnicity, age_band, rurality
      report/       # pdf (reportlab), markdown, json
      frameworks/   # nice_esf_tier_b.yml, core20plus5.yml, gdpr_article22.yml
      cli.py
    examples/
      toy_model/
        predictions.parquet
        demographics.parquet
        expected_report.pdf
        expected_record.json
    docs/
      NICE_ESF_TIER_B.md
      CORE20PLUS5.md
      LIMITATIONS.md
    tests/
  ```

### 2. Architecture map (`components/architecture/EquityAuditMap.tsx`)

- **viewBox:** `0 0 1280 1080`
- **5 tiers:** *Inputs → Slice Engine → Metric Suite → Framework
  Overlay → Report Emitter*
- **Per-tier chips:**
  - Inputs: `predictions.parquet`, `demographics.parquet`,
    `model_card.yml`, `threshold sweep config`, `audit purpose
    statement`
  - Slice Engine: `IMD quintile (5 slices)`, `Ethnicity (9 ONS
    groups)`, `Age band (4)`, `Rurality (RUC11 → 3)`,
    `Intersectional toggle`, `Min-cell-size guard`
  - Metric Suite: `Equalized-odds diff`, `Demographic parity`,
    `Calibration gap`, `False-negative-rate gap`,
    `Bootstrap CIs (1000)`, `Threshold sensitivity`
  - Framework Overlay: `NICE ESF Tier B checklist`, `NHS
    Core20PLUS5 mapping`, `UK GDPR Art. 22 traceability`,
    `LangSmith run ID`, `inspect_petri eval ID`
  - Report Emitter: `PDF (reportlab)`, `Machine-readable JSON`,
    `Markdown summary`, `Governance record append-only`,
    `Severity bands (Pass / Tighten / Block)`
- **Accent palette:** `#a78bfa` (badgeColor) primary, `#22d3ee` for
  metrics tier, `#f59e0b` for severity-band callouts. The map's
  visual theme should evoke the proposal-ops audit composite
  (operator's strongest pattern) — borrow the severity-band stripe
  from `ProposalJudgeMap.tsx`.
- **Narrative:** "One audit, four slices, three framework overlays,
  one append-only governance record."
- **Estimated size:** ~240 LOC

### 3. Try It Out demo

- **Route:** `/Users/john/Git/johndegraft-app/app/projects/health-equity-audit/page.tsx`
- **Mode:** **static fixture.** SHAP-Viewer-style multi-slice
  comparison page — one synthetic model with deliberately injected
  bias, audit results pre-baked.
- **Fixture path:** `/Users/john/Git/johndegraft-app/public/demo/health-equity-audit/audit.json`
- **Fixture schema:**
  ```jsonc
  {
    "version": "1.0",
    "model_under_audit": {
      "name": "synthetic_disengagement_v0",
      "auc": 0.92,
      "n_predictions": 8000,
      "threshold": 0.5,
      "disclosure": "Deliberately biased toy model. Do not use."
    },
    "slices": {
      "imd_quintile": [
        { "label": "1 (most deprived)", "n": 1600, "tpr": 0.71, "fpr": 0.22, "eod_vs_baseline": 0.09 },
        { "label": "2", "n": 1600, "tpr": 0.79, "fpr": 0.18, "eod_vs_baseline": 0.04 },
        { "label": "3", "n": 1600, "tpr": 0.82, "fpr": 0.17, "eod_vs_baseline": 0.00 },
        { "label": "4", "n": 1600, "tpr": 0.85, "fpr": 0.15, "eod_vs_baseline": -0.03 },
        { "label": "5 (least deprived)", "n": 1600, "tpr": 0.88, "fpr": 0.13, "eod_vs_baseline": -0.06 }
      ],
      "ethnicity": [ /* 5-9 ONS groups */ ],
      "age_band": [ /* 4 bands */ ],
      "rurality": [ /* 3 categories */ ]
    },
    "framework_overlays": {
      "nice_esf_tier_b": {
        "verdict": "TIGHTEN",
        "passed": 11,
        "tightened": 3,
        "blocked": 0,
        "items": [ { "id": "B.4.2", "status": "tightened", "note": "IMD-1 TPR gap > 0.05 threshold" } ]
      },
      "core20plus5": { "verdict": "PASS", "items": [...] },
      "gdpr_article_22": { "verdict": "PASS", "items": [...] }
    },
    "report_artifacts": {
      "pdf_path": "/demo/health-equity-audit/audit_report.pdf",
      "markdown_path": "/demo/health-equity-audit/audit_report.md"
    }
  }
  ```
- **Components:**
  - `components/demo/health-equity-audit/AuditViewer.tsx` (~280 LOC) —
    top tab selector (IMD / Ethnicity / Age / Rurality), bar-chart
    panel per slice with EOD callouts, framework-overlay accordion,
    download buttons for the pre-baked PDF + Markdown
  - `components/demo/health-equity-audit/SliceBars.tsx` (~120 LOC) —
    pure-SVG grouped bar chart with threshold lines
  - `components/demo/health-equity-audit/VerdictPill.tsx` (~30 LOC)
- **Interaction model:** tab row of 4 slices; bar chart of TPR/FPR by
  slice value with horizontal threshold lines; click a slice row →
  modal with bootstrap CI + framework citations; "Download report"
  serves a static pre-baked PDF
- **Disclaimers required:**
  - "Synthetic deliberately-biased toy model for demonstration. Not a
    real clinical AI under audit. NICE ESF Tier B and NHS
    Core20PLUS5 references are accurate to public guidance as of
    2026-05; this tool is not endorsed by NICE or NHS England."
- **Estimated total LOC:** ~430 LOC + ~3 KB fixture JSON + a pre-baked
  PDF (~80 KB, generated once with reportlab)

### 4. Card-level changes in `ProjectsSection.tsx`

- `actions.repo`: `https://github.com/JdeGraftJohnson/ai-health-equity-audit`
- `actions.tryItOut`: `{ kind: "demo", href: "/projects/health-equity-audit" }`
  (was `{ kind: "live", href: "/audit" }`). Decide whether `/audit`
  redirect-308s to `/projects/health-equity-audit` or stays as a
  separate marketing landing. **Recommendation:** 308 the bare `/audit`
  to the new demo route to consolidate.
- `architecture`: `<EquityAuditMap />`
- `status`: keep `pilot`
- `badgeColor`: keep `#a78bfa`
- Body: append one sentence — "Demo audits a deliberately biased
  synthetic model so you can see the severity bands trigger."

### 5. Effort estimate

- GitHub repo (metrics suite, slice engine, framework overlays, PDF
  emitter, toy-model example): **10 hrs**
- Architecture map: **3 hrs**
- Try It Out demo (heaviest UI of the four — SHAP-viewer-style multi-
  slice comparator): **8 hrs**
- **Subtotal: 21 hrs**
- **Dependencies:** Pre-baked PDF must be generated by the actual
  reportlab pipeline (closes the loop on "this tool produces this
  artefact"); generated once and committed.
- **Risks:**
  - Pure-SVG grouped bar charts with bootstrap CI bars is finicky —
    budget extra polish time
  - Framework references (NICE ESF Tier B item codes) must be
    accurate; one wrong code costs credibility. Cross-check against
    the public NICE ESF document before shipping.

---

## Shared scaffolding (build first, charge to whichever project comes first)

1. `components/demo/_shared/QnaPicker.tsx` (~180 LOC) — used by
   clinical-rag + patient-disengagement
2. `components/demo/_shared/DisclaimerCard.tsx` (~40 LOC) — used by all four
3. `components/demo/_shared/MiniSvgChart.tsx` (~150 LOC) — used by
   patient-disengagement + health-equity-audit (bar + waterfall +
   grouped-bar + scatter)
4. `components/architecture/_shared/primitives.tsx` (OPTIONAL — defer;
   current pattern inlines per-map). Only extract if a fifth sibling map
   is added.

**Total shared scaffold:** ~370 LOC, ~4 hrs.

---

## Overall delivery sequence

1. **Day 1 (4 hrs):** Shared scaffolding (`QnaPicker`,
   `DisclaimerCard`, `MiniSvgChart`).
2. **Day 1–2 (12 hrs):** clinical-rag end-to-end (repo + map + demo).
   Validates `QnaPicker` and the Markdown-render approach.
3. **Day 3 (17 hrs):** patient-disengagement (heaviest repo work).
4. **Day 4 (9.5–15.5 hrs):** uk-health-map (lightest demo, repo TBD).
5. **Day 5 (21 hrs):** health-equity-audit (heaviest demo work).

**Total: 63.5–69.5 hrs** (≈ 9 working days at ~7 hrs/day).

If shared scaffolding is reused across all four, total drops by ~3 hrs
to **60.5–66.5 hrs**.

---

## Open questions for the operator (must resolve before execution)

1. **Q&A pairs location.** Operator states they live under
   `/Users/john/Documents/Claude/Projects/` but no Q&A files exist
   there. Either point to the real path or commit to authoring 6+6 = 12
   pairs (≈ 6 hrs of authoring).
2. **Existing repos.** Do `clinical-rag`, `patient-disengagement` (live
   chat at `chat.johndegraft.app`), `uk-health-map` (Azure SWA), or
   `health-equity-audit` already have source repos somewhere? If yes,
   the GitHub-setup column drops by ~50% for each that exists.
3. **Iframe-or-snapshot for uk-health-map.** Plan recommends iframe;
   confirm before building. (Affects Day 4 LOC.)
4. **Markdown renderer.** Add `react-markdown` (and `remark-gfm`) as a
   dep, or roll a 40-line minimal renderer? Confirms once for both Q&A
   demos.
5. **`/audit` and `/rag` existing routes.** Demolish, 308 to new
   `/projects/...` route, or keep as parallel live endpoints? Plan
   recommends 308 for `/audit`, keep parallel for `/rag` with a link.

---

End of plan.
