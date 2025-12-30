# Project Structure

## Directory Tree

```
d:\PROJECT 2025\CONTENT GENERATOR
├── public
│   └── vite.svg
├── src
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   └── ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── features
│   │   └── editor
│   │       ├── components
│   │       │   ├── CaptionDisplay.tsx
│   │       │   ├── ElementInspector.tsx
│   │       │   ├── ElementToolbar.tsx
│   │       │   ├── ExportButton.tsx
│   │       │   ├── LoadingOverlay.tsx
│   │       │   ├── Sidebar.tsx
│   │       │   ├── SlideNavigator.tsx
│   │       │   ├── SupportingBoxesToolbar.tsx
│   │       │   ├── TemplateBrowser.tsx
│   │       │   └── TopToolbar.tsx
│   │       ├── hooks
│   │       │   ├── useCanvas.ts
│   │       │   └── useKeyboardShortcuts.ts
│   │       ├── store
│   │       │   └── editorStore.ts
│   │       ├── templates
│   │       │   ├── contentTypes.ts
│   │       │   ├── imageLayouts.ts
│   │       │   └── types.ts
│   │       ├── utils
│   │       │   ├── blueprintParser.ts
│   │       │   ├── exportUtils.ts
│   │       │   ├── fabricUtils.ts
│   │       │   ├── supportingBoxes.ts
│   │       │   └── templateUtils.ts
│   │       ├── CanvasEditor.tsx
│   │       ├── Editor.tsx
│   │       ├── index.ts
│   │       └── types.ts
│   ├── lib
│   │   ├── animations.ts
│   │   ├── clipboard.ts
│   │   ├── downloader.ts
│   │   ├── generator.ts
│   │   └── utils.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Module Descriptions

### Root
- **`public/`**: Static assets.
- **`src/`**: Main application source code.
- **`vite.config.ts`**: Configuration for Vite bundler.
- **`tailwind.config.js`**: Tailwing CSS configuration.
- **`tsconfig.json`**: TypeScript configuration.

### Source (`src/`)

#### Components (`src/components/ui`)
Reusable UI components based on shadcn/ui.
- `button.tsx`, `card.tsx`, `label.tsx`, `select.tsx`, `tabs.tsx`, `textarea.tsx`

#### Feature: Editor (`src/features/editor`)
The core content generation and editing feature.
- **Components (`components/`)**:
  - `Sidebar.tsx`: Main sidebar for template/content selection.
  - `CanvasEditor.tsx`: The main drawing area.
  - `TopToolbar.tsx`, `ElementToolbar.tsx`: Toolbars for actions.
  - `TemplateBrowser.tsx`: Browser for choosing templates.
  - `ElementInspector.tsx`: Properties panel.
- **Hooks (`hooks/`)**:
  - `useCanvas.ts`: Main canvas logic.
- **Store (`store/`)**:
  - `editorStore.ts`: State management.
- **Templates (`templates/`)**:
  - `contentTypes.ts`, `imageLayouts.ts`: Definitions for slide layouts.
- **Utils (`utils/`)**:
  - `blueprintParser.ts`: JSON content parser.
  - `exportUtils.ts`: Export functionality.
  - `fabricUtils.ts`: Fabric.js helper functions.
  - `supportingBoxes.ts`: content box helper functions.
  - `templateUtils.ts`: Template application logic.

#### Lib (`src/lib`)
Shared utilities and helpers.
- `generator.ts`: Content generation logic.
- `downloader.ts`: File download handling.
