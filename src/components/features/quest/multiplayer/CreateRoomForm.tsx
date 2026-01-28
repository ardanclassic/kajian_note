import { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useQuestStore } from '@/store/questStore';
import { useAuthStore } from '@/store/authStore';
import { questMultiplayerService } from '@/services/supabase/QuestMultiplayerService';
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
  const [maxQuestions, setMaxQuestions] = useState<number>(20);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableTeamMode, setEnableTeamMode] = useState(false); // NEW: Team Mode Toggle

  useEffect(() => {
    if (topics.length === 0) fetchTopics();
  }, []);

  const handleTopicChange = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId || t.slug === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setSelectedSubtopic(null); // Reset subtopic
      setMaxQuestions(20); // Reset max
      setQuestionCount(10); // Reset count
      await fetchSubtopics(topic.slug);
    }
  };

  const handleSubtopicChange = async (subtopicId: string) => {
    if (!selectedTopic) return;
    const subs = subtopics[selectedTopic.slug] || [];
    const sub = subs.find(s => s.id === subtopicId);
    if (sub) {
      setSelectedSubtopic(sub);

      // Fetch actual question count from Appwrite
      setIsLoadingQuestions(true);
      try {
        const questions = await questAppwriteService.getQuestionsBySubtopic(sub.id, 100); // Fetch max 100 to get count
        const totalQuestions = questions.length;
        setMaxQuestions(totalQuestions);

        // Adjust current selection if it exceeds available questions
        if (questionCount > totalQuestions) {
          setQuestionCount(Math.min(totalQuestions, 10));
        }

        if (totalQuestions === 0) {
          toast.warning('Tidak ada soal tersedia untuk subtopik ini');
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        toast.error('Gagal memuat data soal');
        setMaxQuestions(20); // Fallback
      } finally {
        setIsLoadingQuestions(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedTopic || !selectedSubtopic) return;

    setIsSubmitting(true);
    try {
      const room = await questMultiplayerService.createRoom(
        {
          uid: user.id || 'anon',
          name: user.fullName || user.username || 'Player',
          avatar: user.avatarUrl || 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=' + user.id,
          tier: (user.subscriptionTier === 'free' ? 'FREE' : 'PREMIUM') as 'FREE' | 'PREMIUM'
        },
        {
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          totalQuestions: questionCount
        },
        enableTeamMode // Pass team mode flag
      );

      toast.success("Room berhasil dibuat!");
      onCreated(room.id, room.room_code);

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
          <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Kategori Topik</label>
          <select
            className="w-full bg-gray-900/80 border-2 border-gray-700 hover:border-indigo-500/50 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all shadow-lg shadow-black/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3cpath%20fill%3D%22%23ffffff%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3c%2Fsvg%3E')] bg-size-[16px] bg-position-[right_1rem_center] bg-no-repeat pr-12"
            onChange={(e) => handleTopicChange(e.target.value)}
            value={selectedTopic?.id || selectedTopic?.slug || ""}
          >
            <option value="" disabled className="bg-gray-900 text-gray-500">Pilih Topik...</option>
            {topics.map(t => (
              <option key={t.id} value={t.id} className="bg-gray-900 text-white py-2">{t.name}</option>
            ))}
          </select>
        </div>

        {/* Subtopic Selection */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Sub-Topik</label>
          <select
            className="w-full bg-gray-900/80 border-2 border-gray-700 hover:border-indigo-500/50 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3cpath%20fill%3D%22%23ffffff%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3c%2Fsvg%3E')] bg-size-[16px] bg-position-[right_1rem_center] bg-no-repeat pr-12"
            onChange={(e) => handleSubtopicChange(e.target.value)}
            value={selectedSubtopic?.id || ""}
            disabled={!selectedTopic}
          >
            <option value="" disabled className="bg-gray-900 text-gray-500">Pilih Materi...</option>
            {selectedTopic && subtopics[selectedTopic.slug]?.map(s => (
              <option key={s.id} value={s.id} className="bg-gray-900 text-white py-2">{s.title}</option>
            ))}
          </select>
        </div>

        {/* Team Mode Toggle */}
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Mode Permainan</label>
          <div className="flex items-center gap-4 p-4 bg-gray-900/80 border-2 border-gray-700 rounded-xl">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">
                {enableTeamMode ? "🤝 Team Mode" : "👤 Solo Mode"}
              </h4>
              <p className="text-xs text-gray-400">
                {enableTeamMode
                  ? "Pemain dibagi menjadi 2 tim yang berkompetisi"
                  : "Setiap pemain bermain untuk dirinya sendiri"}
              </p>
            </div>
            <button
              onClick={() => setEnableTeamMode(!enableTeamMode)}
              className={`relative w-14 h-8 rounded-full transition-colors ${enableTeamMode ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${enableTeamMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Question Count Slider - Only show when subtopic is selected */}
        {selectedSubtopic && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Jumlah Soal</label>
              {isLoadingQuestions && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            <div className="space-y-4">
              {/* Value Display - Editable Input with Steppers */}
              <div className="flex items-center justify-center gap-3">
                {/* Decrement Button */}
                <button
                  onClick={() => setQuestionCount(prev => Math.max(5, prev - 1))}
                  disabled={!selectedSubtopic || isLoadingQuestions || maxQuestions === 0 || questionCount <= 5}
                  className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-white/10 hover:border-indigo-500/50"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                {/* Input */}
                <div className="relative">
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 5;
                      const clamped = Math.max(5, Math.min(maxQuestions, val));
                      setQuestionCount(clamped);
                    }}
                    onBlur={(e) => {
                      // Ensure valid value on blur
                      const val = parseInt(e.target.value) || 5;
                      const clamped = Math.max(5, Math.min(maxQuestions, val));
                      setQuestionCount(clamped);
                    }}
                    disabled={!selectedSubtopic || isLoadingQuestions || maxQuestions === 0}
                    className="text-5xl font-black text-white tabular-nums bg-transparent text-center w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg px-2 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="text-center text-xs text-gray-500 mt-1 whitespace-nowrap">
                    dari {maxQuestions} soal
                  </div>
                </div>

                {/* Increment Button */}
                <button
                  onClick={() => setQuestionCount(prev => Math.min(maxQuestions, prev + 1))}
                  disabled={!selectedSubtopic || isLoadingQuestions || maxQuestions === 0 || questionCount >= maxQuestions}
                  className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-white/10 hover:border-indigo-500/50"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Slider */}
              <Slider
                value={[questionCount]}
                onValueChange={(value) => setQuestionCount(value[0])}
                min={5}
                max={maxQuestions}
                step={1}
                disabled={!selectedSubtopic || isLoadingQuestions || maxQuestions === 0}
                className="w-full"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].filter(n => n <= maxQuestions).map(count => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    disabled={!selectedSubtopic || isLoadingQuestions}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-30 ${questionCount === count
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
          disabled={!selectedTopic || !selectedSubtopic || isSubmitting || maxQuestions === 0}
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
