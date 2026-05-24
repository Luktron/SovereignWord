/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Flame, Play, ArrowRight, BookMarked, MessageSquare, Library, Heart } from "lucide-react";
import { AppState } from "../types";
import { translations, getTranslatedPlan } from "../data/translations";

interface DashboardProps {
  state: AppState;
  language: "pt" | "en";
  onNavigate: (view: AppState["activeView"]) => void;
  onNavigateToChapter: (book: string, chapter: number) => void;
}

export default function SpiritualDashboard({ state, language, onNavigate, onNavigateToChapter }: DashboardProps) {
  const user = state.user;
  const activePlan = state.plans.find(p => p.id === state.activePlanId) || state.plans[0];
  const percentComplete = Math.round((activePlan.chaptersCompleted.length / activePlan.totalChapters) * 100);

  const t = translations[language];

  // Map localized dynamic sermon items
  const recommendedSermons = [
    {
      title: t.dashboard.sermonTitles.sovereignty,
      preacher: t.dashboard.preachers.begg,
      duration: "42:15",
      imgUrl: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: t.dashboard.sermonTitles.walking,
      preacher: t.dashboard.preachers.piper,
      duration: "38:40",
      imgUrl: "https://images.unsplash.com/photo-1507421300808-c55f28b1db2d?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: t.dashboard.sermonTitles.peace,
      preacher: t.dashboard.preachers.keller,
      duration: "51:22",
      imgUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600"
    }
  ];

  // Active plan localized title/description
  const planInfo = getTranslatedPlan(activePlan.id, activePlan.title, activePlan.description, language);

  return (
    <div className="space-y-10 text-black dark:text-white">
      {/* Welcome Greeting */}
      <div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-black dark:text-white transition-colors">
          {t.dashboard.grace.replace("{name}", user.name)}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-2 font-light">
          {t.dashboard.devotionReady}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Daily Verse Card */}
        <div className="md:col-span-8 p-8 md:p-10 rounded-2xl bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[360px] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="relative z-10">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-[0.15em] uppercase block mb-4">
              {t.dashboard.verseOfTheDay}
            </span>
            <blockquote className="font-serif text-2xl md:text-3xl text-black dark:text-white leading-relaxed mb-6 font-medium">
              {language === "en" 
                ? `"For God has not given us a spirit of fear, but of power and of love and of a sound mind."`
                : `"Porque Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação."`}
            </blockquote>
            <cite className="font-serif text-base text-slate-600 dark:text-slate-300 italic block">
              {language === "en" ? "— 2 Timothy 1:7 (KJV)" : "— 2 Timóteo 1:7 (JFA)"}
            </cite>
          </div>
          <div className="relative z-10 flex gap-4 mt-8">
            <button 
              onClick={() => onNavigateToChapter("2 Timóteo", 1)}
              className="px-6 py-3 bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 rounded-full font-bold text-xs tracking-wider uppercase hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors cursor-pointer active:scale-95 shadow-sm"
            >
              {t.dashboard.reflect}
            </button>
            <button className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-black dark:text-white rounded-full font-bold text-xs tracking-wider uppercase hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              {t.dashboard.share}
            </button>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-700 text-slate-900 dark:text-amber-300">
            <BookOpen className="w-[280px] h-[280px]" />
          </div>
        </div>

        {/* Streak Card */}
        <div className="md:col-span-4 p-8 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-yellow-600 text-white flex flex-col items-center justify-center text-center shadow-lg group">
          <Flame className="w-12 h-12 mb-4 animate-bounce text-amber-200" fill="currentColor" />
          <span className="text-6xl font-bold font-serif mb-1 group-hover:scale-110 transition-transform duration-300 text-white">
            {user.streak}
          </span>
          <span className="text-xs font-bold tracking-widest uppercase text-white/90">
            {t.dashboard.streak}
          </span>
          <div className="mt-6 flex gap-2">
            {user.streakHistory.map((active, idx) => (
              <div 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full ${
                  active ? "bg-white" : "bg-white/40"
                }`} 
                title={t.dashboard.days[idx]}
              />
            ))}
          </div>
          <p className="text-sm mt-4 text-white/95 font-light">
            {t.dashboard.momentum.replace("{name}", user.name)}
          </p>
        </div>

        {/* Progress Circle Card */}
        <div className="md:col-span-5 p-8 rounded-2xl bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block mb-1">
              {t.dashboard.activePlan}
            </span>
            <h3 className="font-serif text-xl font-bold text-black dark:text-white mb-1">
              {planInfo.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.dashboard.progressChapter.replace("{completed}", String(activePlan.chaptersCompleted.length)).replace("{total}", String(activePlan.totalChapters))}
            </p>
            <button 
              onClick={() => onNavigate("bible")}
              className="mt-6 text-amber-600 dark:text-amber-400 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all group cursor-pointer"
            >
              {t.dashboard.continueReading} 
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                className="text-slate-100 dark:text-slate-800" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="currentColor" 
                strokeWidth="7" 
              />
              <circle 
                className="text-amber-600 dark:text-amber-500 transition-all duration-1000" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="currentColor" 
                strokeWidth="7" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (289 * percentComplete) / 100}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-black dark:text-white">
                {percentComplete}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate("bible")}
            className="p-6 rounded-2xl bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-400/30 shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
          >
            <BookMarked className="w-8 h-8 text-amber-600 dark:text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wider text-black dark:text-slate-300 uppercase">
              {t.dashboard.journal}
            </span>
          </button>
          <button 
            onClick={() => onNavigate("theology")}
            className="p-6 rounded-2xl bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-400/30 shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
          >
            <MessageSquare className="w-8 h-8 text-amber-600 dark:text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wider text-black dark:text-slate-300 uppercase">
              {t.dashboard.counselAction}
            </span>
          </button>
          <button 
            onClick={() => onNavigate("studies")}
            className="p-6 rounded-2xl bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-400/30 shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
          >
            <Library className="w-8 h-8 text-amber-600 dark:text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wider text-black dark:text-slate-300 uppercase">
              {t.dashboard.library}
            </span>
          </button>
          <button 
            onClick={() => onNavigate("sermons")}
            className="p-6 rounded-2xl bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-400/30 shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-95"
          >
            <Heart className="w-8 h-8 text-amber-600 dark:text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-wider text-black dark:text-slate-300 uppercase">
              {t.dashboard.sermonAction}
            </span>
          </button>
        </div>

      </div>

      {/* Recommended Sermons Section */}
      <section className="pt-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] block uppercase mb-1">
              {t.dashboard.recommended}
            </span>
            <h2 className="font-serif text-2xl font-bold text-black dark:text-white">
              {t.dashboard.recentSermons}
            </h2>
          </div>
          <button 
            onClick={() => onNavigate("sermons")}
            className="text-xs font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors uppercase tracking-widest cursor-pointer"
          >
            {t.dashboard.viewAll}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedSermons.map((sermon, idx) => (
            <div 
              key={idx} 
              onClick={() => onNavigate("sermons")}
               className="group cursor-pointer bg-white dark:bg-[#15223a] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-950">
                <img 
                  alt={sermon.title} 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" 
                  src={sermon.imgUrl}
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-white/90 shadow text-amber-700 flex items-center justify-center">
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold tracking-wide">
                  {sermon.duration}
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-serif text-lg font-bold text-black dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
                  {sermon.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {sermon.preacher}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
