// Caption & Hashtags Display - Show blueprint metadata

import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/contentStudioStore';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function CaptionDisplay() {
  const { caption, hashtags, setCaption, setHashtags } = useEditorStore();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const tags = hashtags.join(' ');
    const fullText = `${caption}\n\n${tags}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHashtagsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const tags = val.split(/\s+/).filter(t => t);
    setHashtags(tags);
  };

  return (
    <div className="px-5 pb-5">
      {/* Copy Button */}
      <div className="flex justify-end mb-3">
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

      {/* Caption Textarea */}
      <div className="mb-3 p-1 bg-white/5 rounded-lg border border-transparent focus-within:border-blue-500/50 transition-colors">
        <textarea
          className="w-full min-h-[80px] bg-transparent border-none text-[13px] leading-relaxed text-white/90 p-2 focus:outline-none resize-none custom-scrollbar font-sans"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {/* Hashtags Textarea */}
      <div className="p-1 bg-white/5 rounded-lg border border-transparent focus-within:border-blue-500/50 transition-colors">
        <textarea
          className="w-full min-h-[40px] bg-transparent border-none text-[13px] leading-relaxed text-blue-400 p-2 focus:outline-none resize-none custom-scrollbar font-mono"
          placeholder="#hashtags"
          value={hashtags.join(" ")}
          onChange={handleHashtagsChange}
        />
      </div>
    </div>
  );
}
