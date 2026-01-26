/**
 * useCanvas Hook
 *
 * Manages the lifecycle of a Fabric.js canvas instance for a single slide.
 * Handles:
 * - Canvas initialization and sizing
 * - Syncing Fabric objects with Redux/Zustand state
 * - Event listeners (selection, modification, text editing)
 * - Multi-selection logic and history management
 *
 * Note: This hook is designed to work in a list of canvases (Scroll Spy architecture),
 * so it must handle activation/deactivation and mounting/unmounting gracefully.
 */

import { useEffect, useRef } from "react";
import { Canvas, Textbox, FabricObject, ActiveSelection, FabricImage, util, Point } from "fabric";
import { useEditorStore } from "@/store/contentStudioStore";
import type { TextElement, ShapeElement, ImageElement, Ratio } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS, DISPLAY_DIMENSIONS } from "@/types/contentStudio.types";

declare module "fabric" {
  interface FabricObject {
    customData?: { id: string };
  }
}

import { createFabricObject, CONTROL_DEFAULTS, loadFont, createGradient } from "@/utils/contentStudio/fabricUtils";
import {
  setupShapeTextEditing,
  setupMultiSelectTracking,
  setupObjectModification,
  handleShiftClickSelection,
} from "@/utils/contentStudio/fabricHandlers";
import { initAligningGuidelines } from "@/utils/contentStudio/smartGuides";
import type { Slide } from "@/types/contentStudio.types";

interface UseCanvasOptions {
  ratio: Ratio;
  zoom: number;
  onMount?: (canvas: Canvas) => void;
}

