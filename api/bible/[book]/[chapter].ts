import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// Preloaded Genesis 1 (JFA) — served without calling AI
const genesisOne = {
  bookName: "Gênesis",
  chapterNumber: 1,
  verses: [
    { number: 1, text: "No princípio, criou Deus os céus e a terra." },
    { number: 2, text: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas." },
    { number: 3, text: "E disse Deus: Haja luz. E houve luz." },
    { number: 4, text: "E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas." },
    { number: 5, text: "E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã: o dia primeiro." },
    { number: 6, text: "E disse Deus: Haja um firmamento no meio das águas, e haja separação entre águas e águas." },
    { number: 7, text: "E fez Deus o firmamento, e separação entre as águas que estavam debaixo do firmamento e as águas que estavam sobre o firmamento. E assim foi." },
    { number: 8, text: "E chamou Deus ao firmamento Céu; e foi a tarde e a manhã: o dia segundo." },
    { number: 9, text: "E disse Deus: Ajuntem-se as águas que estão debaixo dos céus num lugar; e apareça o elemento seco. E assim foi." },
    { number: 10, text: "E chamou Deus ao elemento seco Terra; e ao ajuntamento das águas chamou Mares. E viu Deus que era bom." },
    { number: 11, text: "E disse Deus: Produza a terra erva verde, erva que dê semente, árvore frutífera que dê fruto segundo a sua espécie, cuja semente esteja nela sobre a terra. E assim foi." },
    { number: 12, text: "E a terra produziu erva, erva dando semente conforme a sua espécie, e árvore frutífera cuja semente estava nela, conforme a sua espécie. E viu Deus que era bom." },
    { number: 13, text: "E foi a tarde e a manhã: o dia terceiro." },
    { number: 14, text: "E disse Deus: Haja luminares no firmamento dos céus, para fazerem separação entre o dia e a noite; e sejam eles para sinais, e para tempos determinados, e para dias, e para anos." },
    { number: 15, text: "E sejam para luminares no firmamento dos céus, para darem luz sobre a terra. E assim foi." },
    { number: 16, text: "E fez Deus os dois grandes luminares: o luminar maior para governar o dia, e o luminar menor para governar a noite; e fez as estrelas." },
    { number: 17, text: "E Deus os pôs no firmamento dos céus para darem luz sobre a terra;" },
    { number: 18, text: "E para governarem o dia e a noite, e fazerem separação entre a luz e as trevas. E viu Deus que era bom." },
    { number: 19, text: "E foi a tarde e a manhã: o dia quarto." },
    { number: 20, text: "E disse Deus: Produzam as águas abundantemente répteis de alma vivente; e voem as aves sobre a terra, na face do firmamento dos céus." },
    { number: 21, text: "E criou Deus as grandes baleias, e todo réptil de alma vivente que as águas produziram abundantemente conforme as suas espécies; e toda ave de asa conforme a sua espécie. E viu Deus que era bom." },
    { number: 22, text: "E Deus os abençoou, dizendo: Sede fecundos e multiplicai-vos, e enchei as águas nos mares; e as aves se multipliquem na terra." },
    { number: 23, text: "E foi a tarde e a manhã: o dia quinto." },
    { number: 24, text: "E disse Deus: Produza a terra alma vivente conforme a sua espécie: gado, e répteis, e feras da terra conforme a sua espécie. E assim foi." },
    { number: 25, text: "E fez Deus as feras da terra conforme a sua espécie, e o gado conforme a sua espécie, e todo réptil da terra conforme a sua espécie. E viu Deus que era bom." },
    { number: 26, text: "E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra, e sobre todo réptil que se move sobre a terra." },
    { number: 27, text: "E criou Deus o homem à sua imagem; à imagem de Deus o criou; homem e mulher os criou." },
    { number: 28, text: "E Deus os abençoou, e Deus lhes disse: Sede fecundos e multiplicai-vos, e enchei a terra, e sujeitai-a; e dominai sobre os peixes do mar e sobre as aves dos céus, e sobre todo animal que se move sobre a terra." },
    { number: 29, text: "E disse Deus: Eis que vos tenho dado toda erva que dê semente, que se acha sobre a face de toda a terra, e toda árvore em que há fruto que dê semente; ser-vos-á para mantimento." },
    { number: 30, text: "E a todo animal da terra, e a toda ave dos céus, e a todo réptil da terra em que há alma vivente, toda erva verde ser-lhes-á para mantimento. E assim foi." },
    { number: 31, text: "E viu Deus tudo quanto tinha feito, e eis que era muito bom. E foi a tarde e a manhã: o dia sexto." }
  ]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const book = decodeURIComponent(req.query.book as string);
  const chapter = req.query.chapter as string;
  const lang = req.query.lang as string;
  const chapterNum = parseInt(chapter, 10);

  // Serve preloaded Genesis 1 in Portuguese
  if (book === "Gênesis" && chapterNum === 1 && lang !== "en") {
    return res.json(genesisOne);
  }

  // Serve preloaded Genesis 1 in English (KJV)
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

  if (!process.env.GEMINI_API_KEY) {
    const isEnglish = lang === "en";
    return res.json({
      bookName: isEnglish && book === "Gênesis" ? "Genesis" : book,
      chapterNumber: chapterNum,
      verses: isEnglish
        ? [{ number: 1, text: `[Offline Mode] Chapter ${chapterNum} of ${book}. Set GEMINI_API_KEY in Vercel environment variables to activate the full 66-book Bible.` }]
        : [{ number: 1, text: `[Modo Offline] Capítulo ${chapterNum} de ${book}. Configure a variável GEMINI_API_KEY nas variáveis de ambiente da Vercel para ativar a Bíblia completa.` }]
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
