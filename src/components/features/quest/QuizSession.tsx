import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Check, X, BookmarkPlus, ChevronRight, HelpCircle, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Question, QuizSessionState } from '@/types/quest.types';

interface QuizSessionProps {
  session: QuizSessionState;
  onSelectAnswer: (questionId: string, answerId: string | string[]) => void;
  onNextQuestion: () => void;
  // onSaveToNotes: (question: Question) => void;
}

export const QuizSession = ({
  session,
  onSelectAnswer,
  onNextQuestion,
  // onSaveToNotes,
}: QuizSessionProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const currentAnswer = session.userAnswers.find((a) => a.questionId === currentQuestion.id);
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  if (!currentQuestion) return null;

  const handleAnswerSelect = (optionId: string | string[]) => {
    if (currentAnswer) return;
    onSelectAnswer(currentQuestion.id, optionId); // Pass the actual value (string or array)
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    onNextQuestion();
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 md:pb-20 relative">
      {/* Header / Progress */}
      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 sticky top-0 bg-black/90 backdrop-blur-sm pt-2 -mt-2 pb-2 z-30">
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-400">
          <span>Soal <strong>{session.currentQuestionIndex + 1}</strong> / {session.questions.length}</span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">Skor: {session.score}</span>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 md:h-2 bg-gray-800" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl md:text-3xl font-bold leading-snug text-white">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options Area */}
            {currentQuestion.type === 'puzzle_order' ? (
              <PuzzleOrderView
                options={currentQuestion.options}
                correct={currentQuestion.correct}
                hasAnswered={!!currentAnswer}
                userAnswer={currentAnswer}
                onSubmit={(ids: string[]) => handleAnswerSelect(ids)}
              />
            ) : (
              <div className={`grid ${currentQuestion.type === 'true_false' ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'gap-3'}`}>
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer?.selectedOptionId === option.id;
                  const isCorrect = currentQuestion.correct === option.id;

                  // Styles Logic
                  let btnClass = "border-gray-800 bg-gray-900/50";
                  let contentClass = "text-gray-200";

                  // TRUE / FALSE SPECIFIC
                  if (currentQuestion.type === 'true_false') {
                    const isTrue = option.id === 'true';
                    btnClass = isTrue
                      ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20";

                    if (currentAnswer) {
                      if (isCorrect) { btnClass = "border-emerald-500 bg-emerald-500 text-black"; contentClass = "text-black font-bold"; }
                      else if (isSelected && !isCorrect) { btnClass = "border-red-500 bg-red-500 text-white"; contentClass = "text-white font-bold"; }
                      else { btnClass = "opacity-40 grayscale border-gray-800"; }
                    } else if (isSelected) { // Selected but not submitted yet (rare in this logic but good for future)
                      // Logic handled by disabled state usually, but for instant submit:
                    }
                  }
                  // MULTIPLE CHOICE SPECIFIC
                  else {
                    if (currentAnswer) {
                      if (isCorrect) { btnClass = "border-emerald-500 bg-emerald-500/10"; contentClass = "text-emerald-400"; }
                      else if (isSelected && !isCorrect) { btnClass = "border-red-500 bg-red-500/10"; contentClass = "text-red-400"; }
                      else { btnClass = "opacity-40 bg-gray-900/50 border-gray-800"; }
                    } else {
                      btnClass = "border-gray-800 bg-gray-900/50 hover:border-emerald-500/30 active:scale-[0.98]";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={!!currentAnswer}
                      className={`
                        relative group flex items-center w-full p-4 rounded-xl border transition-all duration-200 text-left overflow-hidden
                        ${btnClass} 
                        ${currentQuestion.type === 'true_false' ? 'h-32 flex-col justify-center gap-2' : 'gap-4'}
                        `}
                    >
                      {currentQuestion.type === 'true_false' && (
                        <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                          {option.id === 'true' ? <CheckCircle2 size={80} /> : <XCircle size={80} />}
                        </div>
                      )}

                      {/* Alphabet label removed to avoid confusion when shuffled */}

                      <span className={`font-medium ${contentClass} ${currentQuestion.type === 'true_false' ? 'text-xl font-bold uppercase tracking-widest' : 'text-sm md:text-lg leading-relaxed'}`}>
                        {option.text}
                      </span>

                      <div className={`ml-auto pl-2 ${currentQuestion.type === 'true_false' ? 'absolute top-4 right-4' : ''}`}>
                        {currentAnswer && isCorrect && <Check className="w-5 h-5 text-emerald-500" />}
                        {currentAnswer && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sticky Bottom Bar for Next Action - Moved Above Explanation */}
      {currentAnswer && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-md border-t border-gray-800 z-50 flex justify-end
            md:static md:bg-transparent md:border-none md:p-0 md:mt-8 md:mb-4
          `}
        >
          <div className="w-full md:w-auto flex justify-end">
            <Button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-full md:w-auto md:min-w-[200px] shadow-lg shadow-emerald-900/20"
              size="lg"
            >
              {session.currentQuestionIndex >= session.questions.length - 1 ? 'Selesai' : 'Soal Berikutnya'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Explanation Area */}
      <AnimatePresence>
        {currentAnswer && showExplanation && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden mt-8"
          >
            <div className={`h-1 w-full ${currentAnswer.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${currentAnswer.isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {currentAnswer.isCorrect ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-base md:text-lg ${currentAnswer.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentAnswer.isCorrect ? 'Benar!' : 'Kurang Tepat'}
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {currentAnswer.isCorrect ? `+${currentQuestion.points || 10} poin` : 'Tetap semangat!'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-semibold text-xs md:text-sm uppercase tracking-wider">Penjelasan</span>
                </div>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {currentQuestion.explanation.text}
                </p>
                {currentQuestion.explanation.dalil && (
                  <div className="mt-3 p-3 rounded-lg bg-black/30 border border-gray-800">
                    <p className="text-emerald-200/80 text-xs md:text-sm italic font-serif leading-relaxed">
                      "{currentQuestion.explanation.dalil}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Bar for Next Action */}
    </div>
  );
};

// ------------------------------------------------------------------
// PUZZLE ORDER VIEW COMPONENT (Reused Logic)
// ------------------------------------------------------------------
const PuzzleOrderView = ({ options, correct, hasAnswered, onSubmit }: any) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!hasAnswered) {
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      setItems(shuffled);
    } else {
      // Show correct order on result
      try {
        const correctIds: string[] = JSON.parse(correct);
        const sorted = correctIds.map(id => options.find((o: any) => o.id === id)).filter(Boolean);
        setItems(sorted);
      } catch (e) {
        setItems(options);
      }
    }
  }, [options, hasAnswered, correct]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Helper Hint */}
      {!hasAnswered && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
          <GripVertical size={14} />
          <span>Geser untuk mengurutkan jawaban</span>
        </div>
      )}

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={hasAnswered ? () => { } : setItems}
        className="space-y-3"
      >
        {items.map((item, idx) => (
          <Reorder.Item
            key={item.id}
            value={item}
            dragListener={!hasAnswered}
            whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}
            className={`cursor-grab active:cursor-grabbing relative`}
          >
            <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${hasAnswered
              ? 'bg-gray-800/60 border-indigo-500/30'
              : 'bg-gray-800 hover:bg-gray-800/80 border-gray-700 hover:border-emerald-500/50 shadow-sm'
              }`}>
              {/* Drag Handle */}
              {!hasAnswered && (
                <div className="text-gray-500 cursor-grab active:cursor-grabbing p-1 hover:text-white transition-colors">
                  <GripVertical size={20} />
                </div>
              )}

              {/* Index Number */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${hasAnswered ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-gray-400 border-white/10'
                }`}>
                {idx + 1}
              </div>

              <span className="flex-1 text-gray-200 font-medium select-none">{item.text}</span>

              {hasAnswered && <CheckCircle2 className="w-5 h-5 text-emerald-500/50" />}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!hasAnswered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg shadow-lg shadow-emerald-900/20"
            onClick={() => onSubmit(items.map(i => i.id))}
          >
            Submit Jawaban <CheckCircle2 className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
