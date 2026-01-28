import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Loader2, Play, Users, Star, LogOut, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questMultiplayerService } from '@/services/supabase/QuestMultiplayerService';
import { toast } from 'sonner';
import type { QuestSession } from '@/types/quest.types';

interface Props {
  roomId: string; // This is Supabase ID now
  onStartGame: () => void;
  onExit: () => void;
}

export const LobbyRoom = ({ roomId, onStartGame, onExit }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [roomData, setRoomData] = useState<QuestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 1. Initial Fetch
  const fetchRoom = async () => {
    try {
      const room = await questMultiplayerService.getRoom(roomId);
      if (!room) {
        toast.error("Room tidak ditemukan");
        onExit();
        return;
      }
      setRoomData(room);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load room:", error);
      toast.error("Gagal memuat room");
      onExit();
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  // 2. Realtime Listener
  // Replace polling with Supabase Realtime
  useEffect(() => {
    const channel = questMultiplayerService.subscribeToRoom(roomId, (updatedRoom) => {
      setRoomData(updatedRoom);

      if (updatedRoom.status === 'PLAYING') {
        onStartGame();
      }
    }, () => {
      // on delete
      toast.info("Room telah dibubarkan host.");
      onExit();
    });

    return () => {
      questMultiplayerService.unsubscribe(channel);
    };
  }, [roomId]);

  // 3. Actions
  const handleStart = async () => {
    if (!roomData) return;
    setIsStarting(true);
    try {
      await questMultiplayerService.startGame(roomData.id);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memulai game");
      setIsStarting(false);
    }
  };

  const handleExitRoom = async () => {
    if (!roomData || !user) return;
    setIsExiting(true);

    try {
      const isHost = user.id === roomData.host_uid;

      if (isHost) {
        // HOST: Delete Room & Exit Immediately
        await questMultiplayerService.deleteRoom(roomData.id);
        toast.success("Room berhasil dibubarkan.");
        onExit();
      } else {
        // GUEST: Just leave locally (Todo: remove self from players array ideally, not implemented in UI yet but service supports updates)
        // For MVP, just exiting view.
        onExit();
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal keluar room.");
      setIsExiting(false);
    }
  };

  const copyCode = async () => {
    if (!roomData) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(roomData.room_code);
        toast.success("Kode disalin!");
      } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = roomData.room_code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Kode disalin! (Fallback)");
      }
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error("Gagal menyalin kode");
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!roomData || !user) return;
    try {
      await questMultiplayerService.joinTeam(roomData.id, user.id, teamId);
      toast.success(`Bergabung dengan tim!`);
    } catch (e) {
      console.error(e);
      toast.error("Gagal bergabung tim");
    }
  };

  if (isLoading || !roomData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-gray-400">Menghubungkan ke Lobby...</p>
      </div>
    );
  }

  const isHost = user?.id === roomData.host_uid;
  const config = roomData.topic_config; // Typed object now
  // Note: config.subtopic might be Partial<Subtopic> but we access title. Safecheck.
  const subtopicTitle = config.subtopic?.title || "Unknown Topic";
  const players = roomData.players || [];
  const maxPlayers = (config as any).max_players || 2;

  // Validation Logic
  const isTeamMode = roomData.game_mode === "TEAM";
  const teams = roomData.teams || [];
  const teamA = teams[0];
  const teamB = teams[1];

  const hasMinPlayers = players.length >= 2;
  const isTeamBalanced = !isTeamMode || (isTeamMode && teamA?.member_count > 0 && teamB?.member_count > 0);

  const canStart = hasMinPlayers && isTeamBalanced;
  const isFull = players.length >= maxPlayers;

  const handleAutoBalance = async () => {
    if (!roomData || !isHost) return;
    try {
      await questMultiplayerService.autoBalanceTeams(roomData.id);
      toast.success("Tim diacak ulang!");
    } catch (e) {
      console.error(e);
      toast.error("Gagal mengacak tim");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 pb-32">

      {/* Header Info */}
      <div className="flex justify-between items-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitRoom}
          disabled={isExiting}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          {isExiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogOut className="w-4 h-4 mr-2" /> {isHost ? "Bubarkan Room" : "Keluar Room"}</>}
        </Button>

        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Lobby Live
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Menunggu Pemain...</h2>
        <p className="text-gray-400">
          Topik: <span className="text-white font-semibold">{subtopicTitle}</span> • {config.totalQuestions} Soal
        </p>
      </div>

      {/* Room Code Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Kode Room</p>
        <div className="flex items-center gap-4">
          <span className="text-5xl font-mono font-black text-white tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {roomData.room_code}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={copyCode} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 z-10 relative">
          <Copy className="w-4 h-4 mr-2" /> Salin Kode
        </Button>
      </div>

      {/* TEAM MODE: Team Selection */}
      {roomData.game_mode === "TEAM" && roomData.teams && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-bold text-white mb-1">Pilih Timmu</h3>
              <p className="text-sm text-gray-400">Klik tim untuk bergabung</p>
            </div>

            {/* Auto Balance Button (Host Only) */}
            {isHost && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoBalance}
                className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs h-8"
              >
                ⚡ Auto Balance
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {roomData.teams.map((team) => {
              const isMyTeam = user && roomData.players.find(p => p.id === user.id)?.team_id === team.id;
              const teamMembers = roomData.players.filter(p => p.team_id === team.id);

              return (
                <button
                  key={team.id}
                  onClick={() => handleJoinTeam(team.id)}
                  disabled={!!isMyTeam}
                  className={`p-4 rounded-xl border-2 transition-all ${isMyTeam
                    ? 'border-white/30 bg-white/10 ring-2 ring-white/20'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  style={{ borderColor: isMyTeam ? team.color : undefined }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white text-lg">{team.name}</h4>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>{team.member_count} Anggota</span>
                    </div>
                    {isMyTeam && (
                      <div className="text-xs text-emerald-400 font-semibold mt-2">
                        ✓ Tim Kamu
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Grid */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
            <span className={`flex items-center gap-2 font-medium ${isFull ? 'text-orange-400' : ''}`}>
              <Users className="w-4 h-4" />
              {players.length}/{maxPlayers} Pemain Bergabung
              {isFull && <span className="text-xs bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-orange-400 ml-2">Penuh</span>}
            </span>

            {!canStart && isHost && (
              <span className="text-orange-400 text-xs flex items-center gap-1 font-semibold">
                <XCircle className="w-3 h-3" />
                {!hasMinPlayers ? "Butuh min. 2 pemain" : "Tim tidak seimbang (Keduanya harus terisi)"}
              </span>
            )}
          </div>

          {/* Premium Upsell for Host */}
          {isHost && isFull && maxPlayers < 10 && (
            <div className="w-full p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-yellow-500">Upgrade ke Premium</p>
                  <p className="text-xs text-yellow-500/80">Unlock hingga 10 pemain dalam satu room.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-500 text-xs h-8"
                onClick={() => navigate('/subscription')}
              >
                Upgrade
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {players.map((player) => {
              const playerTeam = roomData.game_mode === "TEAM" && roomData.teams
                ? roomData.teams.find(t => t.id === player.team_id)
                : null;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="bg-gray-900/50 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 relative"
                  style={{
                    borderColor: playerTeam ? `${playerTeam.color}40` : undefined,
                  }}
                >
                  {player.is_host && (
                    <div className="absolute top-2 right-2 text-yellow-500" title="Host">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    </div>
                  )}
                  <img
                    src={player.avatar_url}
                    alt={player.username}
                    className="w-16 h-16 rounded-full border-2 p-1 bg-black/40"
                    style={{
                      borderColor: playerTeam ? playerTeam.color : '#6366f1',
                    }}
                  />
                  <span className="font-semibold text-white truncate max-w-full text-center px-2">
                    {player.username}
                  </span>

                  {playerTeam ? (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full border font-semibold"
                      style={{
                        backgroundColor: `${playerTeam.color}20`,
                        color: playerTeam.color,
                        borderColor: `${playerTeam.color}40`,
                      }}
                    >
                      {playerTeam.name}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600">
                      {roomData.game_mode === "TEAM" ? "Belum Pilih Tim" : "Ready"}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-8 flex justify-center">
        {isHost ? (
          <Button
            size="lg"
            className={`w-full md:max-w-md h-14 text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${!canStart
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/20'
              }`}
            onClick={handleStart}
            disabled={isStarting || !canStart}
          >
            {isStarting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5 mr-3 fill-current" />
                {canStart ? "Mulai Pertandingan" : "Menunggu Pemain Lain..."}
              </>
            )}
          </Button>
        ) : (
          <div className="w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center text-gray-400 animate-pulse flex items-center justify-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Menunggu Host memulai permainan...
          </div>
        )}
      </div>


    </div>
  );
};
