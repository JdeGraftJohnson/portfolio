// Probes every "Try It Out" landing for visible-content health.
//
//   /projects/healthcare-dashboard/map        — US Rx choropleth (react-leaflet)
//   /projects/healthcare-dashboard/dashboard  — Power BI embed (needs /api/pbi-token)
//   /projects/uk-health-map                   — iframe to (currently dead) SWA
//   /projects/proposal-intelligence
//   /projects/propfirmbot
//
// For each page: capture console errors, pageerrors, failed requests, an
// 8-second-after-load screenshot, and a per-page DOM-shape verdict.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "https://johndegraft.app";
const OUT = "scripts/debug/out";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  {
    slug: "healthcare-map",
    path: "/projects/healthcare-dashboard/map",
    verdict: async (page) =>
      await page.evaluate(() => {
        const lc = document.querySelector(".leaflet-container");
        const paths = lc?.querySelectorAll("svg path") ?? [];
        return { has_map: !!lc, path_count: paths.length, ok: paths.length >= 50 };
      }),
  },
  {
    slug: "healthcare-dashboard",
    path: "/projects/healthcare-dashboard/dashboard",
    verdict: async (page) =>
      await page.evaluate(() => {
        const iframes = Array.from(document.querySelectorAll("iframe"));
        const pbi = iframes.find((f) => /powerbi/i.test(f.src) || /reportEmbed/i.test(f.src));
        const errBanner = Array.from(document.querySelectorAll("body *")).find((el) => {
          const t = el.textContent?.toLowerCase() ?? "";
          return t.includes("failed") || t.includes("error loading") || t.includes("/api/pbi-token");
        });
        return {
          iframe_count: iframes.length,
          has_pbi_iframe: !!pbi,
          pbi_src: pbi?.src ?? null,
          visible_error: errBanner?.textContent?.trim().slice(0, 160) ?? null,
          ok: !!pbi && !errBanner,
        };
      }),
  },
  {
    slug: "uk-health-map",
    path: "/projects/uk-health-map",
    verdict: async (page) => {
      const res = await page.evaluate(async () => {
        const iframe = document.querySelector('iframe[title*="UK Health Map" i], iframe[src*="map/explore" i]');
        const src = iframe?.getAttribute("src") ?? null;
        return { has_iframe: !!iframe, src };
      });
      let iframe_origin_status = null;
      if (res.src) {
        try {
          const r = await page.request.fetch(res.src, { failOnStatusCode: false });
          iframe_origin_status = r.status();
        } catch (e) {
          iframe_origin_status = `error:${e.message}`;
        }
      }
      return { ...res, iframe_origin_status, ok: res.has_iframe && iframe_origin_status === 200 };
    },
  },
  {
    slug: "proposal-intelligence",
    path: "/projects/proposal-intelligence",
    verdict: async (page) =>
      await page.evaluate(() => {
        const headings = document.querySelectorAll("h1, h2, h3");
        const buttons = document.querySelectorAll("button, a[href]");
        return { heading_count: headings.length, link_count: buttons.length, ok: headings.length > 0 };
      }),
  },
  {
    slug: "propfirmbot",
    path: "/projects/propfirmbot",
    verdict: async (page) =>
      await page.evaluate(() => {
        const headings = document.querySelectorAll("h1, h2, h3");
        const canvases = document.querySelectorAll("canvas, svg");
        return { heading_count: headings.length, viz_count: canvases.length, ok: headings.length > 0 };
      }),
  },
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  viewport: { width: 1400, height: 900 },
});

const summary = [];

for (const spec of PAGES) {
  const page = await ctx.newPage();
  const url = BASE + spec.path;

  const errs = [];
  const pageerrs = [];
  const failed = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      errs.push({ t: m.type(), text: m.text(), loc: m.location() });
    }
  });
  page.on("pageerror", (e) => pageerrs.push({ name: e.name, message: e.message }));
  page.on("requestfailed", (req) => failed.push({ url: req.url(), reason: req.failure()?.errorText }));

  console.log(`\n[${spec.slug}] ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(7000);
  } catch (e) {
    console.log(`  goto: ${e.message}`);
  }

  let v;
  try {
    v = await spec.verdict(page);
  } catch (e) {
    v = { error: e.message };
  }

  await page.screenshot({ path: `${OUT}/${spec.slug}.png`, fullPage: true });
  console.log(`  verdict: ${JSON.stringify(v)}`);
  if (pageerrs.length) console.log(`  pageerrors: ${pageerrs.map((e) => e.message).join("; ")}`);
  if (errs.length) console.log(`  console: ${errs.length} (first: ${errs[0]?.text?.slice(0, 200)})`);
  if (failed.length) console.log(`  failed reqs: ${failed.length} (${failed[0]?.url})`);

  summary.push({
    slug: spec.slug,
    url,
    verdict: v,
    pageerrors: pageerrs,
    console_errors: errs,
    failed_requests: failed,
  });

  await page.close();
}

await browser.close();

console.log("\n=== SUMMARY ===");
for (const s of summary) {
  const ok = s.verdict?.ok === true && s.pageerrors.length === 0;
  console.log(`  ${ok ? "[OK]  " : "[FAIL]"}  ${s.slug.padEnd(24)}  ${JSON.stringify(s.verdict)}`);
}
