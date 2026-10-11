import fs from "node:fs";
import path from "node:path";
import booksJson from "./books.json";

export type Book = {
  slug: string;
  folder: string;
  title: string;
  short: string;
  description: string;
  accent: string;
};

export type ChapterMeta = {
  book: string;
  slug: string;
  number: number;
  title: string;
  file: string;
  readingMinutes: number;
  figures: number;
};

export const books: Book[] = booksJson;

/** The markdown books live in the repository root, one level above the site. */
const CONTENT_ROOT = path.resolve(process.cwd(), "..");

export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

function chapterSlug(file: string): string {
  return file
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromMarkdown(source: string, fallback: string): string {
  const h1 = source.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!h1) return fallback;
  // "01. Two Pointers" -> "Two Pointers"
  return h1.replace(/^\d+\.\s*/, "");
}

const chapterCache = new Map<string, ChapterMeta[]>();

export function getChapters(bookSlug: string): ChapterMeta[] {
  const cached = chapterCache.get(bookSlug);
  if (cached) return cached;

  const book = getBook(bookSlug);
  if (!book) return [];
  const dir = path.join(CONTENT_ROOT, book.folder);
  const chapters = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file, i): ChapterMeta => {
      const source = fs.readFileSync(path.join(dir, file), "utf8");
      const number = Number.parseInt(file, 10) || i + 1;
      const fallback = file.replace(/^\d+_/, "").replace(/\.md$/, "").replace(/_/g, " ");
      const words = source.replace(/```[\s\S]*?```/g, "").split(/\s+/).length;
      return {
        book: bookSlug,
        slug: chapterSlug(file),
        number,
        title: titleFromMarkdown(source, fallback),
        file,
        readingMinutes: Math.max(1, Math.round(words / 230)),
        figures: (source.match(/!\[[^\]]*\]\(/g) ?? []).length,
      };
    });

  chapterCache.set(bookSlug, chapters);
  return chapters;
}

export function getChapter(bookSlug: string, slug: string) {
  const chapters = getChapters(bookSlug);
  const index = chapters.findIndex((c) => c.slug === slug);
  if (index === -1) return undefined;
  const meta = chapters[index];
  const book = getBook(bookSlug)!;
  const source = fs.readFileSync(path.join(CONTENT_ROOT, book.folder, meta.file), "utf8");
  return {
    meta,
    source,
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}

export function getImageDir(bookSlug: string): string {
  return path.join(CONTENT_ROOT, getBook(bookSlug)!.folder);
}

export type NavBook = Pick<Book, "slug" | "title" | "short" | "accent"> & {
  volume: string;
  chapters: Pick<ChapterMeta, "slug" | "number" | "title">[];
};

/** "01", "02", ... — books are presented as numbered volumes. */
export function volumeOf(slug: string): string {
  return String(books.findIndex((b) => b.slug === slug) + 1).padStart(2, "0");
}

/** Lightweight navigation tree passed to client components. */
export function getNavigation(): NavBook[] {
  return books.map((b) => ({
    slug: b.slug,
    title: b.title,
    short: b.short,
    accent: b.accent,
    volume: volumeOf(b.slug),
    chapters: getChapters(b.slug).map(({ slug, number, title }) => ({ slug, number, title })),
  }));
}
