import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, Loader2, Share2, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questMultiplayerService } from '@/services/supabase/QuestMultiplayerService';
import type { QuestSession } from '@/types/quest.types';
import confetti from 'canvas-confetti';

interface Props {
  roomId: string;
  onExit: () => void;
}

export const MultiplayerResults = ({ roomId, onExit }: Props) => {
  const { user } = useAuthStore();
  const [roomData, setRoomData] = useState<QuestSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await questMultiplayerService.getRoom(roomId);
        if (data) {
          setRoomData(data);
          // Trigger confetti if I am the winner or top 3
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [roomId]);

  if (loading || !roomData) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" /></div>;
  }

  const players = roomData.players.sort((a, b) => b.score - a.score);
  const myRank = players.findIndex(p => p.id === user?.id) + 1;
  const isWinner = myRank === 1;

  return (
    <div className="max-w-md mx-auto py-10 px-4 text-center space-y-8 animate-in fade-in duration-700">

      <div className="space-y-2">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 uppercase tracking-widest drop-shadow-sm">
          Hasil Akhir
        </h2>
        <p className="text-gray-400">Permainan Selesai</p>
      </div>

      {/* Podium Top 3 */}
      <div className="flex justify-center items-end gap-4 h-48 mb-8 px-4">
        {/* 2nd Place */}
        {players[1] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '60%', opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-1/3 bg-gray-800/80 rounded-t-lg border-t-4 border-gray-400 relative flex flex-col justify-end p-2"
          >
            <div className="absolute -top-10 left-0 right-0 flex flex-col items-center">
              <img src={players[1].avatar_url} className="w-12 h-12 rounded-full border-2 border-gray-400" />
              <span className="text-xs font-bold mt-1 text-gray-300 truncate max-w-full">{players[1].username}</span>
            </div>
            <div className="text-2xl font-bold text-gray-400">2</div>
            <div className="text-xs text-gray-500">{players[1].score.toFixed(0)} pts</div>
          </motion.div>
        )}

        {/* 1st Place */}
        {players[0] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '100%', opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-1/3 bg-gray-800/80 rounded-t-lg border-t-4 border-yellow-500 relative flex flex-col justify-end p-2 shadow-[0_-10px_40px_rgba(234,179,8,0.2)]"
          >
            <div className="absolute -top-12 left-0 right-0 flex flex-col items-center">
              <CrownIcon />
              <img src={players[0].avatar_url} className="w-16 h-16 rounded-full border-4 border-yellow-500" />
              <span className="text-sm font-bold mt-1 text-yellow-500 truncate max-w-full">{players[0].username}</span>
            </div>
            <div className="text-4xl font-black text-yellow-500">1</div>
            <div className="text-xs text-yellow-500/80 font-mono">{players[0].score.toFixed(0)} pts</div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {players[2] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '50%', opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-1/3 bg-gray-800/80 rounded-t-lg border-t-4 border-orange-700 relative flex flex-col justify-end p-2"
          >
            <div className="absolute -top-10 left-0 right-0 flex flex-col items-center">
              <img src={players[2].avatar_url} className="w-12 h-12 rounded-full border-2 border-orange-700" />
              <span className="text-xs font-bold mt-1 text-orange-700 truncate max-w-full">{players[2].username}</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">3</div>
            <div className="text-xs text-gray-500">{players[2].score.toFixed(0)} pts</div>
          </motion.div>
        )}
      </div>

      {/* Rest of Leaderboard */}
      {players.length > 3 && (
        <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto border border-white/5">
          {players.slice(3).map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/20">
              <span className="font-bold text-gray-500 w-6 text-left">#{idx + 4}</span>
              <img src={p.avatar_url} className="w-8 h-8 rounded-full bg-gray-800" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">{p.username}</div>
              </div>
              <div className="font-mono text-emerald-400 font-bold">{p.score.toFixed(0)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6">
        <Button onClick={onExit} size="lg" className="w-full h-14 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-lg">
          <Home className="w-6! h-6! mr-2" /> Kembali ke Lobby
        </Button>
      </div>

    </div>
  );
};

const CrownIcon = () => (
  <div className="mb-1 animate-bounce">
    <Trophy className="w-6 h-6 text-yellow-400 fill-yellow-400" />
  </div>
);
