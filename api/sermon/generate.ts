import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { scripture, theme, style, tone, language } = req.body;
  const isEnglish = language === "en";

  if (!process.env.GEMINI_API_KEY) {
    return res.json(
      isEnglish
        ? {
            title: theme || "Message of Faith",
            scripture: scripture || "Psalm 23",
            theme: theme || "Trust in God",
            style: style || "Expository",
            tone: tone || "Pastoral",
            introduction: "Configure GEMINI_API_KEY in Vercel environment variables to generate AI sermons.",
            historicalContext: "API key not configured.",
            points: [{ title: "1. Configure the API", text: "Set GEMINI_API_KEY in Vercel dashboard → Settings → Environment Variables." }],
            applications: ["Configure the API key to unlock full sermon generation."],
            conclusion: "API key required.",
            appeal: "Please configure the environment variable.",
            closingPrayerDraft: "Lord, guide this setup. Amen."
          }
        : {
            title: theme || "Mensagem de Fé",
            scripture: scripture || "Salmo 23",
            theme: theme || "Confiança em Deus",
            style: style || "Expositivo",
            tone: tone || "Pastoral",
            introduction: "Configure a variável GEMINI_API_KEY nas variáveis de ambiente da Vercel para gerar sermões com IA.",
            historicalContext: "Chave de API não configurada.",
            points: [{ title: "1. Configure a API", text: "Acesse o painel da Vercel → Settings → Environment Variables e adicione GEMINI_API_KEY." }],
            applications: ["Configure a chave de API para desbloquear a geração completa de sermões."],
            conclusion: "Chave de API necessária.",
            appeal: "Por favor, configure a variável de ambiente.",
            closingPrayerDraft: "Senhor, guia esta configuração. Em nome de Jesus, Amém."
          }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = isEnglish
      ? "You are an experienced Adventist Homiletician and pulpit preacher. Generate a fully structured sermon outline in English combining deep exegesis, linguistic word studies (Hebrew/Greek), and practical salvation appeals."
      : "Você é um mestre Homileta e Orador teológico adventista altamente experiente. Gere o sermão de forma extremamente organizada no esquema JSON especificado, em língua portuguesa.";

    const promptCommand = isEnglish
      ? `Develop a highly structured homiletical sermon outline based on:
Scripture: ${scripture}
Theme: ${theme}
Style: ${style}
Tone: ${tone}
Align with Seventh-Day Adventist sanctuary and Sabbath principles. Write fully in English.`
      : `Desenvolva um esboço homilético de sermão completo baseado em:
Passagem Bíblica: ${scripture}
Tema: ${theme}
Estilo: ${style}
Tom: ${tone}
Herdar profunda exegese bíblica alinhada com o Espírito de Profecia.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptCommand,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scripture: { type: Type.STRING },
            theme: { type: Type.STRING },
            style: { type: Type.STRING },
            tone: { type: Type.STRING },
            introduction: { type: Type.STRING },
            historicalContext: { type: Type.STRING },
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                  details: { type: Type.STRING }
                },
                required: ["title", "text"]
              }
            },
            applications: { type: Type.ARRAY, items: { type: Type.STRING } },
            illustrations: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusion: { type: Type.STRING },
            appeal: { type: Type.STRING },
            closingPrayerDraft: { type: Type.STRING }
          },
          required: ["title", "scripture", "theme", "style", "tone", "introduction", "historicalContext", "points", "applications", "conclusion", "appeal", "closingPrayerDraft"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    console.error("Erro ao gerar pregação:", err);
    res.status(500).json({ error: "Erro ao sintetizar esboço de sermão" });
  }
}
