import { notFound } from "next/navigation";
import { MobileNav } from "@/components/MobileNav";
import { SidebarNav } from "@/components/SidebarNav";
import { books, getBook, getNavigation } from "@/lib/content";
import { bookStyle } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return books.map((b) => ({ book: b.slug }));
}

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ book: string }>;
}) {
  const book = getBook((await params).book);
  if (!book) notFound();
  const nav = getNavigation();

  return (
    <div style={bookStyle(book.accent)}>
      <MobileNav nav={nav} />
      <div className="mx-auto flex max-w-[100rem]">
        <aside className="sticky top-[var(--header-h)] hidden h-[calc(100dvh-var(--header-h))] w-[19rem] shrink-0 border-r border-line lg:block">
          <div className="scroll-thin h-full overflow-y-auto overscroll-contain px-8 py-10">
            <SidebarNav nav={nav} />
          </div>
        </aside>
        <div id="main" className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
