/**
 * QuizMode Component - UPDATED
 * Interactive quiz game with instant feedback and scoring
 *
 * PATH: src/components/features/notes/WaitingExperience/QuizMode.tsx
 *
 * CHANGES:
 * - Load quizzes by category (not random from all)
 * - Back button returns to category selector
 * - Restart button loads new quizzes from same category
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Check, X, Trophy, Sparkles, RefreshCw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRandomQuizzesByCategory, type Quiz } from "@/data/waiting-experience";

// ============================================
// TYPES
// ============================================

interface QuizModeProps {
  categoryId: string; // Category selected by user
  onBack: () => void;
}

type QuizState = "question" | "answered" | "completed";

interface QuizAnswer {
  quizId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  points: number;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: { opacity: 0 },
};

const questionVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.2 },
  },
};

const optionVariants: any = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const correctVariants: any = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
};

const confettiVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.8],
    y: [-20, -40, -60, -80],
    transition: {
      duration: 1,
      times: [0, 0.3, 0.6, 1],
    },
  },
};

// ============================================
// COMPONENT
// ============================================

export function QuizMode({ categoryId, onBack }: QuizModeProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [state, setState] = useState<QuizState>("question");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load random quizzes by category on mount
  useEffect(() => {
    const categoryQuizzes = getRandomQuizzesByCategory(categoryId as Quiz["category"], 15);
    setQuizzes(categoryQuizzes);
  }, [categoryId]);

  // Current quiz
  const currentQuiz = quizzes[currentQuizIndex];
  const totalScore = answers.reduce((sum, answer) => sum + answer.points, 0);
  const correctAnswers = answers.filter((a) => a.isCorrect).length;

  // Handle answer selection
  const handleSelectAnswer = (optionIndex: number) => {
    if (state !== "question") return;

    setSelectedAnswer(optionIndex);
    setState("answered");

    const isCorrect = optionIndex === currentQuiz.correctAnswer;

    // Save answer
    setAnswers((prev) => [
      ...prev,
      {
        quizId: currentQuiz.id,
        selectedAnswer: optionIndex,
        isCorrect,
        points: isCorrect ? currentQuiz.points : 0,
      },
    ]);

    // Show confetti for correct answer
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setState("question");
      setSelectedAnswer(null);
    } else {
      setState("completed");
    }
  };

  // Handle restart quiz (load new quizzes from same category)
  const handleRestartQuiz = () => {
    const newQuizzes = getRandomQuizzesByCategory(categoryId as Quiz["category"], 15);
    setQuizzes(newQuizzes);
    setCurrentQuizIndex(0);
    setState("question");
    setSelectedAnswer(null);
    setAnswers([]);
  };

  if (!currentQuiz && state !== "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] relative">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>

        {/* Loading State */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto animate-pulse">
            <Brain className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-gray-400 text-sm">Memuat kuis...</p>
          <p className="text-xs text-gray-500">Kalau kelamaan, coba kembali & pilih lagi</p>
        </div>
      </div>
    );
  }

  // Completed state
  if (state === "completed") {
    const accuracy = (correctAnswers / quizzes.length) * 100;
    const grade = accuracy >= 80 ? "Luar Biasa!" : accuracy >= 60 ? "Bagus!" : "Lumayan!";
    const gradeEmoji = accuracy >= 80 ? "🌟" : accuracy >= 60 ? "👍" : "💪";

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 rounded-t-2xl">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Kembali</span>
          </motion.button>
        </div>

        {/* Results */}
        <div className="px-4 sm:px-6 py-8 space-y-6">
          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h2 className="text-3xl font-bold text-white">
              {gradeEmoji} {grade}
            </h2>
            <p className="text-gray-400">Kuis selesai! Ini hasilnya nih:</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Score */}
            <div className="p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{totalScore}</div>
              <div className="text-xs text-gray-400">Total Poin</div>
            </div>

            {/* Correct */}
            <div className="p-4 rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                {correctAnswers}/{quizzes.length}
              </div>
              <div className="text-xs text-gray-400">Benar</div>
            </div>

            {/* Accuracy */}
            <div className="p-4 rounded-xl bg-linear-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{accuracy.toFixed(0)}%</div>
              <div className="text-xs text-gray-400">Akurasi</div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-sm text-gray-300 text-center leading-relaxed">
              {accuracy >= 80
                ? "Ma sha Allah! Pengetahuan Islammu keren banget! Keep learning ya~ 🌟"
                : accuracy >= 60
                  ? "Bagus! Kamu udah lumayan jago nih. Terus belajar ya biar makin pro! 👍"
                  : "Gapapa, yang penting udah berani coba! Yuk main lagi buat ningkatin skor! 💪"}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRestartQuiz}
              className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Main Lagi
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Question state
  const isCorrect = selectedAnswer === currentQuiz.correctAnswer;
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto relative"
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                variants={confettiVariants}
                initial="hidden"
                animate="visible"
                className="absolute"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 60}%`,
                  top: "50%",
                }}
              >
                <Star
                  className="w-6 h-6"
                  style={{
                    color: ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"][i % 5],
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                {currentQuizIndex + 1}/{quizzes.length}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">{totalScore}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-linear-to-r from-emerald-500 to-teal-500"
          />
        </div>
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuiz.id}
          variants={questionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="px-4 sm:px-6 py-6 space-y-6"
        >
          {/* Question */}
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">{currentQuiz.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuiz.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuiz.correctAnswer;
              const showResult = state === "answered";

              return (
                <motion.button
                  key={index}
                  custom={index}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={state === "question" ? { scale: 1.02, x: 4 } : {}}
                  whileTap={state === "question" ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={state !== "question"}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                    "disabled:cursor-not-allowed",
                    !showResult && "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
                    showResult &&
                    isCorrectOption &&
                    "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20",
                    showResult && isSelected && !isCorrect && "bg-red-500/10 border-red-500/50 ring-2 ring-red-500/20",
                    showResult && !isSelected && !isCorrectOption && "bg-white/5 border-white/10 opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Option Letter */}
                    <div
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-colors",
                        !showResult && "bg-white/10 text-white",
                        showResult && isCorrectOption && "bg-emerald-500 text-white",
                        showResult && isSelected && !isCorrect && "bg-red-500 text-white",
                        showResult && !isSelected && !isCorrectOption && "bg-white/10 text-white/50"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>

                    {/* Option Text */}
                    <span
                      className={cn(
                        "flex-1 text-sm sm:text-base transition-colors",
                        !showResult && "text-gray-200",
                        showResult && isCorrectOption && "text-emerald-300 font-medium",
                        showResult && isSelected && !isCorrect && "text-red-300",
                        showResult && !isSelected && !isCorrectOption && "text-gray-400"
                      )}
                    >
                      {option}
                    </span>

                    {/* Result Icon */}
                    {showResult && isCorrectOption && (
                      <motion.div variants={correctVariants} initial="initial" animate="animate">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </motion.div>
                    )}
                    {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-red-400" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation (Show after answer) */}
          <AnimatePresence>
            {state === "answered" && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={cn(
                    "p-4 rounded-xl border",
                    isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-blue-500/10 border-blue-500/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5",
                        isCorrect ? "bg-emerald-500/20" : "bg-blue-500/20"
                      )}
                    >
                      <Sparkles className={cn("w-4 h-4", isCorrect ? "text-emerald-400" : "text-blue-400")} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className={cn("font-semibold text-sm", isCorrect ? "text-emerald-300" : "text-blue-300")}>
                        {isCorrect ? "✅ Bener Banget!" : "💡 Penjelasan:"}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{currentQuiz.explanation}</p>
                      {isCorrect && <p className="text-xs text-emerald-400/80">+{currentQuiz.points} poin</p>}
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                  className="w-full mt-4 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all"
                >
                  {currentQuizIndex < quizzes.length - 1 ? "Lanjut →" : "Lihat Hasil 🎉"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
