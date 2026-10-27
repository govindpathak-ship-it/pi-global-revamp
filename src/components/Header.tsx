"use client";
import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { PiLogo } from "./PiLogo";
import { ContactButton } from "./Contact";
import { Close, Menu } from "./icons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? "bg-ink/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl" : "bg-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-ink">Skip to main content</a>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 py-3 lg:px-8">
        <a href="#top" className="shrink-0 text-white" aria-label="Pi Agents home">
          <PiLogo className="h-10 w-auto sm:h-11" />
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1.5 ring-1 ring-white/10">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} {...(n.external ? { target: "_blank", rel: "noopener" } : {})} className="rounded-full px-3.5 py-1.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block"><ContactButton className="!py-2.5">Contact Sales</ContactButton></span>
          <button className="rounded-full p-2.5 text-white ring-1 ring-white/20 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-white/10 px-5 pb-6 lg:hidden">
          <ul className="flex flex-col py-2">
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} onClick={() => setOpen(false)} className="block border-b border-white/5 py-3.5 text-base text-white/85">{n.label}</a>
              </li>
            ))}
          </ul>
          <ContactButton className="mt-4 w-full">Contact Sales</ContactButton>
        </nav>
      )}
    </header>
  );
}
