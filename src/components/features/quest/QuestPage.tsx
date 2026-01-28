import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, BookOpen, Layers, Trophy, Star, Target, Swords, Zap } from 'lucide-react';
import { useQuestStore } from '@/store/questStore';
import { TopHeader } from '@/components/layout/TopHeader';
import { QuizSession } from './QuizSession';
import { Button } from '@/components/ui/button';
import type { Topic, Subtopic } from '@/types/quest.types';
import { QuestMultiplayerView } from './multiplayer/QuestMultiplayerView';
import { QuestionLimitDialog } from './QuestionLimitDialog';
import { questAppwriteService } from '@/services/appwrite';

type ViewState = 'TOPICS' | 'SUBTOPICS' | 'QUIZ' | 'RESULTS' | 'MULTIPLAYER';

export const QuestPage = () => {
  const {
    topics,
    subtopics,
    activeSession,
    isLoadingTopics,
    isLoadingSubtopics,
    fetchTopics,
    fetchSubtopics,
    startQuiz,
    resetQuiz,
    submitAnswer,
    nextQuestion,
  } = useQuestStore();

  const [view, setView] = useState<ViewState>('TOPICS');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [showQuestionLimitDialog, setShowQuestionLimitDialog] = useState(false);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);

  // Initial Fetch
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Handle Session Completion
  useEffect(() => {
    if (activeSession?.isCompleted) {
      setView('RESULTS');
    }
  }, [activeSession?.isCompleted]);

  // Handlers
  const handleTopicClick = async (topic: Topic) => {
    setSelectedTopic(topic);
    setView('SUBTOPICS');
    await fetchSubtopics(topic.slug || topic.id);
  };

  const handleSubtopicClick = async (subtopic: Subtopic) => {
    // Fetch total questions for this subtopic
    const questions = await questAppwriteService.getQuestionsBySubtopic(subtopic.slug);
    setTotalAvailableQuestions(questions?.length || 0);
    setSelectedSubtopic(subtopic);

    // Show dialog to choose question count
    setShowQuestionLimitDialog(true);
  };

  const handleQuestionLimitConfirm = async (limit: number) => {
    if (selectedSubtopic) {
      setShowQuestionLimitDialog(false);
      await startQuiz(selectedSubtopic, limit);
      setView('QUIZ');
    }
  };

  const handleQuestionLimitCancel = () => {
    setShowQuestionLimitDialog(false);
    setSelectedSubtopic(null);
  };

  const handleBack = () => {
    if (view === 'SUBTOPICS') {
      setView('TOPICS');
      setSelectedTopic(null);
    } else if (view === 'QUIZ' || view === 'RESULTS') {
      resetQuiz();
      setView('SUBTOPICS');
    } else if (view === 'MULTIPLAYER') {
      setView('TOPICS');
    }
  };

  const handleRetry = () => {
    if (selectedTopic) {
      resetQuiz();
      setView('SUBTOPICS');
    }
  };

  // --- RENDERS ---

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
      <TopHeader
        backButton
        backTo="/dashboard"
        className="bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50"
      />

      <main className="container max-w-5xl mx-auto px-3 md:px-4 py-6 md:py-12 relative min-h-[calc(100vh-60px)]">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-teal-500/10 rounded-full blur-[60px] md:blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">

          {/* VIEW: MULTIPLAYER */}
          {view === 'MULTIPLAYER' && (
            <motion.div
              key="multiplayer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <QuestMultiplayerView onBack={handleBack} />
            </motion.div>
          )}

          {/* VIEW: TOPICS */}
          {view === 'TOPICS' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 md:space-y-10"
            >

              {/* Header & Multiplayer Button */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
                <div className="space-y-2 text-left">
                  <h1 className="text-3xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white leading-normal">
                    Knowledge Quest
                  </h1>
                  <p className="text-gray-400 text-sm md:text-lg">
                    Uji pemahaman dan tambah wawasan
                  </p>
                </div>

                <Button
                  onClick={() => setView('MULTIPLAYER')}
                  className="relative group overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300 h-10 md:h-12 px-5 md:px-8 rounded-full"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 blur-xl" />
                  <div className="relative flex items-center gap-2 md:gap-3">
                    <Swords className="w-4 h-4 md:w-5 md:h-5 text-violet-200 group-hover:text-white transition-colors animate-pulse" />
                    <span className="font-bold tracking-wide uppercase text-xs md:text-sm">Live Challenge</span>
                  </div>
                </Button>
              </div>

              {isLoadingTopics ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="group relative flex flex-col p-4 md:p-8 rounded-xl md:rounded-3xl bg-gray-900/40 border border-white/5 hover:border-emerald-500/50 hover:bg-gray-900/80 transition-all duration-300 text-left overflow-hidden active:scale-95 touch-manipulation"
                    >
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:to-emerald-500/10 transition-all duration-500" />

                      <div className="relative z-10 flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center md:mb-6 group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-2xl font-bold text-white md:mb-2 group-hover:text-emerald-400 transition-colors">
                            {topic.name}
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm hidden md:block">
                            Jelajahi kumpulan kuis seputar {topic.name}.
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: SUBTOPICS */}
          {view === 'SUBTOPICS' && selectedTopic && (
            <motion.div
              key="subtopics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-8 sticky top-16 z-40 bg-black/80 backdrop-blur-md p-2 -mx-2 rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-full hover:bg-white/10 h-10 w-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-white">{selectedTopic.name}</h2>
                  <p className="text-xs md:text-base text-emerald-400/80">Pilih materi kuis</p>
                </div>
              </div>

              {isLoadingSubtopics ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="h-[calc(100vh-180px)] overflow-y-auto pb-10 pr-2 md:pr-4 custom-scrollbar">
                  <div className="grid gap-3 md:gap-4">
                    {subtopics[selectedTopic.slug]?.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubtopicClick(sub)}
                        className="w-full group flex items-center gap-4 p-5 rounded-xl bg-gray-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-gray-900/80 transition-all text-left active:scale-[0.98] touch-manipulation"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                          <Layers className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base md:text-xl font-semibold text-gray-100 group-hover:text-emerald-300 transition-colors truncate">
                            {sub.title}
                          </h4>
                          {sub.description && (
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{sub.description}</p>
                          )}
                        </div>
                        <div className="text-[10px] md:text-xs font-mono text-gray-600 group-hover:text-emerald-500/50 shrink-0">
                          START &rarr;
                        </div>
                      </button>
                    )) || (
                        <div className="text-center py-20 text-gray-500">
                          Belum ada subtopik untuk kategori ini.
                        </div>
                      )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: QUIZ & RESULTS */}
          {view === 'QUIZ' && activeSession && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full"
            >
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-500 hover:text-white -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quit
                </Button>
              </div>

              <QuizSession
                session={activeSession}
                onSelectAnswer={submitAnswer}
                onNextQuestion={nextQuestion}
              />
            </motion.div>
          )}

          {view === 'RESULTS' && activeSession && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 md:space-y-8"
            >
              {(() => {
                const totalPoints = activeSession.questions.length * 10;
                const percentage = Math.round((activeSession.score / totalPoints) * 100);

                let Icon = Target;
                let title = "Tetap Semangat!";
                let desc = "Jangan menyerah, ulangi lagi biar makin paham.";
                let colorClass = "from-orange-400 to-red-400";
                let iconColor = "text-orange-400";

                if (percentage >= 80) {
                  Icon = Trophy;
                  title = "Luar Biasa!";
                  desc = "MasyaaAllah, pemahamanmu sangat baik!";
                  colorClass = "from-emerald-400 to-teal-400";
                  iconColor = "text-emerald-400";
                } else if (percentage >= 60) {
                  Icon = Star;
                  title = "Kerja Bagus!";
                  desc = "Lumayan, tinggal sedikit lagi sempurna.";
                  colorClass = "from-blue-400 to-indigo-400";
                  iconColor = "text-blue-400";
                }

                return (
                  <>
                    <div className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-tr ${colorClass} p-[1px] shadow-[0_0_50px_rgba(16,185,129,0.2)]`}>
                      <div className="w-full h-full bg-black/95 rounded-[22px] flex items-center justify-center backdrop-blur-sm">
                        <Icon className={`w-14 h-14 md:w-20 md:h-20 ${iconColor}`} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="space-y-3 px-4 max-w-lg mx-auto">
                      <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {title}
                      </h2>
                      <div className="space-y-3">
                        <p className="text-lg md:text-2xl font-bold text-white">
                          Skor Kamu: <br /><span className={`bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>{activeSession.score}</span> / {totalPoints}
                        </p>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto px-8 md:px-0 pt-4 md:pt-8">
                <Button size="lg" onClick={handleRetry} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto min-w-[160px]">
                  Coba Lagi
                </Button>
                <Button variant="outline" size="lg" onClick={handleBack} className="border-gray-700 hover:bg-gray-800 w-full md:w-auto min-w-[160px]">
                  Pilih Topik Lain
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Question Limit Dialog */}
        {showQuestionLimitDialog && (
          <QuestionLimitDialog
            totalQuestions={totalAvailableQuestions}
            onConfirm={handleQuestionLimitConfirm}
            onCancel={handleQuestionLimitCancel}
          />
        )}
      </main>
    </div>
  );
};
