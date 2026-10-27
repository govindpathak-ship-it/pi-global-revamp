import { agents } from "@/lib/content";
import { PiLogo } from "./PiLogo";

// Illustrative product visual. Uses only agent names/outcome flows from the live site; the chat is a generic example.
export function HeroConsole() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-pi/40 via-pi-600/10 to-sun/20 opacity-70 blur-2xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[2rem] bg-ink-2/80 p-2 shadow-[0_40px_120px_-30px_rgba(0,183,255,0.55)] ring-1 ring-white/15 backdrop-blur-xl">
        <div className="rounded-[1.6rem] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <PiLogo className="h-8 w-auto" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-semibold text-mint ring-1 ring-mint/30">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" /></span>
              Agents running
            </span>
          </div>

          {/* Example conversation */}
          <div className="mt-5 space-y-2.5 rounded-2xl bg-ink/60 p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/45">
              <span className="rounded bg-[#25D366]/20 px-1.5 py-0.5 text-[#25D366]">WhatsApp</span> Pi Sales &amp; Marketing Agent
            </div>
            <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-[13px] leading-snug text-white/90">
              Hi! You were looking at a few items earlier — they’re still in your cart. Want me to help you complete the order?
            </p>
            <p className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm bg-pi px-3.5 py-2.5 text-[13px] font-medium leading-snug text-ink">
              Yes please, share the link.
            </p>
            <div className="typing flex w-14 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-white/10 px-3 py-3" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /><span className="h-1.5 w-1.5 rounded-full bg-white" /><span className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Agents + outcome flows */}
          <ul className="mt-4 space-y-2.5">
            {agents.map((a) => (
              <li key={a.id} className="rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/10" style={{ ["--accent" as string]: a.accent }}>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: a.accent, boxShadow: `0 0 12px ${a.accent}` }} />
                  {a.name}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/70 sm:flex-nowrap">
                  {a.flow.map((f, i) => (
                    <span key={f} className="contents">
                      <span className="whitespace-nowrap rounded-md bg-white/[0.06] px-2 py-1">{f}</span>
                      {i < 2 && <span className="flow-line hidden h-px min-w-3 flex-1 sm:block" />}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span className="float-slow absolute -left-10 top-48 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-xl sm:inline-flex">Voice AI</span>
      <span className="float-slower absolute -right-4 -top-4 hidden rounded-full bg-sun px-3 py-1.5 text-xs font-semibold text-ink shadow-xl sm:inline-flex">Meta Ads</span>
      <span className="float-slow absolute -right-6 -bottom-4 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-xl sm:inline-flex">RCS</span>
      <span className="float-slower absolute -left-12 -bottom-3 hidden rounded-full bg-pi px-3 py-1.5 text-xs font-semibold text-ink shadow-xl sm:inline-flex">Paytm Ads</span>
    </div>
  );
}
