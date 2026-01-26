import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, BookmarkPlus, ChevronRight, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Question, QuizSessionState } from '@/types/quest.types';

interface QuizSessionProps {
  session: QuizSessionState;
  onSelectAnswer: (questionId: string, answerId: string) => void;
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

  const handleAnswerSelect = (optionId: string) => {
    if (currentAnswer) return;
    onSelectAnswer(currentQuestion.id, optionId);
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
          <span>Question <strong>{session.currentQuestionIndex + 1}</strong> / {session.questions.length}</span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">Score: {session.score}</span>
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

            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer?.selectedOptionId === option.id;
                const isCorrect = currentQuestion.correct === option.id;

                // Styles
                let borderColor = "border-gray-800";
                let bgColor = "bg-gray-900/50";

                if (currentAnswer) {
                  if (isCorrect) {
                    borderColor = "border-emerald-500";
                    bgColor = "bg-emerald-500/10";
                  } else if (isSelected && !currentAnswer.isCorrect) {
                    borderColor = "border-red-500";
                    bgColor = "bg-red-500/10";
                  } else {
                    bgColor = "opacity-40";
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={!!currentAnswer}
                    className={`
                      relative group flex items-start md:items-center gap-4 w-full p-4 rounded-xl border transition-all duration-200 text-left
                      ${borderColor} ${bgColor}
                      ${!currentAnswer ? 'active:scale-[0.98] hover:border-emerald-500/30' : ''}
                    `}
                  >
                    {/* Circle Indicator */}
                    <div className={`
                      flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border text-xs md:text-sm font-bold shrink-0 transition-colors mt-0.5 md:mt-0
                      ${isCorrect && currentAnswer ? 'border-emerald-500 bg-emerald-500 text-white' :
                        isSelected && currentAnswer && !currentAnswer.isCorrect ? 'border-red-500 bg-red-500 text-white' :
                          'border-gray-600 text-gray-400'}
                    `}>
                      {option.id}
                    </div>

                    <span className={`text-sm md:text-lg font-medium leading-relaxed ${currentAnswer && isCorrect ? 'text-emerald-400' : 'text-gray-200'}`}>
                      {option.text}
                    </span>

                    {/* Right Icon (Desktop preferred, or absolute right) */}
                    <div className="ml-auto pl-2">
                      {currentAnswer && isCorrect && <Check className="w-5 h-5 text-emerald-500" />}
                      {currentAnswer && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

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
      {currentAnswer && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-md border-t border-gray-800 z-50 flex justify-end
            md:static md:bg-transparent md:border-none md:p-0 md:mt-6
          `}
        >
          <div className="w-full md:w-auto flex justify-end">
            <Button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-full md:w-auto md:min-w-[200px] shadow-lg shadow-emerald-900/20"
              size="lg"
            >
              {session.currentQuestionIndex >= session.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
