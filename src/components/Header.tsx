"use client";
import { useCallback, useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { PiLogo } from "./PiLogo";
import { ContactButton } from "./Contact";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpenRaw] = useState(false);
  const [closing, setClosing] = useState(false);
  // Close with a short exit animation (sheet shrinks back to the button).
  const setOpen = useCallback((v: boolean) => {
    if (v) { setClosing(false); setOpenRaw(true); return; }
    if (!open) return;
    setClosing(true);
    window.setTimeout(() => { setOpenRaw(false); setClosing(false); }, 200);
  }, [open]);
  // Mobile menu: Esc closes, page behind does not scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, setOpen]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 pt-[calc(0.5rem+env(safe-area-inset-top))] pl-[max(0.625rem,env(safe-area-inset-left))] pr-[max(0.625rem,env(safe-area-inset-right))] sm:pt-[calc(0.75rem+env(safe-area-inset-top))] sm:pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1rem,env(safe-area-inset-right))] ${scrolled && !open ? "scroll-edge" : ""}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-deep focus:px-3 focus:py-2 focus:text-white">Skip to main content</a>
      {/* Floating capsule bar: turns to Liquid Glass once content scrolls beneath it (or the menu is open). */}
      <div className={`mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 rounded-full pl-3.5 pr-1.5 transition-[background-color,box-shadow] duration-300 sm:h-16 sm:pl-5 sm:pr-2 ${scrolled && !open ? "lg" : ""}`}>
        <a href="#top" className="flex min-h-11 shrink-0 items-center text-ink" aria-label="Pi Agents home">
          <PiLogo className="h-8 w-auto sm:h-10" />
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} {...(n.external ? { target: "_blank", rel: "noopener" } : {})} className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-surface/70 hover:text-navy">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle glass={!scrolled || open} />
          <span className="hidden sm:block"><ContactButton className="lg-press min-h-11 !py-2.5">Contact Sales</ContactButton></span>
          <button className={`lg-press menu-btn relative grid h-11 w-11 place-items-center rounded-full text-navy lg:hidden ${scrolled && !open ? "hover:bg-surface/70" : "lg"} ${open && !closing ? "is-open" : ""}`} aria-expanded={open && !closing} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {/* Three lines that morph into an X */}
            <span className="menu-lines" aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </div>
      {open && (
        // Full-screen glass overlay (edge to edge, safe-area aware). It ripples open from the menu button.
        <nav id="mobile-nav" aria-label="Mobile" className={`menu-full fixed inset-0 -z-10 flex flex-col overflow-y-auto overscroll-contain lg:hidden ${closing ? "is-closing" : ""}`}>
          <ul className="flex flex-col px-[max(1.5rem,env(safe-area-inset-left))] pt-[calc(5.5rem+env(safe-area-inset-top))]">
            {nav.map((n, i) => (
              <li key={n.label} className="menu-item" style={{ ["--i" as string]: i }}>
                <a href={n.href} onClick={() => setOpen(false)} className="group flex min-h-16 items-center justify-between border-b border-line py-3 font-display text-[1.75rem] font-semibold tracking-tight text-ink">
                  {n.label}
                  <span aria-hidden="true" className="text-xl text-muted transition group-active:translate-x-1">&rarr;</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="menu-item mt-auto grid gap-3 px-[max(1.5rem,env(safe-area-inset-left))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-10" style={{ ["--i" as string]: nav.length }}>
            <ContactButton className="lg-press min-h-14 w-full !text-base">Contact Sales</ContactButton>
            <p className="text-center text-xs text-muted">Pi by Paytm &middot; Your AI Workforce</p>
          </div>
        </nav>
      )}
    </header>
  );
}
