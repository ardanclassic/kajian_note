import { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuestStore } from '@/store/questStore';
import { useAuthStore } from '@/store/authStore';
import { questAppwriteService } from '@/services/appwrite/questService';
import { toast } from 'sonner';
import type { Topic, Subtopic } from '@/types/quest.types';

interface Props {
  onCreated: (docId: string, code: string) => void;
  onCancel: () => void;
}

export const CreateRoomForm = ({ onCreated, onCancel }: Props) => {
  const { user } = useAuthStore();
  const { topics, fetchTopics, subtopics, fetchSubtopics } = useQuestStore();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (topics.length === 0) fetchTopics();
  }, []);

  const handleTopicChange = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId || t.slug === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setSelectedSubtopic(null); // Reset subtopic
      await fetchSubtopics(topic.slug);
    }
  };

  const handleSubtopicChange = (subtopicId: string) => {
    if (!selectedTopic) return;
    const subs = subtopics[selectedTopic.slug] || [];
    const sub = subs.find(s => s.id === subtopicId);
    if (sub) setSelectedSubtopic(sub);
  };

  const handleSubmit = async () => {
    if (!user || !selectedTopic || !selectedSubtopic) return;

    setIsSubmitting(true);
    try {
      const room = await questAppwriteService.createRoom(
        {
          uid: user.id || 'anon',
          name: user.fullName || user.username || 'Player',
          avatar: user.avatarUrl || 'https://api.dicebear.com/7.x/micah/svg?seed=' + user.id
        },
        {
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          totalQuestions: questionCount
        }
      ) as any;

      toast.success("Room berhasil dibuat!");
      onCreated(room.$id, room.room_code);

    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat room. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Konfigurasi Game</h3>
        <p className="text-sm text-gray-400">Pilih topik yang ingin dimainkan</p>
      </div>

      <div className="space-y-4">
        {/* Topic Selection */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Kategori Topik</label>
          <select
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            onChange={(e) => handleTopicChange(e.target.value)}
            value={selectedTopic?.id || selectedTopic?.slug || ""}
          >
            <option value="" disabled>Pilih Topik...</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Subtopic Selection */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Sub-Topik</label>
          <select
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            onChange={(e) => handleSubtopicChange(e.target.value)}
            value={selectedSubtopic?.id || ""}
            disabled={!selectedTopic}
          >
            <option value="" disabled>Pilih Materi...</option>
            {selectedTopic && subtopics[selectedTopic.slug]?.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Jumlah Soal</label>
          <div className="flex items-center gap-4">
            {[5, 10, 15, 20].map(count => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${questionCount === count ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex md:flex-row flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          className="md:flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          size="lg"
          className="md:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={!selectedTopic || !selectedSubtopic || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Buat Room <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>

    </div>
  );
};
