import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import { ArrowRight } from "@/components/icons";
import { Tilt } from "@/components/Tilt";
import { getBook, getChapters, volumeOf } from "@/lib/content";
import { pad } from "@/lib/format";

type Props = { params: Promise<{ book: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = getBook((await params).book);
  return book ? { title: book.title, description: book.description } : {};
}

export default async function BookPage({ params }: Props) {
  const book = getBook((await params).book);
  if (!book) notFound();
  const chapters = getChapters(book.slug);
  const volume = volumeOf(book.slug);
  const hours = Math.round(chapters.reduce((sum, c) => sum + c.readingMinutes, 0) / 60);
  const figures = chapters.reduce((sum, c) => sum + c.figures, 0);
  const [first, ...rest] = book.title.replace(/ Interview$/, "").split(" ");

  return (
    <div className="px-5 pb-28 sm:px-10 lg:px-14 xl:px-20">
      <section className="grid items-center gap-14 border-b border-line py-12 sm:py-16 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:gap-20 xl:py-24">
        <div className="fade-up mx-auto w-full max-w-[19rem] sm:max-w-[22rem] xl:order-none">
          <Tilt>
            <BookCover slug={book.slug} title={book.title} volume={volume} accent={book.accent} chapters={chapters.length} />
          </Tilt>
        </div>

        <div>
          <p className="label fade-up flex items-center gap-3 text-fg-subtle">
            <span className="size-1.5 rounded-full bg-book" /> Vol. {volume} / 06
          </p>
          <h1 className="display mt-6 text-[clamp(3.2rem,8vw,6.8rem)]">
            <span className="line-mask">
              <span style={{ ["--d" as string]: 0 }}>{first}</span>
            </span>
            <span className="line-mask">
              <span style={{ ["--d" as string]: 1 }}>
                <em>{rest.join(" ") || "Interview"}</em>
              </span>
            </span>
          </h1>
          <p className="fade-up mt-8 max-w-xl text-lg leading-relaxed text-fg-muted" style={{ ["--d" as string]: 2 }}>
            {book.description}
          </p>

          <dl className="fade-up mt-10 grid max-w-xl grid-cols-3 border-y border-line" style={{ ["--d" as string]: 3 }}>
            {[
              ["Chapters", pad(chapters.length)],
              ["Hours", `≈${hours}`],
              ["Figures", figures.toLocaleString("en-US")],
            ].map(([k, v], i) => (
              <div key={k} className={`py-5 ${i > 0 ? "border-l border-line pl-5" : ""}`}>
                <dt className="label text-fg-subtle">{k}</dt>
                <dd className="mt-2 font-serif text-4xl leading-none">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="fade-up mt-10" style={{ ["--d" as string]: 4 }}>
            <Link href={`/${book.slug}/${chapters[0].slug}/`} className="btn-ink">
              Begin chapter 01
              <span className="btn-arrow">
                <ArrowRight width={16} height={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="pt-16 sm:pt-24" aria-labelledby="contents">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 id="contents" className="display text-[clamp(2.4rem,5vw,3.8rem)]">
            Contents
          </h2>
          <p className="label pb-2 text-fg-subtle">{pad(chapters.length)} chapters</p>
        </div>

        <ol className="border-t border-line">
          {chapters.map((ch) => (
            <li key={ch.slug} className="reveal">
              <Link
                href={`/${book.slug}/${ch.slug}/`}
                className="group flex items-baseline gap-4 border-b border-line py-5 sm:gap-6 sm:py-6"
              >
                <span className="label w-8 shrink-0 text-book">{pad(ch.number)}</span>
                <span className="font-serif text-[1.55rem] leading-[1.1] tracking-[-0.01em] transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:translate-x-2 sm:text-[2rem]">
                  {ch.title}
                </span>
                <span className="mb-1.5 hidden h-px min-w-8 flex-1 border-b border-dotted border-line-strong sm:block" aria-hidden />
                <span className="label ml-auto shrink-0 text-fg-subtle transition-colors group-hover:text-fg sm:ml-0">
                  {ch.readingMinutes} min
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
