#!/usr/bin/env node
// Capture ~5-7sec MP4 + JPG poster per project card.
// Output: public/thumbs/<id>.mp4 + public/thumbs/<id>.jpg
//
// Usage:
//   node scripts/capture-thumbnails.mjs                          # all
//   node scripts/capture-thumbnails.mjs clinical-rag propfirmbot # subset

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, renameSync, existsSync, rmSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT     = resolve(import.meta.dirname, "..");
const TMP_DIR  = join(ROOT, "tmp-thumbs");
const OUT_DIR  = join(ROOT, "public", "thumbs");

/**
 * Each recipe drives a fresh page. It must:
 *  - navigate to the entry URL,
 *  - leave the page in a useful resting state (the poster JPG is taken at the END),
 *  - take ~5-7 seconds of meaningful motion so the recorded video tells a story.
 */
const PROJECTS = [
  {
    id: "ai-proposal-intelligence",
    recipe: async (page) => {
      await page.goto("https://johndegraft.app/projects/proposal-intelligence", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
      await page.waitForTimeout(2200);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(1500);
    },
  },
  {
    id: "healthcare-dashboard-ops",
    recipe: async (page) => {
      // Power BI dashboard for ~3sec, then navigate to the map view
      await page.goto("https://johndegraft.app/projects/healthcare-dashboard/dashboard", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3200);
      await page.goto("https://johndegraft.app/projects/healthcare-dashboard/map", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
    },
  },
  {
    id: "clinical-rag",
    recipe: async (page) => {
      await page.goto("https://johndegraft.app/rag", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const input = page.locator('input[placeholder*="clinical protocol"], textarea').first();
      if (await input.count()) {
        await input.click();
        await input.pressSequentially("What does NICE recommend for type 2 diabetes second-line therapy?", { delay: 28 });
        await page.waitForTimeout(400);
        await input.press("Enter");
        await page.waitForTimeout(4500);
      } else {
        await page.waitForTimeout(5000);
      }
    },
  },
  {
    id: "patient-disengagement",
    recipe: async (page) => {
      await page.goto("https://johndegraft.app/projects/patient-disengagement", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      // open the floating "Ask the AI" panel
      const fab = page.getByRole("button", { name: /ask the (patient-disengagement )?(model|ai)/i }).first();
      if (await fab.count()) {
        await fab.click();
        await page.waitForTimeout(700);
      }
      const input = page.locator('input[placeholder*="disengagement"], textarea').first();
      if (await input.count()) {
        await input.click();
        await input.pressSequentially("Which features drive disengagement risk in the model?", { delay: 28 });
        await page.waitForTimeout(400);
        await input.press("Enter");
        await page.waitForTimeout(4200);
      } else {
        await page.waitForTimeout(5000);
      }
    },
  },
  {
    id: "uk-health-map",
    recipe: async (page) => {
      await page.goto("https://johndegraft.app/projects/uk-health-map", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2500);
      await page.evaluate(() => window.scrollTo({ top: 200, behavior: "smooth" }));
      await page.waitForTimeout(2500);
    },
  },
  {
    id: "health-equity-audit",
    recipe: async (page) => {
      await page.goto("https://johndegraft.app/audit", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
      await page.waitForTimeout(2500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(1500);
    },
  },
  {
    id: "propfirmbot",
    recipe: async (page) => {
      await page.goto("https://johndegraft.app/projects/propfirmbot", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      // scroll to Cumulative profit & loss
      const scrolled = await page.evaluate(() => {
        const el = [...document.querySelectorAll("h1,h2,h3,h4,p,span,div")].find(
          (e) => /Cumulative profit\s*&\s*loss/i.test(e.textContent || "")
        );
        if (!el) return false;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      });
      await page.waitForTimeout(scrolled ? 3000 : 1500);
      // slow scroll to Anatomy of a single trade
      const scrolled2 = await page.evaluate(() => {
        const el = [...document.querySelectorAll("h1,h2,h3,h4,p,span,div")].find(
          (e) => /Anatomy of a single trade/i.test(e.textContent || "")
        );
        if (!el) return false;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return true;
      });
      await page.waitForTimeout(scrolled2 ? 3500 : 2000);
    },
  },
  {
    id: "stockhub",
    recipe: async (page) => {
      await page.goto("https://stockhub.work", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2500);
      await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
      await page.waitForTimeout(2500);
    },
  },
];

const filterIds = new Set(process.argv.slice(2));
const targets = filterIds.size > 0 ? PROJECTS.filter((p) => filterIds.has(p.id)) : PROJECTS;
if (targets.length === 0) {
  console.error(`no matching projects for: ${[...filterIds].join(", ") || "(none)"}`);
  process.exit(1);
}

mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

for (const { id, recipe } of targets) {
  console.log(`\n▶ ${id}`);
  const ctxDir = join(TMP_DIR, id);
  rmSync(ctxDir, { recursive: true, force: true });
  mkdirSync(ctxDir, { recursive: true });

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: ctxDir, size: { width: 1280, height: 800 } },
  });
  const page = await ctx.newPage();

  try {
    await recipe(page);
    // poster = final frame of the journey
    const posterPath = join(OUT_DIR, `${id}.jpg`);
    await page.screenshot({ path: posterPath, type: "jpeg", quality: 78, fullPage: false });
  } catch (e) {
    console.error(`  ! recipe error: ${e.message}`);
  }

  await ctx.close();

  const webm = readdirSync(ctxDir).find((f) => f.endsWith(".webm"));
  if (!webm) {
    console.error(`  ! no webm produced for ${id}, skipping encode`);
    continue;
  }
  const webmPath = join(ctxDir, webm);
  const mp4Path = join(OUT_DIR, `${id}.mp4`);

  console.log(`  encoding → ${mp4Path}`);
  try {
    execSync(
      `ffmpeg -y -i "${webmPath}" -an ` +
        `-vf "scale=720:-2,fps=24" ` +
        `-c:v libx264 -profile:v baseline -pix_fmt yuv420p ` +
        `-crf 28 -movflags +faststart ` +
        `-t 7 "${mp4Path}"`,
      { stdio: "pipe" }
    );
  } catch (e) {
    console.error(`  ! ffmpeg failed for ${id}: ${e.message}`);
  }
}

await browser.close();
rmSync(TMP_DIR, { recursive: true, force: true });

console.log("\n✓ done. assets in", OUT_DIR);
