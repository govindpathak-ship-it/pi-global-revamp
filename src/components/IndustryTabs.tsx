"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { industries } from "@/lib/content";

export function IndustryTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ind = industries[active];
  const pill = useRef<HTMLSpanElement>(null);
  const prev = useRef<DOMRect | null>(null);
  const [ready, setReady] = useState(false);

  // Liquid-glass pill: sits under the active tab and flows to the next one like a drop —
  // stretches along the path, squishes as it lands, then settles.
  const place = useCallback((animate: boolean) => {
    const el = pill.current, tab = tabs.current[active];
    if (!el || !tab) return;
    const to = { x: tab.offsetLeft, y: tab.offsetTop, w: tab.offsetWidth, h: tab.offsetHeight };
    const from = prev.current;
    Object.assign(el.style, { transform: `translate(${to.x}px, ${to.y}px)`, width: `${to.w}px`, height: `${to.h}px` });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && from && !reduce && el.animate && (from.x !== to.x || from.y !== to.y)) {
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const stretch = Math.min(0.45, dist / 400);          // longer jump → longer drop
      const mw = (from.width + to.w) / 2 * (1 + stretch), mh = to.h * (1 - stretch * 0.35);
      const mx = (from.x + to.x) / 2 - (mw - (from.width + to.w) / 2) / 2, my = (from.y + to.y) / 2 + (to.h - mh) / 2;
      el.animate([
        { transform: `translate(${from.x}px, ${from.y}px)`, width: `${from.width}px`, height: `${from.height}px` },
        { offset: 0.45, transform: `translate(${mx}px, ${my}px)`, width: `${mw}px`, height: `${mh}px` },
        { offset: 0.78, transform: `translate(${to.x - to.w * 0.03}px, ${to.y - to.h * 0.04}px)`, width: `${to.w * 1.06}px`, height: `${to.h * 1.08}px` },
        { transform: `translate(${to.x}px, ${to.y}px)`, width: `${to.w}px`, height: `${to.h}px` },
      ], { duration: 560, easing: "cubic-bezier(.3,.7,.2,1)" });
    }
    prev.current = { x: to.x, y: to.y, width: to.w, height: to.h } as DOMRect;
  }, [active]);

  useLayoutEffect(() => { place(true); setReady(true); }, [place]);
  useEffect(() => {
    const ro = new ResizeObserver(() => place(false));
    const list = pill.current?.parentElement;
    if (list) ro.observe(list);
    return () => ro.disconnect();
  }, [place]);

  const onKey = (e: React.KeyboardEvent) => {
    const n = industries.length;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (active + 1) % n :
      e.key === "ArrowLeft" || e.key === "ArrowUp" ? (active - 1 + n) % n :
      e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Industries" onKeyDown={onKey} className="relative mx-auto grid w-full max-w-xl grid-cols-2 gap-1 rounded-3xl bg-surface p-1.5 ring-1 ring-line shadow-[0_4px_16px_rgba(0,41,112,0.08)] sm:grid-cols-4 sm:rounded-full">
        {/* Glass pill (hidden until JS positions it; before that the active tab has a solid fill). */}
        <span ref={pill} aria-hidden="true" className={`tab-pill lg lg-navy pointer-events-none absolute left-0 top-0 rounded-full ${ready ? "" : "invisible"}`} />
        {industries.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabs.current[i] = el; }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`relative z-10 min-h-11 whitespace-nowrap rounded-full px-3 py-2.5 text-[15px] font-semibold transition-colors duration-300 sm:px-4 sm:text-sm ${i === active ? `text-white ${ready ? "" : "bg-deep"}` : "text-ink hover:bg-ice/70 hover:text-navy"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={ind.id} role="tabpanel" id={`panel-${ind.id}`} aria-labelledby={`tab-${ind.id}`} className="mt-10 grid animate-[fadeUp_.5s_ease] gap-5 lg:grid-cols-12">
        <div className="relative min-h-[260px] overflow-hidden rounded-3xl bg-ink sm:min-h-[300px] lg:col-span-5 lg:min-h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ind.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          {/* Light bottom-only scrim keeps the label readable without hiding the photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep/90 from-0% via-deep/45 via-30% to-transparent to-60%" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqua">{ind.label}</p>
            <p className="font-display mt-2 text-[1.375rem] font-semibold leading-tight text-white sm:text-3xl">{ind.tagline}</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {ind.pillars.map((p, i) => (
            <div key={p.title} className="soft-lift group relative overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-line sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ice font-display text-sm font-semibold text-navy">0{i + 1}</span>
                <h3 className="font-display text-xl font-semibold text-ink">{p.title}</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-body">{p.body}</p>
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 hidden rounded-full bg-pi/15 opacity-0 blur-2xl transition group-hover:opacity-100 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
