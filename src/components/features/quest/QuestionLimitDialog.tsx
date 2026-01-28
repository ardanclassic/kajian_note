import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Plus, Zap, Target, Brain, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionLimitDialogProps {
  totalQuestions: number;
  onConfirm: (limit: number) => void;
  onCancel: () => void;
}

// Generate dynamic preset options based on total questions
const generatePresets = (total: number) => {
  const presets = [];

  // Always add 10 if total >= 10
  if (total >= 10) {
    presets.push({ value: 10, label: '10 Soal', icon: Zap, color: 'from-emerald-500 to-teal-500' });
  }

  // Add 20 if total >= 20
  if (total >= 20) {
    presets.push({ value: 20, label: '20 Soal', icon: Target, color: 'from-teal-500 to-cyan-500' });
  }

  // Add 30 if total >= 30
  if (total >= 30) {
    presets.push({ value: 30, label: '30 Soal', icon: Brain, color: 'from-cyan-500 to-blue-500' });
  }

  // Add 50 if total >= 50
  if (total >= 50) {
    presets.push({ value: 50, label: '50 Soal', icon: Flame, color: 'from-orange-500 to-red-500' });
  }

  return presets;
};

export const QuestionLimitDialog = ({
  totalQuestions,
  onConfirm,
  onCancel,
}: QuestionLimitDialogProps) => {
  const defaultLimit = Math.min(20, totalQuestions);
  const [selectedLimit, setSelectedLimit] = useState<number>(defaultLimit);

  const handleConfirm = () => {
    onConfirm(selectedLimit);
  };

  const handleDecrement = () => {
    if (selectedLimit > 1) {
      setSelectedLimit(selectedLimit - 1);
    }
  };

  const handleIncrement = () => {
    if (selectedLimit < totalQuestions) {
      setSelectedLimit(selectedLimit + 1);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLimit(parseInt(e.target.value));
  };

  const presets = generatePresets(totalQuestions);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Pilih Jumlah Soal</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-400 mb-6">
          Total soal tersedia: <span className="text-emerald-400 font-bold">{totalQuestions}</span>
        </p>

        {/* Preset Options - Dynamic Grid */}
        {presets.length > 0 && (
          <div className={`grid ${presets.length === 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 mb-6`}>
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedLimit === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => setSelectedLimit(preset.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${isSelected
                      ? `border-emerald-500 bg-gradient-to-br ${preset.color} bg-opacity-10`
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {preset.label}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* All Questions Button */}
        <button
          onClick={() => setSelectedLimit(totalQuestions)}
          className={`
            w-full p-4 rounded-xl border-2 mb-6 transition-all
            ${selectedLimit === totalQuestions
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
            }
          `}
        >
          <p className={`text-sm font-bold ${selectedLimit === totalQuestions ? 'text-white' : 'text-gray-400'}`}>
            🔥 Semua Soal ({totalQuestions})
          </p>
        </button>

        {/* Slider + Stepper Control */}
        <div className="mb-6 space-y-4">
          <label className="block text-sm text-gray-400 mb-2">Atau sesuaikan manual:</label>

          {/* Display Value */}
          <div className="text-center">
            <span className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {selectedLimit}
            </span>
            <span className="text-gray-500 text-lg ml-2">soal</span>
          </div>

          {/* Slider */}
          <div className="relative px-2">
            <input
              type="range"
              min={1}
              max={totalQuestions}
              value={selectedLimit}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-emerald-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-emerald-500/50
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-emerald-500
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:shadow-emerald-500/50
              "
            />
            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{totalQuestions}</span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDecrement}
              disabled={selectedLimit <= 1}
              className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center
                hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5 text-white" />
            </button>

            {/* Hidden Number Input (for accessibility, remove stepper arrows) */}
            <input
              type="number"
              min={1}
              max={totalQuestions}
              value={selectedLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                if (val >= 1 && val <= totalQuestions) {
                  setSelectedLimit(val);
                }
              }}
              className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-center text-white 
                focus:outline-none focus:border-emerald-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              onClick={handleIncrement}
              disabled={selectedLimit >= totalQuestions}
              className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center
                hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Mulai Kuis
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
