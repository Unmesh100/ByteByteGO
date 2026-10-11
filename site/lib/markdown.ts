import fs from "node:fs";
import path from "node:path";
import { unified, type Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import type { BundledLanguage } from "shiki";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";
import { imageSize } from "image-size";
import { visit, SKIP } from "unist-util-visit";
import { toString as mdastToString } from "mdast-util-to-string";
import { toString as hastToString } from "hast-util-to-string";
import type { Root as MdRoot, Heading, Code, RootContent, Parent as MdParent } from "mdast";
import type { Root as HRoot, Element, ElementContent } from "hast";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

/* ------------------------------------------------------------------ */
/* Source preprocessing                                                */
/* ------------------------------------------------------------------ */

const HTML_TAGS = new Set([
  "p", "br", "img", "sup", "sub", "b", "i", "u", "em", "strong", "div", "span",
  "a", "table", "thead", "tbody", "tr", "td", "th", "ul", "ol", "li", "code",
  "pre", "hr", "center", "figure", "figcaption", "small", "details", "summary",
]);

/**
 * Escape `$` signs that are currency rather than math, using Pandoc's rule:
 * an opening `$` must be followed by a non-space, and a closing `$` must be
 * preceded by a non-space and not followed by a digit.
 */
function escapeCurrency(line: string): string {
  let out = "";
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "\\" && i + 1 < line.length) {
      out += line.slice(i, i + 2);
      i += 2;
      continue;
    }
    if (ch !== "$") {
      out += ch;
      i++;
      continue;
    }
    if (line[i + 1] === "$") {
      // Display math delimiter, leave alone.
      out += "$$";
      i += 2;
      continue;
    }
    let close = -1;
    if (line[i + 1] && !/\s/.test(line[i + 1])) {
      for (let j = i + 1; j < line.length; j++) {
        if (line[j] === "\\") {
          j++;
          continue;
        }
        if (line[j] === "$") {
          if (!/\s/.test(line[j - 1]) && !/\d/.test(line[j + 1] ?? "") && line[j + 1] !== "$") close = j;
          break;
        }
      }
    }
    if (close === -1) {
      out += "\\$";
      i++;
    } else {
      out += line.slice(i, close + 1);
      i = close + 1;
    }
  }
  return out;
}

/** Escape `<` that does not start a known HTML tag, e.g. `<key:value>`. */
function escapeStrayAngles(line: string): string {
  return line.replace(/<(\/?)([A-Za-z][\w:-]*)?/g, (match, slash: string, name?: string) => {
    if (name && HTML_TAGS.has(name.toLowerCase())) return match;
    if (!name && !slash) return match; // "a < b" comparisons are fine as-is
    return "&lt;" + slash + (name ?? "");
  });
}

