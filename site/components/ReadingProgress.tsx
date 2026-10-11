"use client";

import { useEffect, useRef } from "react";

/** Hairline progress bar pinned under the header, tinted with the volume colour. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[var(--header-h)] z-40 h-px" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-book" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
