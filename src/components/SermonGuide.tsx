/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from "react";
import { FileText, Copy, Play, Sparkles, Clock, CheckCircle2, AlertCircle, RefreshCw, Printer, BookOpen, Layers } from "lucide-react";
import { Sermon } from "../types";
import { translations } from "../data/translations";

interface SermonGuideProps {
  language: "pt" | "en";
}

export default function SermonGuide({ language }: SermonGuideProps) {
  const baseT = translations[language];
  const t = {
    ...baseT,
    sermon: {
      ...baseT.sermons,
      generationSub: baseT.sermons.sub,
      generationTitle: baseT.sermons.title,
      generationDesc: baseT.sermons.desc,
      parametersHeading: baseT.sermons.paramsTitle,
      generateButton: baseT.sermons.btnGenerate
    }
  };

  // Helper values depending on language
  const defaultScripture = language === "en" ? "Romans 8:1-11" : "Romanos 8:1-11";
  const defaultTheme = language === "en" ? "The Spirit-Led Life" : "A Vida Decidida pelo Espírito";
  const defaultStyle = "Expositivo";
  const defaultTone = "Pastoral";

  const [scripture, setScripture] = useState(defaultScripture);
  const [theme, setTheme] = useState(defaultTheme);
  const [style, setStyle] = useState(defaultStyle);
  const [tone, setTone] = useState(defaultTone);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Sync state values if language changes
  const lastLanguageRef = useRef(language);
  if (lastLanguageRef.current !== language) {
    lastLanguageRef.current = language;
    setScripture(defaultScripture);
    setTheme(defaultTheme);
  }

  const [activeSermon, setActiveSermon] = useState<Sermon>(() => {
    if (language === "en") {
      return {
        id: "s_default_en",
        title: "The Spirit-Led Life",
        scripture: "Romans 8:1-11",
        theme: "Transitioning from condemnation to total liberation in Christ",
        style: "Expository",
        tone: "Pastoral",
        introduction: "The inevitable transition of a soul burdened by legal guilt described in Romans 7 to the triumphant liberation of the Spirit in Romans 8.",
        historicalContext: "Written by Paul in Corinth, addressing unified tensions between Jew and Gentile believers in Rome. The core theme is saving grace and justification.",
        points: [
          {
            title: "I. NO CONDEMNATION (VV. 1-4)",
            text: "Focusing on the absolute modification of the legal state of the sinner: from dead row to co-heirs and objects of divine justification by faith alone.",
            details: "Katakrima (Condemnation): Greek martial term depicting the swift execution of a decreed sentence. In Christ Jesus, this sentence is not postponed; it is satisfied!"
          },
          {
            title: "II. THE MIND OF THE SPIRIT (VV. 5-8)",
            text: "The crucial dichotomy inside the Greek text between flesh reliance (sarx) and holy submission to the Holy Spirit (pneuma).",
            details: "The flesh is inherently hostile to God and leads to spiritual death; the Spirit inspires abundant life of active peace."
          }
        ],
        applications: [
          "Identify and list areas of your busy weekly routine still harboring remnants of past legal guilt.",
          "Live in absolute daily surrender guided by the empowering whisper of the Holy Spirit."
        ],
        illustrations: [
          "A freed galley slave who receives a royal pardon, yet historically continues to sleep bound in chains inside the damp dungeon of the ship."
        ],
        conclusion: "The grand climax: belonging to the Spirit frees us from self-condemnation and launches a sanctified life devoted to Christ's footsteps.",
        appeal: "Invite every believer burdened under guilt to claim the absolute grace of salvation today.",
        closingPrayerDraft: "Lord God, seal us with your promise of hope. May no spiritual condemnation ever bind those for whom Your Son gave His life. Amen.",
        createdAt: new Date().toISOString()
      };
    } else {
      return {
        id: "s_default_2",
        title: "A Vida no Espírito",
        scripture: "Romanos 8:1-11",
        theme: "Transição da condenação para a libertação total em Cristo",
        style: "Expositivo",
        tone: "Pastoral",
        introduction: "A transição inevitável de uma alma oprimida pelo fardo da culpa legal descrita em Romanos 7 para a libertação triunfante no Espírito em Romanos 8.",
        historicalContext: "Escrito por Paulo em Corinto, respondendo a tensões de unificação entre judeus e gentios em Roma. O mistério central era a libertação e justificação.",
        points: [
          {
            title: "I. NENHUMA CONDENAÇÃO (VV. 1-4)",
            text: "Enfoque absoluto na alteração do status jurídico do pecador: de réu de morte para co-herdeiro e justificado pela fé pura.",
            details: "Katakrima (Condenação): Termo forense grego indicando a execução imediata de uma sentença decretada. Em Cristo, a sentença não é suspensa, é satisfeita!"
          },
          {
            title: "II. A MENTALIDADE DO ESPÍRITO (VV. 5-8)",
            text: "A dicotomia essencial no texto original entre a dependência da carne (sarx) e a submissão santa ao Espírito (pneuma).",
            details: "A carne é intrinsecamente hostil a Deus e conduz à morte existencial eterna; o Espírito inspira vida abundante desfrutada em paz."
          }
        ],
        applications: [
          "Identificar e listar áreas da rotina que ainda arrastam o sentimento de culpa.",
          "Viver em total rendição guiada pela voz capacitadora do Santo Espírito."
        ],
        illustrations: [
          "O condenado à galé que recebe uma herança e carta régia do Rei declarando-o livre, mas insiste em dormir acorrentado na sujeira do porão."
        ],
        conclusion: "O encerramento majestoso: pertencer ao Espírito nos livra da autopunição e desata uma nova vida dedicada aos pés do Senhor.",
        appeal: "Convocar cada irmão e irmã cansados das amarras mentais do pecado a aceitar hoje a graça absoluta.",
        closingPrayerDraft: "Senhor Deus, que Teu povo guarde o selo da esperança. Que nenhuma condenação aprisione aqueles pelos quais Teu Filho entregou o fôlego da vida. Amém.",
        createdAt: new Date().toISOString()
      };
    }
  });

  // Pulpit Mode States
  const [pulpitMode, setPulpitMode] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval!);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const loadingMessages = language === "en" ? [
    "Analyzing Hebrew and Greek texts...",
    "Structuring persuasive rhetorical outline layers...",
    "Retesting Spirit of Prophecy reference quotes...",
    "Synthesizing pulpit appeal details and pastoral closing prayer..."
  ] : [
    "Sondando o Hebraico e o Grego bíblico...",
    "Estruturando narrativas retóricas de impacto...",
    "Buscando analogias teológicas nas obras de Ellen White...",
    "Redigindo apelos homiléticos e orações pastorais..."
  ];

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : 3));
    }, 1500);

    try {
      const res = await fetch("/api/sermon/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scripture, theme, style, tone, language })
      });

      if (!res.ok) throw new Error("Falha ao gerar esboço");
      const data = await res.json();
      setActiveSermon(data);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const outlineIntro = language === "en" ? "SERMON OUTLINE" : "ESBOÇO DE SERMÃO";
    const outlinePoints = language === "en" ? "MAIN POINTS" : "PONTOS PRINCIPAIS";
    const outlineConcl = language === "en" ? "CONCLUSION" : "CONCLUSÃO";
    const outlineAppeal = language === "en" ? "SALVATION APPEAL" : "APELO DE SALVAÇÃO";

    const content = `${outlineIntro}: ${activeSermon.title}
${language === "en" ? "Scripture" : "Passagem"}: ${activeSermon.scripture}
${language === "en" ? "Homiletical Style" : "Estilo"}: ${activeSermon.style}

${language === "en" ? "INTRODUCTION" : "INTRODUÇÃO"}:
${activeSermon.introduction}

${outlinePoints}:
${activeSermon.points.map((p) => `- ${p.title}\n  ${p.text}\n  Note: ${p.details || ""}`).join("\n\n")}

${outlineConcl}:
${activeSermon.conclusion}

${outlineAppeal}:
${activeSermon.appeal}`;

    navigator.clipboard.writeText(content);
  };

  if (pulpitMode) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 text-slate-100 flex flex-col p-6 overflow-hidden">
        
        {/* Pulpit Clock Bar */}
        <header className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center bg-slate-900/50 p-4 rounded-xl select-none">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              {language === "en" ? "PULPIT MODE ACTIVE" : "MODO PÚLPITO ATIVO"}
            </span>
            <h3 className="text-xl font-serif font-bold text-white">{activeSermon.title}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <Clock className={`w-5 h-5 ${timerActive ? "text-amber-400 animate-pulse" : "text-slate-400"}`} />
              <span className="font-mono text-2xl font-bold">{formatTimer(timerCount)}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                {timerActive 
                  ? (language === "en" ? "Pause" : "Pausar") 
                  : (language === "en" ? "Start" : "Iniciar")}
              </button>
              <button 
                onClick={() => { setTimerCount(0); setTimerActive(false); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button 
                onClick={() => { setPulpitMode(false); setTimerActive(false); }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded uppercase tracking-wider transition-colors cursor-pointer"
              >
                {language === "en" ? "Close" : "Fechar"}
              </button>
            </div>
          </div>
        </header>

        {/* Big Legible Presenter Canvas */}
        <main className="flex-1 overflow-y-auto px-4 md:px-20 py-8 space-y-12 max-w-4xl mx-auto custom-pulpit-font leading-relaxed max-h-[80vh]">
          
          <section className="space-y-4">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              {language === "en" ? "Primary Scripture" : "Escritura Principal"}
            </span>
            <p className="text-3xl font-serif italic text-amber-200">
              {activeSermon.scripture}
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-amber-500 pl-6 my-8">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              {language === "en" ? "Introduction" : "Introdução"}
            </span>
            <p className="text-2xl font-light text-slate-200 leading-relaxed">
              {activeSermon.introduction}
            </p>
          </section>

          <section className="space-y-8">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              {language === "en" ? "Sermon Body Outline" : "Desenvolvimento do Sermão"}
            </span>
            {activeSermon.points.map((p, idx) => (
              <div key={idx} className="space-y-3 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                <h4 className="text-2xl font-serif font-bold text-slate-100">{p.title}</h4>
                <p className="text-xl text-slate-300">{p.text}</p>
                {p.details && (
                  <div className="mt-3 p-4 bg-slate-950 rounded border border-amber-500/20 text-xs text-amber-300 italic font-mono">
                    {p.details}
                  </div>
                )}
              </div>
            ))}
          </section>

          {activeSermon.illustrations && activeSermon.illustrations.length > 0 && (
            <section className="space-y-4 border-l-4 border-slate-700 pl-6">
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                {language === "en" ? "Key Illustration" : "Ilustração Ilustre"}
              </span>
              <p className="text-xl text-slate-300 italic font-serif">
                "{activeSermon.illustrations[0]}"
              </p>
            </section>
          )}

          <section className="space-y-4">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              {language === "en" ? "Salvation Appeal" : "Apelo de Salvação"}
            </span>
            <p className="text-2xl font-medium text-amber-100 bg-amber-500/5 p-6 rounded-xl border border-amber-500/10">
              {activeSermon.appeal}
            </p>
          </section>

          <section className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              {language === "en" ? "Pastoral Closing Prayer" : "Oração Final"}
            </span>
            <p className="text-lg text-slate-300 font-light leading-relaxed whitespace-pre-line text-justify">
              {activeSermon.closingPrayerDraft}
            </p>
          </section>

          <p className="text-center text-slate-600 text-xs py-8 uppercase tracking-widest font-mono">
            {language === "en" ? "End of Outline" : "Fim do Esboço"} • Sovereign Word Sermon Architect
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-12 text-black dark:text-white">
      
      {/* Page Header */}
      <div className="select-none">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase block mb-2">
          {t.sermon.generationSub}
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight">
          {t.sermon.generationTitle}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mt-2 font-light max-w-2xl">
          {t.sermon.generationDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Parameters Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1a2b48] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-black dark:text-white">
            <h3 className="text-xs font-bold tracking-widest text-black dark:text-slate-300 uppercase mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              {t.sermon.parametersHeading}
            </h3>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  {t.sermon.scriptureLabel}
                </label>
                <input 
                  type="text" 
                  value={scripture}
                  onChange={(e) => setScripture(e.target.value)}
                  placeholder={language === "en" ? "e.g. Romans 8:1-11" : "ex: Romanos 8:1-11"}
                  className="w-full bg-slate-50 dark:bg-[#16223a] border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3.5 text-sm font-medium text-black dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  {t.sermon.themeLabel}
                </label>
                <input 
                  type="text" 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={language === "en" ? "e.g. Assurance of Salvation" : "ex: A certeza da salvação"}
                  className="w-full bg-slate-50 dark:bg-[#16223a] border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3.5 text-sm font-medium text-black dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  {t.sermon.styleLabel}
                </label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#16223a] border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3.5 text-sm font-medium text-black dark:text-white"
                >
                  <option value="Expositivo">{language === "en" ? "Expository" : "Expositivo"}</option>
                  <option value="Temático">{language === "en" ? "Thematic" : "Temático"}</option>
                  <option value="Textual">{language === "en" ? "Textual" : "Textual"}</option>
                  <option value="Narrativo">{language === "en" ? "Narrative" : "Narrativo"}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  {t.sermon.toneLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Pastoral", pt: "Pastoral", en: "Pastoral" },
                    { id: "Academic", pt: "Acadêmico", en: "Academic" },
                    { id: "Evangelistic", pt: "Evangelístico", en: "Evangelistic" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTone(item.id)}
                      className={`py-2 px-1 text-[10px] font-semibold tracking-wider rounded border transition-all uppercase cursor-pointer ${
                        tone === item.id
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600"
                      }`}
                    >
                      {language === "en" ? item.en : item.pt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-xl flex items-center justify-center gap-2 group shadow hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (language === "en" ? "Synthesizing..." : "Sintetizando...") : t.sermon.generateButton}
                <Sparkles className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </form>
          </div>

          {/* Inspirational Cinematic Card */}
          <div className="rounded-2xl overflow-hidden relative shadow bg-slate-900 aspect-video group select-none">
            <img 
              alt="Mountain scenery dawn" 
              className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" 
              src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-serif italic text-white text-base leading-snug">
                "For all who are led by the Spirit of God are sons of God."
              </p>
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 block mt-1">
                Romans 8:14 (KJV)
              </span>
            </div>
          </div>
        </aside>

        {/* Outline Display Column */}
        <section className="lg:col-span-8 space-y-6">
          
          {loading ? (
            <div className="bg-white dark:bg-[#1a2b48] p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-pulse select-none">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-black dark:text-white">
                  {loadingMessages[loadingStep]}
                </h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  Sovereign Word homiletics builder engine
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-[#15223a] p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="bg-white dark:bg-[#1a2b48] rounded-xl p-8 shadow-inner border border-slate-200 dark:border-slate-800 space-y-8 text-black dark:text-white">
                
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-black dark:text-white italic leading-tight">
                       {activeSermon.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {language === "en" ? "Outline Draft" : "Esboço Rascunho"} • {activeSermon.style} ({activeSermon.tone})
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto select-none">
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 flex-1 md:flex-none flex justify-center items-center cursor-pointer active:scale-95" 
                      title={language === "en" ? "Copy Outline" : "Copiar Esboço"}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPulpitMode(true)}
                      className="px-4 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 dark:border-slate-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 flex-1 md:flex-none cursor-pointer active:scale-95 animate-none"
                    >
                      <Play className="w-4 h-4 text-emerald-400" />
                      {language === "en" ? "Pulpit" : "Púlpito"}
                    </button>
                  </div>
                </div>

                {/* Sermon Structure Body */}
                <div className="space-y-8 select-text">
                  
                  {/* Introduction */}
                  <section className="space-y-2">
                    <div className="flex items-center gap-4 select-none">
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                        {language === "en" ? "I. INTRODUCTION" : "I. INTRODUÇÃO"}
                      </span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    </div>
                    <div className="pl-4 border-l-2 border-amber-605/30 space-y-3">
                      <p className="font-serif text-lg text-black dark:text-white italic">
                        "{activeSermon.introduction}"
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                        <strong>{language === "en" ? "Historical Context" : "Contexto Histórico"}:</strong> {activeSermon.historicalContext}
                      </p>
                    </div>
                  </section>

                  {/* Body Points */}
                  {activeSermon.points.map((p, idx) => (
                    <section key={idx} className="space-y-3">
                      <div className="flex items-center gap-4 select-none">
                        <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase font-serif">
                          {p.title}
                        </span>
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                      </div>
                      <div className="pl-4 border-l-2 border-amber-605/30 space-y-3">
                        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-1 text-justify">
                          {p.text}
                        </p>
                        {p.details && (
                          <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 space-y-1">
                            <span className="text-[9px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400">
                              Homiletic Insight ({language === "en" ? "Hebrew/Greek Exegesis" : "Exegese Hebraico/Grego"})
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                              {p.details}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  ))}

                  {/* Illustrations if any */}
                  {activeSermon.illustrations && activeSermon.illustrations.length > 0 && (
                    <section className="space-y-2">
                      <div className="flex items-center gap-4 select-none">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {language === "en" ? "RECOMMENDED ILLUSTRATION" : "ILUSTRAÇÃO RECOMENDADA"}
                        </span>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                      </div>
                      <div className="pl-4 border-l-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-r-xl">
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic font-serif">
                          "{activeSermon.illustrations[0]}"
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Applications */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-4 select-none">
                      <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                        {language === "en" ? "PRACTICAL APPLICATION & APPEAL" : "APLICAÇÃO PRÁTICA E APELO"}
                      </span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    </div>
                    <div className="pl-4 border-l-2 border-amber-605/30 space-y-4">
                      <ul className="space-y-2">
                        {activeSermon.applications.map((app, aIdx) => (
                          <li key={aIdx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                            {app}
                          </li>
                        ))}
                      </ul>
                      <div className="p-5 rounded-xl bg-amber-600/5 dark:bg-amber-400/5 border border-amber-600/20">
                        <span className="text-[9px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400 block mb-1">
                          {language === "en" ? "Theologically Anchored Call (The Appeal)" : "Chamado Teológico (O Apelo)"}
                        </span>
                        <p className="text-xs md:text-sm text-black dark:text-white font-medium">
                          {activeSermon.appeal}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Closing Prayer Expander */}
                  {activeSermon.closingPrayerDraft && (
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="bg-slate-50 dark:bg-[#16223a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold text-black dark:text-amber-400 tracking-wider">
                          {language === "en" ? "PASTORAL CLOSING PRAYER DRAFT" : "RASCUNHO DA ORAÇÃO PASTORAL"}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed whitespace-pre-line text-justify">
                          {activeSermon.closingPrayerDraft}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
                      </div>
                    </div>
                  )}

        </section>

      </div>

    </div>
  );
}
