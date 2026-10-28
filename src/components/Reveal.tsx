"use client";
import { useEffect } from "react";

/**
 * Scroll reveal that can never leave content blank.
 * Nothing is hidden in the HTML: content is fully visible before (and without) JS.
 * After hydration, anything already on or above the screen is marked visible first,
 * and only then is the `.js` class added, so just the sections still below the fold fade in.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const vh = window.innerHeight;
    const later: HTMLElement[] = [];
    els.forEach((el) => (el.getBoundingClientRect().top < vh ? el.classList.add("is-in") : later.push(el)));
    document.documentElement.classList.add("js");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -5% 0px", threshold: 0.01 }
    );
    later.forEach((el) => io.observe(el));
    // Safety net for fast flings / jump links: anything already on or above the screen is shown.
    let raf = 0;
    const sweep = () => { raf = 0; const h = window.innerHeight; later.forEach((el) => { if (el.getBoundingClientRect().top < h) el.classList.add("is-in"); }); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sweep); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return null;
}
