/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  streak: number;
  streakHistory: boolean[]; // last 7 days starting Sunday
  xp: number;
  level: number;
  chaptersReadCount: number;
  versesReadCount: number;
  studiesCompletedCount: number;
  minutesRead: number;
}

export interface Verse {
  number: number;
  text: string;
  highlighted?: string; // hex color or falsey
  note?: string;
  favorite?: boolean;
}

export interface Chapter {
  bookName: string;
  chapterNumber: number;
  verses: Verse[];
}

export interface BookMetadata {
  id: string;
  name: string;
  testament: "Old" | "New";
  chaptersCount: number;
  category: string; // "Pentateuco", "Históricos", "Poéticos", "Profetas Maiores", "Profetas Menores", "Evangelhos", "Histórico Novo", "Epístolas", "Revelação"
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  totalChapters: number;
  chaptersCompleted: string[]; // formatted like "Gênesis 1", "Daniel 2"
  streak: number;
}

export interface Sermon {
  id: string;
  title: string;
  scripture: string;
  theme: string;
  style: string;
  tone: string;
  introduction: string;
  historicalContext: string;
  points: { title: string; text: string; details?: string }[];
  applications: string[];
  illustrations?: string[];
  conclusion: string;
  appeal: string;
  closingPrayerDraft?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: string[]; // References cited
  insight?: string;   // Teological insights
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface BibleStudy {
  id: string;
  title: string;
  category: "doutrina" | "profecia" | "discipulado" | "saude" | "familia";
  status: "locked" | "available" | "completed";
  questions: {
    id: string;
    question: string;
    choices: string[];
    answerIndex: number;
    explanation: string;
  }[];
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AppState {
  user: UserProfile;
  activePlanId: string;
  plans: ReadingPlan[];
  favorites: { book: string; chapter: number; verse: number; text: string }[];
  notes: { book: string; chapter: number; verse: number; note: string; text: string }[];
  sermons: Sermon[];
  studies: BibleStudy[];
  badges: Badge[];
  activeView: "dashboard" | "bible" | "theology" | "sermons" | "studies" | "profile";
}
