/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { AppState, UserProfile, ReadingPlan, BibleStudy, Badge, Sermon } from "../src/types";

const DB_FILE = path.join(process.cwd(), "db.json");

const initialUser: UserProfile = {
  id: "elias-1",
  name: "Luciano Clemente",
  email: "nft647@gmail.com",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiEN_gD_X66wAdhf5i5w7XNBx2QEqtpCJXIlo8INNYbR9p1DnO0Z6pFuL1Z4Gfemtuo1IGPNedwlNYhlWWQbssaINyk5u_K-SdbTMj1eCwlpFKK5peV-LLLm1M0RHQxG9eHT2-62BFUaMez16vHSeEfoNoh1IOZIL296x79v3Wh9kZeACbc-ZldBKlqkaYCSIW_HsedbMlTctgpn_5LFFNdvvxjj-mtMOd_o4mjox8u_W_comWdVaujp0HNmfPSKI4F0FxpXTkl8gf",
  streak: 14,
  streakHistory: [true, true, true, true, true, true, false], // Sun to Sat
  xp: 1240,
  level: 5,
  chaptersReadCount: 42,
  versesReadCount: 840,
  studiesCompletedCount: 3,
  minutesRead: 185
};

const initialPlans: ReadingPlan[] = [
  {
    id: "gospel-john",
    title: "Evangelho de João",
    description: "Conheça a divindade e o amor de Cristo relatados pelo discípulo amado.",
    durationDays: 21,
    totalChapters: 21,
    chaptersCompleted: Array.from({ length: 14 }, (_, i) => `João ${i + 1}`), // 14 out of 21 = 67%
    streak: 14
  },
  {
    id: "daniel-apocalypse",
    title: "Profecias de Daniel e Apocalipse",
    description: "Plano focado nas revelações proféticas fundamentais do adventismo.",
    durationDays: 34,
    totalChapters: 34,
    chaptersCompleted: ["Daniel 1", "Daniel 2"],
    streak: 2
  },
  {
    id: "annual-bible",
    title: "Bíblia em 365 Dias",
    description: "Leitura anual completa englobando o Antigo e Novo Testamento equilibradamente.",
    durationDays: 365,
    totalChapters: 1189,
    chaptersCompleted: ["Gênesis 1", "Gênesis 2"],
    streak: 5
  }
];

const initialStudies: BibleStudy[] = [
  {
    id: "doctrine-1",
    title: "O Selo de Deus e a Lei",
    category: "doutrina",
    status: "available",
    xpReward: 150,
    questions: [
      {
        id: "q_law_1",
        question: "Qual o dia santificado no quarto mandamento da Lei de Deus (Êxodo 20)?",
        choices: ["Domingo", "Sábado", "Quarta-feira", "Sexta-feira"],
        answerIndex: 1,
        explanation: "O quarto mandamento declara expressamente: 'Mas o sétimo dia é o sábado do Senhor teu Deus; não farás nenhuma obra'."
      },
      {
        id: "q_law_2",
        question: "De acordo com Tiago 2:10, que acontece se tropeçarmos em um só ponto da lei?",
        choices: [
          "Ainda estamos seguros",
          "Tornamo-nos culpados de todos",
          "Deus ignora o erro",
          "Precisamos cumprir mais ordens"
        ],
        answerIndex: 1,
        explanation: "Tiago ensina que a Lei de Deus é um todo perfeito; infringir uma das partes é quebrar a unidade de Sua santa vontade."
      }
    ]
  },
  {
    id: "prophecy-2",
    title: "Daniel 2: Os Metais da Estátua",
    category: "profecia",
    status: "available",
    xpReward: 200,
    questions: [
      {
        id: "q_dan_1",
        question: "O que representa a cabeça de ouro na grande estátua de Daniel 2?",
        choices: ["O Império Romano", "A Grécia de Alexandre", "O Império Babiloniar", "A Medo-Pérsia"],
        answerIndex: 2,
        explanation: "Daniel disse diretamente ao rei Nabucodonosor: 'Tu és a cabeça de ouro', referindo-se ao glorioso Império de Babilônia."
      },
      {
        id: "q_dan_2",
        question: "O que representa a pedra cortada sem o auxílio de mãos humanas?",
        choices: ["O surgimento de um novo império humano", "O reino eterno de Deus e a segunda vinda", "A destruição de Jerusalém", "A queda da reforma protestante"],
        answerIndex: 1,
        explanation: "A pedra esmigalha todos os reinos terrenos e cresce até preencher a terra toda, profetizando o estabelecimento definitivo do Reino de Deus."
      }
    ]
  },
  {
    id: "health-3",
    title: "O Templo do Espírito Santo",
    category: "saude",
    status: "available",
    xpReward: 120,
    questions: [
      {
        id: "q_health_1",
        question: "Onde a Bíblia afirma que nosso corpo é o templo do Espírito Santo?",
        choices: ["1 Coríntios 6:19", "Gênesis 9:3", "Apocalipse 14:1", "Isaías 66:1"],
        answerIndex: 0,
        explanation: "Paulo afirma em 1 Coríntios 6:19 que nosso corpo é morada do Espírito de Deus, chamando-nos ao cuidado físico e moral."
      }
    ]
  }
];

