"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scrollToTarget, setLenis } from "@/lib/scroll";

/**
 * Site-wide inertial scrolling (Lenis) plus offset-aware in-page anchor links.
 * Disabled for prefers-reduced-motion; touch devices keep native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const start = () => {
      if (reduce.matches || lenis) return;
      lenis = new Lenis({
        autoRaf: true,
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Let sidebars, the outline, code blocks and overlays scroll natively.
        allowNestedScroll: true,
      });
      setLenis(lenis);
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
      setLenis(null);
    };
    const onPreference = () => (reduce.matches ? stop() : start());

    start();
    reduce.addEventListener("change", onPreference);
    return () => {
      reduce.removeEventListener("change", onPreference);
      stop();
    };
  }, []);

  // In-page anchors (outline, heading "#" links): glide to the target, clearing the sticky header.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute("href")!.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      history.pushState(null, "", `#${encodeURIComponent(id)}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Arriving on a page with a hash (e.g. from search): land precisely below the header.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => {
      const target = document.getElementById(id);
      if (target) scrollToTarget(target, { immediate: true });
    }, 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
