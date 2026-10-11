import { bookStyle } from "@/lib/format";

/** Deterministic pseudo-random numbers so covers render identically on server and client. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const S = { fill: "none", stroke: "currentColor", strokeWidth: 0.5, vectorEffect: "non-scaling-stroke" as const };

/** One abstract motif per volume, drawn in thin line work. */
function Motif({ slug }: { slug: string }) {
  switch (slug) {
    case "system-design": {
      // A distributed network: jittered nodes with links to neighbours.
      const r = rng(7);
      const pts = Array.from({ length: 30 }, (_, i) => ({
        x: 10 + (i % 5) * 20 + (r() - 0.5) * 10,
        y: 8 + Math.floor(i / 5) * 17 + (r() - 0.5) * 8,
      }));
      return (
        <g {...S}>
          {pts.flatMap((p, i) =>
            pts.slice(i + 1).map((q, j) =>
              Math.hypot(p.x - q.x, p.y - q.y) < 24 ? <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} opacity={0.55} /> : null,
            ),
          )}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i % 7 === 0 ? 2.4 : 1.1} fill={i % 7 === 0 ? "currentColor" : "none"} />
          ))}
        </g>
      );
    }
    case "coding-patterns": {
      // Arrays with two pointers sweeping inward.
      return (
        <g {...S}>
          {[18, 46, 74].map((y, row) => (
            <g key={y}>
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x={10 + i * 10} y={y} width={10} height={10} fill={(i === row + 1 || i === 6 - row) ? "currentColor" : "none"} fillOpacity={0.18} />
              ))}
              <path d={`M${15 + (row + 1) * 10} ${y - 2} Q ${50} ${y - 14 + row * 2} ${15 + (6 - row) * 10} ${y - 2}`} strokeDasharray="1.5 1.5" />
              <path d={`M${15 + (row + 1) * 10} ${y + 13} v5 M${15 + (6 - row) * 10} ${y + 13} v5`} />
            </g>
          ))}
        </g>
      );
    }
    case "object-oriented-design": {
      // Class boxes joined by associations.
      const box = (x: number, y: number, w: number, k: string) => (
        <g key={k}>
          <rect x={x} y={y} width={w} height={26} />
          <line x1={x} y1={y + 8} x2={x + w} y2={y + 8} />
          <line x1={x} y1={y + 17} x2={x + w} y2={y + 17} />
          <line x1={x + 4} y1={y + 12.5} x2={x + w * 0.6} y2={y + 12.5} opacity={0.6} />
          <line x1={x + 4} y1={y + 21.5} x2={x + w * 0.45} y2={y + 21.5} opacity={0.6} />
        </g>
      );
      return (
        <g {...S}>
          {box(32, 6, 36, "a")}
          {box(8, 56, 32, "b")}
          {box(60, 56, 32, "c")}
          <path d="M50 32 v12 M24 44 h52 M24 44 v12 M76 44 v12" />
          <path d="M50 32 l-3 5 h6 z" fill="currentColor" />
          <path d="M40 69 h20" strokeDasharray="1.5 1.5" />
        </g>
      );
    }
    case "ml-system-design": {
      // Loss-surface contour lines.
      return (
        <g {...S}>
          {Array.from({ length: 11 }, (_, i) => (
            <ellipse key={i} cx={56 - i * 0.8} cy={48 + i * 0.6} rx={4 + i * 4.2} ry={3 + i * 3.1} transform={`rotate(${-18 + i * 2} 50 50)`} opacity={1 - i * 0.05} />
          ))}
          <path d="M14 86 C 30 70, 36 64, 44 58 S 54 50, 56 48" strokeDasharray="1.5 1.5" />
          <circle cx={56} cy={48} r={1.8} fill="currentColor" />
        </g>
      );
    }
    case "genai-system-design": {
      // Diffusion: a burst resolving out of noise.
      const r = rng(11);
      return (
        <g {...S}>
          {Array.from({ length: 64 }, (_, i) => {
            const a = (i / 64) * Math.PI * 2;
            const len = 14 + r() * 30;
            return <line key={i} x1={50 + Math.cos(a) * 8} y1={50 + Math.sin(a) * 8} x2={50 + Math.cos(a) * len} y2={50 + Math.sin(a) * len} opacity={0.35 + r() * 0.6} />;
          })}
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={`d${i}`} cx={r() * 100} cy={r() * 100} r={0.6} fill="currentColor" stroke="none" opacity={0.7} />
          ))}
          <circle cx={50} cy={50} r={4} fill="currentColor" />
        </g>
      );
    }
    default: {
      // Mobile: stacked device frames.
      return (
        <g {...S}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${18 + i * 16} ${10 + i * 8})`} opacity={0.45 + i * 0.27}>
              <rect width={34} height={62} rx={6} />
              <line x1={12} y1={4} x2={22} y2={4} />
              <rect x={4} y={10} width={26} height={14} rx={1.5} />
              <line x1={4} y1={30} x2={30} y2={30} />
              <line x1={4} y1={35} x2={22} y2={35} />
              <line x1={4} y1={40} x2={26} y2={40} />
            </g>
          ))}
        </g>
      );
    }
  }
}

export function BookCover({
  slug,
  title,
  volume,
  accent,
  chapters,
  size = "lg",
}: {
  slug: string;
  title: string;
  volume: string;
  accent: string;
  chapters: number;
  size?: "lg" | "md";
}) {
  // "System Design Interview" -> "System Design" / "Interview"
  const words = title.replace(/ Interview$/, "").split(" ");
  const titleSize = size === "lg" ? "text-[clamp(1.9rem,3.6vw,2.6rem)]" : "text-[clamp(1.6rem,2.6vw,2.1rem)]";

  return (
    <div className="book3d" style={bookStyle(accent)}>
      <div className="book3d-inner">
        <div className="book3d-back" />
        <div className="book3d-pages" />
        <div className="book3d-spine">
          <span className="label whitespace-nowrap text-[0.5rem] [transform:rotate(180deg)] [writing-mode:vertical-rl]">
            Vol. {volume} · {title}
          </span>
        </div>
        <div className="book3d-front flex flex-col p-[9%] pl-[12%]">
          <div className="flex items-center justify-between border-b border-white/25 pb-3">
            <span className="label text-[0.66rem] text-white/80">Vol. {volume}</span>
            <span className="label text-[0.66rem] text-white/60">BBG</span>
          </div>
          <svg viewBox="0 0 100 100" className="my-auto w-full text-white/80" aria-hidden>
            <Motif slug={slug} />
          </svg>
          <div>
            <p className={`display ${titleSize} leading-[0.92] text-white`}>
              {words.map((w, i) => (
                <span key={i} className="block">
                  {i === words.length - 1 && words.length > 1 ? <em>{w}</em> : w}
                </span>
              ))}
            </p>
            <p className="label mt-4 text-[0.62rem] text-white/70">
              Interview · {chapters} chapters
            </p>
          </div>
          <div className="book3d-sheen" />
        </div>
      </div>
    </div>
  );
}

/** Flat thumbnail used in navigation. */
export function MiniCover({ accent, volume }: { accent: string; volume: string }) {
  return (
    <span
      className="relative flex h-14 w-10 shrink-0 items-end overflow-hidden rounded-[2px_4px_4px_2px] p-1.5 shadow-[0_10px_18px_-10px_rgb(20_14_6/0.6)]"
      style={{
        background: `linear-gradient(90deg, rgb(0 0 0/.3), rgb(0 0 0/.05) 10%, rgb(255 255 255/.15) 14%, transparent 20%), ${accent}`,
      }}
      aria-hidden
    >
      <span className="font-serif text-sm leading-none text-white/90">{volume}</span>
    </span>
  );
}
