# Portfolio Project-Button Audit Runbook

Standardised methodology for auditing every project card on `johndegraft.app` —
the **GitHub**, **Architecture**, and **Try It Out** buttons. Run this before
shipping a new project, after any DNS or deploy-pipeline change, and on demand
when a stakeholder reports a broken card.

---

## 1. Mental model

Every project card in `components/ProjectsSection.tsx` has three CTAs. Each
has a binary "wired vs disabled" state and, when wired, a binary "target
healthy vs target broken" state. The audit verifies both layers.

| Button | Wired when | Disabled UX | Target check |
|---|---|---|---|
| **GitHub** | `actions.repo` is set | Greyed span, `title="Repo private"` | HTTP 200 on the repo URL |
| **Architecture** | `architecture` ReactNode is set | Greyed span, `title="Architecture map coming soon"` | Component renders without runtime error (build-time + Playwright check) |
| **Try It Out** | `actions.tryItOut` is set | Greyed span, `title="Demo not yet published"` | HTTP 200 + visible content (for hosted demos: SVG/iframe/canvas present) |

A disabled button is **not** a bug — it is intentional state. The audit
records "intentional-disabled" separately from "broken-wired."

---

## 2. Checklist (run this in order)

### 2.1 Static-routing check — HTTP probes

```bash
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 \
(KHTML, like Gecko) Version/17.5 Safari/605.1.15'

probe() {
  code=$(curl -sI -L -A "$UA" -o /dev/null -w "%{http_code}" "$1")
  echo "  $code  $1"
}

# GitHub repos referenced from PROJECTS[].actions.repo
for u in <repos-from-ProjectsSection>; do probe "$u"; done

# Try It Out targets — both internal /projects/* and external hostnames
for u in <try-it-out-urls>; do probe "$u"; done

# Pages Functions — OPTIONS, not HEAD. HEAD doesn't synthesise from GET
# in CF Pages so it returns 404 on perfectly healthy functions. The
# difference between 404 and 405 is the real signal: 404 = function
# missing, 405 = function exists but method not implemented.
for u in /api/clinical-chat /api/ukhealth-chat /api/pbi-token; do
  code=$(curl -sI -A "$UA" -X OPTIONS -o /dev/null -w "%{http_code}" \
    "https://johndegraft.app$u")
  echo "  OPTIONS $code  $u"
done
```

A `404` on any function route means `functions/` was not uploaded with the
deploy — see §5.1.

### 2.2 Bot Fight Mode bypass

The Cloudflare zone has Bot Fight Mode toggled off after the 2026-05-27
incident (see memory `project_johndegraft_app_dns_revert_2026-05-27`), so
a plain browser UA is sufficient. If you ever see `cf-mitigated: challenge`
on probes, the zone-level setting has flipped back — turn it off at
Cloudflare → Security → Bots before re-running the audit.

### 2.3 Browser-render check — Playwright

HTTP 200 does not prove the page renders. Many failures (Power BI hangs,
react-leaflet hydration errors, dead iframe targets) only surface client-
side. Use `scripts/debug/playwright-project-pages.mjs`:

```bash
npm install --no-save playwright@1.60.0
npx playwright install chromium      # one-time
node scripts/debug/playwright-project-pages.mjs
```

The script visits each `/projects/*` page, waits 7 seconds for hydration,
collects `console` errors + `pageerror` + `requestfailed`, snaps a full-page
screenshot to `scripts/debug/out/<slug>.png`, and emits a per-page verdict.
Each verdict is a DOM-shape assertion specific to that page:

| Slug | DOM-shape assertion |
|---|---|
| `healthcare-map` | `.leaflet-container svg path` count ≥ 50 (one per US state + DC + territories) |
| `healthcare-dashboard` | `<iframe>` exists AND `src` matches `app.powerbi.com/reportEmbed` AND no visible "Failed/Error" banner |
| `uk-health-map` | `<iframe>` exists AND its `src` returns HTTP 200 from the same Playwright context |
| `proposal-intelligence` | At least one `<h1>/<h2>/<h3>` rendered (page is editorial) |
| `propfirmbot` | At least one `<svg>/<canvas>` rendered (page has visualisations) |

