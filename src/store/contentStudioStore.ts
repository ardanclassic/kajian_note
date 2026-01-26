// Zustand store for content studio editor state with persistence and undo/redo

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Slide, CanvasElement, TextElement, Ratio, HistoryEntry } from "@/types/contentStudio.types";
import { RATIO_DIMENSIONS } from "@/types/contentStudio.types";
import { parseBlueprint, validateBlueprint, adjustSlideLayout } from "@/utils/contentStudio/blueprint-parser";

const MAX_HISTORY_SIZE = 50;

interface EditorState {
  // Data
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  selectedElementIds: string[]; // For multi-selection

  // Canvas settings
  ratio: Ratio;
  zoomLevel: number;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Meta
  blueprintMeta: {
    author: string;
    logoUrl: string;
    topic: string;
  } | null;
  currentBlueprint: any | null;
  caption: string;
  hashtags: string[];
  clipboard: CanvasElement[];
  croppingElementId: string | null;
}

interface EditorActions {
  // Slides
  addSlide: () => void;
  removeSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setCurrentSlide: (index: number) => void;
  updateSlide: (index: number, updates: Partial<Slide>) => void;
  duplicateSlide: (index: number) => void;
  insertSlide: (index: number) => void;

  // Elements
  addElement: (element: CanvasElement) => void;
  addElements: (elements: CanvasElement[]) => void;
  removeElement: (elementId: string) => void;
  removeElements: (elementIds: string[]) => void; // Batch remove
  duplicateElement: (elementId: string) => void;
  duplicateElements: (elementIds: string[]) => void; // Batch duplicate
  updateElement: (elementId: string, updates: Partial<CanvasElement>, pushHistory?: boolean) => void;
  updateElements: (updates: { id: string; changes: Partial<CanvasElement> }[]) => void;
  selectElement: (elementId: string | null, multi?: boolean) => void; // Modified signature
  selectElements: (elementIds: string[]) => void; // Explicit multi-select
  reorderElements: (elementId: string, direction: "up" | "down" | "top" | "bottom") => void;
  setCroppingElementId: (id: string | null) => void;

  // Canvas settings
  setRatio: (ratio: Ratio) => void;
  setZoom: (zoom: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
  copy: () => void;
  cut: () => void;
  paste: () => void;

  // Blueprint
  loadBlueprint: (blueprint: any) => void;
  setCaption: (caption: string) => void;
  setHashtags: (hashtags: string[]) => void;

  // Reset
  reset: () => void;
}

// Internal type since we removed it from global types but need it for default
interface ColorPalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent_1: string;
    background: string;
    text_dark: string;
  };
}

export const DEFAULT_COLOR_PALETTE: ColorPalette = {
  name: "Ocean Blue",
  colors: {
    primary: "#3B82F6",
    secondary: "#60A5FA",
    accent_1: "#1D4ED8",
    background: "#EFF6FF",
    text_dark: "#1E3A8A",
  },
};

const createEmptySlide = (): Slide => ({
  id: uuidv4(),
  elements: [],
  backgroundColor: "#FFFFFF",
});

