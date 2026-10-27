import { agents } from "@/lib/content";
import { PiLogo } from "./PiLogo";

// Illustrative product visual. Uses only agent names/outcome flows from the live site; the chat is a generic example.
// Paytm-style: white card, soft navy shadow (paytm.com uses rgba(0,41,112,.1–.15) shadows).
const dot: Record<string, string> = { sales: "#00BAF2", service: "#27AE60", operations: "#002970" };

export function HeroConsole() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-pi/30 via-ice to-sky/40 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,41,112,0.35)] ring-1 ring-navy/10">
        <div className="flex items-center justify-between">
          <PiLogo className="h-8 w-auto text-ink" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 text-[11px] font-semibold text-[#1e7d46] ring-1 ring-mint/30">
            <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" /></span>
            Agents running
          </span>
        </div>

        {/* Example conversation */}
        <div className="mt-5 space-y-2.5 rounded-2xl bg-mist p-4 ring-1 ring-line/70">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-muted">
            <span className="rounded bg-[#25D366]/15 px-1.5 py-0.5 text-[#128c4b]">WhatsApp</span> Pi Sales &amp; Marketing Agent
          </div>
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-snug text-ink shadow-sm ring-1 ring-line/60">
            Hi! You were looking at a few items earlier — they’re still in your cart. Want me to help you complete the order?
          </p>
          <p className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm bg-pi px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-navy">
            Yes please, share the link.
          </p>
          <div className="typing flex w-14 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 ring-1 ring-line/60" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-navy" /><span className="h-1.5 w-1.5 rounded-full bg-navy" /><span className="h-1.5 w-1.5 rounded-full bg-navy" />
          </div>
        </div>

        {/* Agents + outcome flows */}
        <ul className="mt-4 space-y-2.5">
          {agents.map((a) => (
            <li key={a.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-line" style={{ ["--accent" as string]: dot[a.id] }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <span className="h-2 w-2 rounded-full" style={{ background: dot[a.id] }} />
                {a.name}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-navy sm:flex-nowrap">
                {a.flow.map((f, i) => (
                  <span key={f} className="contents">
                    <span className="whitespace-nowrap rounded-md bg-ice-2 px-2 py-1 ring-1 ring-ice">{f}</span>
                    {i < 2 && <span className="flow-line hidden h-px min-w-3 flex-1 sm:block" />}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <span className="float-slow absolute -left-10 top-48 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-[0_8px_24px_rgba(0,41,112,0.18)] ring-1 ring-line sm:inline-flex">Voice AI</span>
      <span className="float-slower absolute -right-4 -top-4 hidden rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-xl sm:inline-flex">Meta Ads</span>
      <span className="float-slow absolute -right-6 -bottom-4 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-[0_8px_24px_rgba(0,41,112,0.18)] ring-1 ring-line sm:inline-flex">RCS</span>
      <span className="float-slower absolute -left-12 -bottom-3 hidden rounded-full bg-pi px-3 py-1.5 text-xs font-semibold text-navy shadow-xl sm:inline-flex">Paytm Ads</span>
    </div>
  );
}
