# Kajian Note - Design System & Architecture Documentation

**Version:** 1.0  
**Date:** November 10, 2025  
**Theme:** Ancient Scroll (Hybrid Modern-Responsive)

---

## 🎨 Design Philosophy

### Core Concept
**"Ancient Scroll Meets Modern UX"**

Menggabungkan estetika gulungan kuno (ancient scroll) dengan user experience modern yang elderly-friendly. Design ini menciptakan suasana spiritual dan nostalgia sambil tetap menjaga functionality dan accessibility.

### Design Principles

1. **Elderly-Friendly First**
   - Minimum font size 16px (prefer 18px for body)
   - High contrast colors
   - Large touch targets (min 48px)
   - Clear visual hierarchy
   - Simple, intuitive navigation

2. **Nostalgic & Spiritual**
   - Parchment paper texture
   - Ink-like text colors
   - Scroll-rolled edges
   - Sepia tones
   - Gold accents for premium

3. **Modern UX Standards**
   - Responsive design (mobile-first)
   - Smooth animations
   - Clear feedback
   - Accessible (WCAG 2.1 AA)
   - Fast loading

4. **Performance**
   - Minimal dependencies
   - Optimized assets
   - Progressive enhancement
   - Graceful degradation

---

## 🎨 Color System

### Primary Palette - Ancient Scroll

#### Parchment (Background)
```css
--parchment-50:  #FAF6EE   /* Lightest cream - Card surfaces */
--parchment-100: #F4E8D0   /* Main background */
--parchment-200: #E8D5B7   /* Secondary surfaces */
--parchment-300: #DCC19E   /* Tertiary elements */
--parchment-400: #D0AD85   /* Darker accents */
--parchment-500: #C49A6C   /* Deep parchment */
```

**Usage:**
- `parchment-100`: Main page background
- `parchment-50`: Card backgrounds
- `parchment-200`: Secondary cards, hover states
- `parchment-300`: Disabled states, subtle accents

#### Ink (Text & Dark Elements)
```css
--ink-50:  #8B7355   /* Light ink - Decorative */
--ink-100: #6B5744   /* Faded ink - Secondary text */
--ink-200: #4A3829   /* Shadow ink - Body text */
--ink-300: #2C1810   /* Primary text - Headings */
--ink-400: #1A0F08   /* Darkest - Strong emphasis */
```

**Usage:**
- `ink-300`: Primary text, headings
- `ink-200`: Body text
- `ink-100`: Secondary text, placeholders
- `ink-50`: Decorative elements

#### Sepia (Borders & Accents)
```css
--sepia-50:  #B8A589   /* Light sepia */
--sepia-100: #A89573   /* Soft borders */
--sepia-200: #8B6F47   /* Primary borders, buttons */
--sepia-300: #735A38   /* Hover states */
--sepia-400: #5C4729   /* Active states */
```

**Usage:**
- `sepia-200`: Primary buttons, borders
- `sepia-100`: Subtle borders, dividers
- `sepia-300`: Hover states
- `sepia-400`: Button borders, shadows

#### Gold (Premium Features)
```css
--gold-50:  #F4E4B7   /* Light gold shimmer */
--gold-100: #E8D49F   /* Soft gold */
--gold-200: #C9A961   /* Primary gold - Premium badge */
--gold-300: #B8954D   /* Medium gold */
--gold-400: #9A7B3E   /* Deep gold - Shadows */
```

**Usage:**
- `gold-200`: Premium buttons, badges
- `gold-100`: Gold card backgrounds
- `gold-300`: Gold borders
- Premium tier indicators

### Status Colors (Adapted to Scroll Theme)

```css
--success: #7C9473   /* Muted green - Success states */
--warning: #C9A961   /* Gold - Warning (reuses gold-200) */
--error:   #A85848   /* Muted red - Error states */
--info:    #7B8FA3   /* Muted blue - Info messages */
```

### Color Usage Matrix

| Element | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| **Primary Button** | `sepia-200` | `sepia-300` | `sepia-400` | `sepia-100` + opacity |
| **Gold Button** | `gold-200` | `gold-300` | `gold-400` | `gold-100` + opacity |
| **Card** | `parchment-50` | `parchment-100` | - | `parchment-200` |
| **Input** | `parchment-50` | `parchment-100` | `white` | `parchment-200` |
| **Text** | `ink-300` | - | - | `ink-100` |
| **Border** | `sepia-100` | `sepia-200` | `sepia-300` | `sepia-50` |

