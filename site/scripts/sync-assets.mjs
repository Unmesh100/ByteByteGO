// Copies chapter images from the book folders (one level up) into
// public/content/<book-slug>/ so Next.js can serve them statically.
// Only files that are missing or changed are copied.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const books = JSON.parse(fs.readFileSync(path.join(here, "../lib/books.json"), "utf8"));
const contentRoot = path.resolve(here, "../..");
const publicRoot = path.resolve(here, "../public/content");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]);

let copied = 0;
let total = 0;
for (const book of books) {
  const src = path.join(contentRoot, book.folder);
  const dest = path.join(publicRoot, book.slug);
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) continue;
    total++;
    const from = path.join(src, name);
    const to = path.join(dest, name);
    const a = fs.statSync(from);
    const b = fs.existsSync(to) ? fs.statSync(to) : null;
    if (b && b.size === a.size && b.mtimeMs >= a.mtimeMs) continue;
    fs.copyFileSync(from, to);
    copied++;
  }
}
console.log(`sync-assets: ${copied} copied, ${total - copied} up to date`);
