"use client";

import { useEffect, useRef, useState } from "react";
import { lockScroll } from "./scroll";

/**
 * Keeps an overlay mounted long enough to play its exit animation, locks page
 * scroll while it is shown, and returns focus to whatever opened it.
 *
 * `mounted` is true in the same render that `open` becomes true (so refs are
 * ready for focus effects); `closing` is true during the exit animation.
 */
export function usePresence(open: boolean, exitMs: number) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  // Derive "leaving" during render so there is never a frame where the overlay
  // unmounts and then remounts for its exit animation.
  if (open !== prevOpen) {
    setPrevOpen(open);
    setLeaving(!open);
  }

  useEffect(() => {
    if (!leaving) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setLeaving(false), reduce ? 0 : exitMs);
    return () => clearTimeout(t);
  }, [leaving, exitMs]);

  // Remember the trigger before the overlay's own effects move focus.
  useEffect(() => {
    if (open) opener.current = document.activeElement as HTMLElement | null;
  }, [open]);

  const mounted = open || leaving;

  // Lock scroll for as long as the overlay is on screen (including its exit).
  useEffect(() => {
    if (!mounted) return;
    const unlock = lockScroll();
    return () => {
      unlock();
      // Restore focus to the trigger unless focus has already moved somewhere deliberate.
      const el = opener.current;
      const active = document.activeElement;
      if (el && document.contains(el) && (!active || active === document.body)) {
        el.focus({ preventScroll: true });
      }
    };
  }, [mounted]);

  return { mounted, closing: leaving && !open };
}
