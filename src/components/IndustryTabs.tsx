"use client";
import { useRef, useState } from "react";
import { industries } from "@/lib/content";

export function IndustryTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ind = industries[active];

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const next = (active + d + industries.length) % industries.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Industries" onKeyDown={onKey} className="mx-auto grid w-full max-w-xl grid-cols-4 gap-1 rounded-full bg-white/5 p-1.5 ring-1 ring-white/10 backdrop-blur">
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
            className={`whitespace-nowrap rounded-full px-1 py-2.5 text-[12.5px] font-semibold sm:px-4 sm:text-sm transition ${i === active ? "bg-white text-ink shadow" : "text-white/70 hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={ind.id} role="tabpanel" id={`panel-${ind.id}`} aria-labelledby={`tab-${ind.id}`} className="mt-10 grid animate-[fadeUp_.5s_ease] gap-5 lg:grid-cols-12">
        <div className="relative min-h-[300px] overflow-hidden rounded-3xl ring-1 ring-white/10 lg:col-span-5 lg:min-h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ind.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-pi/25 via-transparent to-transparent mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pi">{ind.label}</p>
            <p className="font-display mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">{ind.tagline}</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {ind.pillars.map((p, i) => (
            <div key={p.title} className="group relative overflow-hidden rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 transition hover:bg-white/[0.07]">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-pi/15 font-display text-sm font-semibold text-pi ring-1 ring-pi/30">0{i + 1}</span>
                <h3 className="font-display text-xl font-semibold text-white">{p.title}</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-white/65">{p.body}</p>
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-pi/20 opacity-0 blur-2xl transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