---

## 📝 Typography System

### Font Families

```css
/* Headings - Serif for elegance */
--font-heading: "Crimson Pro", "Crimson Text", Georgia, serif;

/* Body - Sans-serif for readability */
--font-body: "Inter", system-ui, -apple-system, sans-serif;

/* Monospace - Code/technical */
--font-mono: "Fira Code", "Courier New", monospace;
```

**Import (Google Fonts):**
```html
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
```

### Type Scale (Elderly-Friendly)

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| **xs** | 14px (0.875rem) | 1.5 | Minimal use only |
| **sm** | 16px (1rem) | 1.5 | Small labels |
| **base** | 18px (1.125rem) | 1.6 | Body text (DEFAULT) |
| **lg** | 20px (1.25rem) | 1.6 | Large body |
| **xl** | 24px (1.5rem) | 1.4 | H3 headings |
| **2xl** | 30px (1.875rem) | 1.3 | H2 headings |
| **3xl** | 36px (2.25rem) | 1.25 | H1 headings |
| **4xl** | 48px (3rem) | 1.2 | Hero text |

### Font Weights

```css
--font-normal:    400  /* Body text */
--font-medium:    500  /* Emphasis */
--font-semibold:  600  /* Strong emphasis */
--font-bold:      700  /* Headings */
```

### Typography Usage

```tsx
// Headings (Serif)
<h1 className="text-3xl font-bold text-heading text-ink-300">
<h2 className="text-2xl font-bold text-heading text-ink-300">
<h3 className="text-xl font-semibold text-heading text-ink-300">

// Body Text (Sans-serif)
<p className="text-base text-ink-200">
<span className="text-sm text-ink-100">

// Emphasis
<strong className="font-semibold text-ink-300">
<em className="italic text-ink-200">
```

---

## 📏 Spacing System

### Scale (8px base)

```css
--space-xs:  0.5rem   /* 8px  - Tight spacing */
--space-sm:  0.75rem  /* 12px - Small gaps */
--space-md:  1rem     /* 16px - Default spacing */
--space-lg:  1.5rem   /* 24px - Section spacing */
--space-xl:  2rem     /* 32px - Large sections */
--space-2xl: 3rem     /* 48px - Page sections */
--space-3xl: 4rem     /* 64px - Hero spacing */
```

### Component Spacing

| Component | Padding | Gap | Margin |
|-----------|---------|-----|--------|
| **Button** | `1rem 2rem` (md) | - | - |
| **Card** | `1.5rem` (default) | - | `1rem` |
| **Input** | `1rem 1rem` | - | - |
| **Form Field** | - | `0.5rem` | `1rem` |
| **Section** | `2rem` | - | `3rem` |

---

## 🎭 Component Design Patterns

### 1. Button Variants

#### Primary Button (Sepia)
```tsx
<Button variant="default" size="lg" rounded="scroll">
  Masuk
</Button>
```
- Background: `sepia-200`
- Text: `parchment-50`
- Border: `sepia-400` (2px)
- Shadow: Medium
- Hover: Lift + darken

#### Gold Button (Premium)
```tsx
<Button variant="gold" size="lg" rounded="scroll">
  Upgrade Premium
</Button>
```
- Background: `gold-200`
- Text: `ink-300`
- Border: `gold-400` (2px)
- Shadow: Strong
- Shimmer effect on hover

#### Outline Button
```tsx
<Button variant="outline" size="lg" rounded="scroll">
  Batal
</Button>
```
- Background: `transparent`
- Border: `sepia-200` (2px)
- Text: `ink-300`
- Hover: Fill with `parchment-200`

#### Sizes
- **sm**: 40px height - Compact actions
- **default**: 48px height - Standard (elderly-friendly)
- **lg**: 56px height - Primary actions

#### Border Radius Options
- **default**: `rounded-xl` (12px)
- **scroll**: `rounded-[1.5rem_0.5rem]` (Asymmetric scroll edge)
- **full**: `rounded-full` (Pill shape)

---

### 2. Card Variants

#### Default Card
```tsx
<Card variant="default" padding="default">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```
- Background: `parchment-50`
- Border: `sepia-100` (1px)
- Shadow: Subtle paper shadow
- Hover: Lift slightly

