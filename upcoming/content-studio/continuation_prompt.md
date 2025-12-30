# 🔄 CONTINUATION PROMPT - Content Studio Bugs

## ✅ STATUS: VERIFIED FIXED (Refactored & Robust)

> **User Request**: "kurangi lagi codenya (<1000 lines), fix blank page on move down"

---

## 🎯 SOLUTIONS SUMMARY

### 1. Fix: Blank Page on Move (The "Force Rebuild")

- **Mechanism**: Use `prevSlideIndexRef` in the element sync loop.
- **Logic**: `if (prevIndex !== currentIndex) -> Force Rebuild`.
- **Why**: React reordering (DOM Move) with Stable Keys causes Canvas visual buffer loss. Forcing a logic pass that executes `canvas.clear()` and `canvas.add()` restores the content reliably.

### 2. Refactor: Code Reduction

- **Action**: Extracted `loadFont` logic to `src/utils/contentStudio/fabricUtils.ts`.
- **Result**: `useCanvas.ts` size reduced significantly.
- **Cleanliness**: Imports used instead of inline definitions.

### 3. Fix: Reorder Selection & Reload Selection

- **Status**: Maintained Refs Pattern and JIT Offset Sync.
- **Verification**: All scenarios pass (Reorder Up/Down, Reload, Smooth Scroll).

---

## 📋 CODE STANDARDS

1.  **Stable Keys**: `key={slide.id}`.
2.  **Move Handling**: MUST force rebuild canvas content when `slideIndex` changes.
3.  **Offsets**: `scroll` + `resize` + `mouseenter` -> `requestRenderAll`.
4.  **Font Loading**: Use shared `loadFont` utility.

---

**Last Updated**: 2025-12-30 14:00 WIB
**Status**: ✅ **VERIFIED & CLOSED**
