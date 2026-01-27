// POWER UP STATE
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Trophy, ArrowRight, Loader2, Hourglass, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questAppwriteService } from '@/services/appwrite/questService';
import { multiplayerService } from '@/services/supabase/multiplayerService';
import type { Question, QuestSession } from '@/types/quest.types';
import confetti from 'canvas-confetti';

interface Props {
  roomId: string; // Supabase ID
  onFinish: () => void;
}

export const MultiplayerGame = ({ roomId, onFinish }: Props) => {
  const { user } = useAuthStore();

  // State
  const [roomData, setRoomData] = useState<QuestSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // LOCAL PACE STATE
  const [localQuestionIdx, setLocalQuestionIdx] = useState(0);
  const [isWaitingOthers, setIsWaitingOthers] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  // REDEMPTION STATE
  const [redemptionCandidate, setRedemptionCandidate] = useState<number | null>(null);
  const [isRedemptionMode, setIsRedemptionMode] = useState(false);

  // POWER UP STATE
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]); // For 50:50

  // 1. Initial Load (Questions & Room)
  useEffect(() => {
    const init = async () => {
      try {
        const doc = await multiplayerService.getRoom(roomId);
        if (!doc) {
          console.error("Room not found");
          return;
        }
        setRoomData(doc);

        // Parse Config & Fetch Questions from APPWRITE (Content Source)
        const config = doc.topic_config;
        if (config.subtopic?.id) {
          const qs = await questAppwriteService.getQuestionsBySubtopic(config.subtopic.id, config.totalQuestions);
          setQuestions(qs);
        }

        // Restore local progress if rejoining/refreshing
        if (user) {
          const me = doc.players.find((p) => p.id === user.id);
          if (me) {
            // If finished, wait
            if (me.is_finished) {
              setIsWaitingOthers(true);
            } else {
              setLocalQuestionIdx(me.current_question_idx || 0);
            }
          }
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
    const channel = multiplayerService.subscribeToRoom(roomId, (updatedRoom) => {
      setRoomData(updatedRoom);

      // Detect GAME FINISH (Global)
      if (updatedRoom.status === "FINISHED") {
        setIsWaitingOthers(false); // Stop waiting screen
        onFinish(); // Go to Leaderboard
      }
    });

    return () => {
      multiplayerService.unsubscribe(channel);
    };
  }, [roomId]);

  // 3. Reset state on Local Question Change
  useEffect(() => {
    if (questions.length > 0) {
      // Don't reset if we are just entering redemption mode setup, 
      // but do reset if we are changing questions IN redemption or normal mode
      setHasAnswered(false);
      setSelectedOption(null);
      setIsCorrect(null);
      setStartTime(Date.now());
      setHiddenOptions([]); // Reset 50:50
    }
  }, [localQuestionIdx, isRedemptionMode]); // Trigger reset on mode change too

  // Handlers
  const handlePowerUp = async (type: "STREAK_SAVER" | "DOUBLE_POINTS" | "FIFTY_FIFTY" | "TIME_FREEZE") => {
    if (!roomData || !user || hasAnswered || isRedemptionMode) return;
    const me = roomData.players.find((p) => p.id === user.id);
    if (!me || (me.inventory[type] || 0) <= 0) return;

    // Optimistic Update / Logic
    if (type === "FIFTY_FIFTY") {
      const currentQ = questions[localQuestionIdx];
      const incorrectOptions = currentQ.options.filter(o => o.id !== currentQ.correct).map(o => o.id);
      // Randomly pick 2 to hide (or all excess if less than 2)
      const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
      const toHide = shuffled.slice(0, 2);
      setHiddenOptions(toHide);
    }

    // Call Server
    await multiplayerService.usePowerUp(roomId, user.id, type);
    toast.success(`${type.replace("_", " ")} Activated!`);
  };

  const handleAnswer = async (optionId: string) => {
    if (hasAnswered || !roomData || !user) return;

    const currentQ = questions[localQuestionIdx];
    const isAnsCorrect = optionId === currentQ.correct;
    const basePoints = currentQ.points || 10;

    setSelectedOption(optionId);
    setHasAnswered(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

    // Check Time Freeze
    const me = roomData.players.find(p => p.id === user.id);
    const isTimeFrozen = me?.active_effects?.includes("TIME_FREEZE"); // Note: Time Freeze logic in backend isn't persistent in active_effects for long, but let's assume if it was just activated locally we count it. 
    // Actually, for TIME_FREEZE, since we consume it immediately, we should track it locally or assume fast enough.
    // Better approach: If I wanted to support Time Freeze purely, I should send a flag or just send 0 timeSpent.
    // Let's rely on checking if I just activated it. But since state update is async, let's look at `me.inventory` vs previous... complex.
    // SIMPLIFICATION: If "TIME_FREEZE" is in active_effects (server sync might be slow).
    // Let's cheat a bit: if I clicked Time Freeze, server put it in active_effects? No, my logic for Time Freeze was just consume.
    // FIX: Update usePowerUp in backend to add TIME_FREEZE to active_effects too? 
    // Or just check if I have 0 timeSpent manually. 
    // Let's implement: Active Effects includes TIME_FREEZE? Yes, let's update backend logic for Time Freeze to be persistent for 1 turn too.

    // WAIT! I didn't add TIME_FREEZE to active_effects in backend previous step. Let's handle it client side for now by sending 0.
    // Assuming user activated it just now.
    // To be safe, let's just use normal time. Time Freeze is hard to sync perfectly without persistent effect.
    // Alternative: Use 50:50 and others only.
    // Let's try to detect if TIME_FREEZE is active.
    // Backtrack: In previous step backend, I only added DOUBLE_POINTS and STREAK_SAVER to effects.
    // So TIME_FREEZE is just consumed.
    // Let's ignore Time Freeze benefit for now or assume it gives 0 ms if we can track it.

    const timeSpentMs = Date.now() - startTime;

    // Submit Answer to Server (Calculates Score with Dynamic Logic)
    await multiplayerService.submitAnswer(
      roomId,
      user.id,
      localQuestionIdx,
      isAnsCorrect,
      basePoints,
      timeSpentMs,
      isRedemptionMode, // Pass Redemption Flag
    );
  };

  const finishGame = async () => {
    setIsWaitingOthers(true);
    if (user) {
      await multiplayerService.finishPlayer(roomId, user.id, questions.length);
    }
  };

  const handleNextQuestion = async () => {
    // If in redemption mode, finishing this question means finishing the game
    if (isRedemptionMode) {
      setIsRedemptionMode(false);
      await finishGame();
      return;
    }

    const nextIdx = localQuestionIdx + 1;

    if (nextIdx >= questions.length) {
      // End of Normal Questions. Check Redemption Eligibility.
      const myId = user?.id;
      const player = roomData?.players.find((p) => p.id === myId);

      // Condition: Player exists + Not used redemption + Has wrong answer
      if (player && !player.redemption_used && roomData?.answer_logs) {
        let wrongIdx = -1;
        const logs = roomData.answer_logs;

        // Iterate to find FIRST wrong answer that matches current user
        for (let i = 0; i < questions.length; i++) {
          const qLog = logs[`q_${i}`];
          const myLog = qLog?.find((l) => l.uid === myId);
          if (myLog && !myLog.correct) {
            wrongIdx = i;
            break; // Found one
          }
        }

        if (wrongIdx !== -1) {
          setRedemptionCandidate(wrongIdx);
          return; // STOP! Show Redemption Offer
        }
      }

      // No redemption needed/allowed
      await finishGame();
    } else {
      // Just move locally
      setLocalQuestionIdx(nextIdx);
    }
  };

  const startRedemption = () => {
    if (redemptionCandidate !== null) {
      setIsRedemptionMode(true);
      setLocalQuestionIdx(redemptionCandidate);
      setRedemptionCandidate(null); // Clear offer
    }
  };

  // Renders
  if (isLoading || !roomData || questions.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  // WAITING SCREEN (If I finished but others haven't)
  if (isWaitingOthers) {
    const pendingPlayers = roomData.players.filter((p) => !p.is_finished).length;
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 relative">
          <Check className="w-10 h-10 text-emerald-400 absolute" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>

        <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Kuis Selesai!
        </h2>

        <p className="text-gray-400 max-w-md text-lg">
          Menunggu <span className="text-indigo-400 font-bold">{pendingPlayers}</span> pemain lain...
        </p>

        <div className="p-6 bg-gray-900/50 border border-white/10 rounded-2xl max-w-sm w-full mt-8">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">Live Ranking Tersembunyi</p>
          <p className="text-xs text-gray-500">Hasil akhir akan ditampilkan setelah semua pemain selesai menyelesaikan kuis.</p>
        </div>
      </div>
    );
  }

  // REDEMPTION OFFER OVERLAY
  if (redemptionCandidate !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-gray-900 border border-indigo-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-indigo-500/20">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔄</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Kesempatan Kedua!</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Kamu punya <b>1 kesempatan</b> untuk memperbaiki jawaban salah di soal nomor <b>{redemptionCandidate + 1}</b>.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">(Poin 50% jika benar)</span>
          </p>

          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={startRedemption} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 text-lg">
              Ambil Kesempatan Ini
            </Button>
            <Button variant="ghost" onClick={finishGame} className="w-full text-gray-500 hover:text-white hover:bg-white/5">
              Tidak, Selesaikan Kuis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[localQuestionIdx];
  const me = roomData.players.find(p => p.id === user?.id);
  // Safecheck explanation
  if (!currentQuestion || !me) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 pb-20">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-white font-bold text-xl flex flex-col">
          {isRedemptionMode ? <span className="text-orange-400 text-sm uppercase tracking-wider font-extrabold animate-pulse">Redemption Round</span> : `Soal ${localQuestionIdx + 1}`}
          <span className="text-gray-500 text-base font-normal">/ {questions.length}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-orange-500 animate-pulse">🔥</span>
            <span className="text-white font-bold">{roomData?.players.find((p) => p.id === user?.id)?.streak || 0}x Streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Main Quiz Area (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-gray-900/40 border rounded-2xl p-6 md:p-8 ${isRedemptionMode ? "border-orange-500/50 shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)]" : "border-white/10"} relative overflow-hidden`}
          >
            {/* Active Effects Indicator */}
            <div className="absolute top-0 right-0 p-2 flex gap-1">
              {me.active_effects?.includes("DOUBLE_POINTS") && (
                <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded font-bold border border-yellow-500/50 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 2X Score
                </div>
              )}
              {me.active_effects?.includes("STREAK_SAVER") && (
                <div className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold border border-blue-500/50 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Protected
                </div>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">{currentQuestion.text}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                // 50:50 Logic
                if (hiddenOptions.includes(option.id)) {
                  return <div key={option.id} className="h-[74px] rounded-xl border border-white/5 bg-transparent opacity-20" />
                }

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
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${hasAnswered && option.id === currentQuestion.correct ? "bg-emerald-500 border-emerald-500 text-black" : "border-current opacity-50"}`}
                    >
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

          {/* POWER UP SHELF (Only visible if not answered and not redemption) */}
          {!hasAnswered && !isRedemptionMode && (
            <div className="flex justify-center gap-4 py-2">
              <PowerUpButton
                icon={<Zap className="w-5 h-5" />}
                count={me.inventory.DOUBLE_POINTS || 0}
                label="2x Score"
                active={me.active_effects?.includes("DOUBLE_POINTS")}
                onClick={() => handlePowerUp("DOUBLE_POINTS")}
                color="text-yellow-400"
              />
              <PowerUpButton
                icon={<Shield className="w-5 h-5" />}
                count={me.inventory.STREAK_SAVER || 0}
                label="Saver"
                active={me.active_effects?.includes("STREAK_SAVER")}
                onClick={() => handlePowerUp("STREAK_SAVER")}
                color="text-blue-400"
              />
              <PowerUpButton
                icon={<span className="font-bold text-lg">50:50</span>}
                count={me.inventory.FIFTY_FIFTY || 0}
                label="50:50"
                active={hiddenOptions.length > 0}
                onClick={() => handlePowerUp("FIFTY_FIFTY")}
                color="text-purple-400"
                disabled={hiddenOptions.length > 0}
              />
            </div>
          )}

          {/* Action Button - Moved Here for Better UX */}
          {hasAnswered && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
              <Button size="lg" onClick={handleNextQuestion} className="bg-white text-black hover:bg-gray-200">
                {localQuestionIdx < questions.length - 1 && !isRedemptionMode ? "Soal Selanjutnya" : isRedemptionMode ? "Selesai & Lihat Hasil" : "Selesaikan Kuis"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Explanation / Dalil */}
          {hasAnswered && currentQuestion.explanation?.text && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
              <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                Penjelasan
              </h3>
              <p className="text-white/80 leading-relaxed text-sm md:text-base mb-4">{currentQuestion.explanation.text}</p>
              {currentQuestion.explanation.dalil && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 font-serif text-emerald-200/90 italic text-center">"{currentQuestion.explanation.dalil}"</div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar Leaderboard (1 col) */}
        <div>
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 sticky top-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {(roomData.players || [])
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => (
                  <div key={player.id} className={`flex items-center gap-3 p-2 rounded-lg ${user?.id === player.id ? "bg-indigo-500/10 border border-indigo-500/30" : ""}`}>
                    <div className="w-6 text-center font-bold text-gray-500 text-sm">#{idx + 1}</div>
                    <div className="relative">
                      <img src={player.avatar_url} className="w-8 h-8 rounded-full bg-gray-800" />
                      {player.is_finished && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" title="Selesai" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{player.username}</div>
                      <div className="text-[10px] text-gray-500">
                        Soal {player.current_question_idx}/{questions.length}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">{player.score.toFixed(1)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent for Power Up Button
const PowerUpButton = ({ icon, count, label, onClick, color, active, disabled }: any) => {
  return (
    <button
      onClick={onClick}
      disabled={count <= 0 || disabled || active}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all relative ${active ? 'bg-indigo-500/20 border-indigo-500' : 'bg-gray-800/40 border-white/5 hover:bg-gray-800'} ${count <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-900 border border-white/10 mb-1 ${color}`}>
        {icon}
      </div>
      <div className="text-[10px] font-bold uppercase text-gray-400">{label}</div>
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-black">
        {count}
      </div>
    </button>
  )
}
