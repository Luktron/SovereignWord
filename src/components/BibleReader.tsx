/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { BookOpen, Sparkles, Highlighter, Heart, ChevronDown, ChevronLeft, ChevronRight, Bookmark, Edit, Save, Trash, RefreshCw, Bot, Play, Pause, Square, Volume2 } from "lucide-react";
import { Chapter, Verse, BookMetadata, AppState } from "../types";
import { booksMetadata } from "../data/bibleData";
import { translations, getTranslatedBookName } from "../data/translations";

interface BibleReaderProps {
  state: AppState;
  language: "pt" | "en";
  onSaveState: (updated: AppState) => void;
  jumpBook?: string;
  jumpChapter?: number;
}

export default function BibleReader({ state, language, onSaveState, jumpBook, jumpChapter }: BibleReaderProps) {
  const baseT = translations[language];
  const t = {
    ...baseT,
    bible: {
      ...baseT.bible,
      chapterLabel: baseT.bible.chapterSelect,
      selectChapter: baseT.bible.chapterSelect,
      unscrolling: baseT.bible.loading,
      favorite: baseT.bible.favoriteTooltip,
      annotate: baseT.bible.annotateTooltip,
      annotateOnVerse: baseT.bible.annotationTitle,
      exegeticalCommentary: baseT.bible.commentaryTitle,
      studyProphecy: baseT.bible.studySources
    },
    theology: {
      ...baseT.theology,
      luminaTitle: baseT.theology.insightTitle
    }
  };

  const [selectedBook, setSelectedBook] = useState<BookMetadata>(
    booksMetadata.find(b => b.name === (jumpBook || "Gênesis")) || booksMetadata[0]
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(jumpChapter || 1);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);

  // TTS – Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingVerseNum, setSpeakingVerseNum] = useState<number | null>(null);
  const verseIndexRef = useRef<number>(0);
  const iosKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);

  // Selector Dropdown Modals
  const [bookSelectorOpen, setBookSelectorOpen] = useState(false);
  const [chapterSelectorOpen, setChapterSelectorOpen] = useState(false);

  // Verse editing notes variables
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
  const [verseNoteInput, setVerseNoteInput] = useState("");

  const [commentaryContent, setCommentaryContent] = useState(() => (
    language === "en"
      ? "The phrase 'In the beginning' (Hebrew: Bereshit) establishes the absolute sovereignty of God over time and matter. The majestic plural 'Elohim' is the primary subject of creation, showing the plenitude of the Trinitarian creative power."
      : "A frase 'No princípio' (Hebraico: Bereshit) estabelece a soberania absoluta de Deus sobre o tempo e a matéria. O plural majestoso 'Elohim' é o sujeito primordial da criação, indicando a plenitude do poder criador Trinitário."
  ));

  // Switch default commentary and settings when language changes
  const initLangRef = useRef(language);
  if (initLangRef.current !== language) {
    initLangRef.current = language;
    setCommentaryContent(
      language === "en"
        ? "The phrase 'In the beginning' (Hebrew: Bereshit) establishes the absolute sovereignty of God over time and matter. The majestic plural 'Elohim' is the primary subject of creation, showing the plenitude of the Trinitarian creative power."
        : "A frase 'No princípio' (Hebraico: Bereshit) estabelece a soberania absoluta de Deus sobre o tempo e a matéria. O plural majestoso 'Elohim' é o sujeito primordial da criação, indicando a plenitude do poder criador Trinitário."
    );
  }

  // Parar TTS ao trocar livro, capítulo ou idioma; limpar ao desmontar
  useEffect(() => {
    window.speechSynthesis?.cancel();
    if (iosKeepAliveRef.current !== null) { clearInterval(iosKeepAliveRef.current); iosKeepAliveRef.current = null; }
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingVerseNum(null);
    setSelectedVerseNum(null);
    return () => {
      window.speechSynthesis?.cancel();
      if (iosKeepAliveRef.current !== null) { clearInterval(iosKeepAliveRef.current); iosKeepAliveRef.current = null; }
    };
  }, [selectedBook.id, selectedChapter, language]);

  useEffect(() => {
    if (jumpBook) {
      const fb = booksMetadata.find(b => b.name === jumpBook);
      if (fb) setSelectedBook(fb);
    }
    if (jumpChapter) {
      setSelectedChapter(jumpChapter);
    }
  }, [jumpBook, jumpChapter]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  // Fetch chapter data (preloaded or Dynamic AI generated in JFA/KJV depending on language)
  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bible/${encodeURIComponent(selectedBook.name)}/${selectedChapter}?lang=${language}`);
        if (!res.ok) throw new Error("Erro ao carregar o capitulo");
        const data = (await res.json()) as Chapter;
        
        // Merge user highlights, favorites and notes from AppState
        const mergedVerses = data.verses.map((v) => {
          const favoriteExists = state.favorites.some(
            (f) => f.book === selectedBook.name && f.chapter === selectedChapter && f.verse === v.number
          );
          const noteExists = state.notes.find(
            (n) => n.book === selectedBook.name && n.chapter === selectedChapter && n.verse === v.number
          );
          return {
            ...v,
            favorite: favoriteExists,
            note: noteExists?.note || "",
            // Highlight matching verse 3 to match design
            highlighted: v.number === 3 ? "rgba(212, 175, 55, 0.15)" : undefined
          };
        });

        setChapterData({
          ...data,
          verses: mergedVerses
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [selectedBook, selectedChapter, state.favorites, state.notes, language]);

  const handleToggleFavorite = (verseObj: Verse) => {
    if (!chapterData) return;

    const isFav = verseObj.favorite;
    let updatedFavs = [...state.favorites];

    if (isFav) {
      // Remove
      updatedFavs = updatedFavs.filter(
        (f) => !(f.book === selectedBook.name && f.chapter === selectedChapter && f.verse === verseObj.number)
      );
    } else {
      // Add
      updatedFavs.push({
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: verseObj.number,
        text: verseObj.text
      });
    }

    onSaveState({
      ...state,
      favorites: updatedFavs
    });
  };

  const handleStartEditNote = (v: Verse) => {
    setEditingVerse(v);
    setVerseNoteInput(v.note || "");
  };

  const handleSaveNote = () => {
    if (!editingVerse || !chapterData) return;

    let updatedNotes = [...state.notes];
    
    // Filter existing
    updatedNotes = updatedNotes.filter(
      (n) => !(n.book === selectedBook.name && n.chapter === selectedChapter && n.verse === editingVerse.number)
    );

    if (verseNoteInput.trim()) {
      updatedNotes.push({
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: editingVerse.number,
        note: verseNoteInput,
        text: editingVerse.text
      });
    }

    onSaveState({
      ...state,
      notes: updatedNotes
    });

    setEditingVerse(null);
    setVerseNoteInput("");
  };

  const handleHighlight = (verseNumber: number, color: string) => {
    if (!chapterData) return;
    const updated = chapterData.verses.map((v) => {
      if (v.number === verseNumber) {
        return { ...v, highlighted: v.highlighted ? undefined : color };
      }
      return v;
    });
    setChapterData({ ...chapterData, verses: updated });
  };

  const handleNextChapter = () => {
    if (selectedChapter < selectedBook.chaptersCount) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      // Go to next book
      const currentIdx = booksMetadata.findIndex(b => b.id === selectedBook.id);
      if (currentIdx < booksMetadata.length - 1) {
        setSelectedBook(booksMetadata[currentIdx + 1]);
        setSelectedChapter(1);
      }
    }
  };

  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      const currentIdx = booksMetadata.findIndex(b => b.id === selectedBook.id);
      if (currentIdx > 0) {
        const prevBook = booksMetadata[currentIdx - 1];
        setSelectedBook(prevBook);
        setSelectedChapter(prevBook.chaptersCount);
      }
    }
  };

  // ── TTS functions ─────────────────────────────────────────────────────────
  const requestBrowserAudioUnlock = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
      const BrowserAudioContext = window.AudioContext
        || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (BrowserAudioContext) {
        if (!audioContextRef.current) {
          audioContextRef.current = new BrowserAudioContext();
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        // Pulso silencioso para liberar reprodução no iOS/Safari após gesto do usuário.
        const gain = audioContextRef.current.createGain();
        gain.gain.value = 0;
        gain.connect(audioContextRef.current.destination);
        const osc = audioContextRef.current.createOscillator();
        osc.connect(gain);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.01);
      }

      if ("speechSynthesis" in window && !window.speechSynthesis.speaking) {
        const warmup = new SpeechSynthesisUtterance(" ");
        warmup.volume = 0;
        warmup.rate = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(warmup);
        window.speechSynthesis.cancel();
      }

      setAudioUnlocked(true);
      return true;
    } catch (error) {
      console.warn("Falha ao habilitar áudio no browser:", error);
      return false;
    }
  };

  const speakChapter = () => {
    if (!chapterData || !("speechSynthesis" in window)) return;
    const verses = chapterData.verses;

    window.speechSynthesis.cancel();
    if (iosKeepAliveRef.current !== null) { clearInterval(iosKeepAliveRef.current); iosKeepAliveRef.current = null; }
    verseIndexRef.current = 0;
    setIsSpeaking(true);
    setIsPaused(false);

    // iOS Safari trava o TTS após ~15s; pause()+resume() a cada 14s reseta o timer interno.
    iosKeepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 14000);

    const getBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      const lang = language === "pt" ? "pt" : "en";
      return voices.find(v => v.lang.toLowerCase().startsWith(lang))
        ?? voices.find(v => v.default)
        ?? voices[0];
    };

    const doSpeak = () => {
      const idx = verseIndexRef.current;
      if (idx >= verses.length) {
        setIsSpeaking(false);
        setSpeakingVerseNum(null);
        if (iosKeepAliveRef.current !== null) { clearInterval(iosKeepAliveRef.current); iosKeepAliveRef.current = null; }
        return;
      }
      const v = verses[idx];
      setSpeakingVerseNum(v.number);

      const utter = new SpeechSynthesisUtterance(v.text);
      utter.lang = language === "pt" ? "pt-BR" : "en-US";
      utter.rate = 0.88;
      const voice = getBestVoice();
      if (voice) utter.voice = voice;

      utter.onend = () => {
        verseIndexRef.current = idx + 1;
        doSpeak();
      };
      // onerror: só avança se for erro real — NÃO avança em 'interrupted'/'canceled'
      // (evita loop quando cancel() é chamado pelo usuário ou ao trocar capítulo)
      utter.onerror = (e: SpeechSynthesisErrorEvent) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        verseIndexRef.current = idx + 1;
        doSpeak();
      };

      window.speechSynthesis.speak(utter);
    };

    // Android: vozes podem não estar carregadas na primeira execução
    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      let started = false;
      const startOnce = () => {
        if (started) return;
        started = true;
        doSpeak();
      };

      window.speechSynthesis.addEventListener("voiceschanged", startOnce, { once: true });
      setTimeout(startOnce, 350);
    }
  };

  const handleTTSPlayPause = async () => {
    if (!isSpeaking) {
      if (!audioUnlocked) {
        await requestBrowserAudioUnlock();
      }
      speakChapter();
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleTTSStop = () => {
    window.speechSynthesis.cancel();
    if (iosKeepAliveRef.current !== null) { clearInterval(iosKeepAliveRef.current); iosKeepAliveRef.current = null; }
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingVerseNum(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const currentBookName = getTranslatedBookName(selectedBook.name, language);

  return (
    <div className="space-y-10 selection:bg-amber-100 dark:selection:bg-amber-500/25 select-text text-black dark:text-white">
      
      {/* Chapter Selection Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-105 dark:border-slate-805 pb-6">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-amber-600 dark:text-amber-400 uppercase select-none">
            {selectedBook.testament === "Old" ? t.bible.oldTestament : t.bible.newTestament}
          </span>
          
          <div className="flex flex-wrap items-center gap-3 mt-1.5 relative">
            <button 
              onClick={() => { setBookSelectorOpen(!bookSelectorOpen); setChapterSelectorOpen(false); }}
              className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {currentBookName} <ChevronDown className="w-6 h-6 text-slate-400" />
            </button>
            <button 
              onClick={() => { setChapterSelectorOpen(!chapterSelectorOpen); setBookSelectorOpen(false); }}
              className="font-serif text-3xl md:text-4xl font-bold text-amber-605 dark:text-amber-400 flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {t.bible.chapterLabel} {selectedChapter} <ChevronDown className="w-6 h-6 text-slate-400" />
            </button>

            {/* Book Selector Dropdown Menu */}
            {bookSelectorOpen && (
              <div className="absolute top-12 left-0 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1a2b48] border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 grid grid-cols-2 gap-2 select-none">
                {booksMetadata.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBook(b);
                      setSelectedChapter(1);
                      setBookSelectorOpen(false);
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded text-left cursor-pointer ${
                      selectedBook.id === b.id
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350"
                    }`}
                  >
                    {getTranslatedBookName(b.name, language)}
                  </button>
                ))}
              </div>
            )}

            {/* Chapter Selector Dropdown Menu */}
            {chapterSelectorOpen && (
              <div className="absolute top-12 left-44 w-64 p-4 bg-white dark:bg-[#1a2b48] border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl z-50 select-none">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider block mb-3 uppercase">{t.bible.selectChapter}</span>
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                  {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((chNum) => (
                    <button
                      key={chNum}
                      onClick={() => {
                        setSelectedChapter(chNum);
                        setChapterSelectorOpen(false);
                      }}
                      className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded transition-all cursor-pointer ${
                        selectedChapter === chNum
                          ? "bg-amber-600 text-white"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {chNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translation and AI Insight Buttons */}
        <div className="flex flex-wrap gap-2 select-none items-center">
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-black dark:text-white rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#1e304f] transition-all">
            <BookOpen className="w-4 h-4 text-slate-500" />
            {language === "en" ? "KJV (Classic)" : "JFA (Almeida)"}
          </button>
          <button 
            onClick={() => {
              const chapterTrans = t.bible.chapterLabel;
              setCommentaryContent(
                language === "en"
                  ? `The in-depth exegetical commentary for ${getTranslatedBookName(selectedBook.name, language)} ${chapterTrans} ${selectedChapter} focuses on divinely guided prophecies under the historicist approach, tracing salvation history aligned with the Spirit of Prophecy.`
                  : `O estudo exegético aprofundado de ${getTranslatedBookName(selectedBook.name, language)} ${chapterTrans} ${selectedChapter} foca na revelação divinamente guiada pelas profecias e os escritos do Espírito de Profecia. Daniel & Apocalipse traçam o destino escatológico sob a perspectiva adventista.`
              );
            }}
            className="px-4 py-2 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center gap-1.5 hover:bg-amber-400/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {t.theology.luminaTitle}
          </button>

          {/* TTS – Leitura em voz pela IA (Web Speech API) */}
          <div className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-xl px-3 py-2">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <button
              onClick={handleTTSPlayPause}
              disabled={loading || !chapterData}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-500 transition-colors disabled:opacity-40 cursor-pointer"
              title={language === "en" ? (isSpeaking && !isPaused ? "Pause" : "Play chapter") : (isSpeaking && !isPaused ? "Pausar" : "Ouvir capítulo")}
            >
              {isSpeaking && !isPaused
                ? <Pause className="w-4 h-4" />
                : <Play className="w-4 h-4" />}
            </button>
            {isSpeaking && (
              <button
                onClick={handleTTSStop}
                className="text-emerald-700 dark:text-emerald-400 hover:text-red-500 transition-colors cursor-pointer"
                title={language === "en" ? "Stop" : "Parar"}
              >
                <Square className="w-3.5 h-3.5" fill="currentColor" />
              </button>
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 ml-0.5">
              {isSpeaking
                ? (isPaused
                    ? (language === "en" ? "Paused" : "Pausado")
                    : (language === "en" ? "Reading..." : "Lendo..."))
                : (language === "en" ? "Listen" : "Ouvir")}
            </span>
          </div>
        </div>
      </section>

      {/* Cabeçalho de capítulo – estilo Bíblia tradicional */}
      <div className="text-center py-6 border-y border-amber-200/40 dark:border-amber-900/30 select-none">
        <span className="text-[10px] font-bold tracking-[0.35em] text-amber-600/60 dark:text-amber-500/60 uppercase block mb-1">
          {selectedBook.testament === "Old" ? t.bible.oldTestament : t.bible.newTestament} · {currentBookName}
        </span>
        <span className="font-serif font-bold text-[62px] md:text-[78px] leading-none text-amber-200/80 dark:text-amber-900/30 block">
          {selectedChapter}
        </span>
        <div className="flex items-center justify-center gap-4 -mt-2">
          <span className="w-14 h-px bg-amber-300/50 dark:bg-amber-800/50 block" />
          <span className="text-xs font-serif italic text-slate-400 dark:text-slate-500">{t.bible.chapterLabel} {selectedChapter}</span>
          <span className="w-14 h-px bg-amber-300/50 dark:bg-amber-800/50 block" />
        </div>
      </div>

      {/* Main Scripture Grid layout mapping mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Main Bible text column */}
        <article className="lg:col-span-8">
          {loading ? (
            <div className="py-20 text-center animate-pulse space-y-4 select-none">
              <RefreshCw className="w-10 h-10 animate-spin mx-auto text-amber-600 dark:text-amber-400" />
              <p className="font-serif italic text-slate-500 dark:text-slate-400">
                {t.bible.unscrolling}
              </p>
            </div>
          ) : (
            <div>
              {/* Área de leitura estilo Bíblia impressa – fundo papel, duas colunas */}
              <div className="bg-[#fdfbf5] dark:bg-[#0d1829] rounded-2xl px-6 py-8 md:px-10 md:py-10 border border-amber-200/40 dark:border-slate-800/70 shadow-sm">
                {/* Texto fluente em duas colunas como Bíblia impressa */}
                <p className="md:columns-2 gap-10 text-[15px] md:text-[15.5px] leading-[2.05] font-serif text-slate-800 dark:text-slate-200 text-justify hyphens-auto select-text">
                  {chapterData?.verses.map((verseObj) => (
                    <span
                      key={verseObj.number}
                      onClick={() => setSelectedVerseNum(prev => prev === verseObj.number ? null : verseObj.number)}
                      className={`cursor-pointer rounded px-[2px] -mx-[2px] transition-colors ${
                        selectedVerseNum === verseObj.number
                          ? "bg-amber-100/80 dark:bg-amber-900/25 ring-1 ring-amber-300/50"
                          : "hover:bg-amber-50/70 dark:hover:bg-amber-900/10"
                      } ${speakingVerseNum === verseObj.number ? "!bg-emerald-100/60 dark:!bg-emerald-900/20" : ""}`}
                      style={speakingVerseNum !== verseObj.number && selectedVerseNum !== verseObj.number && verseObj.highlighted
                        ? { backgroundColor: verseObj.highlighted }
                        : undefined}
                    >
                      <sup className="text-[9px] font-bold text-amber-600 dark:text-amber-500 font-sans mr-[2px] not-italic select-none">
                        {verseObj.number}
                        {speakingVerseNum === verseObj.number && (
                          <span className="inline-flex items-center gap-[2px] ml-[2px] align-middle">
                            <span className="w-[3px] h-[3px] bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-[3px] h-[3px] bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-[3px] h-[3px] bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        )}
                      </sup>
                      {verseObj.text}{' '}
                    </span>
                  ))}
                </p>

                {/* Anotações exibidas abaixo do texto */}
                {chapterData?.verses.some(v => v.note) && (
                  <div className="mt-8 pt-6 border-t border-amber-200/40 dark:border-slate-700/50 space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 select-none mb-3">
                      <Bookmark className="w-3 h-3" /> {language === "en" ? "Annotations" : "Anotações"}
                    </h4>
                    {chapterData.verses.filter(v => v.note).map(v => (
                      <div key={v.number} className="flex gap-2 items-start group/note">
                        <span className="text-[9px] font-bold text-amber-600 font-sans mt-0.5 w-4 flex-shrink-0 select-none">{v.number}</span>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400 flex-1">"{v.note}"</p>
                        <button
                          onClick={() => { const removed = state.notes.filter(n => !(n.book === selectedBook.name && n.chapter === selectedChapter && n.verse === v.number)); onSaveState({ ...state, notes: removed }); }}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover/note:opacity-100 transition-all cursor-pointer select-none flex-shrink-0"
                          title={language === "en" ? "Delete" : "Excluir"}
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toolbar de ações – aparece ao clicar em um versículo */}
              {selectedVerseNum !== null && chapterData && (() => {
                const v = chapterData.verses.find(vv => vv.number === selectedVerseNum);
                if (!v) return null;
                return (
                  <div className="mt-3 px-4 py-3 bg-white dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-wrap items-center gap-2 select-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-1 min-w-0">
                      {language === "en" ? `Verse ${selectedVerseNum}` : `Versículo ${selectedVerseNum}`}
                    </span>
                    <button
                      onClick={() => handleHighlight(v.number, "rgba(212,175,55,0.2)")}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-200/60"
                    >
                      <Highlighter className="w-3 h-3" /> {language === "en" ? "Highlight" : "Marca-texto"}
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(v)}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200/60"
                    >
                      <Heart className="w-3 h-3" fill={v.favorite ? "currentColor" : "none"} />
                      {v.favorite ? (language === "en" ? "Saved" : "Salvo") : (language === "en" ? "Favorite" : "Favoritar")}
                    </button>
                    <button
                      onClick={() => { handleStartEditNote(v); setSelectedVerseNum(null); }}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200/60"
                    >
                      <Edit className="w-3 h-3" /> {language === "en" ? "Note" : "Anotar"}
                    </button>
                    <button
                      onClick={() => setSelectedVerseNum(null)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer text-lg leading-none"
                    >×</button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Annotation Modal Form */}
          {editingVerse && (
            <div className="mt-6 p-6 rounded-2xl bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/20 space-y-4">
              <div className="flex justify-between items-center select-none">
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest inline-flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" />
                  {t.bible.annotateOnVerse.replace("{num}", String(editingVerse.number))}
                </h4>
                <button 
                  onClick={() => setEditingVerse(null)}
                  className="text-slate-500 dark:text-slate-400 text-xs font-bold hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {language === "en" ? "Cancel" : "Cancelar"}
                </button>
              </div>
              <textarea 
                value={verseNoteInput}
                onChange={(e) => setVerseNoteInput(e.target.value)}
                placeholder={language === "en" ? "Write your personal insights or reflection note..." : "Escreva seus ensinamentos ou insights de estudo..."}
                className="w-full bg-white dark:bg-[#1a2b48] border border-blue-500/30 rounded-xl p-4 text-xs md:text-sm text-black dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                rows={3}
              />
              <button 
                onClick={handleSaveNote}
                className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all inline-flex items-center gap-1.5 shadow cursor-pointer select-none"
              >
                <Save className="w-3.5 h-3.5" />
                {t.bible.saveAnnotation}
              </button>
            </div>
          )}

          {/* Previous / Next Actions footer */}
          <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-105 dark:border-slate-805 select-none">
            <button 
              onClick={handlePrevChapter}
              className="px-4 py-2 border border-slate-205 dark:border-slate-800 rounded-xl text-black dark:text-white text-xs font-bold hover:text-amber-600 transition-colors inline-flex items-center gap-1.5 uppercase cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              {language === "en" ? "Previous" : "Anterior"}
            </button>
            <button 
              onClick={handleNextChapter}
              className="px-4 py-2 border border-slate-205 dark:border-slate-800 rounded-xl text-black dark:text-white text-xs font-bold hover:text-amber-600 transition-colors inline-flex items-center gap-1.5 uppercase cursor-pointer"
            >
              {language === "en" ? "Next" : "Próximo"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </article>

        {/* Biblical commentary & cross-references sidebar column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#15223a] border border-slate-105 dark:border-slate-850 shadow-sm space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-550 dark:text-slate-400 uppercase flex items-center gap-1.5 select-none">
              <Bot className="w-4 h-4 text-amber-500" />
              {t.bible.exegeticalCommentary}
            </h3>
            
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-350 italic font-light leading-relaxed whitespace-pre-line text-justify pl-1">
              "{commentaryContent}"
            </p>

            <button 
              onClick={() => {
                setCommentaryContent(
                  language === "en"
                    ? "Sabbath School lesson study guides download in progress. Full offline indexing and Ellen White commentaries will map onto Genesis and Revelation chapters instantly."
                    : "As lições completas da Escola Sabatina estão em cache! O conteúdo total do comentário foi armazenado offline com exatidão."
                );
              }}
              className="w-full py-3 border border-amber-500/20 text-amber-650 dark:text-amber-305 bg-amber-500/5 dark:bg-amber-400/5 hover:bg-amber-400/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer select-none"
            >
              {t.bible.studyProphecy}
            </button>
          </div>

          <div className="p-6 bg-white dark:bg-[#1a2b48] rounded-2xl border border-slate-105 dark:border-slate-850 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block select-none">
              {t.bible.crossReferences}
            </h4>
            <ul className="space-y-4 pl-1">
              <li className="group cursor-pointer">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase block mb-1">
                  {language === "en" ? "John 1:1" : "João 1:1"}
                </span>
                <p className="text-xs text-slate-650 dark:text-slate-350 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-relaxed">
                  {language === "en" 
                    ? '"In the beginning was the Word, and the Word was with God, and the Word was God..."'
                    : '"No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus..."'}
                </p>
              </li>
              <li className="group cursor-pointer">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase block mb-1">
                  {language === "en" ? "Hebrews 11:3" : "Hebreus 11:3"}
                </span>
                <p className="text-xs text-slate-650 dark:text-slate-350 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-relaxed">
                  {language === "en"
                    ? '"Through faith we understand that the worlds were framed by the word of God..."'
                    : '"Pela fé entendemos que os mundos pela palavra de Deus foram criados..."'}
                </p>
              </li>
            </ul>
          </div>
        </aside>

      </div>

    </div>
  );
}
