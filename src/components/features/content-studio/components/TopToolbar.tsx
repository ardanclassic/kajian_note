import {
   Copy, Trash2, Undo2,
   Palette,
   Bold, Italic, AlignLeft, AlignCenter, AlignRight,
   Lock, Unlock,
   Upload, FileJson, Crop,
   Underline, Strikethrough, Minus, Plus, ArrowUpDown
} from 'lucide-react';
import { useEditorStore } from '@/store/contentStudioStore';
import { useRef } from 'react';
import type { TextElement, ShapeElement, ImageElement, CanvasElement } from '@/types/contentStudio.types';
import { cn } from "@/lib/utils";

// Sub-components (Extracted)
// Sub-components (Extracted)
import { FontSizeCombobox } from './toolbar/FontSizeCombobox';
import { FontFamilySelect } from './toolbar/FontFamilySelect';
import { SpacingControl } from './toolbar/SpacingControl';
import { FillColorControl } from './toolbar/FillColorControl';
import { StrokeStyleControl } from './toolbar/StrokeStyleControl';
import { CornerControl } from './toolbar/CornerControl';
import { PositionControl } from './toolbar/PositionControl';
import { ObjectFlipControl } from './toolbar/ObjectFlipControl';
import { LineControls } from './toolbar/LineControls';
import { TextColorPicker } from './toolbar/TextColorPicker';

