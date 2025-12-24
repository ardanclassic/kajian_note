/**
 * Theme Store
 * Manages theme (dark/light) and font family preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontFamily = 'inter' | 'plus-jakarta' | 'outfit' | 'poppins' | 'manrope' | 'dm-sans';

interface ThemeState {
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      fontFamily: 'inter',
      
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        // Update document data attribute
        document.documentElement.setAttribute('data-font', fontFamily);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply font on rehydration
        if (state) {
          document.documentElement.setAttribute('data-font', state.fontFamily);
        }
      },
    }
  )
);

// Font configurations
export const fontConfigs = {
  'inter': {
    name: 'Inter',
    css: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Modern, clean, geometric',
  },
  'plus-jakarta': {
    name: 'Plus Jakarta Sans',
    css: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Friendly, warm, Indonesian',
  },
  'outfit': {
    name: 'Outfit',
    css: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Bold, impactful, premium',
  },
  'poppins': {
    name: 'Poppins',
    css: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Friendly, approachable, popular',
  },
  'manrope': {
    name: 'Manrope',
    css: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Elegant, sophisticated, modern',
  },
  'dm-sans': {
    name: 'DM Sans',
    css: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    description: 'Clean, minimal, contemporary',
  },
} as const;
