"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CONTACT_EMAIL, CONTACT_SUBJECT, formIndustries, roles } from "@/lib/content";
import { ArrowRight, Close } from "./icons";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && <ContactModal onClose={() => setOpen(false)} />}
    </Ctx.Provider>
  );
}

export function ContactButton({
  children,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "cyan" | "outline" | "light" | "ghost";
}) {
  const { open } = useContext(Ctx);
  // Paytm-style pill buttons (paytm.com: navy #002970 pills, 16px/600, hover inverts to white)
  const styles = {
    primary: "bg-navy text-white ring-1 ring-navy hover:bg-white hover:text-navy",
    cyan: "bg-pi text-navy hover:bg-white",
    outline: "bg-white text-navy ring-1 ring-navy hover:bg-navy hover:text-white",
    light: "bg-white text-navy hover:bg-ice",
    ghost: "bg-transparent text-white ring-1 ring-white/40 hover:bg-white/10",
}[variant];
  return (
    <button
      type="button"
      onClick={open}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pi-ink ${styles} ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button, input, select, a[href]");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  // Static site: no backend. Mirrors the live site's fallback and opens a pre-filled email to sales.
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = [
      `Name: ${d.get("firstName")} ${d.get("lastName")}`,
      `Company: ${d.get("company")}`,
      `Work email: ${d.get("email")}`,
      `Role: ${d.get("role")}`,
      `Industry: ${d.get("industry")}`,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field = "w-full rounded-xl border border-line bg-mist px-4 py-3 text-base text-ink placeholder:text-muted sm:text-sm placeholder:text-muted outline-none transition focus:border-pi focus:bg-white focus:ring-4 focus:ring-pi/20";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-navy/70 sm:bg-navy/60 sm:backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-pi to-navy" />
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="contact-title" className="font-display text-2xl font-semibold text-ink">Tell us about your business.</h2>
              <p className="mt-1 text-sm text-muted">We’ll be in touch.</p>
            </div>
            <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-mist hover:text-ink" aria-label="Close">
              <Close />
            </button>
          </div>
          {sent ? (
            <p className="mt-8 rounded-2xl bg-ice-2 p-6 text-sm text-body" role="status">
              Thank you! Your email app should open with your details. If it doesn’t, write to{" "}
              <a className="font-semibold text-pi-ink underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <label className="text-[13px] font-semibold text-body sm:text-xs">First Name<input required name="firstName" className={`${field} mt-1`} autoComplete="given-name" /></label>
              <label className="text-[13px] font-semibold text-body sm:text-xs">Last Name<input required name="lastName" className={`${field} mt-1`} autoComplete="family-name" /></label>
              <label className="col-span-full text-[13px] font-semibold text-body sm:text-xs">Company<input required name="company" className={`${field} mt-1`} autoComplete="organization" /></label>
              <label className="col-span-full text-[13px] font-semibold text-body sm:text-xs">Work Email<input required type="email" name="email" className={`${field} mt-1`} autoComplete="email" /></label>
              <label className="col-span-full text-[13px] font-semibold text-body sm:text-xs sm:col-span-1">Role
                <select required name="role" defaultValue="" className={`${field} mt-1`}>
                  <option value="" disabled>Select your role</option>
                  {roles.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <label className="col-span-full text-[13px] font-semibold text-body sm:text-xs sm:col-span-1">Industry
                <select required name="industry" defaultValue="" className={`${field} mt-1`}>
                  <option value="" disabled>Select your industry</option>
                  {formIndustries.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
              <button type="submit" className="col-span-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3.5 text-base font-semibold text-white transition hover:bg-navy-2">
                Talk to us <ArrowRight />
              </button>
              <p className="col-span-full text-center text-xs text-muted">We’ll only use this to get in touch about Pi Agents.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
