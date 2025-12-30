/**
 * Journey Uploader Component
 * Drag & drop zone for uploading JSON blueprint files
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileJson, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { validateJSONFile } from '@/services/memory-journey/blueprintValidator';
import { useMemoryJourneyStore } from '@/store/memoryJourneyStore';
import type { Blueprint, ValidationResult } from '@/types/memory-journey.types';

export function JourneyUploader() {
  const navigate = useNavigate();
  const createJourney = useMemoryJourneyStore((state) => state.createJourney);

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Validate file
      const result = await validateJSONFile(file);
      setValidationResult(result);

      if (result.isValid) {
        // Parse blueprint
        const text = await file.text();
        const data = JSON.parse(text) as Blueprint;
        setBlueprint(data);
        setShowPreview(true);

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            toast.warning(warning);
          });
        }
      } else {
        toast.error('File validation failed');
      }
    } catch (error) {
      toast.error('Failed to process file');
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleConfirm = () => {
    if (!blueprint) return;

    try {
      const journeyId = createJourney(blueprint);
      toast.success('Journey berhasil dibuat!');
      navigate(`/memory-journey/${journeyId}`);
    } catch (error) {
      toast.error('Failed to create journey');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setBlueprint(null);
    setValidationResult(null);
  };

  return (
    <>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 md:p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]'
            : 'border-gray-700 hover:border-emerald-500/50 hover:bg-gray-900/50'
          }
          ${isValidating ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isValidating ? (
            <motion.div
              key="validating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              <p className="text-lg font-medium text-gray-300">Memvalidasi blueprint...</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                <FileJson className="w-20 h-20 text-emerald-500 relative" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {isDragActive ? 'Lepaskan file di sini' : 'Upload Blueprint Journey'}
                </h3>
                <p className="text-gray-400">
                  Drag & drop file JSON atau klik untuk memilih
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Upload className="w-4 h-4" />
                <span>Format: .json | Max: 5MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Result */}
        {validationResult && !validationResult.isValid && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.errors.map((error, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{error.field}:</span> {error.message}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>

      {/* Preview Modal - Fullscreen & Scrollable */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="w-full h-full max-w-none max-h-none m-0 p-0 bg-black border-0 rounded-none overflow-hidden">
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <DialogHeader className="border-b border-gray-800/50 px-4 py-4 md:px-6 md:py-5 shrink-0">
              <DialogTitle className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Preview Journey
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm text-gray-400">
                Periksa detail journey sebelum memulai
              </DialogDescription>
            </DialogHeader>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
              {blueprint && (
                <div className="px-4 py-5 md:px-6 md:py-6 space-y-5 md:space-y-6 max-w-3xl mx-auto">
                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-2">
                      {blueprint.story.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                      {blueprint.story.description}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded-xl p-3 md:p-4 border border-gray-800/80">
                      <div className="text-xs text-gray-500 mb-1">Total Scene</div>
                      <div className="text-xl md:text-2xl font-bold text-white">
                        {blueprint.scenes.length}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 md:p-4 border border-gray-800/80">
                      <div className="text-xs text-gray-500 mb-1">Total XP</div>
                      <div className="text-xl md:text-2xl font-bold text-emerald-500">
                        {blueprint.story.total_xp}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 md:p-4 border border-gray-800/80">
                      <div className="text-xs text-gray-500 mb-1">Difficulty</div>
                      <div className="text-base md:text-lg font-semibold text-white capitalize">
                        {blueprint.story.difficulty}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 md:p-4 border border-gray-800/80">
                      <div className="text-xs text-gray-500 mb-1">Estimated Time</div>
                      <div className="text-base md:text-lg font-semibold text-white">
                        {blueprint.story.estimated_time}
                      </div>
                    </div>
                  </div>

                  {/* Themes */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">Themes</div>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.story.themes.map((theme, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <DialogFooter className="border-t border-gray-800/50 px-4 py-3 md:px-6 md:py-4 shrink-0 flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-gray-700 hover:bg-gray-900 h-10 md:h-11 text-sm"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-10 md:h-11 text-sm font-medium"
              >
                Mulai Journey
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