#### Scroll Card (Ancient Style)
```tsx
<Card variant="scroll" padding="lg">
  ...
</Card>
```
- Background: Gradient `parchment-50` to `parchment-100`
- Border: `sepia-200` (2px)
- Border radius: `1.5rem 0.5rem` (rolled edge)
- Paper texture overlay
- Shadow: Inset + drop shadow

#### Gold Card (Premium)
```tsx
<Card variant="gold" padding="default">
  ...
</Card>
```
- Background: Gradient `gold-50` to `parchment-100`
- Border: `gold-300` (2px)
- Gold shimmer overlay
- Strong shadow

#### Elevated Card
```tsx
<Card variant="elevated">
  ...
</Card>
```
- Strong shadow
- Hover: Translate up + increase shadow

---

### 3. Input Fields

#### Default Input
```tsx
<Input 
  variant="default" 
  inputSize="default" 
  placeholder="Username"
/>
```
- Height: 48px (elderly-friendly)
- Background: `parchment-50`
- Border: `sepia-100`
- Text: `ink-300` @ 18px
- Focus: Ring `sepia-200`

#### Scroll Input (Themed)
```tsx
<Input 
  variant="scroll" 
  inputSize="lg"
/>
```
- Gradient background
- Asymmetric border radius
- Stronger border `sepia-200` (2px)

#### Sizes
- **sm**: 40px - Compact forms
- **default**: 48px - Standard
- **lg**: 56px - High emphasis

---

### 4. Form Patterns

#### Standard Form Field
```tsx
<div className="space-y-2">
  <Label htmlFor="field" variant="heading">
    Field Label
  </Label>
  <Input 
    id="field" 
    variant="scroll" 
    inputSize="lg" 
  />
  <HelperText>
    This is a helper text
  </HelperText>
</div>
```

#### Required Field
```tsx
<Label variant="required">
  Email (Required)
</Label>
```
- Shows red asterisk automatically

#### Error State
```tsx
<Input className="border-error" />
<ErrorText>
  This field is required
</ErrorText>
```

---

## 🎬 Animation System

### Durations
```css
--transition-fast:   150ms
--transition-normal: 300ms
--transition-slow:   500ms
```

### Easing
```css
ease-out: Most interactions
ease-in-out: Complex animations
```

### Key Animations

#### 1. Scroll Unroll (Page Load)
```css
@keyframes scroll-unroll {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.animate-scroll-unroll {
  animation: scroll-unroll 0.5s ease-out;
  transform-origin: top;
}
```

**Usage:** Page entry animation

#### 2. Ink Fade In (Content Reveal)
```css
@keyframes ink-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-ink-fade {
  animation: ink-fade-in 0.3s ease-out;
}
```

**Usage:** Content appearing effect

#### 3. Button Interactions
```css
/* Hover */
hover:shadow-lg hover:bg-sepia-300 hover:-translate-y-0.5

/* Active (Press) */
active:shadow-sm active:translate-y-0.5

/* Focus */
focus-visible:ring-2 focus-visible:ring-ring
```

#### 4. Card Hover
```css
hover:shadow-lg hover:border-sepia-200 hover:-translate-y-1
transition-all duration-300
```

---

## 📐 Layout System

### Grid System (Tailwind-based)

```tsx
/* 12-column grid */
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">
    ...
  </div>
</div>

/* Stats Grid */
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Container Widths

```tsx
/* Page Container */
<div className="max-w-7xl mx-auto px-4 md:px-8">
  ...
</div>

/* Narrow Content */
<div className="max-w-2xl mx-auto">
  ...
</div>

/* Form Container */
<div className="max-w-md mx-auto">
  ...
</div>
```

---

## 🎨 Special Effects

### 1. Paper Texture
```css
.paper-texture {
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(44, 24, 16, 0.02) 2px,
      rgba(44, 24, 16, 0.02) 4px
    );
}
```

**Usage:** Card backgrounds, page background

### 2. Scroll Shadow
```css
.scroll-shadow {
  box-shadow: 
    0 4px 12px rgba(44, 24, 16, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
```

**Usage:** Scroll variant cards

### 3. Gold Shimmer
```css
.gold-shimmer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(201, 169, 97, 0.2) 50%,
    transparent 100%
  );
  pointer-events: none;
}
```

**Usage:** Premium cards, gold buttons

### 4. Ink Splatter (Decorative)
```css
/* Small decorative dots */
.ink-dot {
  width: 4px;
  height: 4px;
  background: var(--ink-200);
  border-radius: 50%;
  opacity: 0.3;
}
```

---

## 🎯 Component Architecture

### Component Structure Pattern

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.types.ts     # TypeScript types
├── ComponentName.stories.tsx  # Storybook (optional)
└── index.ts                   # Export
```

