import { mkdir, writeFile, access } from "node:fs/promises";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { format, resolveConfig } from "prettier";
const arg = (key) =>
  process.argv
    .find((v) => v.startsWith("--" + key + "="))
    ?.split("=")
    .slice(1)
    .join("=");
const origin = new URL(arg("origin") || "https://havenfieldre.vercel.app");
if (
  origin.protocol !== "https:" ||
  origin.username ||
  origin.password ||
  origin.pathname !== "/" ||
  origin.search ||
  origin.hash
)
  throw Error("Use an HTTPS origin without credentials, path or query");
const runs = Number(arg("runs") || 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 3) throw Error("Choose 1-3 lab runs");
const source = arg("source");
if (source && !/^[a-f0-9]{40}$/.test(source)) throw Error("Invalid source commit");
const json = await fetch(new URL("/api/posts", origin), { signal: AbortSignal.timeout(20000) });
if (!json.ok) throw Error("Public article API unavailable");
const { posts } = await json.json();
if (!posts[0]?.slug || !/^[a-z0-9-]+$/.test(posts[0].slug))
  throw Error("Published article missing");
const routes = ["/", "/properties", "/journal/" + posts[0].slug],
  results = [];
let chrome;
try {
  let chromePath = process.env.CHROME_PATH;
  if (!chromePath && process.platform === "win32") {
    chromePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
    await access(chromePath);
  }
  chrome = await launch({
    chromePath,
    chromeFlags: ["--headless", "--disable-gpu", "--no-first-run"],
    logLevel: "silent",
  });
  for (let iteration = 1; iteration <= runs; iteration++)
    for (const route of routes) {
      const { lhr } = await lighthouse(new URL(route, origin).href, {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance", "accessibility", "seo"],
        formFactor: "mobile",
      });
      const scores = Object.fromEntries(
        Object.entries(lhr.categories).map(([key, v]) => [key, Math.round(v.score * 100)]),
      );
      const metrics = {
        lcpMs: lhr.audits["largest-contentful-paint"].numericValue,
        cls: lhr.audits["cumulative-layout-shift"].numericValue,
        tbtMs: lhr.audits["total-blocking-time"].numericValue,
        transferBytes: lhr.audits["total-byte-weight"].numericValue,
        ttfbMs: lhr.audits["server-response-time"]?.numericValue ?? null,
      };
      const concerns = Object.values(lhr.audits)
        .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== "informative")
        .map((a) => ({ id: a.id, title: a.title, score: a.score, value: a.displayValue }));
      results.push({
        iteration,
        route,
        scores,
        metrics,
        concerns,
        lcpDetails: lhr.audits["lcp-breakdown-insight"]?.details,
      });
      console.log(JSON.stringify({ iteration, route, scores, metrics }));
    }
  const median = (v) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];
  const medians = routes.map((route) => {
    const rs = results.filter((r) => r.route === route);
    return {
      route,
      scores: Object.fromEntries(
        ["performance", "accessibility", "seo"].map((k) => [k, median(rs.map((r) => r.scores[k]))]),
      ),
      metrics: Object.fromEntries(
        ["lcpMs", "cls", "tbtMs", "transferBytes", "ttfbMs"].map((k) => [
          k,
          median(rs.map((r) => r.metrics[k])),
        ]),
      ),
    };
  });
  const record = {
    measuredAt: new Date().toISOString(),
    origin: origin.origin,
    sourceCommit: source || null,
    runsPerRoute: runs,
    lighthouseVersion: (await import("lighthouse/package.json", { with: { type: "json" } })).default
      .version,
    environment:
      "Public hosted Vercel Production; local headless Chromium/Edge with Lighthouse mobile simulated throttling, default fresh browser storage; real remote responses. Lab results, not field INP or an availability guarantee.",
    medians,
    results,
  };
  const file = process.argv.includes("--baseline")
    ? "development-plans/plan03-hosted-performance-baseline.json"
    : "development-plans/plan03-hosted-performance.json";
  await mkdir("development-plans", { recursive: true });
  await writeFile(
    file,
    await format(JSON.stringify(record), { ...(await resolveConfig(file)), filepath: file }),
  );
  console.log(JSON.stringify({ file, medians }));
} finally {
  await chrome?.kill();
}
