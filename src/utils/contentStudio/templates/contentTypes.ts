import { v4 as uuidv4 } from 'uuid';
import type { ContentTypeGenerator } from './types';

export const contentTypes: Record<string, ContentTypeGenerator> = {
  paragraph: ({ palette }, contentZone, data) => {
    // Responsive scale
    const scale = contentZone.width / 460;
    
    const titleHeight = 45 * scale;
    const spacing = 15 * scale;
    
    // Aggressive padding to prevent clipping
    const padding = 40 * scale;
    
    const elements = [];
    
    // Title
    elements.push({
      id: uuidv4(),
      type: 'text',
      position: { x: contentZone.x + padding, y: contentZone.y },
      size: { width: contentZone.width - (padding * 2), height: titleHeight },
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      content: data?.judul || 'Insert Title Here',
      fontFamily: 'Inter',
      fontSize: Math.round(28 * scale),
      fontWeight: 700,
      fontStyle: 'normal',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      fill: palette.colors.text_dark,
      metadata: { role: 'title' }
    });
    
    // Paragraph Body
    elements.push({
      id: uuidv4(),
      type: 'text',
      position: { 
        x: contentZone.x + padding, 
        y: contentZone.y + titleHeight + spacing 
      },
      size: { 
        width: contentZone.width - (padding * 2), 
        height: contentZone.height - (titleHeight + spacing) 
      },
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      content: data?.content_text || 'Write your paragraph here. Keep it concise and engaging. Break long texts into multiple slides for better readability.',
      fontFamily: 'Inter',
      fontSize: Math.round(18 * scale),
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.5,
      letterSpacing: 0,
      fill: palette.colors.text_dark,
      metadata: { role: 'content_text' }
    });
    
    return elements as any[];
  },

  content_points: ({ palette }, contentZone, data) => {
    // Responsive scale based on content zone width
    const scale = contentZone.width / 460; // Base scale on 80% of 540px
    
    const titleHeight = 50 * scale;
    const spacing = 20 * scale;
    const itemHeight = 40 * scale;
    const itemSpacing = Math.min(50 * scale, (contentZone.height - titleHeight - spacing) / Math.max((data?.content_points?.length || 3), 1));
    
    const padding = 40 * scale;
    const elements = [];
    
    // Title
    elements.push({
      id: uuidv4(),
      type: 'text',
      position: { x: contentZone.x + padding, y: contentZone.y },
      size: { width: contentZone.width - (padding * 2), height: titleHeight },
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      content: data?.judul || 'Key Points',
      fontFamily: 'Inter',
      fontSize: Math.round(28 * scale),
      fontWeight: 700,
      fontStyle: 'normal',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      fill: palette.colors.text_dark,
      metadata: { role: 'title' }
    });
    
    const points = data?.content_points || [
      '• First important point',
      '• Second key takeaway',
      '• Third detailed item'
    ];
    
    // Generate checks/points - limit to fit in content zone
    const maxPoints = Math.floor((contentZone.height - titleHeight - spacing) / itemSpacing);
    const displayPoints = points.slice(0, maxPoints);
    
    displayPoints.forEach((point: string, index: number) => {
      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { 
          x: contentZone.x + padding, 
          y: contentZone.y + titleHeight + spacing + (index * itemSpacing) 
        },
        size: { width: contentZone.width - (padding * 2), height: itemHeight },
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 2,
        content: point,
        fontFamily: 'Inter',
        fontSize: Math.round(18 * scale),
        fontWeight: 500,
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: 1.4,
        letterSpacing: 0,
        fill: palette.colors.text_dark,
        metadata: { role: 'content_point', index }
      });
    });
    
    return elements as any[];
  },

  sequential_process: ({ palette }, contentZone, data) => {
    // Responsive scale
    const scale = contentZone.width / 460;
    
    const titleHeight = 50 * scale;
    const spacing = 15 * scale;
    const padding = 40 * scale;
    const elements = [];
    
    const stages = data?.stages || [
        { stage: '1. Step One', description: 'Description of step one' },
        { stage: '2. Step Two', description: 'Description of step two' }
    ];
    
    // Calculate stage height to fit content zone
    const availableHeight = contentZone.height - titleHeight - spacing;
    const stageHeight = Math.min(80 * scale, availableHeight / Math.max(stages.length, 1));
    
    // Title
    elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x + padding, y: contentZone.y },
        size: { width: contentZone.width - (padding * 2), height: titleHeight },
        content: data?.judul || 'Process Steps',
        fontFamily: 'Inter',
        fontSize: Math.round(28 * scale),
        fontWeight: 700,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
        metadata: { role: 'title' }
    });

    // Limit stages to fit
    const maxStages = Math.floor(availableHeight / stageHeight);
    const displayStages = stages.slice(0, maxStages);

    displayStages.forEach((stage: any, index: number) => {
        const yPos = contentZone.y + titleHeight + spacing + (index * stageHeight);
        
        // Stage Title
        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x + padding, y: yPos },
            size: { width: contentZone.width - (padding * 2), height: 25 * scale },
            content: stage.stage,
            fontFamily: 'Inter',
            fontSize: Math.round(18 * scale),
            fontWeight: 700,
            fill: palette.colors.primary,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0,
            metadata: { role: 'stage_title', index }
        });

        // Stage Desc
        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x + padding, y: yPos + (30 * scale) },
            size: { width: contentZone.width - (padding * 2), height: 35 * scale },
            content: stage.description,
            fontFamily: 'Inter',
            fontSize: Math.round(14 * scale),
            fontWeight: 400,
            fill: palette.colors.text_dark,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0,
            metadata: { role: 'stage_desc', index }
        });
    });

    return elements as any[];
  },

  infographic_style: ({ palette }, contentZone, data) => {
      const scale = contentZone.width / 540;
      const elements = [];
      const titleHeight = 50 * scale;
      
      // Title
      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: contentZone.y },
        size: { width: contentZone.width, height: titleHeight },
        content: data?.judul || 'Infographic',
        fontSize: Math.round(32 * scale),
        fontWeight: 700,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
        metadata: { role: 'title' }
      });

      const items = data?.items || [
          { title: 'Item 1', description: 'Desc 1' },
          { title: 'Item 2', description: 'Desc 2' },
          { title: 'Item 3', description: 'Desc 3' },
          { title: 'Item 4', description: 'Desc 4' }
      ];

      const gap = 20 * scale;
      const colWidth = (contentZone.width - gap) / 2;
      const rowHeight = 120 * scale;
      const startY = contentZone.y + titleHeight + gap;

      items.forEach((item: any, index: number) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = contentZone.x + (col * (colWidth + gap));
          const y = startY + (row * (rowHeight + gap));

          // Card bg
          elements.push({
             id: uuidv4(),
             type: 'shape',
             shapeType: 'rect',
             position: { x, y },
             size: { width: colWidth, height: rowHeight },
             fill: palette.colors.background,
             stroke: palette.colors.secondary,
             strokeWidth: 1 * scale,
             cornerRadius: 8 * scale,
             zIndex: 1,
             rotation: 0, opacity: 1, locked: false, visible: true
          });

          // Item Title
          elements.push({
             id: uuidv4(),
             type: 'text',
             position: { x: x + (10 * scale), y: y + (10 * scale) },
             size: { width: colWidth - (20 * scale), height: 25 * scale },
             content: item.title,
             fontSize: Math.round(18 * scale),
             fontWeight: 700,
             fill: palette.colors.primary,
             zIndex: 2,
             rotation: 0, opacity: 1, locked: false, visible: true,
             fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0,
             metadata: { role: 'item_title', index }
          });

          // Item Desc
          elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: x + (10 * scale), y: y + (40 * scale) },
            size: { width: colWidth - (20 * scale), height: 60 * scale },
            content: item.description,
            fontSize: Math.round(14 * scale),
            fontWeight: 400,
            fill: palette.colors.text_dark,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
            metadata: { role: 'item_desc', index }
         });
      });

      return elements as any[];
  },

  detailed_breakdown: ({ palette }, contentZone, data) => {
      // Responsive scale
      const scale = contentZone.width / 460;
      const elements = [];
      const titleHeight = 45 * scale;
      const mainPointHeight = 35 * scale;

      // Title
      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: contentZone.y },
        size: { width: contentZone.width, height: titleHeight },
        content: data?.judul || 'Detailed Breakdown',
        fontSize: Math.round(28 * scale),
        fontWeight: 700,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
        metadata: { role: 'title' }
      });

      // Main Point
      elements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: contentZone.x, y: contentZone.y + titleHeight + (8 * scale) },
          size: { width: contentZone.width, height: mainPointHeight },
          content: data?.main_point || 'Main Concept Explanation',
          fontSize: Math.round(16 * scale),
          fontWeight: 600, 
          fontStyle: 'italic',
          fill: palette.colors.secondary,
          zIndex: 2,
          rotation: 0, opacity: 1, locked: false, visible: true,
          fontFamily: 'Inter', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
          metadata: { role: 'main_point' }
      });

      // Sections
      const sections = data?.breakdown_sections || [
          { subtitle: 'Section A', items: ['• Detail 1', '• Detail 2'] },
          { subtitle: 'Section B', items: ['• Detail 3', '• Detail 4'] }
      ];

      let currentY = contentZone.y + titleHeight + mainPointHeight + (15 * scale);
      const subtitleHeight = 25 * scale;
      const itemHeight = 20 * scale;
      const endY = contentZone.y + contentZone.height;

      sections.forEach((section: any, sIdx: number) => {
          if (currentY >= endY) return;
          
          // Subtitle
          elements.push({
              id: uuidv4(),
              type: 'text',
              position: { x: contentZone.x, y: currentY },
              size: { width: contentZone.width, height: subtitleHeight },
              content: section.subtitle,
              fontSize: Math.round(16 * scale),
              fontWeight: 700,
              fill: palette.colors.primary,
              zIndex: 2,
              rotation: 0, opacity: 1, locked: false, visible: true,
              fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0,
              metadata: { role: 'section_title', index: sIdx }
          });
          currentY += subtitleHeight + (5 * scale);

          // Items
          section.items.forEach((item: string, iIdx: number) => {
              if (currentY >= endY) return;
              elements.push({
                  id: uuidv4(),
                  type: 'text',
                  position: { x: contentZone.x + (8 * scale), y: currentY },
                  size: { width: contentZone.width - (8 * scale), height: itemHeight },
                  content: item,
                  fontSize: Math.round(14 * scale),
                  fontWeight: 400,
                  fill: palette.colors.text_dark,
                  zIndex: 2,
                  rotation: 0, opacity: 1, locked: false, visible: true,
                  fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0,
                  metadata: { role: 'section_item', sectionIndex: sIdx, itemIndex: iIdx }
              });
              currentY += itemHeight + (5 * scale);
          });
          currentY += (10 * scale);
      });

      return elements as any[];
  },

  narrative_with_points: ({ palette }, contentZone, data) => {
      // Responsive scale
      const scale = contentZone.width / 460;
      const elements = [];
      const titleHeight = 45 * scale;
      const introHeight = 70 * scale;

      // Title
      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: contentZone.y },
        size: { width: contentZone.width, height: titleHeight },
        content: data?.judul || 'Analysis',
        fontSize: Math.round(28 * scale),
        fontWeight: 700,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
        metadata: { role: 'title' }
      });

      // Intro
      const introText = data?.intro_text || 'This is an introductory narrative that explains the context before listing the key points below.';
      elements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: contentZone.x, y: contentZone.y + titleHeight + (8 * scale) },
          size: { width: contentZone.width, height: introHeight },
          content: introText,
          fontSize: Math.round(16 * scale),
          fontWeight: 400,
          fill: palette.colors.text_dark,
          zIndex: 2,
          rotation: 0, opacity: 1, locked: false, visible: true,
          fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
          metadata: { role: 'intro_text' }
      });

      // Points
      const points = data?.content_points || ['• Point 1', '• Point 2', '• Point 3'];
      let currentY = contentZone.y + titleHeight + introHeight + (15 * scale);
      
      const availableHeight = contentZone.height - titleHeight - introHeight - (20 * scale);
      const pointHeight = 25 * scale;
      const pointSpacing = Math.min(30 * scale, availableHeight / Math.max(points.length, 1));
      const maxPoints = Math.floor(availableHeight / pointSpacing);
      const displayPoints = points.slice(0, maxPoints);

      displayPoints.forEach((point: string, index: number) => {
          elements.push({
              id: uuidv4(),
              type: 'text',
              position: { x: contentZone.x + (8 * scale), y: currentY },
              size: { width: contentZone.width - (8 * scale), height: pointHeight },
              content: point,
              fontSize: Math.round(15 * scale),
              fontWeight: 500,
              fill: palette.colors.primary,
              zIndex: 2,
              rotation: 0, opacity: 1, locked: false, visible: true,
              fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0,
              metadata: { role: 'content_point', index }
          });
          currentY += pointSpacing;
      });

      return elements as any[];
  },

  practical_checklist: ({ palette }, contentZone, data) => {
      // Responsive scale
      const scale = contentZone.width / 460;
      const elements = [];
      const titleHeight = 45 * scale;
      const checkboxSize = 16 * scale;
      const itemHeight = 30 * scale;

      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: contentZone.y },
        size: { width: contentZone.width, height: titleHeight },
        content: data?.judul || 'Checklist',
        fontSize: Math.round(28 * scale),
        fontWeight: 700,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
        metadata: { role: 'title' }
      });

      const items = data?.checklist_items || ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      
      // Calculate how many items fit
      const availableHeight = contentZone.height - titleHeight - (15 * scale);
      const itemSpacing = Math.min(35 * scale, availableHeight / Math.max(items.length, 1));
      const maxItems = Math.floor(availableHeight / itemSpacing);
      const displayItems = items.slice(0, maxItems);
      
      let currentY = contentZone.y + titleHeight + (15 * scale);

      displayItems.forEach((item: string, index: number) => {
          // Checkbox square
          elements.push({
            id: uuidv4(),
            type: 'shape',
            shapeType: 'rect',
            position: { x: contentZone.x, y: currentY + (4 * scale) },
            size: { width: checkboxSize, height: checkboxSize },
            fill: 'transparent',
            stroke: palette.colors.primary,
            strokeWidth: 2 * scale,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true
          });

          // Text
          elements.push({
              id: uuidv4(),
              type: 'text',
              position: { x: contentZone.x + checkboxSize + (12 * scale), y: currentY },
              size: { width: contentZone.width - checkboxSize - (12 * scale), height: itemHeight },
              content: item,
              fontSize: Math.round(16 * scale),
              fontWeight: 400,
              fill: palette.colors.text_dark,
              zIndex: 2,
              rotation: 0, opacity: 1, locked: false, visible: true,
              fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.3, letterSpacing: 0,
              metadata: { role: 'checklist_item', index }
          });
          currentY += itemSpacing;
      });

      return elements as any[];
  },

  definition_box: ({ palette }, contentZone, data) => {
      // Consistent scale - use 460 as base like other generators
      const scale = contentZone.width / 460;
      const elements = [];
      const titleHeight = 40 * scale;
      const padding = 15 * scale;

      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: contentZone.y },
        size: { width: contentZone.width, height: titleHeight },
        content: data?.judul || 'Definition',
        fontSize: Math.round(24 * scale),
        fontWeight: 700,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
        metadata: { role: 'title' }
      });

      const boxY = contentZone.y + titleHeight + padding;
      // Make box height responsive to available space
      const availableHeight = contentZone.height - titleHeight - padding;
      const boxHeight = Math.min(180 * scale, availableHeight);
      const innerPadding = 12 * scale;

      elements.push({
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: contentZone.x, y: boxY },
          size: { width: contentZone.width, height: boxHeight },
          fill: palette.colors.background,
          stroke: palette.colors.primary,
          strokeWidth: 2 * scale,
          cornerRadius: 10 * scale,
          zIndex: 1,
          rotation: 0, opacity: 1, locked: false, visible: true
      });

      elements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: contentZone.x + innerPadding, y: boxY + innerPadding },
          size: { width: contentZone.width - (innerPadding * 2), height: 30 * scale },
          content: data?.term || data?.judul || 'TERM NAME',
          fontSize: Math.round(18 * scale),
          fontWeight: 800,
          fill: palette.colors.primary,
          zIndex: 2,
          rotation: 0, opacity: 1, locked: false, visible: true,
          fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0,
          metadata: { role: 'term' }
      });

      const definitionY = boxY + innerPadding + (35 * scale);
      const definitionHeight = boxHeight - innerPadding - (40 * scale);

      elements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: contentZone.x + innerPadding, y: definitionY },
          size: { width: contentZone.width - (innerPadding * 2), height: definitionHeight },
          content: data?.definition || data?.content_text || 'The explicit explanation of the term goes here.',
          fontSize: Math.round(14 * scale),
          fontWeight: 400,
          fill: palette.colors.text_dark,
          zIndex: 2,
          rotation: 0, opacity: 1, locked: false, visible: true,
          fontFamily: 'Inter', fontStyle: 'italic', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
          metadata: { role: 'definition' }
      });

      return elements as any[];
  },

  myth_vs_fact: ({ palette }, contentZone, data) => {
      // Responsive scale
      const scale = contentZone.width / 460;
      const elements = [];
      const labelHeight = 25 * scale;
      const contentHeight = contentZone.height * 0.35;
      const midY = contentZone.y + contentZone.height / 2;
      
      // MYTH Section (Top)
      elements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: contentZone.x, y: contentZone.y },
          size: { width: contentZone.width, height: labelHeight },
          content: '❌ MYTH',
          fontSize: Math.round(20 * scale),
          fontWeight: 800,
          fill: '#EF4444',
          zIndex: 2,
          rotation: 0, opacity: 1, locked: false, visible: true,
          fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 1,
          metadata: { role: 'myth_label' }
      });

      elements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: contentZone.x, y: contentZone.y + labelHeight + (10 * scale) },
          size: { width: contentZone.width, height: contentHeight },
          content: data?.myth || 'Common misunderstanding goes here.',
          fontSize: Math.round(16 * scale),
          fontWeight: 400,
          fill: palette.colors.text_dark,
          zIndex: 2,
          rotation: 0, opacity: 1, locked: false, visible: true,
          fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
          metadata: { role: 'myth_content' }
      });

      // Divider
      elements.push({
          id: uuidv4(),
          type: 'shape',
          shapeType: 'rect',
          position: { x: contentZone.x, y: midY - (10 * scale) },
          size: { width: contentZone.width, height: 2 * scale },
          fill: palette.colors.secondary,
          stroke: 'transparent',
          strokeWidth: 0,
          zIndex: 1,
          rotation: 0, opacity: 0.5, locked: false, visible: true
      });

      // FACT Section (Bottom)
      elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: midY + (5 * scale) },
        size: { width: contentZone.width, height: labelHeight },
        content: '✅ FACT',
        fontSize: Math.round(20 * scale),
        fontWeight: 800,
        fill: '#10B981',
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 1,
        metadata: { role: 'fact_label' }
    });

    elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: contentZone.x, y: midY + labelHeight + (15 * scale) },
        size: { width: contentZone.width, height: contentHeight },
        content: data?.fact || 'The actual truth explained clearly here.',
        fontSize: Math.round(16 * scale),
        fontWeight: 400,
        fill: palette.colors.text_dark,
        zIndex: 2,
        rotation: 0, opacity: 1, locked: false, visible: true,
        fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
        metadata: { role: 'fact_content' }
    });

      return elements as any[];
  },

  misconception_clarification: ({ palette }, contentZone, data) => {
       // Responsive scale
       const scale = contentZone.width / 460;
       const elements = [];
       const titleHeight = 45 * scale;
       const labelHeight = 25 * scale;
       const contentSectionHeight = (contentZone.height - titleHeight) * 0.35;
       const midY = contentZone.y + titleHeight + (contentZone.height - titleHeight) / 2;

        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x, y: contentZone.y },
            size: { width: contentZone.width, height: titleHeight },
            content: data?.judul || 'Clarification',
            fontSize: Math.round(28 * scale),
            fontWeight: 700,
            fill: palette.colors.text_dark,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'center', lineHeight: 1.2, letterSpacing: 0,
            metadata: { role: 'title' }
        });

        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x, y: contentZone.y + titleHeight + (10 * scale) },
            size: { width: contentZone.width, height: labelHeight },
            content: '🤔 Misconception:',
            fontSize: Math.round(16 * scale),
            fontWeight: 700,
            fill: '#F59E0B',
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0,
            metadata: { role: 'misconception_label' }
        });

        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x, y: contentZone.y + titleHeight + labelHeight + (15 * scale) },
            size: { width: contentZone.width, height: contentSectionHeight },
            content: data?.misconception || 'What people usually think...',
            fontSize: Math.round(15 * scale),
            fontWeight: 400,
            fill: palette.colors.text_dark,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
            metadata: { role: 'misconception_content' }
        });

        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x, y: midY + (5 * scale) },
            size: { width: contentZone.width, height: labelHeight },
            content: '💡 Clarification:',
            fontSize: Math.round(16 * scale),
            fontWeight: 700,
            fill: palette.colors.primary,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.2, letterSpacing: 0,
            metadata: { role: 'clarification_label' }
        });

        elements.push({
            id: uuidv4(),
            type: 'text',
            position: { x: contentZone.x, y: midY + labelHeight + (10 * scale) },
            size: { width: contentZone.width, height: contentSectionHeight },
            content: data?.clarification || 'The correct explanation that clarifies the confusion.',
            fontSize: Math.round(15 * scale),
            fontWeight: 400,
            fill: palette.colors.text_dark,
            zIndex: 2,
            rotation: 0, opacity: 1, locked: false, visible: true,
            fontFamily: 'Inter', fontStyle: 'normal', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0,
            metadata: { role: 'clarification_content' }
        });

      return elements as any[];
  }
};
