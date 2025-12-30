/**
 * Challenge Component
 * Handles all 5 challenge types with validation and feedback
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemoryJourneyStore } from '@/store/memoryJourneyStore';
import type { Challenge, SceneAnswer } from '@/types/memory-journey.types';

interface ChallengeComponentProps {
  challenge: Challenge;
  xpReward: number;
  sceneNumber: number;
  isCompleted: boolean;
  onComplete: (xp: number) => void;
}

export function ChallengeComponent({
  challenge,
  xpReward,
  sceneNumber,
  isCompleted,
  onComplete,
}: ChallengeComponentProps) {
  const { completeScene, unlockNextScene, updateProgress } = useMemoryJourneyStore();

  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(isCompleted);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    if (selectedAnswer === null || selectedAnswer === undefined) return;

    setAttempts(attempts + 1);
    let correct = false;

    // Validate based on challenge type
    switch (challenge.type) {
      case 'multiple_choice':
      case 'scenario_decision':
        correct = selectedAnswer === challenge.correct_index;
        break;
      case 'true_false':
        correct = selectedAnswer === challenge.correct_answer;
        break;
      case 'fill_in_blank':
        const userAnswer = (selectedAnswer as string).toLowerCase().trim();
        const correctAnswer = challenge.correct_answer.toLowerCase().trim();
        correct = userAnswer === correctAnswer;
        break;
      case 'sequence_ordering':
        correct = JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correct_order);
        break;
    }

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Update progress
      const answer: SceneAnswer = {
        sceneNumber,
        answer: selectedAnswer,
        isCorrect: true,
        attempts: attempts + 1,
        xpEarned: xpReward,
        completedAt: new Date().toISOString(),
      };

      updateProgress(sceneNumber, answer);
      completeScene(sceneNumber, xpReward);
      unlockNextScene();
      onComplete(xpReward);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
  };

  return (
    <div className="px-2">
      {/* Challenge Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Tantangan</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold border border-purple-500/20">
          <Trophy className="w-4 h-4" />
          <span>{xpReward} XP</span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-lg text-gray-300 leading-relaxed">
          {challenge.question}
        </p>
      </div>

      {/* Answer Options */}
      {!isSubmitted && (
        <div className="space-y-3 mb-6">
          {/* Multiple Choice / Scenario Decision */}
          {(challenge.type === 'multiple_choice' || challenge.type === 'scenario_decision') && (
            <>
              {challenge.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === index
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-gray-600'
                      }`}>
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-gray-300">{option}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* True/False */}
          {challenge.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedAnswer(true)}
                className={`p-6 rounded-lg border-2 transition-all ${selectedAnswer === true
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✓</div>
                  <div className="font-semibold text-gray-300">Benar</div>
                </div>
              </button>
              <button
                onClick={() => setSelectedAnswer(false)}
                className={`p-6 rounded-lg border-2 transition-all ${selectedAnswer === false
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✗</div>
                  <div className="font-semibold text-gray-300">Salah</div>
                </div>
              </button>
            </div>
          )}

          {/* Fill in Blank */}
          {challenge.type === 'fill_in_blank' && (
            <Input
              type="text"
              placeholder="Ketik jawaban Anda..."
              value={selectedAnswer || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-lg p-4"
            />
          )}

          {/* Sequence Ordering */}
          {challenge.type === 'sequence_ordering' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-3">
                Urutkan item berikut (klik untuk memilih urutan):
              </p>
              {challenge.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const currentOrder = selectedAnswer || [];
                    if (currentOrder.includes(index)) {
                      setSelectedAnswer(currentOrder.filter((i: number) => i !== index));
                    } else {
                      setSelectedAnswer([...currentOrder, index]);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer?.includes(index)
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedAnswer?.includes(index) && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                        {selectedAnswer.indexOf(index) + 1}
                      </div>
                    )}
                    <span className="text-gray-300">{item}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {isSubmitted && isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-lg mb-6 ${isCorrect
            ? 'bg-green-500/10 border-2 border-green-500/50'
            : 'bg-red-500/10 border-2 border-red-500/50'
            }`}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <div className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ Jawaban Benar!' : '✗ Jawaban Salah'}
              </div>
              <p className="text-gray-300 leading-relaxed">
                {challenge.explanation}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isSubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null || selectedAnswer === undefined}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg font-semibold gap-2"
          >
            Submit Jawaban
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}

        {isSubmitted && !isCorrect && (
          <Button
            onClick={handleTryAgain}
            variant="outline"
            className="flex-1 border-gray-700 hover:bg-gray-800 py-6 text-lg"
          >
            Coba Lagi
          </Button>
        )}

        {isSubmitted && isCorrect && (
          <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400 font-semibold">
            <Trophy className="w-5 h-5" />
            <span>+{xpReward} XP Earned!</span>
          </div>
        )}
      </div>
    </div>
  );
}
