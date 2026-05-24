/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { Award, CheckCircle2, PlayCircle, ChevronRight, Sparkles } from "lucide-react";
import { AppState, BibleStudy, UserProfile } from "../types";
import { translations, getTranslatedCategory } from "../data/translations";

interface StudiesProps {
  state: AppState;
  language: "pt" | "en";
  onSaveState: (updated: AppState) => void;
}

export default function BibleStudiesView({ state, language, onSaveState }: StudiesProps) {
  const baseT = translations[language];
  const t = {
    ...baseT,
    studies: {
      ...baseT.studies,
      studiesSub: baseT.studies.sub,
      studiesTitle: baseT.studies.title,
      studiesDesc: baseT.studies.desc
    }
  };

  const [activeQuiz, setActiveQuiz] = useState<BibleStudy | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleStartStudy = (study: BibleStudy) => {
    setActiveQuiz(study);
    setCurrentQuestionIdx(0);
    setSelectedChoiceIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleSelectChoice = (idx: number) => {
    if (isAnswered) return;
    setSelectedChoiceIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedChoiceIdx === null || !activeQuiz || isAnswered) return;

    const currentQ = activeQuiz.questions[currentQuestionIdx];
    const isCorrect = selectedChoiceIdx === currentQ.answerIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedChoiceIdx(null);
      setIsAnswered(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    setQuizFinished(true);

    // Calculate final rewards and update app state
    const passed = score >= activeQuiz.questions.length / 2;
    if (passed) {
      const db = { ...state };
      const xpWon = activeQuiz.xpReward;
      
      // Update User Stats
      const updatedUser: UserProfile = {
        ...db.user,
        xp: db.user.xp + xpWon,
        studiesCompletedCount: db.user.studiesCompletedCount + 1,
        level: Math.floor((db.user.xp + xpWon) / 300) + 1 // Dynamic level formula
      };

      // Mark study completed
      const updatedStudies = db.studies.map((s) => {
        if (s.id === activeQuiz.id) {
          return { ...s, status: "completed" as const };
        }
        return s;
      });

      // Unlock 'Baluarte Teológico' badge if studiescompleted >= 1
      const updatedBadges = db.badges.map((b) => {
        if (b.id === "badge-3" && updatedUser.studiesCompletedCount >= 1) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      });

      onSaveState({
        ...db,
        user: updatedUser,
        studies: updatedStudies,
        badges: updatedBadges
      });
    }
  };

  // Helper translations for quiz questions
  const getTranslatedQuestionText = (qIndex: number): string => {
    if (!activeQuiz) return "";
    const originalText = activeQuiz.questions[qIndex].question;
    if (language === "en") {
      if (originalText.includes("Qual das seguintes fases")) {
        return "Which of the following historical phases is represented by the silver breast and arms in Nebuchadnezzar's statue?";
      }
      if (originalText.includes("Qual o significado espiritual")) {
        return "What is the spiritual meaning of the curtain/veil separating the Holy place from the Most Holy place inside the Sanctuary?";
      }
      if (originalText.includes("No Apocalipse, qual o significado das sete estrelas")) {
        return "In Revelation, what is the meaning of the seven stars in the right hand of Christ?";
      }
    }
    return originalText;
  };

  const getTranslatedChoices = (qIndex: number): string[] => {
    if (!activeQuiz) return [];
    const originalChoices = activeQuiz.questions[qIndex].choices;
    if (language === "en") {
      if (activeQuiz.id === "study-1") {
        return ["Babylonian Empire", "Medo-Persian Empire", "Greco-Macedonian Empire", "Roman Empire"];
      }
      if (activeQuiz.id === "study-2") {
        return [
          "The separation of God due to human sin, later restored by the sacrifice of Christ",
          "A barrier to prevent angels from seeing the Ark of the Covenant",
          "Simply a decorative drapery component made of high-quality fabrics"
        ];
      }
      if (activeQuiz.id === "study-3") {
        return [
          "Literal stars representing planets inside the celestial dome",
          "The messengers (pastors/leaders) representing the global church",
          "Roman emperors fighting against early disciples"
        ];
      }
    }
    return originalChoices;
  };

  const getTranslatedExplanation = (qIndex: number): string => {
    if (!activeQuiz) return "";
    const originalExplanation = activeQuiz.questions[qIndex].explanation;
    if (language === "en") {
      if (activeQuiz.id === "study-1") {
        return "Medo-Persia conquered Babylon in 539 B.C., succeeding the Babylonian gold empire as the silver chest/arms of Daniel 2.";
      }
      if (activeQuiz.id === "study-2") {
        return "Historically, the thick veil of the sanctuary represented sin separation. Upon Jesus' death, it torn down from top to bottom, granting access.";
      }
      if (activeQuiz.id === "study-3") {
        return "According to Revelation 1:20, the seven stars are the angels/messengers of the churches, under Christ's absolute protection and sovereignty.";
      }
    }
    return originalExplanation;
  };

  const getTranslatedQuizTitle = (quiz: BibleStudy): string => {
    if (language === "en") {
      if (quiz.id === "study-1") return "Daniel & Prophecies Map";
      if (quiz.id === "study-2") return "The Earthly Sanctuary";
      if (quiz.id === "study-3") return "Deep Apocalypse Study";
    }
    return quiz.title;
  };

  const getTranslatedQuizIntroDesc = (quiz: BibleStudy): string => {
    if (language === "en") {
      if (quiz.id === "study-1") return "Delve deep into historical-prophetic interpretations of Nebuchadnezzar's giant statue.";
      if (quiz.id === "study-2") return "A theological journey into Hebrew tabernacle symbols and eternal high-priestly models.";
      if (quiz.id === "study-3") return "Analyze the seals, trumpets and apostolic messengers of the early church.";
    }
    return `Lição acompanhada de ${quiz.questions.length} perguntas diagnósticas detalhadas do Santuário e contexto histórico neotestamentário.`;
  };

  return (
    <div className="space-y-10 text-black dark:text-white">
      
      {/* View Header */}
      <div className="select-none">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase block mb-2">
          {t.studies.studiesSub}
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight">
          {t.studies.studiesTitle}
        </h2>
        <p className="text-lg text-slate-655 dark:text-slate-300 mt-2 font-light max-w-2xl">
          {t.studies.studiesDesc}
        </p>
      </div>

      {activeQuiz ? (
        /* QUIZ PLAYER INTERFACE */
        <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-3xl p-8 shadow-sm">
          
          {quizFinished ? (
            /* FINISHED RESULTS SCREEN */
            <div className="text-center py-10 space-y-6 select-none">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 scale-110">
                <Award className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-3xl font-bold text-black dark:text-white">
                  {language === "en" ? "Study Completed!" : "Estudo Concluído!"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {language === "en" 
                    ? `You got ${score} of ${activeQuiz.questions.length} questions correct on "${getTranslatedQuizTitle(activeQuiz)}"`
                    : `Você acertou ${score} de ${activeQuiz.questions.length} perguntas de "${getTranslatedQuizTitle(activeQuiz)}"`}
                </p>
              </div>

              <div className="max-w-xs mx-auto py-4 px-6 bg-slate-50 dark:bg-[#15223a] rounded-2xl border border-slate-105 dark:border-slate-805">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                  {language === "en" ? "XP Reward Granted" : "XP Recompensada"}
                </span>
                <span className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-400">+{activeQuiz.xpReward} XP</span>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-8 py-3 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs tracking-wider uppercase rounded-full hover:bg-slate-850 dark:hover:bg-amber-450 transition-all cursor-pointer"
                >
                  {language === "en" ? "Back to Studies" : "Voltar para Estudos"}
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE QUESTION PANEL */
            <div className="space-y-6">
              
              {/* Progress and indicators */}
              <div className="flex justify-between items-center border-b border-slate-105 dark:border-slate-805 pb-4 select-none">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {language === "en" 
                    ? `QUESTION ${currentQuestionIdx + 1} OF ${activeQuiz.questions.length}`
                    : `QUESTÃO ${currentQuestionIdx + 1} DE ${activeQuiz.questions.length}`}
                </span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase rounded-full">
                  +{activeQuiz.xpReward} XP
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h4 className="font-serif text-xl md:text-2xl font-bold text-black dark:text-white text-justify select-text">
                  {getTranslatedQuestionText(currentQuestionIdx)}
                </h4>
              </div>

              {/* Choices list */}
              <div className="space-y-3 select-none">
                {getTranslatedChoices(currentQuestionIdx).map((choice, idx) => {
                  let borderStyle = "border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-[#162540]/30 hover:border-amber-500/30 dark:hover:border-amber-400/30";
                  let textStyle = "text-slate-700 dark:text-slate-300";

                  if (selectedChoiceIdx === idx) {
                    borderStyle = "border-amber-500 bg-amber-500/5 dark:border-amber-400";
                    textStyle = "text-amber-700 dark:text-amber-450 font-bold";
                  }

                  if (isAnswered) {
                    const correctIdx = activeQuiz.questions[currentQuestionIdx].answerIndex;
                    if (idx === correctIdx) {
                      borderStyle = "border-emerald-500 bg-emerald-500/5 dark:border-emerald-400";
                      textStyle = "text-emerald-700 dark:text-emerald-400 font-bold";
                    } else if (selectedChoiceIdx === idx) {
                      borderStyle = "border-red-500 bg-red-500/5 dark:border-red-400";
                      textStyle = "text-red-700 dark:text-red-400 font-bold";
                    } else {
                      borderStyle = "border-slate-105 dark:border-slate-805 opacity-40 bg-slate-50/20";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectChoice(idx)}
                      disabled={isAnswered}
                      className={`w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${borderStyle}`}
                    >
                      <span className={`text-xs md:text-sm ${textStyle}`}>{choice}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedChoiceIdx === idx ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200 dark:border-slate-850"
                      }`}>
                        {selectedChoiceIdx === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-105 dark:border-slate-805 flex justify-end select-none">
                {!isAnswered ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedChoiceIdx === null}
                    className="px-6 py-3 bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs tracking-wider uppercase rounded-xl disabled:opacity-40 shadow transition-all cursor-pointer"
                  >
                    {language === "en" ? "Submit Answer" : "Enviar Resposta"}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-slate-850 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {currentQuestionIdx < activeQuiz.questions.length - 1 
                      ? (language === "en" ? "Next Question" : "Próxima Questão") 
                      : (language === "en" ? "View Results" : "Ver Resultados")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Explanatory notes display on answered state */}
              {isAnswered && (
                <div className="mt-6 p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/20 space-y-2 select-text">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest select-none">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    {language === "en" ? "Theological Exegesis" : "Exegese Teológica"}
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-300 italic leading-relaxed text-justify">
                    {getTranslatedExplanation(currentQuestionIdx)}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* STUDIES TRACKS HUB */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
          {state.studies.map((study) => (
            <div 
              key={study.id} 
              className="group bg-white dark:bg-[#1a2b48] border border-slate-105 dark:border-slate-805 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all h-[340px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-505 dark:text-amber-400 uppercase tracking-wider">
                    {getTranslatedCategory(study.category, language)}
                  </span>
                  <span className="text-xs font-serif font-bold text-amber-600 dark:text-amber-400">
                    +{study.xpReward} XP
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-black dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {getTranslatedQuizTitle(study)}
                </h3>
                
                {/* Embedded description of the questions theme */}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-normal">
                  {getTranslatedQuizIntroDesc(study)}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-105 dark:border-slate-805">
                {study.status === "completed" ? (
                  <div className="flex items-center gap-2 text-emerald-650 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest pl-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {language === "en" ? "Completed" : "Concluído"}
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartStudy(study)}
                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4 text-amber-400" />
                    {language === "en" ? "Start Lesson" : "Iniciar Estudo"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
