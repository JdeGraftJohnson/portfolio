# Project Demo Maintenance Runbook

Recovery guide for when a project page on **johndegraft.app** shows a 404, broken
embed, or "site disabled" panel. Each section maps the surface symptom to the
underlying host, the typical root cause, and the exact recovery steps.

The portfolio shell itself is served from Cloudflare Pages. Most project pages
are static; the few that embed live demos pull from external hosts (Azure
Static Web Apps, Azure Functions, Power BI). When the shell loads but an
embedded demo 404s, the issue is almost always one of those external hosts —
not the portfolio.

## 1. Hosting topology at a glance

| Surface | Host | Repo / source | Notes |
|---|---|---|---|
| `johndegraft.app` (shell, all routes) | Cloudflare Pages — `johndegraft-app` project | `JdeGraftJohnson/portfolio` (after migration) | Static export, `next.config.mjs` `output: "export"`. |
| `/projects/uk-health-map` page | (shell — Cloudflare Pages) | `app/projects/uk-health-map/page.tsx` | Embeds the SWA below as an `<iframe>`. |
| UK Health Map embed | Azure Static Web App — `swa-johndegraft-prod1` | host: `white-sea-0fb63720f.7.azurestaticapps.net`, path: `/map/explore` | Free tier, RG `rg-asi-prod1-eus2`. **Was on the legacy `blue-smoke-...` SWA pre-migration — that host is decommissioned and 404s.** |
| `/projects/healthcare-dashboard` page | (shell) | `app/projects/healthcare-dashboard/page.tsx` | Static. |
| `/projects/healthcare-dashboard/dashboard` (Power BI) | (shell, with Power BI embed inside) | `app/projects/healthcare-dashboard/dashboard/page.tsx` | The embed talks to `app.powerbi.com`. Note: Playwright `networkidle` never settles here because Power BI keeps polling; this is expected, not a failure. |
| `/projects/healthcare-dashboard/map` | (shell) | static GIS choropleth | No external host. |
| `/projects/propfirmbot` | (shell) | `app/projects/propfirmbot/page.tsx` + `components/demo/propfirmbot/*` | Static. No external host. |
| `/projects/proposal-intelligence` | (shell) | `app/projects/proposal-intelligence/page.tsx` | Static. Reads bundled JSON in `public/demo/proposal-intelligence/*.json`. |
| `/audit` | (shell) | `app/audit/*` | Static frontend. Optional FastAPI backend is local-dev only — no public endpoint required for the marketing route to render. |
| Clinical RAG chat widget (`/api/clinical-chat`) | Cloudflare Pages Function | `functions/api/clinical-chat.ts` | Same Pages project — co-deployed. |
| UK Health chat widget (`/api/ukhealth-chat`) | Cloudflare Pages Function | `functions/api/ukhealth-chat.ts` | Same Pages project — co-deployed. |

**Azure account separation:** all portfolio-hosted SWAs live under
`rg-asi-prod1-eus2` in subscription `4f80e7d4-e5ec-4174-b98a-89899a6cf056`
but are namespaced `swa-johndegraft-*` or `swa-portfolio-*`. Never touch
`swa-asi-prod1`, `swa-chat-prod1`, `swa-stockhub-prod1` — those belong to the
fintech production stack.

## 2. Liveness check (Playwright)

A canned Playwright script that walks every project page and reports HTTP
status + failed sub-requests lives at `/tmp/audit_live_projects.mjs` (not in
the repo — it is a session-local diagnostic). To run a manual liveness pass:

```bash
node -e "
import('/Users/john/Git/johndegraft-app/node_modules/playwright/index.js').then(async ({ chromium }) => {
  const browser = await chromium.launch();
  const page = await browser.newContext().then(c => c.newPage());
  const fails = [];
  page.on('response', r => { if (r.status() >= 400) fails.push([r.status(), r.url()]); });
  for (const url of [
    'https://johndegraft.app/',
    'https://johndegraft.app/projects/proposal-intelligence',
    'https://johndegraft.app/projects/healthcare-dashboard',
    'https://johndegraft.app/projects/uk-health-map',
    'https://johndegraft.app/projects/propfirmbot',
    'https://johndegraft.app/audit',
  ]) {
    fails.length = 0;
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log(r.status(), url, fails.length ? '\\n  failures: ' + JSON.stringify(fails) : '');
  }
  await browser.close();
});
"
```

A clean run: every URL returns 200, no sub-request failures except (acceptable)
Power BI long-polling timeouts. Anything else is a regression.

Faster shell-only check (no embeds):

```bash
for p in / /projects/proposal-intelligence /projects/healthcare-dashboard \
         /projects/healthcare-dashboard/dashboard /projects/uk-health-map \
         /projects/propfirmbot /audit; do
  s=$(curl -s -o /dev/null -w "%{http_code}" "https://johndegraft.app$p")
  echo "  $s  $p"
done
```

## 3. Failure modes and recovery

### 3.1 `/projects/uk-health-map` shows blank panel or "404 — Page Not Found"

The most common cause. The page itself loads fine — the embedded iframe at
`app/projects/uk-health-map/page.tsx`'s `EMBED_URL` is pointing at a dead
Azure Static Web App.

**Diagnose:**

```bash
EMBED=$(grep -m1 EMBED_URL app/projects/uk-health-map/page.tsx | sed -E 's/.*"(https:[^"]+)".*/\1/')
echo "currently embedded: $EMBED"
curl -sI "$EMBED" | head -3
```

