"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { accent } from "@/lib/scenarios";
import { voiceSamples, type VoiceSample } from "@/lib/voiceSamples";

// "Hear Pi talk": three sample calls with synthesised voices.
// English: pre-rendered mp3 (offline Piper TTS) -> <audio> -> Web Audio AnalyserNode -> canvas bars (real, audio-reactive).
// Hindi: spoken by the browser's own speechSynthesis (no licence-clean offline Hindi voice was available). Browser speech
// can't be routed into Web Audio, so that waveform is simulated and labelled as such. No autoplay: everything starts on click.

type Filter = "all" | "en" | "hi";
type HiMode = "speech" | "timed";

const BARS = 44;
const CYAN = "#00baf2";
const CUSTOMER = "#e0f5fd";
const fmt = (s: number) => { const v = Math.max(0, Math.round(s)); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`; };
const activeIndex = (s: VoiceSample, t: number) => { let k = -1; s.cues.forEach((c, i) => { if (t >= c.start - 0.02) k = i; }); return k; };
const emit = (playing: boolean) => window.dispatchEvent(new CustomEvent("pi-demo", { detail: { playing } }));

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
  );
}

export function HearPiTalk() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [hiMode, setHiMode] = useState<HiMode | null>(null);
  const [hiVoiceName, setHiVoiceName] = useState<string | null>(null);
  const [hiSpeaking, setHiSpeaking] = useState(false);

  const sample = voiceSamples[sel];
  const visible = useMemo(() => voiceSamples.map((s, i) => ({ s, i })).filter(({ s }) => filter === "all" || s.lang === filter), [filter]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const binsRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const loadedRef = useRef<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const hiVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  // Hindi engine state (mutable, read inside rAF).
  const hi = useRef({ t: 0, line: -1, done: true, spokeAt: 0, started: false, token: 0, speaking: false, mode: "timed" as HiMode, watchdog: 0 as number | ReturnType<typeof setTimeout> });
  const levels = useRef<number[]>(Array(BARS).fill(0));

  const idx = activeIndex(sample, t);
  const cue = idx >= 0 ? sample.cues[idx] : null;
  const inLine = cue ? (sample.lang === "hi" && hiMode === "speech" ? hiSpeaking : t <= cue.end + 0.05) : false;
  const speaker = playing && inLine && cue ? cue.from : null;

  // Find a Hindi browser voice (voices load asynchronously in Chrome).
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      const v = window.speechSynthesis.getVoices().find((x) => /^hi([-_]|$)/i.test(x.lang)) ?? null;
      hiVoiceRef.current = v;
      setHiVoiceName(v ? v.name : null);
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  // Tell the hero console to pause while a sample plays.
  useEffect(() => { emit(playing); }, [playing]);
  useEffect(() => () => {
    emit(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    ctxRef.current?.close().catch(() => {});
  }, []);

  // ---------- waveform ----------
  const draw = useCallback((who: "agent" | "user" | null, now: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const g = cv.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const lv = levels.current;
    const an = analyserRef.current, bins = binsRef.current;
    const real = sample.src && an && bins;
    if (real) an.getByteFrequencyData(bins);
    let sum = 0;
    for (let i = 0; i < BARS; i++) {
      let target = 0;
      if (real) {
        // mirrored spectrum: lowest speech bins in the centre, ~5 kHz at the edges
        const half = BARS / 2, d = Math.abs(i + 0.5 - half) / half; // 0 centre .. 1 edge
        const a = Math.floor(1 + Math.pow(d, 1.3) * 26), b = a + 2;
        let m = 0; for (let k = a; k < b; k++) m = Math.max(m, bins[k]);
        target = Math.pow(m / 255, 1.5) * (1 - 0.25 * d);
      } else if (who) {
        target = 0.25 + 0.7 * Math.abs(Math.sin(now * 0.009 + i * 0.7) * Math.sin(now * 0.0037 + i * 1.9));
      }
      lv[i] += (target - lv[i]) * (target > lv[i] ? 0.55 : 0.18);
      sum += lv[i];
    }
    const gap = 3, bw = Math.max(2, (w - gap * (BARS - 1)) / BARS);
    const col = who === "user" ? CUSTOMER : CYAN;
    for (let i = 0; i < BARS; i++) {
      const bh = Math.max(3, lv[i] * (h - 6));
      const x = i * (bw + gap), y = (h - bh) / 2;
      g.globalAlpha = who ? 1 : 0.35;
      g.fillStyle = col;
      g.beginPath();
      if (g.roundRect) g.roundRect(x, y, bw, bh, bw / 2); else g.rect(x, y, bw, bh);
      g.fill();
    }
    cv.dataset.level = (sum / BARS).toFixed(3);
  }, [sample.src]);

  // Idle frame whenever the sample changes / on resize.
  useEffect(() => {
    levels.current.fill(0);
    draw(null, 0);
    const r = () => draw(null, 0);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [draw, sel]);

  // ---------- Hindi (browser speech) ----------
  const speakLine = useCallback((i: number) => {
    const h = hi.current;
    const c = sample.cues[i];
    h.line = i; h.done = false; h.t = c.start; h.spokeAt = performance.now();
    if (h.mode !== "speech") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++h.token;
    const u = new SpeechSynthesisUtterance(c.tts ?? c.text);
    u.lang = "hi-IN";
    if (hiVoiceRef.current) u.voice = hiVoiceRef.current;
    // Two "speakers" from one browser voice: agent slightly brighter, customer lower.
    u.pitch = c.from === "agent" ? 1.1 : 0.75;
    u.rate = c.from === "agent" ? 0.95 : 1.0;
    u.onstart = () => { if (token !== h.token) return; h.started = true; h.speaking = true; setHiSpeaking(true); };
    u.onend = () => { if (token !== h.token) return; h.speaking = false; setHiSpeaking(false); h.done = true; h.t = Math.max(h.t, c.end); };
    u.onerror = u.onend;
    synth.speak(u);
    // If the browser never starts speaking (no engine / blocked), fall back to timed captions.
    clearTimeout(h.watchdog);
    if (!h.started) h.watchdog = setTimeout(() => { if (!h.started && token === h.token) { synth.cancel(); h.mode = "timed"; setHiMode("timed"); } }, 2500);
  }, [sample]);

  const hiStep = useCallback((dt: number) => {
    const h = hi.current, cues = sample.cues;
    let nt = h.t + dt;
    if (h.mode === "speech" && h.line >= 0 && !h.done) {
      const c = cues[h.line];
      // hold the clock inside the line until the voice finishes (or 4 s overrun safety)
      if (nt > c.end - 0.05) { if (performance.now() - h.spokeAt > (c.end - c.start + 4) * 1000) h.done = true; else nt = c.end - 0.05; }
    }
    h.t = nt;
    if (h.mode === "speech" && (h.line < 0 || h.done)) {
      const next = cues.findIndex((c, i) => i > h.line && h.t >= c.start);
      if (next >= 0) speakLine(next);
    }
    return h.t;
  }, [sample, speakLine]);

  const hiPrime = (from: number) => {
    const h = hi.current;
    h.t = from;
    h.line = sample.cues.filter((c) => c.end <= from).length - 1;
    h.done = true; h.speaking = false; setHiSpeaking(false);
  };

  // ---------- playback loop ----------
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      let nt: number;
      if (sample.src) nt = audioRef.current?.currentTime ?? 0;
      else {
        nt = hiStep(dt);
        if (nt >= sample.duration) { nt = sample.duration; setT(nt); setPlaying(false); draw(null, now); return; }
      }
      setT(nt);
      const k = activeIndex(sample, nt);
      const c = k >= 0 ? sample.cues[k] : null;
      const live = c && (sample.src || hi.current.mode === "timed" ? nt <= c.end + 0.05 : hi.current.speaking);
      draw(live && c ? c.from : null, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, sample, hiStep, draw]);

  // ---------- controls ----------
  const ensureAudioGraph = () => {
    const el = audioRef.current;
    if (!el || ctxRef.current) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaElementSource(el);
      const an = ctx.createAnalyser();
      an.fftSize = 256; an.smoothingTimeConstant = 0.7;
      src.connect(an); an.connect(ctx.destination);
      ctxRef.current = ctx; analyserRef.current = an; binsRef.current = new Uint8Array(an.frequencyBinCount);
    } catch { /* no Web Audio: audio still plays, bars stay idle */ }
  };

  const loadSrc = (s: VoiceSample) => {
    const el = audioRef.current;
    if (!el || !s.src || loadedRef.current === s.id) return;
    el.src = asset(s.src); // lazy: nothing is fetched until the first play/seek
    loadedRef.current = s.id;
  };

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    hi.current.token++; clearTimeout(hi.current.watchdog);
    hi.current.speaking = false; setHiSpeaking(false);
    setPlaying(false);
  }, []);

  const play = () => {
    if (sample.src) {
      const el = audioRef.current!;
      loadSrc(sample);
      ensureAudioGraph();
      ctxRef.current?.resume().catch(() => {});
      if (el.ended || el.currentTime >= sample.duration - 0.05) el.currentTime = 0;
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      return;
    }
    const canSpeak = "speechSynthesis" in window && !!hiVoiceRef.current;
    const mode: HiMode = canSpeak ? "speech" : "timed";
    hi.current.mode = mode; hi.current.started = false; setHiMode(mode);
    hiPrime(t >= sample.duration - 0.05 ? 0 : t);
    if (mode === "speech") window.speechSynthesis.cancel();
    hiStep(0); // starts the first utterance inside the click (needed by Safari/iOS)
    setPlaying(true);
  };

  const toggle = () => (playing ? stop() : play());

  const seek = (v: number) => {
    setT(v);
    if (sample.src) {
      loadSrc(sample);
      if (audioRef.current) audioRef.current.currentTime = v;
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      hi.current.token++;
      hiPrime(v);
      if (playing) hiStep(0);
    }
  };

  const select = (i: number) => {
    if (i === sel) return;
    stop();
    setSel(i); setT(0); setHiMode(null);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const onFilter = (f: Filter) => {
    setFilter(f);
    const vis = voiceSamples.map((s, i) => ({ s, i })).filter(({ s }) => f === "all" || s.lang === f);
    if (!vis.some((v) => v.i === sel)) select(vis[0].i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const d = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(e.key) ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const pos = visible.findIndex((v) => v.i === sel);
    const next = visible[(pos + d + visible.length) % visible.length].i;
    select(next);
    tabs.current[next]?.focus();
  };

  const hiNote =
    sample.lang !== "hi" ? null
      : hiMode === "timed" ? "Your browser has no Hindi voice available, so this sample shows timed captions only."
        : hiVoiceName ? `Spoken live by your browser’s Hindi voice (${hiVoiceName}). Waveform is simulated.`
          : "Spoken live by your browser’s built-in Hindi voice, if it has one. Waveform is simulated.";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Picker */}
      <div className="min-w-0 lg:col-span-5">
        <div role="group" aria-label="Filter samples by language" className="inline-flex rounded-full bg-mist p-1 ring-1 ring-line">
          {([["all", "All"], ["en", "English"], ["hi", "हिन्दी"]] as [Filter, string][]).map(([f, l]) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => onFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === f ? "bg-navy text-white shadow" : "text-navy hover:bg-white"}`}>
              <span lang={f === "hi" ? "hi" : undefined}>{l}</span>
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="Sample calls" aria-orientation="vertical" onKeyDown={onKey} className="mt-5 flex flex-col gap-3">
          {visible.map(({ s, i }) => {
            const on = i === sel;
            return (
              <button key={s.id} ref={(el) => { tabs.current[i] = el; }} role="tab" id={`sample-tab-${s.id}`} aria-selected={on} aria-controls="sample-panel" tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                className={`group rounded-2xl p-5 text-left ring-1 transition ${on ? "bg-ice-2 ring-pi shadow-[0_10px_30px_rgba(0,41,112,0.10)]" : "bg-white ring-line hover:ring-pi/60"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent[s.agent] === "#002970" ? "#0093d6" : accent[s.agent] }}>{s.agentName}</span>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-navy ring-1 ring-line">{s.src ? fmt(s.duration) : "Browser voice"}</span>
                </span>
                <span className="font-display mt-2 block text-lg font-bold text-ink">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-body">{s.blurb}</span>
                <span className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-navy">
                  <span className="rounded-full bg-mist px-2 py-0.5">{s.direction}</span>
                  <span className="rounded-full bg-mist px-2 py-0.5" lang={s.lang === "hi" ? "hi" : undefined}>{s.langLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Player */}
      <div id="sample-panel" role="tabpanel" aria-labelledby={`sample-tab-${sample.id}`} className="min-w-0 lg:col-span-7">
        <div className="overflow-hidden rounded-3xl bg-navy text-white shadow-[0_30px_80px_-20px_rgba(0,41,112,0.55)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{sample.agentName}</p>
              <p className="text-xs text-white/60">{sample.direction} call · <span lang={sample.lang === "hi" ? "hi" : undefined}>{sample.langLabel}</span></p>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${speaker ? "bg-pi text-navy" : "bg-white/10 text-white/80"}`} aria-hidden="true">
              <span className={`h-2 w-2 rounded-full ${speaker ? "bg-navy" : "bg-white/50"}`} />
              {speaker === "agent" ? "Pi Agent speaking" : speaker === "user" ? "Customer speaking" : playing ? "Listening…" : "Ready"}
            </span>
          </div>

          <div className="px-5 pt-6 sm:px-7">
            <canvas ref={canvasRef} data-level="0" className="block h-20 w-full sm:h-24" role="img"
              aria-label={sample.src ? "Live waveform of the sample audio" : "Simulated waveform for the browser voice"} />
            <div className="mt-5 flex items-center gap-4">
              <button type="button" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} sample: ${sample.title}`}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-pi text-navy shadow-lg transition hover:bg-aqua focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <PlayIcon playing={playing} />
              </button>
              <div className="min-w-0 flex-1">
                <input type="range" min={0} max={sample.duration} step={0.1} value={Math.min(t, sample.duration)} onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Seek" aria-valuetext={`${fmt(t)} of ${fmt(sample.duration)}`}
                  className="pi-range w-full" style={{ ["--p" as string]: `${(Math.min(t, sample.duration) / sample.duration) * 100}%` }} />
                <div className="mt-1 flex justify-between text-xs tabular-nums text-white/60">
                  <span>{fmt(t)}</span>
                  <span>{sample.src ? fmt(sample.duration) : `~${fmt(sample.duration)}`}</span>
                </div>
              </div>
            </div>
            {hiNote && <p className="mt-3 text-xs text-aqua/90">{hiNote}</p>}
          </div>

          <div className="mt-6 border-t border-white/10 bg-white/[0.03] px-5 py-5 sm:px-7">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">Transcript</h3>
            <ol className="mt-3 space-y-2" lang={sample.lang === "hi" ? "hi-Latn" : "en"}>
              {sample.cues.map((c, i) => {
                const on = i === idx;
                return (
                  <li key={i} aria-current={on ? "true" : undefined} data-cue={i}>
                    <button type="button" onClick={() => seek(c.start)} aria-label={`${c.from === "agent" ? "Pi Agent" : "Customer"}: ${c.text}. Jump to ${fmt(c.start)}`}
                      className={`flex w-full gap-3 rounded-xl px-3 py-2 text-left transition ${on ? "bg-white/12 ring-1 ring-pi/60" : "hover:bg-white/5"}`}>
                      <span className={`mt-0.5 w-[76px] shrink-0 text-[11px] font-semibold uppercase tracking-wide ${c.from === "agent" ? "text-pi" : "text-ice"}`}>
                        {c.from === "agent" ? "Pi Agent" : "Customer"}
                      </span>
                      <span className={`text-sm leading-relaxed ${on ? "text-white" : idx > i ? "text-white/70" : "text-white/45"}`}>{c.text}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Sample calls with synthesised voices: illustrative scripts, not real customers. English voices: Piper TTS with VCTK corpus speakers
          (CC BY 4.0, University of Edinburgh). Hindi: your browser’s built-in voice.
        </p>
      </div>
      <audio ref={audioRef} preload="none" onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(sample.duration); }} className="hidden" />
    </div>
  );
}