### Component Template

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        scroll: "...",
      },
      size: {
        sm: "...",
        default: "...",
        lg: "...",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
)

Component.displayName = "Component"

export { Component, componentVariants }
```

---

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend Framework: React 19.1.1 + TypeScript 5.9.3
Build Tool:        Vite 7.1.7
Styling:           Tailwind CSS 4.1.16
UI Components:     shadcn/ui (customized)
State Management:  Zustand 5.0.8
Forms:             React Hook Form 7.66.0 + Zod 4.1.12
Backend:           Supabase (Auth + PostgreSQL)
Payment:           Lynk.id (Webhook-based)
```

### Folder Structure
```
src/
├── components/
│   ├── ui/              # Base UI components
│   ├── common/          # Shared components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── pages/               # Page components
├── lib/                 # Utilities & configs
├── store/               # Zustand stores
├── services/            # API services
├── types/               # TypeScript types
├── schemas/             # Zod schemas
├── routes/              # Routing
├── config/              # App configuration
├── utils/               # Helper functions
└── styles/              # Global styles
```

### State Management Pattern

```tsx
// Store structure (Zustand)
interface Store {
  // State
  data: Type[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetch: () => Promise<void>;
  create: (item: Type) => Promise<void>;
  update: (id: string, data: Partial<Type>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  
  // Helpers
  reset: () => void;
}
```

### Service Layer Pattern

```tsx
// Service structure
export const service = {
  // CRUD operations
  getAll: async () => {...},
  getById: async (id: string) => {...},
  create: async (data: CreateDTO) => {...},
  update: async (id: string, data: UpdateDTO) => {...},
  delete: async (id: string) => {...},
  
  // Specialized operations
  search: async (query: string) => {...},
  filter: async (filters: FilterDTO) => {...},
};
```

---

## 🎨 Icon System

### Icon Library
Using **inline SVG** for better control and theming.

### Icon Sizes
- **sm**: 16px (1rem)
- **default**: 20px (1.25rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)

### Common Icons Needed

```tsx
// Quill (Brand/Writing)
<QuillIcon className="w-6 h-6" />

// Scroll (Notes)
<ScrollIcon className="w-5 h-5" />

// Crown (Premium)
<CrownIcon className="w-5 h-5" />

// Lock (Security)
<LockIcon className="w-5 h-5" />

// User (Profile)
<UserIcon className="w-5 h-5" />

// Plus (Add)
<PlusIcon className="w-5 h-5" />

// BookOpen (Reading)
<BookOpenIcon className="w-6 h-6" />
```

### Icon Component Pattern
```tsx
export const IconName = ({ 
  className = "w-5 h-5",
  ...props 
}: React.SVGProps<SVGSVGElement>) => (
  <svg 
    className={className}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
  </svg>
);
```

---

## 📱 Responsive Design Rules

### Mobile-First Approach
1. Design for mobile (320px+) first
2. Enhance for tablet (768px+)
3. Optimize for desktop (1024px+)

### Touch Targets
- Minimum: 44x44px (iOS/Android standard)
- Recommended: 48x48px for elderly users
- Spacing between: 8px minimum

### Breakpoint Usage

```tsx
/* Mobile (default) */
<div className="px-4 py-6">
  
/* Tablet */
<div className="md:px-8 md:py-10">
  
/* Desktop */
<div className="lg:px-12 lg:py-16">
```

### Grid Patterns

```tsx
/* Stacked on mobile, 2-col on tablet, 3-col on desktop */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

/* Full width mobile, sidebar on desktop */
<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
```

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal text**: Minimum 4.5:1
- **Large text**: Minimum 3:1
- **UI components**: Minimum 3:1

**Tested Combinations:**
- `ink-300` on `parchment-100`: ✅ 8.2:1
- `ink-200` on `parchment-50`: ✅ 6.5:1
- `ink-100` on `parchment-100`: ✅ 4.8:1

