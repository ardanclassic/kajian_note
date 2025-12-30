/**
 * Scene Viewer Component
 * Displays scene story, learning content, and challenge
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, ChevronDown, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DalilCard } from '@/components/features/memory-journey/DalilCard';
import { ChallengeComponent } from '@/components/features/memory-journey/ChallengeComponent';
import type { Scene } from '@/types/memory-journey.types';

interface SceneViewerProps {
  scene: Scene;
  isCompleted: boolean;
  onChallengeComplete: (xp: number) => void;
}

export function SceneViewer({ scene, isCompleted, onChallengeComplete }: SceneViewerProps) {
  const [showChallenge, setShowChallenge] = useState(false);
  const challengeRef = useRef<HTMLDivElement>(null);

  // Auto scroll to challenge when opened
  useEffect(() => {
    if (showChallenge && challengeRef.current) {
      // Small delay to allow animation to start rendering layout
      setTimeout(() => {
        challengeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [showChallenge]);

  return (
    <div className="space-y-8">
      {/* Scene Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/20">
            Scene {scene.scene_number}
          </div>
          {isCompleted && (
            <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-semibold border border-green-500/20">
              ✓ Completed
            </div>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
          {scene.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
            <span>{scene.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <div className="flex flex-wrap gap-1">
              {scene.characters.map((char, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Story Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="prose prose-invert max-w-none"
      >
        <div className="text-lg leading-relaxed text-gray-300 whitespace-pre-line px-2">
          {scene.story_text}
        </div>
      </motion.div>

      <div className="border-t border-gray-800/50" />

      {/* Learning Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-2"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pembelajaran</h2>
        </div>

        <div className="space-y-6">
          {/* Concept */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-emerald-400 mb-2 md:mb-3">
              {scene.learning_content.concept}
            </h3>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            {scene.learning_content.key_points.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] md:text-xs font-bold text-emerald-400">✓</span>
                </div>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          {/* Dalil */}
          {scene.learning_content.dalil && (
            <div className="mt-6 md:mt-8">
              <DalilCard dalil={scene.learning_content.dalil} />
            </div>
          )}

          {/* Hadith */}
          {scene.learning_content.hadith && (
            <div className="mt-6 md:mt-8 pl-4 md:pl-6 border-l-4 border-blue-500/30">
              <div className="text-sm font-medium text-blue-400 mb-2 md:mb-3">Hadist</div>
              <div className="text-right mb-3 md:mb-4" dir="rtl">
                <p className="text-lg md:text-xl leading-loose text-white font-arabic">
                  {scene.learning_content.hadith.arabic}
                </p>
              </div>
              <p className="text-sm md:text-base text-gray-300 italic mb-2 md:mb-3">
                "{scene.learning_content.hadith.translation}"
              </p>
              <div className="text-xs md:text-sm font-semibold text-blue-400">
                {scene.learning_content.hadith.source}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="border-t border-gray-800/50" />

      {/* Challenge Section */}
      <motion.div
        ref={challengeRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="scroll-mt-24"
      >
        {!showChallenge ? (
          <Button
            onClick={() => setShowChallenge(true)}
            className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg font-semibold gap-2 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
            disabled={isCompleted}
          >
            {isCompleted ? '✓ Tantangan Selesai' : 'Lanjutkan ke Tantangan'}
            {!isCompleted && <ChevronDown className="w-5 h-5 animate-bounce" />}
          </Button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ChallengeComponent
                challenge={scene.challenge}
                xpReward={scene.xp_reward}
                sceneNumber={scene.scene_number}
                isCompleted={isCompleted}
                onComplete={onChallengeComplete}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
