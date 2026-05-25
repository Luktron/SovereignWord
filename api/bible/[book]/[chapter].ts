import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as fs from "fs";
import * as path from "path";
import { booksMetadata } from "../../../src/data/bibleData";
import { bookTranslations } from "../../../src/data/translations";

// ── Local Bible JSON loaders (JFA + KJV) ───────────────────────────────────
interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

let jfaBible: BibleBook[] | null = null;
let kjvBible: BibleBook[] | null = null;

function resolveBibleFilePath(fileName: string): string {
  const roots = [
    process.cwd(),
    process.env.LAMBDA_TASK_ROOT,
    "/var/task",
    path.resolve(process.cwd(), ".."),
  ].filter(Boolean) as string[];

  for (const root of roots) {
    const candidate = path.join(root, "data", "private", fileName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Bible JSON not found: ${fileName}`);
}

function getJfaBible(): BibleBook[] {
  if (jfaBible) return jfaBible;
  const filePath = resolveBibleFilePath("bible-jfa.json");
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  jfaBible = JSON.parse(raw) as BibleBook[];
  return jfaBible;
}

function getKjvBible(): BibleBook[] {
  if (kjvBible) return kjvBible;
  const filePath = resolveBibleFilePath("bible-kjv.json");
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  kjvBible = JSON.parse(raw) as BibleBook[];
  return kjvBible;
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function normaliseKey(s: string): string {
  return normalise(s).replace(/\s+/g, "");
}

const NAME_OVERRIDES: Record<string, string> = {
  cantares: "canticos",
  lamentacoes: "lamentacoes de jeremias",
  filemon: "filemom",
};

const PT_TO_EN_BOOK_NAMES: Record<string, string> = Object.values(bookTranslations).reduce((acc, entry) => {
  acc[normaliseKey(entry.pt)] = normalise(entry.en);
  return acc;
}, {} as Record<string, string>);

function findChapter(bible: BibleBook[], bookName: string, chapterNum: number, overrides?: Record<string, string>): string[] | null {
  const key = normaliseKey(bookName);
  const directCandidates = new Set<string>();
  directCandidates.add(normalise(bookName));
  directCandidates.add(PT_TO_EN_BOOK_NAMES[key] ?? "");
  directCandidates.add(overrides?.[key] ?? "");

  for (const candidate of directCandidates) {
    if (!candidate) continue;
    const match = bible.find((b) => normalise(b.name) === candidate);
    if (match?.chapters[chapterNum - 1]) {
      return match.chapters[chapterNum - 1];
    }
  }

  const canonicalIndex = booksMetadata.findIndex((b) => normaliseKey(b.name) === key);
  if (canonicalIndex >= 0 && canonicalIndex < bible.length) {
    return bible[canonicalIndex]?.chapters[chapterNum - 1] ?? null;
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const book = decodeURIComponent(req.query.book as string);
  const chapter = req.query.chapter as string;
  const lang = req.query.lang as string;
  const chapterNum = parseInt(chapter, 10);

  // ── Portuguese: serve directly from local JFA JSON ────────────────────────
  if (lang !== "en") {
    try {
      const verses = findChapter(getJfaBible(), book, chapterNum, NAME_OVERRIDES);
      if (verses && verses.length > 0) {
        return res.json({
          bookName: book,
          chapterNumber: chapterNum,
          verses: verses.map((text, i) => ({ number: i + 1, text })),
        });
      }
    } catch (err) {
      console.error("JFA local lookup failed:", err);
    }
    // Fallback message if book/chapter not found in local JSON
    return res.json({
      bookName: book,
      chapterNumber: chapterNum,
      verses: [{ number: 1, text: `Capítulo ${chapterNum} de ${book} não encontrado no banco de dados local.` }],
    });
  }

  // ── English: serve directly from local KJV JSON ───────────────────────────
  try {
    const verses = findChapter(getKjvBible(), book, chapterNum);
    const translatedName = bookTranslations[normaliseKey(book)]?.en ?? book;
    if (verses && verses.length > 0) {
      return res.json({
        bookName: translatedName,
        chapterNumber: chapterNum,
        verses: verses.map((text, i) => ({ number: i + 1, text })),
      });
    }
  } catch (err) {
    console.error("KJV local lookup failed:", err);
  }

  return res.json({
    bookName: bookTranslations[normaliseKey(book)]?.en ?? book,
    chapterNumber: chapterNum,
    verses: [{ number: 1, text: `Chapter ${chapterNum} of ${book} was not found in the local KJV database.` }],
  });
}
