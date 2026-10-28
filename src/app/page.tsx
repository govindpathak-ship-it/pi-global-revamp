/* eslint-disable @next/next/no-img-element */
import { Header } from "@/components/Header";
import { ContactButton, ContactProvider } from "@/components/Contact";
import { RevealObserver } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { IndustryTabs } from "@/components/IndustryTabs";
import { AgentTabs } from "@/components/AgentTabs";
import { HeroConsole } from "@/components/HeroConsole";
import { Pixels } from "@/components/Pixels";
import { PiLogo } from "@/components/PiLogo";
import { ArrowRight, ArrowUpRight, Bolt, Layers, Shield, Social } from "@/components/icons";
import { asset } from "@/lib/asset";
import { footerLinks, hero, khimjiCase, logos, outcomes, paytmCase, segments, socials } from "@/lib/content";

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`font-mono inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ring-1 ${dark ? "bg-white/10 text-aqua ring-white/20" : "bg-ice text-navy ring-pi/30"}`}>
      <span className="status-dot h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <ContactProvider>
      <RevealObserver />
      <Header />
      <main id="main">
        {/* HERO */}
        <section id="top" className="relative isolate overflow-hidden bg-gradient-to-b from-ice-2 via-white to-white pt-32 pb-24 text-ink sm:pt-40 lg:pb-32">
          <Pixels palette={["#00baf2", "#96d8ee", "#e0f5fd", "#85eefc"]} maxOpacity={0.3} className="opacity-60 [mask-image:radial-gradient(ellipse_at_75%_25%,#000_5%,transparent_65%)]" />
          <div className="grid-lines absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000,transparent)]" aria-hidden="true" />
          <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-pi/20 blur-[140px]" aria-hidden="true" />
          <div className="absolute right-[-10%] top-1/4 -z-10 hidden h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(0_186_242/0.18),transparent)] lg:block" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-12 lg:px-8">
            <div className="min-w-0 lg:col-span-7">
              <div data-reveal><Eyebrow>{hero.eyebrow}</Eyebrow></div>
              <h1 data-reveal style={{ ["--d" as string]: "80ms" }} className="font-display mt-6 text-[2.75rem] leading-[1.05] font-bold text-ink sm:text-6xl lg:text-[4.5rem]">
                {hero.titleA}
                <br />
                <span className="text-pi-strong">{hero.titleB}</span>
              </h1>
              <p data-reveal style={{ ["--d" as string]: "160ms" }} className="mt-7 max-w-xl text-lg leading-relaxed text-body sm:text-xl">{hero.sub}</p>
              <div data-reveal style={{ ["--d" as string]: "240ms" }} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ContactButton className="!px-7 !py-4 !text-base">Book a demo</ContactButton>
                <a href="#agents" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-navy ring-1 ring-navy transition hover:bg-navy hover:text-white">
                  Meet the agents
                </a>
              </div>
              <dl data-reveal style={{ ["--d" as string]: "320ms" }} className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-7">
                {[
                  ["60,000", "AI calls a day"],
                  ["1 Trillion+", "tokens / month"],
                  ["100+", "AI agents at Paytm"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="sr-only">{l}</dt>
                    <dd className="font-display text-2xl font-bold text-navy sm:text-3xl">{v}</dd>
                    <dd className="font-mono mt-1.5 text-[10px] uppercase text-muted sm:text-[11px]">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div data-reveal style={{ ["--d" as string]: "200ms" }} className="min-w-0 lg:col-span-5">
              <HeroConsole />
            </div>
          </div>
        </section>

        {/* OUTCOMES */}
        <section id="growth" className="relative bg-mist py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div data-reveal>
                <Eyebrow>Outcomes, not activity</Eyebrow>
                <h2 className="font-display mt-5 max-w-2xl text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.5rem] lg:text-5xl">You name the goal. <span className="text-pi-strong">Pi Agents get you there.</span></h2>
              </div>
              <p data-reveal className="max-w-sm text-body">Pi Agents run the campaigns, talk to your customers, and follow up — across the full customer lifecycle.</p>
            </div>
            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {outcomes.map((o, i) => (
                <li key={o.title} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                  <a href="#agents" className="group relative grid h-full grid-cols-[auto_1fr] items-start gap-x-4 overflow-hidden rounded-3xl bg-white p-5 sm:flex sm:flex-col sm:p-7 ring-1 ring-line/70 shadow-[0_4px_20px_rgba(0,41,112,0.06)] soft-lift">
                    <span className="row-span-2 grid h-12 w-12 place-items-center rounded-2xl bg-ice-2 ring-1 ring-ice transition group-hover:bg-ice sm:h-14 sm:w-14">
                      <img src={asset(`/images/icons/${o.icon}`)} alt="" className="h-8 w-8" />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-ink sm:mt-6 sm:text-xl">{o.title}</h3>
                    <p className="mt-1 flex-1 text-[15px] leading-relaxed text-body sm:mt-2">{o.body}</p>
                    <span className="mt-6 hidden h-9 w-9 items-center justify-center rounded-full bg-ice sm:inline-flex text-navy transition group-hover:bg-navy group-hover:text-white">
                      <ArrowRight />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section id="industries" className="relative isolate overflow-hidden bg-white py-24 text-ink sm:py-32">
          <img src={asset("/images/industries/bg.webp")} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/80 to-white" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div data-reveal className="text-center">
              <Eyebrow>Industries</Eyebrow>
              <h2 className="font-display mx-auto mt-5 max-w-3xl text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.5rem] lg:text-5xl">
                Pi Agents, built for <span className="text-pi-strong">your industry</span>
              </h2>
            </div>
            <div data-reveal className="mt-12">
              <IndustryTabs />
            </div>
          </div>
        </section>

        {/* LOGOS */}
        <section aria-labelledby="trusted" className="border-y border-line/70 bg-mist py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <h2 id="trusted" className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted">Trusted by leading businesses across India</h2>
            <div className="marquee mt-10 overflow-hidden">
              <ul className="marquee-track flex w-max items-center gap-16 sm:gap-20">
                {[...logos, ...logos].map((l, i) => (
                  <li key={i} aria-hidden={i >= logos.length} className="shrink-0">
                    <img src={l.src} alt={i < logos.length ? l.alt : ""} className="h-9 max-w-[150px] w-auto object-contain opacity-60 mix-blend-multiply grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-11" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* AGENTS */}
        <section id="agents" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div data-reveal className="max-w-3xl">
              <Eyebrow>AI Agents</Eyebrow>
              <h2 className="font-display mt-5 text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.5rem] lg:text-5xl">
                Three AI agents.
                <br />
                <span className="text-pi-strong">One growth engine.</span>
              </h2>
            </div>
            <div data-reveal className="mt-14">
              <AgentTabs />
            </div>
          </div>
        </section>

        {/* SEGMENTS */}
        <section id="who-is-it-for" className="bg-mist py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div data-reveal className="text-center">
              <Eyebrow>Who is it for?</Eyebrow>
              <h2 className="font-display mx-auto mt-5 max-w-3xl text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.5rem] lg:text-5xl">
                One growth engine for <span className="text-pi-strong">every</span> size of business
              </h2>
            </div>
            <ul className="mt-14 grid gap-5 lg:grid-cols-3">
              {segments.map((s, i) => (
                <li key={s.title} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="group relative isolate flex min-h-[300px] flex-col overflow-hidden rounded-[2rem] bg-navy p-7 text-white sm:p-8 lg:min-h-[380px] text-white">
                  <img src={asset("/images/segments-bg.webp")} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-70" style={{ objectPosition: ["20% 30%", "60% 50%", "90% 80%"][i] }} />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/85 to-navy/30" />
                  <span className="font-display text-sm font-semibold text-white/70">0{i + 1}</span>
                  <div className="mt-auto">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aqua">{s.kicker}</p>
                    <h3 className="font-display mt-2 text-3xl font-semibold leading-tight">{s.title}</h3>
                    <p className="mt-4 text-[15px] leading-relaxed text-white/85">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* WHY PAYTM */}
        <section id="why-paytm" className="relative isolate overflow-hidden bg-gradient-to-b from-ice-2 to-white py-24 text-ink sm:py-32">
          <div className="grid-lines absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_15%_0%,#000,transparent_65%)]" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div data-reveal className="max-w-3xl">
              <Eyebrow>Why Paytm</Eyebrow>
              <h2 className="font-display mt-5 text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.5rem] lg:text-5xl">
                Proven at scale. <span className="text-pi-strong">Built for our markets.</span>
              </h2>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-12">
              <div data-reveal className="soft-lift relative overflow-hidden rounded-[2rem] bg-pi p-8 text-navy shadow-[0_24px_60px_-28px_rgba(0,147,214,0.6)] sm:p-10 lg:col-span-7 lg:row-span-2">
                <Pixels palette={["#ffffff", "#85eefc", "#002970"]} cols={14} rows={10} size={48} density={0.25} maxOpacity={0.25} className="opacity-60 [mask-image:linear-gradient(to_left,#000,transparent)]" />
                <div className="relative flex h-full flex-col">
                  <p className="font-mono inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-navy"><Bolt className="h-4 w-4" /> AI Agents</p>
                  <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                    <div>
                      <p className="font-display text-6xl font-semibold sm:text-7xl"><Counter value="60,000" /></p>
                      <p className="mt-2 text-navy/80">AI Calls a day</p>
                    </div>
                    <div>
                      <p className="font-display text-6xl font-semibold sm:text-7xl">1 Trillion+</p>
                      <p className="mt-2 text-navy/80">Tokens consumed each month</p>
                    </div>
                    <div className="border-t border-navy/20 pt-8 sm:col-span-2">
                      <p className="font-display text-6xl font-semibold sm:text-7xl"><Counter value="100+" /></p>
                      <p className="mt-2 text-navy/80">Voice AI and Chat AI Agents</p>
                    </div>
                  </div>
                  <p className="mt-auto pt-10 text-lg font-medium leading-relaxed text-navy sm:max-w-lg">
                    Paytm has successfully deployed and runs these agents across its businesses, driving real outcomes.
                  </p>
                </div>
              </div>
              <div data-reveal style={{ ["--d" as string]: "80ms" }} className="soft-lift rounded-[2rem] bg-white p-8 ring-1 ring-line shadow-[0_4px_20px_rgba(0,41,112,0.06)] lg:col-span-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ice text-pi-ink ring-1 ring-pi/30"><Layers /></span>
                <p className="font-mono mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-pi-ink">Robust</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-ink">Infrastructure — the power behind every message</h3>
                <p className="mt-3 text-body">Powered by Meta BSP status, Google/AWS partnerships, and our own telecom network, we provide the ultimate CPaaS layer for every conversation.</p>
              </div>
              <div data-reveal style={{ ["--d" as string]: "160ms" }} className="soft-lift rounded-[2rem] bg-white p-8 ring-1 ring-line shadow-[0_4px_20px_rgba(0,41,112,0.06)] lg:col-span-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint/10 text-[#1e7d46] ring-1 ring-mint/30"><Shield /></span>
                <p className="font-mono mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-[#1e7d46]">Sovereign</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-ink">Sovereign AI built for India and the Middle East</h3>
                <p className="mt-3 text-body">DPDP-compliant by design with native Hindi and Arabic support, our AI is custom-built for the regulatory and operational realities of our markets.</p>
                <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                  {["DPDP-compliant", "हिन्दी · Hindi", "العربية · Arabic"].map((c) => (
                    <li key={c} className="rounded-full bg-ice-2 px-3 py-1 text-navy ring-1 ring-ice">{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CASE STUDIES */}
        <section id="case-studies" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div data-reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <Eyebrow>Case Studies</Eyebrow>
                <h2 className="font-display mt-5 text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.5rem] lg:text-5xl">
                  Your Business,
                  <br />
                  to the power of <span className="text-pi-strong">Pi</span>
                </h2>
              </div>
              <ContactButton className="self-start md:self-auto">Book a demo</ContactButton>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {/* Paytm */}
              <article data-reveal className="flex flex-col overflow-hidden rounded-[2rem] bg-mist ring-1 ring-line/70">
                <div className="grid grid-cols-2 gap-px bg-line/70">
                  {paytmCase.stats.map((s) => (
                    <div key={s.label} className="bg-mist p-7 sm:p-8">
                      <p className="font-display text-4xl font-bold text-navy sm:text-5xl"><Counter value={s.value} /></p>
                      <p className="mt-1 text-sm text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <img src={asset("/images/case/logo-paytm.png")} alt="Paytm" className="h-8 w-auto self-start" />
                  <h3 className="font-display mt-5 text-2xl font-semibold text-ink sm:text-3xl">Pi Agents, proven at Paytm scale</h3>
                  <p className="mt-3 leading-relaxed text-body">{paytmCase.body}</p>
                </div>
              </article>
              {/* Khimji */}
              <article data-reveal style={{ ["--d" as string]: "100ms" }} className="relative isolate flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] bg-navy text-white">
                <img src={asset("/images/case/khimji.webp")} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-top opacity-80" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/80 to-navy/0" />
                <div className="m-7 self-start rounded-xl bg-white px-4 py-2.5 sm:m-8">
                  <img src={asset("/images/case/logo-khimji.png")} alt="Khimji Jewellers" className="h-6 w-auto" />
                </div>
                <div className="mt-auto p-7 sm:p-8">
                  <div className="flex gap-10">
                    {khimjiCase.stats.map((s) => (
                      <div key={s.label}>
                        <p className="font-display text-4xl font-bold text-pi sm:text-5xl"><Counter value={s.value} /></p>
                        <p className="mt-1 text-sm text-white/85">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <h3 className="font-display mt-6 text-2xl font-semibold sm:text-3xl">How Khimji Jewellers drove festive walk-ins with Pi Agents</h3>
                  <p className="mt-3 leading-relaxed text-white/85">{khimjiCase.body}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="px-5 pb-24 lg:px-8">
          <div data-reveal className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-navy px-7 py-16 text-white sm:px-14 sm:py-24">
            <Pixels cols={28} rows={10} density={0.3} maxOpacity={0.45} className="-z-10 opacity-70 [mask-image:linear-gradient(to_left,#000,transparent_70%)]" />
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h2 className="font-display text-[2rem] font-bold leading-[1.1] text-white sm:text-[2.5rem] lg:text-5xl">Ready to power-up with Pi?</h2>
                <p className="mt-5 max-w-xl text-lg text-white/85">Get a demo, and contact us to design a custom package for your business.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end">
                <ContactButton variant="cyan" className="!px-8 !py-4 !text-base sm:w-56">Contact Sales</ContactButton>
                <ContactButton variant="light" className="!px-8 !py-4 !text-base sm:w-56">Book a demo</ContactButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line bg-white text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
            <div>
              <PiLogo className="h-12 w-auto text-ink" />
              <p className="mt-4 max-w-xs text-sm text-muted">Get more customers per dollar, earn more dollars per customer.</p>
            </div>
            <nav aria-label="Footer">
              <ul className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
                {footerLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} className="inline-flex items-center gap-1 font-semibold text-muted hover:text-navy">
                      {l.label}
                      {l.href.startsWith("http") && <ArrowUpRight className="h-3 w-3 opacity-50" />}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
            <p className="text-sm text-muted">©Paytm · All Rights Reserved · Pi by <span className="font-semibold tracking-wider text-navy">PAYTM</span></p>
            <ul className="flex gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full bg-ice-2 text-navy ring-1 ring-ice transition hover:bg-navy hover:text-white">
                    <Social name={s.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div aria-hidden="true"><div className="h-2 bg-pi" /><div className="h-2 bg-navy" /></div>
      </footer>
    </ContactProvider>
  );
}
