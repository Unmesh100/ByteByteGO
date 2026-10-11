"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { NavBook } from "@/lib/content";
import { bookStyle, OPEN_MENU_EVENT, pad } from "@/lib/format";
import { MiniCover } from "./BookCover";
import { ArrowUpRight } from "./icons";

/** Chapter list for the volume being read, with a switcher to the full index. */
export function SidebarNav({ nav, onNavigate }: { nav: NavBook[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [, bookSlug, chapterSlug] = pathname.split("/");
  const book = nav.find((b) => b.slug === bookSlug) ?? nav[0];
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Keep the active chapter visible inside its own scroll container, without
  // scrollIntoView (which would also scroll the page).
  useEffect(() => {
    const item = activeRef.current;
    if (!item) return;
    let box: HTMLElement | null = item.parentElement;
    while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    if (!box) return;
    const top = item.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    if (top < box.scrollTop || top + item.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = top - box.clientHeight / 3;
    }
  }, [chapterSlug]);

  return (
    <nav aria-label={`${book.title} chapters`} style={bookStyle(book.accent)}>
      <Link href={`/${book.slug}/`} onClick={onNavigate} className="group flex items-center gap-4">
        <MiniCover accent={book.accent} volume={book.volume} />
        <span className="min-w-0">
          <span className="label block text-fg-subtle">Vol. {book.volume}</span>
          <span className="mt-1 block font-serif text-[1.4rem] leading-[1.05] tracking-[-0.01em]">
            <span className="link-sweep">{book.title.replace(/ Interview$/, "")}</span>
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          window.dispatchEvent(new Event(OPEN_MENU_EVENT));
        }}
        className="group label mt-5 flex w-full items-center justify-between rounded-full border border-line-strong px-4 py-2.5 text-fg-muted transition-colors duration-300 hover:bg-sunken hover:text-fg"
      >
        Switch volume
        <ArrowUpRight width={14} height={14} className="transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>

      <p className="label mb-2 mt-9 flex justify-between text-fg-subtle">
        <span>Chapters</span>
        <span>{pad(book.chapters.length)}</span>
      </p>
      <ol className="border-t border-line">
        {book.chapters.map((ch) => {
          const active = ch.slug === chapterSlug;
          return (
            <li key={ch.slug}>
              <Link
                ref={active ? activeRef : undefined}
                href={`/${book.slug}/${ch.slug}/`}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group grid grid-cols-[2.25rem_minmax(0,1fr)_0.75rem] items-baseline border-b border-line py-2.5 text-[0.9rem] leading-snug transition-colors ${
                  active ? "text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                <span className={`label ${active ? "text-book" : "text-fg-subtle"}`}>{pad(ch.number)}</span>
                <span className="transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:translate-x-1">
                  {ch.title}
                </span>
                {active && <span className="size-1.5 justify-self-end self-center rounded-full bg-book" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
