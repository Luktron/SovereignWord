/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Share2, Sparkles, BookOpen, Quote, HelpCircle, FileText, Compass } from "lucide-react";
import { ChatMessage } from "../types";
import { translations } from "../data/translations";

interface TheologyAIProps {
  language: "pt" | "en";
}

export default function TheologyAI({ language }: TheologyAIProps) {
  const t = translations[language];

  const getInitialMessages = (): ChatMessage[] => {
    if (language === "en") {
      return [
        {
          id: "m-1",
          sender: "assistant",
          text: `### Grace in Biblical and Historical Tradition

In biblically grounded theology, grace is understood as the unmerited favor of God toward fallen humanity. However, its operation and scope are categorized into precise theological domains:

#### 1. Common Grace
Refers to the universal care of God bestowed upon all humanity, regardless of belief or faithfulness. It sustains cosmic order, restrains the destructive effects of sin, enables civic virtue, and promotes the flourishing of science, culture, and art.

#### 2. Saving Grace (Special)
This is the direct and regenerating action of the Holy Spirit inside the heart of the believer. It convicts of sin, awakens to righteousness, grants saving faith, and triggers daily sanctification in the lives of those who accept Christ's substitutionary sacrifice.`,
          insight: "Common grace preserves the existence of a fallen world; saving grace redeems the eternal soul.",
          sources: ["Romans 8:1-4", "John 3:16", "Steps to Christ, ch. 1"],
          timestamp: "10:42 AM"
        }
      ];
    } else {
      return [
        {
          id: "m-1",
          sender: "assistant",
          text: `### Graça na Tradição Bíblica e Histórica

Na teologia fundamentada nas Escrituras, a graça é compreendida como o favor imerecido de Deus para com o ser humano decaído. No entanto, sua operação e escopos são categorizados de modo preciso:

#### 1. Graça Comum
Refere-se ao cuidado universal de Deus concedido a toda a humanidade, independente de crença ou fidelidade. Ela sustenta a ordem cósmica, restringe os efeitos destruidores do pecado, habilita a virtude cívica e promove o florescimento da ciência, da cultura e da arte.

#### 2. Graça Salvadora (Especial)
É a ação direta e regeneradora do Espírito Santo no coração do crente. Ela convence do pecado, desperta para a justiça, concede fé salvadora e opera a santificação diária na vida daqueles que aceitam o sacrifício vicário de Cristo Jesus no calvário.`,
          insight: "A graça comum preserva a existência do mundo decaído; a graça salvadora redime a alma eterna.",
          sources: ["Romanos 8:1-4", "João 3:16", "Caminho a Cristo, cap. 2"],
          timestamp: "10:42 AM"
        }
      ];
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [promptInput, setPromptInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restart messages when language changes so it corresponds properly
  const initializedLanguageRef = useRef(language);
  if (initializedLanguageRef.current !== language) {
    initializedLanguageRef.current = language;
    setMessages(getInitialMessages());
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAsk = async (userPrompt: string) => {
    if (!userPrompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/theology/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userPrompt, 
          chatHistory: historyPayload,
          language: language
        })
      });

      if (!res.ok) throw new Error("Erro na rede do assistente");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: data.text,
        insight: data.insight,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: language === "en" 
          ? "Sorry, a temporary theological connection error occurred. Please ensure your API Key is specified in the Secrets tab."
          : "Desculpe-me, ocorreu um erro de conexão teológica temporária ao processar sua pergunta. Por favor, certifique-se de que sua Chave de API está configurada nos Secrets.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (type: string) => {
    let text = "";
    if (type === "history") {
      text = language === "en"
        ? "Explain the historical-prophetic context of Nebuchadnezzar's statue in Daniel 2."
        : "Explique o contexto histórico-profético da estátua de Nabucodonosor em Daniel 2.";
    } else if (type === "quiz") {
      text = language === "en"
        ? "Create a 3-question quiz on the prophecy of the seven trumpets in Revelation."
        : "Crie um quiz com 3 perguntas sobre as profecias das sete trombetas de Apocalipse.";
    } else if (type === "white") {
      text = language === "en"
        ? "What is Ellen White's theological view on the role of the earthly sanctuary in the end times?"
        : "Qual a visão de Ellen White sobre o papel do Santuário no tempo do fim?";
    }
    handleAsk(text);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[76vh] lg:h-[80vh] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1a2b48] shadow-sm text-black dark:text-white">
      
      {/* Sidebar - Insights Teológicos (Prophecies layout) */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#15223a] p-6 overflow-y-auto flex flex-col justify-between select-none">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xs font-bold tracking-widest text-black dark:text-white uppercase">
              {t.theology.insightTitle}
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-900 dark:text-amber-300 italic font-medium leading-relaxed">
              {language === "en"
                ? `"Thou, O king, sawest, and behold a great image. This great image, whose brightness was excellent, stood before thee..."`
                : `"Tu, ó rei, estavas vendo, e eis aqui uma grande estátua; esta estátua, que era grande e cujo esplendor era excelente, estava em pé diante de ti..."`}
            </p>
            <span className="text-[10px] text-amber-800/70 dark:text-amber-400/70 font-semibold block mt-1 text-right">
              — {language === "en" ? "Daniel 2:31" : "Daniel 2:31"}
            </span>
          </div>

          {/* Daniel 2 statue breakdown list */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t.theology.statueBreakdown}</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 bg-white dark:bg-[#1a2b48] rounded border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{language === "en" ? "Gold" : "Ouro"}</span>
                <span className="text-slate-600 dark:text-slate-300">{language === "en" ? "Babylon" : "Babilônia"} (605-539 BC)</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-white dark:bg-[#1a2b48] rounded border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-400">{language === "en" ? "Silver" : "Prata"}</span>
                <span className="text-slate-600 dark:text-slate-300">{language === "en" ? "Medo-Persia" : "Medo-Pérsia"} (539-331 BC)</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-white dark:bg-[#1a2b48] rounded border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-amber-500">{language === "en" ? "Bronze" : "Bronze"}</span>
                <span className="text-slate-600 dark:text-slate-300">{language === "en" ? "Greece" : "Grécia"} (331-168 BC)</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-white dark:bg-[#1a2b48] rounded border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-300">{language === "en" ? "Iron" : "Ferro"}</span>
                <span className="text-slate-600 dark:text-slate-300">{language === "en" ? "Imperial Rome" : "Roma Imperial"} (168 BC-476 AD)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block pt-4 text-black dark:text-white">
          <div className="p-4 bg-slate-100/50 dark:bg-[#1a2b48]/50 rounded-xl text-center">
            <h4 className="text-xs font-bold text-black dark:text-slate-300 uppercase tracking-wider mb-1">
              {t.theology.adventistDepth}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {t.theology.depthDesc}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col justify-between bg-white dark:bg-[#162540] transition-colors">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/70 dark:bg-[#162540]/70 backdrop-blur-md z-10 select-none">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-black dark:text-white leading-tight">
                {t.theology.title}
              </h2>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                {language === "en" ? "System Connected" : "Sistema Online"}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-400 transition-colors cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 select-text">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              {m.sender !== "user" && (
                <div className="w-8 h-8 rounded-xl bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${m.sender === "user" ? "text-right" : ""}`}>
                <div 
                  className={`p-6 rounded-2xl border text-left shadow-sm ${
                    m.sender === "user"
                      ? "bg-amber-600 border-amber-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-[#1e304f] border-slate-200 dark:border-slate-800 text-black dark:text-white rounded-tl-none"
                  }`}
                >
                  <div className="prose prose-slate dark:prose-invert prose-sm max-w-full leading-relaxed">
                    {m.text.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("###")) {
                        return <h3 key={pIdx} className="font-serif text-lg font-bold text-amber-700 dark:text-amber-400 mt-2 mb-2">{para.replace("###", "")}</h3>;
                      }
                      if (para.startsWith("####")) {
                        return <h4 key={pIdx} className="font-serif text-sm font-bold text-black dark:text-white mt-2 mb-1">{para.replace("####", "")}</h4>;
                      }
                      if (para.startsWith("-") || para.startsWith("*")) {
                        return (
                          <ul key={pIdx} className="list-disc pl-4 space-y-1 my-2">
                            {para.split("\n").map((li, lIdx) => (
                              <li key={lIdx} className="text-xs text-slate-600 dark:text-slate-300">{li.replace(/^[\s-*]+/, "")}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={pIdx} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-2 whitespace-pre-line">{para}</p>;
                    })}
                  </div>

                  {/* Insight Box */}
                  {m.insight && (
                    <div className="mt-6 p-4 bg-amber-500/5 dark:bg-amber-400/5 rounded-xl border border-amber-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        <Quote className="w-3.5 h-3.5" />
                        Lumina Insight
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal italic">
                        {m.insight}
                      </p>
                    </div>
                  )}

                  {/* Sources Chips */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-wrap gap-2">
                      {m.sources.map((src, sIdx) => (
                        <span 
                          key={sIdx} 
                          className="px-3 py-1 bg-slate-50 dark:bg-[#162540] border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-bold text-slate-700 dark:text-amber-400 inline-flex items-center gap-1.5 uppercase hover:bg-slate-100 transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 inline-block mt-2">
                  {m.timestamp}
                </span>
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 shadow">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#1e304f] border border-slate-200 dark:border-slate-800 space-y-3 w-[60%] rounded-tl-none">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 py-2 flex flex-wrap gap-2 justify-center select-none">
            <button 
              onClick={() => handleSuggestion("history")}
              className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 transition-colors bg-slate-50 dark:bg-[#1a2b48]/40 text-black dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              {t.theology.suggestDaniel}
            </button>
            <button 
              onClick={() => handleSuggestion("quiz")}
              className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 transition-colors bg-slate-50 dark:bg-[#1a2b48]/40 text-black dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              {t.theology.suggestApocalypse}
            </button>
            <button 
              onClick={() => handleSuggestion("white")}
              className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 transition-colors bg-slate-50 dark:bg-[#1a2b48]/40 text-black dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              {t.theology.suggestWhite}
            </button>
          </div>
        )}

        {/* Chat Input */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#162540]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAsk(promptInput); }}
            className="flex items-center bg-slate-50 dark:bg-[#1a2b48] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-1 hover:shadow-sm transition-shadow shadow-inner"
          >
            <input 
              type="text" 
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={t.theology.inputPlaceholder}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-4 px-2 text-sm text-black dark:text-white placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={!promptInput.trim() || loading}
              className="w-11 h-11 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white rounded-xl flex items-center justify-center shadow disabled:opacity-40 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-2 font-light uppercase tracking-widest select-none">
            {t.theology.subtext}
          </p>
        </div>

      </section>

    </div>
  );
}
