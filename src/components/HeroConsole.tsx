"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { agents } from "@/lib/content";
import { PiLogo } from "./PiLogo";

// Illustrative product visual. Agent names/outcome flows come from the live site; the chats are generic examples
// (no real customers, no performance claims). A tiny timer-driven state machine plays them on a loop.

const accent: Record<string, string> = { sales: "#00BAF2", service: "#27AE60", operations: "#002970" };

type Msg = { from: "agent" | "user"; text: string; lights?: number };
type Scenario = { agent: string; agentName: string; channel: "WhatsApp" | "Voice AI"; msgs: Msg[] };

const scenarios: Scenario[] = [
  {
    agent: "sales",
    agentName: "Pi Sales & Marketing Agent",
    channel: "WhatsApp",
    msgs: [
      { from: "agent", lights: 1, text: "Hi! You were looking at a few items earlier — they’re still in your cart. Want me to help you complete the order?" },
      { from: "user", text: "Yes please, share the link." },
      { from: "agent", lights: 2, text: "Here’s your secure payment link 🔗 Pay in one tap with UPI." },
      { from: "user", text: "Paid ✅" },
      { from: "agent", lights: 3, text: "Thank you! Your order is confirmed and on its way 🎉" },
    ],
  },
  {
    agent: "service",
    agentName: "Pi Service Agent",
    channel: "Voice AI",
    msgs: [
      { from: "user", text: "Hi, I want a refund for order #OD1024. One item came damaged." },
      { from: "agent", lights: 1, text: "Sorry about that! I’ve found order #OD1024. Is it the blue kurta?" },
      { from: "user", text: "Yes, that one." },
      { from: "agent", lights: 2, text: "Done — your refund is initiated to the original payment method. You’ll get an SMS once it’s processed." },
      { from: "user", text: "That was quick, thanks!" },
      { from: "agent", lights: 3, text: "Happy to help! Anything else I can do for you today?" },
    ],
  },
  {
    agent: "operations",
    agentName: "Pi Operations Agent",
    channel: "WhatsApp",
    msgs: [
      { from: "agent", lights: 1, text: "Namaste! Your EMI is due on the 5th. Shall I set up UPI Autopay so you never miss a payment?" },
      { from: "user", text: "Haan, kar do please." },
      { from: "agent", lights: 2, text: "Done ✅ UPI Autopay is active, and your KYC is now complete." },
      { from: "user", text: "Super, thank you!" },
      { from: "agent", lights: 3, text: "You’re all set. Reminders and receipts will come right here on WhatsApp." },
    ],
  },
];

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
// Reading time for the previous message before the next thing happens (~1.2–2.5s).
const readTime = (m?: Msg) => (m ? clamp(700 + m.text.length * 18, 1200, 2500) : 700);

const chips = [
  { label: "Voice AI", cls: "float-slow -left-10 top-48 bg-white text-navy ring-1 ring-line shadow-[0_8px_24px_rgba(0,41,112,0.18)]" },
  { label: "Meta Ads", cls: "float-slower -right-4 -top-4 bg-navy text-white shadow-xl" },
  { label: "RCS", cls: "float-slow -right-6 -bottom-4 bg-white text-navy ring-1 ring-line shadow-[0_8px_24px_rgba(0,41,112,0.18)]" },
  { label: "Paytm Ads", cls: "float-slower -left-12 -bottom-3 bg-pi text-navy shadow-xl" },
];

