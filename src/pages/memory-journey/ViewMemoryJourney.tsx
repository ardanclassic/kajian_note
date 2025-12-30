/**
 * View Memory Journey Page
 * Main journey viewer with scene navigation
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Target, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMemoryJourneyStore } from '@/store/memoryJourneyStore';
import { JourneyMap } from '@/components/features/memory-journey/JourneyMap';
import { SceneViewer } from '@/components/features/memory-journey/SceneViewer';
import { CompletionModal } from '@/components/features/memory-journey/CompletionModal';
import type { CompletionStats } from '@/types/memory-journey.types';

export default function ViewMemoryJourney() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentJourney,
    currentSceneIndex,
    loadJourney,
    setCurrentScene,
    resetJourney
  } = useMemoryJourneyStore();

  const [showCompletion, setShowCompletion] = useState(false);
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);

  useEffect(() => {
    if (id) {
      loadJourney(id);
    }
  }, [id, loadJourney]);

  // Calculate stats and show modal when completed
  useEffect(() => {
    if (currentJourney?.progress.isCompleted) {
      const progress = currentJourney.progress;
      const totalScenes = currentJourney.blueprint.scenes.length;

      // Calculate total time (seconds)
      const startTime = new Date(progress.startedAt).getTime();
      const endTime = progress.completedAt ? new Date(progress.completedAt).getTime() : Date.now();
      const totalTime = Math.floor((endTime - startTime) / 1000);

      // Calculate accuracy
      let totalAttempts = 0;
      if (progress.sceneAnswers) {
        Object.values(progress.sceneAnswers).forEach(ans => {
          totalAttempts += ans.attempts;
        });
      }

      const accuracy = totalAttempts > 0
        ? Math.round((totalScenes / totalAttempts) * 100)
        : 100;

      // Badges logic (Simple implementation)
      const badges: string[] = ['Finisher'];
      if (accuracy === 100) badges.push('Perfectionist');
      if (totalTime < totalScenes * 60) badges.push('Speedster'); // < 1 min per scene

      const stats: CompletionStats = {
        totalXP: progress.totalXP,
        totalTime,
        accuracy,
        scenesCompleted: progress.completedScenes.length,
        totalScenes,
        badges,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt || new Date().toISOString()
      };

      setCompletionStats(stats);
      setShowCompletion(true);
    }
  }, [currentJourney?.progress.isCompleted, currentJourney?.id]);

  // Auto scroll to top on scene change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSceneIndex]);

  if (!currentJourney) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Journey tidak ditemukan</p>
          <Button onClick={() => navigate('/memory-journey')} variant="outline">
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    );
  }

  const currentScene = currentJourney.blueprint.scenes[currentSceneIndex];
  const progress = currentJourney.progress;

  const handleSceneClick = (sceneNumber: number) => {
    const sceneIndex = sceneNumber - 1;
    setCurrentScene(sceneIndex);
  };

  const handleRestart = () => {
    if (currentJourney.id) {
      resetJourney(currentJourney.id);
      setShowCompletion(false);
      setCurrentScene(0);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/memory-journey')}
              variant="ghost"
              className="text-gray-400 hover:text-white gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>

            <div className="flex items-center gap-6">
              {currentJourney.progress.isCompleted && (
                <Button
                  onClick={() => setShowCompletion(true)}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <Award className="w-4 h-4" />
                  Lihat Rapor
                </Button>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">
                  {progress.completedScenes.length}/{currentJourney.blueprint.scenes.length} Scene
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-gray-500" />
                <span className="text-emerald-400 font-semibold">
                  {progress.totalXP} XP
                </span>
              </div>
            </div>
          </div>

          {/* Journey Map */}
          <JourneyMap
            scenes={currentJourney.blueprint.scenes}
            completedScenes={progress.completedScenes}
            currentScene={progress.currentScene}
            onSceneClick={handleSceneClick}
          />
        </div>
      </div>

      {/* Scene Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SceneViewer
              scene={currentScene}
              isCompleted={progress.completedScenes.includes(currentScene.scene_number)}
              onChallengeComplete={(xp: number) => {
                // This will be handled by SceneViewer internally
                console.log('Challenge completed with XP:', xp);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completion Modal */}
      {completionStats && (
        <CompletionModal
          open={showCompletion}
          onOpenChange={setShowCompletion}
          stats={completionStats}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
