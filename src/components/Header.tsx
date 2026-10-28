"use client";
import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { PiLogo } from "./PiLogo";
import { ContactButton } from "./Contact";
import { Close, Menu } from "./icons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Mobile menu: Esc closes, page behind does not scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? "bg-white/95 shadow-[0_2px_14px_rgba(0,41,112,0.1)] sm:bg-white/90 sm:backdrop-blur-xl" : "bg-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-navy focus:px-3 focus:py-2 focus:text-white">Skip to main content</a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 py-2 sm:h-18 sm:py-3 lg:px-8">
        <a href="#top" className="flex min-h-11 shrink-0 items-center text-ink" aria-label="Pi Agents home">
          <PiLogo className="h-9 w-auto sm:h-11" />
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} {...(n.external ? { target: "_blank", rel: "noopener" } : {})} className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-ice hover:text-navy">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block"><ContactButton className="min-h-11 !py-2.5">Contact Sales</ContactButton></span>
          <button className="grid h-11 w-11 place-items-center rounded-full text-navy ring-1 ring-line bg-white lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <>
        <div className="fixed inset-x-0 bottom-0 top-16 -z-10 bg-navy/30 sm:top-18 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-line bg-white px-5 pb-6 shadow-[0_12px_30px_rgba(0,41,112,0.15)] lg:hidden">
          <ul className="flex flex-col py-2">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line py-3 text-base font-semibold text-ink">{n.label}</a>
              </li>
            ))}
          </ul>
          <ContactButton className="mt-4 min-h-12 w-full">Contact Sales</ContactButton>
        </nav>
        </>
      )}
    </header>
  );
}
