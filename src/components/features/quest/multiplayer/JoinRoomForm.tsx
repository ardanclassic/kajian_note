import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { questAppwriteService } from '@/services/appwrite/questService';
import { toast } from 'sonner';

interface Props {
  onJoined: (docId: string, code: string) => void;
  onCancel: () => void;
}

export const JoinRoomForm = ({ onJoined, onCancel }: Props) => {
  const { user } = useAuthStore();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length < 4) return;

    setIsSubmitting(true);
    try {
      const room = await questAppwriteService.joinRoom(
        code.toUpperCase(), // Normalize case
        {
          uid: user.id || 'anon',
          name: user.fullName || user.username || 'Player',
          avatar: user.avatarUrl || 'https://api.dicebear.com/7.x/micah/svg?seed=' + user.id
        }
      );

      toast.success("Berhasil bergabung!");
      onJoined(room.$id, room.room_code);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal masuk room. Pastikan kode benar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Gabung Permainan</h3>
        <p className="text-sm text-gray-400">Masukkan kode room dari host.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Kode Room</label>
          <input
            type="text"
            placeholder="Contoh: A9X2"
            maxLength={6}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] uppercase text-white focus:outline-none focus:border-purple-500 transition-colors"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="pt-4 flex md:flex-row flex-col gap-3">
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="md:flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          type="submit"
          size="lg"
          className="md:flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          disabled={code.length < 4 || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Gabung <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </form>
  );
};
