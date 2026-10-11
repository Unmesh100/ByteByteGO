import type Lenis from "lenis";

/** The active smooth-scroll instance, if any (none with reduced motion). */
let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/**
 * Distance to keep between a scrolled-to heading and the top of the viewport:
 * the sticky header, plus the chapter bar on small screens, plus breathing room.
 */
export function anchorOffset(): number {
  const header = document.querySelector("header")?.getBoundingClientRect().height ?? 68;
  const bar = document.querySelector<HTMLElement>("[data-chapter-bar]");
  const barHeight = bar && bar.offsetParent !== null ? bar.getBoundingClientRect().height : 0;
  return header + barHeight + 28;
}

/** Smoothly scroll the page to an element or position. */
export function scrollToTarget(target: HTMLElement | number, opts: { immediate?: boolean } = {}) {
  if (lenis) {
    // Lenis already subtracts the root's scroll-padding-top (= --anchor-offset in CSS).
    lenis.scrollTo(target, { immediate: opts.immediate, duration: 1.2 });
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY - anchorOffset();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: opts.immediate || reduce ? "auto" : "smooth" });
}

/**
 * Freeze page scrolling while an overlay is open. Reference-counted so stacked
 * overlays (e.g. search opened over the menu) unlock only when the last closes.
 */
export function lockScroll(): () => void {
  if (locks++ === 0) {
    const root = document.documentElement;
    // Classic (non-overlay) scrollbars: keep the layout from shifting when the bar disappears.
    const scrollbar = window.innerWidth - root.clientWidth;
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    root.style.overflow = "hidden";
    lenis?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
      lenis?.start();
    }
  };
}
