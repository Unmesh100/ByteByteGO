"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bookStyle, pad } from "@/lib/format";
import type { SearchEntry } from "@/lib/search";
import { usePresence } from "@/lib/use-presence";
import { ArrowRight, SearchIcon } from "./icons";

let indexPromise: Promise<SearchEntry[] | null> | null = null;
/** Fetch the index once; resolves to null on failure so the next open retries. */
function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<SearchEntry[]>;
    })
    .catch(() => {
      indexPromise = null;
      return null;
    });
  return indexPromise;
}

function score(entry: SearchEntry, terms: string[]): number {
  const title = entry.title.toLowerCase();
  const context = `${entry.chapter} ${entry.bookShort}`.toLowerCase();
  let total = 0;
  for (const t of terms) {
    const at = title.indexOf(t);
    if (at !== -1) {
      total += at === 0 ? 12 : /\W/.test(title[at - 1]) ? 8 : 4;
    } else if (context.includes(t)) {
      total += 1;
    } else {
      return 0;
    }
  }
  if (entry.kind === "chapter") total += 6;
  if (title === terms.join(" ")) total += 10;
  return total - title.length / 100;
}

/** Wrap the matched query terms in <mark>. */
function highlight(text: string, terms: string[]) {
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-transparent text-accent">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function Search() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const { mounted, closing } = usePresence(open, 260);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const openSearch = useCallback(() => {
    setOpen(true);
    setStatus((st) => (st === "ready" ? st : "loading"));
    loadIndex().then((entries) => {
      if (entries) {
        setIndex(entries);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && !open && !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, openSearch]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus());
    // Escape closes from anywhere in the dialog, not only the input.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);

  const terms = useMemo(() => query.toLowerCase().trim().split(/\s+/).filter(Boolean), [query]);

  const results = useMemo(() => {
    if (!terms.length) return index.filter((e) => e.kind === "chapter" && e.number === 1);
    return index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.e);
  }, [index, terms]);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const go = (entry: SearchEntry) => {
    close();
    router.push(entry.href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    // Arrow keys wrap: down from the last result goes to the first, up from the first to the last.
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setSelected((s) => (s + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setSelected((s) => (s - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selected]) {
      go(results[selected]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="group flex size-10 items-center justify-center gap-3 rounded-full border border-line-strong text-fg-muted transition-colors hover:bg-sunken hover:text-fg md:w-auto md:justify-start md:pl-4 md:pr-1.5"
        aria-label="Search the library"
      >
        <SearchIcon width={16} height={16} className="md:hidden" />
        <span className="label hidden md:inline">Search</span>
        <kbd className="label hidden h-7 items-center rounded-full bg-sunken px-2.5 text-[0.62rem] text-fg-subtle md:flex">
          ⌘K
        </kbd>
      </button>

      {mounted &&
        createPortal(
          <div
            data-state={closing ? "closing" : "open"}
            className="search-overlay fixed inset-0 z-[80] flex items-start justify-center bg-[rgb(12_11_10/0.45)] p-3 pt-[9vh] backdrop-blur-md sm:p-6 sm:pt-[13vh]"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="search-panel flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_40px_120px_-30px_rgb(12_11_10/0.6)]">
              <div className="flex items-center gap-6 border-b border-line px-5 sm:px-6">
                <SearchIcon width={20} height={20} className="w-5 shrink-0 text-fg-subtle" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Search the library…"
                  className="h-16 w-full bg-transparent font-serif focus-visible:outline-none text-[1.6rem] tracking-[-0.01em] outline-none placeholder:text-fg-subtle sm:h-20 sm:text-[1.9rem]"
                  aria-label="Search query"
                  aria-controls="search-results"
                  aria-activedescendant={results[selected] ? `search-result-${selected}` : undefined}
                />
                <button
                  type="button"
                  onClick={close}
                  className="label shrink-0 rounded-full border border-line-strong px-2.5 py-1.5 text-fg-subtle transition-colors hover:text-fg"
                >
                  Esc
                </button>
              </div>

              <ul ref={listRef} id="search-results" role="listbox" className="scroll-thin flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3 sm:py-3">
                {!query && results.length > 0 && <li className="label px-3 pb-2 pt-2 text-fg-subtle">Begin a volume</li>}
                {status === "error" && (
                  <li className="px-3 py-14 text-center">
                    <p className="font-serif text-2xl">The index didn’t load.</p>
                    <p className="label mt-2 text-fg-subtle">Check your connection and reopen search</p>
                  </li>
                )}
                {results.map((r, i) => (
                  <li
                    key={r.href}
                    id={`search-result-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === selected}
                    onMouseMove={() => setSelected(i)}
                    onClick={() => go(r)}
                    style={bookStyle(r.accent)}
                    className={`relative flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors ${
                      i === selected ? "bg-sunken" : ""
                    }`}
                  >
                    <span className="label w-7 shrink-0 text-book">{pad(r.number)}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${r.kind === "chapter" ? "font-serif text-xl leading-tight" : "text-[0.95rem]"}`}>
                        {highlight(r.title, terms)}
                      </span>
                      <span className="label mt-1 block truncate text-fg-subtle">
                        {r.kind === "chapter" ? r.bookShort : `${r.bookShort} / ${r.chapter}`}
                      </span>
                    </span>
                    <ArrowRight
                      width={16}
                      height={16}
                      className={`shrink-0 text-fg-subtle transition-all duration-300 ${i === selected ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`}
                    />
                  </li>
                ))}
                {status === "loading" && (
                  <li className="label px-3 py-14 text-center text-fg-subtle">Loading the index…</li>
                )}
                {status === "ready" && query && results.length === 0 && (
                  <li className="px-3 py-14 text-center">
                    <p className="font-serif text-2xl">Nothing found for “{query.trim()}”.</p>
                    <p className="label mt-2 text-fg-subtle">Try a broader term</p>
                  </li>
                )}
              </ul>

              <div className="label hidden items-center gap-5 border-t border-line px-6 py-3 text-fg-subtle sm:flex">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span className="ml-auto">{index.length ? `${index.length.toLocaleString()} entries` : ""}</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
