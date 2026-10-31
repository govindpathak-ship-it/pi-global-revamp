"use client";
import { useEffect, useState } from "react";

const META = { dark: "#08152f", light: "#002970" };

function apply(dark: boolean, save: boolean) {
  const r = document.documentElement;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    r.classList.add("theme-anim");
    window.setTimeout(() => r.classList.remove("theme-anim"), 400);
  }
  r.setAttribute("data-theme", dark ? "dark" : "light");
  r.style.colorScheme = dark ? "dark" : "light";
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? META.dark : META.light));
  if (save) { try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {} }
}

/** Light/dark switch. Icons swap via CSS (dark: variant), so they are right before hydration too. */
export function ThemeToggle({ glass = false, className = "" }: { glass?: boolean; className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("theme"); } catch {}
      if (!saved) { apply(e.matches, false); setDark(e.matches); }
    };
    mq.addEventListener("change", onSys);
    return () => mq.removeEventListener("change", onSys);
  }, []);

  return (
    <button
      type="button"
      aria-label="Dark mode"
      aria-pressed={dark ?? undefined}
      title="Switch light / dark"
      onClick={() => { const d = !(document.documentElement.getAttribute("data-theme") === "dark"); apply(d, true); setDark(d); }}
      className={`lg-press relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy ${glass ? "lg" : "hover:bg-surface/70"} ${className}`}
    >
      {/* Moon (shown in light mode) */}
      <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-300 dark:hidden" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
      </svg>
      {/* Sun (shown in dark mode) */}
      <svg viewBox="0 0 24 24" className="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}
