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

## Brand theme

Typography and colour follow paytm.com: **Inter** (SIL OFL, self-hosted via `next/font`), navy `#002970`, cyan `#00BAF2`, text `#101010` / `#505050` / `#707070`, light surfaces `#F7F9FC`, `#E0F5FD`, `#F2FBFF`. For contrast, cyan text on white uses the derived shades `#0093D6` (large) and `#007DB8` (small), and cyan buttons use navy text. Tokens live in `src/app/globals.css` (`@theme`).

## Voice samples ("Hear Pi talk")

The `#hear-pi-talk` section plays three **sample calls with synthesised voices** (illustrative scripts shared with the hero console in `src/lib/scenarios.ts`; no real customers).

| Sample | Audio | Length |
| --- | --- | --- |
| Book a test drive (English, outbound sales) | `public/audio/sales-test-drive.mp3` (mono 48 kbps, ~87 KB) | 14.8 s |
| Refund for a damaged item (English, inbound service) | `public/audio/service-refund.mp3` (~114 KB) | 19.5 s |
| EMI reminder, promise to pay (Hindi/Hinglish, outbound ops) | none: spoken by the visitor's browser (`speechSynthesis`, `hi-IN`) | ~21 s (estimated) |

- **Generated offline** with [Piper TTS](https://github.com/OHF-Voice/piper1-gpl) 1.8 (`piper-tts`, GPL-3.0-or-later; the tool's licence does not apply to the audio it produces). No script text was sent to any cloud TTS service.
- **Voice model:** `en_GB-vctk-medium`, trained on the **CSTR VCTK Corpus** (University of Edinburgh), licensed **CC BY 4.0**. Attribution: *"CSTR VCTK Corpus: English Multi-speaker Corpus for CSTR Voice Cloning Toolkit (version 0.92)", Yamagishi, Veaux & MacDonald, University of Edinburgh, CC BY 4.0.* Speakers with Indian-English accents were chosen: p248 (Pi Agent), p251 (sales customer), p376 (service customer).
- **Why Hindi uses the browser voice:** the offline Hindi Piper voices are either non-commercial (`hi_IN-pratham`, `hi_IN-priyamvada`: CC BY-NC-SA 4.0) or have unclear commercial terms (`hi_IN-rohan`, IIT Madras IndicTTS licence); Meta MMS-TTS is CC BY-NC; AI4Bharat Indic Parler-TTS (Apache-2.0) is gated behind a Hugging Face login. So the Hindi sample is spoken by the visitor's own browser voice (Devanagari text, Roman Hinglish captions). Browser speech can't be routed through Web Audio, so its waveform is simulated and labelled; with no Hindi voice installed it falls back to timed captions and says so.
- **Regenerate:** `pip install piper-tts`, download `en_GB-vctk-medium.onnx` (+ `.json`) from `rhasspy/piper-voices`, then `PIPER_MODEL=... python scripts/tts/gen.py` (needs `ffmpeg` with libmp3lame). It writes the mp3s and `cues.json` (per-line start/end), which feed `src/lib/voiceSamples.ts`.
- **Behaviour:** no autoplay; audio is lazy-loaded on first play (`preload="none"`); English waveform is a real Web Audio `AnalyserNode` on the `<audio>` element; captions highlight the current line (`aria-current`) and double as a clickable transcript; the hero animation pauses while a sample plays (`pi-demo` window event).
- **Check:** `npm run build && node scripts/voice-demo-check.mjs` plays each sample in headless Chrome and logs time, active caption and waveform level.
