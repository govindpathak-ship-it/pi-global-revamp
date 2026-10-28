"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { agents } from "@/lib/content";
import { PiLogo } from "./PiLogo";

// Illustrative product visual. Agent names/outcome flows come from the live site; the conversations are generic examples
// (no real customers, no performance claims). A tiny timer-driven state machine plays them on a loop:
// voice scenes render as a live call (waveform, timer, word-by-word captions); WhatsApp scenes as a chat.

const accent: Record<string, string> = { sales: "#00BAF2", service: "#27AE60", operations: "#002970" };

type Msg = { from: "agent" | "user"; text: string; lights?: number };
type Scenario = {
  agent: string;
  agentName: string;
  channel: "WhatsApp" | "Voice AI";
  call?: { direction: "Outbound" | "Inbound"; language: string };
  msgs: Msg[];
};

const scenarios: Scenario[] = [
  {
    agent: "sales", agentName: "Pi Sales & Marketing Agent", channel: "Voice AI", call: { direction: "Outbound", language: "English" },
    msgs: [
      { from: "agent", lights: 1, text: "Hi! I’m calling about the SUV you enquired about. Is this a good time?" },
      { from: "user", text: "Yes. Can I take a test drive?" },
      { from: "agent", lights: 2, text: "Of course! Does Saturday at 11 AM work for you?" },
      { from: "user", text: "Saturday works." },
      { from: "agent", lights: 3, text: "Booked! I’ve sent the details to your WhatsApp." },
    ],
  },
  {
    agent: "operations", agentName: "Pi Operations Agent", channel: "WhatsApp",
    msgs: [
      { from: "agent", lights: 1, text: "Hi! Your EMI is due on the 5th. Shall I set up UPI Autopay so you never miss a payment?" },
      { from: "user", text: "Yes, please set it up." },
      { from: "agent", lights: 2, text: "Done ✅ UPI Autopay is active, and your KYC is now complete." },
      { from: "user", text: "Super, thank you!" },
      { from: "agent", lights: 3, text: "You’re all set. Reminders and receipts will come right here on WhatsApp." },
    ],
  },
  {
    agent: "service", agentName: "Pi Service Agent", channel: "Voice AI", call: { direction: "Inbound", language: "English" },
    msgs: [
      { from: "user", text: "Hi, one item in order #OD1024 came damaged. I want a refund." },
      { from: "agent", lights: 1, text: "Sorry about that! Is it the blue kurta from order #OD1024?" },
      { from: "user", text: "Yes, that one." },
      { from: "agent", lights: 2, text: "Done. Your refund is initiated, and you’ll get an SMS shortly." },
      { from: "user", text: "That was quick, thanks!" },
      { from: "agent", lights: 3, text: "Happy to help. Have a great day!" },
    ],
  },
  {
    agent: "sales", agentName: "Pi Sales & Marketing Agent", channel: "WhatsApp",
    msgs: [
      { from: "agent", lights: 1, text: "Hi! You were looking at a few items earlier — they’re still in your cart. Want me to help you complete the order?" },
      { from: "user", text: "Yes please, share the link." },
      { from: "agent", lights: 2, text: "Here’s your secure payment link 🔗 Pay in one tap with UPI." },
      { from: "user", text: "Paid ✅" },
      { from: "agent", lights: 3, text: "Thank you! Your order is confirmed and on its way 🎉" },
    ],
  },
  {
    agent: "operations", agentName: "Pi Operations Agent", channel: "Voice AI", call: { direction: "Outbound", language: "Hindi" },
    msgs: [
      { from: "agent", lights: 1, text: "Namaste! Aapki EMI 5 tareekh ko due hai. Kya aap tab tak payment kar paayenge?" },
      { from: "user", text: "Haan, main 4 tareekh tak kar dunga." },
      { from: "agent", lights: 2, text: "Theek hai, 4 tareekh note kar li hai. Payment link WhatsApp par bhej diya hai." },
      { from: "user", text: "Thank you." },
      { from: "agent", lights: 3, text: "Dhanyavaad! Aapko ek reminder bhi mil jayega." },
    ],
  },
];

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const readTime = (m?: Msg) => (m ? clamp(700 + m.text.length * 18, 1200, 2500) : 700);
const wordsOf = (t: string) => t.split(" ");
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Deterministic waveform bar params (no Math.random -> no hydration mismatch).
const WAVE = Array.from({ length: 20 }, (_, i) => ({ d: 0.55 + ((i * 37) % 7) / 12, dl: -(((i * 53) % 10) / 10), h: 0.35 + ((i * 29) % 6) / 9 }));

