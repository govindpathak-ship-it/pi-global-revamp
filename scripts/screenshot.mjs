// Usage: node scripts/screenshot.mjs  (serves ./out on :4321 and writes ./screenshots/*.png)
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon", ".txt": "text/plain" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(root, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(4321);

const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
async function shoot(name, width, height, isMobile) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: isMobile ? 2 : 1, isMobile, hasTouch: isMobile });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/hero-${name}.png` });
  // scroll through so reveal animations & counters fire
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += height / 2) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  for (const id of process.argv.slice(2)) {
    await page.locator(`#${id}`).screenshot({ path: `screenshots/section-${id}-${name}.png` });
  }
  await page.close();
}
await shoot("desktop", 1440, 900, false);
await shoot("mobile", 390, 844, true);
await browser.close();
server.close();
console.log("done");
