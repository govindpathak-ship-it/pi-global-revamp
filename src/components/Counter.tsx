"use client";
import { useEffect, useRef, useState } from "react";

/** Counts up to a value like "15M+", "~22%", "1,500+". Renders the final value on the server (no-JS safe). */
export function Counter({ value, className = "" }: { value: string; className?: string }) {
  const m = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  const prefix = m?.[1] ?? "";
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : 0;
  const suffix = m?.[3] ?? "";
  const useComma = m?.[2].includes(",");
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return; // already visible: keep final value
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setN(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick); else setN(null);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = n === null ? value : `${prefix}${useComma ? Math.round(n).toLocaleString("en-IN") : Math.round(n)}${suffix}`;
  return <span ref={ref} className={`tabular-nums ${className}`} aria-label={value}>{shown}</span>;
}
