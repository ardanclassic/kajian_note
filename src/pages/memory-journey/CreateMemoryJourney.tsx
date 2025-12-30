/**
 * Create Memory Journey Page
 * Upload and create new journey from JSON blueprint
 */

import { motion } from 'framer-motion';
import { ArrowLeft, FileJson, Upload, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { JourneyUploader } from '@/components/features/memory-journey/JourneyUploader';

export default function CreateMemoryJourney() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-5 md:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => navigate('/memory-journey')}
              variant="ghost"
              className="mb-4 text-gray-400 hover:text-white gap-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>

            <h1 className="text-base md:text-xl font-bold text-white mb-1.5 leading-tight">
              Buat Journey Baru
            </h1>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              Upload blueprint JSON untuk memulai perjalanan belajar interaktif
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-5 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Uploader */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <JourneyUploader />
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 md:p-5"
          >
            <div className="md:flex md:flex-row items-start gap-3">
              <div className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500/10 items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-3! leading-tight">
                  Cara Membuat Journey
                </h3>
                <div className="space-y-3">
                  {[
                    { step: 1, title: 'Siapkan Blueprint JSON', desc: 'Buat file JSON dengan struktur yang sesuai.' },
                    { step: 2, title: 'Upload File', desc: 'Drag & drop file JSON atau klik area upload.' },
                    { step: 3, title: 'Preview & Konfirmasi', desc: 'Periksa detail journey sebelum memulai.' },
                    { step: 4, title: 'Mulai Belajar!', desc: 'Journey akan tersimpan di browser.' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[12px] font-bold text-emerald-400">{item.step}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug mb-0.5">{item.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Blueprint Structure Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 md:p-5"
          >
            <div className="md:flex md:flex-row items-start gap-3">
              <div className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500/10 items-center justify-center shrink-0">
                <FileJson className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-3! leading-tight">
                  Struktur Blueprint
                </h3>
                <div className="space-y-1.5 text-sm text-gray-400 leading-relaxed">
                  <p className="truncate mb-0!">Wajib: <code className="text-emerald-400 text-xs">meta, story, scenes</code></p>
                  <p className="truncate mb-0!">Scenes: <code className="text-emerald-400 text-xs">story_text, learning, challenge, xp</code></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Challenge Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 md:p-5"
          >
            <div className="md:flex md:flex-row items-start gap-3">
              <div className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-500/10 items-center justify-center shrink-0">
                <Upload className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-3! leading-tight">
                  Tipe Challenge
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    'Multiple Choice', 'True/False', 'Fill in Blank', 'Scenario Decision', 'Sequence Order'
                  ].map((type) => (
                    <div key={type} className="bg-gray-800/50 rounded-lg p-2.5 truncate">
                      <p className="font-medium text-white truncate text-xs mb-0!">{type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
