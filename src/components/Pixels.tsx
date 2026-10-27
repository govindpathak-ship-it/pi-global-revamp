// Deterministic "pixel mosaic" background — a nod to the blue tile grid of the live pi.global hero.
const palette = ["#00b7ff", "#0090fd", "#175cb0", "#66d6ff", "#002972"];

export function Pixels({ cols = 26, rows = 14, size = 56, density = 0.32, maxOpacity = 0.35, className = "" }: {
  cols?: number; rows?: number; size?: number; density?: number; maxOpacity?: number; className?: string;
}) {
  const cells: { x: number; y: number; c: string; o: number; d: number }[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const r = rnd();
      if (r < density) cells.push({ x, y, c: palette[Math.floor(rnd() * palette.length)], o: 0.08 + rnd() * maxOpacity, d: rnd() * 6 });
    }
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {cells.map((p, i) => (
        <span
          key={i}
          className="pixel absolute"
          style={{ left: p.x * size, top: p.y * size, width: size, height: size, background: p.c, ["--o" as string]: p.o, opacity: p.o, animationDelay: `${p.d}s` }}
        />
      ))}
    </div>
  );
}
