# Frontend PDF Export Documentation

## Overview

Native browser PDF export untuk Vite + React + TypeScript + Tailwind. Zero dependencies. Text selectable & searchable seperti Notion. **Optimized untuk mobile users.**

**How it works:**
```
HTML + CSS (@media print) → Browser Print Engine → Vector PDF
```

**Benefits:**
- ✅ Text selectable/searchable/copyable
- ✅ Small file size
- ✅ Perfect quality (vector)
- ✅ No dependencies
- ✅ Works offline
- ✅ **Mobile-optimized styling** (smartphone-first)

---

## Quick Start

### 1. Setup CSS

Import `print.css` (see separate css file):
```typescript
// main.tsx
import './styles/print.css';
```

### 2. Basic Implementation

```tsx
// NoteViewer.tsx
export const NoteViewer = () => {
  return (
    <div>
      <div className="no-print">
        <button onClick={() => window.print()}>
          Export PDF
        </button>
      </div>

      <div className="printable-content">
        <h1>Document Title</h1>
        <p>Your content...</p>
      </div>
    </div>
  );
};
```

### 3. Done!

Press button → Print dialog → Save as PDF

---

## Core Implementation

### Export Function

```typescript
// utils/printUtils.ts
export const exportToPDF = (title?: string) => {
  if (title) {
    const original = document.title;
    document.title = title;
    window.print();
    document.title = original;
  } else {
    window.print();
  }
};
```

### Custom Hook

```typescript
// hooks/usePrint.ts
import { useState, useCallback } from 'react';

export const usePrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback((title?: string) => {
    setIsPrinting(true);
    
    if (title) {
      const original = document.title;
      document.title = title;
      setTimeout(() => {
        window.print();
        document.title = original;
        setIsPrinting(false);
      }, 100);
    } else {
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
    }
  }, []);

  return { handlePrint, isPrinting };
};

// Usage
const { handlePrint, isPrinting } = usePrint();
<button onClick={() => handlePrint('My Doc')}>
  {isPrinting ? 'Preparing...' : 'Export'}
</button>
```

---

## Tailwind Integration

### Print Utilities (Built-in)

```tsx
{/* Hide on print */}
<button className="print:hidden">Edit</button>

{/* Show only on print */}
<div className="hidden print:block">Exported at {date}</div>

{/* Different styles */}
<article className="
  px-8 bg-gray-50 shadow-xl rounded-xl
  print:px-0 print:bg-white print:shadow-none print:rounded-none
">
  <h1 className="text-4xl text-blue-300 print:text-2xl print:text-black">
    Title
  </h1>
</article>
```

---

## Content Optimization

### Images

```tsx
<img 
  src={url}
  className="rounded-lg shadow-xl print:rounded-none print:shadow-none"
  style={{ pageBreakInside: 'avoid' }}
/>
```

### Code Blocks

```tsx
<pre className="
  bg-gray-900 text-gray-100 rounded-lg p-4
  print:bg-gray-50 print:text-black print:border print:rounded-none
"
style={{ pageBreakInside: 'avoid' }}>
  <code>{code}</code>
</pre>
```

### Tables

```tsx
<table className="w-full border-collapse print:text-[10pt]">
  <thead>
    <tr className="bg-gray-100 print:bg-gray-50">
      <th className="border p-2 print:border-black">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr style={{ pageBreakInside: 'avoid' }}>
      <td className="border p-2 print:border-black">Data</td>
    </tr>
  </tbody>
</table>
```

---

## Mobile Optimization (Primary Focus)

### Why Mobile Matters

User membaca di handphone → Export PDF → PDF tetap readable di screen kecil.

**Problem:** Desktop PDF styling tidak cocok untuk mobile reading  
**Solution:** Dual styling - different untuk screen vs print

### Responsive Screen + Mobile-Optimized PDF

```tsx
<article className="
  /* Screen: Responsive untuk berbagai device */
  px-4 md:px-8
  text-base md:text-lg
  
  /* Print: Fixed, optimized untuk PDF di mobile */
  print:px-0
  print:text-[11pt]
">
  <h1 className="
    text-3xl md:text-5xl
    print:text-[18pt]
  ">
    Mobile-friendly Title
  </h1>
</article>
```

### Mobile Print Detection

```typescript
// hooks/useMobilePrint.ts
import { useEffect, useState } from 'react';

export const useMobilePrint = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    check();
  }, []);

  const handlePrint = () => {
    if (isMobile) {
      // Mobile: add delay untuk smooth UX
      setTimeout(() => window.print(), 150);
    } else {
      window.print();
    }
  };

  return { handlePrint, isMobile };
};

// Usage
const { handlePrint, isMobile } = useMobilePrint();

<button onClick={handlePrint}>
  Export PDF {isMobile && '📱'}
</button>
```

### Mobile-Specific Styling

**print.css sudah include:**
```css
@media print and (max-width: 600px) {
  html { font-size: 10pt; }        /* Smaller base */
  h1 { font-size: 18pt; }          /* Readable headings */
  h2 { font-size: 15pt; }
  @page { margin: 10mm 8mm; }      /* Tighter margins */
  table { font-size: 9pt; }        /* Compact tables */
  code, pre { font-size: 8pt; }    /* Smaller code */
}
```

### Screen vs Print Strategy

