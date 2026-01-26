# Dynamo Author Layout Documentation

This document outlines the available author display types, variants, and behaviors implemented in the Dynamo blueprint parser.

## Core Concepts

- **Base Padding**: All layouts respect the global padding ratio defined in `constants`.
- **Dynamic Sizing**: Text elements are measured dynamically to ensure proper spacing and alignment, particularly for split layouts.
- **Swapping**: Most variants support a `swap_elements` flag to reverse the order of Name and Hashtag.
- **Single Element Logic**: If the hashtag is missing/empty, the layout automatically adjusts (e.g., removing vertical gaps in Stacked mode).

---

## 1. Stacked (Default)

The classic layout where the Author Name and Hashtag are stacked vertically.

- **Structure**:
  - Line 1: Author Name (Larger / Bold)
  - Line 2: Hashtag (Smaller)
- **Positions**:
  - Top / Bottom
  - Left / Center / Right
- **Variants**:
  - **Standard**: Both name and hashtag present.
  - **Single**: Only Name present (vertical centering adjusts automatically).

## 2. Inline (Merged)

Combines the Name and Hashtag into a single text block with a separator pipe `|`.

- **Structure**: `Name | Hashtag` (Single Text Element)
- **Styling**: Uniform font size and weight (Normal 400), creating a cleaner, more minimal look.
- **Positions**:
  - Top / Bottom
  - Left / Center / Right
- **Variants**:
  - **Normal**: `Name | Hashtag`
  - **Swapped**: `Hashtag | Name`

## 3. Split (Justify Between)

Uses the full width of the slide layout to position elements at opposite edges. Ideal for footer-style layouts.

- **Structure**:
  - Left Edge: Name
  - Right Edge: Hashtag
- **Positions**:
  - `top-justify` (or any position containing 'between'/'justify')
  - `bottom-justify`
- **Styling**: Uniform font size.
- **Variants**:
  - **Normal**: Left: Name ... Right: Hashtag
  - **Swapped**: Left: Hashtag ... Right: Name

## 4. Split-Line (Separator Line)

A variation of the Split layout that connects the two elements with a dynamic horizontal line.

- **Structure**:
  - Name `----------` Hashtag
- **Line Behavior**:
  - **Dynamic Width**: Calculates the exact width needed to fill the space between the text elements (minus an 8px gap).
  - **Alignment**: Vertically aligned to the visual center of the text (approx 0.65x text size offset).
  - **Unlocked**: The line is generated as an unlocked shape, allowing manual fine-tuning in the editor if needed.
- **Positions**:
  - `top-justify`
  - `bottom-justify`
- **Variants**:
  - **Normal**: Name --- Hashtag
  - **Swapped**: Hashtag --- Name

---

## Configuration Reference (JSON)

To use these in `dynamo.json` or blueprint data:

```json
"layout": {
  // Position string triggers logic (e.g., "bottom-justify" for split)
  "author_position_override": "bottom-center",

  // Explicit variant selection
  "author_variant_override": "stacked" | "inline" | "split" | "split-line",

  // Optional: Swap order
  "author_swap_override": true | false
}
```
