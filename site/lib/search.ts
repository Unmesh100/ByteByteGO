export type SearchEntry = {
  kind: "chapter" | "section";
  title: string;
  href: string;
  book: string;
  bookShort: string;
  accent: string;
  chapter: string;
  number: number;
};
