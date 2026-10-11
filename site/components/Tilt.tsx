"use client";

import { useRef } from "react";

/**
 * Pointer-driven 3D tilt for a `.book3d` cover. Sets CSS variables only;
 * all rendering stays in CSS. Touch input is ignored.
 */
export function Tilt({
  children,
  className = "",
  rest = 18,
  range = 14,
}: {
  children: React.ReactNode;
  className?: string;
  rest?: number;
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const el = ref.current;
    el.classList.add("tilt-active");
    el.style.setProperty("--ry", `${rest - 10 + px * range * 2}deg`);
    el.style.setProperty("--rx", `${-py * range * 0.7}deg`);
    el.style.setProperty("--mx", String(px * 2));
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("tilt-active");
    el.style.removeProperty("--ry");
    el.style.removeProperty("--rx");
    el.style.removeProperty("--mx");
  };

  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