const initialBadges: Badge[] = [
  { id: "badge-1", name: "Primeiro Passo", description: "Iniciou o plano de leitura anual", icon: "book_open", unlocked: true, unlockedAt: new Date().toISOString() },
  { id: "badge-2", name: "Chapa de Ferro", description: "Manteve o streak diário por 14 dias", icon: "flame", unlocked: true, unlockedAt: new Date().toISOString() },
  { id: "badge-3", name: "Arqueólogo Bíblico", description: "Concluiu o estudo da estátua de Daniel 2", icon: "compass", unlocked: false },
  { id: "badge-4", name: "Baluarte Teológico", description: "Efetuou 15 consultas avançadas com a IA", icon: "brain", unlocked: false },
  { id: "badge-5", name: "Mensageiro do Púlpito", description: "Gerou o seu primeiro esboço de sermão teológico", icon: "mic", unlocked: false }
];

const initialSermons: Sermon[] = [
  {
    id: "s_1",
    title: "A Soberania da Graça",
    scripture: "Romanos 8:1-4",
    theme: "Sem Condenação em Cristo Jesus",
    style: "Expositivo",
    tone: "Pastoral",
    introduction: "Introduzir a dicotomia do homem afligido pela lei em Romanos 7 e o alívio majestoso da vida no Espírito em Romanos 8.",
    historicalContext: "Escrita sob o contexto da igreja mista de Roma, onde judeus e gentios frequentemente divergiam sobre exigências legais e a justificação pela fé de Cristo.",
    points: [
      { title: "No Condenação", text: "Estudo analítico do termo grego 'Katakrima', denotando que a sentença merecida foi completamente cumprida em Cristo.", details: "A absolvição não é uma vista grossa divina, e sim a concretização jurídica da justiça consumada." },
      { title: "A Lei do Espírito de Vida", text: "A nova dinâmica interna do crente. O Espírito dota o crente de poder para viver em amor e harmonia, superando as debilidades da carne.", details: "Destaque para o vocábulo 'pneuma' no grego neotestamentário." }
    ],
    applications: ["Identificar áreas da nossa caminhada diária sob as quais ainda vivemos auto-condenados.", "Abraçar o poder capacitador de Deus para obedecer Seus caminhos."],
    illustrations: ["O réu perdoado que insiste em morar na cela fria mesmo sob os raios dourados de sol do pátio público livre."],
    conclusion: "Resumo da caminhada em Cristo. A liberdade espiritual nos conduz a uma obediência repleta de amor e paz profunda.",
    appeal: "Convocar quem se sente atolado pela culpa a submeter-se hoje mesmo ao toque reabilitador de Cristo Jesus.",
    closingPrayerDraft: "Senhor Deus Todo-Poderoso, agradecemos-Te pois nenhuma condenação resta para os teus cravados na videira verdadeira. Que Teu Santo Espírito permeie as mentes de Teus filhos hoje...",
    createdAt: new Date().toISOString()
  }
];

export function getDatabase(): AppState {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData: AppState = {
      user: initialUser,
      activePlanId: "gospel-john",
      plans: initialPlans,
      favorites: [
        { book: "Romanos", chapter: 8, verse: 3, text: "And God said, “Let there be light,” and there was light." }
      ],
      notes: [
        { book: "João", chapter: 14, verse: 6, note: "Ponto fundamental da exclusividade salvífica de Cristo Jesus.", text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim." }
      ],
      sermons: initialSermons,
      studies: initialStudies,
      badges: initialBadges,
      activeView: "dashboard"
    };
    saveDatabase(defaultData);
    return defaultData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content) as AppState;
  } catch (err) {
    console.error("Erro ao ler DB, reescrevendo padrão:", err);
    const defaultData: AppState = {
      user: initialUser,
      activePlanId: "gospel-john",
      plans: initialPlans,
      favorites: [],
      notes: [],
      sermons: initialSermons,
      studies: initialStudies,
      badges: initialBadges,
      activeView: "dashboard"
    };
    saveDatabase(defaultData);
    return defaultData;
  }
}

export function saveDatabase(data: AppState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar no arquivo DB:", err);
  }
}
