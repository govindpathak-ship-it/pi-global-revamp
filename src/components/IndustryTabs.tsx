"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { industries } from "@/lib/content";

type R = { x: number; y: number; w: number; h: number };
type S = { p: number; v: number };

// Damped spring step (semi-implicit Euler). zeta < 1 → overshoot + wobble like a water drop.
function step(s: S, target: number, k: number, zeta: number, dt: number) {
  const c = 2 * Math.sqrt(k) * zeta;
  s.v += (-k * (s.p - target) - c * s.v) * dt;
  s.p += s.v * dt;
}

// Rounded rectangle as an SVG sub-path (used to cut the lens out of the base labels).
function rr(x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

// Displacement map for the lens rim: pixels near the capsule edge sample inward, so the label
// bends/magnifies at the rim like real glass. Generated once on a canvas (no assets, no libs).
let mapUrl = "";
function lensMap() {
  if (mapUrl) return mapUrl;
  const W = 300, H = 100, r = H / 2, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d"); if (!ctx) return "";
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const qx = Math.min(Math.max(x, r), W - r), vx = x - qx, vy = y - r, d = Math.hypot(vx, vy) || 1;
    const inside = r - d, f = Math.pow(Math.min(Math.max(1 - inside / (r * 0.7), 0), 1), 3);
    const i = (y * W + x) * 4;
    img.data[i] = 128 - (vx / d) * f * 127; img.data[i + 1] = 128 - (vy / d) * f * 127; img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return (mapUrl = c.toDataURL());
}

export function IndustryTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ind = industries[active];
  const list = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const clone = useRef<HTMLSpanElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const imgRef = useRef<SVGFEImageElement>(null);
  const [ready, setReady] = useState(false);
  const [refract, setRefract] = useState(false);
  const rects = useRef<R[]>([]);
  const sp = useRef({ x: { p: 0, v: 0 }, y: { p: 0, v: 0 }, w: { p: 0, v: 0 }, h: { p: 0, v: 0 }, lift: { p: 0, v: 0 } });
  const target = useRef<R>({ x: 0, y: 0, w: 0, h: 0 });
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const raf = useRef(0);
  const last = useRef(0);
  const suppressClick = useRef(false);
  const activeRef = useRef(0);
  const labelW = useRef<number[]>([]);
  activeRef.current = active;

  const measure = useCallback(() => {
    rects.current = tabs.current.map((t) => (t ? { x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight } : { x: 0, y: 0, w: 0, h: 0 }));
    labelW.current = tabs.current.map((t) => {
      if (!t) return 0; const rg = document.createRange(); rg.selectNodeContents(t); return rg.getBoundingClientRect().width;
    });
    const c = clone.current;
    if (c) Array.from(c.children).forEach((el, i) => {
      const r = rects.current[i]; if (!r) return;
      Object.assign((el as HTMLElement).style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    });
  }, []);

  const nearestIdx = useCallback((cx: number, cy: number) => {
    let best = 0, bd = Infinity;
    rects.current.forEach((r, i) => { const d = Math.hypot(r.x + r.w / 2 - cx, r.y + r.h / 2 - cy); if (d < bd) { bd = d; best = i; } });
    return best;
  }, []);

  // Paint one frame: lens geometry from the springs, plus the velocity stretch and lift.
  const paint = useCallback(() => {
    const s = sp.current, L = Math.max(0, s.lift.p);
    const speed = Math.hypot(s.x.v, s.y.v), st = Math.min(0.32, speed / 2600);
    const horiz = Math.abs(s.x.v) >= Math.abs(s.y.v);
    let w = s.w.p * (horiz ? 1 + st : 1 - st * 0.25), h = s.h.p * (horiz ? 1 - st * 0.4 : 1 + st * 0.5);
    const grow = 1 + 0.1 * L; w *= grow; h *= grow;
    let x = s.x.p - w / 2, y = s.y.p - h / 2;
    // Soft walls: when the drop overshoots the end of the track it squishes against it instead of leaving.
    const rs = rects.current;
    if (rs.length) {
      const pad = 3, minX = Math.min(...rs.map((r) => r.x)) - pad, maxX = Math.max(...rs.map((r) => r.x + r.w)) + pad;
      const minY = Math.min(...rs.map((r) => r.y)) - pad, maxY = Math.max(...rs.map((r) => r.y + r.h)) + pad;
      // Never squish narrower than the label it carries (+ margin), so no letter is lost at the rim.
      const ni = nearestIdx(s.x.p, s.y.p), minW = (labelW.current[ni] || 0) + 22;
      if (x < minX) { const o = Math.min(minX - x, Math.max(0, w - minW)); w -= o; h += o * 0.25; y -= o * 0.125; x = minX; }
      if (x + w > maxX) { const o = Math.min(x + w - maxX, Math.max(0, w - minW)); w -= o; h += o * 0.25; y -= o * 0.125; x = maxX - w; }
      if (y < minY) { const o = minY - y; h -= o; y = minY; }
      if (y + h > maxY) { h -= y + h - maxY; }
    }
    const el = lens.current; if (!el) return;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.width = `${w}px`; el.style.height = `${h}px`;
    el.style.setProperty("--lift", L.toFixed(3));
    // Magnify around the lens centre, capped so the label under it always fits inside the glass.
    const cx = x + w / 2, cy = y + h / 2, lw = labelW.current[nearestIdx(cx, cy)] || 0;
    const m = Math.max(1, Math.min(1 + 0.12 * L, lw ? (w - 14) / lw : 1.12));
    if (clone.current) {
      clone.current.style.transform = `translate(${-x}px, ${-y}px) scale(${m.toFixed(4)})`;
      clone.current.style.transformOrigin = `${cx}px ${cy}px`;
    }
    if (imgRef.current) { imgRef.current.setAttribute("width", `${w}`); imgRef.current.setAttribute("height", `${h}`); }
    if (dispRef.current) dispRef.current.setAttribute("scale", `${(2.5 + 6 * L).toFixed(1)}`);
    // Cut the lens out of the base labels so text is never doubled: each label changes
    // colour exactly where the glass covers it.
    tabs.current.forEach((t, i) => {
      const r = rects.current[i]; if (!t || !r) return;
      const hx = x - r.x, hy = y - r.y;
      t.style.clipPath = `path(evenodd, "M-12 -12H${r.w + 12}V${r.h + 12}H-12Z ${rr(hx, hy, w, h, h / 2)}")`;
    });
  }, [nearestIdx]);

  const tick = useCallback((t: number) => {
    const dt = Math.min(1 / 30, (t - (last.current || t)) / 1000 || 1 / 60);
    last.current = t;
    const s = sp.current, g = target.current;
    const tx = g.x + g.w / 2, ty = g.y + g.h / 2;
    for (let i = 0; i < 2; i++) {
      const d = dt / 2;
      step(s.x, tx, 240, 0.66, d); step(s.y, ty, 240, 0.66, d);
      step(s.w, g.w, 300, 0.45, d); step(s.h, g.h, 300, 0.45, d);
    }
    const far = Math.hypot(s.x.p - tx, s.y.p - ty) > 1.5 || Math.hypot(s.x.v, s.y.v) > 40;
    const up = drag.current?.moved || far;
    step(s.lift, up ? 1 : 0, up ? 600 : 200, up ? 0.9 : 0.8, dt);
    paint();
    const settled = !drag.current && !far && Math.abs(s.w.p - g.w) < 0.3 && Math.abs(s.h.p - g.h) < 0.3 && Math.abs(s.lift.p) < 0.004 && Math.abs(s.lift.v) < 0.05;
    if (settled) {
      Object.assign(s, { x: { p: tx, v: 0 }, y: { p: ty, v: 0 }, w: { p: g.w, v: 0 }, h: { p: g.h, v: 0 }, lift: { p: 0, v: 0 } });
      paint(); raf.current = 0; last.current = 0; return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [paint]);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kick = useCallback(() => {
    if (reduce()) {
      const g = target.current, s = sp.current;
      Object.assign(s, { x: { p: g.x + g.w / 2, v: 0 }, y: { p: g.y + g.h / 2, v: 0 }, w: { p: g.w, v: 0 }, h: { p: g.h, v: 0 }, lift: { p: 0, v: 0 } });
      paint(); return;
    }
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [paint, tick]);

  // Snap (no animation) on first layout and on resize.
  const snap = useCallback(() => {
    measure();
    const g = rects.current[activeRef.current]; if (!g) return;
    target.current = { ...g };
    const s = sp.current;
    Object.assign(s, { x: { p: g.x + g.w / 2, v: 0 }, y: { p: g.y + g.h / 2, v: 0 }, w: { p: g.w, v: 0 }, h: { p: g.h, v: 0 }, lift: { p: 0, v: 0 } });
    paint();
  }, [measure, paint]);

  useLayoutEffect(() => {
    snap(); setReady(true);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 640px)").matches;
    const safari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
    if (fine && !safari) setRefract(true);
    const ro = new ResizeObserver(() => snap());
    if (list.current) ro.observe(list.current);
    return () => { ro.disconnect(); cancelAnimationFrame(raf.current); raf.current = 0; };
  }, [snap]);

  // Glide to the newly selected tab.
  useEffect(() => {
    if (!ready) return;
    const g = rects.current[active]; if (!g) return;
    target.current = { ...g };
    kick();
  }, [active, ready, kick]);


  const hitTab = (px: number, py: number) => {
    const o = list.current?.getBoundingClientRect(); if (!o) return -1;
    const x = px - o.left - (list.current?.clientLeft ?? 0), y = py - o.top - (list.current?.clientTop ?? 0);
    return rects.current.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  };

  // Drag the lens across tabs (mouse or touch). Only starts on the selected tab.
  const onPointerDown = (e: React.PointerEvent) => {
    suppressClick.current = false; // a drag that ended without a click must not eat the next tap
    if (e.button !== 0 || !list.current) return;
    // Hit-test by geometry: the lens clip-path cuts the hole out of the tab under it.
    const i = hitTab(e.clientX, e.clientY);
    if (i !== activeRef.current) return;
    const s = sp.current;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: s.x.p, oy: s.y.p, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || d.id !== e.pointerId || !list.current) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      d.moved = true; list.current.setPointerCapture(e.pointerId);
    }
    const rs = rects.current, minX = Math.min(...rs.map((r) => r.x + r.w / 2)), maxX = Math.max(...rs.map((r) => r.x + r.w / 2));
    const minY = Math.min(...rs.map((r) => r.y + r.h / 2)), maxY = Math.max(...rs.map((r) => r.y + r.h / 2));
    const cx = Math.min(maxX + 12, Math.max(minX - 12, d.ox + dx)), cy = Math.min(maxY + 8, Math.max(minY - 8, d.oy + dy));
    const n = rects.current[nearestIdx(cx, cy)];
    target.current = { x: cx - n.w / 2, y: cy - n.h / 2, w: n.w, h: n.h };
    kick();
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    suppressClick.current = true;
    const g = target.current, n = nearestIdx(g.x + g.w / 2, g.y + g.h / 2);
    target.current = { ...rects.current[n] };
    if (n !== activeRef.current) { setActive(n); tabs.current[n]?.focus({ preventScroll: true }); }
    kick();
  };

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

  const tabCls = "seg-tab relative inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-3 py-2.5 text-[15px] font-semibold sm:px-4 sm:text-sm";

  return (
    <div>
      {refract && (
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id="seg-refract" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feImage ref={imgRef} href={lensMap()} x="0" y="0" width="100" height="40" preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="map" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <div
        ref={list}
        role="tablist"
        aria-label="Industries"
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (suppressClick.current) { suppressClick.current = false; e.stopPropagation(); e.preventDefault(); return; }
          // A click that lands in a tab's clipped-out lens hole reaches the track: route it to that tab.
          if (e.target === list.current || lens.current?.contains(e.target as Node)) { const i = hitTab(e.clientX, e.clientY); if (i >= 0 && i !== activeRef.current) { setActive(i); tabs.current[i]?.focus({ preventScroll: true }); } }
        }}
        className="seg-track relative mx-auto grid w-full max-w-xl select-none grid-cols-2 gap-1 rounded-3xl p-1.5 sm:grid-cols-4 sm:rounded-full"
      >
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
            style={i === active ? { touchAction: "none" } : undefined}
            className={`${tabCls} ${!ready && i === active ? "seg-fallback" : ""}`}
          >
            {t.label}
          </button>
        ))}
        {/* The lens: clear glass that carries a magnified, recoloured copy of the labels under it. */}
        <span ref={lens} aria-hidden="true" style={{ touchAction: "none" }} className={`seg-lens absolute left-0 top-0 z-10 ${ready ? "" : "invisible"}`}>
          <span className="seg-lens-in">
            <span className="seg-refr" style={refract ? { filter: "url(#seg-refract)" } : undefined}>
              <span ref={clone} className="seg-clone">
                {industries.map((t) => <span key={t.id} className={`${tabCls.replace("relative ", "")} seg-clone-label absolute`}>{t.label}</span>)}
              </span>
            </span>
          </span>
          <span className="seg-lens-glass" />
        </span>
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
