import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { CreateRoomForm } from './CreateRoomForm';
import { JoinRoomForm } from './JoinRoomForm';
import { LobbyRoom } from './LobbyRoom';
import { MultiplayerGame } from './MultiplayerGame';
import type { Subtopic, Topic } from '@/types/quest.types';

type MultiplayerState = 'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME' | 'RESULTS';

export const QuestMultiplayerView = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuthStore();
  const [view, setView] = useState<MultiplayerState>('MENU');

  // Data State
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleRoomCreated = (docId: string, code: string) => {
    setActiveRoomId(docId);
    setRoomCode(code);
    setView('LOBBY');
  };

  const handleRoomJoined = (docId: string, code: string) => {
    setActiveRoomId(docId);
    setRoomCode(code);
    setView('LOBBY');
  };

  const handleGameStart = () => {
    setView('GAME');
  };

  const handleGameEnd = () => {
    setView('RESULTS'); // Todo: Implement Result View
  };

  const handleExit = () => {
    // TODO: Leave room logic here
    setActiveRoomId(null);
    setRoomCode(null);
    setView('MENU');
  };

  // --- RENDERERS ---

  if (view === 'LOBBY' && activeRoomId) {
    return (
      <LobbyRoom
        roomId={activeRoomId}
        onStartGame={handleGameStart}
        onExit={handleExit}
      />
    );
  }

  if (view === 'GAME' && activeRoomId) {
    return (
      <MultiplayerGame
        roomId={activeRoomId}
        onFinish={handleGameEnd}
      />
    )
  }

  return (
    <div className="max-w-xl mx-auto py-10 md:px-4">
      {/* Header Navigation */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={view === 'MENU' ? onBack : () => setView('MENU')}
          className="rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="md:text-2xl text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Multiplayer Arena</h2>
          <p className="text-sm text-gray-400">Tantang temanmu dalam adu wawasan!</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {view === 'MENU' && (
          <div className="grid gap-4">
            <button
              onClick={() => setView('CREATE')}
              className="flex items-center gap-4 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Buat Room Baru</h3>
                <p className="text-sm text-gray-400">Pilih topik, atur soal, dan ajak teman.</p>
              </div>
            </button>

            <button
              onClick={() => setView('JOIN')}
              className="flex items-center gap-4 p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Gabung Room</h3>
                <p className="text-sm text-gray-400">Punya kode room? Masukkan di sini.</p>
              </div>
            </button>
          </div>
        )}

        {view === 'CREATE' && (
          <CreateRoomForm
            onCreated={handleRoomCreated}
            onCancel={() => setView('MENU')}
          />
        )}

        {view === 'JOIN' && (
          <JoinRoomForm
            onJoined={handleRoomJoined}
            onCancel={() => setView('MENU')}
          />
        )}

      </motion.div>
    </div>
  );
};
