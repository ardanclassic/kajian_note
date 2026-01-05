import { Canvas, Point } from "fabric";

/**
 * Initialize smart aligning guidelines for Fabric.js canvas.
 *
 * Enables "snap-to-object" and "snap-to-center" functionality.
 * Draws dynamic vertical and horizontal guide lines when dragging objects.
 *
 * @param canvas Fabric Canvas instance
 * @returns formatting cleanup function
 */
export const initAligningGuidelines = (canvas: Canvas) => {
  const aligningLineMargin = 4;
  const aligningLineWidth = 1;
  const aligningLineColor = "#F680D1";

  let zoom = 1;

  /**
   * Draws a vertical guide line across the entire viewport height
   */
  function drawVerticalLine(coords: number) {
    drawLine(
      coords + 0.5,
      0 > canvas.height / zoom ? 0 : -5000,
      coords + 0.5,
      canvas.height / zoom < 0 ? canvas.height / zoom : 5000
    );
  }

  /**
   * Draws a horizontal guide line across the entire viewport width
   */
  function drawHorizontalLine(coords: number) {
    drawLine(
      0 > canvas.width / zoom ? 0 : -5000,
      coords + 0.5,
      canvas.width / zoom < 0 ? canvas.width / zoom : 5000,
      coords + 0.5
    );
  }

  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (!canvas.contextTop) return;

    // Drawing is done on the overlay context (contextTop)
    // We must manually apply the viewport transform to align with the zoomed canvas
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const ctx = canvas.contextTop;

    const origin = {
      x: x1 * vpt[0] + vpt[4],
      y: y1 * vpt[3] + vpt[5],
    };
    const target = {
      x: x2 * vpt[0] + vpt[4],
      y: y2 * vpt[3] + vpt[5],
    };

    ctx.save();
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Check if two values are within the snapping threshold (taking zoom into account)
   */
  function isInRange(value1: number, value2: number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    // Dynamic range based on zoom to maintain consistent physical snap distance
    const range = aligningLineMargin / zoom;
    return Math.abs(value1 - value2) <= range;
  }

  const listeners = {
    "mouse:down": () => {
      // viewportTransform = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]; // Unused
      zoom = canvas.getZoom();
    },
    "object:moving": function (e: any) {
      if (!canvas.contextTop) return;

      const activeObject = e.target;
      if (!activeObject) return;

      const canvasWidth = canvas.width / zoom;
      const canvasHeight = canvas.height / zoom;

      // Clear previous lines
      canvas.clearContext(canvas.contextTop);

      const transform = canvas._currentTransform;
      if (!transform) return;

      const activeObjectCenter = activeObject.getCenterPoint();
      const activeObjectLeft = activeObjectCenter.x - activeObject.getScaledWidth() / 2;
      const activeObjectTop = activeObjectCenter.y - activeObject.getScaledHeight() / 2;
      const activeObjectRight = activeObjectLeft + activeObject.getScaledWidth();
      const activeObjectBottom = activeObjectTop + activeObject.getScaledHeight();
      const activeObjectHeight = activeObject.getScaledHeight();
      const activeObjectWidth = activeObject.getScaledWidth();

      const horizontalLines: number[] = [];
      const verticalLines: number[] = [];

      // Canvas Centers
      const canvasCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };

      // Snap to Canvas Center Vertical
      if (isInRange(activeObjectCenter.x, canvasCenter.x)) {
        verticalLines.push(canvasCenter.x);
        activeObject.setPositionByOrigin(new Point(canvasCenter.x, activeObjectCenter.y), "center", "center");
      }

      // Snap to Canvas Center Horizontal
      if (isInRange(activeObjectCenter.y, canvasCenter.y)) {
        horizontalLines.push(canvasCenter.y);
        activeObject.setPositionByOrigin(new Point(activeObjectCenter.x, canvasCenter.y), "center", "center");
      }

      // Check other objects
      canvas.getObjects().forEach((obj) => {
        if (obj === activeObject || !obj.visible) return;

        const objCenter = obj.getCenterPoint();
        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();
        const objLeft = objCenter.x - objWidth / 2;
        const objRight = objLeft + objWidth;
        const objTop = objCenter.y - objHeight / 2;
        const objBottom = objTop + objHeight;

        // Vertical Alignment (Center, Left, Right)
        if (isInRange(activeObjectCenter.x, objCenter.x)) {
          verticalLines.push(objCenter.x);
          // Set Center X to objCenter.x
          if (activeObject.originX === "center") {
            activeObject.setX(objCenter.x);
          } else {
            activeObject.setX(objCenter.x - activeObjectWidth / 2);
          }
        }
        if (isInRange(activeObjectLeft, objLeft)) {
          verticalLines.push(objLeft);
          // Set Left Edge to objLeft
          if (activeObject.originX === "center") {
            activeObject.setX(objLeft + activeObjectWidth / 2);
          } else {
            activeObject.setX(objLeft);
          }
        }
        if (isInRange(activeObjectRight, objRight)) {
          verticalLines.push(objRight);
          // Set Right Edge to objRight
          if (activeObject.originX === "center") {
            activeObject.setX(objRight - activeObjectWidth / 2);
          } else {
            activeObject.setX(objRight - activeObjectWidth);
          }
        }

        // Horizontal Alignment (Center, Top, Bottom)
        if (isInRange(activeObjectCenter.y, objCenter.y)) {
          horizontalLines.push(objCenter.y);
          // Set Center Y to objCenter.y
          if (activeObject.originY === "center") {
            activeObject.setY(objCenter.y);
          } else {
            activeObject.setY(objCenter.y - activeObjectHeight / 2);
          }
        }
        if (isInRange(activeObjectTop, objTop)) {
          horizontalLines.push(objTop);
          // Set Top Edge to objTop
          if (activeObject.originY === "center") {
            activeObject.setY(objTop + activeObjectHeight / 2);
          } else {
            activeObject.setY(objTop);
          }
        }
        if (isInRange(activeObjectBottom, objBottom)) {
          horizontalLines.push(objBottom);
          // Set Bottom Edge to objBottom
          if (activeObject.originY === "center") {
            activeObject.setY(objBottom - activeObjectHeight / 2);
          } else {
            activeObject.setY(objBottom - activeObjectHeight);
          }
        }
      });

      for (const val of verticalLines) drawVerticalLine(val);
      for (const val of horizontalLines) drawHorizontalLine(val);
    },
    "mouse:up": function () {
      if (canvas.contextTop) {
        canvas.clearContext(canvas.contextTop);
      }
    },
  };

  for (const [event, handler] of Object.entries(listeners)) {
    canvas.on(event as any, handler);
  }

  return () => {
    for (const [event, handler] of Object.entries(listeners)) {
      canvas.off(event as any, handler);
    }
  };
};
