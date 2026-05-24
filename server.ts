/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import http from "http";
import os from "os";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { getDatabase, saveDatabase } from "./server/db";
import { preloadedChapters, booksMetadata } from "./src/data/bibleData";
import { AppState, Sermon } from "./src/types";

dotenv.config();

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 5990;

  // Detectar IP da rede local
  const getNetworkIP = (): string => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const alias of iface ?? []) {
        if (alias.family === "IPv4" && !alias.internal) return alias.address;
      }
    }
    return "localhost";
  };

  // Criar servidor HTTP antes do Vite para compartilhar a conexão HMR
  const httpServer = http.createServer(app);

  app.use(express.json());

  // API Route - Get Entire DB
  app.get("/api/db", (req, res) => {
    try {
      const db = getDatabase();
      res.json(db);
    } catch (err) {
      res.status(500).json({ error: "Erro ao carregar o banco de dados" });
    }
  });

  // API Route - Save/Update DB
  app.post("/api/db/save", (req, res) => {
    try {
      const updatedData = req.body as AppState;
      saveDatabase(updatedData);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Erro ao salvar o banco de dados" });
    }
  });

  // API Route - Dynamic Bible Chapter Loader (João Ferreira de Almeida)
  app.get("/api/bible/:book/:chapter", async (req, res) => {
    const { book, chapter } = req.params;
    const { lang } = req.query; // pt or en
    const chapterNum = parseInt(chapter, 10);
    const key = `${book}_${chapter}`;

    // 1. Check if we have preloaded verses locally (for Gênesis 1 index)
    if (preloadedChapters[key] && lang !== "en") {
      return res.json(preloadedChapters[key]);
    }

    // Special KJV preloaded fallback for Genesis 1 block in English
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

    // 2. Otherwise trigger our theological translator in JFA or KJV based on lang
    try {
      if (!process.env.GEMINI_API_KEY) {
        // Mock fallback if key is not configured yet
        if (lang === "en") {
          return res.json({
            bookName: book === "Gênesis" ? "Genesis" : book,
            chapterNumber: chapterNum,
            verses: [
              { number: 1, text: `[Offline Mode / No AI Key] In the beginning of chapter ${chapterNum} of ${book}...` },
              { number: 2, text: `Please configure your API key inside Secrets configuration to activate full 66-book Bible indexing in King James Version!` }
            ]
          });
        }
        return res.json({
          bookName: book,
          chapterNumber: chapterNum,
          verses: [
            { number: 1, text: `[Modo Offline/Sem Chave AI] No princípio do capítulo ${chapterNum} de ${book}...` },
            { number: 2, text: `Por favor, ative a sua chave de API nos Secrets para desbloquear a Bíblia JFA completa de 66 livros!` }
          ]
        });
      }

      console.log(`Buscando ${book} ${chapterNum} via inteligência artificial (${lang})...`);
      const targetVersion = lang === "en" ? "King James Version (KJV) Bible translation" : "língua portuguesa João Ferreira de Almeida (JFA)";
      const systemInstruction = lang === "en"
        ? "You are an expert Bible translator. Your objective is to return the exact verses matching the classic King James Version (KJV)."
        : "Você é um tradutor bíblico especializado na tradução clássica João Ferreira de Almeida (Almeida Revista e Corrigida ou Atualizada). Seu objetivo é retornar estritamente a fidelidade dos versículos oficiais da Bíblia JFA.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
          systemInstruction: systemInstruction
        }
      });

      const textOutput = response.text || "[]";
      const verses = JSON.parse(textOutput);

      res.json({
        bookName: book === "Gênesis" && lang === "en" ? "Genesis" : book,
        chapterNumber: chapterNum,
        verses: verses
      });
    } catch (err) {
      console.error("Erro AI Bible:", err);
      res.status(500).json({ error: "Erro ao carregar capitulo de forma dinâmica." });
    }
  });

  // API Route - Adventist Theological Assistant (RAG context & expert)
  app.post("/api/theology/ask", async (req, res) => {
    const { prompt, chatHistory, language } = req.body;
    const isEnglish = language === "en";

    try {
      if (!process.env.GEMINI_API_KEY) {
        if (isEnglish) {
          return res.json({
            text: "Hello! The Theological AI has no API key configured. Please set the 'GEMINI_API_KEY' variable in the Secrets tab in AI Studio to permit Lumina Advisor to deliver personalized guidance from Sabbath School lessons, earthly sanctuary, and Spirit of Prophecy with active theological RAG!",
            insight: "Theological Companion waiting for credentials.",
            sources: ["Local Server"]
          });
        }
        return res.json({
          text: "Olá! A inteligência artificial ainda não possui uma chave de API configurada. Defina a variável 'GEMINI_API_KEY' na aba Secrets do AI Studio para que o seu Assessor Teológico te apresente estudos baseados nas lições, profecias de Daniel, Apocalipse e Espírito de Profecia com RAG!",
          insight: "Sistema Teológico aguardando credenciais.",
          sources: ["Servidor Local"]
        });
      }

      // Convert chatHistory if present
      const contentsPayload = chatHistory ? [...chatHistory, { role: "user", parts: [{ text: prompt }] }] : prompt;

      const systemInstructionChat = isEnglish
        ? `You are Lumina/Sovereign, a Senior Software Architect, Full Stack Engineer, and Expert Theological Advisor specializing in Biblical Doctrines and Christian Educational Platforms. You teach under the prophetic theological lens of Daniel, Revelation, the earthly Sanctuary, the seventh-day Sabbath, and the inspired writings of Spirit of Prophecy by Ellen White in the Seventh-day Adventist tradition.

Important instructions:
1. Respond clearly, with high reverence, exegesis, and academic depth. Write fully in English.
2. Provide Hebrew and Greek language insights where applicable.
3. Highlight connections to the earthly Sanctuary and Three Angels' Messages of Revelation 14.
4. Conclude your response with a concise prophetic summary inside the 'insight' sentence field.
5. Return bible or historical references in the 'sources' array field.`
        : `Você é Lumina/Sovereign, um Arquiteto de Software Sênior, Engenheiro Full Stack e Assessor Teológico Especialista em Doutrinas Bíblicas e Plataformas Cristãs Educacionais. Você atua sob a lente teológica das profecias de Daniel, Apocalipse, o Santuário, o Sábado bíblico do Sétimo dia, e os escritos inspirados do Espírito de Profecia de Ellen White na tradição Adventista do Sétimo Dia.

Instruções fundamentais:
1. Responda em língua portuguesa de forma clara, altamente respeitosa, exegética e acadêmica, fornecendo dados linguísticos do Hebraico e Grego se aplicável.
2. Destaque conexões com o Santuário e os três anjos de Apocalipse 14.
3. Apresente ao final de sua resposta um sumário teológico condensado (no campo 'Lumina Insight').
4. Retorne as fontes e os textos bíblicos consultados como referências de rodapé.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsPayload,
        config: {
          systemInstruction: systemInstructionChat,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "A resposta teológica principal formatada em Markdown elegante." },
              insight: { type: Type.STRING, description: "Um resumo conciso de uma frase representando o Lumina Insight profético de destaque." },
              sources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Fontes bíblicas e históricas consultadas (ex: Daniel 2:31-45, Grande Conflito cap. 12)"
              }
            },
            required: ["text", "insight", "sources"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text || "{}");
      res.json(parsedResult);
    } catch (err) {
      console.error("Erro no assistente teológico:", err);
      res.status(500).json({ error: "Erro na resposta teológica do servidor" });
    }
  });

  // API Route - Homiletic Sermon generator/outline
  app.post("/api/sermon/generate", async (req, res) => {
    const { scripture, theme, style, tone, language } = req.body;
    const isEnglish = language === "en";

    try {
      if (!process.env.GEMINI_API_KEY) {
        if (isEnglish) {
          return res.json({
            title: theme || "Message of Faith",
            scripture: scripture || "Psalm 23",
            theme: theme || "Trust in God",
            style: style || "Expository",
            tone: tone || "Pastoral",
            introduction: "Practical introduction on the comforting oversight of the Shepherd.",
            historicalContext: "The ancient arid geographical context of Palestinian pasture fields.",
            points: [
              { title: "1. The Covenant Shepherd", text: "Theological analysis of the Lord as our covenant keeper.", details: "Focus on Biblical Hebrew 'Yahweh Raah'." },
              { title: "2. He Restores the Soul", text: "How His saving grace restores our moral vigor.", details: "Practical applications on Sabbath rest." }
            ],
            applications: ["Entrust your deep professional or personal concerns to God.", "Rest securely under His shepherd rod."],
            illustrations: ["A parable about a wild sheep returning to the sheepfold on cold nights."],
            conclusion: "Summary of eternal hope found in our Great Shepherd Care.",
            appeal: "Appeal the congregation to rededicate their moral choices to Jesus today.",
            closingPrayerDraft: "Merciful Father, bless and restore your flock in every deep valley. In Jesus' name, Amen."
          });
        }
        return res.json({
          title: theme || "Mensagem de Fé",
          scripture: scripture || "Salmo 23",
          theme: theme || "Confiança em Deus",
          style: style || "Expositivo",
          tone: tone || "Pastoral",
          introduction: "Exemplo Prático: Introdução baseada em confiar no Pastor.",
          historicalContext: "O contexto histórico dos vales áridos da Palestina.",
          points: [
            { title: "1. O Pastor é Deus", text: "Explicação teológica sobre o Senhor ser o nosso pastor espiritual.", details: "Foco no hebraico 'Yahweh Raah'." },
            { title: "2. Ele nos Guia e Conforta", text: "Ele nos guia pelas veredas da justiça por causa da Sua graça.", details: "Foco prático." }
          ],
          applications: ["Permitir que Deus conduza suas decisões.", "Abandonar a autossuficiência e repousar em Seus pastos verdejantes."],
          illustrations: ["A ovelha desgarrada que confia na voz e no caiado protetor do pastor de ovelhas na montanha."],
          conclusion: "Resumo final sobre a segurança espiritual de pertencer ao Supremo Pastor.",
          appeal: "Convidar cada crente a renovar sua entrega ao Divino Pastor no dia de hoje.",
          closingPrayerDraft: "Querido Deus e Pai, que Teu povo sinta o calor do Teu cuidado no vale escuro. Em nome de Jesus, Amém."
        });
      }

      const promptCommand = isEnglish
        ? `Develop a highly structured, fully worked-out homiletical sermon outline based on:
Scripture Passage: ${scripture}
Central Theme: ${theme}
Sermon Style: ${style}
Pulpit Tone: ${tone}

Your sermon outline must present robust biblical exegesis and be aligned with Seventh-Day Adventist sanctuary and Seventh-Day Sabbath principles. Write it fully in English.`
        : `Desenvolva um esboço homilético de sermão completo e estruturado baseado nos seguintes dados:
Passagem Bíblica de Interesse: ${scripture}
Tema Central: ${theme}
Estilo de Pregação: ${style}
Tom do Púlpito: ${tone}

O esboço homilético deve herdar uma profunda exegese bíblica alinhada com as verdades eternas e o Espírito de Profecia.`;

      const systemInstructionSermon = isEnglish
        ? "You are an experienced Adventist Homiletician, Professor, and pulpit preacher. Your outlines combine deep exegesis, linguistic word studies (Hebrew/Greek), and moving illustrations with practical salvation appeals. Generate the complete sermon draft strictly structured into the specified JSON response schema, written fully in English."
        : "Você é um mestre Homileta e Orador teológico adventista altamente experiente. Suas pregações são famosas por equilibrar teologia acadêmica, exegese linguística (hebraico/grego) e ilustrações tocantes com foco prático de apelo de salvação. Gere o sermão de forma extremamente organizada no seguinte esquema de resposta do JSON:";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptCommand,
        config: {
          systemInstruction: systemInstructionSermon,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título impactante da pregação" },
              scripture: { type: Type.STRING },
              theme: { type: Type.STRING },
              style: { type: Type.STRING },
              tone: { type: Type.STRING },
              introduction: { type: Type.STRING, description: "Introdução cativante que prende o público nos primeiros minutos" },
              historicalContext: { type: Type.STRING, description: "O contexto bíblico, cultural e linguístico do texto original" },
              points: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Frase de impacto representando o ponto espiritual" },
                    text: { type: Type.STRING, description: "Explicação profunda bíblia" },
                    details: { type: Type.STRING, description: "Insight detalhado linguítico ou do Espírito de Profecia" }
                  },
                  required: ["title", "text"]
                }
              },
              applications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Como a congregação deve aplicar este ensinamento na prática nesta semana"
              },
              illustrations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Pequena e tocante história ilustrativa, parábola ou testemunho que reforce os sentimentos do tema"
              },
              conclusion: { type: Type.STRING, description: "Sumarização magistral das lições divinas" },
              appeal: { type: Type.STRING, description: "O convite espiritual definitivo para os ouvintes tomarem uma decisão de vida ao lado de Cristo" },
              closingPrayerDraft: { type: Type.STRING, description: "Esboço de oração pastoral escrita para fechar o sermão de forma tocante" }
            },
            required: ["title", "scripture", "theme", "style", "tone", "introduction", "historicalContext", "points", "applications", "conclusion", "appeal", "closingPrayerDraft"]
          }
        }
      });

      const parsedSermonResult = JSON.parse(response.text || "{}");
      res.json(parsedSermonResult);

    } catch (err) {
      console.error("Erro ao gerar pregação homilética:", err);
      res.status(500).json({ error: "Erro ao sintetizar esboço de sermão" });
    }
  });

  // Vite + Static Serving Pipeline
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    const networkIP = getNetworkIP();
    console.log("");
    console.log(`  \x1b[32m\u279C\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
    console.log(`  \x1b[32m\u279C\x1b[0m  \x1b[1mNetwork:\x1b[0m http://${networkIP}:${PORT}/`);
    console.log("");
    httpServer.ref();
  });

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Porta ${PORT} já está em uso. Encerre o processo anterior e tente novamente.`);
      process.exit(1);
    } else {
      console.error("Erro no servidor (não fatal):", err.code, err.message);
    }
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("Erro não tratado (unhandledRejection):", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Exceção não capturada:", err);
});

startServer();
