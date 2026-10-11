"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { NavBook } from "@/lib/content";
import { bookStyle, OPEN_MENU_EVENT } from "@/lib/format";
import { usePresence } from "@/lib/use-presence";
import { cn } from "@/lib/utils";
import { GitHubStar } from "./GitHubStar";
import { MENU_EXIT_MS, MenuOverlay } from "./MenuOverlay";
import { Search } from "./Search";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

const EASE = "[transition-timing-function:var(--ease)]";

export function Header({ nav }: { nav: NavBook[] }) {
  const pathname = usePathname();
  const current = nav.find((b) => b.slug === pathname.split("/")[1]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  // The menu stays mounted through its exit animation; the header rides above it the whole time.
  const { mounted: menuMounted, closing: menuClosing } = usePresence(menuOpen, MENU_EXIT_MS);
  // On close, hold the colour change until the overlay has nearly rolled off the header,
  // so the logo and pill never fade into the dark panel mid-exit.
  const colourDelay = menuClosing ? "delay-300" : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onOpen = () => setMenuOpen(true);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(OPEN_MENU_EVENT, onOpen);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(OPEN_MENU_EVENT, onOpen);
    };
  }, []);

  return (
    <>
      <header
        // While the menu is open the header switches to the dark palette and sits above
        // the overlay, so the Menu button itself becomes the Close button.
        data-theme={menuOpen ? "dark" : undefined}
        className={cn(
          "sticky top-0 h-[var(--header-h)] border-b transition-[background-color,border-color] duration-500",
          menuMounted
            ? "z-[75] border-transparent bg-transparent"
            : scrolled
              ? "z-40 border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150"
              : "z-40 border-transparent bg-bg/0",
        )}
      >
        <div className="mx-auto flex h-full max-w-[100rem] items-center gap-6 px-5 sm:px-8">
          <Link
            href="/"
            className={`group flex shrink-0 items-baseline gap-2 text-fg transition-colors duration-500 ${EASE} ${colourDelay}`}
            aria-label="ByteByteGo Notes, home"
          >
            <span className="font-serif text-[1.65rem] leading-none tracking-[-0.02em]">
              ByteByte<em>Go</em>
            </span>
            <span className={`label hidden text-fg-subtle transition-colors duration-500 sm:inline ${colourDelay}`}>Notes</span>
          </Link>

          {current && (
            <Link
              href={`/${current.slug}/`}
              style={bookStyle(current.accent)}
              inert={menuMounted}
              className={cn(
                "label hidden items-center gap-2.5 text-fg-muted transition-[color,opacity] duration-300 hover:text-fg lg:flex",
                menuMounted && "pointer-events-none opacity-0",
              )}
            >
              <span className="h-px w-6 bg-line-strong" />
              <span className="size-1.5 rounded-full bg-book" />
              Vol. {current.volume} — {current.short}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div
              inert={menuMounted}
              className={cn(
                "flex items-center gap-2 transition-opacity duration-300",
                menuMounted ? "pointer-events-none opacity-0" : "opacity-100 delay-100",
              )}
            >
              <GitHubStar />
              <Search />
              <AnimatedThemeToggler
                duration={650}
                aria-label="Toggle dark mode"
                className="grid size-10 place-items-center rounded-full border border-line-strong text-fg-muted transition-colors hover:bg-sunken hover:text-fg [&_svg]:size-[17px] [&_svg]:stroke-[1.5]"
              />
            </div>

            {/* One button for both states: label rolls Menu → Close, lines rotate into an X,
                and the pill recolours with the header palette. */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={`group flex h-10 items-center gap-3 rounded-full bg-ink pl-4 pr-3.5 text-on-ink transition-[background-color,color,scale] duration-500 ${EASE} ${colourDelay} active:scale-95`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="label hidden overflow-hidden sm:grid" aria-hidden>
                <span className={cn("transition-[translate] duration-500 [grid-area:1/1]", EASE, menuOpen && "-translate-y-[120%]")}>
                  Menu
                </span>
                <span className={cn("transition-[translate] duration-500 [grid-area:1/1]", EASE, !menuOpen && "translate-y-[120%]")}>
                  Close
                </span>
              </span>
              <span className="relative block h-3 w-4" aria-hidden>
                <span
                  className={cn(
                    "absolute right-0 top-1/2 h-px bg-current transition-[width,translate,rotate] duration-500",
                    EASE,
                    menuOpen ? "w-4 rotate-45" : "w-4 -translate-y-[3px] group-hover:w-2.5",
                  )}
                />
                <span
                  className={cn(
                    "absolute right-0 top-1/2 h-px bg-current transition-[width,translate,rotate] duration-500",
                    EASE,
                    menuOpen ? "w-4 -rotate-45" : "w-2.5 translate-y-[3px] group-hover:w-4",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MenuOverlay nav={nav} open={menuOpen} mounted={menuMounted} closing={menuClosing} onClose={closeMenu} />
    </>
  );
}
