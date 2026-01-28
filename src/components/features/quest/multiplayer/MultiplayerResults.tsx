import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, Loader2, Share2, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questMultiplayerService } from '@/services/supabase/QuestMultiplayerService';
import type { QuestSession, TeamInfo, Player } from '@/types/quest.types';
import confetti from 'canvas-confetti';

interface TeamRanking extends TeamInfo {
  members: Player[];
}

interface Props {
  roomId: string;
  onExit: () => void;
}

export const MultiplayerResults = ({ roomId, onExit }: Props) => {
  const { user } = useAuthStore();
  const [roomData, setRoomData] = useState<QuestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

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
  const isTeamMode = roomData.game_mode === 'TEAM';

  // Debug logging
  // console.log('MultiplayerResults - Room Data:', {
  //   game_mode: roomData.game_mode,
  //   isTeamMode,
  //   teams: roomData.teams,
  //   players: roomData.players
  // });

  // Team Mode: Calculate team rankings
  const teamRankings: TeamRanking[] = isTeamMode && roomData.teams && Array.isArray(roomData.teams)
    ? roomData.teams.map(team => {
      const teamMembers = players.filter(p => p.team_id === team.id);
      return {
        ...team,
        members: teamMembers,
        total_score: teamMembers.reduce((sum, p) => sum + p.score, 0)
      };
    }).sort((a, b) => b.total_score - a.total_score)
    : [];

  // console.log('Team Rankings:', teamRankings);

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 text-center space-y-8 animate-in fade-in duration-700">

      <div className="space-y-2">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 uppercase tracking-widest drop-shadow-sm">
          Hasil Akhir
        </h2>
        <p className="text-gray-400">Permainan Selesai</p>
      </div>

      {/* TEAM MODE: Team Podium */}
      {isTeamMode && teamRankings.length > 0 && (
        <>
          <div className="flex justify-center items-end gap-4 h-48 mb-8 px-4">
            {/* 2nd Place Team */}
            {teamRankings[1] && (
              <TeamPodium team={teamRankings[1]} rank={2} delay={0.4} />
            )}

            {/* 1st Place Team */}
            {teamRankings[0] && (
              <TeamPodium team={teamRankings[0]} rank={1} delay={0.2} />
            )}

            {/* 3rd Place Team */}
            {teamRankings[2] && (
              <TeamPodium team={teamRankings[2]} rank={3} delay={0.6} />
            )}
          </div>

          {/* Team Details (Expandable) */}
          <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 border border-white/5">
            {teamRankings.map((team, idx) => (
              <div key={team.id} className="bg-black/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleTeam(team.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-gray-500 w-6 text-left">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: team.color }}>
                    {team.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-white">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.members.length} pemain</div>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold text-lg">{team.total_score.toFixed(0)}</div>
                </button>

                {/* Expanded Members */}
                {expandedTeams.includes(team.id) && (
                  <div className="px-3 pb-3 space-y-2 bg-black/10">
                    {team.members.map(member => (
                      <div key={member.id} className="flex items-center gap-2 p-2 rounded bg-white/5">
                        <img src={member.avatar_url} className="w-6 h-6 rounded-full" />
                        <span className="text-xs text-white flex-1 text-left">{member.username}</span>
                        <span className="text-xs text-gray-400 font-mono">{member.score.toFixed(0)} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* TEAM MODE: Fallback if no team data */}
      {isTeamMode && teamRankings.length === 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-bold mb-2">⚠️ Data Tim Tidak Ditemukan</p>
          <p className="text-gray-400 text-sm">Sepertinya ada masalah dengan data tim. Silakan coba lagi.</p>
          <div className="mt-4 text-xs text-gray-500 font-mono text-left bg-black/30 p-3 rounded">
            <div>Game Mode: {roomData.game_mode}</div>
            <div>Teams: {roomData.teams ? JSON.stringify(roomData.teams) : 'undefined'}</div>
            <div>Players: {players.length}</div>
          </div>
        </div>
      )}

      {/* SOLO/DUEL MODE: Individual Podium */}
      {!isTeamMode && (
        <>
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
        </>
      )}

      <div className="pt-6">
        <Button onClick={onExit} size="lg" className="w-full h-14 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-lg">
          <Home className="w-6 h-6 mr-2" /> Kembali ke Lobby
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

interface TeamPodiumProps {
  team: TeamRanking;
  rank: number;
  delay: number;
}

const TeamPodium = ({ team, rank, delay }: TeamPodiumProps) => {
  const heights = { 1: '100%', 2: '60%', 3: '50%' };
  const borderColors = { 1: 'border-yellow-500', 2: 'border-gray-400', 3: 'border-orange-700' };
  const textColors = { 1: 'text-yellow-500', 2: 'text-gray-400', 3: 'text-orange-700' };
  const shadows = { 1: 'shadow-[0_-10px_40px_rgba(234,179,8,0.2)]', 2: '', 3: '' };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: heights[rank as keyof typeof heights], opacity: 1 }}
      transition={{ delay }}
      className={`w-1/3 bg-gray-800/80 rounded-t-lg border-t-4 ${borderColors[rank as keyof typeof borderColors]} ${shadows[rank as keyof typeof shadows]} relative flex flex-col justify-end p-2`}
    >
      <div className={`absolute ${rank === 1 ? '-top-12' : '-top-10'} left-0 right-0 flex flex-col items-center`}>
        {rank === 1 && <CrownIcon />}
        <div
          className={`${rank === 1 ? 'w-16 h-16 border-4' : 'w-12 h-12 border-2'} rounded-full flex items-center justify-center text-2xl font-bold ${borderColors[rank as keyof typeof borderColors]}`}
          style={{ backgroundColor: team.color }}
        >
          {team.emoji}
        </div>
        <span className={`${rank === 1 ? 'text-sm' : 'text-xs'} font-bold mt-1 ${textColors[rank as keyof typeof textColors]} truncate max-w-full`}>
          {team.name}
        </span>
      </div>
      <div className={`${rank === 1 ? 'text-4xl' : 'text-2xl'} font-black ${textColors[rank as keyof typeof textColors]}`}>
        {rank}
      </div>
      <div className={`text-xs ${rank === 1 ? textColors[rank] + '/80' : 'text-gray-500'} font-mono`}>
        {team.total_score.toFixed(0)} pts
      </div>
    </motion.div>
  );
};
