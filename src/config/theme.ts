/**
 * Ancient Scroll Theme Configuration
 * Design tokens for the entire application
 */

export const scrollTheme = {
  // Color Palette - Ancient Scroll
  colors: {
    // Parchment tones
    parchment: {
      50: "#FAF6EE", // Lightest cream
      100: "#F4E8D0", // Main background
      200: "#E8D5B7", // Secondary bg
      300: "#DCC19E", // Tertiary
      400: "#D0AD85", // Darker shade
      500: "#C49A6C", // Mid tone
    },

    // Ink tones
    ink: {
      50: "#8B7355", // Light ink
      100: "#6B5744", // Faded ink
      200: "#4A3829", // Shadow ink
      300: "#2C1810", // Primary text
      400: "#1A0F08", // Darkest
    },

    // Sepia accent
    sepia: {
      50: "#B8A589",
      100: "#A89573",
      200: "#8B6F47", // Main sepia
      300: "#735A38",
      400: "#5C4729",
    },

    // Gold leaf - Premium features
    gold: {
      50: "#F4E4B7",
      100: "#E8D49F",
      200: "#C9A961", // Main gold
      300: "#B8954D",
      400: "#9A7B3E",
    },

    // Status colors (adapted to scroll theme)
    status: {
      success: "#7C9473", // Muted green
      warning: "#C9A961", // Gold
      error: "#A85848", // Muted red
      info: "#7B8FA3", // Muted blue
    },
  },

  // Typography
  typography: {
    fonts: {
      heading: '"Crimson Pro", "Crimson Text", Georgia, serif',
      body: '"Inter", system-ui, -apple-system, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },

    // Size scale (elderly-friendly, min 16px)
    sizes: {
      xs: "0.875rem", // 14px (minimal usage)
      sm: "1rem", // 16px
      base: "1.125rem", // 18px (body default)
      lg: "1.25rem", // 20px
      xl: "1.5rem", // 24px (h3)
      "2xl": "1.875rem", // 30px (h2)
      "3xl": "2.25rem", // 36px (h1)
      "4xl": "3rem", // 48px (hero)
    },

    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Spacing scale
  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Border radius (scroll-like curves)
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    full: "9999px",
    scroll: "1.5rem 0.5rem", // Custom scroll edges
  },

  // Shadows (paper-like)
  shadows: {
    paper: "0 2px 8px rgba(44, 24, 16, 0.08)",
    scroll: "0 4px 12px rgba(44, 24, 16, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    raised: "0 8px 24px rgba(44, 24, 16, 0.16)",
    deep: "0 12px 32px rgba(44, 24, 16, 0.24)",
  },

  // Animation durations
  transitions: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: "2.5rem", // 40px
        md: "3rem", // 48px
        lg: "3.5rem", // 56px
      },
      padding: {
        sm: "0.75rem 1.5rem",
        md: "1rem 2rem",
        lg: "1.25rem 2.5rem",
      },
    },

    input: {
      height: {
        sm: "2.5rem",
        md: "3rem",
        lg: "3.5rem",
      },
    },

    card: {
      padding: {
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
    },

    // Scroll-specific
    scroll: {
      edgeWidth: "2rem", // Rolled edge width
      ornamentSize: "1.5rem",
      sealSize: "4rem",
    },
  },
} as const;

// Type exports
export type ScrollTheme = typeof scrollTheme;
export type ThemeColor = keyof typeof scrollTheme.colors;
export type ThemeSize = keyof typeof scrollTheme.typography.sizes;

// Helper to get color value
export const getColor = (color: string): string => {
  const [category, shade] = color.split(".");
  const colorCategory = scrollTheme.colors[category as keyof typeof scrollTheme.colors];
  if (typeof colorCategory === "object" && shade) {
    return colorCategory[shade as keyof typeof colorCategory] || color;
  }
  return color;
};

// Export individual categories for convenience
export const { colors, typography, spacing, radius, shadows, transitions } = scrollTheme;
