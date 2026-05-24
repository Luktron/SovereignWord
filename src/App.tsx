/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Compass, 
  BookOpen, 
  Bot, 
  Heart, 
  ShieldCheck, 
  User, 
  Sun, 
  Moon, 
  CloudLightning, 
  Wifi, 
  WifiOff, 
  Menu, 
  X,
  Globe,
  Compass as SanctuaryIcon
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AppState } from "./types";
import { translations } from "./data/translations";

// Component imports
import SpiritualDashboard from "./components/SpiritualDashboard";
import TheologyAI from "./components/TheologyAI";
import SermonGuide from "./components/SermonGuide";
import BibleReader from "./components/BibleReader";
import BibleStudiesView from "./components/BibleStudiesView";
import ProfileView from "./components/ProfileView";

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState<"pt" | "en">("pt");
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Jump Chapter params for bible viewer callback
  const [bibleJump, setBibleJump] = useState<{ bookName: string; chapterNumber: number } | undefined>(undefined);

  // 1. Initial State Fetching from Backend & language restore
  useEffect(() => {
    const savedLang = localStorage.getItem("sovereign-word-lang");
    if (savedLang === "en" || savedLang === "pt") {
      setLanguage(savedLang);
    }
    const savedTheme = localStorage.getItem("sovereign-word-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeMode(savedTheme);
    }

    const loadState = async () => {
      try {
        const res = await fetch("/api/db");
        if (!res.ok) throw new Error("Erro de rede ao buscar DB do servidor");
        const data = await res.json();
        setAppState(data);
      } catch (err) {
        console.error("Falha ao se conectar com banco de dados:", err);
      }
    };
    loadState();
  }, []);

  // 2. Class Toggle for Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("sovereign-word-theme", themeMode);
  }, [themeMode]);

  const handleToggleLanguage = () => {
    const nextLang = language === "pt" ? "en" : "pt";
    setLanguage(nextLang);
    localStorage.setItem("sovereign-word-lang", nextLang);
  };

  const handleSaveState = async (updated: AppState) => {
    setAppState(updated);
    setIsSyncing(true);
    try {
      await fetch("/api/db/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error("Erro de sincronização offline:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleNavigate = (view: AppState["activeView"]) => {
    if (!appState) return;
    setMobileMenuOpen(false);
    // Clear bible jumps if leaving bible view
    if (view !== "bible") {
      setBibleJump(undefined);
    }
    handleSaveState({
      ...appState,
      activeView: view
    });
  };

  const handleNavigateToChapter = (book: string, chapter: number) => {
    if (!appState) return;
    setMobileMenuOpen(false);
    setBibleJump({ bookName: book, chapterNumber: chapter });
    handleSaveState({
      ...appState,
      activeView: "bible"
    });
  };

  if (!appState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-serif italic text-lg select-none">
        <div className="text-center space-y-4">
          <SanctuaryIcon className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <p>Preparando Altar de Estudos...</p>
        </div>
      </div>
    );
  }

  const t = translations[language];

  // Render sub-view dynamically
  const renderViewContent = () => {
    switch (appState.activeView) {
      case "dashboard":
        return (
          <SpiritualDashboard 
            state={appState} 
            language={language}
            onNavigate={handleNavigate} 
            onNavigateToChapter={handleNavigateToChapter} 
          />
        );
      case "bible":
        return (
          <BibleReader 
            state={appState} 
            language={language}
            onSaveState={handleSaveState}
            jumpBook={bibleJump?.bookName}
            jumpChapter={bibleJump?.chapterNumber}
          />
        );
      case "theology":
        return <TheologyAI language={language} />;
      case "sermons":
        return <SermonGuide language={language} />;
      case "studies":
        return (
          <BibleStudiesView 
            state={appState} 
            language={language}
            onSaveState={handleSaveState} 
          />
        );
      case "profile":
        return (
          <ProfileView 
            state={appState} 
            language={language}
            onSaveState={handleSaveState}
          />
        );
      default:
        return <p className="text-center font-bold text-black dark:text-white">Módulo Não Encontrado</p>;
    }
  };

  const menuItems = [
    { id: "dashboard", label: t.nav.home, icon: Compass },
    { id: "bible", label: t.nav.bible, icon: BookOpen },
    { id: "theology", label: t.nav.counsel, icon: Bot },
    { id: "sermons", label: t.nav.sermon, icon: Heart },
    { id: "studies", label: t.nav.studies, icon: ShieldCheck },
    { id: "profile", label: t.nav.profile, icon: User }
  ] as const;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${
      themeMode === "dark" 
        ? "bg-[#0e1726] text-white" 
        : "bg-[#fcfcfa] text-black"
    }`}>
      
      {/* Upper Navigation Bar */}
      <nav className={`sticky top-0 z-[100] border-b backdrop-blur-md px-6 py-4 flex items-center justify-between select-none ${
        themeMode === "dark" 
          ? "bg-[#0e1726]/85 border-[#1e293b]" 
          : "bg-[#fcfcfa]/85 border-[#e2e8f0]"
      }`}>
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="font-serif font-bold text-lg">S</span>
          </div>
          <div>
            <span className="font-serif font-black text-base md:text-lg tracking-wider leading-none block text-black dark:text-white">
              {t.nav.brand}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-450 tracking-[0.1em] uppercase block leading-none mt-0.5">
              {t.nav.subBrand}
            </span>
          </div>
        </div>

        {/* Desktop Navbar Actions */}
        <div className="hidden xl:flex items-center gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = appState.activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
                    : "text-black dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-500/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* System Widgets */}
        <div className="flex items-center gap-3">
          
          {/* Offline Sync Status bubble */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest leading-none">
            {isSyncing ? (
              <>
                <CloudLightning className="w-3.5 h-3.5 animate-bounce" />
                {t.nav.syncing}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                {t.nav.offline}
              </>
            )}
          </div>

          {/* Language Toggle Button */}
          <button 
            onClick={handleToggleLanguage}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors cursor-pointer text-black dark:text-slate-300 inline-flex items-center gap-1.5 font-bold text-xs"
            title="Switch Language / Mudar Idioma"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{language === "pt" ? "EN" : "PT"}</span>
          </button>

          {/* Theme Mode Toggle matching design */}
          <button 
            onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors cursor-pointer text-black dark:text-slate-300"
            title={t.nav.changeTheme}
          >
            {themeMode === "light" ? (
              <Moon className="w-4.5 h-4.5 text-slate-700" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            )}
          </button>

          {/* Hamburger Mobile Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors text-black dark:text-slate-300 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`xl:hidden sticky top-[73px] z-50 border-b p-6 space-y-3 shadow-lg select-none ${
              themeMode === "dark" 
                ? "bg-[#101c31] border-slate-800" 
                : "bg-white border-slate-100"
            }`}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = appState.activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-amber-600 text-white"
                      : "text-black dark:text-slate-300 hover:bg-slate-500/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central View Canvas Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-10 text-black dark:text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={appState.activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {renderViewContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Standard Footnote */}
      <footer className={`py-8 text-center text-xs border-t select-none ${
        themeMode === "dark" 
          ? "border-slate-800/60 text-slate-400 bg-[#0c1322]" 
          : "border-slate-200 text-slate-600 bg-white"
      }`}>
        <p className="font-serif italic px-4 select-all">{t.footer.quote}</p>
        <p className="font-mono text-[9px] mt-2 uppercase tracking-widest text-slate-500">{t.footer.credit}</p>
      </footer>

    </div>
  );
}
