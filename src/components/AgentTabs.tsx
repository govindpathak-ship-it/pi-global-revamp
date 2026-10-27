"use client";
import { useRef, useState } from "react";
import { agents } from "@/lib/content";
import { ArrowRight, Check } from "./icons";

export function AgentTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = agents[active];
  const onKey = (e: React.KeyboardEvent) => {
    const d = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(e.key) ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + agents.length) % agents.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div role="tablist" aria-label="Pi Agents" aria-orientation="vertical" onKeyDown={onKey} className="flex gap-3 overflow-x-auto pb-1 lg:col-span-4 lg:flex-col lg:overflow-visible">
        {agents.map((ag, i) => {
          const on = i === active;
          return (
            <button
              key={ag.id}
              ref={(el) => { tabs.current[i] = el; }}
              role="tab"
              id={`agent-tab-${ag.id}`}
              aria-selected={on}
              aria-controls={`agent-panel-${ag.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              style={{ ["--accent" as string]: ag.accent }}
              className={`relative min-w-[240px] flex-1 overflow-hidden rounded-3xl p-5 text-left transition lg:min-w-0 lg:flex-none ${on ? "bg-navy text-white shadow-[0_18px_40px_-16px_rgba(0,41,112,0.55)]" : "bg-white text-ink ring-1 ring-line hover:ring-navy/40"}`}
            >
              <span className="absolute inset-y-0 left-0 w-1 transition" style={{ background: on ? ag.accent : "transparent" }} />
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: on ? ag.accent : "#505050" }}>
                <span className="h-2 w-2 rounded-full" style={{ background: ag.accent }} />
                Agent 0{i + 1}
              </span>
              <span className="font-display mt-2 block text-xl font-semibold">{ag.name}</span>
              <span className={`mt-1 block text-sm ${on ? "text-white/80" : "text-muted"}`}>{ag.tagline}</span>
            </button>
          );
        })}
      </div>

      <div
        key={a.id}
        role="tabpanel"
        id={`agent-panel-${a.id}`}
        aria-labelledby={`agent-tab-${a.id}`}
        style={{ ["--accent" as string]: a.accent }}
        className="relative animate-[fadeUp_.5s_ease] overflow-hidden rounded-[2rem] bg-navy p-7 text-white sm:p-10 lg:col-span-8"
      >
        <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full opacity-25 blur-3xl" style={{ background: a.accent }} />
        <div className="grid-lines pointer-events-none absolute inset-0" style={{ ["--grid" as string]: "rgb(255 255 255 / 0.05)" }} />
        <div className="relative">
          <h3 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{a.tagline}</h3>
          <p className="mt-3 max-w-2xl text-white/80">{a.body}</p>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">The outcome</p>
          <ol className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
            {a.flow.map((f, i) => (
              <li key={f} className="flex items-center sm:flex-1">
                <span className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-ink" style={{ background: a.accent }}>{i + 1}</span>
                  <span className="text-sm font-semibold">{f}</span>
                </span>
                {i < 2 && <span className="flow-line mx-2 hidden h-px w-10 shrink-0 sm:block" aria-hidden="true" />}
              </li>
            ))}
          </ol>

          <div className="mt-9 grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">What it does</p>
              <ul className="mt-4 space-y-3">
                {a.does.map((d) => (
                  <li key={d} className="flex gap-3 text-[15px] text-white/85">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-ink" style={{ background: a.accent }}><Check className="h-3 w-3" /></span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">Where it runs</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {a.channels.map((c) => (
                  <li key={c} className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-sm text-white/85 ring-1 ring-white/12">{c}</li>
                ))}
              </ul>
              <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: a.accent }}>
                Put the {a.short} Agent to work <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
