/**
 * List Memory Journey Page
 * Displays all available journeys with progress tracking
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Trophy,
  Clock,
  Target,
  Trash2,
  RotateCcw,
  Play,
  CheckCircle2,
  Sparkles,
  Map
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useMemoryJourneyStore } from '@/store/memoryJourneyStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TopHeader } from "@/components/layout/TopHeader";

export default function ListMemoryJourney() {
  const navigate = useNavigate();
  const { getAllJourneys, deleteJourney, resetJourney, loadJourney } = useMemoryJourneyStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);

  const journeys = getAllJourneys();

  const handleCreateNew = () => {
    navigate('/memory-journey/create');
  };

  const handleContinue = (journeyId: string) => {
    loadJourney(journeyId);
    navigate(`/memory-journey/${journeyId}`);
  };

  const handleDelete = (journeyId: string) => {
    setSelectedJourneyId(journeyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJourneyId) {
      deleteJourney(selectedJourneyId);
      toast.success('Journey berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedJourneyId(null);
    }
  };

  const handleReset = (journeyId: string) => {
    setSelectedJourneyId(journeyId);
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    if (selectedJourneyId) {
      resetJourney(selectedJourneyId);
      toast.success('Journey berhasil direset');
      setResetDialogOpen(false);
      setSelectedJourneyId(null);
    }
  };

  const headerActions = (
    <Button
      onClick={handleCreateNew}
      className="bg-emerald-600 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"
    >
      <Plus className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">Journey Baru</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-black">
      <TopHeader
        backButton
        backTo="/dashboard"
        actions={headerActions}
      />

      {/* Page Header - Mobile First */}
      <div className="relative border-b border-gray-800/50">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent" />
        <div className="relative px-4 py-5 md:py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-white leading-tight mb-0.5">
                  Memory Journey
                </h1>
                <p className="text-xs md:text-sm text-gray-400 leading-snug">Belajar interaktif dengan gamifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-5 md:py-8">
        {journeys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 md:py-24"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <BookOpen className="w-14 h-14 md:w-20 md:h-20 text-emerald-500 relative" />
            </div>
            <h2 className="text-base md:text-xl font-bold text-white mb-2">
              Belum ada Journey
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-5 text-center max-w-md px-4">
              Mulai perjalanan belajar pertamamu dengan mengupload blueprint JSON
            </p>
            <Button
              onClick={handleCreateNew}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-10 md:h-11"
            >
              <Plus className="w-4 h-4" />
              Buat Journey Pertama
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {journeys.map((journey, index) => (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/40 border border-gray-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="p-4 md:p-5 border-b border-gray-800/50">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 flex-1 leading-snug">
                      {journey.title}
                    </h3>
                    {journey.isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {journey.description}
                  </p>
                </div>

                {/* Card Stats */}
                <div className="p-4 md:p-5 space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400 font-medium">Progress</span>
                      <span className="text-xs font-semibold text-emerald-400">
                        {journey.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${journey.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-linear-to-r from-emerald-500 to-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Target className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 truncate">
                        {journey.completedScenes}/{journey.totalScenes} Scene
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 truncate">
                        {journey.earnedXP} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="text-gray-400 truncate">
                        {journey.estimatedTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize",
                        journey.difficulty === 'mudah' && "bg-green-500/10 text-green-400",
                        journey.difficulty === 'sedang' && "bg-yellow-500/10 text-yellow-400",
                        journey.difficulty === 'sedang-tinggi' && "bg-orange-500/10 text-orange-400",
                        journey.difficulty === 'tinggi' && "bg-red-500/10 text-red-400"
                      )}>
                        {journey.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Themes */}
                  <div className="flex flex-wrap gap-1.5">
                    {journey.themes.slice(0, 2).map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-800/50 text-gray-400 rounded-md text-[10px] font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                    {journey.themes.length > 2 && (
                      <span className="px-2 py-1 bg-gray-800/50 text-gray-400 rounded-md text-[10px] font-medium">
                        +{journey.themes.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 md:p-4 border-t border-gray-800/50 flex items-center gap-2">
                  <Button
                    onClick={() => handleContinue(journey.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-9 text-sm font-medium"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {journey.isCompleted ? 'Lihat' : 'Lanjut'}
                  </Button>
                  <Button
                    onClick={() => handleReset(journey.id)}
                    variant="outline"
                    size="icon"
                    className="border-gray-700 hover:bg-gray-800 h-9 w-9 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(journey.id)}
                    variant="outline"
                    size="icon"
                    className="border-gray-700 hover:bg-red-950/20 hover:border-red-500/50 hover:text-red-400 h-9 w-9 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Hapus Journey?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Journey ini akan dihapus permanen. Semua progress akan hilang dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 hover:bg-gray-900">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-black border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset Journey?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Semua progress akan direset ke awal. Journey akan dimulai dari scene pertama.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 hover:bg-gray-900">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
