import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questAppwriteService } from '@/services/appwrite/questService';
import { appwriteDatabases, APPWRITE_DATABASE_ID, COLLECTIONS } from '@/services/appwrite/client';
import type { Question } from '@/types/quest.types';
import confetti from 'canvas-confetti';

interface Props {
  roomId: string;
  onFinish: () => void;
}

interface RoomData {
  $id: string;
  players: string; // JSON
  current_question_idx: number;
  status: string;
  topic_config: string;
  host_uid: string;
}

export const MultiplayerGame = ({ roomId, onFinish }: Props) => {
  const { user } = useAuthStore();

  // State
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 1. Initial Load (Questions & Room)
  useEffect(() => {
    const init = async () => {
      try {
        const doc = await appwriteDatabases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId) as any;
        setRoomData(doc);

        // Parse Config & Fetch Questions
        const config = JSON.parse(doc.topic_config || "{}");
        if (config.subtopic) {
          const qs = await questAppwriteService.getQuestionsBySubtopic(config.subtopic.id, config.totalQuestions);
          setQuestions(qs);
        }
        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [roomId]);

  // 2. Realtime Listener
  useEffect(() => {
    const unsubscribe = questAppwriteService.subscribeToRoom(roomId, (payload) => {
      if (payload.events.some((e: string) => e.includes('.update'))) {
        const updated = payload.payload as RoomData;
        setRoomData(updated);
        setPlayers(JSON.parse(updated.players || "[]"));

        // Detect Phase Change
        if (updated.status === 'FINISHED') {
          onFinish();
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // 3. Reset state on Question Change
  useEffect(() => {
    if (roomData) {
      setHasAnswered(false);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  }, [roomData?.current_question_idx]);


  // Handlers
  const handleAnswer = async (optionId: string) => {
    if (hasAnswered || !roomData || !user) return;

    const currentQ = questions[roomData.current_question_idx];
    const isAnsCorrect = optionId === currentQ.correct;

    setSelectedOption(optionId);
    setHasAnswered(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

    // Calculate Score (Base 100 + nothing for now)
    const points = isAnsCorrect ? 10 : 0;

    // Update My Score Locally -> Then Sync
    // Find my current score
    const myPlayer = players.find((p: any) => p.supabase_id === user.id);
    const newTotalScore = (myPlayer?.score || 0) + points;

    await questAppwriteService.submitAnswer(roomId, user.id, newTotalScore);
  };

  const handleNextQuestion = async () => {
    if (!roomData) return;
    const nextIdx = roomData.current_question_idx + 1;

    if (nextIdx >= questions.length) {
      // Finish Game
      await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId, {
        status: 'FINISHED'
      });
      onFinish();
    } else {
      await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.ACTIVE_SESSIONS, roomId, {
        current_question_idx: nextIdx
      });
    }
  };

  // Renders
  if (isLoading || !roomData || questions.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" /></div>;
  }

  const currentQuestion = questions[roomData.current_question_idx];
  const isHost = user?.id === roomData.host_uid;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pb-20">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-white font-bold text-xl">
          Soal {roomData.current_question_idx + 1} <span className="text-gray-500 text-base">/ {questions.length}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-white/10">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-yellow-500 font-bold">Rank Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

        {/* Main Quiz Area (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/40 border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option.id;
                let btnClass = "bg-gray-800/50 border-gray-700 hover:bg-gray-800";

                if (hasAnswered) {
                  if (option.id === currentQuestion.correct) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                  else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                } else if (isSelected) {
                  btnClass = "bg-indigo-600 border-indigo-500 text-white";
                }

                return (
                  <button
                    key={option.id}
                    disabled={hasAnswered}
                    onClick={() => handleAnswer(option.id)}
                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left ${btnClass}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${hasAnswered && option.id === currentQuestion.correct ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-current opacity-50'}`}>
                      {option.id}
                    </div>
                    <span className="flex-1 font-medium text-white/90">{option.text}</span>
                    {hasAnswered && option.id === currentQuestion.correct && <Check className="w-5 h-5 text-emerald-500" />}
                    {hasAnswered && isSelected && option.id !== currentQuestion.correct && <X className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Host Control */}
          {isHost && (
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleNextQuestion}
                className="bg-white text-black hover:bg-gray-200"
              >
                Success Question <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Leaderboard (1 col) */}
        <div>
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 sticky top-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => (
                  <div key={player.supabase_id} className={`flex items-center gap-3 p-2 rounded-lg ${user?.id === player.supabase_id ? 'bg-indigo-500/10 border border-indigo-500/30' : ''}`}>
                    <div className="w-6 text-center font-bold text-gray-500 text-sm">#{idx + 1}</div>
                    <img src={player.avatar_url} className="w-8 h-8 rounded-full bg-gray-800" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{player.username}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">{player.score}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