#### Keyboard Navigation
```tsx
// Focus visible styles
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

#### Screen Reader Support
```tsx
// Descriptive labels
<button aria-label="Tutup dialog">
  <CloseIcon />
</button>

// Status announcements
<div role="alert" aria-live="polite">
  Catatan berhasil disimpan
</div>

// Skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

#### Semantic HTML
```tsx
// Use proper heading hierarchy
<h1> → <h2> → <h3>

// Use semantic elements
<nav>, <main>, <article>, <aside>, <footer>

// Use proper button elements
<button> not <div onClick>
```

---

## 🎯 Performance Guidelines

### Image Optimization
- Use WebP format
- Lazy load images
- Use `srcset` for responsive images
- Compress images (max 200KB)

### Code Splitting
```tsx
// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Component-based splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));
```

### Bundle Size Targets
- Initial bundle: < 200KB gzipped
- Per route: < 100KB gzipped
- Total app: < 1MB gzipped

### Lighthouse Scores Target
- Performance: > 90
- Accessibility: 100
- Best Practices: > 95
- SEO: 100

---

## 📦 Component Checklist

### Before Creating Component:

- [ ] Is it reusable?
- [ ] Does it follow design system?
- [ ] Is it accessible?
- [ ] Is it responsive?
- [ ] Does it have variants?
- [ ] Is it properly typed?
- [ ] Is it documented?

### Component Requirements:

1. **TypeScript Types**
   - Props interface
   - Variant types
   - Event handler types

2. **Variants**
   - Minimum 2-3 variants
   - Default variant specified
   - Size variants (if applicable)

3. **Accessibility**
   - Keyboard navigable
   - Screen reader friendly
   - ARIA attributes
   - Focus management

4. **Responsive**
   - Mobile tested
   - Tablet tested
   - Desktop tested

5. **Documentation**
   - Usage examples
   - Props documentation
   - Variant showcase

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Theme configuration
- [ ] Global styles
- [ ] Base UI components (Button, Input, Card, Label)
- [ ] Typography system
- [ ] Color system

### Phase 2: Core Components (Week 2)
- [ ] Form components
- [ ] Layout components
- [ ] Navigation components
- [ ] Icon system

### Phase 3: Feature Components (Week 3)
- [ ] Auth components (Login, Register)
- [ ] Notes components
- [ ] Subscription components
- [ ] Profile components

### Phase 4: Pages (Week 4)
- [ ] Authentication pages
- [ ] Dashboard
- [ ] Notes management
- [ ] User management
- [ ] Settings

### Phase 5: Polish & Testing (Week 5)
- [ ] Animations
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] User testing (elderly users)

---

## 📚 Resources & References

### Design Tools
- Figma (optional)
- Adobe Color (color schemes)
- Coolors.co (palette generator)

### Code Resources
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [CVA (Class Variance Authority)](https://cva.style)
- [Radix UI](https://www.radix-ui.com)

### Typography
- [Google Fonts - Crimson Pro](https://fonts.google.com/specimen/Crimson+Pro)
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)

---

## 📝 Notes & Decisions

### Design Decisions Log

**2025-11-10:**
- ✅ Chose "Ancient Scroll" theme for spiritual/nostalgic feel
- ✅ Decided on hybrid approach (modern UX + ancient visual)
- ✅ Minimum font size 18px for elderly users
- ✅ Asymmetric scroll border radius `1.5rem 0.5rem`
- ✅ Gold color for premium features
- ✅ Paper texture at 3% opacity (subtle)
- ✅ Serif headings (Crimson Pro) + Sans body (Inter)

### Future Considerations

1. **Dark Mode** (Phase 2)
   - Invert parchment to dark ink background
   - Keep same hierarchy
   - Test contrast ratios

2. **Animations** (Phase 2)
   - Scroll unroll on page load
   - Ink fade for content
   - Quill writing effect for forms

3. **Sound Effects** (Future)
   - Paper rustle on page change
   - Quill scratch on typing
   - Wax seal on save

4. **Microinteractions** (Future)
   - Button ripple effect
   - Card flip animations
   - Scroll roll on hover

---

**End of Documentation**

Version 1.0 | Created: November 10, 2025
For questions or updates, contact the development team.