/** Apply a transform to prose only, leaving fenced code and inline code alone. */
function transformProse(source: string, fn: (s: string) => string): string {
  const lines = source.split("\n");
  let fence: string | null = null;
  return lines
    .map((line) => {
      const m = line.match(/^\s*(`{3,}|~{3,})/);
      if (m) {
        if (!fence) fence = m[1];
        else if (m[1].startsWith(fence[0]) && m[1].length >= fence.length) fence = null;
        return line;
      }
      if (fence) return line;
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, idx) => (idx % 2 === 1 ? part : fn(part)))
        .join("");
    })
    .join("\n");
}

/**
 * Drop the chapter's H1 (rendered separately as the page title) and the
 * hand-written table of contents that follows it (the sidebar TOC replaces it).
 */
function stripTitleAndManualToc(source: string): string {
  const lines = source.split("\n");
  const h1 = lines.findIndex((l) => /^#\s+/.test(l));
  if (h1 === -1) return source;
  let i = h1 + 1;
  while (i < lines.length && lines[i].trim() === "") i++;
  const tocStart = i;
  while (i < lines.length && /^\s*(\d+\.|[-*])\s+\[[^\]]+\]\(#[^)]*\)\s*$/.test(lines[i])) i++;
  if (i > tocStart) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (/^\s*(---|\*\*\*)\s*$/.test(lines[i] ?? "")) i++;
  } else {
    i = tocStart;
  }
  return [...lines.slice(0, h1), ...lines.slice(i)].join("\n");
}

const SPEAKER = /^\*\*(Candidate|Interviewer|Anne)\s*:?\*\*:?/;

/**
 * Interview transcripts are written one speaker per line with no blank line
 * between, which markdown would merge into one paragraph. Split them apart.
 */
function separateDialogue(source: string): string {
  const out: string[] = [];
  let inFence = false;
  for (const line of source.split("\n")) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) inFence = !inFence;
    const prev = out[out.length - 1];
    if (!inFence && SPEAKER.test(line) && prev !== undefined && prev.trim() !== "" && !/^\s*([-*+]\s|[>|#]|\d+\.\s)/.test(prev)) {
      out.push("");
    }
    out.push(line);
  }
  return out.join("\n");
}

/**
 * Line-level fixes outside code fences:
 * - an HTML line such as `<p align="center">Figure 1</p>` opens an HTML block that
 *   swallows the following lines as raw HTML unless a blank line follows it;
 * - `$$ ... $$` written on one line is parsed as inline math, so expand it into
 *   a display block (centered, horizontally scrollable on small screens).
 */
function normalizeBlocks(source: string): string {
  const out: string[] = [];
  let inFence = false;
  const lines = source.split("\n");
  lines.forEach((raw, i) => {
    let line = raw;
    if (/^\s*(`{3,}|~{3,})/.test(line)) inFence = !inFence;
    if (inFence) {
      out.push(line);
      return;
    }
    // `###\u00a0Title` (non-breaking space) is not a heading to CommonMark.
    line = line.replace(/^(#{1,6})\u00a0+/, "$1 ");
    const display = line.match(/^\s*\$\$(.+)\$\$\s*$/);
    if (display) {
      out.push("", "$$", display[1].trim(), "$$", "");
      return;
    }
    out.push(line);
    const next = lines[i + 1];
    if (/^\s*<(p|div|center|figure|img)\b[^>]*>.*$/i.test(line) && next !== undefined && next.trim() !== "") out.push("");
  });
  return out.join("\n");
}

export function preprocess(source: string): string {
  const body = normalizeBlocks(separateDialogue(stripTitleAndManualToc(source.replace(/\r\n/g, "\n"))));
  return transformProse(body, (s) => escapeStrayAngles(escapeCurrency(s)));
}

/* ------------------------------------------------------------------ */
/* Remark plugins                                                      */
/* ------------------------------------------------------------------ */

const LANG_HEADINGS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  "c++": "C++",
  cpp: "C++",
  go: "Go",
  kotlin: "Kotlin",
  swift: "Swift",
  "c#": "C#",
  rust: "Rust",
};

/**
 * Turn runs of `### Python` + code, `### Java` + code, ... into a single
 * tabbed code group so the reader picks a language once.
 */
const remarkCodeTabs: Plugin<[], MdRoot> = () => (tree) => {
  visit(tree, (node) => {
    if (!("children" in node)) return;
    const parent = node as MdParent;
    const out: RootContent[] = [];
    const kids = parent.children as RootContent[];
    let i = 0;
    while (i < kids.length) {
      const group: { label: string; code: Code }[] = [];
      let j = i;
      while (j + 1 < kids.length) {
        const h = kids[j];
        const c = kids[j + 1];
        if (c.type !== "code") break;
        // Label is either a heading (`### Python`) or a bold-only paragraph (`**Kotlin**`).
        const isLabel =
          h.type === "heading" ||
          (h.type === "paragraph" && h.children.length === 1 && h.children[0].type === "strong");
        if (!isLabel) break;
        const label = LANG_HEADINGS[mdastToString(h).trim().toLowerCase()];
        if (!label) break;
        group.push({ label, code: c });
        j += 2;
      }
      if (group.length > 0) {
        out.push({
          type: "codeTabs",
          data: {
            hName: "div",
            hProperties: { className: ["code-tabs"], dataLabels: group.map((g) => g.label).join("|") },
          },
          children: group.map((g) => g.code),
        } as unknown as RootContent);
        i = j;
      } else {
        out.push(kids[i]);
        i++;
      }
    }
    parent.children = out as MdParent["children"];
  });
};

/**
 * Demote headings when the chapter uses H1s for its sections (the page title
 * is the only H1), assign stable ids and collect the table of contents.
 */
const remarkHeadings: Plugin<[{ toc: TocItem[] }], MdRoot> = ({ toc }) => (tree) => {
  let hasH1 = false;
  visit(tree, "heading", (h: Heading) => {
    if (h.depth === 1) hasH1 = true;
  });
  const slugger = new GithubSlugger();
  visit(tree, "heading", (h: Heading) => {
    if (hasH1) h.depth = Math.min(6, h.depth + 1) as Heading["depth"];
    const text = mdastToString(h).trim();
    const id = slugger.slug(text) || "section";
    h.data = { ...h.data, hProperties: { ...(h.data?.hProperties ?? {}), id } };
    if ((h.depth === 2 || h.depth === 3) && text) toc.push({ id, text, depth: h.depth });
  });
};

/* ------------------------------------------------------------------ */
/* Rehype plugins                                                      */
/* ------------------------------------------------------------------ */

const el = (
  tagName: string,
  properties: Element["properties"],
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children });
const txt = (value: string): ElementContent => ({ type: "text", value });

