# Pi Agents — pi.global revamp

![Desktop hero](docs/hero-desktop.jpg)

A redesigned, static marketing site for **Pi Agents — AI Agents by Paytm** (pi.global).
Built with Next.js 15 (App Router) + TypeScript + Tailwind CSS v4, exported as a fully static site.

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
```

## Build static site
```bash
npm run build        # writes ./out (output: 'export')
npx serve out        # or any static file server
```

## Screenshots
```bash
npm run build && node scripts/screenshot.mjs   # uses /usr/bin/google-chrome (override with CHROME=...)
```

## Deploy
**GitHub Pages (current):** the built site is published from the `gh-pages` branch:
```bash
NEXT_PUBLIC_BASE_PATH=/pi-global-revamp npm run build && touch out/.nojekyll
# then commit the contents of out/ to the gh-pages branch
```
**GitHub Actions (optional):** `deploy/github-pages-workflow.yml` builds and deploys on every push to `main`.
Move it to `.github/workflows/deploy.yml` (pushing workflow files needs a token with the `workflow` scope) and switch Pages → Source to "GitHub Actions".

Elsewhere: `out/` is plain HTML/CSS/JS — upload to any static host (S3 + CloudFront, Vercel, Netlify, Cloudflare Pages, nginx).
`trailingSlash: true` is enabled so it works on hosts without rewrites.

## Content
All copy, numbers and logos live in `src/lib/content.ts` and come from the live pi.global site.
Contact Sales opens a form that composes an email to sales@paytmpayments.com (the live site's own fallback).
To post leads to a CRM instead, replace `submit()` in `src/components/Contact.tsx`.
