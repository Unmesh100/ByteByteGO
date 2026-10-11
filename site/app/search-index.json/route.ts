import { books, getChapter, getChapters } from "@/lib/content";
import { extractHeadings } from "@/lib/markdown";
import type { SearchEntry } from "@/lib/search";

export const dynamic = "force-static";

/** Static JSON index of every chapter and section heading, fetched lazily by the search dialog. */
export function GET() {
  const entries: SearchEntry[] = [];
  for (const book of books) {
    for (const meta of getChapters(book.slug)) {
      const href = `/${book.slug}/${meta.slug}/`;
      const common = { book: book.slug, bookShort: book.short, accent: book.accent, chapter: meta.title, number: meta.number };
      entries.push({ kind: "chapter", title: meta.title, href, ...common });
      const { source } = getChapter(book.slug, meta.slug)!;
      for (const h of extractHeadings(source)) {
        entries.push({ kind: "section", title: h.text, href: `${href}#${h.id}`, ...common });
      }
    }
  }
  return Response.json(entries);
}
