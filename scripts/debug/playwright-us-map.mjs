// One-shot Playwright probe for /projects/healthcare-dashboard/map.
// Captures all console events, page errors, and failed network requests, then
// dumps a screenshot. Reports whether the .leaflet-container actually painted
// a non-empty SVG, which is the hard test for "is the map alive."
//
// Usage:  node scripts/debug/playwright-us-map.mjs
// Requires: npx playwright install chromium  (one-time)

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.URL || "https://johndegraft.app/projects/healthcare-dashboard/map";
const OUT = "scripts/debug/out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
});
const page = await ctx.newPage();

const console_events = [];
const errors = [];
const failed_requests = [];

page.on("console", (msg) => {
  console_events.push({ type: msg.type(), text: msg.text(), location: msg.location() });
});
page.on("pageerror", (err) => {
  errors.push({ name: err.name, message: err.message, stack: err.stack });
});
page.on("requestfailed", (req) => {
  failed_requests.push({ url: req.url(), failure: req.failure()?.errorText });
});

console.log(`[probe] navigating to ${URL}`);
await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 }).catch((e) => {
  console.error(`[probe] goto failed: ${e.message}`);
});

await page.waitForTimeout(4000);

const diag = await page.evaluate(() => {
  const lc = document.querySelector(".leaflet-container");
  const svg = lc?.querySelector("svg");
  const paths = svg?.querySelectorAll("path") ?? [];
  const tiles = lc?.querySelectorAll(".leaflet-tile") ?? [];
  const loadingText = Array.from(document.querySelectorAll("div")).find((d) =>
    d.textContent?.trim().toLowerCase().startsWith("loading")
  );
  return {
    has_leaflet_container: !!lc,
    leaflet_container_height: lc ? getComputedStyle(lc).height : null,
    has_svg: !!svg,
    svg_path_count: paths.length,
    tile_count: tiles.length,
    still_showing_loading: !!loadingText && getComputedStyle(loadingText).display !== "none",
    document_title: document.title,
  };
});

await page.screenshot({ path: `${OUT}/us-map.png`, fullPage: true });

console.log("\n=== DIAG ===");
console.log(JSON.stringify(diag, null, 2));

if (errors.length) {
  console.log("\n=== PAGE ERRORS ===");
  for (const e of errors) console.log(`${e.name}: ${e.message}\n${e.stack?.split("\n").slice(0, 5).join("\n")}`);
}

const real_console_errors = console_events.filter(
  (e) => e.type === "error" || e.type === "warning"
);
if (real_console_errors.length) {
  console.log("\n=== CONSOLE ERRORS / WARNINGS ===");
  for (const e of real_console_errors) {
    const loc = e.location?.url ? ` (${e.location.url}:${e.location.lineNumber})` : "";
    console.log(`[${e.type}] ${e.text}${loc}`);
  }
}

if (failed_requests.length) {
  console.log("\n=== FAILED REQUESTS ===");
  for (const r of failed_requests) console.log(`${r.failure}  ${r.url}`);
}

console.log(`\n[probe] screenshot: ${OUT}/us-map.png`);

await browser.close();

if (diag.still_showing_loading || diag.svg_path_count === 0) {
  console.log("\n[probe] RESULT: MAP NOT RENDERED");
  process.exit(2);
} else {
  console.log(`\n[probe] RESULT: MAP RENDERED (${diag.svg_path_count} paths, ${diag.tile_count} tiles)`);
}
