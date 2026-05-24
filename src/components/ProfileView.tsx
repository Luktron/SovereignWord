/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { Award, Compass, Brain, Flame, BookOpen, Clock, Library, ShieldCheck, CheckSquare, Camera, Pencil, Check, X } from "lucide-react";
import { AppState } from "../types";
import { translations, getTranslatedBadge } from "../data/translations";

interface ProfileProps {
  state: AppState;
  language: "pt" | "en";
  onSaveState: (updated: AppState) => void;
}

export default function ProfileView({ state, language, onSaveState }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(state.user.name);
  const [editEmail, setEditEmail] = useState(state.user.email);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    if (!trimmedName) return;
    onSaveState({ ...state, user: { ...state.user, name: trimmedName, email: editEmail.trim() } });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(state.user.name);
    setEditEmail(state.user.email);
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) onSaveState({ ...state, user: { ...state.user, avatarUrl: dataUrl } });
    };
    reader.readAsDataURL(file);
    // reset so same file can be selected again
    e.target.value = "";
  };
  const baseT = translations[language];
  const t = {
    ...baseT,
    profile: {
      ...baseT.profile,
      profileSub: baseT.profile.sub,
      profileTitle: baseT.profile.title,
      profileDesc: baseT.profile.desc,
      badgesHeading: baseT.profile.achievementsTitle,
      metricsHeading: baseT.profile.detailedTitle
    }
  };
  const user = state.user;
  
  // Calculate visual thresholds
  const nextLevelXp = (user.level) * 300;
  const currentLevelXp = (user.level - 1) * 300;
  const levelProgress = user.xp - currentLevelXp;
  const progressPercent = Math.min(Math.round((levelProgress / 300) * 100), 100);

  // Map icon strings to Lucide components
  const getBadgeIcon = (iconStr: string) => {
    switch (iconStr) {
      case "book_open":
        return <BookOpen className="w-6 h-6 text-amber-500" />;
      case "flame":
        return <Flame className="w-6 h-6 text-amber-500" />;
      case "compass":
        return <Compass className="w-6 h-6 text-amber-500" />;
      case "brain":
        return <Brain className="w-6 h-6 text-amber-500" />;
      default:
        return <Award className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-10 selection:bg-amber-100 text-black dark:text-white">
      
      {/* View Header */}
      <div className="select-none">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase block mb-2">
          {t.profile.profileSub}
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight">
          {t.profile.profileTitle}
        </h2>
        <p className="text-lg text-slate-655 dark:text-slate-300 mt-2 font-light max-w-2xl">
          {t.profile.profileDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card & XP Leveler */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-3xl p-8 shadow-sm text-center space-y-6">

          {/* Hidden file input for avatar */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          {/* Avatar with camera overlay */}
          <div
            className="relative w-24 h-24 mx-auto group cursor-pointer select-none"
            onClick={() => avatarInputRef.current?.click()}
            title={language === "en" ? "Change photo" : "Alterar foto"}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500/50 shadow">
              <img
                alt={user.name}
                className="w-full h-full object-cover"
                src={user.avatarUrl}
              />
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Name / Level — toggle edit form */}
          {editing ? (
            <div className="space-y-3 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  {language === "en" ? "Name" : "Nome"}
                </label>
                <input
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-amber-300/50 dark:border-amber-600/30 bg-amber-50 dark:bg-[#15223a] text-black dark:text-white outline-none focus:ring-2 focus:ring-amber-400/40"
                  value={editName}
                  maxLength={40}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  {language === "en" ? "E-mail" : "E-mail"}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#15223a] text-black dark:text-white outline-none focus:ring-2 focus:ring-amber-400/40"
                  value={editEmail}
                  maxLength={80}
                  onChange={e => setEditEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> {language === "en" ? "Save" : "Salvar"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> {language === "en" ? "Cancel" : "Cancelar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 select-none">
              <h3 className="font-serif text-2xl font-bold text-black dark:text-white">
                {user.name}
              </h3>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {language === "en" ? `Level ${user.level} Theologian` : `Nível ${user.level} Teólogo`}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-[#15223a] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer uppercase tracking-wider"
              >
                <Pencil className="w-3 h-3" /> {language === "en" ? "Edit Profile" : "Editar Perfil"}
              </button>
            </div>
          )}
          <div className="space-y-2 pt-2 select-none">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{language === "en" ? `Level ${user.level}` : `Nível ${user.level}`}</span>
              <span>{user.xp} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-yellow-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 block uppercase tracking-wider text-right">
              {language === "en" 
                ? `${nextLevelXp - user.xp} XP more to level up` 
                : `Mais ${nextLevelXp - user.xp} XP para subir de nível`}
            </span>
          </div>

          {/* Core summary status */}
          <div className="pt-6 border-t border-slate-105 dark:border-slate-805 grid grid-cols-2 gap-4 select-none animate-none">
            <div className="p-4 bg-slate-50 dark:bg-[#15223a] rounded-2xl border border-slate-105 dark:border-slate-805">
              <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <span className="text-2xl font-black font-serif text-black dark:text-white block">
                {user.streak}d
              </span>
              <span className="text-[9px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-widest block mt-0.5">
                {language === "en" ? "Active Streak" : "Streak Ativo"}
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#15223a] rounded-2xl border border-slate-105 dark:border-slate-805">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <span className="text-2xl font-black font-serif text-black dark:text-white block">
                {user.studiesCompletedCount}
              </span>
              <span className="text-[9px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-widest block mt-0.5">
                {language === "en" ? "Completed Trails" : "Trilhas Feitas"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Badges Map Grid */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-3xl p-8 shadow-sm">
            
            <h3 className="font-serif text-xl font-bold text-black dark:text-white mb-6 select-none">
              {t.profile.badgesHeading}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {state.badges.map((b) => {
                const trans = getTranslatedBadge(b.id, language);
                const transName = trans ? trans.name : b.name;
                const transDesc = trans ? trans.desc : b.description;
                return (
                  <div 
                    key={b.id} 
                    className={`p-5 rounded-2xl border flex gap-4 items-center transition-all ${
                      b.unlocked 
                        ? "bg-amber-500/5 border-amber-500/20 dark:border-amber-400/20 shadow-inner" 
                        : "bg-slate-50/50 dark:bg-[#15223a]/40 border-slate-105 dark:border-slate-805 opacity-55"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 select-none ${
                      b.unlocked ? "bg-amber-500/10" : "bg-slate-200/50 dark:bg-slate-800"
                    }`}>
                      {getBadgeIcon(b.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-black dark:text-white">
                        {transName}
                      </h4>
                      <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-light mt-0.5">
                        {transDesc}
                      </p>
                      {b.unlocked && b.unlockedAt && (
                        <span className="text-[9px] text-amber-600/70 dark:text-amber-400/70 font-semibold block mt-1 uppercase tracking-wider select-none">
                          {language === "en" ? "Unlocked" : "Desbloqueado"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Static Detailed Analytics Table to match specs */}
          <div className="bg-slate-50 dark:bg-[#15223a] border border-slate-105 dark:border-slate-805 rounded-3xl p-8 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-black dark:text-white mb-6 select-none">
              {t.profile.metricsHeading}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center select-none animate-none">
              <div className="p-4 bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-2xl">
                <BookOpen className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <span className="text-xl font-bold font-serif text-black dark:text-white block">{user.chaptersReadCount}</span>
                <span className="text-[10px] text-slate-450 uppercase tracking-widest font-semibold mt-0.5 block">
                  {language === "en" ? "Chapters Read" : "Capítulos lidos"}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-2xl">
                <CheckSquare className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <span className="text-xl font-bold font-serif text-black dark:text-white block">{user.versesReadCount}</span>
                <span className="text-[10px] text-slate-450 uppercase tracking-widest font-semibold mt-0.5 block">
                  {language === "en" ? "Verses Read" : "Versículos lidos"}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-2xl">
                <Library className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <span className="text-xl font-bold font-serif text-black dark:text-white block">3</span>
                <span className="text-[10px] text-slate-450 uppercase tracking-widest font-semibold mt-0.5 block">
                  {language === "en" ? "Books Completed" : "Livros Concluídos"}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-2xl">
                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <span className="text-xl font-bold font-serif text-black dark:text-white block">{user.minutesRead}m</span>
                <span className="text-[10px] text-slate-450 uppercase tracking-widest font-semibold mt-0.5 block">
                  {language === "en" ? "Study Duration" : "Tempo de Estudo"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