If the curl returns 404, the SWA at that host is gone.

**Recover:** find the current SWA hostname under the portfolio's resource
group and update the embed URL.

```bash
az staticwebapp list \
  --query "[?starts_with(name,'swa-johndegraft') || starts_with(name,'swa-portfolio')].{name:name, host:defaultHostname, rg:resourceGroup}" \
  -o table
```

Pick the SWA whose root path returns `<title>UK NHS Health Risk Map</title>`:

```bash
for host in $(az staticwebapp list \
  --query "[?starts_with(name,'swa-johndegraft') || starts_with(name,'swa-portfolio')].defaultHostname" -o tsv); do
  t=$(curl -s "https://$host/" | grep -oE '<title>[^<]+</title>' | head -1)
  echo "  $host  $t"
done
```

The match (currently `white-sea-0fb63720f.7.azurestaticapps.net`) is the new
embed host. Update `app/projects/uk-health-map/page.tsx`:

```ts
const EMBED_URL = "https://<new-host>/map/explore";
```

Commit (`fix(uk-health-map): point embed at current SWA host`), push, and let
Cloudflare Pages auto-build. Re-run the liveness check.

### 3.2 `/projects/healthcare-dashboard/dashboard` "loads forever" in Playwright

Not a failure. The Power BI embed inside that page keeps long-polling
`app.powerbi.com`, so `waitUntil: "networkidle"` will time out at 25s even
when the page is fully usable. Verify with `domcontentloaded`:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}  %{time_total}s  %{size_download}b\n" \
  https://johndegraft.app/projects/healthcare-dashboard/dashboard
```

A `HTTP 200` under 1s with size > 30KB is a passing result.

If Power BI itself is degraded (rare), the embed shows a small white panel
inside an otherwise-rendered page. Check `https://status.powerbi.com` and
wait — no recovery action is owned by this repo.

### 3.3 Chat widgets (Clinical RAG, UK Health) return 500 or CORS error

The chat widgets POST to `/api/clinical-chat` and `/api/ukhealth-chat`,
which are Cloudflare Pages Functions co-deployed in `functions/api/`.
If they fail:

1. Open the browser devtools network tab on the live site, send a test
   prompt, inspect the failing request.
2. If `404`: the Pages Function didn't deploy. Trigger a rebuild from the
   Cloudflare Pages dashboard for the `johndegraft-app` project (or push a
   trivial commit to the source repo to retrigger the deploy).
3. If `500`: tail the function logs in `Cloudflare → Pages → johndegraft-app
   → Functions → Logs`. Usual cause is a missing or rotated secret
   (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, vector store config) — rotate
   under Pages → Settings → Environment variables and redeploy.
4. If browser shows a CORS error: confirm the request `Origin` is in the
   allowlist in `functions/api/clinical-chat.ts` and `functions/api/ukhealth-chat.ts`
   (`SITE`, `https://johndegraft-app.pages.dev`, and the preview-deploy regex).
   Add the new origin if a custom domain or preview slug changed.

### 3.4 Entire site returns 404 / "site not found"

Cloudflare Pages connection issue, not a 404 inside the site.

1. Confirm the Cloudflare Pages project `johndegraft-app` is still wired to
   the source repo (now `JdeGraftJohnson/portfolio`): Dashboard → Workers &
   Pages → johndegraft-app → Settings → Builds & deployments → Source.
2. Trigger a manual redeploy if needed (Deployments → Retry).
3. Verify the apex DNS record at the registrar still points to Cloudflare
   nameservers and the CF DNS record for `johndegraft.app` still flattens to
   `johndegraft-app.pages.dev`.

### 3.5 A project page returns 404 on a route that previously worked

Static export drift. Cloudflare Pages only serves what's in the last successful
build's `out/` directory.

1. Confirm the route exists at `app/<route>/page.tsx` on `main` of
   `JdeGraftJohnson/portfolio`.
2. Pull the latest CF Pages deploy log: Dashboard → Pages → johndegraft-app →
   Deployments → most recent. If build status is "failed", the previous good
   build is still serving — read the build log, fix the regression, push.
3. Local repro: `npm run build` from the repo root, then inspect `out/<route>/index.html`.

## 4. Adding a new external embed safely

To avoid repeating the `blue-smoke → white-sea` rename pain:

1. Never hardcode a `*.azurestaticapps.net` hostname in `app/`. Use a
   constant at the top of the page file (as today) — but also add a
   one-line comment naming the SWA resource (`// swa-johndegraft-prod1 (RG: rg-asi-prod1-eus2)`)
   so the next person can re-resolve the host from Azure without spelunking.
2. If the demo is identity-sensitive or production-critical (it isn't, for the
   portfolio), point at a vanity CNAME on a domain you control instead of the
   default Azure hostname.
3. Add the new page URL to the canned Playwright liveness loop in §2.

## 5. Verification checklist (post-fix)

After any change above:

- [ ] `curl -sI https://johndegraft.app/<changed-path>` returns `200`.
- [ ] Run §2 Playwright sweep. Every route returns 200; no sub-request
      `>= 400` except acceptable Power BI long-poll timeouts.
- [ ] Click each embedded demo manually in a real browser. Confirm content
      renders and any chat widget round-trips successfully.
- [ ] Latest Cloudflare Pages deploy is green.
