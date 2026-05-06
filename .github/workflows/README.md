# GitHub Actions — Cloudflare Pages deploy

`deploy.yml` is the production deploy pipeline for this repo. It is also a
template you can copy into other static-export Next.js sites.

## What it does

```
push main ─┐
PR open    ├──▶  validate (typecheck) ──▶ build (next export) ──▶ deploy ──▶ smoke
manual     ┘                                                                 (main + push only)
```

| Job        | Purpose                                                                  |
|------------|--------------------------------------------------------------------------|
| `validate` | `tsc --noEmit`. Blocks the rest of the pipeline if types break.          |
| `build`    | `npm run build` → asserts `out/` exists and `out/index.html` is non-empty. Uploads `out/` as an artifact so deploy doesn't rebuild. |
| `deploy`   | `cloudflare/wrangler-action@v3` → `pages deploy out` against the project. Pushes to `main` go to production; everything else is a Cloudflare preview at `<branch>.<project>.pages.dev`. |
| `smoke`    | After a push to `main`, curls `/`, `/rag`, `/audit` against the production hostname and fails if any returns non-200 (with 5x retry for cold-start latency). |

Forked-PR runs skip `deploy` (no secrets exposure). Concurrency is ref-scoped
with `cancel-in-progress`, so superseding pushes don't queue stale deploys.

## Required GitHub secrets

| Secret                  | Where to get it                                                                 |
|-------------------------|----------------------------------------------------------------------------------|
| `CLOUDFLARE_API_TOKEN`  | https://dash.cloudflare.com/profile/api-tokens — use the **"Cloudflare Pages — Edit"** template, scope to the right account. |
| `CLOUDFLARE_ACCOUNT_ID` | Top-right of the Cloudflare dashboard, or `npx wrangler whoami`.                |

Set them via:

```bash
gh secret set CLOUDFLARE_API_TOKEN  -R <owner>/<repo>
gh secret set CLOUDFLARE_ACCOUNT_ID -R <owner>/<repo>
```

Or in GitHub: Settings → Secrets and variables → Actions → New repository secret.

The token is per-deploy; rotate on personnel changes or quarterly. Never check
it into the repo, and never log it from a workflow step.

## Reusing for another site

Copy `deploy.yml` to the new repo's `.github/workflows/` and update the three
env vars at the top:

```yaml
env:
  CF_PROJECT: <cloudflare-pages-project-name>
  PROD_HOST:  <production-hostname>
  SMOKE_PATHS: "/ /any /critical /routes"
```

Preconditions for the target repo:

1. `next.config.mjs` has `output: "export"` (otherwise `out/` won't be produced).
2. `wrangler.toml` has `pages_build_output_dir = "out"` and a `name` matching the Cloudflare Pages project.
3. A `build` script in `package.json` that runs `next build`.
4. The two GitHub secrets above are set on the repo.
5. The Cloudflare Pages project already exists (create it once with
   `npx wrangler pages project create <name>` or in the dashboard).

## Local parity

The workflow runs the same commands you can run locally:

```bash
npx tsc --noEmit              # validate
npm run build                 # build (produces out/)
npm run deploy                # deploy (next build && wrangler pages deploy out)
```

If the workflow is failing and you can't reproduce locally, suspect Node
version drift: CI uses Node 20.

## Adding lint to the gate

ESLint isn't currently initialized in this repo. To turn lint into a deploy
gate:

```bash
npx next lint                 # scaffolds .eslintrc.json + adds eslint deps
git add .eslintrc.json package.json package-lock.json
git commit -m "ci: scaffold ESLint"
```

Then in `deploy.yml`'s `validate` job, add:

```yaml
- run: npm run lint -- --max-warnings=0
```
