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
import { Canvas, Textbox, FabricObject, ActiveSelection, FabricImage } from "fabric";
import { useEditorStore } from "@/store/contentStudioStore";
import type { TextElement, ShapeElement, Ratio } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS, DISPLAY_DIMENSIONS } from "@/types/contentStudio.types";

declare module "fabric" {
  interface FabricObject {
    customData?: { id: string };
  }
}

import { createFabricObject, CONTROL_DEFAULTS, loadFont } from "@/utils/contentStudio/fabricUtils";
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
}

export function useCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseCanvasOptions,
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  slide: Slide, // Direct prop access ensures we render the correct slide data during reorder operations
  slideIndex: number // Used to detect if this canvas is the currently "active" slide in the viewport
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
      const ids = selected.map((obj) => obj.customData?.id).filter(Boolean);
      selectElements(ids);
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
      selectElement
    );

    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:cleared", onSelectionCleared);

    // ========== OBJECT MODIFICATION ==========
    canvas.on("object:modified", setupObjectModification(canvas, pushToHistory, updateElement));

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

  // Update background color
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

    // 3. Add double-click handler for background image restoration
    const handleCanvasDblClick = (e: any) => {
      // Only trigger if clicking on empty canvas (no object selected)
      if (!e.target && currentSlide?.backgroundImage && currentSlide?.metadata?.previousBackgroundElement) {
        const prevElement = currentSlide.metadata.previousBackgroundElement;
        const { wasBackground, ...elementData } = prevElement;

        // Restore element
        useEditorStore.getState().updateSlide(currentSlideIndex, {
          backgroundImage: undefined,
          metadata: {
            ...currentSlide.metadata,
            previousBackgroundElement: undefined,
          },
        });
        useEditorStore.getState().addElement(elementData);
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

  // ========== REFACTORED: SEPARATE ELEMENT SYNC FROM SELECTION SYNC ==========

  // Refs moved to top of file...

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
              // Line properties
              lineStart: (el as any).lineStart,
              lineEnd: (el as any).lineEnd,
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
      if (!canvasRef.current) return;

      // Preserve background image across clears
      const savedBg = canvas.backgroundImage;
      canvas.clear();
      canvas.backgroundColor = currentSlide.backgroundColor;
      if (savedBg) {
        canvas.backgroundImage = savedBg;
      }

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

        // Force render and offset update after element sync
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

    // Ensure re-render when currentSlide.id changes (component reuse with different data)
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
