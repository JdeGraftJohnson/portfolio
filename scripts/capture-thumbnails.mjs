#!/usr/bin/env node
// Capture ~5sec MP4 + JPG poster for each project card via headless Chromium.
// Output: public/thumbs/<id>.mp4 + public/thumbs/<id>.jpg
//
// Requires: ffmpeg in PATH, playwright installed locally.

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, renameSync, existsSync, rmSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const PROJECTS = [
  { id: "ai-proposal-intelligence", url: "https://johndegraft.app/projects/proposal-intelligence" },
  { id: "healthcare-dashboard-ops", url: "https://johndegraft.app/projects/healthcare-dashboard" },
  { id: "clinical-rag",             url: "https://johndegraft.app/rag" },
  { id: "patient-disengagement",    url: "https://johndegraft.app/projects/patient-disengagement" },
  { id: "uk-health-map",            url: "https://johndegraft.app/projects/uk-health-map" },
  { id: "health-equity-audit",      url: "https://johndegraft.app/audit" },
  { id: "propfirmbot",              url: "https://johndegraft.app/projects/propfirmbot" },
  { id: "stockhub",                 url: "https://stockhub.work" },
];

const ROOT     = resolve(import.meta.dirname, "..");
const TMP_DIR  = join(ROOT, "tmp-thumbs");
const OUT_DIR  = join(ROOT, "public", "thumbs");
const RECORD_MS = 5500;

mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

for (const { id, url } of PROJECTS) {
  console.log(`\n▶ ${id} — ${url}`);
  const ctxDir = join(TMP_DIR, id);
  rmSync(ctxDir, { recursive: true, force: true });
  mkdirSync(ctxDir, { recursive: true });

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: ctxDir, size: { width: 1280, height: 800 } },
  });
  const page = await ctx.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // give animations / hydration / fonts time to settle before recording the meaningful window
    await page.waitForTimeout(1500);
    // capture poster while page is at rest
    const posterPath = join(OUT_DIR, `${id}.jpg`);
    await page.screenshot({ path: posterPath, type: "jpeg", quality: 78, fullPage: false });
    // record an additional window with a gentle scroll so the clip has motion
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(RECORD_MS - 4300);
  } catch (e) {
    console.error(`  ! navigation/capture error: ${e.message}`);
  }

  await ctx.close();

  // playwright writes a single .webm into ctxDir
  const webm = readdirSync(ctxDir).find((f) => f.endsWith(".webm"));
  if (!webm) {
    console.error(`  ! no webm produced for ${id}, skipping encode`);
    continue;
  }
  const webmPath = join(ctxDir, webm);
  const mp4Path  = join(OUT_DIR, `${id}.mp4`);

  console.log(`  encoding → ${mp4Path}`);
  try {
    execSync(
      `ffmpeg -y -i "${webmPath}" -an ` +
      `-vf "scale=720:-2,fps=24" ` +
      `-c:v libx264 -profile:v baseline -pix_fmt yuv420p ` +
      `-crf 28 -movflags +faststart ` +
      `-t 5 "${mp4Path}"`,
      { stdio: "pipe" }
    );
  } catch (e) {
    console.error(`  ! ffmpeg failed for ${id}: ${e.message}`);
  }
}

await browser.close();
rmSync(TMP_DIR, { recursive: true, force: true });

console.log("\n✓ done. assets in", OUT_DIR);
const out = readdirSync(OUT_DIR).sort();
for (const f of out) console.log("  ", f);
