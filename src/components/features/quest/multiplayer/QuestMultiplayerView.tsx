import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { CreateRoomForm } from './CreateRoomForm';
import { JoinRoomForm } from './JoinRoomForm';
import { LobbyRoom } from './LobbyRoom';
import { MultiplayerGame } from './MultiplayerGame';
import { MultiplayerResults } from './MultiplayerResults';
import { multiplayerService } from '@/services/supabase/multiplayerService';
import { toast } from 'sonner';

type MultiplayerState = 'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME' | 'RESULTS';

export const QuestMultiplayerView = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuthStore();
  const [view, setView] = useState<MultiplayerState>('MENU');

  // Data State
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // --- PERSISTENCE & RESTORE LOGIC ---
  useEffect(() => {
    const restoreSession = async () => {
      const savedRoomId = localStorage.getItem('quest_active_room');
      if (savedRoomId && user) {
        try {
          // Verify if room still exists and what state it is in
          const room = await multiplayerService.getRoom(savedRoomId);
          if (room) {
            // Check if I am still in the player list
            const isPlayer = room.players.find(p => p.id === user.id);
            if (isPlayer) {
              setActiveRoomId(savedRoomId);
              setRoomCode(room.room_code || '');

              // Restore correct view based on room status
              if (room.status === 'WAITING') {
                setView('LOBBY');
                toast.info('Sesi dikembalikan: Kembali ke Lobby');
              } else if (room.status === 'PLAYING') {
                setView('GAME');
                toast.info('Sesi dikembalikan: Melanjutkan Game');
              } else if (room.status === 'FINISHED') {
                setView('RESULTS');
              }
            } else {
              // Player kicked or removed
              localStorage.removeItem('quest_active_room');
            }
          } else {
            // Room deleted
            localStorage.removeItem('quest_active_room');
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem('quest_active_room');
        }
      }
      setIsRestoring(false);
    };

    restoreSession();
  }, [user]);

  // Sync state to localStorage
  useEffect(() => {
    if (activeRoomId) {
      localStorage.setItem('quest_active_room', activeRoomId);

      // Add beforeunload listener to warn user
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };

    } else {
      localStorage.removeItem('quest_active_room');
    }
  }, [activeRoomId]);


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
    setView('RESULTS');
  };

  const handleExit = () => {
    // Confirmed exit
    setActiveRoomId(null);
    setRoomCode(null);
    setView('MENU');
    localStorage.removeItem('quest_active_room');
  };

  if (isRestoring) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-400">Memeriksa sesi aktif...</p>
      </div>
    );
  }

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

  if (view === 'RESULTS' && activeRoomId) {
    return (
      <MultiplayerResults
        roomId={activeRoomId}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 md:px-4">
      {/* Header Navigation */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (view === 'GAME' || view === 'LOBBY') {
              if (window.confirm("Yakin ingin keluar? Aksi ini akan memutuskan koneksi Anda dari room.")) {
                handleExit();
              }
            } else if (view === 'MENU') {
              onBack();
            } else {
              setView('MENU');
            }
          }}
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
