import { REPO } from "@/lib/site";

export const GitHubMark = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
  </svg>
);

const StarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" strokeWidth={1.5} strokeLinejoin="round" aria-hidden {...p}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z" />
  </svg>
);

/** Header button linking to the repository so readers can star it. */
export function GitHubStar() {
  return (
    <a
      href={REPO.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star ${REPO.owner}/${REPO.name} on GitHub`}
      className="group flex size-10 items-center justify-center gap-2.5 rounded-full border border-line-strong text-fg-muted transition-colors duration-300 hover:bg-sunken hover:text-fg md:w-auto md:justify-start md:pl-3.5 md:pr-4"
    >
      <GitHubMark width={16} height={16} className="shrink-0" />
      <span className="label hidden md:inline">Star</span>
      <StarIcon
        width={13}
        height={13}
        className="hidden fill-transparent stroke-current transition-[fill,stroke,rotate] duration-500 [transition-timing-function:var(--ease)] group-hover:rotate-[72deg] group-hover:fill-accent group-hover:stroke-accent md:block"
      />
    </a>
  );
}
