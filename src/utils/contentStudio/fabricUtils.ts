import {
  FabricObject,
  Textbox,
  Rect,
  Circle,
  FabricImage,
  Triangle,
  Group,
  Line,
  Control,
  controlsUtils,
  Gradient, // Added import
} from "fabric";
import type { CanvasElement, TextElement, ShapeElement, ImageElement, GradientFill } from "@/types/contentStudio.types";

// Helper: Convert GradientFill object to Fabric Gradient
const createGradient = (fill: string | GradientFill): string | Gradient<"linear"> => {
  if (typeof fill === "string") return fill;

  // Calculate coords based on angle (0-360)
  // We assume a percentage based gradient (0-1) relative to object
  const angleRad = (fill.angle || 0) * (Math.PI / 180);

  // Center point is 0.5, 0.5. We move outwards by 0.5 in direction of angle
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Fabric Gradient coords are x1,y1 -> x2,y2
  // We want the vector to pass through center.
  // Start point
  const x1 = 0.5 - cos * 0.5;
  const y1 = 0.5 - sin * 0.5;
  // End point
  const x2 = 0.5 + cos * 0.5;
  const y2 = 0.5 + sin * 0.5;

  return new Gradient({
    type: "linear",
    gradientUnits: "percentage",
    coords: { x1, y1, x2, y2 },
    colorStops: [
      { offset: 0, color: fill.startColor },
      { offset: 1, color: fill.endColor },
    ],
  });
};

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

const createLineWithMarkers = (lineEl: ShapeElement): FabricObject => {
  const { width } = lineEl.size;
  const strokeWidth = lineEl.strokeWidth || 2;
  const strokeColor = lineEl.stroke || "#000000";

  // APPROACH: Use fabric.Line with strokeUniform: true
  // This supports strokeDashArray properly (unlike Rect border) and handles scaling natively.
  // We define the line as horizontal from (0,0) to (width,0) and center it.
  const line = new Line([0, 0, width, 0], {
    left: lineEl.position.x,
    top: lineEl.position.y,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    strokeDashArray: lineEl.strokeDashArray || undefined,
    strokeLineCap: "round", // Better looking ends

    angle: lineEl.rotation,
    opacity: lineEl.opacity,
    originX: "center",
    originY: "center",

    // Stable scaling properties
    strokeUniform: true, // Vital: keeps stroke width and dash array constant during scaling
    lockScalingY: true, // Prevent thickening (use strokeWidth property instead)
    lockScalingX: false, // Allow length resizing via scaling
    lockSkewingX: true,
    lockSkewingY: true,

    // Initial state
    scaleX: 1,
    scaleY: 1,

    ...CONTROL_DEFAULTS,
    // Fix cropping issues for custom rendered markers
    objectCaching: false,
    padding: 16, // Increased padding to clear markers
  });

  // Store marker config
  (line as any).lineStartMarker = lineEl.lineStart;
  (line as any).lineEndMarker = lineEl.lineEnd;
  (line as any).originalStrokeWidth = strokeWidth;

  // Configure Controls: Only allow length resizing and rotation
  line.setControlsVisibility({
    tl: false,
    tr: false,
    bl: false,
    br: false,
    mt: false,
    mb: false,
    ml: true, // Left Resize
    mr: true, // Right Resize
    mtr: true, // Rotation
  });

  // Override render to draw markers
  const originalRender = line._render.bind(line);
  line._render = function (ctx: CanvasRenderingContext2D) {
    originalRender(ctx); // Draw the line

    const lineStartMarker = (this as any).lineStartMarker;
    const lineEndMarker = (this as any).lineEndMarker;

    // Geometry
    const halfWidth = (this.width || 0) / 2;
    const baseThickness = (this as any).strokeWidth || 2;

    const sX = this.scaleX || 1;
    const sY = this.scaleY || 1;

    // Marker size
    const mSize = Math.max(10, baseThickness * 3);

    // Un-scale factors (markers should stay constant size visually)
    const invSX = 1 / sX;
    const invSY = 1 / sY;

    ctx.save();
    ctx.fillStyle = this.stroke as string; // Markers match stroke color

    if (lineStartMarker && lineStartMarker !== "none") {
      ctx.save();
      ctx.translate(-halfWidth, 0); // Left end
      ctx.scale(invSX, invSY);
      ctx.rotate(Math.PI);
      drawMarkerShape(ctx, lineStartMarker, mSize, baseThickness);
      ctx.restore();
    }

    if (lineEndMarker && lineEndMarker !== "none") {
      ctx.save();
      ctx.translate(halfWidth, 0); // Right end
      ctx.scale(invSX, invSY);
      drawMarkerShape(ctx, lineEndMarker, mSize, baseThickness);
      ctx.restore();
    }

    ctx.restore();
  };

  return line;
};

// Helper for drawing markers
const drawMarkerShape = (ctx: CanvasRenderingContext2D, type: string, size: number, strokeWidth: number) => {
  ctx.beginPath();
  if (type === "arrow") {
    ctx.moveTo(0, 0);
    ctx.lineTo(-size / 2, size / 2);
    ctx.lineTo(-size / 2, -size / 2);
    ctx.fill();
  } else if (type === "circle") {
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fill();
  } else if (type === "square") {
    ctx.fillRect(-size / 2, -size / 2, size, size);
  } else if (type === "diamond") {
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);
    ctx.restore();
  } else if (type === "bar") {
    ctx.fillRect(-strokeWidth / 2, -size / 2, strokeWidth, size);
  }
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
          fill: createGradient(shapeEl.fill),
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
          fill: createGradient(shapeEl.fill),
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
          fill: createGradient(shapeEl.fill),
          stroke: shapeEl.stroke,
          strokeWidth: shapeEl.strokeWidth,
          strokeDashArray: shapeEl.strokeDashArray || undefined,
          opacity: shapeEl.opacity,
          ...CONTROL_DEFAULTS,
        });
        return createShapeWithText(triangle, shapeEl);
      } else if (shapeEl.shapeType === "line") {
        return createLineWithMarkers(shapeEl);
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
