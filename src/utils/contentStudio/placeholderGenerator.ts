/**
 * Generates a professional SVG placeholder string (Data URL).
 * Used for Image Elements when no image is provided or URL is invalid.
 */
export const generatePlaceholderSvg = (width: number, height: number): string => {
  const w = Math.ceil(width);
  const h = Math.ceil(height);
  const minDim = Math.min(w, h);
  const iconSize = Math.max(56, minDim * 0.22);
  const fontSize = Math.max(13, minDim * 0.065);
  const cornerRadius = Math.min(16, minDim * 0.04);

  // Bright Slate Color Palette - Clear visibility on dark backgrounds
  const bgFill = "#334155"; // Slate 700 - Visible background
  const borderColor = "#64748B"; // Slate 500 - Clear border
  const iconBgColor = "#475569"; // Slate 600 - Icon background circle
  const iconStroke = "#94A3B8"; // Slate 400 - Bright icon outline
  const textColor = "#CBD5E1"; // Slate 300 - Bright, readable text

  // Professional SVG with Transparency, Smooth Borders & Refined Icon
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.15"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Transparent background with subtle tint -->
  <rect width="100%" height="100%" fill="${bgFill}" rx="${cornerRadius}"/>
  
  <!-- Smooth solid border -->
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${
    cornerRadius - 1
  }" fill="none" stroke="${borderColor}" stroke-width="1.5"/>
  
  <!-- Centered content group -->
  <g transform="translate(${w / 2}, ${h / 2})">
    <!-- Icon background circle with subtle shadow -->
    <circle cx="0" cy="-${fontSize * 0.5}" r="${iconSize * 0.55}" fill="${iconBgColor}" filter="url(#softShadow)"/>
    
    <!-- Image icon -->
    <g transform="translate(-${iconSize / 2}, -${iconSize / 2 + fontSize * 0.5})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconStroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2.5" ry="2.5"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="${iconStroke}"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </g>
    
    <!-- Text label -->
    <text x="0" y="${
      iconSize * 0.55 + fontSize * 1.2
    }" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${fontSize}" font-weight="500" fill="${textColor}" letter-spacing="0.3">
      Image Placeholder
    </text>
  </g>
</svg>
  `
    .trim()
    .replace(/\s+/g, " ");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
