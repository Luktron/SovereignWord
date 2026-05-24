import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, chatHistory, language } = req.body;
  const isEnglish = language === "en";

  if (!process.env.GEMINI_API_KEY) {
    return res.json(
      isEnglish
        ? { text: "Hello! Configure the `GEMINI_API_KEY` environment variable in Vercel to activate the Theological AI.", insight: "Awaiting credentials.", sources: ["Vercel"] }
        : { text: "Olá! Configure a variável `GEMINI_API_KEY` nas variáveis de ambiente da Vercel para ativar o Assessor Teológico.", insight: "Aguardando credenciais.", sources: ["Vercel"] }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = isEnglish
      ? `You are Lumina/Sovereign, a Senior Theological Advisor specializing in Biblical Doctrines under the prophetic lens of Daniel, Revelation, the Sanctuary, the seventh-day Sabbath, and Ellen White's Spirit of Prophecy in the Seventh-day Adventist tradition.
Instructions:
1. Respond in English with academic depth and reverence.
2. Provide Hebrew/Greek insights where applicable.
3. Highlight connections to the Sanctuary and Three Angels' Messages (Rev 14).
4. Conclude with a concise prophetic summary in the 'insight' field.
5. Return biblical references in the 'sources' array.`
      : `Você é Lumina/Sovereign, Assessor Teológico Especialista em Doutrinas Bíblicas sob a lente das profecias de Daniel, Apocalipse, o Santuário, o Sábado do Sétimo Dia, e os escritos do Espírito de Profecia de Ellen White na tradição Adventista do Sétimo Dia.
Instruções:
1. Responda em português com profundidade acadêmica e reverência.
2. Forneça insights do Hebraico/Grego onde aplicável.
3. Destaque conexões com o Santuário e os três anjos de Apocalipse 14.
4. Conclua com um resumo teológico condensado no campo 'insight'.
5. Retorne as referências bíblicas no array 'sources'.`;

    const contentsPayload = chatHistory
      ? [...chatHistory, { role: "user", parts: [{ text: prompt }] }]
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            insight: { type: Type.STRING },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["text", "insight", "sources"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    console.error("Erro no assistente teológico:", err);
    res.status(500).json({ error: "Erro na resposta teológica do servidor" });
  }
}
