import { FabricObject, Textbox, Rect, Circle, FabricImage, Triangle, Group } from "fabric";
import type { CanvasElement, TextElement, ShapeElement, ImageElement } from "@/types/contentStudio.types";

// Canva-like selection controls
export const CONTROL_DEFAULTS = {
  transparentCorners: false,
  cornerColor: "#3B82F6",
  cornerStrokeColor: "#ffffff",
  borderColor: "#3B82F6",
  cornerSize: 10,
  padding: 8,
  cornerStyle: "circle" as "circle",
  borderDashArray: [4, 4],
  borderScaleFactor: 2,
};

// Helper: Create shape with text overlay
const createShapeWithText = (shape: FabricObject, shapeEl: ShapeElement): FabricObject => {
  // Reset shape to origin for grouping
  shape.set({
    left: 0,
    top: 0,
    originX: "center",
    originY: "center",
  });

  if (!shapeEl.textContent) {
    // No text, return shape as-is but restore original position AND ORIGIN
    shape.set({
      left: shapeEl.position.x,
      top: shapeEl.position.y,
      originX: "left", // Reset to default origin
      originY: "top", // Reset to default origin
      angle: shapeEl.rotation,
      opacity: shapeEl.opacity,
    });
    return shape;
  }

  // Create textbox for shape text
  const textbox = new Textbox(shapeEl.textContent || "", {
    fontSize: shapeEl.textFontSize || 16,
    fontFamily: shapeEl.textFontFamily || "Inter",
    fontWeight: shapeEl.textFontWeight || 400,
    fill: shapeEl.textFill || "#ffffff",
    textAlign: shapeEl.textAlign || "center",
    width: shapeEl.size.width - 6, // Padding from edges (3px per side)
    originX: "center",
    originY: "center",
    left: 0,
    top: 0,
    selectable: false, // Text is not individually selectable
    evented: false,
    breakWords: true, // Force wrapping for long words
    splitByGrapheme: true, // Ensure continuous strings wrap
  });

  // Create group with shape and text
  const group = new Group([shape, textbox], {
    left: shapeEl.position.x,
    top: shapeEl.position.y,
    angle: shapeEl.rotation,
    opacity: shapeEl.opacity,
    ...CONTROL_DEFAULTS,
  });

  return group;
};