Add a new project? Add a corresponding `verdict` lambda in the script — DOM
shape is the only reliable signal that "the actual feature is working,"
not just that the route is 200.

### 2.4 Build-time check

A green `npm run build` is a precondition. Run from repo root:

```bash
npm run build
ls out/projects/*/index.html out/projects/*.html 2>/dev/null
```

Next 14 static export emits routes as either `<slug>/index.html` (when the
folder contains sub-routes) or `<slug>.html` (when it's a single page).
Both are normal — listing both patterns confirms each route built.

### 2.5 CI smoke gate

`deploy.yml` runs a post-deploy smoke test against `johndegraft-app.pages.dev`
(the unprotected origin — apex is fronted by the same artifact but the
zone-level WAF can interfere). The smoke step covers:

- `GET /` `/rag` `/audit` — must return 200 each
- `OPTIONS /api/ukhealth-chat` — must NOT return 404 (function-deployment regression guard)

Any new always-on Pages Function should be added to the OPTIONS guard so
a regression of the "functions/ not in deploy artifact" class fails CI.

---

## 3. Recording results — the matrix format

Always present the audit as a per-project matrix. Three states per cell:

- `OK` — wired and target healthy
- `WIRED-BROKEN` — wired but target failing (action required)
- `INTENT-DISABLED` — no source defined, expected disabled state (no action)

Example:

| Project | GitHub | Architecture | Try It Out | Notes |
|---|---|---|---|---|
| AI Proposal Intelligence | OK | OK | OK | clean |
| Healthcare Dashboard Ops | OK | OK | WIRED-BROKEN (dashboard PBI hangs) | see §5.3 |
| UK Health Map | INTENT-DISABLED | INTENT-DISABLED | WIRED-BROKEN (iframe target 404) | see §5.2 |

---

## 4. Known-good current state (2026-05-27)

| Project | GitHub | Architecture | Try It Out |
|---|---|---|---|
| AI Proposal Intelligence | OK | OK | OK |
| Healthcare Dashboard Ops | OK | OK | overview OK · `/map` OK · `/dashboard` WIRED-BROKEN |
| Clinical RAG | INTENT-DISABLED | INTENT-DISABLED | OK |
| Patient Disengagement | INTENT-DISABLED | INTENT-DISABLED | OK |
| UK Health Map | INTENT-DISABLED | INTENT-DISABLED | WIRED-BROKEN |
| AI Health Equity Audit | INTENT-DISABLED | INTENT-DISABLED | OK |
| propfirmbot | OK | OK | OK |
| StockHub | INTENT-DISABLED | INTENT-DISABLED | OK |

---

## 5. Known failure modes & fixes

### 5.1 All `/api/*` routes return 404

**Symptom:** `OPTIONS https://johndegraft.app/api/<any>` returns 404.

**Cause:** The `deploy` job in `.github/workflows/deploy.yml` downloaded the
`out/` artifact but didn't check out the repo, so `functions/` was absent
from the deploy job's CWD. Wrangler v3 auto-discovers `./functions/` from
CWD when running `pages deploy <static-dir>` — but only from CWD.

**Fix (already shipped, commit `b16b854`):** Add `actions/checkout@v4` plus
a `test -d functions` sanity check before the wrangler step. Smoke now
OPTIONS `/api/ukhealth-chat` to guard against regression.

### 5.2 UK Health Map iframe returns 404

**Symptom:** `/projects/uk-health-map` chrome renders but the iframe body
is empty / 404.

**Cause:** `EMBED_URL` in `app/projects/uk-health-map/page.tsx` hardcodes
`https://blue-smoke-00f20d403.7.azurestaticapps.net/map/explore`. That SWA
was in the decommissioned legacy Azure account (`stasiprodeus2`) and the
artifact was not preserved during migration. No source code exists in any
of the user's GitHub repos. Wayback Machine has no snapshots.

**Status:** **No fix available without rebuilding.** Three remediation
paths exist:

1. **Inline rebuild** in `johndegraft-app` using the same react-leaflet
   pattern as `components/demo/healthcare/USRxMap.tsx`, with NHS ICB
   boundary GeoJSON from ONS / NHS Digital. ~2–4 hours.
2. **Re-source the original** from any external backup the user has
   (machine archive, old commits in a deleted repo, etc.), then deploy
   to a new prod1 SWA and update `EMBED_URL`.
3. **Disable Try-It-Out** — remove the `tryItOut` field from the
   `uk-health-map` entry in `PROJECTS`. Button becomes greyed with
   "Demo not yet published" tooltip. ~5 minutes, reversible.

Until one of the above ships, the matrix entry stays `WIRED-BROKEN`.

### 5.3 Power BI dashboard hangs on "Loading data…"

**Symptom:** `/projects/healthcare-dashboard/dashboard` iframe embeds
correctly (token endpoint returns valid `reportId` + `embedUrl` + `token`),
but the Power BI client itself hangs on the "Loading data…" spinner and
the browser console shows a `400` from `app.powerbi.com`.

**Cause:** The Medicaid dataset has Row-Level Security enforced — the
PBI API returns `400 "Creating embed token for accessing dataset <id>
requires effective identity to be provided"` if no `identities` block is
included in the GenerateToken call. `functions/api/pbi-token.ts` provides
an identity (`username: "portfolio-viewer"`, `roles: ["state_code"]`),
which is enough for the token to mint and the iframe to embed — but the
`state_code` RLS role filters by `USERNAME()` and `"portfolio-viewer"`
matches zero rows. All visuals return empty result sets; the client
shows the spinner indefinitely.

**Status:** **Upstream fix required in the PBI semantic model.** The
portfolio-app side is doing everything it can — the token mints, the
identity is delivered, the iframe embeds. The dataset just needs its
RLS DAX widened to admit the `portfolio-viewer` username.

#### Diagnostic chain (replicate before changing anything)

1. **Token mints?** `curl -s -A "<UA>" https://johndegraft.app/api/pbi-token`
   → expect JSON with `reportId`/`embedUrl`/`token`/`expiration`.
   If you see `"requires effective identity to be provided"`, the
   dataset has RLS enforced and the `identities` block in
   `functions/api/pbi-token.ts` is **mandatory** — do not remove it.
2. **Iframe embeds?** Run `node scripts/debug/playwright-project-pages.mjs`,
   look at the `healthcare-dashboard` verdict — `has_pbi_iframe: true`
   confirms PBI client loaded with the token.
3. **Visuals render?** Open the screenshot at
   `scripts/debug/out/healthcare-dashboard.png`. If you see "Loading
   data…" with tabs visible at the bottom (Main / US RX Details / Data
   Tables) and no chart content, the model accepted the embed but every
   visual's query returned zero rows for this `USERNAME()`.