| Element | Screen (Mobile) | Print (PDF) |
|---------|----------------|-------------|
| Font size | Responsive (rem) | Fixed (pt) |
| Padding | Touch-friendly | Minimal |
| Colors | Vibrant | High contrast |
| Layout | Fluid | A4 fixed |
| Images | Optimized | Full quality |

### Example: Mobile-First Component

```tsx
export const MobileOptimizedNote = () => {
  const { handlePrint, isMobile } = useMobilePrint();
  
  return (
    <div>
      {/* Mobile-friendly controls */}
      <div className="no-print sticky top-0 bg-white p-4 border-b">
        <button 
          onClick={handlePrint}
          className="w-full sm:w-auto px-4 py-3 text-lg"
        >
          {isMobile ? '📱 Export PDF' : '🖨️ Export PDF'}
        </button>
      </div>

      {/* Content: responsive screen, optimized print */}
      <article className="
        printable-content
        
        /* Screen: mobile-first */
        px-4 py-6
        sm:px-6 sm:py-8
        md:px-8 md:py-10
        
        /* Print: A4 optimized */
        print:px-0 print:py-0
      ">
        <h1 className="
          text-2xl sm:text-3xl md:text-4xl
          print:text-[18pt]
        ">
          Title readable di mobile & PDF
        </h1>
        
        <p className="
          text-base sm:text-lg
          print:text-[11pt]
          leading-relaxed
          print:leading-normal
        ">
          Content yang nyaman dibaca di smartphone
          dan tetap perfect di PDF export.
        </p>
      </article>
    </div>
  );
};
```

### Mobile Testing Critical

```bash
# Test di actual devices:
✓ iPhone Safari (iOS)
✓ Android Chrome
✓ Test portrait & landscape
✓ Test small screens (< 375px)
✓ Verify PDF readable di mobile
```

---

## Advanced Features

### Print Preview

```tsx
const [preview, setPreview] = useState(false);

return preview ? (
  <div className="fixed inset-0 bg-white z-50 overflow-auto">
    <div className="no-print p-4 border-b">
      <button onClick={() => window.print()}>Print</button>
      <button onClick={() => setPreview(false)}>Close</button>
    </div>
    <div className="printable-content max-w-[210mm] mx-auto p-8">
      {content}
    </div>
  </div>
) : (
  <button onClick={() => setPreview(true)}>Preview</button>
);
```

### Print Events

```typescript
useEffect(() => {
  const before = () => console.log('Printing...');
  const after = () => console.log('Done');
  
  window.addEventListener('beforeprint', before);
  window.addEventListener('afterprint', after);
  
  return () => {
    window.removeEventListener('beforeprint', before);
    window.removeEventListener('afterprint', after);
  };
}, []);
```

### Keyboard Shortcut

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  };
  
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Text tidak selectable | Pastikan pakai `window.print()`, bukan html2canvas |
| Page break di tengah | Add `style={{ pageBreakInside: 'avoid' }}` |
| Background tidak muncul | User enable "Background graphics" di print dialog |
| Font terlalu kecil | Edit `font-size` di print.css `@media print` |
| Margins terlalu besar | Edit `@page { margin: ... }` di print.css |
| Content terpotong | Set `.printable-content { width: 100% !important; }` |

---

## Testing Checklist

**Browsers:**
- [ ] Chrome/Edge (Ctrl/Cmd+P)
- [ ] Firefox
- [ ] Safari
- [ ] **iOS Safari (iPhone/iPad)** ⭐
- [ ] **Android Chrome** ⭐

**Content:**
- [ ] Short (1 page)
- [ ] Long (20+ pages)
- [ ] With images
- [ ] With tables
- [ ] With code blocks

**Quality:**
- [ ] Text selectable ✓
- [ ] Text searchable ✓
- [ ] No cut-off content
- [ ] Page breaks logical
- [ ] Page numbers visible
- [ ] **Readable di mobile screen** ⭐

---

## Best Practices

**DO:**
- Use `window.print()` for native rendering
- Test di multiple browsers
- Use `.no-print` for controls
- Set meaningful document title
- Add keyboard shortcut
- Test text selection in PDF

**DON'T:**
- Use html2canvas (text jadi image)
- Use fonts < 9pt
- Use absolute positioning
- Forget to test pagination

---

## Quick Reference

```typescript
// Trigger print
window.print();

// Hide in PDF
<div className="no-print">...</div>

// Show only in PDF
<div className="hidden print:block">...</div>

// Keep together
<div style={{ pageBreakInside: 'avoid' }}>...</div>

// Force page break
<div style={{ pageBreakAfter: 'always' }}>...</div>

// Set filename
document.title = "My Doc";
window.print();
```

---

## Complete Example

```tsx
// DocumentExporter.tsx
import { useState } from 'react';

export const DocumentExporter = ({ title, children }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handleExport = () => {
    setIsPrinting(true);
    const original = document.title;
    document.title = title;
    
    setTimeout(() => {
      window.print();
      document.title = original;
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div>
      <div className="no-print mb-4">
        <button
          onClick={handleExport}
          disabled={isPrinting}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {isPrinting ? 'Preparing...' : 'Export PDF'}
        </button>
      </div>

      <article className="printable-content">
        {children}
      </article>
    </div>
  );
};
```

---

**That's it!** Native browser print API adalah solusi terbaik. Simple, powerful, hasil sempurna.