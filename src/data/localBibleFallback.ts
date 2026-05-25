import { booksMetadata } from "./bibleData";
import { bookTranslations } from "./translations";
import type { Chapter } from "../types";

interface BibleJsonBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

let jfaLocalBibleCache: BibleJsonBook[] | null = null;
let kjvLocalBibleCache: BibleJsonBook[] | null = null;

const JFA_LOCAL_NAME_OVERRIDES: Record<string, string> = {
  cantares: "canticos",
  lamentacoes: "lamentacoes de jeremias",
  filemon: "filemom",
};

function normaliseBibleName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function normaliseBibleKey(s: string): string {
  return normaliseBibleName(s).replace(/\s+/g, "");
}

const PT_TO_EN_BOOK_NAMES: Record<string, string> = Object.values(bookTranslations).reduce((acc, entry) => {
  acc[normaliseBibleKey(entry.pt)] = normaliseBibleName(entry.en);
  return acc;
}, {} as Record<string, string>);

function findChapterInBible(
  bible: BibleJsonBook[],
  bookName: string,
  chapterNum: number,
  overrides?: Record<string, string>
): string[] | null {
  const key = normaliseBibleKey(bookName);
  const directCandidates = new Set<string>();
  directCandidates.add(normaliseBibleName(bookName));
  directCandidates.add(PT_TO_EN_BOOK_NAMES[key] ?? "");
  directCandidates.add(overrides?.[key] ?? "");

  for (const candidate of directCandidates) {
    if (!candidate) continue;
    const match = bible.find((b) => normaliseBibleName(b.name) === candidate);
    if (match?.chapters[chapterNum - 1]) {
      return match.chapters[chapterNum - 1];
    }
  }

  const canonicalIndex = booksMetadata.findIndex((b) => normaliseBibleKey(b.name) === key);
  if (canonicalIndex >= 0 && canonicalIndex < bible.length) {
    return bible[canonicalIndex]?.chapters[chapterNum - 1] ?? null;
  }

  return null;
}

async function getLocalBibleData(language: "pt" | "en"): Promise<BibleJsonBook[]> {
  if (language === "en") {
    if (kjvLocalBibleCache) return kjvLocalBibleCache;
    const mod = await import("../../data/private/bible-kjv.json");
    kjvLocalBibleCache = mod.default as unknown as BibleJsonBook[];
    return kjvLocalBibleCache;
  }

  if (jfaLocalBibleCache) return jfaLocalBibleCache;
  const mod = await import("../../data/private/bible-jfa.json");
  jfaLocalBibleCache = mod.default as unknown as BibleJsonBook[];
  return jfaLocalBibleCache;
}

export async function loadChapterFromLocalBible(
  bookName: string,
  chapterNum: number,
  language: "pt" | "en"
): Promise<Chapter | null> {
  const bibleData = await getLocalBibleData(language);
  const verses = language === "en"
    ? findChapterInBible(bibleData, bookName, chapterNum)
    : findChapterInBible(bibleData, bookName, chapterNum, JFA_LOCAL_NAME_OVERRIDES);

  if (!verses || verses.length === 0) {
    return null;
  }

  const translatedName = bookTranslations[normaliseBibleKey(bookName)]?.en ?? bookName;

  return {
    bookName: language === "en" ? translatedName : bookName,
    chapterNumber: chapterNum,
    verses: verses.map((text, i) => ({ number: i + 1, text })),
  };
}
