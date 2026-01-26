import { Canvas, Textbox, FabricObject, ActiveSelection } from "fabric";
import { CONTROL_DEFAULTS } from "./fabricUtils";
import type { CanvasElement, ShapeElement } from "@/types/contentStudio.types";
import type { MutableRefObject } from "react";
import { useEditorStore } from "@/store/contentStudioStore";

// ==================== SHAPE TEXT EDITING ====================
export function setupShapeTextEditing(
  canvas: Canvas,
  isEditingRef: MutableRefObject<boolean>,
  lastSyncedElementsRef: MutableRefObject<string>,
  updateElement: (id: string, changes: Partial<CanvasElement>, addHistory?: boolean) => void
) {
  return (e: any) => {
    const target = e.target;
    if (!target || target.type === "activeSelection" || !target.customData?.id) return;

    const id = target.customData.id;
    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    const element = currentSlide?.elements.find((el: any) => el.id === id);

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

        updateElement(id, {
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
  };
}

// ==================== MULTI-SELECT TRACKING ====================
export function setupMultiSelectTracking(
  canvas: Canvas,
  selectionCoordsRef: MutableRefObject<Map<string, { x: number; y: number }>>,
  isRenderingRef: MutableRefObject<boolean>,
  isInternalSelectionUpdateRef: MutableRefObject<boolean>,
  pushToHistory: () => void,
  updateElements: (updates: { id: string; changes: Partial<CanvasElement> }[]) => void,
  lastSyncedElementsRef: MutableRefObject<string>,
  selectElement: (id: string | null) => void
) {
  // Track initial positions on multi-select creation
  const onSelectionCreated = (e: any) => {
    if (e.selected && e.selected.length > 1) {
      selectionCoordsRef.current.clear();
      // Only track unlocked objects - locked objects should not be moved in multi-select
      const unlockedObjects = e.selected.filter((obj: any) => !obj.lockMovementX && !obj.lockMovementY);
      unlockedObjects.forEach((obj: any) => {
        if (obj.customData?.id) {
          selectionCoordsRef.current.set(obj.customData.id, {
            x: obj.left || 0,
            y: obj.top || 0,
          });
        }
      });
    }
  };

  // Save changes when selection is cleared
  const onSelectionCleared = () => {
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
  };

  return {
    onSelectionCreated,
    onSelectionCleared,
  };
}

// ==================== OBJECT MODIFICATION HANDLER ====================
export function setupObjectModification(
  canvas: Canvas,
  pushToHistory: () => void,
  updateElement: (id: string, changes: Partial<CanvasElement>, addHistory?: boolean) => void
) {
  return (e: any) => {
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
      const currentScaleX = obj.scaleX || 1;
      const currentScaleY = obj.scaleY || 1;

      // Separate flip state from resize scale
      const absScaleX = Math.abs(currentScaleX);
      const absScaleY = Math.abs(currentScaleY);
      const scaling = Math.max(absScaleX, absScaleY);

      const newFontSize = Math.round(((obj as any).fontSize || 24) * scaling);
      const newWidth = (obj.width || 0) * absScaleX;

      // Preserve flip state as -1 or 1
      const flipX = currentScaleX < 0 ? -1 : 1;
      const flipY = currentScaleY < 0 ? -1 : 1;

      (updates as any).fontSize = newFontSize;
      (updates as any).size = { width: newWidth, height: (obj.height || 0) * absScaleY };
      (updates as any).scaleX = flipX; // CRITICAL: Save flip state to store!
      (updates as any).scaleY = flipY;

      obj.set({
        fontSize: newFontSize,
        width: newWidth,
        scaleX: flipX, // Preserve flip, remove resize
        scaleY: flipY,
        dirty: true,
      });
    } else if (obj.type === "image") {
      (updates as any).scaleX = obj.scaleX || 1;
      (updates as any).scaleY = obj.scaleY || 1;
    } else if (obj.type === "group" && obj.customData?.id) {
      // Handle Shape + Text group resizing
      // Simply calculate the new absolute dimensions and update the store.
      // We rely on the store update -> re-render cycle to reconstruct the group
      // with the correct text wrapping and un-scaled font.

      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;
      const newWidth = (obj.width || 0) * scaleX;
      const newHeight = (obj.height || 0) * scaleY;

      (updates as any).size = {
        width: newWidth,
        height: newHeight,
      };

      // We don't manually un-scale children here to avoid fighting Fabric's internal group logic.
      // The re-render will handle the "visual correction" of the text font size.
    } else if (["rect", "circle", "triangle", "polygon", "line"].includes(obj.type || "")) {
      const currentScaleX = obj.scaleX || 1;
      const currentScaleY = obj.scaleY || 1;

      // Separate flip state from resize scale
      const absScaleX = Math.abs(currentScaleX);
      const absScaleY = Math.abs(currentScaleY);

      // Preserve flip state as -1 or 1
      const flipX = currentScaleX < 0 ? -1 : 1;
      const flipY = currentScaleY < 0 ? -1 : 1;

      (updates as any).size = {
        width: (obj.width || 0) * absScaleX,
        height: (obj.height || 0) * absScaleY,
      };
      (updates as any).scaleX = flipX; // CRITICAL: Save flip state!
      (updates as any).scaleY = flipY;

      obj.set({
        width: (obj.width || 0) * absScaleX,
        height: (obj.height || 0) * absScaleY,
        scaleX: flipX, // Preserve flip, remove resize
        scaleY: flipY,
        dirty: true,
      });
    }

    updateElement(obj.customData.id, updates, false);
    canvas.requestRenderAll();
  };
}

// ==================== SHIFT-CLICK MULTI-SELECTION ====================
export function handleShiftClickSelection(
  e: any,
  canvas: Canvas,
  isRenderingRef: MutableRefObject<boolean>,
  isInternalSelectionUpdateRef: MutableRefObject<boolean>,
  selectElement: (id: string | null) => void,
  selectElements: (ids: string[]) => void
) {
  if (!e.e || isRenderingRef.current) return;

  const isShiftKey = e.e.shiftKey;
  const target = e.target;

  if (isShiftKey && target && target.customData?.id) {
    // Don't allow locked objects to be added to multi-selection
    // They can still be selected individually (when shift is not pressed)
    if (target.lockMovementX || target.lockMovementY) {
      return;
    }

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
      // Don't allow adding locked object to existing single selection
      if (currentActive.lockMovementX || currentActive.lockMovementY) {
        return;
      }

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
}