export function HeroConsole() {
  // Initial (server-rendered / no-JS) state matches a sensible static frame: first exchange of scenario 1.
  const [scen, setScen] = useState(0);
  const [count, setCount] = useState(2);
  const [typing, setTyping] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Run only when on-screen, tab visible, and motion allowed.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const update = () => {
      setReduced(mq.matches);
      setRunning(inView && !document.hidden && !mq.matches);
    };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    document.addEventListener("visibilitychange", update);
    mq.addEventListener("change", update);
    update();
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); mq.removeEventListener("change", update); };
  }, []);

  // Reduced motion: static, complete conversation.
  useEffect(() => {
    if (reduced) { setScen(0); setCount(scenarios[0].msgs.length); setTyping(false); setLeaving(false); }
  }, [reduced]);

  // The state machine: one timeout per step.
  useEffect(() => {
    if (!running) return;
    const msgs = scenarios[scen].msgs;
    let t: number;
    if (leaving) {
      t = window.setTimeout(() => { setScen((s) => (s + 1) % scenarios.length); setCount(0); setLeaving(false); }, 450);
    } else if (count >= msgs.length) {
      t = window.setTimeout(() => setLeaving(true), 2800);
    } else if (typing) {
      t = window.setTimeout(() => { setTyping(false); setCount((c) => c + 1); }, clamp(900 + msgs[count].text.length * 6, 1200, 1700));
    } else if (msgs[count].from === "agent") {
      t = window.setTimeout(() => setTyping(true), count === 0 ? 500 : Math.min(readTime(msgs[count - 1]), 1400));
    } else {
      t = window.setTimeout(() => setCount((c) => c + 1), readTime(msgs[count - 1]));
    }
    return () => window.clearTimeout(t);
  }, [running, scen, count, typing, leaving]);

  const s = scenarios[scen];
  const shown = s.msgs.slice(0, count);
  const lit = useMemo(() => shown.reduce((m, x) => Math.max(m, x.lights ?? 0), 0), [shown]);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-pi/30 via-ice to-sky/40 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,41,112,0.35)] ring-1 ring-navy/10">
        <div className="flex items-center justify-between">
          <PiLogo className="h-8 w-auto text-ink" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 text-[11px] font-semibold text-[#1e7d46] ring-1 ring-mint/30">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" /></span>
            Agents running
          </span>
        </div>

        {/* Screen-reader transcript (static) — the animated chat below is decorative. */}
        <div className="sr-only">
          <p>Example conversations handled by Pi Agents:</p>
          {scenarios.map((x) => (
            <ul key={x.agent} aria-label={`${x.channel}, ${x.agentName}`}>
              {x.msgs.map((m, i) => <li key={i}>{m.from === "agent" ? "Agent" : "Customer"}: {m.text}</li>)}
            </ul>
          ))}
        </div>

        {/* Animated example conversation — fixed height, newest at the bottom, older lines scroll up and fade. */}
        <div className="mt-5 rounded-2xl bg-mist p-4 ring-1 ring-line/70" aria-hidden="true">
          <div key={`h-${scen}`} className="chat-head flex items-center gap-2 text-[11px] font-semibold text-muted">
            {s.channel === "WhatsApp" ? (
              <span className="rounded bg-[#25D366]/15 px-1.5 py-0.5 text-[#128c4b]">WhatsApp</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-ice px-1.5 py-0.5 text-navy">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                Voice AI · Call
              </span>
            )}
            <span className="truncate">{s.agentName}</span>
          </div>
          <div className={`mt-1 flex h-[232px] flex-col justify-end overflow-hidden transition-opacity duration-400 [mask-image:linear-gradient(to_bottom,transparent,#000_36px)] sm:h-[200px] ${leaving ? "opacity-0" : "opacity-100"}`}>
            {shown.map((m, i) => (
              <div key={`${scen}-${i}`} className="msg-in shrink-0">
                {m.from === "agent" ? (
                  <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-snug text-ink shadow-sm ring-1 ring-line/60">{m.text}</p>
                ) : (
                  <p className="ml-auto w-fit max-w-[75%] rounded-2xl rounded-tr-sm bg-pi px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-navy">{m.text}</p>
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
        </div>

        {/* Agents + outcome flows, synced with the active conversation */}
        <ul className="mt-4 space-y-2.5">
          {agents.map((a) => {
            const active = a.id === s.agent;
            const n = active ? lit : 0;
            return (
              <li
                key={a.id}
                data-active={active || undefined}
                className={`agent-card rounded-2xl bg-white p-3.5 ring-1 transition duration-500 ${active ? "ring-[var(--accent)] shadow-[0_10px_30px_-12px_rgba(0,41,112,0.35)]" : "ring-line opacity-70"}`}
                style={{ ["--accent" as string]: accent[a.id] }}
              >
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <span className="relative flex h-2 w-2">
                    {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent[a.id] }} />}
                    <span className="relative h-2 w-2 rounded-full" style={{ background: accent[a.id] }} />
                  </span>
                  {a.name}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-navy sm:flex-nowrap">
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

      {chips.map((c) => {
        const on = c.label === s.channel;
        return (
          <span key={c.label} className={`absolute hidden rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-500 sm:inline-flex ${c.cls} ${on ? "chip-on" : ""}`}>
            {c.label}
          </span>
        );
      })}
    </div>
  );
}
