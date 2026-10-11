"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { NavBook } from "@/lib/content";
import { bookStyle } from "@/lib/format";
import { REPO } from "@/lib/site";
import { GitHubMark } from "./GitHubStar";
import { ArrowUpRight } from "./icons";

/** Matches the `curtain-out` exit animation in globals.css. */
export const MENU_EXIT_MS = 600;

/**
 * Full-screen index of volumes, always on ink regardless of theme. The header
 * (logo + Menu/Close button) stays above it, so this panel has no top bar of its own.
 */
export function MenuOverlay({
  nav,
  open,
  mounted,
  closing,
  onClose,
}: {
  nav: NavBook[];
  open: boolean;
  mounted: boolean;
  closing: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const currentSlug = pathname.split("/")[1];

  // Navigating closes the menu; it then rolls away over the new page.
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const totalChapters = nav.reduce((n, b) => n + b.chapters.length, 0);

  return (
    <div
      className="menu-panel fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-[#0c0b0a] text-[#ece8de]"
      data-state={closing ? "closing" : "open"}
      role="dialog"
      aria-modal="true"
      aria-label="Library menu"
      data-theme="dark"
    >
      <div className="menu-content flex flex-1 flex-col">
        {/* Space for the header, which floats above this panel while it is open. */}
        <div className="h-[var(--header-h)] shrink-0" aria-hidden />

        <div className="mx-auto grid w-full max-w-[100rem] flex-1 gap-10 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[1fr_3fr] lg:gap-16 lg:pt-14">
          <div className="flex flex-col justify-between gap-8">
            <div className="fade-up" style={{ ["--d" as string]: 1 }}>
              <p className="label text-white/60">(Index)</p>
              <p className="mt-4 max-w-xs font-serif text-2xl leading-snug text-white/80">
                Six volumes. {totalChapters} chapters. One quiet place to read them.
              </p>
              <a
                href={REPO.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group label mt-6 inline-flex h-10 items-center gap-2.5 rounded-full border border-white/20 pl-3.5 pr-4 text-white/80 transition-colors duration-500 hover:border-white/45 hover:text-white"
              >
                <GitHubMark width={15} height={15} />
                Star on GitHub
                <ArrowUpRight width={13} height={13} className="transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
            <div className="label hidden gap-6 text-white/60 lg:flex">
              <Link href="/" className="transition-colors hover:text-white" onClick={onClose}>
                Home
              </Link>
              <span>Search — ⌘K</span>
              <span>Esc to close</span>
            </div>
          </div>

          <nav aria-label="Volumes" className="min-w-0">
            <ol className="border-t border-white/12">
              {nav.map((b, i) => (
                <li key={b.slug} className="border-b border-white/12" style={bookStyle(b.accent)}>
                  <Link
                    href={`/${b.slug}/`}
                    onClick={onClose}
                    aria-current={b.slug === currentSlug ? "true" : undefined}
                    className="group relative flex items-center gap-4 overflow-hidden py-4 sm:gap-8 sm:py-5"
                  >
                    <span
                      className="absolute inset-0 origin-bottom scale-y-0 bg-book transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-y-100"
                      aria-hidden
                    />
                    {/* Left group slides in on hover so it never touches the fill's edge. */}
                    <span className="relative flex min-w-0 flex-1 items-center gap-4 transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:translate-x-4 sm:gap-8">
                      <span className="line-mask shrink-0">
                        <span className="label w-6 text-white/60 group-hover:text-white/85" style={{ ["--d" as string]: i }}>
                          {b.volume}
                        </span>
                      </span>
                      <span className="line-mask min-w-0 flex-1">
                        <span className="display block text-[clamp(1.9rem,4.6vw,4.9rem)] sm:truncate" style={{ ["--d" as string]: i }}>
                          {b.title.replace(/ Interview$/, "")}
                          {b.slug === currentSlug && <em className="ml-3 align-top text-[0.35em] text-white/60">(reading)</em>}
                        </span>
                      </span>
                    </span>
                    {/* Right slot: chapter count, swapped for an arrow on hover, flush with the Close button. */}
                    <span className="relative hidden shrink-0 place-items-center transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:-translate-x-4 sm:grid">
                      <span className="label text-white/60 transition-opacity duration-300 [grid-area:1/1] group-hover:opacity-0">
                        {b.chapters.length} ch.
                      </span>
                      <ArrowUpRight
                        width={26}
                        height={26}
                        className="translate-y-2 opacity-0 transition-all duration-500 [grid-area:1/1] group-hover:translate-y-0 group-hover:opacity-100"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}
