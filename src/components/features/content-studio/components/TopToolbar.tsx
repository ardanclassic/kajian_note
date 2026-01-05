import {
   Copy, Trash2, Undo2,
   Palette,
   Bold, Italic, AlignLeft, AlignCenter, AlignRight,
   Lock, Unlock,
   Upload,
   Underline, Strikethrough, Minus, Plus, ArrowUpDown
} from 'lucide-react';
import { useEditorStore } from '@/store/contentStudioStore';
import { useRef } from 'react';
import type { TextElement, ShapeElement, ImageElement } from '@/types/contentStudio.types';
import { cn } from "@/lib/utils";

// Sub-components (Extracted)
import { FontSizeCombobox } from './toolbar/FontSizeCombobox';
import { FontFamilySelect } from './toolbar/FontFamilySelect';
import { LayerOrderPopover } from './toolbar/LayerOrderPopover';
import { SpacingControl } from './toolbar/SpacingControl';
import { FillColorControl } from './toolbar/FillColorControl';
import { StrokeStyleControl } from './toolbar/StrokeStyleControl';
import { CornerControl } from './toolbar/CornerControl';
import { TransparencyControl } from './toolbar/TransparencyControl';
import { ImagePositionPopover } from './toolbar/ImagePositionPopover';
import { ImageFlipControl } from './toolbar/ImageFlipControl';
import { LinePositionPopover } from './toolbar/LinePositionPopover';
import { LineControls } from './toolbar/LineControls';

