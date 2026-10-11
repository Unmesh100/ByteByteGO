import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] max-w-[100rem] flex-col justify-center px-5 pb-20 sm:px-8">
      <p className="label fade-up text-fg-subtle">(Error 404) — Missing page</p>
      <h1 className="display mt-8 text-[clamp(4rem,16vw,15rem)] leading-[0.85]">
        <span className="line-mask">
          <span>Off the</span>
        </span>
        <span className="line-mask pl-[12%]">
          <span style={{ ["--d" as string]: 1 }}>
            <em>shelf.</em>
          </span>
        </span>
      </h1>
      <div className="fade-up mt-12 flex flex-wrap items-center gap-6" style={{ ["--d" as string]: 3 }}>
        <Link href="/" className="btn-ink">
          Return to the library
          <span className="btn-arrow">
            <ArrowRight width={16} height={16} />
          </span>
        </Link>
        <p className="label text-fg-subtle">Or press ⌘K to search</p>
      </div>
    </main>
  );
}