export function useCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseCanvasOptions,
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  slide: Slide, // Direct prop access ensures we render the correct slide data during reorder operations
  slideIndex: number, // Used to detect if this canvas is the currently "active" slide in the viewport
) {
  const canvasRef = useRef<Canvas | null>(null);
  const isRenderingRef = useRef(false);
  // Track text editing state to prevent re-renders interrupting the user
  const isEditingRef = useRef(false);
  // Track internal selection updates to prevent clearing selection
  const isInternalSelectionUpdateRef = useRef(false);
  // Track multi-select modifications to prevent re-render during drag
  const isMultiSelectModifyingRef = useRef(false);
  const selectionCoordsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  // Track previous slide index to force rebuild on move (fix blank page)
  const prevSlideIndexRef = useRef(slideIndex);

  // FIX STALE CLOSURES: Always track latest props in refs for event listeners
  const currentSlideRef = useRef(slide);
  currentSlideRef.current = slide;
  const slideIndexRef = useRef(slideIndex);
  slideIndexRef.current = slideIndex;

  // Track last synced elements to detect actual changes (Moved to top for Init access)
  const lastSyncedElementsRef = useRef<string>("");
  // Store fabric objects map for selection sync
  const fabricObjectsMapRef = useRef<Map<string, FabricObject>>(new Map());

  const {
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    updateElement,
    updateElements,
    removeElements,
    selectElement,
    selectElements,
    pushToHistory,
    setCurrentSlide, // Added
    setCroppingElementId,
  } = useEditorStore();

  // CRITICAL FIX: Use slide from props instead of deriving from store
  // This ensures we always have the correct slide data even during reorder race conditions
  const currentSlide = slide;
  const dimensions = RATIO_DIMENSIONS[options.ratio];
  const displayDimensions = DISPLAY_DIMENSIONS[options.ratio];

  // Only load fonts for selected element if this is the active slide
  useEffect(() => {
    if (canvasRef.current && selectedElementId && currentSlide && currentSlideIndex === slideIndex) {
      const el = currentSlide.elements.find((e) => e.id === selectedElementId);
      if (el?.type === "text") {
        loadFont((el as TextElement).fontFamily, (el as TextElement).fontWeight).then(() => {
          if (!isEditingRef.current) {
            setTimeout(() => canvasRef.current?.requestRenderAll(), 50);
          }
        });
      }
    }
  }, [selectedElementId, currentSlideIndex, slideIndex, currentSlide]);

  // Browser Zoom listener removed from here - moved to CanvasEditor

  // ==================== CANVAS INITIALIZATION ====================
  // This effect initializes a new Fabric.js canvas instance
  // REBUILT: Now re-initializes on slideIndex change to prevent "Blank Page on Move" bugs.
  // This ensures the fabric instance is always attached to the current DOM node.
  useEffect(() => {
    if (!containerRef.current || canvasRef.current || !canvasElRef.current) return;

    // Reset sync state on re-init so elements are re-rendered
    lastSyncedElementsRef.current = "";

    // Calculate correct scaled dimensions
    const scaleFactor = (displayDimensions.width / dimensions.width) * (options.zoom / 100);
    const scaledWidth = dimensions.width * scaleFactor;
    const scaledHeight = dimensions.height * scaleFactor;

    // Create new canvas instance with SCALED dimensions
    const canvas = new Canvas(canvasElRef.current, {
      width: scaledWidth,
      height: scaledHeight,
      backgroundColor: currentSlide?.backgroundColor || "#FFFFFF",
      selection: true, // Enable native selection
      preserveObjectStacking: true,
      renderOnAddRemove: false, // Manual render control for better performance
    });

    canvasRef.current = canvas;
    if (options.onMount) options.onMount(canvas);

    // Set zoom level
    canvas.setZoom(scaleFactor);

    // Force immediate offset calculation BEFORE adding elements
    canvas.calcOffset();
    canvas.renderAll();

    // Custom selection style (Canva-like)
    FabricObject.prototype.set({
      transparentCorners: false,
      cornerColor: "#3B82F6",
      cornerStrokeColor: "#ffffff",
      borderColor: "#3B82F6",
      cornerSize: 10,
      padding: 5,
      cornerStyle: "circle",
      borderDashArray: [4, 4],
      borderScaleFactor: 2,
    } as any);

    Textbox.prototype.set({
      transparentCorners: false,
      cornerColor: "#3B82F6",
      cornerStrokeColor: "#ffffff",
      borderColor: "#3B82F6",
      cornerSize: 10,
      cornerStyle: "circle",
    } as any);

    // Initialize Smart Guides
    const disposeGuides = initAligningGuidelines(canvas);

    // ========== SELECTION STATE SYNC ==========
    const handleSelection = (selected: any[]) => {
      if (isInternalSelectionUpdateRef.current || isRenderingRef.current) return;

      // ONLY filter locked objects from MULTI-selection (2+ objects)
      // Single locked objects should still be selectable (so users can unlock them)
      if (selected.length > 1) {
        const unlocked = selected.filter((obj) => !obj.lockMovementX && !obj.lockMovementY);

        // If we filtered out some locked objects
        if (unlocked.length !== selected.length && unlocked.length > 0) {
          isInternalSelectionUpdateRef.current = true;
          canvas.discardActiveObject();

          if (unlocked.length === 1) {
            canvas.setActiveObject(unlocked[0]);
          } else {
            const newSelection = new ActiveSelection(unlocked, {
              canvas: canvas,
              ...CONTROL_DEFAULTS,
            });
            canvas.setActiveObject(newSelection);
          }

          canvas.requestRenderAll();
          isInternalSelectionUpdateRef.current = false;
        }

        const ids = unlocked.map((obj) => obj.customData?.id).filter(Boolean);
        selectElements(ids);
      } else {
        // Single selection - allow locked objects to be selected
        const ids = selected.map((obj) => obj.customData?.id).filter(Boolean);
        selectElements(ids);
      }
    };

    const handleSelectionCleared = () => {
      if (isInternalSelectionUpdateRef.current || isRenderingRef.current) return;
      selectElements([]);
    };

    canvas.on("selection:created", (e) => handleSelection(e.selected || []));
    canvas.on("selection:updated", (e) => handleSelection(e.selected || []));
    canvas.on("selection:cleared", handleSelectionCleared);

    // ========== MOUSE HANDLERS ==========
    canvas.on("mouse:down", (e) => {
      // Set active slide on click
      // FIX: Use Ref and direct store access to avoid stale closures
      const actualIndex = slideIndexRef.current;
      const currentActiveIndex = useEditorStore.getState().currentSlideIndex;

      if (currentActiveIndex !== actualIndex) {
        setCurrentSlide(actualIndex);
      }

      // Direct deselect on empty click
      if (!e.target) {
        selectElement(null);
        return;
      }

      // Shift+Click multi-selection
      handleShiftClickSelection(e, canvas, isRenderingRef, isInternalSelectionUpdateRef, selectElement, selectElements);
    });

    // ========== TEXT EDITING ==========
    canvas.on("text:editing:entered", () => {
      isEditingRef.current = true;
    });

    canvas.on("text:editing:exited", () => {
      isEditingRef.current = false;
    });

    canvas.on("text:changed", (e) => {
      const target = e.target;
      if (!target || isRenderingRef.current) return;

      const obj = target as any;
      if (obj.customData?.id && obj.text !== undefined) {
        updateElement(obj.customData.id, { content: obj.text }, false);
      }
    });

    // ========== DOUBLE CLICK TO EDIT SHAPE TEXT ==========
    canvas.on("mouse:dblclick", setupShapeTextEditing(canvas, isEditingRef, lastSyncedElementsRef, updateElement));

    // ========== MULTI-SELECT TRACKING ==========
    const { onSelectionCreated, onSelectionCleared } = setupMultiSelectTracking(
      canvas,
      selectionCoordsRef,
      isRenderingRef,
      isInternalSelectionUpdateRef,
      pushToHistory,
      updateElements,
      lastSyncedElementsRef,
      selectElement,
    );

    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:cleared", onSelectionCleared);

    // ========== LOCKED ELEMENT CLICK SELECTION ==========
    // Handle clicking on locked elements (which have evented:false)
    // Since locked elements have evented:false for drag selection, we need to manually detect clicks
    let clickStartPoint: { x: number; y: number } | null = null;
    let clickStartTarget: any = null;

    canvas.on("mouse:down", (e) => {
      if (e.pointer) {
        clickStartPoint = { x: e.pointer.x, y: e.pointer.y };
        // Find object at this point (even if evented:false or selectable:false)
        const point = canvas.getPointer(e.e);
        const objects = canvas.getObjects();

        // Find topmost object at click point (reverse order for top-to-bottom)
        // We check ALL objects including those with evented:false
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          // Manual containsPoint check works even for evented:false objects
          if (obj.containsPoint(point)) {
            clickStartTarget = obj;
            break;
          }
        }
      }
    });

    canvas.on("mouse:up", (e) => {
      if (clickStartPoint && clickStartTarget && e.pointer) {
        const dx = e.pointer.x - clickStartPoint.x;
        const dy = e.pointer.y - clickStartPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If movement is less than 5px, consider it a click (not drag)
        if (distance < 5) {
          const target = clickStartTarget;

          // Check if it's a locked element (evented:false due to lock)
          // Locked elements have evented:false to allow drag selection to pass through
          if (!target.evented && target.lockMovementX && target.customData?.id) {
            const isShiftKey = e.e.shiftKey;

            if (isShiftKey) {
              // Shift+Click: toggle selection (not supported well for locked, just select)
              selectElement(target.customData.id);
            } else {
              // Normal click: select only this element
              selectElement(target.customData.id);
            }
          }
        }
      }

      clickStartPoint = null;
      clickStartTarget = null;
    });

    // ========== OBJECT MODIFICATION ==========
    canvas.on("object:modified", setupObjectModification(canvas, pushToHistory, updateElement));

    // ========== ROTATION FEEDBACK (Smart Rules) ==========
    canvas.on("object:rotating", (e: any) => {
      const target = e.target;
      if (!target || !canvas.contextTop) return;

      const angle = target.angle % 360;
      const normalizedAngle = angle < 0 ? angle + 360 : angle;
      const displayAngle = Math.round(normalizedAngle);

      // Draw the label
      const ctx = canvas.contextTop;
      const p = target.getCenterPoint();
      // Adjust position to be above the object
      // We use the object's bounding box to determine a good offset?
      // Or just a fixed offset from center. Fixed is stable.
      // But if object is large, center might be far.
      // Let's use the object's top-center point in scalar coordinates?
      // Actually center is safest.

      const offset = 60 + target.getScaledHeight() / 2;
      // But for rotation, the top changes.
      // Let's stick to simple center offset for now, or use the cursor position if available?
      // target.getCenterPoint() is canvas coordinate.

      ctx.save();
      // Reset transform because contextTop might have transformations active?
      // Usually contextTop is identity transform identity, but Fabric logic can be complex.
      // Safe bet: Identity.
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const text = `${displayAngle}°`;
      const padding = 8;
      const fontSize = 12;
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(text).width;
      const bgWidth = textWidth + padding * 2;
      const bgHeight = fontSize + padding * 2;

      // Position logic: Center of object - Y offset
      // We need to convert canvas coordinates to viewport coordinates for contextTop drawing?
      // No, contextTop matches canvas dimensions usually.
      // Wait, if zoom is active, getCenterPoint returns zoomed coords.
      const vpt = canvas.viewportTransform;
      const px = p.x * vpt[0] + vpt[4];
      const py = p.y * vpt[3] + vpt[5];

      const x = px;
      // Move to BOTTOM to avoid overlapping with Floating Menu (which is on top)
      const visualHalfHeight = (target.getScaledHeight() / 2) * vpt[3];
      const y = py + visualHalfHeight + 50;

      // Draw pill background
      ctx.fillStyle = "#1e1e1e";
      ctx.beginPath();
      ctx.roundRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, 4);
      ctx.fill();

      // Draw text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1); // +1 looks better visually

      ctx.restore();
    });

    // ========== CLEANUP ==========
    return () => {
      if (canvasRef.current) {
        canvasRef.current.off();
        disposeGuides();

        // CRITICAL: Handle async dispose safely
        const canvasToDispose = canvasRef.current;
        canvasRef.current = null;
        void canvasToDispose.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex]); // CRITICAL: Re-init on slideIndex change

  // ==================== ROBUST OFFSET MANAGEMENT ====================
  // Ensure canvas offset is correct after initialization and scroll
  // This helps fix selection issues when the canvas renders in a new position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Master offset update function with safety checks
    // Standard update function
    const updateOffset = () => {
      if (!canvas.upperCanvasEl || !canvas.lowerCanvasEl) return;

      // Basic safety checks
      if (canvas.selection !== true) canvas.selection = true;

      // Recalculate
      canvas.calcOffset();
      canvas.setViewportTransform(canvas.viewportTransform);
      canvas.requestRenderAll(); // Force repaint
    };

    // 1. Standard Window Events
    const handleWindowEvents = () => requestAnimationFrame(updateOffset);
    window.addEventListener("resize", handleWindowEvents);
    window.addEventListener("scroll", handleWindowEvents, { capture: true, passive: true });

    // Initial check (allow layout to settle)
    const initTimer = setTimeout(updateOffset, 200);

    // 2. Just-In-Time Update (Mouse Enter) - Essential for Reload Fix
    const handleMouseEnter = () => requestAnimationFrame(updateOffset);
    if (containerRef.current) {
      containerRef.current.addEventListener("mouseenter", handleMouseEnter);
    }

    return () => {
      window.removeEventListener("resize", handleWindowEvents);
      window.removeEventListener("scroll", handleWindowEvents, { capture: true } as any);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mouseenter", handleMouseEnter);
      }
      clearTimeout(initTimer);
    };
  }, [slideIndex, containerRef]); // Re-run when slide position changes (critical for reorder)

  // Update canvas dimensions and zoom on ratio/zoom change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleFactor = (displayDimensions.width / dimensions.width) * (options.zoom / 100);

    const scaledWidth = dimensions.width * scaleFactor;
    const scaledHeight = dimensions.height * scaleFactor;

    canvas.setDimensions({
      width: scaledWidth,
      height: scaledHeight,
    });

    canvas.setZoom(scaleFactor);

    // Force recalculation after dimension change
    canvas.calcOffset();
    canvas.renderAll();
  }, [options.ratio, options.zoom, dimensions, displayDimensions, slideIndex]);

  // Update background (Color & Image)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSlide) return;

    // 1. Set Background Color
    canvas.backgroundColor = currentSlide.backgroundColor;

    // 2. Set Background Image (if exists)
    if (currentSlide.backgroundImage) {
      FabricImage.fromURL(currentSlide.backgroundImage, { crossOrigin: "anonymous" })
        .then((img: FabricImage) => {
          if (!img || !canvas) return;

          // Scale image to cover the canvas (like CSS object-fit: cover)
          const canvasWidth = dimensions.width; // Use logical dimensions, not scaled
          const canvasHeight = dimensions.height;

          const imgWidth = img.width || 1;
          const imgHeight = img.height || 1;

          const scaleX = canvasWidth / imgWidth;
          const scaleY = canvasHeight / imgHeight;

          // Use max for 'cover', min for 'contain'
          const scale = Math.max(scaleX, scaleY);

          img.set({
            originX: "center",
            originY: "center",
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            scaleX: scale,
            scaleY: scale,
          });

          canvas.backgroundImage = img;
          canvas.requestRenderAll();
        })
        .catch((err: any) => {
          console.error("Failed to load background image", err);
          canvas.backgroundImage = undefined; // Fallback
          canvas.requestRenderAll();
        });
    } else {
      canvas.backgroundImage = undefined;
      canvas.requestRenderAll();
    }

    // 3. Add double-click handler for background image restoration AND IMAGE CROP
    const handleCanvasDblClick = (e: any) => {
      // Check if double-clicked target is an IMAGE
      const target = e.target;
      if (target && target.get("type") === "image" && target.customData?.id && !target.customData?.isBackground) {
        setCroppingElementId(target.customData.id);
        return;
      }

      // Check for background image restore
      if (currentSlide?.backgroundImage && currentSlide?.metadata?.previousBackgroundElement) {
        // Logic for restoring background element...
        // We check if the click target was "null" (empty canvas) or the background object
        const isBackground = !target || target.customData?.isBackground;

        if (isBackground) {
          const prevElement = currentSlide.metadata.previousBackgroundElement;
          const { wasBackground, ...elementData } = prevElement;

          useEditorStore.getState().updateSlide(currentSlideIndex, {
            backgroundImage: undefined,
            metadata: {
              ...currentSlide.metadata,
              previousBackgroundElement: undefined,
            },
          });
          useEditorStore.getState().addElement(elementData);
        }
      }
    };

    canvas.on("mouse:dblclick", handleCanvasDblClick);

    return () => {
      canvas.off("mouse:dblclick", handleCanvasDblClick);
    };
  }, [
    currentSlide?.backgroundColor,
    currentSlide?.backgroundImage,
    currentSlide?.metadata,
    dimensions.width,
    dimensions.height,
    currentSlideIndex,
  ]);

  // EFFECT: Handle Rich Text Formatting Commands

  // ========== REFACTORED: SEPARATE ELEMENT SYNC FROM SELECTION SYNC ==========

  // Refs moved to top of file...

  // Use a Ref to track IDs currently being created (Async Image Loading)
  // This prevents "Duplicate Image" race condition where a 2nd render starts before 1st image loads
  const pendingCreationIdsRef = useRef<Set<string>>(new Set());

  // EFFECT 1: Sync ELEMENTS from store to canvas (SMART SYNC - In-Place Mutation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSlide) return;

    // Skip if editing text (let Fabric handle the UI, we sync later)
    if (isEditingRef.current) return;

    const elementsFingerprint = JSON.stringify({
      slideId: currentSlide.id,
      elements: currentSlide.elements, // simple fingerprint is enough for check
    });

    if (lastSyncedElementsRef.current === elementsFingerprint && prevSlideIndexRef.current === slideIndex) {
      return;
    }

    lastSyncedElementsRef.current = elementsFingerprint;
    prevSlideIndexRef.current = slideIndex;
    isRenderingRef.current = true;

    // Handle Background sync
    if (canvas.backgroundColor !== currentSlide.backgroundColor) {
      canvas.backgroundColor = currentSlide.backgroundColor;
    }

    // 1. Map Existing Canvas Objects
    // Source of Truth: The Canvas itself.
    const currentObjects = canvas.getObjects();
    const canvasMap = new Map<string, FabricObject>();

    currentObjects.forEach((obj) => {
      if (obj.customData?.id) {
        canvasMap.set(obj.customData.id, obj);
      }
    });

    const activeElementIds = new Set<string>();

    // Sort elements by z-index to ensure correct visual stacking
    // Note: In Smart Sync, we might need to use canvas.moveTo() if order changes,
    // but usually simply creating them in order or not reordering is fine for performance.
    // Logic: We first create/update, then we can enforce z-index if really needed.
    const sortedElements = [...currentSlide.elements].sort((a, b) => a.zIndex - b.zIndex);

    // 2. Loop Data Elements: Update or Create
    // 2. Loop Data Elements: Update or Create
    const processElements = async () => {
      // TRACKING VARS
      let processedCount = 0;

      for (const [index, element] of sortedElements.entries()) {
        try {
          activeElementIds.add(element.id);

          const existingObj = canvasMap.get(element.id);

          // NAN SAFETY HELPERS
          const safeNum = (val: any, def: number = 0) => (isNaN(Number(val)) ? def : Number(val));

          if (existingObj) {
            // --- A. UPDATE EXISTING (Zero Lag) ---

            // If ID exists, just update its properties!
            // This skips expensive texture loading / object creation.

            let needsRecreation = false;

            // Special check for Image URL change
            if (element.type === "image" && existingObj instanceof FabricImage) {
              if ((element as ImageElement).src !== existingObj.getSrc()) {
                needsRecreation = true;
              }
            }

            if (needsRecreation) {
              canvas.remove(existingObj);
              canvasMap.delete(element.id);
              // Fall through to Creation logic below...
            } else {
              // Update standard properties
              const isLocked = element.locked;

              // CRITICAL: Prevent NaN poisoning
              const updates: any = {
                opacity: safeNum(element.opacity, 1),
                lockMovementX: isLocked,
                lockMovementY: isLocked,
                lockScalingX: isLocked,
                lockScalingY: isLocked,
                lockRotation: isLocked,
                selectable: true,
                evented: !isLocked,
                hasControls: !isLocked,
              };

              // FREEZE GROUP POSITIONS STRATEGY:
              // Don't update position/rotation for objects in a group (multi-selected)
              // This prevents the "snap-back" bug when changing properties while grouped
              // Positions will be correctly saved when the group is deselected via onSelectionCleared
              if (!existingObj.group) {
                updates.left = safeNum(element.position.x);
                updates.top = safeNum(element.position.y);
                updates.angle = safeNum(element.rotation);
              }

              existingObj.set(updates);

              // Update Type-Specific Properties
              if (element.type === "text" && existingObj instanceof Textbox) {
                const t = element as TextElement;

                // Pre-load font if it changed to prevent FOUT (Flash of Unstyled Text)
                if (t.fontFamily && t.fontFamily !== existingObj.fontFamily) {
                  await loadFont(t.fontFamily, t.fontWeight || 400);
                }

                // Only set text if changed (avoids cursor jumps if we were editing)
                if (existingObj.text !== t.content) existingObj.set("text", t.content);

                existingObj.set({
                  fontSize: safeNum(t.fontSize, 16),
                  fontFamily: t.fontFamily || "Inter",
                  fontWeight: t.fontWeight || 400,
                  fill: t.fill,
                  textAlign: t.textAlign || "left",
                  width: safeNum(t.size.width),
                  scaleX: safeNum(t.scaleX, 1),
                  scaleY: safeNum(t.scaleY, 1),
                  underline: t.textDecoration === "underline",
                  linethrough: t.textDecoration === "line-through",
                  lineHeight: safeNum(t.lineHeight, 1.2),
                  charSpacing: safeNum(t.letterSpacing, 0) * 10,
                  shadow: t.shadow,
                });
                existingObj.setCoords();
                processedCount++;
                continue; // Done with text
              } else if (element.type === "shape") {
                const s = element as ShapeElement;
                existingObj.set({
                  width: safeNum(s.size.width),
                  height: safeNum(s.size.height),
                  fill: createGradient(s.fill),
                  stroke: s.stroke,
                  strokeWidth: safeNum(s.strokeWidth),
                  strokeDashArray: s.strokeDashArray || undefined,
                  scaleX: safeNum(s.scaleX, 1),
                  scaleY: safeNum(s.scaleY, 1),
                });

                if (s.shapeType === "rect") {
                  // Ensure rx/ry are set for uniform fallbacks/compatibility
                  existingObj.set({
                    rx: s.cornerRadius || 0,
                    ry: s.cornerRadius || 0,
                  });

                  if (s.cornerRadii && s.cornerRadii.length === 4) {
                    (existingObj as any).cornerRadii = s.cornerRadii;
                  } else {
                    // If invalid or switching to uniform, remove the property
                    delete (existingObj as any).cornerRadii;
                  }

                  // ALWAYS use our robust custom render for rects that might have corners
                  // This function handles BOTH uniform (via rx fallback) and partial radii
                  existingObj._render = function (ctx: CanvasRenderingContext2D) {
                    const w = this.width || 0;
                    const h = this.height || 0;

                    // Fallback to uniform rx if cornerRadii is missing
                    // Fabric stores rx in this.rx.
                    const rx = (this as any).rx || 0;
                    const radii = (this as any).cornerRadii || [rx, rx, rx, rx];

                    // Calculate rounded path
                    const x = -w / 2;
                    const y = -h / 2;
                    // Clamp radii to half width/height to prevent visual glitches
                    const [tl, tr, bl, br] = radii.map((r: number) => Math.min(r, w / 2, h / 2));

                    ctx.beginPath();
                    ctx.moveTo(x + tl, y);
                    ctx.lineTo(x + w - tr, y);
                    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
                    ctx.lineTo(x + w, y + h - br);
                    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
                    ctx.lineTo(x + bl, y + h);
                    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
                    ctx.lineTo(x, y + tl);
                    ctx.quadraticCurveTo(x, y, x + tl, y);
                    ctx.closePath();

                    this._renderFill(ctx);
                    this._renderStroke(ctx);
                  };

                  // CRITICAL: Force cache invalidation since we modified the render function and custom props
                  existingObj.set("dirty", true);
                } else if (s.shapeType === "triangle") {
                  // Handle Triangle Corners
                  if (s.cornerRadii && s.cornerRadii.length === 3) {
                    (existingObj as any).cornerRadii = s.cornerRadii;
                  } else if (s.cornerRadius) {
                    // Uniform fallback
                    (existingObj as any).cornerRadii = [s.cornerRadius, s.cornerRadius, s.cornerRadius];
                  } else {
                    delete (existingObj as any).cornerRadii;
                  }

                  // If we have custom radii (or uniform simulated via list), we need custom render
                  // Fabric Triangle doesn't support rx/ry natively like Rect does.
                  if ((existingObj as any).cornerRadii) {
                    existingObj._render = function (ctx: CanvasRenderingContext2D) {
                      const w = this.width || 0;
                      const h = this.height || 0;
                      const radii = (this as any).cornerRadii || [0, 0, 0];
                      // [Top, BottomLeft, BottomRight]

                      const [r0, r1, r2] = radii;

                      // Points for standard Fabric Triangle: (0, -h/2), (-w/2, h/2), (w/2, h/2)
                      // Relative to center
                      const p0 = { x: 0, y: -h / 2 };
                      const p1 = { x: -w / 2, y: h / 2 };
                      const p2 = { x: w / 2, y: h / 2 };

                      const getPointAtDist = (from: any, to: any, d: number) => {
                        const len = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
                        const t = Math.min(d / len, 0.5);
                        return {
                          x: from.x + (to.x - from.x) * t,
                          y: from.y + (to.y - from.y) * t,
                        };
                      };

                      const p0_1 = getPointAtDist(p0, p1, r0);
                      const p0_2 = getPointAtDist(p0, p2, r0);
                      const p1_0 = getPointAtDist(p1, p0, r1);
                      const p1_2 = getPointAtDist(p1, p2, r1);
                      const p2_0 = getPointAtDist(p2, p0, r2);
                      const p2_1 = getPointAtDist(p2, p1, r2);

                      ctx.beginPath();
                      ctx.moveTo(p0_1.x, p0_1.y);
                      ctx.quadraticCurveTo(p0.x, p0.y, p0_2.x, p0_2.y);
                      ctx.lineTo(p2_0.x, p2_0.y);
                      ctx.quadraticCurveTo(p2.x, p2.y, p2_1.x, p2_1.y);
                      ctx.lineTo(p1_2.x, p1_2.y);
                      ctx.quadraticCurveTo(p1.x, p1.y, p1_0.x, p1_0.y);
                      ctx.closePath();

                      this._renderFill(ctx);
                      this._renderStroke(ctx);
                    };
                  } else {
                    // Revert to original?
                    // For triangle, deleting _render might be enough if we didn't overwrite it permanently on prototype usually.
                    // But if we defined it on the instance, we can just delete it to fallback to prototype?
                    delete (existingObj as any)._render;
                  }
                  existingObj.set("dirty", true);
                }
                existingObj.setCoords();
                processedCount++;
                continue; // Done with shape
              } else if (element.type === "image") {
                const i = element as ImageElement;

                // Check if crop dimensions changed - if so, we need to RECREATE
                // Fabric.js doesn't handle width/height updates on cropped images well
                const cropChanged =
                  (existingObj as any).cropX !== (i.cropX || 0) ||
                  (existingObj as any).cropY !== (i.cropY || 0) ||
                  existingObj.width !== i.size.width ||
                  existingObj.height !== i.size.height;

                if (cropChanged) {
                  // Mark for recreation by removing and falling through to CREATE
                  canvas.remove(existingObj);
                  canvasMap.delete(element.id);
                  // DO NOT continue - let it fall through to CREATE block
                } else {
                  // Only safe updates (scale, position, opacity)
                  existingObj.set({
                    scaleX: safeNum(i.scaleX, 1),
                    scaleY: safeNum(i.scaleY, 1),
                  });
                  existingObj.setCoords();
                  processedCount++;
                  continue; // Done with image
                }
              }
            }
          }

          // --- B. CREATE NEW (Only if missing) ---

          try {
            // Determine if we need to load font first
            if (element.type === "text" || (element.type === "shape" && (element as any).textContent)) {
              const family = (element as any).fontFamily || (element as any).textFontFamily;
              if (family) await loadFont(family, (element as any).fontWeight || 400);
            }

            const newObj = await createFabricObject(element);

            // Check if race condition occurred (slide changed while loading)
            if (newObj) {
              // CRITICAL: LAST MILE CHECK
              if (canvasRef.current) {
                const existing = canvasRef.current.getObjects().find((o: any) => o.customData?.id === element.id);
                if (existing) {
                  return;
                }
              }

              (newObj as any).customData = { id: element.id };
              const isLocked = element.locked;
              newObj.set({
                lockMovementX: isLocked,
                lockMovementY: isLocked,
                lockScalingX: isLocked,
                lockScalingY: isLocked,
                lockRotation: isLocked,
                selectable: true,
                evented: !isLocked,
                hasControls: !isLocked,
              });

              canvas.add(newObj);

              processedCount++;
            }
          } catch (error) {
            console.error("Failed to create object", element.id, error);
          }
        } catch (elemErr) {
          console.error("Error processing element", element.id, elemErr);
        }
      }

      // 3. DELETE REMOVED ELEMENTS

      // CRITICAL SAFETY CHECK:
      // If we had input elements, but activeElementIds is empty, it means the loop CRASHED efficiently enough
      // to skip everything, or inputs were malformed.
      // WE MUST NOT WIPE THE CANVAS IN THIS CASE.
      if (sortedElements.length > 0 && activeElementIds.size === 0) {
        console.warn("Canvas Sync Safety Triggered: Aborting cleanup content because no elements were processed.");
        isRenderingRef.current = false;
        return;
      }

      // Any object in canvas that is NOT in the current data -> Remove it
      // Any object in canvas that is NOT in the current data -> Remove it
      currentObjects.forEach((obj) => {
        const id = obj.customData?.id;
        if (id && !activeElementIds.has(id)) {
          canvas.remove(obj);
        }
      });

      // 4. REORDER (Visual Stacking)
      // Ensure visual order matches data order
      sortedElements.forEach((el, idx) => {
        const obj = canvas.getObjects().find((o) => o.customData?.id === el.id);
        if (obj) {
          const currentObjects = canvas.getObjects();
          const currentIdx = currentObjects.indexOf(obj);

          if (currentIdx !== idx) {
            if (typeof (canvas as any).moveObjectTo === "function") {
              (canvas as any).moveObjectTo(obj, idx);
            } else if (typeof (canvas as any).moveTo === "function") {
              (canvas as any).moveTo(obj, idx);
            }
          }
        }
      });

      canvas.requestRenderAll();
      isRenderingRef.current = false;

      // Lazy layout fix
      setTimeout(() => {
        if (canvasRef.current) canvasRef.current.calcOffset();
      }, 100);
    };

    processElements();
  }, [currentSlide?.id, currentSlide?.elements, currentSlideIndex, slideIndex, loadFont]);

  // Helper to extract slideId from fingerprint to detect navigation races
  const elementFingerprintSlideId = (fp: string) => {
    try {
      return JSON.parse(fp).slideId;
    } catch {
      return "";
    }
  };

  // EFFECT 2: Sync SELECTION only (NO canvas.clear!)
  // This runs when selection changes but doesn't rebuild the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSlide) return;

    // Skip during rendering to avoid conflicts
    if (isRenderingRef.current) return;

    // Skip during editing
    if (isEditingRef.current) return;

    // Skip during multi-select modification
    if (isMultiSelectModifyingRef.current) return;

    // Build map fresh from canvas (Fixes broken ref issue)
    const currentObjects = canvas.getObjects();
    const fabricObjectsMap = new Map<string, FabricObject>(); // Reusing name to keep downstream logic valid

    currentObjects.forEach((obj) => {
      if (obj.customData?.id) {
        fabricObjectsMap.set(obj.customData.id, obj);
      }
    });

    // DYNAMIC EVENTED STATE REMOVED:
    // We keep locked objects ALWAYS evented: false to allow drag selection to pass through.
    // Interaction is handled by manual click detection.

    // If no objects in map, skip
    if (fabricObjectsMap.size === 0) return;

    // Get current canvas selection
    const currentActive = canvas.getActiveObject();
    const currentActiveIds =
      currentActive?.type === "activeSelection"
        ? (currentActive as ActiveSelection)
            .getObjects()
            .map((o: any) => o.customData?.id)
            .filter(Boolean)
        : currentActive?.customData?.id
          ? [currentActive.customData.id]
          : [];

    // Check if selection actually needs to change
    const selectionMatches =
      selectedElementIds.length === currentActiveIds.length &&
      selectedElementIds.every((id) => currentActiveIds.includes(id));

    if (selectionMatches) return;

    // SET FLAG to prevent selection events from looping back
    isInternalSelectionUpdateRef.current = true;

    // Update selection WITHOUT clearing canvas
    if (selectedElementIds.length === 0) {
      canvas.discardActiveObject();
    } else if (selectedElementIds.length === 1) {
      const obj = fabricObjectsMap.get(selectedElementIds[0]);
      if (obj) {
        canvas.setActiveObject(obj);
      }
    } else {
      // Filter out locked objects from multi-selection
      const objects = selectedElementIds
        .map((id) => fabricObjectsMap.get(id))
        .filter((obj) => !!obj && !obj.lockMovementX && !obj.lockMovementY) as FabricObject[];

      if (objects.length > 0) {
        canvas.discardActiveObject();

        if (objects.length === 1) {
          // If only one unlocked object remains, select it individually
          canvas.setActiveObject(objects[0]);
        } else {
          // Multiple unlocked objects - create ActiveSelection
          const selection = new ActiveSelection(objects, {
            canvas: canvas,
            ...CONTROL_DEFAULTS,
          });
          canvas.setActiveObject(selection);
        }
      }
    }

    canvas.requestRenderAll();

    // CLEAR FLAG after render
    requestAnimationFrame(() => {
      isInternalSelectionUpdateRef.current = false;
    });
  }, [selectedElementIds, currentSlide]);

  // EFFECT: Handle Export Request via Event (Robust method to access Fabric instance)
  useEffect(() => {
    const handleExport = (e: CustomEvent) => {
      const { slideId, scale } = e.detail;
      // Only process if this hook instance manages the requested slide
      if (!currentSlide || slideId !== currentSlide.id) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Unselect everything first to avoid selection handles in export
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      try {
        const dataURL = canvas.toDataURL({
          format: "png",
          multiplier: scale || 3, // Default 3x (Best Practice)
          quality: 1,
        });

        // Trigger download
        const link = document.createElement("a");
        link.download = `slide-${slideId.substring(0, 8)}-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Notify success
        window.dispatchEvent(new CustomEvent("export-completed", { detail: { success: true, slideId } }));
      } catch (err) {
        console.error("Export error", err);
        window.dispatchEvent(new CustomEvent("export-completed", { detail: { success: false, error: err, slideId } }));
      }
    };

    window.addEventListener("CONTENT_STUDIO_EXPORT_SLIDE", handleExport as EventListener);
    return () => window.removeEventListener("CONTENT_STUDIO_EXPORT_SLIDE", handleExport as EventListener);
  }, [currentSlide?.id]);

  // No return value needed - all logic is handled via effects and store listeners
}
