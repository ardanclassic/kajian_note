/**
 * Journey Map Component
 * Visual progress indicator with interactive scene navigation
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Scene } from '@/types/memory-journey.types';

interface JourneyMapProps {
  scenes: Scene[];
  completedScenes: number[];
  currentScene: number;
  onSceneClick: (sceneNumber: number) => void;
}

export function JourneyMap({
  scenes,
  completedScenes,
  currentScene,
  onSceneClick
}: JourneyMapProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getSceneState = (sceneNumber: number): 'completed' | 'current' | 'locked' => {
    if (completedScenes.includes(sceneNumber)) return 'completed';
    if (sceneNumber === currentScene) return 'current';
    return 'locked';
  };

  const isSceneUnlocked = (sceneNumber: number): boolean => {
    return sceneNumber <= currentScene || completedScenes.includes(sceneNumber);
  };

  // Auto scroll to current scene on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        // Small delay to ensure layout is ready
        setTimeout(() => {
          activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 300);
      }
    }
  }, [currentScene]);

  return (
    <div className="w-full py-2 md:py-6">
      {/* Desktop: Full Horizontal Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between gap-2 px-4">
          {scenes.map((scene, index) => {
            const sceneNumber = scene.scene_number;
            const state = getSceneState(sceneNumber);
            const isUnlocked = isSceneUnlocked(sceneNumber);

            return (
              <div key={sceneNumber} className="flex items-center flex-1">
                {/* Scene Node */}
                <motion.button
                  onClick={() => isUnlocked && onSceneClick(sceneNumber)}
                  disabled={!isUnlocked}
                  whileHover={isUnlocked ? { scale: 1.1 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  className={cn(
                    'relative group flex flex-col items-center gap-2',
                    isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      'relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      state === 'completed' && 'bg-emerald-500 border-emerald-500',
                      state === 'current' && 'bg-blue-500 border-blue-500 animate-pulse',
                      state === 'locked' && 'bg-gray-800 border-gray-700'
                    )}
                  >
                    {state === 'completed' && <Check className="w-6 h-6 text-white" />}
                    {state === 'current' && <Circle className="w-6 h-6 text-white fill-white" />}
                    {state === 'locked' && <Lock className="w-5 h-5 text-gray-500" />}

                    {/* Glow effect for current */}
                    {state === 'current' && (
                      <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-black border border-gray-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                      <div className="text-xs font-medium text-white">
                        Scene {sceneNumber}
                      </div>
                      <div className="text-xs text-gray-400 max-w-[200px] truncate">
                        {scene.title}
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Connector Line */}
                {index < scenes.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        completedScenes.includes(sceneNumber)
                          ? 'bg-emerald-500'
                          : 'bg-gray-700'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Horizontal Scrollable List */}
      <div
        ref={scrollContainerRef}
        className="md:hidden overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center min-w-max pr-8">
          {scenes.map((scene, index) => {
            const sceneNumber = scene.scene_number;
            const state = getSceneState(sceneNumber);
            const isUnlocked = isSceneUnlocked(sceneNumber);

            return (
              <div
                key={sceneNumber}
                className="flex items-center snap-center"
                data-active={state === 'current' ? "true" : "false"}
              >
                {/* Scene Item */}
                <div className="flex flex-col items-center gap-1.5 w-16">
                  <motion.button
                    onClick={() => isUnlocked && onSceneClick(sceneNumber)}
                    disabled={!isUnlocked}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    className={cn(
                      'relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      state === 'completed' && 'bg-emerald-500 border-emerald-500',
                      state === 'current' && 'bg-blue-500 border-blue-500 animate-pulse',
                      state === 'locked' && 'bg-gray-800 border-gray-700',
                      isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                    )}
                  >
                    {state === 'completed' && <Check className="w-4 h-4 text-white" />}
                    {state === 'current' && <Circle className="w-4 h-4 text-white fill-white" />}
                    {state === 'locked' && <Lock className="w-3.5 h-3.5 text-gray-500" />}

                    {state === 'current' && (
                      <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-lg animate-pulse" />
                    )}
                  </motion.button>

                  <div className="text-center">
                    <div className={cn(
                      "text-[10px] font-medium leading-none",
                      state === 'current' ? "text-blue-400" :
                        state === 'completed' ? "text-emerald-400" : "text-gray-500"
                    )}>
                      Scene {sceneNumber}
                    </div>
                  </div>
                </div>

                {/* Mobile Connector */}
                {index < scenes.length - 1 && (
                  <div className="w-4 h-px bg-gray-800 shrink-0">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        completedScenes.includes(sceneNumber)
                          ? 'bg-emerald-500'
                          : 'bg-transparent'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