export function TopToolbar() {
   const {
      selectedElementId,
      selectedElementIds,
      removeElement,
      updateElement,
      updateElements,
      slides,
      currentSlideIndex,
      updateSlide,
      ratio,
      setCroppingElementId,
   } = useEditorStore();

   const currentSlide = slides[currentSlideIndex];
   const selectedElement = selectedElementId ? currentSlide?.elements.find(e => e.id === selectedElementId) : null;

   const fileInputRef = useRef<HTMLInputElement>(null);

   const isTextElement = selectedElement && selectedElement.type === 'text';
   const isShapeElement = selectedElement && selectedElement.type === 'shape';
   const isImageElement = selectedElement && selectedElement.type === 'image';

   // Hide toolbar if no element is selected or element is locked
   if (!selectedElement || selectedElement.locked) {
      return null;
   }

   const handleElementUpdate = (updates: Partial<CanvasElement>) => {
      if (!selectedElementId) return;

      if (selectedElementIds.length > 1) {
         // Multi-selection update
         const updatesList = selectedElementIds.map(id => ({
            id,
            changes: updates
         }));
         updateElements(updatesList);
      } else {
         // Single selection update
         updateElement(selectedElementId, updates);
      }
   };

   const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedElement || selectedElement.type !== 'image') return;

      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         const src = event.target?.result as string;

         // Logic to maintain visual width on replacement
         const img = new Image();
         img.onload = () => {
            const currentDisplayedWidth = selectedElement.size.width * (selectedElement.scaleX || 1);
            const currentDisplayedHeight = selectedElement.size.height * (selectedElement.scaleY || 1);

            // Calculate new scale to match the old displayed width (Aspect Fill Width)
            const newScale = currentDisplayedWidth / img.naturalWidth;

            // Calculate what the internal height needs to be to match the old displayed height
            let newInternalHeight = currentDisplayedHeight / newScale;

            updateElement(selectedElementId!, {
               src,
               size: {
                  width: img.naturalWidth,
                  height: newInternalHeight
               },
               scaleX: newScale,
               scaleY: newScale,
               // Reset crop when replacing image
               cropX: 0,
               cropY: 0
            });
         };
         img.src = src;
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   return (
      <div className="absolute top-5 left-1/2 z-50 flex h-[50px] max-w-[95vw] -translate-x-1/2 items-center gap-2 overflow-visible rounded-full border border-border bg-card px-5 shadow-2xl">
         {/* MODE 1: IDLE */}
         {isTextElement && (
            <div className="flex shrink-0 items-center gap-1.5">
               {/* ... (Existing Text Controls) ... */}
               <div style={{ width: 140 }}>
                  <FontFamilySelect
                     value={(selectedElement as TextElement).fontFamily || 'Inter'}
                     onChange={(val) => handleElementUpdate({ fontFamily: val })}
                  />
               </div>

               <div className="flex items-center gap-1">
                  <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                     onClick={() => {
                        const current = (selectedElement as TextElement).fontSize || 16;
                        handleElementUpdate({ fontSize: Math.max(1, current - 1) });
                     }}>
                     <Minus size={12} />
                  </button>
                  <FontSizeCombobox
                     value={Math.round((selectedElement as TextElement).fontSize || 16)}
                     onChange={(val) => handleElementUpdate({ fontSize: val })}
                  />
                  <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                     onClick={() => {
                        const current = (selectedElement as TextElement).fontSize || 16;
                        handleElementUpdate({ fontSize: current + 1 });
                     }}>
                     <Plus size={12} />
                  </button>
               </div>

               <TextColorPicker
                  color={(selectedElement as TextElement).fill}
                  onChange={(color) => handleElementUpdate({ fill: color })}
               />

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               {/* Text Position & Flip */}
               <PositionControl
                  x={selectedElement.position.x}
                  y={selectedElement.position.y}
                  width={selectedElement.size.width}
                  height={selectedElement.size.height}
                  rotation={selectedElement.rotation}
                  scaleX={selectedElement.scaleX}
                  scaleY={selectedElement.scaleY}
                  ratio={ratio}
                  onChange={(updates) => handleElementUpdate(updates)}
                  showSizeResults={false} // Hide size for text as it is auto-calculated mostly
               />

               <ObjectFlipControl
                  onFlip={(direction) => {
                     if (direction === 'horizontal') {
                        handleElementUpdate({ scaleX: (selectedElement.scaleX || 1) * -1 });
                     } else {
                        handleElementUpdate({ scaleY: (selectedElement.scaleY || 1) * -1 });
                     }
                  }}
               />

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               <div className="flex items-center gap-0.5">
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).fontWeight >= 700 && "bg-blue-500/20 text-blue-500")}
                     onClick={() => handleElementUpdate({ fontWeight: (selectedElement as TextElement).fontWeight >= 700 ? 400 : 700 })}
                  >
                     <Bold size={16} />
                  </button>
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).textDecoration === 'underline' && "bg-blue-500/20 text-blue-500")}
                     onClick={() => handleElementUpdate({ textDecoration: (selectedElement as TextElement).textDecoration === 'underline' ? 'none' : 'underline' })}
                  >
                     <Underline size={16} />
                  </button>
                  <button
                     className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground", (selectedElement as TextElement).textDecoration === 'line-through' && "bg-blue-500/20 text-blue-500")}
                     onClick={() => handleElementUpdate({ textDecoration: (selectedElement as TextElement).textDecoration === 'line-through' ? 'none' : 'line-through' })}
                  >
                     <Strikethrough size={16} />
                  </button>
               </div>

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               <button
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                     const current = (selectedElement as TextElement).textAlign || 'left';
                     const next = current === 'left' ? 'center' : (current === 'center' ? 'right' : 'left');
                     handleElementUpdate({ textAlign: next });
                  }}
               >
                  {(selectedElement as TextElement).textAlign === 'center' ? <AlignCenter size={16} /> :
                     (selectedElement as TextElement).textAlign === 'right' ? <AlignRight size={16} /> :
                        <AlignLeft size={16} />}
               </button>

               <SpacingControl
                  lineHeight={(selectedElement as TextElement).lineHeight || 1.4}
                  letterSpacing={(selectedElement as TextElement).letterSpacing || 0}
                  onChange={(key, val) => handleElementUpdate({ [key]: val })}
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
                  onChange={(updates) => handleElementUpdate(updates)}
               />

               {selectedElement.shapeType === 'line' ? (
                  <LineControls
                     lineStart={(selectedElement as ShapeElement).lineStart}
                     lineEnd={(selectedElement as ShapeElement).lineEnd}
                     onChange={(updates) => handleElementUpdate(updates)}
                  />
               ) : (
                  <>
                     <CornerControl
                        cornerRadius={(selectedElement as ShapeElement).cornerRadius || 0}
                        cornerRadii={(selectedElement as ShapeElement).cornerRadii}
                        shapeType={(selectedElement as ShapeElement).shapeType}
                        onChange={(updates) => handleElementUpdate(updates)}
                     />

                     <FillColorControl
                        fill={(selectedElement as ShapeElement).fill || '#ffffff'}
                        onChange={(color) => handleElementUpdate({ fill: color })}
                     />
                  </>
               )}

               <div className="h-6 w-px shrink-0 bg-border mx-1" />

               {/* Unified Position Control */}
               <PositionControl
                  x={selectedElement.position.x}
                  y={selectedElement.position.y}
                  width={selectedElement.size.width}
                  height={selectedElement.size.height}
                  rotation={selectedElement.rotation}
                  scaleX={selectedElement.scaleX}
                  scaleY={selectedElement.scaleY}
                  ratio={ratio}
                  onChange={(updates) => handleElementUpdate(updates)}
                  showSizeResults={selectedElement.shapeType !== 'line'}
               />

               <ObjectFlipControl
                  onFlip={(direction) => {
                     if (direction === 'horizontal') {
                        handleElementUpdate({ scaleX: (selectedElement.scaleX || 1) * -1 });
                     } else {
                        handleElementUpdate({ scaleY: (selectedElement.scaleY || 1) * -1 });
                     }
                  }}
               />

               {/* Text on Shape - Hide for Lines */}
               {selectedElement.shapeType !== 'line' && (
                  <>
                     <div className="h-6 w-px shrink-0 bg-border mx-1" />
                     {/* ... (Existing Text on Shape controls) ... */}
                     <div style={{ width: 140 }}>
                        <FontFamilySelect
                           value={(selectedElement as ShapeElement).textFontFamily || 'Inter'}
                           onChange={(val) => handleElementUpdate({ textFontFamily: val })}
                        />
                     </div>

                     <div className="flex items-center">
                        <input
                           type="number"
                           className="h-7 w-12 rounded-md border border-input bg-transparent px-2 text-center text-xs"
                           value={(selectedElement as ShapeElement).textFontSize || 16}
                           onChange={(e) => handleElementUpdate({ textFontSize: parseInt(e.target.value) || 16 })}
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
                           onChange={(e) => handleElementUpdate({ textFill: e.target.value })}
                        />
                     </div>

                     <button
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => {
                           const currentAlign = (selectedElement as ShapeElement).textAlign || 'center';
                           const nextAlign = currentAlign === 'left' ? 'center' :
                              currentAlign === 'center' ? 'right' : 'left';
                           handleElementUpdate({ textAlign: nextAlign });
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
               {/* ... (Existing Image Controls) ... */}
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

               <PositionControl
                  x={selectedElement.position.x}
                  y={selectedElement.position.y}
                  width={selectedElement.size.width}
                  height={selectedElement.size.height}
                  rotation={selectedElement.rotation}
                  scaleX={selectedElement.scaleX}
                  scaleY={selectedElement.scaleY}
                  ratio={ratio}
                  onChange={(updates) => handleElementUpdate(updates)}
               />

               <ObjectFlipControl
                  onFlip={(direction) => {
                     if (direction === 'horizontal') {
                        handleElementUpdate({ scaleX: (selectedElement.scaleX || 1) * -1 });
                     } else {
                        handleElementUpdate({ scaleY: (selectedElement.scaleY || 1) * -1 });
                     }
                  }}
               />

               <button
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setCroppingElementId(selectedElementId!)}
                  title="Crop"
               >
                  <Crop size={16} />
               </button>

               <CornerControl
                  cornerRadius={(selectedElement as ImageElement).cornerRadius || 0}
                  cornerRadii={(selectedElement as ImageElement).cornerRadii}
                  shapeType="rect"
                  onChange={(updates) => handleElementUpdate(updates)}
               />
            </div>
         )}

      </div>
   );
}