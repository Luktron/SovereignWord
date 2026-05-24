/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookMetadata, Chapter } from "../types";

export const booksMetadata: BookMetadata[] = [
  // Antigo Testamento
  { id: "genesis", name: "Gênesis", testament: "Old", chaptersCount: 50, category: "Pentateuco" },
  { id: "exodo", name: "Êxodo", testament: "Old", chaptersCount: 40, category: "Pentateuco" },
  { id: "levitico", name: "Levítico", testament: "Old", chaptersCount: 27, category: "Pentateuco" },
  { id: "numeros", name: "Números", testament: "Old", chaptersCount: 36, category: "Pentateuco" },
  { id: "deuteronomio", name: "Deuteronômio", testament: "Old", chaptersCount: 34, category: "Pentateuco" },
  { id: "josue", name: "Josué", testament: "Old", chaptersCount: 24, category: "Históricos" },
  { id: "juizes", name: "Juízes", testament: "Old", chaptersCount: 21, category: "Históricos" },
  { id: "rute", name: "Rute", testament: "Old", chaptersCount: 4, category: "Históricos" },
  { id: "1samuel", name: "1 Samuel", testament: "Old", chaptersCount: 31, category: "Históricos" },
  { id: "2samuel", name: "2 Samuel", testament: "Old", chaptersCount: 24, category: "Históricos" },
  { id: "1reis", name: "1 Reis", testament: "Old", chaptersCount: 22, category: "Históricos" },
  { id: "2reis", name: "2 Reis", testament: "Old", chaptersCount: 25, category: "Históricos" },
  { id: "1cronicas", name: "1 Crônicas", testament: "Old", chaptersCount: 29, category: "Históricos" },
  { id: "2cronicas", name: "2 Crônicas", testament: "Old", chaptersCount: 36, category: "Históricos" },
  { id: "esdras", name: "Esdras", testament: "Old", chaptersCount: 10, category: "Históricos" },
  { id: "neemias", name: "Neemias", testament: "Old", chaptersCount: 13, category: "Históricos" },
  { id: "ester", name: "Ester", testament: "Old", chaptersCount: 10, category: "Históricos" },
  { id: "jo", name: "Jó", testament: "Old", chaptersCount: 42, category: "Poéticos" },
  { id: "salmos", name: "Salmos", testament: "Old", chaptersCount: 150, category: "Poéticos" },
  { id: "proverbios", name: "Provérbios", testament: "Old", chaptersCount: 31, category: "Poéticos" },
  { id: "eclesiastes", name: "Eclesiastes", testament: "Old", chaptersCount: 12, category: "Poéticos" },
  { id: "cantares", name: "Cantares", testament: "Old", chaptersCount: 8, category: "Poéticos" },
  { id: "isaias", name: "Isaías", testament: "Old", chaptersCount: 66, category: "Profetas Maiores" },
  { id: "jeremias", name: "Jeremias", testament: "Old", chaptersCount: 52, category: "Profetas Maiores" },
  { id: "lamentacoes", name: "Lamentações", testament: "Old", chaptersCount: 5, category: "Profetas Maiores" },
  { id: "ezequiel", name: "Ezequiel", testament: "Old", chaptersCount: 48, category: "Profetas Maiores" },
  { id: "daniel", name: "Daniel", testament: "Old", chaptersCount: 12, category: "Profetas Maiores" },
  { id: "oseias", name: "Oséias", testament: "Old", chaptersCount: 14, category: "Profetas Menores" },
  { id: "joel", name: "Joel", testament: "Old", chaptersCount: 3, category: "Profetas Menores" },
  { id: "amos", name: "Amós", testament: "Old", chaptersCount: 9, category: "Profetas Menores" },
  { id: "obadias", name: "Obadias", testament: "Old", chaptersCount: 1, category: "Profetas Menores" },
  { id: "jonas", name: "Jonas", testament: "Old", chaptersCount: 4, category: "Profetas Menores" },
  { id: "miqueias", name: "Miquéias", testament: "Old", chaptersCount: 7, category: "Profetas Menores" },
  { id: "naum", name: "Naum", testament: "Old", chaptersCount: 3, category: "Profetas Menores" },
  { id: "habacuque", name: "Habacuque", testament: "Old", chaptersCount: 3, category: "Profetas Menores" },
  { id: "sofonias", name: "Sofonias", testament: "Old", chaptersCount: 3, category: "Profetas Menores" },
  { id: "ageu", name: "Ageu", testament: "Old", chaptersCount: 2, category: "Profetas Menores" },
  { id: "zacarias", name: "Zacarias", testament: "Old", chaptersCount: 14, category: "Profetas Menores" },
  { id: "malaquias", name: "Malaquias", testament: "Old", chaptersCount: 4, category: "Profetas Menores" },

  // Novo Testamento
  { id: "mateus", name: "Mateus", testament: "New", chaptersCount: 28, category: "Evangelhos" },
  { id: "marcos", name: "Marcos", testament: "New", chaptersCount: 16, category: "Evangelhos" },
  { id: "lucas", name: "Lucas", testament: "New", chaptersCount: 24, category: "Evangelhos" },
  { id: "joao", name: "João", testament: "New", chaptersCount: 21, category: "Evangelhos" },
  { id: "atos", name: "Atos", testament: "New", chaptersCount: 28, category: "Histórico Novo" },
  { id: "romanos", name: "Romanos", testament: "New", chaptersCount: 16, category: "Epístolas" },
  { id: "1corintios", name: "1 Coríntios", testament: "New", chaptersCount: 16, category: "Epístolas" },
  { id: "2corintios", name: "2 Coríntios", testament: "New", chaptersCount: 13, category: "Epístolas" },
  { id: "galatas", name: "Gálatas", testament: "New", chaptersCount: 6, category: "Epístolas" },
  { id: "efesios", name: "Efésios", testament: "New", chaptersCount: 6, category: "Epístolas" },
  { id: "filipenses", name: "Filipenses", testament: "New", chaptersCount: 4, category: "Epístolas" },
  { id: "colossenses", name: "Colossenses", testament: "New", chaptersCount: 4, category: "Epístolas" },
  { id: "1tessalonicenses", name: "1 Tessalonicenses", testament: "New", chaptersCount: 5, category: "Epístolas" },
  { id: "2tessalonicenses", name: "2 Tessalonicenses", testament: "New", chaptersCount: 3, category: "Epístolas" },
  { id: "1timoteu", name: "1 Timóteo", testament: "New", chaptersCount: 6, category: "Epístolas" },
  { id: "2timoteu", name: "2 Timóteo", testament: "New", chaptersCount: 4, category: "Epístolas" },
  { id: "tito", name: "Tito", testament: "New", chaptersCount: 3, category: "Epístolas" },
  { id: "filemon", name: "Filemon", testament: "New", chaptersCount: 1, category: "Epístolas" },
  { id: "hebreus", name: "Hebreus", testament: "New", chaptersCount: 13, category: "Epístolas" },
  { id: "tiago", name: "Tiago", testament: "New", chaptersCount: 5, category: "Epístolas" },
  { id: "1pedro", name: "1 Pedro", testament: "New", chaptersCount: 5, category: "Epístolas" },
  { id: "2pedro", name: "2 Pedro", testament: "New", chaptersCount: 3, category: "Epístolas" },
  { id: "1joao", name: "1 João", testament: "New", chaptersCount: 5, category: "Epístolas" },
  { id: "2joao", name: "2 João", testament: "New", chaptersCount: 1, category: "Epístolas" },
  { id: "3joao", name: "3 João", testament: "New", chaptersCount: 1, category: "Epístolas" },
  { id: "judas", name: "Judas", testament: "New", chaptersCount: 1, category: "Epístolas" },
  { id: "apocalipse", name: "Apocalipse", testament: "New", chaptersCount: 22, category: "Revelação" },
];

