# ByteByteGo Notes — docs site

A static Next.js (App Router) + TypeScript docs site generated from the markdown books in the repository root.

## Commands

```bash
cd site
npm install
npm run dev      # http://localhost:3000 (also reachable from devices on the same Wi-Fi)
npm run build    # static export to site/out/
npm start        # serve site/out/
```

`predev` / `prebuild` run `scripts/sync-assets.mjs`, which copies each book's images into `public/content/<book-slug>/` (git-ignored).

## How it works

| Path | Purpose |
| --- | --- |
| `lib/books.json` | Book list: slug, source folder, title, description, accent colour. Add a book here. |
| `lib/content.ts` | Reads chapters (`NN_Title.md`) from each book folder; builds navigation. |
| `lib/markdown.ts` | unified pipeline: GFM, KaTeX math, Shiki highlighting, language tabs, image sizing, TOC. |
| `app/[book]/[chapter]/page.tsx` | Chapter page with sidebar, "On this page" outline and prev/next. |
| `app/search-index.json/route.ts` | Static search index (chapters + section headings) for the ⌘K dialog. |
| `components/` | Header + full-screen menu, `ui/animated-theme-toggler` and `ui/morphing-text` (Magic UI, adapted), `SmoothScroll` (Lenis), `FooterWordmark`, 3D `BookCover` + `Tilt`, sidebar, mobile chapter bar, search, outline, article enhancer. |
| `app/globals.css` | Design tokens (paper/ink palette, book colours), editorial prose styles, 3D cover, motion. Global styles live in `@layer base` / `@layer components` so Tailwind utilities can override them. |
| `lib/scroll.ts`, `lib/use-presence.ts` | Smooth-scroll helpers, ref-counted scroll lock, and enter/exit handling for overlays. |

### Markdown conventions handled

- The chapter's `# 01. Title` becomes the page title; the hand-written anchor list under it is dropped (the outline replaces it).
- Consecutive `### Python` / `### JavaScript` / `### Java` / `### C++` headings followed by code blocks become one tabbed code group. The chosen language is remembered.
- Currency like `$100` is escaped so it isn't parsed as math; `$O(n^2)$` still renders.
- Literal `<key:value>`-style text outside code is escaped instead of being treated as HTML.
- `**Candidate:**` / `**Interviewer:**` lines are split apart and rendered as a transcript with speaker labels.
- `**Kotlin**` / `**Swift**` labels before code blocks become tabs, like the `### Python` headings.
- One-line `$$ … $$` formulas become display math; `<p align="center">` captions no longer swallow the line after them.
- Unlabelled code blocks show "Example" (for Input/Output samples) or "Plain text".

### Design

Instrument Serif (display), Geist (text) and Geist Mono (labels) on a warm paper palette with film grain. Each volume has its own colour, used for its cover, active states and reading progress. Code blocks are always dark (Shiki `vesper`). Motion is CSS-only (masked headline reveals, scroll-driven reveals, marquee) and respects `prefers-reduced-motion`.