const LANG_NAMES: Record<string, string> = {
  python: "Python", javascript: "JavaScript", java: "Java", cpp: "C++", kotlin: "Kotlin",
  swift: "Swift", sql: "SQL", json: "JSON", bash: "Bash", yaml: "YAML",
  typescript: "TypeScript", go: "Go",
};

const copyButton = () =>
  el("button", { type: "button", className: ["copy-btn"], ariaLabel: "Copy code" }, [txt("Copy")]);

/** Wrap code blocks in a header bar with a language label and copy button, and build tab UIs. */
const rehypeCodeChrome: Plugin<[], HRoot> = () => (tree) => {
  visit(tree, "element", (node: Element, index, parent) => {
    if (!parent || index === undefined) return;

    if (node.tagName === "div" && (node.properties.className as string[] | undefined)?.includes("code-tabs")) {
      const labels = String(node.properties.dataLabels ?? "").split("|");
      // Shiki replaces each nested <pre> with a `root` fragment, so unwrap those first.
      const pres = node.children
        .flatMap((c) => ((c as { type: string }).type === "root" ? (c as unknown as HRoot).children : [c]))
        .filter((c): c is Element => c.type === "element" && c.tagName === "pre");
      const tabs = el(
        "div",
        { className: ["code-tabs-bar"], role: "tablist" },
        labels.map((label, k) =>
          el(
            "button",
            { type: "button", role: "tab", className: ["code-tab"], dataLang: label, ariaSelected: k === 0 ? "true" : "false" },
            [txt(label)],
          ),
        ),
      );
      const panels = pres.map((pre, k) =>
        el("div", { className: ["code-panel"], dataLang: labels[k], role: "tabpanel", hidden: k !== 0 }, [pre]),
      );
      node.properties = { className: ["code-tabs", "code-block"] };
      node.children = [el("div", { className: ["code-header"] }, [tabs, copyButton()]), ...panels];
      return SKIP;
    }

    if (node.tagName === "pre") {
      const lang = String(node.properties.dataLanguage ?? "text");
      const label =
        lang === "text" ? (/^\s*(Input|Output)\b/.test(hastToString(node)) ? "Example" : "Plain text") : (LANG_NAMES[lang] ?? lang);
      const header = el("div", { className: ["code-header"] }, [
        el("span", { className: ["code-lang"] }, [txt(label)]),
        copyButton(),
      ]);
      parent.children[index] = el("div", { className: ["code-block"] }, [header, node]);
      return SKIP;
    }
  });
};

