"use client";

import { useEffect, useMemo, useState } from "react";
import { anchorOffset, scrollToTarget } from "@/lib/scroll";
import type { TocItem } from "@/lib/markdown";
import { ArrowUp, ChevronDown } from "./icons";

function useScrollState(toc: TocItem[]) {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  // A stable key so the scroll listener is attached once per page, not on every render.
  const key = useMemo(() => toc.map((t) => t.id).join("|"), [toc]);

  useEffect(() => {
    const headings = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((h): h is HTMLElement => !!h);
    const onScroll = () => {
      const offset = anchorOffset() + 12;
      let current: string | null = headings[0]?.id ?? null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - offset <= 0) current = h.id;
        else break;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= max - 2) current = headings.at(-1)?.id ?? current;
      setActive(current);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);

  return { active, progress };
}

function TocList({ toc, active, onPick }: { toc: TocItem[]; active: string | null; onPick?: () => void }) {
  return (
    <ul className="space-y-px">
      {toc.map((item) => {
        const on = active === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onPick}
              className={`group flex items-start gap-3 py-[0.4rem] text-[0.8125rem] leading-snug transition-colors ${
                item.depth === 3 ? "pl-4" : ""
              } ${on ? "text-fg" : "text-fg-subtle hover:text-fg"}`}
            >
              <span
                className={`mt-[0.55rem] h-px shrink-0 transition-all duration-500 [transition-timing-function:var(--ease)] ${
                  on ? "w-5 bg-book" : "w-2 bg-line-strong group-hover:w-3.5"
                }`}
                aria-hidden
              />
              <span className={item.depth === 2 ? "font-medium" : ""}>{item.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop: sticky outline with scroll-spy and reading progress. */
export function Toc({ toc }: { toc: TocItem[] }) {
  const { active, progress } = useScrollState(toc);
  return (
    <div className="flex h-full flex-col">
      <p className="label mb-4 flex items-center justify-between text-fg-subtle">
        <span>On this page</span>
        <span className="tabular-nums text-fg">{Math.round(progress * 100)}%</span>
      </p>
      <div className="mb-5 h-px bg-line">
        <div className="h-px origin-left bg-book" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="scroll-thin -mr-4 min-h-0 flex-1 overflow-y-auto pb-8 pr-4 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]">
        <TocList toc={toc} active={active} />
      </div>
      <button
        type="button"
        onClick={() => scrollToTarget(0)}
        className="label mt-6 flex items-center gap-2 text-fg-subtle transition-colors hover:text-fg"
      >
        <ArrowUp width={13} height={13} /> Back to top
      </button>
    </div>
  );
}

/** Small screens: collapsible outline above the article. */
export function MobileToc({ toc }: { toc: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const { active } = useScrollState(toc);
  if (!toc.length) return null;
  return (
    <div className="mb-12 border-y border-line xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4"
        aria-expanded={open}
      >
        <span className="label text-fg-muted">On this page — {toc.filter((t) => t.depth === 2).length} sections</span>
        <ChevronDown width={16} height={16} className={`text-fg-subtle transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="scroll-thin max-h-[55vh] overflow-y-auto pb-4">
          <TocList toc={toc} active={active} onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
