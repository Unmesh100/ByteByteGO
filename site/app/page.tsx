import Link from "next/link";
import { BookCover, MiniCover } from "@/components/BookCover";
import { MorphingHeadline } from "@/components/MorphingHeadline";
import { ArrowDown, ArrowUpRight } from "@/components/icons";
import { Tilt } from "@/components/Tilt";
import { books, getChapters, volumeOf } from "@/lib/content";
import { bookStyle, pad } from "@/lib/format";

export default function HomePage() {
  const shelf = books.map((b) => {
    const chapters = getChapters(b.slug);
    return {
      book: b,
      chapters,
      volume: volumeOf(b.slug),
      hours: Math.round(chapters.reduce((m, c) => m + c.readingMinutes, 0) / 60),
    };
  });
  const totalChapters = shelf.reduce((n, s) => n + s.chapters.length, 0);
  const totalHours = shelf.reduce((n, s) => n + s.hours, 0);
  const totalFigures = shelf.reduce((n, s) => n + s.chapters.reduce((m, c) => m + c.figures, 0), 0);

  // Interleave chapter titles across volumes for the ticker.
  const longest = Math.max(...shelf.map((s) => s.chapters.length));
  const ticker = Array.from({ length: longest }, (_, i) =>
    shelf.flatMap((s) => (s.chapters[i] ? [{ title: s.chapters[i].title, accent: s.book.accent }] : [])),
  )
    .flat()
    .filter((t) => !/^(Introduction|The Learning)/.test(t.title))
    .slice(0, 36);

  return (
    <main id="main">
      {/* ------------------------------------------------------------ Hero */}
      <section className="mx-auto max-w-[100rem] px-5 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-14">
        <div className="label fade-up grid grid-cols-[1fr_auto] items-center gap-4 text-fg-subtle md:grid-cols-3">
          <span>(A reading room for engineers)</span>
          <span className="hidden text-center md:block">Interview preparation — six volumes</span>
          <a href="#collection" className="justify-self-end transition-colors hover:text-fg">
            Scroll ↓
          </a>
        </div>

        <h1 className="sr-only">The Interview Library</h1>
        <MorphingHeadline
          texts={["The Interview Library", "ByteByteGo", "Unmesh100"]}
          className="fade-up mt-12 sm:mt-14"
        />

        <div className="mt-10 grid gap-14 border-t border-line pt-10 sm:mt-14 lg:grid-cols-12 lg:gap-8">
          <div className="fade-up lg:col-span-5" style={{ ["--d" as string]: 3 }}>
            <p className="max-w-md text-lg leading-relaxed text-fg-muted text-pretty">
              Study notes for system design, coding patterns, object-oriented design, machine learning, generative AI and
              mobile interviews — typeset for slow, focused reading.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#index" className="btn-ink btn-down">
                Browse the index
                <span className="btn-arrow">
                  <ArrowDown width={16} height={16} />
                </span>
              </a>
            </div>
          </div>

          <dl className="fade-up grid grid-cols-2 sm:grid-cols-4 lg:col-span-6 lg:col-start-7" style={{ ["--d" as string]: 4 }}>
            {[
              ["Volumes", pad(books.length)],
              ["Chapters", String(totalChapters)],
              ["Hours", `≈${totalHours}`],
              ["Figures", totalFigures.toLocaleString("en-US")],
            ].map(([k, v], i) => (
              <div key={k} className={`border-line py-2 pr-4 ${i % 2 ? "border-l pl-5" : ""} ${i === 2 ? "sm:border-l sm:pl-5" : ""} max-sm:[&:nth-child(n+3)]:mt-8`}>
                <dt className="label text-fg-subtle">{k}</dt>
                <dd className="display mt-3 text-[clamp(2.6rem,4.4vw,4.2rem)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------ Shelf */}
      <section className="border-t border-line" aria-labelledby="collection">
        <div className="mx-auto max-w-[100rem] px-5 py-20 sm:px-8 sm:py-28">
          <div className="reveal grid gap-6 lg:grid-cols-12">
            <p className="label text-fg-subtle lg:col-span-3">(01) The collection</p>
            <h2 id="collection" className="display text-[clamp(2.6rem,6vw,5.4rem)] lg:col-span-7">
              Six volumes, <em>one shelf.</em>
            </h2>
            <p className="label hidden self-end text-right text-fg-subtle lg:col-span-2 lg:block">Hover to inspect</p>
          </div>

          <ul className="no-scrollbar -mx-5 mt-16 flex snap-x snap-mandatory scroll-px-5 gap-8 overflow-x-auto px-5 pb-6 after:w-px after:shrink-0 after:content-[''] sm:after:hidden sm:mx-0 sm:mt-24 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-20 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {shelf.map(({ book, chapters, volume, hours }) => (
              <li key={book.slug} className="reveal w-[72vw] shrink-0 snap-center sm:w-auto" style={bookStyle(book.accent)}>
                <Link href={`/${book.slug}/`} className="group block">
                  <Tilt className="w-[86%]">
                    <BookCover slug={book.slug} title={book.title} volume={volume} accent={book.accent} chapters={chapters.length} size="md" />
                  </Tilt>
                  <div className="mt-12 border-t border-line pt-5">
                    <p className="label flex justify-between text-fg-subtle">
                      <span>Vol. {volume}</span>
                      <span>
                        {chapters.length} ch. · ≈{hours} h
                      </span>
                    </p>
                    <h3 className="mt-3 flex items-start justify-between gap-4 font-serif text-[1.9rem] leading-[1.05] tracking-[-0.01em]">
                      <span className="link-sweep">{book.title}</span>
                      <ArrowUpRight
                        width={22}
                        height={22}
                        className="mt-1 shrink-0 text-fg-subtle transition-all duration-500 group-hover:rotate-45 group-hover:text-book"
                      />
                    </h3>
                    <p className="mt-3 text-[0.94rem] leading-relaxed text-fg-muted">{book.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ Ticker */}
      <section className="marquee-wrap overflow-hidden border-y border-line py-7 sm:py-9" aria-hidden>
        <div className="marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {ticker.map((t, i) => (
                <span key={i} className="flex items-center whitespace-nowrap" style={bookStyle(t.accent)}>
                  <span className="display px-7 text-[clamp(2rem,4.2vw,3.6rem)] italic text-fg/85">{t.title}</span>
                  <span className="size-2 rounded-full bg-book" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Index */}
      <section id="index" className="mx-auto max-w-[100rem] px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="index-title">
        <div className="reveal grid gap-6 lg:grid-cols-12">
          <p className="label text-fg-subtle lg:col-span-3">(02) Index</p>
          <h2 id="index-title" className="display text-[clamp(2.6rem,6vw,5.4rem)] lg:col-span-9">
            Every chapter, <em>at a glance.</em>
          </h2>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-20 sm:mt-24 md:grid-cols-2 xl:grid-cols-3">
          {shelf.map(({ book, chapters, volume }) => (
            <div key={book.slug} className="reveal" style={bookStyle(book.accent)}>
              <Link href={`/${book.slug}/`} className="group flex items-center gap-4 border-b border-line-strong pb-5">
                <MiniCover accent={book.accent} volume={volume} />
                <span>
                  <span className="label block text-fg-subtle">Vol. {volume}</span>
                  <span className="mt-1 block font-serif text-[1.6rem] leading-tight">
                    <span className="link-sweep">{book.title}</span>
                  </span>
                </span>
              </Link>
              <ol>
                {chapters.map((ch) => (
                  <li key={ch.slug}>
                    <Link
                      href={`/${book.slug}/${ch.slug}/`}
                      className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-2 border-b border-line py-2.5 text-[0.92rem] text-fg-muted transition-colors hover:text-fg"
                    >
                      <span className="label text-fg-subtle transition-colors group-hover:text-book">{pad(ch.number)}</span>
                      <span className="transition-transform duration-500 [transition-timing-function:var(--ease)] group-hover:translate-x-1">
                        {ch.title}
                      </span>
                      <span className="label text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100">{ch.readingMinutes} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
