// Custom hook for Fabric.js canvas management with SCROLL system
// REBUILT: Fixes text editing re-renders and multi-selection movement

import { useEffect, useRef, useCallback } from "react";
import { Canvas, Textbox, Rect, Circle, FabricImage, FabricObject, ActiveSelection, util } from "fabric";
import { useEditorStore } from "@/store/contentStudioStore";
import type { CanvasElement, TextElement, ShapeElement, Ratio } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS, DISPLAY_DIMENSIONS } from "@/types/contentStudio.types";

declare module "fabric" {
  interface FabricObject {
    customData?: { id: string };
  }
}

import { createFabricObject, CONTROL_DEFAULTS, loadFont } from "@/utils/contentStudio/fabricUtils";
import { initAligningGuidelines } from "@/utils/contentStudio/smartGuides";
import type { Slide } from "@/types/contentStudio.types";

interface UseCanvasOptions {
  ratio: Ratio;
  zoom: number;
}

export function useCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseCanvasOptions,
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  slide: Slide, // CRITICAL FIX: Accept slide directly as prop
  slideIndex: number // Keep slideIndex for active slide detection
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

  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    updateElement,
    updateElements,
    removeElements,
    selectElement,
    selectElements,
    pushToHistory,
    setZoom,
    setCurrentSlide, // Added
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
  // With STABLE keys (key={slide.id}), this runs ONLY ONCE when slide is first created
  useEffect(() => {
    if (!containerRef.current || canvasRef.current || !canvasElRef.current) return;

    // Create new canvas instance
    const canvas = new Canvas(canvasElRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: currentSlide?.backgroundColor || "#FFFFFF",
      selection: true, // CRITICAL: Enable selection
      preserveObjectStacking: true,
      renderOnAddRemove: false, // Manual render control for better performance
    });

    canvasRef.current = canvas;

    // CRITICAL: Force immediate offset calculation
    // This must happen BEFORE any elements are added
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
      const ids = selected.map((obj) => obj.customData?.id).filter(Boolean);
      selectElements(ids);
    };

    const handleSelectionCleared = () => {
      if (isInternalSelectionUpdateRef.current) return;
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

      if (!e.e || isRenderingRef.current) return;

      // Shift+Click multi-selection
      const isShiftKey = e.e.shiftKey;
      const target = e.target;

      if (isShiftKey && target && target.customData?.id) {
        e.e.preventDefault();
        const clickedId = target.customData.id;
        const currentActive = canvas.getActiveObject();

        if (!currentActive) {
          canvas.setActiveObject(target);
          selectElement(clickedId);
        } else if (currentActive === target) {
          return;
        } else if (currentActive.type === "activeSelection") {
          const activeSelection = currentActive as ActiveSelection;
          const currentObjects = activeSelection.getObjects();
          const isInSelection = currentObjects.some((obj: any) => obj === target);
          let newObjects: FabricObject[];

          if (isInSelection) {
            newObjects = currentObjects.filter((obj: any) => obj !== target);
          } else {
            newObjects = [...currentObjects, target as FabricObject];
          }

          isInternalSelectionUpdateRef.current = true;
          canvas.discardActiveObject();

          if (newObjects.length === 0) {
            selectElement(null);
          } else if (newObjects.length === 1) {
            canvas.setActiveObject(newObjects[0]);
            selectElement((newObjects[0] as any).customData?.id || null);
          } else {
            const newSelection = new ActiveSelection(newObjects, {
              canvas: canvas,
              ...CONTROL_DEFAULTS,
            });
            canvas.setActiveObject(newSelection);

            const ids = newObjects.map((obj: any) => obj.customData?.id).filter(Boolean);
            selectElements(ids);
          }
          isInternalSelectionUpdateRef.current = false;
          canvas.requestRenderAll();
        } else {
          isInternalSelectionUpdateRef.current = true;
          const newSelection = new ActiveSelection([currentActive, target], {
            canvas: canvas,
            ...CONTROL_DEFAULTS,
          });
          canvas.setActiveObject(newSelection);
          isInternalSelectionUpdateRef.current = false;

          const ids = [(currentActive as any).customData?.id, clickedId].filter(Boolean);
          selectElements(ids);
          canvas.requestRenderAll();
        }
      }
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
    canvas.on("mouse:dblclick", (e) => {
      const target = e.target;
      if (!target || target.type === "activeSelection" || !target.customData?.id) return;

      const id = target.customData.id;
      const { slides, currentSlideIndex } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];
      const element = currentSlide?.elements.find((el) => el.id === id);

      if (element && element.type === "shape") {
        const shapeEl = element as ShapeElement;
        if (isEditingRef.current) return;

        isEditingRef.current = true;
        const center = target.getCenterPoint();
        const scaledWidth = target.getScaledWidth();
        const angle = target.angle;

        if (target.type === "group" && (target as any).getObjects) {
          const objects = (target as any).getObjects();
          if (objects.length > 1) {
            objects[1].set("visible", false);
            target.set("dirty", true);
          }
        }

        const tempTextbox = new Textbox(shapeEl.textContent || "", {
          left: center.x,
          top: center.y,
          originX: "center",
          originY: "center",
          angle: angle,
          width: scaledWidth - 6,
          backgroundColor: "transparent",
          fill: shapeEl.textFill || "#ffffff",
          fontSize: shapeEl.textFontSize || 16,
          fontFamily: shapeEl.textFontFamily || "Inter",
          fontWeight: shapeEl.textFontWeight || 400,
          textAlign: shapeEl.textAlign || "center",
          selectable: true,
          hasControls: true,
          lockScalingFlip: true,
          customData: { id: id },
          padding: 0,
          splitByGrapheme: true,
          breakWords: true,
        });

        canvas.add(tempTextbox);
        canvas.setActiveObject(tempTextbox);
        tempTextbox.enterEditing();
        tempTextbox.selectAll();

        tempTextbox.on("input" as any, () => {
          const textHeight = tempTextbox.calcTextHeight();
          const currentHeight = target.getScaledHeight();
          const minHeight = shapeEl.size.height;
          const padding = 20;
          const newHeight = Math.max(minHeight, textHeight + padding);

          if (Math.abs(newHeight - currentHeight) > 1) {
            if (target.type === "group" && (target as any).getObjects) {
              const objects = (target as any).getObjects();
              const shapeObj = objects[0];
              if (shapeObj) {
                try {
                  const groupScaleY = target.scaleY || 1;
                  const shapeScaleY = shapeObj.scaleY || 1;
                  const requiredHeight = newHeight / (groupScaleY * shapeScaleY);

                  shapeObj.set({ height: requiredHeight });
                  shapeObj.set("dirty", true);
                  (target as any).addWithUpdate();
                  target.set("dirty", true);

                  tempTextbox.set({ top: target.top, left: target.left });
                  tempTextbox.setCoords();
                  canvas.requestRenderAll();
                } catch (err) {}
              }
            }
          }
        });

        const handleExit = () => {
          const newText = tempTextbox.text;
          const finalHeight = target.getScaledHeight();
          isEditingRef.current = false;

          useEditorStore.getState().updateElement(id, {
            textContent: newText,
            size: {
              width: shapeEl.size.width,
              height: finalHeight,
            },
          });

          if (target.type === "group" && (target as any).getObjects) {
            (target as any).getObjects()[1].set("visible", true);
          }
          canvas.remove(tempTextbox);
          lastSyncedElementsRef.current = "";
        };

        tempTextbox.on("editing:exited", handleExit);
        tempTextbox.on("deselected", handleExit);

        canvas.requestRenderAll();
      }
    });

    // ========== MULTI-SELECT TRACKING ==========
    canvas.on("selection:created", (e: any) => {
      if (e.selected && e.selected.length > 1) {
        selectionCoordsRef.current.clear();
        e.selected.forEach((obj: any) => {
          if (obj.customData?.id) {
            selectionCoordsRef.current.set(obj.customData.id, {
              x: obj.left || 0,
              y: obj.top || 0,
            });
          }
        });
      }
    });

    canvas.on("selection:cleared", () => {
      if (isRenderingRef.current || isInternalSelectionUpdateRef.current) return;
      if (selectionCoordsRef.current.size > 1) {
        const updatesList: { id: string; changes: Partial<CanvasElement> }[] = [];
        let hasMoved = false;
        const canvasObjects = canvas.getObjects();

        selectionCoordsRef.current.forEach((initialCoords, id) => {
          const obj = canvasObjects.find((o: any) => o.customData?.id === id);
          if (obj) {
            const currentLeft = obj.left || 0;
            const currentTop = obj.top || 0;
            if (Math.abs(currentLeft - initialCoords.x) > 0.5 || Math.abs(currentTop - initialCoords.y) > 0.5) {
              hasMoved = true;
              const changes: Partial<CanvasElement> = {
                position: { x: currentLeft, y: currentTop },
                rotation: obj.angle || 0,
              };

              const objScaleX = obj.scaleX || 1;
              const objScaleY = obj.scaleY || 1;

              if (["textbox", "text", "i-text"].includes(obj.type)) {
                (changes as any).fontSize = Math.round(((obj as any).fontSize || 24) * Math.max(objScaleX, objScaleY));
                (changes as any).size = {
                  width: (obj.width || 0) * objScaleX,
                  height: (obj.height || 0) * objScaleY,
                };
              } else if (obj.type === "image") {
                (changes as any).scaleX = objScaleX;
                (changes as any).scaleY = objScaleY;
              } else {
                (changes as any).size = {
                  width: (obj.width || 0) * objScaleX,
                  height: (obj.height || 0) * objScaleY,
                };
              }
              updatesList.push({ id, changes });
            }
          }
        });

        if (hasMoved && updatesList.length > 0) {
          pushToHistory();
          updateElements(updatesList);
          lastSyncedElementsRef.current = "";
        }
        selectionCoordsRef.current.clear();
      }
      selectElement(null);
    });

    // ========== OBJECT MODIFICATION ==========
    canvas.on("object:modified", (e) => {
      const target = e.target;
      if (!target || target.type === "activeSelection") return; // Handled by selection:cleared

      pushToHistory();
      const obj = target as FabricObject & { customData?: { id: string } };
      if (!obj?.customData?.id) return;

      const updates: Partial<CanvasElement> = {
        position: { x: obj.left || 0, y: obj.top || 0 },
        rotation: obj.angle || 0,
      };

      if (["textbox", "text", "i-text"].includes(obj.type)) {
        const scalingX = obj.scaleX || 1;
        const scalingY = obj.scaleY || 1;
        const scaling = Math.max(scalingX, scalingY);
        const newFontSize = Math.round(((obj as any).fontSize || 24) * scaling);
        const newWidth = (obj.width || 0) * scalingX;

        (updates as any).fontSize = newFontSize;
        (updates as any).size = { width: newWidth, height: (obj.height || 0) * scalingY };

        obj.set({
          fontSize: newFontSize,
          width: newWidth,
          scaleX: 1,
          scaleY: 1,
          dirty: true,
        });
      } else if (obj.type === "image") {
        (updates as any).scaleX = obj.scaleX || 1;
        (updates as any).scaleY = obj.scaleY || 1;
      } else if (["rect", "circle", "triangle", "polygon"].includes(obj.type || "")) {
        (updates as any).size = {
          width: (obj.width || 0) * (obj.scaleX || 1),
          height: (obj.height || 0) * (obj.scaleY || 1),
        };
        obj.set({
          width: (obj.width || 0) * (obj.scaleX || 1),
          height: (obj.height || 0) * (obj.scaleY || 1),
          scaleX: 1,
          scaleY: 1,
          dirty: true,
        });
      }

      updateElement(obj.customData.id, updates, false);
      canvas.requestRenderAll();
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
  }, []);

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

    canvas.renderAll();
  }, [options.ratio, options.zoom, dimensions, displayDimensions]);

  // Update background color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSlide) return;

    canvas.backgroundColor = currentSlide.backgroundColor;
    canvas.renderAll();
  }, [currentSlide?.backgroundColor]);

  // ========== REFACTORED: SEPARATE ELEMENT SYNC FROM SELECTION SYNC ==========

  // Track last synced elements to detect actual changes
  const lastSyncedElementsRef = useRef<string>("");
  // Store fabric objects map for selection sync
  const fabricObjectsMapRef = useRef<Map<string, FabricObject>>(new Map());

  // EFFECT 1: Sync ELEMENTS from store to canvas (NO selection dependency!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSlide) return;

    // Skip if editing text
    // Skip if editing text
    if (isEditingRef.current) return;

    // Create a fingerprint of current elements for future optimization
    const elementsFingerprint = JSON.stringify({
      slideId: currentSlide.id,
      // slideIndex removed - with stable keys, position change doesn't require canvas rebuild
      elements: currentSlide.elements.map((el) => ({
        id: el.id,
        position: el.position,
        rotation: el.rotation,
        size: (el as any).size,
        opacity: el.opacity,
        locked: el.locked,
        // Add other mutable properties
        ...(el.type === "text"
          ? {
              content: (el as any).content,
              fontSize: (el as any).fontSize,
              fontFamily: (el as any).fontFamily,
              fontWeight: (el as any).fontWeight,
              fontStyle: (el as any).fontStyle,
              textDecoration: (el as any).textDecoration,
              textAlign: (el as any).textAlign,
              fill: (el as any).fill,
              lineHeight: (el as any).lineHeight,
              letterSpacing: (el as any).letterSpacing,
              textTransform: (el as any).textTransform,
            }
          : {}),
        ...(el.type === "image"
          ? {
              src: (el as any).src,
              scaleX: (el as any).scaleX,
              scaleY: (el as any).scaleY,
              cornerRadius: (el as any).cornerRadius,
            }
          : {}),
        ...(el.type === "shape"
          ? {
              fill: (el as any).fill,
              stroke: (el as any).stroke,
              strokeWidth: (el as any).strokeWidth,
              strokeDashArray: (el as any).strokeDashArray,
              cornerRadius: (el as any).cornerRadius,
              // Text properties for shape
              textContent: (el as any).textContent,
              textFontFamily: (el as any).textFontFamily,
              textFontSize: (el as any).textFontSize,
              textFontWeight: (el as any).textFontWeight,
              textFill: (el as any).textFill,
              textAlign: (el as any).textAlign,
            }
          : {}),
      })),
    });

    // Only skip if fingerprint matches AND objects map is populated AND slide index is same
    // This ensures reorder triggers rebuild to prevent blank page
    if (
      lastSyncedElementsRef.current === elementsFingerprint &&
      fabricObjectsMapRef.current.size > 0 &&
      prevSlideIndexRef.current === slideIndex
    ) {
      return;
    }

    lastSyncedElementsRef.current = elementsFingerprint;
    prevSlideIndexRef.current = slideIndex;
    isRenderingRef.current = true;

    canvas.clear();
    canvas.backgroundColor = currentSlide.backgroundColor;

    const textElements = currentSlide.elements.filter((el) => el.type === "text") as TextElement[];
    const shapeElements = currentSlide.elements.filter((el) => el.type === "shape") as ShapeElement[];

    const fontPromises = [
      ...textElements.map((el) => loadFont(el.fontFamily, el.fontWeight)),
      // Load fonts for shapes with text
      ...shapeElements
        .filter((el) => el.textContent && el.textFontFamily)
        .map((el) => loadFont(el.textFontFamily!, el.textFontWeight || 400)),
    ];

    Promise.all(fontPromises).then(async () => {
      const sortedElements = [...currentSlide.elements].sort((a, b) => a.zIndex - b.zIndex);

      const newFabricObjectsMap = new Map<string, FabricObject>();

      for (const element of sortedElements) {
        try {
          const fabricObj = await createFabricObject(element);
          if (fabricObj) {
            (fabricObj as FabricObject & { customData?: { id: string } }).customData = { id: element.id };

            // Lock movement/scaling if locked
            fabricObj.lockMovementX = element.locked;
            fabricObj.lockMovementY = element.locked;
            fabricObj.lockScalingX = element.locked;
            fabricObj.lockScalingY = element.locked;
            fabricObj.lockRotation = element.locked;

            canvas.add(fabricObj);
            newFabricObjectsMap.set(element.id, fabricObj);
          }
        } catch (err) {
          console.error("Error creating fabric object for element:", element.id, err);
          // Continue rendering other elements
        }
      }

      // Store map for selection sync
      fabricObjectsMapRef.current = newFabricObjectsMap;

      // Restore selection if any (but only within this sync, not as a separate trigger)
      if (selectedElementIds && selectedElementIds.length > 0) {
        if (selectedElementIds.length === 1) {
          const obj = newFabricObjectsMap.get(selectedElementIds[0]);
          if (obj) {
            canvas.setActiveObject(obj);
          }
        } else {
          const objects = selectedElementIds
            .map((id) => newFabricObjectsMap.get(id))
            .filter((obj) => !!obj) as FabricObject[];

          if (objects.length > 0) {
            const selection = new ActiveSelection(objects, {
              canvas: canvas,
              ...CONTROL_DEFAULTS,
            });
            canvas.setActiveObject(selection);
          }
        }
      }

      canvas.requestRenderAll();
      // Double render and Recalc to catch lazy loaded fonts
      setTimeout(() => {
        const c = canvasRef.current;
        if (c) {
          // Force layout recalculation:
          // Setup might have run with fallback font metrics (1 line), but new font needs 2 lines.
          // We trigger a re-set of fontFamily to force Fabric to re-measure boundaries.
          c.getObjects().forEach((obj) => {
            if (obj.type === "textbox") {
              // 1. Toggle Font to clear metric cache
              const originalFont = (obj as any).fontFamily;
              obj.set("fontFamily", "sans-serif");
              obj.set("fontFamily", originalFont);

              // 2. Dirty Hack: Modify text to force line-wrapping engine to run again
              // This fixes cases where width is correct but wrapping didn't trigger
              const t = (obj as any).text;
              (obj as any).set("text", t + " ");
              (obj as any).set("text", t);
            }
          });
          c.requestRenderAll();
        }
        // Mark rendering complete
        isRenderingRef.current = false;

        // CRITICAL FIX: Force render and offset update after element sync
        // This ensures objects appear correctly after reorder when slideIndex fingerprint triggers rebuild
        try {
          canvas.calcOffset();
          canvas.renderAll();
        } catch (e) {
          // Safe to ignore
        }

        // Additional delayed offset recalc for layout settling
        setTimeout(() => {
          if (canvas) {
            try {
              canvas.calcOffset();
              canvas.renderAll();
            } catch (e) {
              // Safe to ignore - canvas will recalc on next interaction
            }
          }
        }, 100);
      }, 300);
    });

    // CRITICAL: With stable keys, same component can receive different slides!
    // We must trigger re-render when currentSlide.id changes (different slide assigned to this component)
    // Also include currentSlide?.elements to catch element updates within the same slide
  }, [currentSlide?.id, currentSlide?.elements, currentSlideIndex, slideIndex, loadFont]);

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

    const fabricObjectsMap = fabricObjectsMapRef.current;

    // If no objects in map, skip (will be handled by element sync)
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
      const objects = selectedElementIds.map((id) => fabricObjectsMap.get(id)).filter((obj) => !!obj) as FabricObject[];

      if (objects.length > 0) {
        canvas.discardActiveObject();
        const selection = new ActiveSelection(objects, {
          canvas: canvas,
          ...CONTROL_DEFAULTS,
        });
        canvas.setActiveObject(selection);
      }
    }

    canvas.requestRenderAll();

    // CLEAR FLAG after render
    requestAnimationFrame(() => {
      isInternalSelectionUpdateRef.current = false;
    });
  }, [selectedElementIds, currentSlide]);

  // Create text element
  const addText = useCallback(
    (text: string = "Double click to edit") => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const textObj = new Textbox(text, {
        left: dimensions.width / 2 - 100,
        top: dimensions.height / 2 - 20,
        width: 200,
        fontFamily: "Inter",
        fontSize: 24,
        fill: "#1a1a1a",
        textAlign: "center",
        editable: true,
        splitByGrapheme: false,
        lockScalingFlip: true,
        noScaleCache: false,
        objectCaching: true,
        ...CONTROL_DEFAULTS,
      });

      return textObj;
    },
    [dimensions]
  );

  const addImage = useCallback(
    async (src: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      try {
        const img = await FabricImage.fromURL(src);

        const maxWidth = dimensions.width * 0.8;
        const maxHeight = dimensions.height * 0.8;
        const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);

        img.scale(scale);
        img.set({
          left: (dimensions.width - img.width! * scale) / 2,
          top: (dimensions.height - img.height! * scale) / 2,
        });

        return img;
      } catch (error) {
        console.error("Failed to load image:", error);
        return null;
      }
    },
    [dimensions]
  );

  const addShape = useCallback(
    (type: "rect" | "circle") => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      if (type === "rect") {
        return new Rect({
          left: dimensions.width / 2 - 75,
          top: dimensions.height / 2 - 50,
          width: 150,
          height: 100,
          fill: "#3B82F6",
          stroke: "#1D4ED8",
          strokeWidth: 2,
          rx: 8,
          ry: 8,
          ...CONTROL_DEFAULTS,
        });
      } else {
        return new Circle({
          left: dimensions.width / 2 - 50,
          top: dimensions.height / 2 - 50,
          radius: 50,
          fill: "#3B82F6",
          stroke: "#1D4ED8",
          strokeWidth: 2,
          ...CONTROL_DEFAULTS,
        });
      }
    },
    [dimensions]
  );

  const exportAsImage = useCallback((format: "png" | "jpeg" = "png", quality = 1, multiplier = 3) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return canvas.toDataURL({
      format,
      quality,
      multiplier,
    });
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      const idsToDelete = activeObjects.map((obj: any) => obj.customData?.id).filter((id: string) => !!id);

      if (idsToDelete.length > 0) {
        canvas.discardActiveObject();
        removeElements(idsToDelete);
      }
    }
  }, [removeElements]);

  const moveSelected = useCallback(
    (dx: number, dy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      pushToHistory();

      const updatesList: { id: string; changes: Partial<CanvasElement> }[] = [];

      if (activeObject.type === "activeSelection") {
        const activeSelection = activeObject as ActiveSelection;
        const objects = activeSelection.getObjects();

        // Set flag to prevent useEffect re-render
        isMultiSelectModifyingRef.current = true;

        // Move each object
        objects.forEach((obj) => {
          obj.left = (obj.left || 0) + dx;
          obj.top = (obj.top || 0) + dy;
          obj.setCoords();
        });

        // Calculate world coordinates for each object
        objects.forEach((obj: any) => {
          if (obj.customData?.id) {
            // Use calcTransformMatrix which includes all parent transforms
            const matrix = obj.calcTransformMatrix();
            const decomposed = util.qrDecompose(matrix);

            // Get the CENTER in world coords
            const worldCenterX = decomposed.translateX;
            const worldCenterY = decomposed.translateY;

            // Get scaled dimensions
            const scaledWidth = (obj.width || 0) * decomposed.scaleX;
            const scaledHeight = (obj.height || 0) * decomposed.scaleY;

            // Convert CENTER to TOP-LEFT
            const position = {
              x: worldCenterX - scaledWidth / 2,
              y: worldCenterY - scaledHeight / 2,
            };

            updatesList.push({
              id: obj.customData.id,
              changes: { position },
            });
          }
        });

        // Clear the flag after TWO frames
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isMultiSelectModifyingRef.current = false;
          });
        });
      } else {
        activeObject.left = (activeObject.left || 0) + dx;
        activeObject.top = (activeObject.top || 0) + dy;
        activeObject.setCoords();

        if (activeObject.customData?.id) {
          updatesList.push({
            id: activeObject.customData.id,
            changes: {
              position: { x: activeObject.left, y: activeObject.top },
            },
          });
        }
      }

      if (updatesList.length > 0) {
        updateElements(updatesList);
      }
      canvas.requestRenderAll();
    },
    [updateElements, pushToHistory]
  );

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

  return {
    addText,
    addImage,
    addShape,
    exportAsImage,
    deleteSelected,
    moveSelected,
  };
}
