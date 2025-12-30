import { useEffect } from 'react';
import { useEditorStore } from '@/store/contentStudioStore';
import type { CanvasElement } from '@/types/contentStudio.types';

export function useKeyboardShortcuts() {
  const { 
    undo, redo, copy, paste, cut, duplicateElement, removeElement, removeElements,
    updateElement, selectedElementId, selectedElementIds, slides, currentSlideIndex,
    setZoom, zoomLevel, selectElements
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const activeTag = document.activeElement?.tagName;
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
      const isContentEditable = (document.activeElement as HTMLElement)?.isContentEditable;

      // Skip shortcuts when typing (except for some global ones)
      if (isInput || isContentEditable) {
         // Allow ESC to blur input
         if (e.key === 'Escape') {
            (document.activeElement as HTMLElement)?.blur();
         }
         return;
      }

      // Modifier key (Ctrl on Windows/Linux, Cmd on Mac)
      const mod = e.ctrlKey || e.metaKey;

      if (mod) {
        // === EDITING ===
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          copy();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          paste();
        } else if (e.key.toLowerCase() === 'x') {
          e.preventDefault();
          cut();
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          if (selectedElementId) duplicateElement(selectedElementId);
        } else if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          const currentSlide = slides[currentSlideIndex];
          const allIds = currentSlide.elements.map(el => el.id);
          selectElements(allIds);
        }

        // === TEXT FORMATTING ===
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          toggleStyle('fontWeight', 700, 400);
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          toggleStyle('fontStyle', 'italic', 'normal');
        }

        // === ZOOM SHORTCUTS ===
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom(Math.min(200, zoomLevel + 10));
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          setZoom(Math.max(25, zoomLevel - 10));
        } else if (e.key === '0') {
          e.preventDefault();
          // Reset to 100% (Fit to screen would need container dimensions)
          setZoom(100);
        } else if (e.key === '1') {
          e.preventDefault();
          setZoom(100);
        } else if (e.key === '2') {
          e.preventDefault();
          setZoom(200);
        }

        // === SHIFT COMBOS ===
        if (e.shiftKey) {
          if (e.key === '>' || e.key === '.') {
            e.preventDefault();
            adjustFontSize(2);
          } else if (e.key === '<' || e.key === ',') {
            e.preventDefault();
            adjustFontSize(-2);
          } else if (e.key.toLowerCase() === 'l') {
            e.preventDefault();
            applyUpdate({ textAlign: 'left' } as any);
          } else if (e.key.toLowerCase() === 'e') {
            e.preventDefault();
            applyUpdate({ textAlign: 'center' } as any);
          } else if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            applyUpdate({ textAlign: 'right' } as any);
          }
        }

      } else {
        // === NO MODIFIER ===
        
        // Delete selected elements
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          if (selectedElementIds.length > 0) {
            removeElements(selectedElementIds);
          } else if (selectedElementId) {
            removeElement(selectedElementId);
          }
        }
        
        // ESC to deselect
        if (e.key === 'Escape') {
          e.preventDefault();
          selectElements([]);
        }
        
        // Arrow keys are handled in CanvasEditor.tsx for smooth movement
      }
    };

    // === HELPER FUNCTIONS ===
    
    const getSelectedTextElement = () => {
      if (!selectedElementId) return null;
      const currentSlide = slides[currentSlideIndex];
      const el = currentSlide.elements.find(e => e.id === selectedElementId);
      return (el && el.type === 'text') ? el : null;
    };

    const toggleStyle = (prop: string, val1: any, val2: any) => {
      const el = getSelectedTextElement();
      if (el) {
        const currentVal = (el as any)[prop];
        updateElement(el.id, { [prop]: currentVal === val1 ? val2 : val1 });
      }
    };
    
    const adjustFontSize = (delta: number) => {
      const el = getSelectedTextElement();
      if (el) {
        const currentSize = (el as any).fontSize || 16;
        updateElement(el.id, { fontSize: Math.max(6, Math.min(200, currentSize + delta)) });
      }
    };

    const applyUpdate = (update: Partial<CanvasElement>) => {
      if (selectedElementId) {
        updateElement(selectedElementId, update);
      }
      // For multi-selection, could batch update if store supports it
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, redo, copy, paste, cut, duplicateElement, removeElement, removeElements, 
    updateElement, selectedElementId, selectedElementIds, slides, currentSlideIndex, 
    setZoom, zoomLevel, selectElements
  ]);
}