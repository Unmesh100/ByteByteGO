"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavBook } from "@/lib/content";
import { bookStyle, pad } from "@/lib/format";
import { usePresence } from "@/lib/use-presence";
import { CloseIcon, ListIcon } from "./icons";
import { SidebarNav } from "./SidebarNav";

const EXIT_MS = 420;

/** Sticky chapter bar + slide-in chapter sheet for screens without the sidebar. */
export function MobileNav({ nav }: { nav: NavBook[] }) {
  const pathname = usePathname();
  const [, bookSlug, chapterSlug] = pathname.split("/");
  const book = nav.find((b) => b.slug === bookSlug) ?? nav[0];
  const chapter = book.chapters.find((c) => c.slug === chapterSlug);
  const [open, setOpen] = useState(false);
  const { mounted, closing } = usePresence(open, EXIT_MS);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        data-chapter-bar
        className="sticky top-[var(--header-h)] z-30 border-b border-line bg-bg/85 backdrop-blur-xl lg:hidden"
        style={bookStyle(book.accent)}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-full items-center gap-3 px-5 text-left sm:px-8"
          aria-label="Open chapter list"
          aria-expanded={open}
        >
          <ListIcon width={17} height={17} className="shrink-0 text-fg-muted" />
          <span className="label shrink-0 text-book">
            {chapter ? `${book.volume}.${pad(chapter.number)}` : `Vol. ${book.volume}`}
          </span>
          <span className="truncate text-sm text-fg-muted">{chapter?.title ?? book.title}</span>
        </button>
      </div>

      {mounted && (
        <div className="sheet fixed inset-0 z-50 lg:hidden" data-state={closing ? "closing" : "open"} role="dialog" aria-modal="true" aria-label="Chapters">
          <div className="sheet-backdrop absolute inset-0 bg-[rgb(12_11_10/0.4)] backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="sheet-panel absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col bg-bg shadow-2xl">
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
              <span className="label text-fg-subtle">Contents</span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="group grid size-10 place-items-center rounded-full border border-line-strong text-fg-muted transition-colors duration-500 hover:border-fg-subtle hover:text-fg"
                aria-label="Close chapter list"
              >
                <CloseIcon width={16} height={16} className="transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:rotate-90" />
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <SidebarNav nav={nav} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
