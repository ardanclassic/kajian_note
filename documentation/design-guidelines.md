# Kajian Note - Design Guidelines

## 🎨 Visual Style: Dark Mode with Accent Glow

**Philosophy**: Clean, professional, elegant dengan emerald glow accents. Cyberpunk aesthetic meets Islamic minimalism.

---

## 🎯 Core Design Tokens

### Colors
```css
/* Backgrounds */
bg-black              /* Main background */
bg-gray-900           /* Surface/cards */
bg-gray-800           /* Borders */

/* Primary */
text-emerald-400      /* Primary text/icons */
border-emerald-500/30 /* Subtle borders */
border-emerald-500/50 /* Active borders */

/* Glow Effects */
bg-emerald-500/10     /* Light glow */
bg-emerald-500/20     /* Medium glow */
shadow-emerald-500/20 /* Box shadow base */
shadow-emerald-500/40 /* Box shadow hover */

/* Text */
text-white            /* Headings */
text-gray-300         /* Body text */
text-gray-400         /* Secondary text */
text-gray-500         /* Muted text */
```

### Spacing
```css
/* Sections */
py-24 md:py-32        /* Section padding (consistent) */

/* Cards */
p-8                   /* Card padding */
gap-8                 /* Grid gap */
rounded-2xl           /* Border radius */

/* Buttons */
px-8 py-4            /* Primary button */
px-10 py-5           /* Hero CTA button */
```

### Grid Pattern
```css
background-image: linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px);
background-size: 80px 80px;
opacity: 0.015;      /* Very subtle */
```

---

## ✨ Component Patterns

### 1. Card Base Structure
```tsx
<div className="group relative bg-black rounded-2xl p-8 border border-gray-800 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
  {/* Glow Effect */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
  </div>
  
  {/* Content */}
  <div className="relative z-10">
    {/* Your content here */}
  </div>
  
  {/* Sharp Corner Highlights */}
  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="absolute top-0 right-0 w-px h-12 bg-gradient-to-b from-emerald-500/50 to-transparent" />
    <div className="absolute top-0 right-0 h-px w-12 bg-gradient-to-l from-emerald-500/50 to-transparent" />
  </div>
</div>
```

### 2. Primary Button
```tsx
<button className="group relative px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold border border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all overflow-hidden">
  {/* Glow on Hover */}
  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
  
  {/* Content */}
  <div className="relative flex items-center gap-2">
    {/* Button text & icon */}
  </div>
</button>
```

### 3. Secondary Button
```tsx
<button className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all">
  {/* Button text */}
</button>
```

### 4. Badge/Pill
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
  <Icon className="h-4 w-4" />
  <span>Badge Text</span>
</div>
```

### 5. Section Header
```tsx
<div className="text-center mb-20 space-y-4">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
    <Icon className="h-4 w-4" />
    Badge Text
  </div>
  
  {/* Title */}
  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
    Section Title
  </h2>
  
  {/* Subtitle */}
  <p className="text-xl text-gray-400 max-w-3xl mx-auto">
    Section description
  </p>
</div>
```

### 6. Glow Orb Background
```tsx
{/* Place in section */}
<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
<div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
```

---

## 🎬 Animation Standards

### Hover States
```css
/* Cards */
hover:-translate-y-1
transition-all duration-500

/* Buttons */
hover:scale-1.05 hover:y--2
transition-all duration-300

/* Icons */
group-hover:scale-110
transition-transform
```

### Scroll Reveals
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

### Staggered Children
```tsx
// Add delay based on index
transition={{ duration: 0.6, delay: index * 0.1 }}
```

---

## 🚫 Don'ts

- ❌ No glassmorphism (bg-white/5, backdrop-blur)
- ❌ No parallax scrolling effects
- ❌ No rotating geometric shapes
- ❌ No multiple gradient colors (stick to emerald)
- ❌ No excessive animations
- ❌ No inconsistent spacing

---

## ✅ Do's

- ✅ Always use pure black background
- ✅ Consistent emerald glow accents
- ✅ Subtle hover animations only
- ✅ Sharp corner highlights on interactive elements
- ✅ Clean borders (gray-800 base, emerald on hover)
- ✅ High contrast text for readability
- ✅ Minimal grid patterns (opacity 0.015)
- ✅ Consistent spacing (py-24, p-8, gap-8)

---

## 📱 Responsive Guidelines

```css
/* Mobile First */
text-4xl → md:text-5xl → lg:text-6xl
py-20 → md:py-32
px-4 → md:px-6 → lg:px-8
grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3
```

---

## 🎯 Quick Reference

**For any new component:**
1. Background: `bg-black`
2. Card surface: `bg-gray-900` or `bg-black`
3. Border: `border-gray-800`
4. Hover border: `hover:border-emerald-500/30`
5. Add glow: `bg-emerald-500/5 blur-xl`
6. Add corner highlights: sharp emerald lines
7. Spacing: `p-8`, `gap-8`, `rounded-2xl`
8. Animation: `hover:-translate-y-1`, `transition-all duration-500`

---

**Need help?** Reference any existing section component for implementation examples.