function Bars({ on, n = 4, color, className = "" }: { on: boolean; n?: number; color: string; className?: string }) {
  return (
    <span className={`eq inline-flex h-3.5 items-center gap-[2px] ${on ? "eq-on" : ""} ${className}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="h-full w-[3px] rounded-full" style={{ background: color, ["--d" as string]: `${0.5 + i * 0.13}s`, ["--dl" as string]: `${-i * 0.17}s` }} />
      ))}
    </span>
  );
}

const chips = [
  { label: "Voice AI", cls: "float-slow -left-10 top-48 bg-white text-navy ring-1 ring-line shadow-[0_8px_24px_rgba(0,41,112,0.18)]" },
  { label: "Meta Ads", cls: "float-slower -right-4 -top-4 bg-navy text-white shadow-xl" },
  { label: "RCS", cls: "float-slow -right-6 -bottom-4 bg-white text-navy ring-1 ring-line shadow-[0_8px_24px_rgba(0,41,112,0.18)]" },
];

export function HeroConsole() {
  // Initial (server-rendered / no-JS) frame: the first voice call, a few seconds in.
  const [scen, setScen] = useState(0);
  const [count, setCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [words, setWords] = useState(0);
  const [secs, setSecs] = useState(5);
  const [leaving, setLeaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const s = scenarios[scen];
  const voice = s.channel === "Voice AI";

  // Run only when on-screen, tab visible, and motion allowed.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const update = () => { setReduced(mq.matches); setRunning(inView && !document.hidden && !mq.matches); };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    document.addEventListener("visibilitychange", update);
    mq.addEventListener("change", update);
    update();
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); mq.removeEventListener("change", update); };
  }, []);

  // Reduced motion: static, complete voice call.
  useEffect(() => {
    if (reduced) { setScen(0); setCount(scenarios[0].msgs.length); setTyping(false); setSpeaking(false); setWords(0); setSecs(24); setLeaving(false); }
  }, [reduced]);

  // The state machine: one timeout per step.
  useEffect(() => {
    if (!running) return;
    const msgs = s.msgs;
    let t: number;
    if (leaving) {
      t = window.setTimeout(() => {
        setScen((x) => (x + 1) % scenarios.length); setCount(0); setWords(0); setSpeaking(false); setTyping(false); setSecs(0); setLeaving(false);
      }, 450);
    } else if (count >= msgs.length) {
      t = window.setTimeout(() => setLeaving(true), 2600);
    } else if (voice) {
      const total = wordsOf(msgs[count].text).length;
      if (speaking) {
        t = words < total
          ? window.setTimeout(() => setWords((w) => w + 1), 175 + ((count * 7 + words * 13) % 5) * 18)
          : window.setTimeout(() => { setSpeaking(false); setWords(0); setCount((c) => c + 1); }, 420);
      } else {
        t = window.setTimeout(() => { setSpeaking(true); setWords(1); }, count === 0 ? 1300 : 600);
      }
    } else if (typing) {
      t = window.setTimeout(() => { setTyping(false); setCount((c) => c + 1); }, clamp(900 + msgs[count].text.length * 6, 1200, 1700));
    } else if (msgs[count].from === "agent") {
      t = window.setTimeout(() => setTyping(true), count === 0 ? 500 : Math.min(readTime(msgs[count - 1]), 1400));
    } else {
      t = window.setTimeout(() => setCount((c) => c + 1), readTime(msgs[count - 1]));
    }
    return () => window.clearTimeout(t);
  }, [running, s, voice, count, typing, speaking, words, leaving]);

  // Call timer.
  const connected = voice && (count > 0 || speaking);
  useEffect(() => {
    if (!running || !connected || leaving) return;
    const id = window.setInterval(() => setSecs((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, connected, leaving]);

  const shown = s.msgs.slice(0, count);
  const lit = useMemo(() => shown.reduce((m, x) => Math.max(m, x.lights ?? 0), 0), [shown]);
  const speaker = voice && speaking ? s.msgs[count]?.from : null;

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-pi/30 via-ice to-sky/40 max-sm:opacity-60 max-sm:blur-none sm:blur-2xl" aria-hidden="true" />
      <div className="frost sheen-once relative overflow-hidden rounded-[1.75rem] p-4 sm:rounded-[2rem] sm:p-5">
        <div className="flex items-center justify-between">
          <PiLogo className="h-8 w-auto text-ink" />
          <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-medium uppercase text-[#1e7d46] ring-1 ring-mint/30">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" /><span className="status-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-mint text-mint" /></span>
            Agents online
          </span>
        </div>

        {/* Screen-reader transcript (static) — the animated conversation below is decorative. */}
        <div className="sr-only">
          <p>Example conversations handled by Pi Agents:</p>
          {scenarios.map((x, k) => (
            <ul key={k} aria-label={`${x.call ? `${x.call.direction} Voice AI call in ${x.call.language}` : x.channel}, ${x.agentName}`}>
              {x.msgs.map((m, i) => <li key={i}>{m.from === "agent" ? "Agent" : "Customer"}: {m.text}</li>)}
            </ul>
          ))}
        </div>

        {/* Animated example conversation — fixed height so nothing below moves. */}
        <div className="mt-4 rounded-2xl bg-mist/80 p-3 ring-1 ring-line/70 sm:mt-5 sm:p-4" aria-hidden="true">
          <div key={`h-${scen}`} className="chat-head flex h-5 items-center gap-2 text-[11px] font-semibold text-muted">
            {voice ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-ice px-1.5 py-0.5 text-navy">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                Voice AI
              </span>
            ) : (
              <span className="shrink-0 rounded bg-[#25D366]/15 px-1.5 py-0.5 text-[#128c4b]">WhatsApp</span>
            )}
            <span className="min-w-0 truncate">{s.agentName}</span>
            {voice && (
              <span className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 tabular-nums ring-1 ${connected ? "bg-coral/10 text-[#b42318] ring-coral/30" : "bg-white text-muted ring-line"}`}>
                <span className="relative flex h-1.5 w-1.5">
                  {connected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />}
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${connected ? "bg-coral" : "bg-muted"}`} />
                </span>
                {connected ? <>Live call · {mmss(secs)}</> : "Connecting…"}
              </span>
            )}
          </div>

          <div className={`mt-1 h-[248px] transition-opacity duration-400 sm:h-[200px] ${leaving ? "opacity-0" : "opacity-100"}`}>
            {voice ? (
              <div className="flex h-full flex-col">
                {/* Call bar: participants + live waveform */}
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 ring-1 ring-line/60">
                  <span className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white transition ${speaker === "agent" ? "speak-ring" : ""}`} style={{ ["--ring" as string]: "#00BAF2" }}>Pi</span>
                  <span className="hidden w-[92px] shrink-0 flex-col leading-tight min-[400px]:flex">
                    <span className="text-[11px] font-semibold text-ink">Pi Agent</span>
                    <span className="truncate text-[10px] text-muted">{s.call?.direction} · {s.call?.language}</span>
                  </span>
                  <span className={`wave mx-1 flex h-7 min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden ${speaker ? "wave-on" : ""}`}>
                    {WAVE.map((b, i) => (
                      <span key={i} className="w-[3px] shrink-0 rounded-full transition-colors duration-300"
                        style={{ height: `${b.h * 100}%`, background: speaker === "user" ? "#002970" : speaker === "agent" ? "#00BAF2" : "#cfd8e3", ["--d" as string]: `${b.d}s`, ["--dl" as string]: `${b.dl}s` }} />
                    ))}
                  </span>
                  <span className="hidden w-[62px] shrink-0 flex-col items-end leading-tight min-[400px]:flex">
                    <span className="text-[11px] font-semibold text-ink">Customer</span>
                    <span className="text-[10px] text-muted">{speaker === "user" ? "Speaking…" : speaker === "agent" ? "Listening" : connected ? "On call" : "Ringing…"}</span>
                  </span>
                  <span className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ice text-navy transition ${speaker === "user" ? "speak-ring" : ""}`} style={{ ["--ring" as string]: "#002970" }}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6v1H4z" /></svg>
                  </span>
                </div>
                {/* Live captions */}
                <div className="mt-1 flex min-h-0 flex-1 flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_30px)]">
                  {[...shown, ...(speaking ? [s.msgs[count]] : [])].map((m, i) => {
                    const live = speaking && i === count;
                    const text = live ? wordsOf(m.text).slice(0, words).join(" ") : m.text;
                    return (
                      <div key={`${scen}-${i}`} className="msg-in shrink-0">
                        <p className={`flex gap-2 text-[14px] leading-snug sm:text-[13px] ${live ? "text-ink" : "text-body"}`}>
                          <span className={`mt-[3px] inline-flex h-4 shrink-0 items-center gap-1 rounded px-1 text-[9px] font-bold uppercase tracking-wider ${m.from === "agent" ? "bg-pi/15 text-[#006a9e]" : "bg-navy/10 text-navy"}`}>
                            {m.from === "agent" ? "Pi" : "Caller"}
                            {live && <Bars on n={3} color="currentColor" className="!h-2" />}
                          </span>
                          <span className={m.from === "user" ? "font-medium text-navy" : ""}>
                            {text}{live && <span className="caret ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-pi" />}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                  {!connected && <p className="msg-in shrink-0 text-center text-[12px] font-medium text-muted">{s.call?.direction === "Inbound" ? "Incoming call — Pi Agent answering…" : "Pi Agent is calling the customer…"}</p>}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_36px)]">
                {shown.map((m, i) => (
                  <div key={`${scen}-${i}`} className="msg-in shrink-0">
                    {m.from === "agent" ? (
                      <p className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[14px] sm:max-w-[85%] sm:text-[13px] leading-snug text-ink shadow-sm ring-1 ring-line/60">{m.text}</p>
                    ) : (
                      <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm bg-pi px-3.5 py-2.5 text-[14px] sm:max-w-[75%] sm:text-[13px] font-semibold leading-snug text-navy">{m.text}</p>
                    )}
                  </div>
                ))}
                {typing && (
                  <div key={`t-${scen}-${count}`} className="msg-in shrink-0">
                    <div className="typing flex w-14 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 ring-1 ring-line/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-navy" /><span className="h-1.5 w-1.5 rounded-full bg-navy" /><span className="h-1.5 w-1.5 rounded-full bg-navy" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Agents + outcome flows, synced with the active conversation */}
        <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
          {agents.map((a) => {
            const active = a.id === s.agent;
            const n = active ? lit : 0;
            return (
              <li key={a.id} data-active={active || undefined}
                className={`agent-card rounded-2xl bg-white p-3 ring-1 sm:p-3.5 transition duration-500 ${active ? "ring-[var(--accent)] shadow-[0_10px_30px_-12px_rgba(0,41,112,0.35)]" : "ring-line opacity-70"}`}
                style={{ ["--accent" as string]: accent[a.id] }}>
                <div className="flex items-center gap-2 text-[14px] font-semibold text-ink sm:text-[13px]">
                  <span className="relative flex h-2 w-2">
                    {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent[a.id] }} />}
                    <span className="relative h-2 w-2 rounded-full" style={{ background: accent[a.id] }} />
                  </span>
                  {a.name}
                  {active && voice && <Bars on={!!speaker} n={4} color={accent[a.id]} className="ml-auto" />}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] font-medium sm:text-[11px] text-navy sm:flex-nowrap">
                  {a.flow.map((f, i) => {
                    const on = i < n;
                    return (
                      <span key={f} className="contents">
                        <span className={`step whitespace-nowrap rounded-md px-2 py-1 ring-1 transition-all duration-500 ${on ? "step-on font-semibold ring-[var(--accent)]" : "bg-ice-2 ring-ice"}`}>
                          {on && <span className="mr-1" style={{ color: accent[a.id] === "#00BAF2" ? "#007DB8" : accent[a.id] }}>✓</span>}
                          {f}
                        </span>
                        {i < 2 && (
                          <span className="relative hidden h-px min-w-3 flex-1 overflow-hidden bg-line sm:block">
                            <span className={`absolute inset-0 origin-left transition-transform duration-700 ease-out ${i + 1 < n ? "scale-x-100" : "scale-x-0"}`} style={{ background: accent[a.id] }} />
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Phones: floating chips would overlap the card, so show them as a tidy static row instead. */}
      <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:hidden" aria-hidden="true">
        <li className={`inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition ${voice ? "ring-2 ring-pi ring-offset-2" : ""}`}>
          <Bars on={voice && !!speaker} n={4} color="#00BAF2" />
          <span lang="hi">हिन्दी</span> · English
        </li>
        {chips.map((c) => (
          <li key={c.label} className={`rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy ring-1 transition ${c.label === s.channel ? "ring-2 ring-pi" : "ring-line"}`}>{c.label}</li>
        ))}
      </ul>
      {chips.map((c) => (
        <span key={c.label} className={`absolute hidden rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-500 sm:inline-flex ${c.cls} ${c.label === s.channel ? "chip-on" : ""}`}>
          {c.label}
        </span>
      ))}
      {/* Voice-flavoured chip in the bottom-left corner: waveform pulses while a voice scene is live. */}
      <span className={`float-slower absolute -left-12 -bottom-3 hidden items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-xl transition-all duration-500 sm:inline-flex ${voice ? "chip-on" : ""}`}>
        <Bars on={voice && !!speaker} n={5} color="#00BAF2" />
        <span lang="hi">हिन्दी</span> · English
      </span>
    </div>
  );
}
