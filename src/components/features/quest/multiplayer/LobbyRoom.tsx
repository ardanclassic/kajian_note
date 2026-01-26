import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Loader2, Play, Users, Crown, LogOut, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questAppwriteService } from '@/services/appwrite/questService';
import { appwriteDatabases, APPWRITE_DATABASE_ID, COLLECTIONS } from '@/services/appwrite/client';
import { toast } from 'sonner';

interface Props {
  roomId: string;
  onStartGame: () => void;
  onExit: () => void;
}

interface Player {
  supabase_id: string;
  username: string;
  avatar_url: string;
  is_host: boolean;
  score: number;
}

interface RoomData {
  $id: string;
  room_code: string;
  host_uid: string;
  status: string;
  players: string; // JSON string
  topic_config: string; // JSON string
}

export const LobbyRoom = ({ roomId, onStartGame, onExit }: Props) => {
  const { user } = useAuthStore();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 1. Initial Fetch
  const fetchRoom = async () => {
    try {
      const doc = await appwriteDatabases.getDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ACTIVE_SESSIONS,
        roomId
      );
      setRoomData(doc as any);
      setPlayers(JSON.parse(doc.players || "[]"));
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

  // 2. Realtime Subscription
  useEffect(() => {
    const unsubscribe = questAppwriteService.subscribeToRoom(roomId, (payload) => {

      // Handle Deletion Event
      if (payload.events.some((e: string) => e.includes('.delete'))) {
        toast.info("Room telah dibubarkan oleh Host.");
        onExit();
        return;
      }

      // Handle Update Event
      if (payload.events.some((e: string) => e.includes('.update'))) {
        const updatedDoc = payload.payload as RoomData;
        setRoomData(updatedDoc);
        setPlayers(JSON.parse(updatedDoc.players || "[]"));

        // Check Game Start Trigger
        if (updatedDoc.status === 'PLAYING') {
          onStartGame();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  // 3. Actions
  const handleStart = async () => {
    if (!roomData) return;
    setIsStarting(true);
    try {
      await questAppwriteService.startGame(roomData.$id);
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
      if (isHost) {
        // HOST: Delete Room & Exit Immediately
        await questAppwriteService.deleteRoom(roomData.$id);
        toast.success("Room berhasil dibubarkan.");
        onExit();
      } else {
        // GUEST: Just leave locally (Todo: remove self from players array ideally)
        // For MVP, just exiting view.
        onExit();
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal keluar room.");
      setIsExiting(false);
    }
  };

  const copyCode = () => {
    if (roomData) {
      navigator.clipboard.writeText(roomData.room_code);
      toast.success("Kode disalin!");
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
  const config = JSON.parse(roomData.topic_config || "{}");
  const canStart = players.length >= 2;

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
          Topik: <span className="text-white font-semibold">{config.subtopic?.title}</span> • {config.totalQuestions} Soal
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
        <Button variant="ghost" size="sm" onClick={copyCode} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
          <Copy className="w-4 h-4 mr-2" /> Salin Kode
        </Button>
      </div>

      {/* Player Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-400 px-2">
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {players.length} Pemain Bergabung</span>
          {!canStart && isHost && (
            <span className="text-orange-400 text-xs flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Butuh min. 2 pemain
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {players.map((player) => (
              <motion.div
                key={player.supabase_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="bg-gray-900/50 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 relative"
              >
                {player.is_host && (
                  <div className="absolute top-2 right-2 text-yellow-500" title="Host">
                    <Crown className="w-4 h-4 fill-yellow-500" />
                  </div>
                )}
                <img
                  src={player.avatar_url}
                  alt={player.username}
                  className="w-16 h-16 rounded-full border-2 border-indigo-500/30 p-1 bg-black/40"
                />
                <span className="font-semibold text-white truncate max-w-full text-center px-2">
                  {player.username}
                </span>

                {/* Status Badge */}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center pb-8 md:pb-12 z-20 pointer-events-none">
        <div className="pointer-events-auto flex gap-4 w-full max-w-md">
          {isHost ? (
            <Button
              size="lg"
              className={`w-full h-14 text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] ${!canStart ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              onClick={handleStart}
              disabled={isStarting || !canStart} // Disabled if < 2 players
            >
              {isStarting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Play className="w-5 h-5 mr-2 fill-current" /> {canStart ? "Mulai Game" : "Menunggu Pemain Lain..."}</>}
            </Button>
          ) : (
            <div className="w-full bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-center text-gray-400 animate-pulse">
              Menunggu Host memulai permainan...
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