export const preloadedChapters: Record<string, Chapter> = {
  "Gênesis_1": {
    bookName: "Gênesis",
    chapterNumber: 1,
    verses: [
      { number: 1, text: "No princípio, criou Deus os céus e a terra." },
      { number: 2, text: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas." },
      { number: 3, text: "E disse Deus: Haja luz. E houve luz." },
      { number: 4, text: "E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas." },
      { number: 5, text: "E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã: o dia primeiro." },
    ]
  },
  "Daniel_2": {
    bookName: "Daniel",
    chapterNumber: 2,
    verses: [
      { number: 31, text: "Tu, ó rei, estavas vendo, e eis aqui uma grande estátua; esta estátua, que era grande e cujo esplendor era excelente, estava em pé diante de ti; e a sua vista era terrível." },
      { number: 32, text: "A cabeça daquela estátua era de ouro fino; o seu peito e os seus braços, de prata; o seu ventre e as suas coxas, de cobre;" },
      { number: 33, text: "As pernas, de ferro; os seus pés, em parte de ferro e em parte de barro." },
      { number: 34, text: "Estavas vendo isto, quando uma pedra foi cortada, sem mão, a qual feriu a estátua nos pés de ferro e de barro e os esmigalhou." },
      { number: 35, text: "Então, foi juntamente esmigalhado o ferro, o barro, o cobre, a prata e o ouro, os quais se fizeram como a pragana das eiras no estio, e o vento os levou, e não se achou lugar algum para eles; mas a pedra que feriu a estátua se fez um grande monte e encheu toda a terra." },
      { number: 36, text: "Este é o sonho; também a sua interpretação diremos perante o rei." },
    ]
  },
  "João_14": {
    bookName: "João",
    chapterNumber: 14,
    verses: [
      { number: 1, text: "Não se turbe o vosso coração; credes em Deus, crede também em mim." },
      { number: 2, text: "Na casa de meu Pai há muitas moradas; se não fora assim, eu vo-lo teria dito, pois vou preparar-vos lugar." },
      { number: 3, text: "E, se eu for e vos preparar lugar, virei outra vez e vos levarei para mim mesmo, para que, onde eu estiver, estejais vós também." },
      { number: 4, text: "Mesmo vós sabeis para onde vou e conheceis o caminho." },
      { number: 5, text: "Disse-lhe Tomé: Senhor, nós não sabemos para onde vais e como podemos saber o caminho?" },
      { number: 6, text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim." },
    ]
  },
  "Romanos_8": {
    bookName: "Romanos",
    chapterNumber: 8,
    verses: [
      { number: 1, text: "Portanto, agora nenhuma condenação há para os que estão em Cristo Jesus, que não andam segundo a carne, mas segundo o Espírito." },
      { number: 2, text: "Porque a lei do Espírito de vida, em Cristo Jesus, me livrou da lei do pecado e da morte." },
      { number: 3, text: "Porquanto o que era impossível à lei, visto como estava enferma pela carne, Deus, enviando o seu Filho em semelhança da carne do pecado, pelo pecado condenou o pecado na carne;" },
      { number: 4, text: "Para que a justiça da lei se cumprisse em nós, que não andamos segundo a carne, mas segundo o Espírito." },
      { number: 5, text: "Porque os que são segundo a carne inclinam-se para as coisas da carne; mas os que são segundo o Espírito, para as coisas do Espírito." },
    ]
  },
  "Apocalipse_12": {
    bookName: "Apocalipse",
    chapterNumber: 12,
    verses: [
      { number: 1, text: "E viu-se um grande sinal no céu: uma mulher vestida do sol, tendo a lua debaixo dos seus pés, e uma coroa de doze estrelas sobre a sua cabeça." },
      { number: 2, text: "E estava grávida e gritava com dores de parto, com ânsias de dar à luz." },
      { number: 3, text: "E viu-se outro sinal no céu; e eis que era um grande dragão vermelho, que tinha sete cabeças e dez chifres e, sobre as suas cabeças, sete diademas." },
      { number: 17, text: "E o dragão irou-se contra a mulher e foi fazer guerra ao resto da sua semente, os que guardam os mandamentos de Deus e têm o testemunho de Jesus Cristo." },
    ]
  }
};
