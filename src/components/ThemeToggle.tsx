"use client";
import { useEffect, useRef, useState } from "react";

const META = { dark: "#060d1f", light: "#002970" };
const REVEAL_MS = 680;

type VT = { finished: Promise<void>; ready: Promise<void> };
type DocVT = Document & { startViewTransition?: (cb: () => void) => VT };

const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTheme(dark: boolean, save: boolean) {
  const r = document.documentElement;
  r.setAttribute("data-theme", dark ? "dark" : "light");
  r.style.colorScheme = dark ? "dark" : "light";
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? META.dark : META.light));
  if (save) { try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {} }
}

/** Fallback (no View Transitions): every themed colour cross-fades together on one clock. */
function crossFade(dark: boolean, save: boolean, ms: number) {
  const r = document.documentElement;
  r.style.setProperty("--theme-fade", `${ms}ms`);
  r.classList.add("theme-anim");
  void r.offsetWidth; // commit the transition styles before the colours change
  setTheme(dark, save);
  window.setTimeout(() => r.classList.remove("theme-anim"), ms + 60);
}

/**
 * Circular liquid reveal from the toggle: the new theme grows out of the button as a
 * clip-path circle, with a soft glass ring riding its edge. Everything is a snapshot,
 * so glass, photos, console and pill change together with nothing snapping.
 */
function reveal(dark: boolean, from: HTMLElement | null) {
  const d = document as DocVT, r = document.documentElement;
  const b = from?.getBoundingClientRect();
  const x = b ? b.left + b.width / 2 : innerWidth - 40, y = b ? b.top + b.height / 2 : 40;
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
  const quick = reduced();
  r.style.setProperty("--vt-x", `${x}px`); r.style.setProperty("--vt-y", `${y}px`); r.style.setProperty("--vt-r", `${R}px`);
  r.style.setProperty("--vt-s", `${(R * 2) / 120}`);
  r.classList.add(quick ? "vt-fade" : "vt-reveal", "vt-busy", dark ? "vt-to-dark" : "vt-to-light");
  let ring: HTMLDivElement | null = null;
  const t = d.startViewTransition!(() => {
    setTheme(dark, true);
    if (!quick) {
      ring = document.createElement("div");
      ring.className = "vt-ring"; ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${x - 60}px`; ring.style.top = `${y - 60}px`;
      document.body.appendChild(ring);
    }
  });
  const done = () => { ring?.remove(); r.classList.remove("vt-reveal", "vt-fade", "vt-busy", "vt-to-dark", "vt-to-light"); };
  t.finished.then(done, done);
}

function apply(dark: boolean, from: HTMLElement | null) {
  if ((document as DocVT).startViewTransition && !document.hidden) reveal(dark, from);
  else crossFade(dark, true, reduced() ? 180 : 480);
}

/** Light/dark switch. The icon is one SVG that morphs sun ↔ moon via CSS on data-theme. */
export function ThemeToggle({ glass = false, className = "" }: { glass?: boolean; className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const busy = useRef(0);
  useEffect(() => {
    setDark(isDark());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("theme"); } catch {}
      if (!saved) { crossFade(e.matches, false, reduced() ? 180 : 480); setDark(e.matches); }
    };
    mq.addEventListener("change", onSys);
    return () => mq.removeEventListener("change", onSys);
  }, []);

  const onClick = () => {
    const now = performance.now();
    if (now - busy.current < REVEAL_MS * 0.6) return; // ignore double taps mid-reveal
    busy.current = now;
    const el = btn.current;
    if (el && !reduced()) { el.classList.remove("tt-squeeze"); void el.offsetWidth; el.classList.add("tt-squeeze"); }
    const d = !isDark();
    apply(d, el);
    setDark(d);
  };

  return (
    <button
      ref={btn}
      type="button"
      aria-label="Dark mode"
      aria-pressed={dark ?? undefined}
      title="Switch light / dark"
      onClick={onClick}
      onAnimationEnd={(e) => { if (e.animationName === "ttSqueeze") e.currentTarget.classList.remove("tt-squeeze"); }}
      className={`lg-press tt relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy ${glass ? "lg" : "hover:bg-surface/70"} ${className}`}
    >
      {/* Light: a crescent moon (switch to dark). Dark: a sun (switch to light). */}
      <svg viewBox="0 0 24 24" className="tt-i h-5 w-5" fill="none" aria-hidden="true">
        <defs>
          <mask id="tt-moon" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <rect width="24" height="24" fill="#fff" />
            <circle className="tt-bite" cx="17" cy="7" r="6.6" fill="#000" />
          </mask>
        </defs>
        <g className="tt-rot">
          <circle className="tt-core" cx="12" cy="12" r="8" fill="currentColor" mask="url(#tt-moon)" />
          <g className="tt-rays" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <path d="M12 2.6v1.9M12 19.5v1.9M2.6 12h1.9M19.5 12h1.9M5.35 5.35l1.35 1.35M17.3 17.3l1.35 1.35M5.35 18.65l1.35-1.35M17.3 6.7l1.35-1.35" />
          </g>
        </g>
      </svg>
    </button>
  );
}
