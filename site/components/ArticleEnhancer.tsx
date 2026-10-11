"use client";

import { useEffect, useState } from "react";
import { usePresence } from "@/lib/use-presence";

const LANG_KEY = "preferred-code-lang";

function selectTab(group: Element, lang: string): boolean {
  const tab = group.querySelector<HTMLElement>(`.code-tab[data-lang="${CSS.escape(lang)}"]`);
  if (!tab) return false;
  group.querySelectorAll(".code-tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
  group.querySelectorAll<HTMLElement>(".code-panel").forEach((p) => (p.hidden = p.dataset.lang !== lang));
  return true;
}

/**
 * Copy text to the clipboard. The async Clipboard API only exists in secure
 * contexts (https or localhost), so fall back to a hidden textarea when the site
 * is opened over a LAN address such as http://192.168.x.x.
 */
async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path */
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/**
 * Adds behaviour to the statically rendered article HTML via event delegation:
 * language tabs (synced across the page and remembered), copy buttons and image zoom.
 */
export function ArticleEnhancer({ containerId }: { containerId: string }) {
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const { mounted, closing } = usePresence(zoomed !== null, 300);

  // Keep the last image rendered while the lightbox fades out.
  useEffect(() => {
    if (zoomed) setImage(zoomed);
  }, [zoomed]);

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;

    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved) root.querySelectorAll(".code-tabs").forEach((g) => selectTab(g, saved));
    } catch {
      /* storage unavailable */
    }

    const onClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const tab = target.closest<HTMLElement>(".code-tab");
      if (tab?.dataset.lang) {
        const lang = tab.dataset.lang;
        // Keep the clicked tab in place while every other group switches too.
        const before = tab.getBoundingClientRect().top;
        root.querySelectorAll(".code-tabs").forEach((g) => selectTab(g, lang));
        window.scrollBy(0, tab.getBoundingClientRect().top - before);
        try {
          localStorage.setItem(LANG_KEY, lang);
        } catch {
          /* storage unavailable */
        }
        return;
      }

      const copy = target.closest<HTMLButtonElement>(".copy-btn");
      if (copy) {
        const block = copy.closest(".code-block");
        const pre = block?.querySelector<HTMLElement>(".code-panel:not([hidden]) pre, :scope > pre");
        if (!pre) return;
        const ok = await copyText(pre.innerText);
        copy.textContent = ok ? "Copied" : "Press ⌘C";
        if (ok) copy.dataset.copied = "";
        setTimeout(() => {
          copy.textContent = "Copy";
          delete copy.dataset.copied;
        }, 1600);
        return;
      }

      const img = target.closest<HTMLImageElement>("img.zoomable");
      if (img) setZoomed({ src: img.currentSrc || img.src, alt: img.alt });
    };

    root.addEventListener("click", onClick);

    // Wide formulas and tables scroll sideways; fade the edge that has more to show.
    const scrollers = [...root.querySelectorAll<HTMLElement>(".katex-display, .table-wrap")];
    const mark = (el: HTMLElement) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) delete el.dataset.overflow;
      else el.dataset.overflow = el.scrollLeft <= 1 ? "start" : el.scrollLeft >= max - 1 ? "end" : "middle";
    };
    const onScroll = (e: Event) => mark(e.currentTarget as HTMLElement);
    scrollers.forEach((el) => {
      mark(el);
      el.addEventListener("scroll", onScroll, { passive: true });
    });
    const resize = new ResizeObserver(() => scrollers.forEach(mark));
    resize.observe(root);

    return () => {
      root.removeEventListener("click", onClick);
      scrollers.forEach((el) => el.removeEventListener("scroll", onScroll));
      resize.disconnect();
    };
  }, [containerId]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (!mounted || !image) return null;
  return (
    <div
      className="lightbox"
      data-state={closing ? "closing" : "open"}
      onClick={() => setZoomed(null)}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image — click or press Escape to close"
    >
      <img src={image.src} alt={image.alt} />
    </div>
  );
}
