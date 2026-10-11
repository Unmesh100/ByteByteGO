"use client";

import { useEffect, useRef } from "react";
import { MorphingText } from "./ui/morphing-text";

/**
 * Hero headline that morphs between phrases. The font size is fitted so the
 * widest phrase spans the full width of the column.
 */
export function MorphingHeadline({ texts, className = "" }: { texts: string[]; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const measure = probe.current;
    if (!el || !measure) return;

    const fit = () => {
      // Measure every phrase at 100px, then scale so the widest fills the column.
      let widest = 0;
      for (const t of texts) {
        measure.textContent = t;
        widest = Math.max(widest, measure.getBoundingClientRect().width);
      }
      if (!widest) return;
      const size = Math.min((el.clientWidth / widest) * 100 * 0.99, 420);
      el.style.setProperty("--headline-size", `${size}px`);
    };

    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [texts]);

  return (
    <div ref={wrap} className={`relative ${className}`} aria-hidden>
      {/* Invisible probe with identical type settings, used only for measuring. */}
      <span
        ref={probe}
        className="display pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap text-[100px] tracking-[-0.035em]"
      />
      <MorphingText
        texts={texts}
        morphTime={1.4}
        cooldownTime={2.8}
        initialHold={2.2}
        className="display h-[calc(var(--headline-size,17vw)*1.02)] max-w-none whitespace-nowrap text-center font-serif text-[length:var(--headline-size,17vw)] font-normal leading-[1] tracking-[-0.035em] text-fg md:h-[calc(var(--headline-size,17vw)*1.02)] lg:text-[length:var(--headline-size,17vw)]"
      />
    </div>
  );
}
