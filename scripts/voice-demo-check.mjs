// Usage: node scripts/voice-demo-check.mjs [url] [prefix]
// Plays each "Hear Pi talk" sample in headless Chrome and logs audio time, active caption, waveform level and hero state.
// Without a url it serves ./out on :4326. Frames go to screenshots/hear-pi-talk/<prefix>-*.png
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const url = process.argv[2] || "http://localhost:4326/";
const prefix = process.argv[3] || "local";
const root = path.resolve("out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp3": "audio/mpeg" };
const server = process.argv[2] ? null : http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const size = fs.statSync(f).size, type = types[path.extname(f)] || "application/octet-stream";
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (m) {
    const s = m[1] ? +m[1] : 0, e = m[2] ? +m[2] : size - 1;
    res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${s}-${e}/${size}`, "content-length": e - s + 1 });
    return fs.createReadStream(f, { start: s, end: e }).pipe(res);
  }
  res.writeHead(200, { "content-type": type, "accept-ranges": "bytes", "content-length": size });
  fs.createReadStream(f).pipe(res);
}).listen(4326);

const out = "screenshots/hear-pi-talk"; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const summary = {};
for (const [vp, w, h, mob] of [["desktop", 1440, 900, false], ["mobile", 390, 844, true]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
  const mp3 = []; page.on("request", (r) => { if (r.url().endsWith(".mp3")) mp3.push(r.url()); });
  await page.goto(url, { waitUntil: "networkidle" });
  const sec = page.locator("#hear-pi-talk");
  await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  console.log(vp, "mp3 requests before any click:", mp3.length, "| robots:", await page.locator('meta[name="robots"]').getAttribute("content").catch(() => null),
    "| voices:", await page.evaluate(() => ("speechSynthesis" in window ? speechSynthesis.getVoices().length : -1)));
  if (mob) { await sec.screenshot({ path: `${out}/${prefix}-mobile-section.png` }); }
  else { await sec.screenshot({ path: `${out}/${prefix}-desktop-section.png` }); }
  const tabs = page.locator('#hear-pi-talk [role="tab"]');
  const n = await tabs.count();
  for (let i = 0; i < n; i++) {
    if (mob && i > 0) break; // mobile: one full playback is enough
    await tabs.nth(i).click(); await page.waitForTimeout(300);
    const title = (await tabs.nth(i).locator(".font-display").innerText()).trim();
    await page.locator('#hear-pi-talk button[aria-label^="Play sample"]').click();
    const rows = []; const t0 = Date.now();
    let shot = 0;
    while (Date.now() - t0 < 26000) {
      await page.waitForTimeout(500);
      const s = await page.evaluate(() => {
        const a = document.querySelector("#hear-pi-talk audio");
        const cur = document.querySelector('#hear-pi-talk li[aria-current="true"]');
        return {
          ct: a && a.src ? +a.currentTime.toFixed(2) : null, dur: a && a.src && isFinite(a.duration) ? +a.duration.toFixed(2) : null, paused: a ? a.paused : null,
          seek: +document.querySelector('#hear-pi-talk input[type="range"]').value,
          cue: cur ? +cur.dataset.cue : -1, level: +document.querySelector("#hear-pi-talk canvas").dataset.level,
          hero: document.querySelector("[data-running]")?.dataset.running,
          playing: document.querySelector('#hear-pi-talk button[aria-label^="Pause sample"]') ? true : false,
          note: document.querySelector("#hear-pi-talk .text-aqua\\/90")?.textContent || "",
        };
      });
      rows.push(s);
      if (!mob && [3, 10, 15].includes(rows.length)) await page.locator("#sample-panel").screenshot({ path: `${out}/${prefix}-${i}-f${++shot}.png` });
      if (!s.playing && rows.length > 2) break;
    }
    const cues = [...new Set(rows.map((r) => r.cue))];
    const levels = rows.map((r) => r.level);
    const info = { title, dur: rows.find((r) => r.dur)?.dur ?? null, lastSeek: rows.at(-1).seek, cuesSeen: cues.join(","), maxLevel: Math.max(...levels).toFixed(3),
      distinctLevels: new Set(levels.map((l) => l.toFixed(2))).size, heroPausedWhilePlaying: rows.filter((r) => r.playing).every((r) => r.hero === "false"), heroAfter: null, note: rows.at(-1).note, samples: rows.length };
    await page.waitForTimeout(800);
    info.heroAfter = await page.evaluate(() => document.querySelector("[data-running]")?.dataset.running);
    console.log(vp, JSON.stringify(info));
    console.log("   trace:", rows.map((r) => `${r.ct ?? r.seek}s c${r.cue} L${r.level.toFixed(2)}`).join(" | "));
    summary[`${vp}-${i}`] = info;
  }
  console.log(vp, "mp3 requests total:", mp3.map((u) => u.split("/").pop()).join(", "));
  await page.close();
}
fs.writeFileSync(`${out}/${prefix}-summary.json`, JSON.stringify(summary, null, 1));
await browser.close(); server?.close();
