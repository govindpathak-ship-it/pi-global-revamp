// Usage: node scripts/industry-capture.mjs <prefix> [basePath]  — screenshots the industry image card for each tab (serves ./out).
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const prefix = process.argv[2] || "after";
const base = process.argv[3] || "";
const root = path.resolve("out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (base && p.startsWith(base)) p = p.slice(base.length) || "/";
  let f = path.join(root, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { console.log("404", req.url); res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(4324);
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
fs.mkdirSync("screenshots/industry", { recursive: true });
for (const [vp, w, h, mob] of [["desktop", 1440, 900, false], ["mobile", 390, 844, true]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob });
  await page.goto(`http://localhost:4324${base}/`, { waitUntil: "networkidle" });
  await page.locator("#industries").scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  const tabs = page.locator('#industries [role="tab"]');
  for (let i = 0; i < (await tabs.count()); i++) {
    await tabs.nth(i).click(); await page.waitForTimeout(900);
    const img = page.locator('#industries [role="tabpanel"] img').first();
    const info = await img.evaluate((el) => ({ src: el.currentSrc.replace(location.origin, ""), ok: el.complete && el.naturalWidth > 0, nat: `${el.naturalWidth}x${el.naturalHeight}` }));
    const name = (await tabs.nth(i).innerText()).toLowerCase().replace(/[^a-z]/g, "");
    await page.locator('#industries [role="tabpanel"] > div').first().screenshot({ path: `screenshots/industry/${prefix}-${vp}-${name}.png` });
    console.log(vp, name, JSON.stringify(info));
  }
  await page.close();
}
await browser.close(); server.close();