#### Fix recipe — patch the semantic model via Fabric REST

The dataset's authoritative definition lives in the **healthcare-cost-ops**
repo at `examples/medicaid_sdud_2026/out/model.bim`. As of the
audit, the `state_code` role is defined as:

```jsonc
"roles": [
  {
    "name": "state_code",
    "modelPermission": "read",
    "tablePermissions": [
      {
        "name": "fact_sdud",
        "filterExpression": "fact_sdud[state_code] = USERNAME()"
      }
    ]
  }
]
```

Patch the `filterExpression` to add a public bypass branch keyed on the
embed identity that `functions/api/pbi-token.ts` already sends:

```dax
fact_sdud[state_code] = USERNAME() || USERNAME() = "portfolio-viewer"
```

Any other `USERNAME()` value still filters by state code; only the
portfolio embed sees the full row-set.

Publish via the existing toolchain in **healthcare-cost-ops**:

```bash
cd /Users/john/Git/healthcare-cost-ops
# 1. Edit the role filterExpression in examples/medicaid_sdud_2026/out/model.bim
# 2. Auth to Fabric (the script reads `az account get-access-token \
#    --resource https://api.fabric.microsoft.com`):
az login --tenant <prod1-tenant-id>
# 3. Publish:
python -m services.powerbi.fabric_publish \
  --workspace "$PBI_WORKSPACE_ID" \
  --model examples/medicaid_sdud_2026/out/model.bim \
  --layout examples/medicaid_sdud_2026/out/layout.json \
  --name medicaid_sdud_2026 \
  --verbose
