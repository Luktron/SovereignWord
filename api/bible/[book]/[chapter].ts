import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// ── JFA Bible (Almeida Atualizada) loaded from local JSON ──────────────────
interface JfaBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

let jfaBible: JfaBook[] | null = null;

function getJfaBible(): JfaBook[] {
  if (jfaBible) return jfaBible;
  // process.cwd() is the project root in both local (tsx) and Vercel environments
  const filePath = path.join(process.cwd(), "api", "bible-jfa.json");
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, ""); // strip BOM
  jfaBible = JSON.parse(raw) as JfaBook[];
  return jfaBible;
}

// Normalise accents/punctuation for fuzzy matching
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

// App uses slightly different names for a few books — map them here
const NAME_OVERRIDES: Record<string, string> = {
  cantares: "canticos",
  lamentacoes: "lamentacoes de jeremias",
  filemon: "filemom",
};

function findJfaChapter(bookName: string, chapterNum: number): string[] | null {
  const bible = getJfaBible();
  const normInput = normalise(bookName);
  const key = NAME_OVERRIDES[normInput] ?? normInput;

  const book = bible.find((b) => normalise(b.name) === key);
  if (!book) return null;

  const chapter = book.chapters[chapterNum - 1];
  return chapter ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const book = decodeURIComponent(req.query.book as string);
  const chapter = req.query.chapter as string;
  const lang = req.query.lang as string;
  const chapterNum = parseInt(chapter, 10);

  // ── Portuguese: serve directly from local JFA JSON (no API key needed) ──
  if (lang !== "en") {
    try {
      const verses = findJfaChapter(book, chapterNum);
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

  // ── English: Genesis 1 KJV preloaded, others via AI ──────────────────────
  if (book === "Gênesis" && chapterNum === 1 && lang === "en") {
    return res.json({
      bookName: "Genesis",
      chapterNumber: 1,
      verses: [
        { number: 1, text: "In the beginning God created the heaven and the earth." },
        { number: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
        { number: 3, text: "And God said, Let there be light: and there was light." },
        { number: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
        { number: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
        { number: 6, text: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters." }
      ]
    });
  }

  // English path only — AI key required for KJV
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      bookName: book === "Gênesis" ? "Genesis" : book,
      chapterNumber: chapterNum,
      verses: [{ number: 1, text: `[Offline Mode/No AI Key] Chapter ${chapterNum} of ${book}. Please set GEMINI_API_KEY to activate the full KJV Bible in English.` }],
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const isEnglish = lang === "en";
    const targetVersion = isEnglish
      ? "King James Version (KJV) Bible translation"
      : "língua portuguesa João Ferreira de Almeida (JFA)";
    const systemInstruction = isEnglish
      ? "You are an expert Bible translator. Your objective is to return the exact verses matching the classic King James Version (KJV)."
      : "Você é um tradutor bíblico especializado na tradução clássica João Ferreira de Almeida (Almeida Revista e Corrigida ou Atualizada). Seu objetivo é retornar estritamente a fidelidade dos versículos oficiais da Bíblia JFA.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Gere os versículos exatos do capítulo ${chapterNum} do livro de ${book} na versão de tradução ${targetVersion}. Apenas retorne um array JSON válido de objetos com os campos "number" (número do versículo) e "text" (texto do versículo de forma fidedigna). Não insira notas, cabeçalhos nem conversa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.INTEGER },
              text: { type: Type.STRING }
            },
            required: ["number", "text"]
          }
        },
        systemInstruction
      }
    });

    const verses = JSON.parse(response.text || "[]");
    res.json({
      bookName: isEnglish && book === "Gênesis" ? "Genesis" : book,
      chapterNumber: chapterNum,
      verses
    });
  } catch (err) {
    console.error("Erro AI Bible:", err);
    res.status(500).json({ error: "Erro ao carregar capítulo de forma dinâmica." });
  }
}