export function TopToolbar() {
   const {
      selectedElementId,
      duplicateElement,
      removeElement,
      updateElement,
      slides,
      currentSlideIndex,
      updateSlide,
      reorderElements,
      ratio
   } = useEditorStore();

   const currentSlide = slides[currentSlideIndex];
   const selectedElement = selectedElementId ? currentSlide?.elements.find(e => e.id === selectedElementId) : null;

   const isTextElement = selectedElement && selectedElement.type === 'text';
   const isShapeElement = selectedElement && selectedElement.type === 'shape';
   const isImageElement = selectedElement && selectedElement.type === 'image';

   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedElement || selectedElement.type !== 'image') return;

      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         const src = event.target?.result as string;
         updateElement(selectedElementId!, { src });
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   return (
      <div className="absolute top-5 left-1/2 z-50 flex h-[50px] max-w-[95vw] -translate-x-1/2 items-center gap-2 overflow-visible rounded-full border border-border bg-card px-5 shadow-2xl">
         {/* MODE 1: IDLE */}
         {!selectedElement && (
            <div className="flex shrink-0 items-center gap-1">
               <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                  <Palette size={18} className="pointer-events-none text-foreground z-10" />
                  <input
                     type="color"
                     className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                     value={currentSlide?.backgroundColor || '#ffffff'}
                     onChange={(e) => updateSlide(currentSlideIndex, { backgroundColor: e.target.value })}
                     title="Slide Background"
                  />
               </div>
            </div>
         )}

         {/* MODE 2: TEXT ELEMENT */}
         {isTextElement && (
            <div className="flex shrink-0 items-center gap-1.5">
               <div style={{ width: 140 }}>
                  <FontFamilySelect
                     value={(selectedElement as TextElement).fontFamily}
                     onChange={(val) => updateElement(selectedElementId!, { fontFamily: val })}
                  />
               </div>

               <div className="flex items-center gap-1">
                  <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                     onClick={() => {
                        const current = (selectedElement as TextElement).fontSize || 16;
                        updateElement(selectedElementId!, { fontSize: Math.max(1, current - 1) });
                     }}>
                     <Minus size={12} />
                  </button>
                  <FontSizeCombobox
                     value={Math.round((selectedElement as TextElement).fontSize || 16)}
                     onChange={(val) => updateElement(selectedElementId!, { fontSize: val })}
                  />
                  <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                     onClick={() => {
                        const current = (selectedElement as TextElement).fontSize || 16;
                        updateElement(selectedElementId!, { fontSize: current + 1 });
                     }}>
                     <Plus size={12} />
                  </button>
               </div>

               <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                  <span className="pointer-events-none z-10 text-xs font-bold text-foreground">A</span>
                  <div className="absolute bottom-0 h-1 w-full" style={{ backgroundColor: (selectedElement as TextElement).fill || '#000000' }}></div>
                  <input
                     type="color"
                     className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                     value={(selectedElement as TextElement).fill}
                     onChange={(e) => updateElement(selectedElementId!, { fill: e.target.value })}
                     title="Text Color"
                  />
               </div>

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               <div className="flex items-center gap-0.5">
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).fontWeight >= 700 && "bg-blue-500/20 text-blue-500")}
                     onClick={() => updateElement(selectedElementId!, { fontWeight: (selectedElement as TextElement).fontWeight >= 700 ? 400 : 700 })}
                  >
                     <Bold size={16} />
                  </button>
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).fontStyle === 'italic' && "bg-blue-500/20 text-blue-500")}
                     onClick={() => updateElement(selectedElementId!, { fontStyle: (selectedElement as TextElement).fontStyle === 'italic' ? 'normal' : 'italic' })}
                  >
                     <Italic size={16} />
                  </button>
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).textDecoration === 'underline' && "bg-blue-500/20 text-blue-500")}
                     onClick={() => updateElement(selectedElementId!, { textDecoration: (selectedElement as TextElement).textDecoration === 'underline' ? 'none' : 'underline' })}
                  >
                     <Underline size={16} />
                  </button>
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).textDecoration === 'line-through' && "bg-blue-500/20 text-blue-500")}
                     onClick={() => updateElement(selectedElementId!, { textDecoration: (selectedElement as TextElement).textDecoration === 'line-through' ? 'none' : 'line-through' })}
                  >
                     <Strikethrough size={16} />
                  </button>
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).textTransform === 'uppercase' && "bg-blue-500/20 text-blue-500")}
                     onClick={() => updateElement(selectedElementId!, { textTransform: (selectedElement as TextElement).textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                  >
                     <span className="text-[10px] font-semibold">aA</span>
                  </button>
               </div>

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               <button
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                     const current = (selectedElement as TextElement).textAlign || 'left';
                     const next = current === 'left' ? 'center' : (current === 'center' ? 'right' : 'left');
                     updateElement(selectedElementId!, { textAlign: next });
                  }}
               >
                  {(selectedElement as TextElement).textAlign === 'center' ? <AlignCenter size={16} /> :
                     (selectedElement as TextElement).textAlign === 'right' ? <AlignRight size={16} /> :
                        <AlignLeft size={16} />}
               </button>

               <SpacingControl
                  lineHeight={(selectedElement as TextElement).lineHeight || 1.4}
                  letterSpacing={(selectedElement as TextElement).letterSpacing || 0}
                  onChange={(key, val) => updateElement(selectedElementId!, { [key]: val })}
               />
            </div>
         )}

         {/* MODE 3: SHAPE ELEMENT */}
         {isShapeElement && (
            <div className="flex shrink-0 items-center gap-1.5">
               <StrokeStyleControl
                  stroke={(selectedElement as ShapeElement).stroke || '#000000'}
                  strokeWidth={(selectedElement as ShapeElement).strokeWidth || 0}
                  strokeDashArray={(selectedElement as ShapeElement).strokeDashArray}
                  onChange={(updates) => updateElement(selectedElementId!, updates)}
               />

               {selectedElement.shapeType === 'line' ? (
                  <LineControls
                     lineStart={(selectedElement as ShapeElement).lineStart}
                     lineEnd={(selectedElement as ShapeElement).lineEnd}
                     onChange={(updates) => updateElement(selectedElementId!, updates)}
                  />
               ) : (
                  <>
                     <CornerControl
                        cornerRadius={(selectedElement as ShapeElement).cornerRadius || 0}
                        shapeType={(selectedElement as ShapeElement).shapeType}
                        onChange={(updates) => updateElement(selectedElementId!, updates)}
                     />

                     <FillColorControl
                        fill={(selectedElement as ShapeElement).fill || '#ffffff'}
                        onChange={(color) => updateElement(selectedElementId!, { fill: color })}
                     />
                  </>
               )}

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               {/* Position Control (Added for Line/Shapes) */}
               {selectedElement.shapeType === 'line' ? (
                  <LinePositionPopover
                     currentPosition={selectedElement.position}
                     currentSize={selectedElement.size}
                     scaleX={1}
                     scaleY={1}
                     ratio={ratio}
                     onPositionChange={(pos) => updateElement(selectedElementId!, { position: pos })}
                  />
               ) : (
                  <ImagePositionPopover
                     currentPosition={selectedElement.position}
                     currentSize={selectedElement.size}
                     scaleX={1}
                     scaleY={1}
                     ratio={ratio}
                     onPositionChange={(pos) => updateElement(selectedElementId!, { position: pos })}
                  />
               )}

               {/* Text on Shape - Hide for Lines */}
               {selectedElement.shapeType !== 'line' && (
                  <>
                     <div className="h-6 w-px shrink-0 bg-border mx-1" />
                     <div style={{ width: 140 }}>
                        <FontFamilySelect
                           value={(selectedElement as ShapeElement).textFontFamily || 'Inter'}
                           onChange={(val) => updateElement(selectedElementId!, { textFontFamily: val })}
                        />
                     </div>

                     <div className="flex items-center">
                        <input
                           type="number"
                           className="h-7 w-12 rounded-md border border-input bg-transparent px-2 text-center text-xs"
                           value={(selectedElement as ShapeElement).textFontSize || 16}
                           onChange={(e) => updateElement(selectedElementId!, { textFontSize: parseInt(e.target.value) || 16 })}
                           min="8" max="200"
                        />
                     </div>

                     <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                        <span className="pointer-events-none z-10 text-xs font-bold text-foreground">A</span>
                        <div className="absolute bottom-0 h-1 w-full" style={{ backgroundColor: (selectedElement as ShapeElement).textFill || '#ffffff' }}></div>
                        <input
                           type="color"
                           className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                           value={(selectedElement as ShapeElement).textFill || '#ffffff'}
                           onChange={(e) => updateElement(selectedElementId!, { textFill: e.target.value })}
                        />
                     </div>

                     <button
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => {
                           const currentAlign = (selectedElement as ShapeElement).textAlign || 'center';
                           const nextAlign = currentAlign === 'left' ? 'center' :
                              currentAlign === 'center' ? 'right' : 'left';
                           updateElement(selectedElementId!, { textAlign: nextAlign });
                        }}
                     >
                        {(selectedElement as ShapeElement).textAlign === 'center' ? <AlignCenter size={16} /> :
                           (selectedElement as ShapeElement).textAlign === 'right' ? <AlignRight size={16} /> :
                              <AlignLeft size={16} />}
                     </button>
                  </>
               )}
            </div>
         )}

         {/* MODE 4: IMAGE */}
         {isImageElement && (
            <div className="flex shrink-0 items-center gap-1.5">
               <button
                  className="flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-500 transition-all hover:bg-blue-500/25 hover:border-blue-500"
                  onClick={() => fileInputRef.current?.click()}
               >
                  <Upload size={14} />
                  <span>Replace</span>
               </button>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageReplace}
                  style={{ display: 'none' }}
               />

               <button
                  className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground"
                  onClick={() => {
                     if (selectedElement) {
                        const imageEl = selectedElement as ImageElement;
                        updateSlide(currentSlideIndex, {
                           backgroundImage: imageEl.src,
                           metadata: {
                              ...currentSlide?.metadata,
                              previousBackgroundElement: {
                                 ...imageEl,
                                 wasBackground: true
                              }
                           }
                        });
                        removeElement(selectedElementId!);
                     }
                  }}
                  title="Set as Background"
               >
                  <ArrowUpDown size={14} className="rotate-90" />
                  <span>Set BG</span>
               </button>

               {currentSlide?.backgroundImage && currentSlide?.metadata?.previousBackgroundElement && (
                  <button
                     className="flex items-center gap-1.5 rounded-md border border-orange-500/30 bg-orange-500/15 px-3 py-1.5 text-xs font-medium text-orange-500 transition-all hover:bg-orange-500/25 hover:border-orange-500"
                     onClick={() => {
                        const prevElement = currentSlide?.metadata?.previousBackgroundElement;
                        if (prevElement) {
                           const { wasBackground, ...elementData } = prevElement;
                           updateSlide(currentSlideIndex, {
                              backgroundImage: undefined,
                              metadata: {
                                 ...currentSlide?.metadata,
                                 previousBackgroundElement: undefined
                              }
                           });
                           useEditorStore.getState().addElement(elementData);
                        }
                     }}
                     title="Restore from Background"
                  >
                     <Undo2 size={14} />
                     <span>Undo BG</span>
                  </button>
               )}

               <div className="h-6 w-px shrink-0 bg-border mx-1" />


               <ImagePositionPopover
                  currentPosition={(selectedElement as ImageElement).position}
                  currentSize={(selectedElement as ImageElement).size}
                  scaleX={(selectedElement as ImageElement).scaleX}
                  scaleY={(selectedElement as ImageElement).scaleY}
                  ratio={ratio}
                  onPositionChange={(pos) => updateElement(selectedElementId!, { position: pos })}
               />

               <ImageFlipControl
                  onFlip={(direction) => {
                     const img = selectedElement as ImageElement;
                     if (direction === 'horizontal') {
                        updateElement(selectedElementId!, { scaleX: img.scaleX * -1 });
                     } else {
                        updateElement(selectedElementId!, { scaleY: img.scaleY * -1 });
                     }
                  }}
               />


               <CornerControl
                  cornerRadius={(selectedElement as ImageElement).cornerRadius || 0}
                  shapeType="rect"
                  onChange={(updates) => updateElement(selectedElementId!, updates)}
               />
            </div>
         )}

         {/* COMMON CONTROLS */}
         {selectedElement && (
            <>
               <div className="h-6 w-px shrink-0 bg-border mx-1" />
               <div className="flex shrink-0 items-center gap-1">
                  <button
                     className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                     onClick={() => updateElement(selectedElementId!, { locked: !selectedElement.locked })}
                  >
                     {selectedElement.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>

                  <LayerOrderPopover
                     elementId={selectedElementId!}
                     onReorder={reorderElements}
                  />

                  <TransparencyControl
                     opacity={selectedElement.opacity}
                     onChange={(val) => updateElement(selectedElementId!, { opacity: val })}
                  />

                  <button
                     className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                     onClick={() => duplicateElement(selectedElementId!)}
                     title="Duplicate"
                  >
                     <Copy size={16} />
                  </button>

                  <button
                     className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-red-500/60 hover:bg-red-500/10 hover:text-red-500"
                     onClick={() => removeElement(selectedElementId!)}
                     title="Delete"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            </>
         )}
      </div>
   );
}