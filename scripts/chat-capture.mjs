// Usage: node scripts/chat-capture.mjs [url] [prefix]  — frames + video of the hero chat. Serves ./out if no url given.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

let url = process.argv[2];
const prefix = process.argv[3] || "local";
let server;
if (!url) {
  const root = path.resolve("out");
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
  server = http.createServer((req, res) => {
    let f = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  }).listen(4322);
  url = "http://localhost:4322/";
}
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const shot = async (p, file) => {
  if (p.viewportSize().width < 640) return p.locator(".max-w-\\[520px\\]").first().screenshot({ path: file }); // chips hidden on mobile
  const b = await p.locator(".max-w-\\[520px\\]").first().boundingBox(); const pad = 56;
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad);
  await p.screenshot({ path: file, clip: { x, y, width: Math.min(b.width + pad * 2, p.viewportSize().width - x), height: b.height + pad * 2 } });
};
const state = (p) => p.evaluate(() => {
  const panel = document.querySelector('[aria-hidden="true"].mt-5');
  const box = panel.getBoundingClientRect();
  const card = panel.closest(".relative").getBoundingClientRect();
  return { head: panel.querySelector(".chat-head").innerText.replace(/\s+/g, " "), msgs: panel.querySelectorAll(".msg-in p").length,
    typing: !!panel.querySelector(".typing"), live: panel.querySelector(".chat-head").innerText.includes("Live") ? panel.querySelector(".chat-head span.ml-auto")?.innerText : "", wave: !!panel.querySelector(".wave-on"), active: document.querySelector("[data-active]")?.innerText.split("\n")[0],
    lit: document.querySelectorAll(".step-on").length, chatH: Math.round(box.height), cardH: Math.round(card.height) };
});

async function run(name, opts, secs, video) {
  const ctx = await browser.newContext({ ...opts,  });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  if (opts.isMobile) { await p.evaluate(() => document.querySelector(".max-w-\\[520px\\]").scrollIntoView({ block: "center" })); }
  const log = [];
  for (let t = 0; t <= secs; t += 1) {
    const s = await state(p); log.push({ t, ...s });
    if (t % 3 === 0) await shot(p, `screenshots/chat/${prefix}-${name}-t${String(t).padStart(2, "0")}.png`);
    await p.waitForTimeout(1000);
  }
  let vp = null;
  if (video) { // ~16s clip of the panel: timestamped screenshots -> ffmpeg concat
    fs.rmSync("/tmp/clip", { recursive: true, force: true }); fs.mkdirSync("/tmp/clip");
    const t0 = Date.now(); const ts = []; let i = 0;
    while (Date.now() - t0 < 20500) { await shot(p, `/tmp/clip/f${String(i).padStart(4, "0")}.png`); ts.push(Date.now()); i++; }
    const lines = []; for (let k = 0; k < i; k++) { lines.push(`file 'f${String(k).padStart(4, "0")}.png'`); lines.push(`duration ${((ts[k + 1] ?? ts[k] + 80) - ts[k]) / 1000}`); }
    fs.writeFileSync("/tmp/clip/list.txt", lines.join("\n")); vp = `${i} frames`;
  }
  await ctx.close();
  return { log, vp };
}

const d = await run("desktop", { viewport: { width: 1440, height: 900 } }, 80, prefix === "local");
console.log("DESKTOP"); d.log.forEach((l) => console.log(JSON.stringify(l)));
const m = await run("mobile", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 24, false);
console.log("MOBILE"); m.log.forEach((l) => console.log(JSON.stringify(l)));

// Pause when off-screen
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(3000);
  const a = await state(p); await p.evaluate(() => scrollTo(0, 3000)); await p.waitForTimeout(6000);
  const b = await state(p); console.log("PAUSE offscreen before/after:", JSON.stringify(a), JSON.stringify(b));
  await p.close();
}
// Reduced motion
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage(); await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const a = await state(p); await p.waitForTimeout(5000); const b = await state(p);
  await shot(p, `screenshots/chat/${prefix}-reduced-motion.png`);
  console.log("REDUCED:", JSON.stringify(a), JSON.stringify(b)); await ctx.close();
}
await browser.close(); server?.close();
if (d.vp) console.log("VIDEO", d.vp);
