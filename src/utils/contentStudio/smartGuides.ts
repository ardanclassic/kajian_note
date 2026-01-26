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

  // For constrained movement with Shift key
  let dragStartPoint: Point | null = null;
  let lockedAxis: "horizontal" | "vertical" | null = null;

  function drawVerticalLine(coords: number) {
    drawLine(
      coords + 0.5,
      0 > canvas.height / zoom ? 0 : -5000,
      coords + 0.5,
      canvas.height / zoom < 0 ? canvas.height / zoom : 5000
    );
  }

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

  function isInRange(value1: number, value2: number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    const range = aligningLineMargin / zoom;
    return Math.abs(value1 - value2) <= range;
  }

  // --- Handlers ---

  const handleMoving = (e: any) => {
    if (!canvas.contextTop) return;
    const activeObject = e.target;
    if (!activeObject) return;

    const canvasWidth = canvas.width / zoom;
    const canvasHeight = canvas.height / zoom;

    // Clear previous lines
    canvas.clearContext(canvas.contextTop);

    const activeObjectCenter = activeObject.getCenterPoint();

    // Constrained movement with Shift key
    if (e.e?.shiftKey && dragStartPoint) {
      // Determine locked axis if not already determined
      if (!lockedAxis) {
        const deltaX = Math.abs(activeObjectCenter.x - dragStartPoint.x);
        const deltaY = Math.abs(activeObjectCenter.y - dragStartPoint.y);

        // Lock to the axis with more movement (threshold: 10px)
        if (deltaX > 10 || deltaY > 10) {
          lockedAxis = deltaX > deltaY ? "horizontal" : "vertical";
        }
      }

      // Apply constraint based on locked axis
      if (lockedAxis === "horizontal") {
        // Lock Y position, allow only X movement
        activeObject.setPositionByOrigin(new Point(activeObjectCenter.x, dragStartPoint.y), "center", "center");
      } else if (lockedAxis === "vertical") {
        // Lock X position, allow only Y movement
        activeObject.setPositionByOrigin(new Point(dragStartPoint.x, activeObjectCenter.y), "center", "center");
      }
    }

    // Recalculate center after constraint
    const constrainedCenter = activeObject.getCenterPoint();
    const activeObjectLeft = constrainedCenter.x - activeObject.getScaledWidth() / 2;
    const activeObjectTop = constrainedCenter.y - activeObject.getScaledHeight() / 2;
    const activeObjectRight = activeObjectLeft + activeObject.getScaledWidth();
    const activeObjectBottom = activeObjectTop + activeObject.getScaledHeight();
    const activeObjectHeight = activeObject.getScaledHeight();
    const activeObjectWidth = activeObject.getScaledWidth();

    const horizontalLines: number[] = [];
    const verticalLines: number[] = [];
    const canvasCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };

    // Snap to Canvas Center
    if (isInRange(constrainedCenter.x, canvasCenter.x)) {
      verticalLines.push(canvasCenter.x);
      activeObject.setPositionByOrigin(new Point(canvasCenter.x, constrainedCenter.y), "center", "center");
    }
    if (isInRange(constrainedCenter.y, canvasCenter.y)) {
      horizontalLines.push(canvasCenter.y);
      activeObject.setPositionByOrigin(new Point(constrainedCenter.x, canvasCenter.y), "center", "center");
    }

    // Snap to Canvas Borders
    if (isInRange(activeObjectLeft, 0)) {
      verticalLines.push(0);
      const y = activeObject.originY === "center" ? constrainedCenter.y : activeObjectTop;
      activeObject.setPositionByOrigin(new Point(0 + activeObjectWidth / 2, y), "center", activeObject.originY);
    }
    if (isInRange(activeObjectRight, canvasWidth)) {
      verticalLines.push(canvasWidth);
      const y = activeObject.originY === "center" ? constrainedCenter.y : activeObjectTop;
      activeObject.setPositionByOrigin(
        new Point(canvasWidth - activeObjectWidth / 2, y),
        "center",
        activeObject.originY
      );
    }
    if (isInRange(activeObjectTop, 0)) {
      horizontalLines.push(0);
      const x = activeObject.originX === "center" ? constrainedCenter.x : activeObjectLeft;
      activeObject.setPositionByOrigin(new Point(x, 0 + activeObjectHeight / 2), activeObject.originX, "center");
    }
    if (isInRange(activeObjectBottom, canvasHeight)) {
      horizontalLines.push(canvasHeight);
      const x = activeObject.originX === "center" ? constrainedCenter.x : activeObjectLeft;
      activeObject.setPositionByOrigin(
        new Point(x, canvasHeight - activeObjectHeight / 2),
        activeObject.originX,
        "center"
      );
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

      if (isInRange(constrainedCenter.x, objCenter.x)) {
        verticalLines.push(objCenter.x);
        activeObject.setPositionByOrigin(new Point(objCenter.x, activeObject.getCenterPoint().y), "center", "center");
      }
      if (isInRange(activeObjectLeft, objLeft)) {
        verticalLines.push(objLeft);
        activeObject.setX(activeObject.originX === "center" ? objLeft + activeObjectWidth / 2 : objLeft);
      }
      if (isInRange(activeObjectRight, objRight)) {
        verticalLines.push(objRight);
        activeObject.setX(
          activeObject.originX === "center" ? objRight - activeObjectWidth / 2 : objRight - activeObjectWidth
        );
      }

      if (isInRange(constrainedCenter.y, objCenter.y)) {
        horizontalLines.push(objCenter.y);
        activeObject.setPositionByOrigin(new Point(activeObject.getCenterPoint().x, objCenter.y), "center", "center");
      }
      if (isInRange(activeObjectTop, objTop)) {
        horizontalLines.push(objTop);
        activeObject.setY(activeObject.originY === "center" ? objTop + activeObjectHeight / 2 : objTop);
      }
      if (isInRange(activeObjectBottom, objBottom)) {
        horizontalLines.push(objBottom);
        activeObject.setY(
          activeObject.originY === "center" ? objBottom - activeObjectHeight / 2 : objBottom - activeObjectHeight
        );
      }
    });

    for (const val of verticalLines) drawVerticalLine(val);
    for (const val of horizontalLines) drawHorizontalLine(val);
  };

  const listeners = {
    "mouse:down": (e: any) => {
      zoom = canvas.getZoom();
      // Store drag start position for constrained movement
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        dragStartPoint = activeObject.getCenterPoint();
        lockedAxis = null; // Reset locked axis
      }
    },
    "object:moving": handleMoving,
    "mouse:up": function () {
      if (canvas.contextTop) {
        canvas.clearContext(canvas.contextTop);
      }
      // Reset constraint state
      dragStartPoint = null;
      lockedAxis = null;
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