```

`PBI_WORKSPACE_ID` is the same value stored in the Cloudflare Pages
project (`johndegraft-app` → Settings → Environment Variables).
`fabric_publish.py` uses the Fabric REST `Items` API and republishes
the semantic-model definition in TMSL form, base64-encoded. Logs print
the new `semantic_model_id`.

#### Verify after publish

```bash
# Token mint should still succeed
curl -s -A "<UA>" https://johndegraft.app/api/pbi-token | jq '.reportId'

# Visuals should now load — verdict transitions from "Loading data…"
# to populated chart tiles
node scripts/debug/playwright-project-pages.mjs
# Inspect scripts/debug/out/healthcare-dashboard.png
```

#### If you change the role name

If you rename `state_code` or add a sibling public role, update
**both** constants in `functions/api/pbi-token.ts:14-15`:

```ts
const EMBED_USERNAME = "portfolio-viewer";
const EMBED_ROLES    = ["state_code"];
```

The username can be any non-empty string — only the role-name and the
DAX expression's branch keyed on that username need to agree.

Until the BIM patch ships, the dashboard stays `WIRED-BROKEN`. The
`/map` choropleth on the same project renders correctly and is the
recommended "Try It Out" entry point in the meantime.

### 5.4 react-leaflet map stuck on "Loading map…"

**Symptom:** `/projects/healthcare-dashboard/map` renders the loading
placeholder forever.

**Diagnostic:** Run the deeper single-page probe:

```bash
node scripts/debug/playwright-us-map.mjs
```

It reports `svg_path_count`, `tile_count`, console errors, and screenshot.
If `svg_path_count ≥ 50` and `still_showing_loading === false`, the map IS
rendering — the report is stale or a cache layer is involved.

Real failure modes (ordered by frequency):
1. **react-leaflet v4 / Next 14 static-export ESM interop.** Symptom:
   `Cannot read properties of undefined (reading 'Map')`. Fix: ensure
   `experimental.esmExternals` is unset (Next 14 default) and
   `react-leaflet` pinned to `^4.2.1`.
2. **`leaflet/dist/leaflet.css` not loaded in the dynamic chunk.**
   Fix: move the import to `app/layout.tsx`.
3. **MapContainer missing `style={{ height }}`.** Leaflet renders 0×0
   without explicit height. Already addressed in
   `components/demo/healthcare/USRxMapView.tsx:133`.

---

## 6. When to run this audit

- **Before every PR that touches `components/ProjectsSection.tsx`.**
- **After every Cloudflare DNS, WAF, or Pages-project configuration change.**
- **After every Azure resource change** (a project may depend on an
  external Azure backend — SWA, Function, Power BI workspace).
- **On demand** when a stakeholder reports any project card looks wrong.
- **Quarterly** as a regression check even when nothing has changed —
  upstream services (GitHub, Power BI, external SWAs) drift independently.

---

## 7. Reference

- `components/ProjectsSection.tsx` — `PROJECTS` array (lines ~45–221),
  button render (lines ~397–419), `ActionButton` disabled-state logic
  (lines ~233–281).
- `scripts/debug/playwright-project-pages.mjs` — multi-page sweep.
- `scripts/debug/playwright-us-map.mjs` — single-page deep probe.
- `.github/workflows/deploy.yml` — typecheck + build + deploy + smoke.
- Memories: `project_johndegraft_app_dns_revert_2026-05-27`,
  `reference_johndegraft_cosmos_kb`, `feedback_playwright_verify`.
