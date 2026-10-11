import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEnhancer } from "@/components/ArticleEnhancer";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { ReadingProgress } from "@/components/ReadingProgress";
import { MobileToc, Toc } from "@/components/Toc";
import { books, getBook, getChapter, getChapters, getImageDir, volumeOf } from "@/lib/content";
import { pad } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

type Props = { params: Promise<{ book: string; chapter: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return books.flatMap((b) => getChapters(b.slug).map((c) => ({ book: b.slug, chapter: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book, chapter } = await params;
  const data = getChapter(book, chapter);
  const bookMeta = getBook(book);
  if (!data || !bookMeta) return {};
  return {
    title: data.meta.title,
    description: `Chapter ${data.meta.number} of ${bookMeta.title}: ${data.meta.title}.`,
  };
}

export default async function ChapterPage({ params }: Props) {
  const { book: bookSlug, chapter } = await params;
  const book = getBook(bookSlug);
  const data = getChapter(bookSlug, chapter);
  if (!book || !data) notFound();

  const { meta, source, prev, next } = data;
  const total = getChapters(book.slug).length;
  const volume = volumeOf(book.slug);
  const { html, toc } = await renderMarkdown(source, { book: book.slug, imageDir: getImageDir(book.slug) });
  const sections = toc.filter((t) => t.depth === 2).length;

  return (
    <>
      <ReadingProgress />
      <div className="flex">
        <article className="min-w-0 flex-1 px-5 pb-24 pt-10 sm:px-10 sm:pt-16 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-[44rem]">
            <header className="mb-14 sm:mb-20">
              <div className="label fade-up flex items-center justify-between gap-4 text-fg-subtle">
                <Link href={`/${book.slug}/`} className="flex min-w-0 items-center gap-2.5 transition-colors hover:text-fg">
                  <span className="size-1.5 shrink-0 rounded-full bg-book" />
                  <span className="truncate">
                    Vol. {volume} — {book.title}
                  </span>
                </Link>
                <span className="shrink-0">
                  Ch. {pad(meta.number)} / {pad(total)}
                </span>
              </div>

              <h1 className="display mt-10 border-t border-line pt-8 text-[clamp(2.8rem,7.5vw,5.4rem)] text-balance sm:mt-14 sm:pt-10">
                <span className="line-mask">
                  <span>{meta.title}</span>
                </span>
              </h1>

              <dl className="fade-up mt-10 grid grid-cols-3 border-y border-line" style={{ ["--d" as string]: 2 }}>
                {[
                  ["Reading", `${meta.readingMinutes} min`],
                  ["Sections", pad(sections)],
                  ["Figures", pad(meta.figures)],
                ].map(([k, v], i) => (
                  <div key={k} className={`py-4 ${i > 0 ? "border-l border-line pl-4 sm:pl-6" : ""}`}>
                    <dt className="label text-fg-subtle">{k}</dt>
                    <dd className="mt-1.5 font-serif text-2xl leading-none sm:text-[1.7rem]">{v}</dd>
                  </div>
                ))}
              </dl>
            </header>

            <MobileToc toc={toc} />

            <div id="article" className="prose" dangerouslySetInnerHTML={{ __html: html }} />
            <ArticleEnhancer containerId="article" />

            <nav className="mt-28 grid border-t border-line sm:grid-cols-2" aria-label="Chapter navigation">
              {prev ? (
                <Link href={`/${book.slug}/${prev.slug}/`} className="group border-b border-line py-8 sm:border-b-0 sm:border-r sm:pr-8">
                  <span className="label flex items-center gap-2 text-fg-subtle">
                    <ArrowLeft width={14} height={14} className="transition-transform duration-500 group-hover:-translate-x-1" />
                    Previous · {pad(prev.number)}
                  </span>
                  <span className="mt-4 block font-serif text-[1.85rem] leading-[1.05] tracking-[-0.01em] transition-colors group-hover:text-book">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block sm:border-r sm:border-line" />
              )}
              {next ? (
                <Link href={`/${book.slug}/${next.slug}/`} className="group py-8 text-right sm:pl-8">
                  <span className="label flex items-center justify-end gap-2 text-fg-subtle">
                    Next · {pad(next.number)}
                    <ArrowRight width={14} height={14} className="transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                  <span className="mt-4 block font-serif text-[1.85rem] leading-[1.05] tracking-[-0.01em] transition-colors group-hover:text-book">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <Link href="/" className="group py-8 text-right sm:pl-8">
                  <span className="label text-fg-subtle">End of volume {volume}</span>
                  <span className="mt-4 block font-serif text-[1.85rem] leading-[1.05] transition-colors group-hover:text-book">
                    Back to the library
                  </span>
                </Link>
              )}
            </nav>
          </div>
        </article>

        <aside className="sticky top-[var(--header-h)] hidden h-[calc(100dvh-var(--header-h))] w-[17rem] shrink-0 xl:block">
          <div className="h-full py-16 pr-8">{toc.length > 0 && <Toc toc={toc} />}</div>
        </aside>
      </div>
    </>
  );
}
