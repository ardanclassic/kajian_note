import { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, ArrowRight, Loader2, Hourglass, Zap, Shield, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questAppwriteService } from '@/services/appwrite/questService';
import { questMultiplayerService } from '@/services/supabase/QuestMultiplayerService';
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
        const doc = await questMultiplayerService.getRoom(roomId);
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
    const channel = questMultiplayerService.subscribeToRoom(roomId, (updatedRoom) => {
      setRoomData(updatedRoom);

      // Detect GAME FINISH (Global)
      if (updatedRoom.status === "FINISHED") {
        setIsWaitingOthers(false); // Stop waiting screen
        onFinish(); // Go to Leaderboard
      }
    });

    return () => {
      questMultiplayerService.unsubscribe(channel);
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
    await questMultiplayerService.usePowerUp(roomId, user.id, type);
    toast.success(`${type.replace("_", " ")} Activated!`);
  };

  const handleAnswer = async (answer: string | string[]) => {
    if (hasAnswered || !roomData || !user) return;

    const currentQ = questions[localQuestionIdx];
    let isAnsCorrect = false;

    if (currentQ.type === 'puzzle_order') {
      const userAnswerJson = JSON.stringify(answer);
      // Clean up string comparison (remove spaces from JSON if any)
      const normalizedCorrect = currentQ.correct.replace(/\s/g, '');
      const normalizedUser = userAnswerJson.replace(/\s/g, '');
      isAnsCorrect = normalizedUser === normalizedCorrect;
    } else {
      isAnsCorrect = answer === currentQ.correct;
    }

    const basePoints = currentQ.points || 10;

    setSelectedOption(typeof answer === 'string' ? answer : 'PUZZLE_SUBMITTED');
    setHasAnswered(true);
    setIsCorrect(isAnsCorrect);

    if (isAnsCorrect) confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });

    const timeSpentMs = Date.now() - startTime;

    // Submit Answer to Server
    await questMultiplayerService.submitAnswer(
      roomId,
      user.id,
      localQuestionIdx,
      isAnsCorrect,
      basePoints,
      timeSpentMs,
      isRedemptionMode,
    );
  };

  const finishGame = async () => {
    setIsWaitingOthers(true);
    if (user) {
      await questMultiplayerService.finishPlayer(roomId, user.id, questions.length);
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
        <div className="flex items-center gap-3">
          {roomData.game_mode === "TEAM" && me.team_id && (
            <div
              className="px-3 py-1 rounded-full text-[10px] font-bold border"
              style={{
                backgroundColor: `${roomData.teams?.find(t => t.id === me.team_id)?.color}20`,
                color: roomData.teams?.find(t => t.id === me.team_id)?.color,
                borderColor: `${roomData.teams?.find(t => t.id === me.team_id)?.color}40`
              }}
            >
              {roomData.teams?.find(t => t.id === me.team_id)?.name}
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-orange-500 animate-pulse">🔥</span>
              <span className="text-white font-bold">{roomData?.players.find((p) => p.id === user?.id)?.streak || 0}x Streak</span>
            </div>
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

            <div className="flex flex-col mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">{currentQuestion.text}</h2>
              {currentQuestion.type === 'puzzle_order' && !hasAnswered && (
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-2 animate-pulse">Drag to reorder & submit</span>
              )}
            </div>

            <div className="space-y-3">
              {currentQuestion.type === 'puzzle_order' ? (
                <PuzzleOrderView
                  options={currentQuestion.options}
                  correct={currentQuestion.correct}
                  hasAnswered={hasAnswered}
                  isCorrect={isCorrect}
                  onSubmit={(ids: any) => handleAnswer(ids)}
                />
              ) : (
                <div className={`grid grid-cols-1 ${currentQuestion.type === 'true_false' ? 'md:grid-cols-2 gap-4' : 'gap-3'}`}>
                  {currentQuestion.options.map((option) => {
                    // 50:50 Logic
                    if (hiddenOptions.includes(option.id)) {
                      return <div key={option.id} className="h-[74px] rounded-xl border border-white/5 bg-transparent opacity-20" />
                    }

                    const isSelected = selectedOption === option.id;
                    let btnClass = "bg-gray-800/50 border-gray-700 hover:bg-gray-800";
                    let contentColor = "text-white/90";

                    // TRUE / FALSE STYLING
                    if (currentQuestion.type === 'true_false') {
                      const isTrue = option.id === 'true';
                      btnClass = isTrue
                        ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20";

                      if (hasAnswered) {
                        if (option.id === currentQuestion.correct) btnClass = "bg-emerald-500 text-black border-emerald-400";
                        else if (isSelected) btnClass = "bg-red-500 text-white border-red-400";
                        else btnClass = "opacity-40 grayscale";
                      } else if (isSelected) {
                        btnClass = isTrue ? "bg-emerald-600 text-white border-emerald-400" : "bg-red-600 text-white border-red-400";
                      }
                    }
                    // MULTIPLE CHOICE STYLING
                    else {
                      if (hasAnswered) {
                        if (option.id === currentQuestion.correct) { btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400"; contentColor = "text-emerald-300"; }
                        else if (isSelected) { btnClass = "bg-red-500/20 border-red-500 text-red-400"; contentColor = "text-red-300"; }
                      } else if (isSelected) {
                        btnClass = "bg-indigo-600 border-indigo-500 text-white";
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        disabled={hasAnswered}
                        onClick={() => handleAnswer(option.id)}
                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left group relative overflow-hidden ${btnClass} ${currentQuestion.type === 'true_false' ? 'h-32 justify-center flex-col gap-2' : ''}`}
                      >
                        {/* Background Decoration for T/F */}
                        {currentQuestion.type === 'true_false' && (
                          <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                            {option.id === 'true' ? <CheckCircle2 size={80} /> : <XCircle size={80} />}
                          </div>
                        )}

                        {/* Alphabet label removed to avoid confusion when shuffled */}

                        <span className={`font-medium ${contentColor} ${currentQuestion.type === 'true_false' ? 'text-xl font-bold uppercase tracking-widest' : 'flex-1'}`}>
                          {option.text}
                        </span>

                        {hasAnswered && currentQuestion.type !== 'true_false' && option.id === currentQuestion.correct && <Check className="w-5 h-5 text-emerald-500" />}
                        {hasAnswered && currentQuestion.type !== 'true_false' && isSelected && option.id !== currentQuestion.correct && <X className="w-5 h-5 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
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
                disabled={hiddenOptions.length > 0 || currentQuestion.type === 'puzzle_order'}
              />
            </div>
          )}

          {/* Action Button - Moved Here for Better UX */}
          {hasAnswered && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
              <Button size="lg" onClick={handleNextQuestion} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-900/20">
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
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 sticky top-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Leaderboard</h3>

            {/* TEAM MODE: Show Team Rankings with Members */}
            {roomData.game_mode === "TEAM" && roomData.teams && roomData.teams.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">Peringkat Tim</p>
                {roomData.teams
                  .sort((a, b) => b.total_score - a.total_score)
                  .map((team, idx) => {
                    const teamMembers = roomData.players.filter(p => p.team_id === team.id);
                    return (
                      <div
                        key={team.id}
                        className="rounded-lg bg-gray-800/50 border overflow-hidden"
                        style={{ borderColor: `${team.color}40` }}
                      >
                        {/* Team Header */}
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-6 text-center font-bold text-sm" style={{ color: team.color }}>
                            #{idx + 1}
                          </div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{team.name}</div>
                            <div className="text-[10px] text-gray-500">{team.member_count} Anggota</div>
                          </div>
                          <div className="font-mono font-bold text-emerald-400">{team.total_score.toFixed(1)}</div>
                        </div>

                        {/* Team Members */}
                        <div className="px-3 pb-2 space-y-1">
                          {teamMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-2 p-1.5 rounded bg-black/20">
                              <img src={member.avatar_url} className="w-5 h-5 rounded-full" />
                              <span className="text-xs text-gray-300 flex-1 truncate">{member.username}</span>
                              <span className="text-xs font-mono text-emerald-400">{member.score.toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                <div className="border-t border-gray-800 my-2" />
              </div>
            )}

            {/* Player Rankings */}
            <div className="space-y-2">
              {roomData.game_mode === "TEAM" && <p className="text-xs text-gray-500 uppercase font-semibold">Pemain</p>}
              {(roomData.players || [])
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => {
                  const playerTeam = roomData.game_mode === "TEAM" && roomData.teams
                    ? roomData.teams.find(t => t.id === player.team_id)
                    : null;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${user?.id === player.id ? "bg-indigo-500/10 border border-indigo-500/30" : ""}`}
                    >
                      <div className="w-6 text-center font-bold text-gray-500 text-sm">#{idx + 1}</div>
                      <div className="relative">
                        <img
                          src={player.avatar_url}
                          className="w-8 h-8 rounded-full bg-gray-800 border-2"
                          style={{ borderColor: playerTeam ? playerTeam.color : '#6366f1' }}
                        />
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
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// PUZZLE ORDER VIEW COMPONENT
// ------------------------------------------------------------------
const PuzzleOrderView = ({ options, correct, hasAnswered, isCorrect, onSubmit }: any) => {
  // We need to shuffle initial state but keep it stable for this question
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!hasAnswered) {
      // Shuffle but avoid the correct answer if possible or just random
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      setItems(shuffled);
    } else {
      // If already answered, we show the CORRECT order or their submitted order?
      // For clarity, let's show the correct order so they learn.
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
              : 'bg-gray-800/80 hover:bg-gray-800 border-white/10 hover:border-indigo-500/50 shadow-sm'
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

              <span className="flex-1 text-white/90 font-medium select-none">{item.text}</span>

              {/* Show correct/incorrect indicator */}
              {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {hasAnswered && isCorrect === false && <XCircle className="w-5 h-5 text-red-500" />}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!hasAnswered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 text-lg shadow-lg shadow-indigo-500/20 border border-indigo-400/20"
            onClick={() => onSubmit(items.map(i => i.id))}
          >
            Submit Jawaban <CheckCircle2 className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}
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