export const createFabricObject = async (element: CanvasElement): Promise<FabricObject | null> => {
  switch (element.type) {
    case "text":
      const textEl = element as TextElement;
      return new Textbox(
        textEl.textTransform === "uppercase" ? (textEl.content || "").toUpperCase() : textEl.content || "",
        {
          left: textEl.position.x,
          top: textEl.position.y,
          width: textEl.size.width,
          angle: textEl.rotation,
          fontSize: textEl.fontSize,
          fontFamily: textEl.fontFamily,
          fontWeight: textEl.fontWeight,
          fontStyle: textEl.fontStyle,
          fill: textEl.fill,
          textAlign: textEl.textAlign,
          opacity: textEl.opacity,
          lineHeight: textEl.lineHeight,
          charSpacing: (textEl.letterSpacing || 0) * 1000,
          // Map textDecoration to fabric boolean
          underline: textEl.textDecoration === "underline",
          linethrough: textEl.textDecoration === "line-through",

          scaleX: 1,
          scaleY: 1,
          // Common props
          lockScalingFlip: true,
          objectCaching: false, // Better for text editing
          splitByGrapheme: false,
          breakWords: true, // Force wrapping if words exceed width
          ...CONTROL_DEFAULTS,
        }
      );

    case "shape":
      const shapeEl = element as ShapeElement;
      if (shapeEl.shapeType === "rect") {
        const rect = new Rect({
          left: shapeEl.position.x,
          top: shapeEl.position.y,
          width: shapeEl.size.width,
          height: shapeEl.size.height,
          angle: shapeEl.rotation,
          fill: shapeEl.fill,
          stroke: shapeEl.stroke,
          strokeWidth: shapeEl.strokeWidth,
          strokeDashArray: shapeEl.strokeDashArray || undefined,
          opacity: shapeEl.opacity,
          rx: shapeEl.cornerRadius || 0,
          ry: shapeEl.cornerRadius || 0,
          ...CONTROL_DEFAULTS,
        });
        return createShapeWithText(rect, shapeEl);
      } else if (shapeEl.shapeType === "circle") {
        const circle = new Circle({
          left: shapeEl.position.x,
          top: shapeEl.position.y,
          radius: shapeEl.size.width / 2,
          angle: shapeEl.rotation,
          fill: shapeEl.fill,
          stroke: shapeEl.stroke,
          strokeWidth: shapeEl.strokeWidth,
          strokeDashArray: shapeEl.strokeDashArray || undefined,
          opacity: shapeEl.opacity,
          ...CONTROL_DEFAULTS,
        });
        return createShapeWithText(circle, shapeEl);
      } else if (shapeEl.shapeType === "triangle") {
        const triangle = new Triangle({
          left: shapeEl.position.x,
          top: shapeEl.position.y,
          width: shapeEl.size.width,
          height: shapeEl.size.height,
          angle: shapeEl.rotation,
          fill: shapeEl.fill,
          stroke: shapeEl.stroke,
          strokeWidth: shapeEl.strokeWidth,
          strokeDashArray: shapeEl.strokeDashArray || undefined,
          opacity: shapeEl.opacity,
          ...CONTROL_DEFAULTS,
        });
        return createShapeWithText(triangle, shapeEl);
      } else if (shapeEl.shapeType === "line") {
        // Line creation requires more specific handling usually (x1, y1, x2, y2)
        return new Rect({
          // Fallback
          left: shapeEl.position.x,
          top: shapeEl.position.y,
          width: shapeEl.size.width,
          height: shapeEl.strokeWidth || 2,
          angle: shapeEl.rotation,
          fill: shapeEl.stroke,
          opacity: shapeEl.opacity,
          ...CONTROL_DEFAULTS,
        });
      }
      return null;

    case "image":
      const imgEl = element as ImageElement;
      try {
        return new Promise<FabricObject | null>((resolve) => {
          const imgTag = document.createElement("img");
          imgTag.crossOrigin = "anonymous"; // CRITICAL: Prevent canvas tainting
          imgTag.onload = () => {
            // Create FabricImage from the loaded img tag
            const img = new FabricImage(imgTag, {
              left: imgEl.position.x,
              top: imgEl.position.y,
              angle: imgEl.rotation,
              opacity: imgEl.opacity,
              scaleX: imgEl.scaleX || 1,
              scaleY: imgEl.scaleY || 1,
              objectCaching: false,
              ...CONTROL_DEFAULTS,
            });

            if (imgEl.cornerRadius && imgEl.cornerRadius > 0) {
              const w = img.width || 0;
              const h = img.height || 0;
              // Apply clipPath for corner radius
              // We divide by scale to maintain visual size of radius despite scaling
              img.clipPath = new Rect({
                left: -w / 2,
                top: -h / 2,
                width: w,
                height: h,
                rx: imgEl.cornerRadius / (imgEl.scaleX || 1),
                ry: imgEl.cornerRadius / (imgEl.scaleY || 1),
              });
            }

            resolve(img);
          };
          imgTag.onerror = (e) => {
            console.error("Error loading image source:", e);
            resolve(null);
          };
          imgTag.src = imgEl.src;
        });
      } catch (err) {
        console.error("Error creating fabric image:", err);
        return null;
      }

    default:
      return null;
  }
};

// Track loaded fonts globally to avoid duplicated requests
const fontLoadingSet = new Set<string>();

export const loadFont = (fontFamily: string, fontWeight: number = 400): Promise<void> => {
  if (!fontFamily || fontFamily === "Arial" || fontFamily === "sans-serif") {
    return Promise.resolve();
  }
  // Cache key includes weight
  const fontKey = `${fontFamily.replace(/\s+/g, "-").toLowerCase()}-${fontWeight}`;

  if (fontLoadingSet.has(fontKey)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    // Inject CSS link (one per family)
    const linkId = `font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
        /\s+/g,
        "+"
      )}:wght@400;500;600;700;800;900&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    const markLoaded = () => {
      fontLoadingSet.add(fontKey);
      resolve();
    };

    if ("fonts" in document) {
      const fontSpec = `${fontWeight} 24px "${fontFamily}"`;
      const fallbackSpec = `24px "${fontFamily}"`;

      document.fonts
        .load(fontSpec)
        .then(() => {
          if (document.fonts.check(fontSpec)) {
            markLoaded();
          } else {
            return document.fonts.load(fallbackSpec).then(() => {
              markLoaded();
            });
          }
        })
        .catch(() => {
          document.fonts
            .load(fallbackSpec)
            .then(() => markLoaded())
            .catch(() => {
              setTimeout(markLoaded, 200);
            });
        });
    } else {
      setTimeout(markLoaded, 500);
    }
  });
};