/** Point images at /content/<book>/, add intrinsic sizes (no layout shift) and lazy loading. */
const rehypeImages: Plugin<[{ book: string; imageDir: string }], HRoot> = ({ book, imageDir }) => (tree) => {
  visit(tree, "element", (node: Element, index, parent) => {
    if (node.tagName !== "img") return;
    const src = String(node.properties.src ?? "");
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith("/")) {
      const file = decodeURIComponent(src.replace(/^\.\//, ""));
      node.properties.src = `/content/${book}/${encodeURIComponent(file)}`;
      try {
        const dim = imageSize(fs.readFileSync(path.join(imageDir, file)));
        if (dim.width && dim.height) {
          node.properties.width = dim.width;
          node.properties.height = dim.height;
        }
      } catch {
        /* missing image: render without dimensions */
      }
    }
    const alt = String(node.properties.alt ?? "");
    if (/^(alt text|image)$/i.test(alt)) node.properties.alt = "";
    node.properties.loading = "lazy";
    node.properties.decoding = "async";
    node.properties.className = ["zoomable"];

    // Images on their own line become figures.
    if (parent && parent.type === "element" && parent.tagName === "p" && index !== undefined) {
      const meaningful = parent.children.filter((c) => !(c.type === "text" && !c.value.trim()));
      if (meaningful.length === 1) {
        parent.tagName = "figure";
        parent.properties = { className: ["figure"] };
      }
    }
  });
};

/** Misc. polish: scrollable tables, external links, heading anchors, figure captions. */
const rehypePolish: Plugin<[], HRoot> = () => (tree) => {
  visit(tree, "element", (node: Element, index, parent) => {
    if (!parent || index === undefined) return;

    if (node.tagName === "table") {
      parent.children[index] = el("div", { className: ["table-wrap"] }, [node]);
      return SKIP;
    }
    if (node.tagName === "a") {
      const href = String(node.properties.href ?? "");
      if (/^https?:\/\//.test(href)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
      }
    }
    if (/^h[2-4]$/.test(node.tagName) && node.properties.id) {
      node.children.push(
        el("a", { href: `#${node.properties.id}`, className: ["heading-anchor"], ariaLabel: "Link to this section" }, [
          txt("#"),
        ]),
      );
    }
    if (node.tagName === "p" && node.properties.align === "center") {
      node.properties = { className: ["figure-caption"] };
    }
    // Transcript lines: <p><strong>Candidate:</strong> …</p> -> speaker label + line.
    if (node.tagName === "p") {
      const first = node.children.find((c) => !(c.type === "text" && !c.value.trim()));
      if (first?.type === "element" && first.tagName === "strong") {
        const speaker = hastToString(first).trim().replace(/:$/, "");
        if (/^(Candidate|Interviewer|Anne)$/.test(speaker)) {
          const rest = node.children.slice(node.children.indexOf(first) + 1);
          if (rest[0]?.type === "text") rest[0] = { ...rest[0], value: rest[0].value.replace(/^\s*:?\s*/, "") };
          node.properties = { className: ["dialogue", speaker === "Interviewer" ? "dialogue-b" : "dialogue-a"] };
          node.children = [
            el("span", { className: ["dialogue-speaker"] }, [txt(speaker)]),
            el("span", { className: ["dialogue-line"] }, rest),
          ];
        }
      }
    }
  });
};

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

const SHIKI_LANGS: BundledLanguage[] = ["python", "javascript", "typescript", "java", "cpp", "kotlin", "swift", "sql", "json", "bash", "yaml"];

export async function renderMarkdown(
  source: string,
  opts: { book: string; imageDir: string },
): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkCodeTabs)
    .use(remarkHeadings, { toc })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex, { strict: "ignore" })
    .use(rehypeShiki, {
      // Code blocks sit on ink in both themes, so one warm dark theme suffices.
      theme: "vesper",
      langs: SHIKI_LANGS,
      defaultLanguage: "text",
      fallbackLanguage: "text",
      addLanguageClass: true,
      transformers: [
        {
          pre(node) {
            node.properties.dataLanguage = this.options.lang;
          },
        },
      ],
    })
    .use(rehypeImages, opts)
    .use(rehypeCodeChrome)
    .use(rehypePolish)
    .use(rehypeStringify)
    .process(preprocess(source));

  return { html: String(file), toc };
}

/** Headings only (fast path used to build the search index). */
export function extractHeadings(source: string): TocItem[] {
  const toc: TocItem[] = [];
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkCodeTabs).use(remarkHeadings, { toc });
  processor.runSync(processor.parse(preprocess(source)));
  return toc;
}