const initialState: EditorState = {
  slides: [createEmptySlide()],
  currentSlideIndex: 0,
  selectedElementId: null,
  selectedElementIds: [],
  ratio: "4:5",
  zoomLevel: 100,
  history: [],
  historyIndex: -1,
  blueprintMeta: null,
  currentBlueprint: null,
  caption: "",
  hashtags: [],
  clipboard: [],
  croppingElementId: null,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // ============ SLIDE ACTIONS ============

        addSlide: () => {
          get().pushToHistory();
          set((state) => ({
            slides: [...state.slides, createEmptySlide()],
            currentSlideIndex: state.slides.length,
          }));
        },

        removeSlide: (index) => {
          const { slides } = get();
          if (slides.length <= 1) return; // Keep at least one slide

          get().pushToHistory();
          set((state) => ({
            slides: state.slides.filter((_, i) => i !== index),
            currentSlideIndex: Math.min(state.currentSlideIndex, state.slides.length - 2),
            selectedElementId: null,
          }));
        },

        reorderSlides: (fromIndex, toIndex) => {
          get().pushToHistory();
          set((state) => {
            const newSlides = [...state.slides];
            const [removed] = newSlides.splice(fromIndex, 1);
            newSlides.splice(toIndex, 0, removed);
            return {
              slides: newSlides,
              currentSlideIndex: toIndex,
            };
          });
        },

        setCurrentSlide: (index) => {
          set({
            currentSlideIndex: index,
            selectedElementId: null,
            selectedElementIds: [],
          });
        },

        updateSlide: (index, updates) => {
          set((state) => ({
            slides: state.slides.map((slide, i) => (i === index ? { ...slide, ...updates } : slide)),
          }));
        },

        duplicateSlide: (index) => {
          get().pushToHistory();
          set((state) => {
            const slideToDuplicate = state.slides[index];
            if (!slideToDuplicate) return state;

            // Deep clone the slide first
            const newSlide = JSON.parse(JSON.stringify(slideToDuplicate));

            // Assign new ID to the slide
            newSlide.id = uuidv4();
            newSlide.title = slideToDuplicate.title ? `${slideToDuplicate.title} (Copy)` : undefined;

            // CRITICAL: Regenerate IDs for all elements to prevent state linking
            // mapped elements are already deep cloned via the JSON parse above
            newSlide.elements = newSlide.elements.map((el: CanvasElement) => ({
              ...el,
              id: uuidv4(),
            }));

            const newSlides = [...state.slides];
            newSlides.splice(index + 1, 0, newSlide);

            return {
              slides: newSlides,
              currentSlideIndex: index + 1,
            };
          });
        },

        insertSlide: (index) => {
          get().pushToHistory();
          set((state) => {
            const newSlide = createEmptySlide();
            const newSlides = [...state.slides];
            newSlides.splice(index + 1, 0, newSlide);

            return {
              slides: newSlides,
              currentSlideIndex: index + 1,
            };
          });
        },

        // ============ ELEMENT ACTIONS ============

        addElement: (element) => {
          get().pushToHistory();
          set((state) => {
            let elementToAdd = { ...element };

            // AUTO-RESIZE IMAGE ON IMPORT
            if (elementToAdd.type === "image") {
              const canvasWidth = RATIO_DIMENSIONS[state.ratio].width;
              const canvasHeight = RATIO_DIMENSIONS[state.ratio].height;

              const maxWidth = canvasWidth * 0.7;
              const maxHeight = canvasHeight * 0.7;

              const currentWidth = elementToAdd.size.width * (elementToAdd as any).scaleX;
              const currentHeight = elementToAdd.size.height * (elementToAdd as any).scaleY;

              if (currentWidth > maxWidth || currentHeight > maxHeight) {
                const scaleX = maxWidth / elementToAdd.size.width;
                const scaleY = maxHeight / elementToAdd.size.height;

                // Use the smaller scale factor to ensure it fits within BOTH dimensions
                const scaleFactor = Math.min(scaleX, scaleY);

                (elementToAdd as any).scaleX = scaleFactor;
                (elementToAdd as any).scaleY = scaleFactor; // Maintain aspect ratio

                // Recenter logic
                const newW = elementToAdd.size.width * scaleFactor;
                const newH = elementToAdd.size.height * scaleFactor;
                elementToAdd.position = {
                  x: (canvasWidth - newW) / 2,
                  y: (canvasHeight - newH) / 2,
                };
              }
            }

            const currentSlide = state.slides[state.currentSlideIndex];
            const maxZIndex = currentSlide.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

            const newElement = { ...elementToAdd, zIndex: maxZIndex + 1 };
            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, newElement] } : slide,
            );

            return {
              slides: newSlides,
              selectedElementId: element.id,
              selectedElementIds: [element.id],
            };
          });
        },

        addElements: (elements) => {
          get().pushToHistory();
          set((state) => {
            const currentSlide = state.slides[state.currentSlideIndex];
            const maxZIndex = currentSlide.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

            // Add zIndex to each element
            const newElements = elements.map((el, index) => ({
              ...el,
              zIndex: maxZIndex + index + 1,
            }));

            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, ...newElements] } : slide,
            );

            const newIds = newElements.map((el) => el.id);
            return {
              slides: newSlides,
              selectedElementId: newIds[0] || null,
              selectedElementIds: newIds,
            };
          });
        },

        removeElement: (elementId) => {
          get().pushToHistory();
          set((state) => {
            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex
                ? { ...slide, elements: slide.elements.filter((el) => el.id !== elementId) }
                : slide,
            );

            return {
              slides: newSlides,
              selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
              selectedElementIds: state.selectedElementIds.filter((id) => id !== elementId),
            };
          });
        },

        removeElements: (elementIds) => {
          get().pushToHistory();
          set((state) => {
            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex
                ? { ...slide, elements: slide.elements.filter((el) => !elementIds.includes(el.id)) }
                : slide,
            );

            return {
              slides: newSlides,
              selectedElementId: null,
              selectedElementIds: [],
            };
          });
        },

        duplicateElement: (elementId) => {
          get().pushToHistory();
          set((state) => {
            const currentSlide = state.slides[state.currentSlideIndex];
            const element = currentSlide.elements.find((el) => el.id === elementId);
            if (!element) return state;

            const newElement = {
              ...element,
              id: uuidv4(),
              position: { x: element.position.x + 20, y: element.position.y + 20 },
              zIndex: currentSlide.elements.length,
            };

            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, newElement] } : slide,
            );

            return {
              slides: newSlides,
              selectedElementId: newElement.id,
              selectedElementIds: [newElement.id],
            };
          });
        },

        duplicateElements: (elementIds) => {
          get().pushToHistory();
          set((state) => {
            const currentSlide = state.slides[state.currentSlideIndex];
            const elementsToDuplicate = currentSlide.elements.filter((el) => elementIds.includes(el.id));

            if (elementsToDuplicate.length === 0) return state;

            const maxZIndex = currentSlide.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

            // Create duplicates with new IDs and offset positions
            const newElements = elementsToDuplicate.map((element, index) => ({
              ...JSON.parse(JSON.stringify(element)), // Deep clone
              id: uuidv4(),
              position: {
                x: element.position.x + 20,
                y: element.position.y + 20,
              },
              zIndex: maxZIndex + index + 1,
            }));

            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, ...newElements] } : slide,
            );

            const newIds = newElements.map((el) => el.id);
            return {
              slides: newSlides,
              selectedElementId: newIds[0] || null,
              selectedElementIds: newIds,
            };
          });
        },

        updateElement: (elementId, updates, pushHistory = true) => {
          if (pushHistory) {
            get().pushToHistory();
          }
          set((state) => {
            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex
                ? {
                    ...slide,
                    elements: slide.elements.map((el) =>
                      el.id === elementId ? ({ ...el, ...updates } as CanvasElement) : el,
                    ),
                  }
                : slide,
            );
            return { slides: newSlides };
          });
        },

        updateElements: (updatesList) => {
          get().pushToHistory();
          set((state) => {
            const updatesMap = new Map(updatesList.map((u) => [u.id, u.changes]));

            const newSlides = state.slides.map((slide, i) =>
              i === state.currentSlideIndex
                ? {
                    ...slide,
                    elements: slide.elements.map((el) => {
                      const changes = updatesMap.get(el.id);
                      return changes ? ({ ...el, ...changes } as CanvasElement) : el;
                    }),
                  }
                : slide,
            );
            return { slides: newSlides };
          });
        },

        selectElement: (elementId, multi = false) => {
          set((state) => {
            if (elementId === null) {
              return { selectedElementId: null, selectedElementIds: [] };
            }

            if (multi) {
              const exists = state.selectedElementIds.includes(elementId);
              let newIds;
              if (exists) {
                newIds = state.selectedElementIds.filter((id) => id !== elementId);
              } else {
                newIds = [...state.selectedElementIds, elementId];
              }
              return {
                selectedElementId: elementId, // Make the last clicked active
                selectedElementIds: newIds,
              };
            } else {
              return {
                selectedElementId: elementId,
                selectedElementIds: [elementId],
              };
            }
          });
        },

        selectElements: (elementIds) => {
          set({
            selectedElementId: elementIds.length > 0 ? elementIds[0] : null,
            selectedElementIds: elementIds,
          });
        },

        reorderElements: (elementId, direction) => {
          get().pushToHistory();
          set((state) => {
            const currentSlide = state.slides[state.currentSlideIndex];
            // Normalize current elements order by zIndex first
            const elements = [...currentSlide.elements].sort((a, b) => a.zIndex - b.zIndex);

            const index = elements.findIndex((el) => el.id === elementId);

            if (index === -1) return state;

            let newElements = [...elements];

            if (direction === "top") {
              // Move to end
              const [removed] = newElements.splice(index, 1);
              newElements.push(removed);
            } else if (direction === "bottom") {
              // Move to start
              const [removed] = newElements.splice(index, 1);
              newElements.unshift(removed);
            } else if (direction === "up") {
              // Move forward
              if (index < newElements.length - 1) {
                const temp = newElements[index];
                newElements[index] = newElements[index + 1];
                newElements[index + 1] = temp;
              }
            } else if (direction === "down") {
              // Move backward
              if (index > 0) {
                const temp = newElements[index];
                newElements[index] = newElements[index - 1];
                newElements[index - 1] = temp;
              }
            }

            // Normalize zIndex 0..N-1
            newElements = newElements.map((el, i) => ({
              ...el,
              zIndex: i,
            }));

            const newSlides = [...state.slides];
            newSlides[state.currentSlideIndex] = {
              ...currentSlide,
              elements: newElements,
            };

            return { slides: newSlides };
          });
        },

        setCroppingElementId: (id) => {
          set({ croppingElementId: id });
        },

        // ============ CANVAS SETTINGS ============

        setRatio: (ratio) => {
          get().pushToHistory();
          set((state) => {
            // Automatically adjust visual layout for all slides based on new ratio
            const newSlides = state.slides.map((slide) => adjustSlideLayout(slide, ratio));
            return {
              ratio,
              slides: newSlides,
            };
          });
        },

        setZoom: (zoom) => {
          set({ zoomLevel: Math.max(25, Math.min(200, zoom)) });
        },

        // ============ HISTORY ============

        pushToHistory: () => {
          set((state) => {
            const entry: HistoryEntry = {
              slides: JSON.parse(JSON.stringify(state.slides)),
              currentSlideIndex: state.currentSlideIndex,
              timestamp: Date.now(),
            };

            // Remove any future history if we're not at the end
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(entry);

            // Limit history size
            if (newHistory.length > MAX_HISTORY_SIZE) {
              newHistory.shift();
            }

            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          });
        },

        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < 0) return;

          const entry = history[historyIndex];
          set({
            slides: JSON.parse(JSON.stringify(entry.slides)),
            currentSlideIndex: entry.currentSlideIndex,
            historyIndex: historyIndex - 1,
            selectedElementId: null,
          });
        },

        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex >= history.length - 1) return;

          const entry = history[historyIndex + 1];
          set({
            slides: JSON.parse(JSON.stringify(entry.slides)),
            currentSlideIndex: entry.currentSlideIndex,
            historyIndex: historyIndex + 1,
            selectedElementId: null,
          });
        },

        copy: () => {
          const { slides, currentSlideIndex, selectedElementIds } = get();
          if (selectedElementIds.length === 0) return;

          const currentSlide = slides[currentSlideIndex];
          const elementsToCopy = currentSlide.elements.filter((el) => selectedElementIds.includes(el.id));

          if (elementsToCopy.length > 0) {
            // Deep clone to prevent reference issues
            set({ clipboard: JSON.parse(JSON.stringify(elementsToCopy)) });
          }
        },

        cut: () => {
          get().copy();
          const { selectedElementIds } = get();
          if (selectedElementIds.length > 0) {
            get().removeElements(selectedElementIds);
          }
        },

        paste: () => {
          const { clipboard } = get();
          if (clipboard.length === 0) return;

          // Create new elements with new IDs and offset positions
          const newElements = clipboard.map((element) => ({
            ...element,
            id: uuidv4(),
            position: {
              x: element.position.x + 20,
              y: element.position.y + 20,
            },
          }));

          get().addElements(newElements);
        },

        // ============ BLUEPRINT ============

        loadBlueprint: (blueprint) => {
          get().pushToHistory();

          try {
            const { ratio } = get();
            let slides: Slide[] = [];

            if (validateBlueprint(blueprint)) {
              // Unified parser (formerly V2)
              slides = parseBlueprint({ blueprint, ratio });

              // Update Meta
              set({
                slides,
                currentSlideIndex: 0,
                selectedElementId: null,
                blueprintMeta: {
                  author: blueprint.metadata?.author?.name || "",
                  logoUrl: blueprint.metadata?.author?.avatar_url || "",
                  topic: blueprint.metadata.title,
                },
                currentBlueprint: blueprint,
                caption: blueprint.caption || blueprint.metadata?.description || "",
                hashtags:
                  blueprint.hashtags ||
                  blueprint.metadata?.tags ||
                  (blueprint.metadata.author.hashtag ? [blueprint.metadata.author.hashtag] : []),
              });
              return;
            }
          } catch (error) {
            console.error("Failed to parse blueprint:", error);
            console.warn("Falling back to raw slide extraction");

            // Ultimate fallback
            const slides: Slide[] = blueprint.slides?.map((slideData: any) => ({
              id: uuidv4(),
              elements: [],
              backgroundColor: "#FFFFFF",
            })) || [createEmptySlide()];

            set({
              slides,
              currentSlideIndex: 0,
              selectedElementId: null,
              blueprintMeta: blueprint.meta || null,
              currentBlueprint: blueprint,
              caption: blueprint.captions || "",
              hashtags: [],
            });
          }
        },

        setCaption: (caption) => {
          set({ caption });
        },

        setHashtags: (hashtags) => {
          set({ hashtags });
        },

        // ============ RESET ============

        reset: () => {
          set({
            ...initialState,
            history: [],
            historyIndex: -1,
            currentBlueprint: null,
          });
        },
      }),
      {
        name: "content-generator-editor",
        partialize: (state) => ({
          slides: state.slides,
          currentSlideIndex: state.currentSlideIndex,
          ratio: state.ratio,
          blueprintMeta: state.blueprintMeta,
          currentBlueprint: state.currentBlueprint,
          caption: state.caption,
          hashtags: state.hashtags,
        }),
      },
    ),
  ),
);
