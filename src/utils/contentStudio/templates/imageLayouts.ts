import { v4 as uuidv4 } from 'uuid';
import type { ImageLayoutGenerator } from './types';

export const imageLayouts: Record<string, ImageLayoutGenerator> = {
  header_illustration: ({ dimensions, palette }) => {
    // Top 30% image, bottom 70% content
    const headerHeight = dimensions.height * 0.3;
    
    return {
      elements: [
        // Placeholder for illustration
        {
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: 0, y: 0 },
          size: { width: dimensions.width, height: headerHeight },
          fill: palette.colors.secondary, // Use secondary color as placeholder
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          opacity: 0.3,
          locked: false,
          visible: true,
          zIndex: 0
        },
        // Image placeholder text/icon could go here
      ],
      contentZone: {
        x: dimensions.width * 0.1,
        y: headerHeight + (dimensions.height * 0.05),
        width: dimensions.width * 0.8,
        height: (dimensions.height * 0.65) - (dimensions.height * 0.05)
      }
    };
  },

  background_image: ({ dimensions }) => {
    return {
      elements: [
        {
          id: uuidv4(),
          type: 'image',
          src: '/placeholder-bg.jpg', // Placeholder
          position: { x: 0, y: 0 },
          size: { width: dimensions.width, height: dimensions.height },
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
          locked: true, // Background usually locked
          visible: true,
          zIndex: 0
        },
        // Overlay for readability
        {
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: 0, y: 0 },
          size: { width: dimensions.width, height: dimensions.height },
          fill: '#000000',
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          opacity: 0.5,
          locked: true,
          visible: true,
          zIndex: 1
        }
      ],
      contentZone: {
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.1,
        width: dimensions.width * 0.8,
        height: dimensions.height * 0.8
      }
    };
  },

  side_illustration: ({ dimensions, palette }) => {
    // Right side 40% image
    const sideWidth = dimensions.width * 0.4;
    
    return {
      elements: [
        {
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: dimensions.width - sideWidth, y: 0 },
          size: { width: sideWidth, height: dimensions.height },
          fill: palette.colors.secondary,
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          opacity: 0.3,
          locked: false,
          visible: true,
          zIndex: 0
        }
      ],
      contentZone: {
        x: dimensions.width * 0.05,
        y: dimensions.height * 0.1,
        width: (dimensions.width * 0.55),
        height: dimensions.height * 0.8
      }
    };
  },
  
  center_focal_illustration: ({ dimensions, palette }) => {
    // Center image with content above and below
    const imageSize = Math.min(dimensions.width, dimensions.height) * 0.4;
    
    return {
      elements: [
        {
          id: uuidv4(),
          type: 'shape',
          shapeType: 'circle',
          position: { 
            x: (dimensions.width - imageSize) / 2, 
            y: (dimensions.height - imageSize) / 2 
          },
          size: { width: imageSize, height: imageSize },
          fill: palette.colors.accent_1,
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          opacity: 0.2,
          locked: false,
          visible: true,
          zIndex: 0
        }
      ],
      // This is tricky as content is split. We'll define a safe zone that avoids the center.
      // Or maybe just define the top area for now as primary content.
      contentZone: {
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.05,
        width: dimensions.width * 0.8,
        height: (dimensions.height * 0.3) // Only top part
      }
    };
  },

  bottom_illustration: ({ dimensions, palette }) => {
    // Bottom 30% image
    const footerHeight = dimensions.height * 0.3;
    
    return {
      elements: [
        {
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: 0, y: dimensions.height - footerHeight },
          size: { width: dimensions.width, height: footerHeight },
          fill: palette.colors.secondary,
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          opacity: 0.3,
          locked: false,
          visible: true,
          zIndex: 0
        }
      ],
      contentZone: {
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.1,
        width: dimensions.width * 0.8,
        height: (dimensions.height * 0.6) - (dimensions.height * 0.05)
      }
    };
  },

  split_screen: ({ dimensions, palette }) => {
    // Top-Bottom split 50/50
    const halfHeight = dimensions.height * 0.5;
    
    return {
      elements: [
        {
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: 0, y: 0 },
          size: { width: dimensions.width, height: halfHeight },
          fill: palette.colors.primary,
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          opacity: 0.2,
          locked: false,
          visible: true,
          zIndex: 0
        },
        {
            id: uuidv4(),
            type: 'shape',
            shapeType: 'rect',
            position: { x: 0, y: halfHeight },
            size: { width: dimensions.width, height: halfHeight },
            fill: palette.colors.background,
            stroke: 'transparent',
            strokeWidth: 0,
            rotation: 0,
            opacity: 1,
            locked: true,
            visible: true,
            zIndex: -1
        }
      ],
      contentZone: {
        x: dimensions.width * 0.1,
        y: halfHeight + (dimensions.height * 0.05),
        width: dimensions.width * 0.8,
        height: halfHeight * 0.8
      }
    };
  },

  floating_illustration: ({ dimensions, palette }) => {
      // Small floating icons scattered? Or one floating element.
      // Let's assume one floating element top-right
      const size = dimensions.width * 0.25;
      
      return {
          elements: [
             {
                id: uuidv4(),
                type: 'shape',
                shapeType: 'circle',
                position: { x: dimensions.width - size - 20, y: 40 },
                size: { width: size, height: size },
                fill: palette.colors.accent_1,
                stroke: 'transparent',
                strokeWidth: 0,
                rotation: 0,
                opacity: 0.2,
                locked: false,
                visible: true,
                zIndex: 0
             } 
          ],
          contentZone: {
              x: dimensions.width * 0.1,
              y: dimensions.height * 0.25, // Start clear of the float
              width: dimensions.width * 0.8,
              height: dimensions.height * 0.65
          }
      }
  },

  text_on_shape_with_bg_illustration: ({ dimensions, palette }) => {
      // Background image + Shape for text
      return {
          elements: [
             {
              id: uuidv4(),
              type: 'shape',
              shapeType: 'rect',
              position: { x: 0, y: 0 },
              size: { width: dimensions.width, height: dimensions.height },
              fill: '#eeeeee', // Placeholder for BG image
              stroke: 'transparent',
              strokeWidth: 0,
              rotation: 0,
              opacity: 1,
              locked: true,
              visible: true,
              zIndex: 0
             },
             {
                id: uuidv4(),
                type: 'shape',
                shapeType: 'rect',
                position: { 
                    x: dimensions.width * 0.1, 
                    y: dimensions.height * 0.2 
                },
                size: { 
                    width: dimensions.width * 0.8, 
                    height: dimensions.height * 0.6 
                },
                fill: palette.colors.background,
                stroke: palette.colors.primary,
                strokeWidth: 2,
                cornerRadius: 16,
                rotation: 0,
                opacity: 0.9,
                locked: false,
                visible: true,
                zIndex: 1
             }
          ],
          contentZone: {
              x: dimensions.width * 0.15,
              y: dimensions.height * 0.25,
              width: dimensions.width * 0.7,
              height: dimensions.height * 0.5
          }
      }
  },

  icon_grid_with_text: ({ dimensions }) => {
      // Grid of icons. Text at top.
      return {
          elements: [
              // Icons would go here, maybe we place 4 circles as placeholders
          ],
          contentZone: {
              x: dimensions.width * 0.1,
              y: dimensions.height * 0.1,
              width: dimensions.width * 0.8,
              height: dimensions.height * 0.3 // Text only at top
          }
      }
  },

  illustration_behind_text: ({ dimensions, palette }) => {
       // Illustration with low opacity behind text
       const size = dimensions.width * 0.8;
       return {
           elements: [
               {
                id: uuidv4(),
                type: 'shape',
                shapeType: 'circle',
                position: { 
                    x: (dimensions.width - size) / 2, 
                    y: (dimensions.height - size) / 2 
                },
                size: { width: size, height: size },
                fill: palette.colors.primary,
                stroke: 'transparent',
                strokeWidth: 0,
                rotation: 0,
                opacity: 0.1, // Low opacity
                locked: true,
                visible: true,
                zIndex: 0
               }
           ],
           contentZone: {
               x: dimensions.width * 0.1,
               y: dimensions.height * 0.1,
               width: dimensions.width * 0.8,
               height: dimensions.height * 0.8
           }
       }
  }
};
