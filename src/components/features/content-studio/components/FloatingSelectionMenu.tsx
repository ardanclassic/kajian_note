import React, { useEffect, useState } from 'react';
import { Canvas } from 'fabric';
import { useEditorStore } from '@/store/contentStudioStore';
import { Lock, Unlock, Copy, Trash2 } from 'lucide-react';
import { LayerOrderPopover } from './toolbar/LayerOrderPopover';
import { TransparencyControl } from './toolbar/TransparencyControl';

interface Props {
  canvas: Canvas | null;
}

export const FloatingSelectionMenu: React.FC<Props> = ({ canvas }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const {
    selectedElementId,
    selectedElementIds,
    updateElement,
    reorderElements,
    duplicateElement,
    removeElements,
    removeElement,
    slides,
    currentSlideIndex
  } = useEditorStore();

  const selectedElement = slides[currentSlideIndex]?.elements.find((el) => el.id === selectedElementId);

  const handleElementUpdate = (updates: any) => {
    if (selectedElementId) updateElement(selectedElementId, updates);
  };

  useEffect(() => {
    if (!canvas) return;

    const updatePosition = () => {
      const activeObj = canvas.getActiveObject();
      // Logic: If we have an active object, we generally want to show it.
      // But we hide if it's a multi-selection.
      // We rely on the final render return to block if 'selectedElement' (store data) is not yet ready.

      if (!activeObj || selectedElementIds.length > 1) {
        setVisible(false);
        return;
      }

      const bound = activeObj.getBoundingRect();

      setPosition({
        top: bound.top,
        left: bound.left + bound.width / 2
      });
      setVisible(true);
    };

    // Define specific listeners to ensure we only remove OUR listeners
    const handleUpdate = () => {
      requestAnimationFrame(updatePosition);
    };

    const handleClear = () => {
      setVisible(false);
    };

    // Listeners
    canvas.on('selection:created', handleUpdate);
    canvas.on('selection:updated', handleUpdate);
    canvas.on('selection:cleared', handleClear);
    canvas.on('object:modified', handleUpdate);
    canvas.on('object:moving', handleUpdate);
    canvas.on('object:scaling', handleUpdate);
    canvas.on('object:rotating', handleUpdate);

    // Initial check
    updatePosition();

    return () => {
      canvas.off('selection:created', handleUpdate);
      canvas.off('selection:updated', handleUpdate);
      canvas.off('selection:cleared', handleClear);
      canvas.off('object:modified', handleUpdate);
      canvas.off('object:moving', handleUpdate);
      canvas.off('object:scaling', handleUpdate);
      canvas.off('object:rotating', handleUpdate);
    };
  }, [canvas, selectedElementId, selectedElementIds]); // Depend on ID to avoid drag-thrashing

  if (!visible || !position || !selectedElement) return null;

  return (
    <div
      className="absolute flex items-center gap-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1.5 shadow-xl z-40 pointer-events-auto transition-transform duration-75"
      style={{
        top: position.top - 12, // slightly more spacing
        left: position.left,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <button
        className={`bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center transition-colors rounded ${selectedElement.locked
          ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
          : "text-gray-400 hover:text-white"
          }`}
        onClick={() => handleElementUpdate({ locked: !selectedElement.locked })}
        title={selectedElement.locked ? "Unlock" : "Lock"}
      >
        {selectedElement.locked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      {!selectedElement.locked && (
        <>
          <div className="w-px h-4 bg-white/20 mx-1" />

          <LayerOrderPopover
            elementId={selectedElementId!}
            onReorder={reorderElements}
          />

          <TransparencyControl
            opacity={selectedElement.opacity}
            onChange={(val) => handleElementUpdate({ opacity: val })}
          />

          <div className="w-px h-4 bg-white/20 mx-1" />

          <button
            className="bg-transparent border-none text-gray-400 cursor-pointer p-1.5 flex items-center justify-center hover:text-white transition-colors"
            onClick={() => duplicateElement(selectedElementId!)}
            title="Duplicate"
          >
            <Copy size={16} />
          </button>

          <button
            className="bg-transparent border-none text-gray-400 cursor-pointer p-1.5 flex items-center justify-center hover:text-red-500 transition-colors"
            onClick={() => {
              if (selectedElementIds.length > 1) {
                removeElements(selectedElementIds);
              } else {
                removeElement(selectedElementId!);
              }
            }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
};
