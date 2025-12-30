// Supporting Boxes Toolbar - Add pre-designed grouped elements

import { motion } from 'framer-motion';
import { useEditorStore, DEFAULT_COLOR_PALETTE } from '@/store/contentStudioStore';
import { createSupportingBox, type SupportingBoxType } from '@/utils/contentStudio/supportingBoxes';
import {
  AlertTriangle,
  Lightbulb,
  Bell,
  Target,
  ScrollText
} from 'lucide-react';

export function SupportingBoxesToolbar() {
  const { ratio, addElements } = useEditorStore();

  const addBox = (type: SupportingBoxType) => {
    const config = getBoxConfig(type);
    const elements = createSupportingBox(config, ratio, DEFAULT_COLOR_PALETTE);
    addElements(elements);
  };

  const boxes = [
    {
      type: 'important_note' as const,
      icon: AlertTriangle,
      label: 'Important Note',
      color: '#EF4444'
    },
    {
      type: 'wisdom_box' as const,
      icon: Lightbulb,
      label: 'Wisdom Box',
      color: '#A855F7'
    },
    {
      type: 'reminder' as const,
      icon: Bell,
      label: 'Reminder',
      color: '#3B82F6'
    },
    {
      type: 'action_box' as const,
      icon: Target,
      label: 'Action Box',
      color: '#22C55E'
    },
    {
      type: 'dalil_box' as const,
      icon: ScrollText,
      label: 'Dalil/Quote',
      color: '#FBBF24'
    }
  ];

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 gap-2">
        {boxes.map((box, index) => (
          <motion.button
            key={box.type}
            className="group flex items-center gap-2.5 px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-lg text-white/80 cursor-pointer transition-all text-[13px] font-medium text-left hover:bg-white/10 hover:border-[var(--box-color)] hover:text-[var(--box-color)]"
            onClick={() => addBox(box.type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ '--box-color': box.color } as any}
          >
            <box.icon size={18} className="shrink-0" />
            <span>{box.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function getBoxConfig(type: SupportingBoxType) {
  switch (type) {
    case 'important_note':
      return {
        type,
        title: 'Important Note',
        content: 'Add your important information here...'
      };
    case 'wisdom_box':
      return {
        type,
        title: 'Key Insight',
        content: 'Share your wisdom or key takeaway...'
      };
    case 'reminder':
      return {
        type,
        title: 'Remember',
        content: 'Add a gentle reminder here...'
      };
    case 'action_box':
      return {
        type,
        title: 'Action Step',
        content: 'What should the reader do next?'
      };
    case 'dalil_box':
      return {
        type,
        title: 'Reference',
        content: 'Add quote, dalil, or citation here...'
      };
    default:
      return {
        type,
        title: 'Note',
        content: 'Add your content here...'
      };
  }
}
