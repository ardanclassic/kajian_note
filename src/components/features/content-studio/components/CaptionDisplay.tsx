// Caption & Hashtags Display - Show blueprint metadata

import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/contentStudioStore';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function CaptionDisplay() {
  const { caption, hashtags } = useEditorStore();
  const [copied, setCopied] = useState(false);

  if (!caption && hashtags.length === 0) {
    return null;
  }

  const copyToClipboard = () => {
    const fullText = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="p-4 bg-black/20 rounded-xl m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold text-white/70 m-0 uppercase tracking-[0.5px]">Caption & Hashtags</h4>
        <motion.button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-md text-blue-500 text-xs font-medium cursor-pointer transition-all hover:bg-blue-500/30 hover:border-blue-500"
          onClick={copyToClipboard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </motion.button>
      </div>

      {caption && (
        <div className="mb-3 p-3 bg-white/5 rounded-lg">
          <p className="text-[13px] leading-relaxed text-white/80 m-0 whitespace-pre-wrap">{caption}</p>
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag, index) => (
            <span key={index} className="inline-block px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400 text-[11px] font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
