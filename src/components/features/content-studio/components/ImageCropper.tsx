import React, { useRef, useState, useEffect } from 'react';
import { Cropper } from 'react-advanced-cropper';
import type { CropperRef, CropperState } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { useEditorStore } from '@/store/contentStudioStore';
import type { ImageElement } from '@/types/contentStudio.types';
import { Check, X, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImageCropper() {
  const {
    slides,
    currentSlideIndex,
    croppingElementId,
    setCroppingElementId,
    updateElement,
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];
  const element = currentSlide?.elements.find(el => el.id === croppingElementId) as ImageElement | undefined;

  const cropperRef = useRef<CropperRef>(null);

  // Local state for UI controls
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isRatioLocked, setIsRatioLocked] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Load natural image dimensions
  useEffect(() => {
    if (element) {
      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = element.src;
    }
  }, [element?.src]);

  // Initialize flip state from element on mount
  useEffect(() => {
    if (element) {
      setFlipH((element.scaleX || 1) < 0);
      setFlipV((element.scaleY || 1) < 0);
    }
  }, [element?.id]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCroppingElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCroppingElementId]);

  if (!element || element.type !== 'image' || !croppingElementId) return null;

  const handleSave = () => {
    if (cropperRef.current) {
      const coordinates = cropperRef.current.getCoordinates();

      if (coordinates) {
        // CRITICAL: Clamp coordinates to natural image bounds
        // If user zooms out beyond the image, we limit to the actual image size
        // This prevents Fabric from trying to render transparent/empty areas
        let clampedCoords = { ...coordinates };

        if (naturalSize) {
          clampedCoords = {
            left: Math.max(0, Math.min(coordinates.left, naturalSize.width)),
            top: Math.max(0, Math.min(coordinates.top, naturalSize.height)),
            width: Math.min(coordinates.width, naturalSize.width - Math.max(0, coordinates.left)),
            height: Math.min(coordinates.height, naturalSize.height - Math.max(0, coordinates.top)),
          };
        }

        // We maintain the visual size of the element on the canvas
        // Logic: NewScale = (OldVisualDimension) / NewInternalDimension

        const currentScaleX = element.scaleX ?? 1;
        const currentScaleY = element.scaleY ?? 1;

        // Calculate original visual size (absolute value to ignore flip for size calc)
        const visualWidth = element.size.width * Math.abs(currentScaleX);
        const visualHeight = element.size.height * Math.abs(currentScaleY);

        // Calculate new absolute scales based on CLAMPED coordinates
        let newScaleX = visualWidth / clampedCoords.width;
        let newScaleY = visualHeight / clampedCoords.height;

        // Apply flip polarity
        if (flipH) newScaleX = -newScaleX;
        if (flipV) newScaleY = -newScaleY;

        updateElement(croppingElementId, {
          cropX: clampedCoords.left,
          cropY: clampedCoords.top,
          size: {
            width: clampedCoords.width,
            height: clampedCoords.height,
          },
          scaleX: newScaleX,
          scaleY: newScaleY,
        });
      }
    }
    setCroppingElementId(null);
  };

  const handleReset = () => {
    if (cropperRef.current) {
      setFlipH(false);
      setFlipV(false);
      setIsRatioLocked(false);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (cropperRef.current) {
      const factor = direction === 'in' ? 1.2 : 0.8;
      cropperRef.current.zoomImage(factor);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCroppingElementId(null);
      }}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6 bg-black/50 backdrop-blur-md">
        <h2 className="text-lg font-semibold tracking-tight text-white/90">Crop Image</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="relative flex-1 overflow-hidden bg-[#09090b] flex items-center justify-center">
        <Cropper
          ref={cropperRef}
          src={element.src}
          className="h-[calc(100vh-200px)] w-full max-w-5xl object-contain outline-none"
          // Flip support via transform
          style={{
            transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
          }}
          stencilProps={{
            grid: true,
            aspectRatio: isRatioLocked
              ? (element.size.width * Math.abs(element.scaleX || 1)) / (element.size.height * Math.abs(element.scaleY || 1))
              : undefined,
            overlayClassName: "cropper-overlay"
          }}
          backgroundWrapperProps={{
            scaleImage: true,
            moveImage: true,
          }}
          // Initialize with current crop
          defaultCoordinates={(state: CropperState) => {
            const { imageSize } = state;
            const cropX = element.cropX || 0;
            const cropY = element.cropY || 0;

            // Heuristic: If crop position is exactly 0,0, assume it's uninitialized or default top-left.
            // In this case, we calculate a "Best Fit Center" crop.
            if (cropX === 0 && cropY === 0) {
              const aspect = element.size.width / element.size.height;
              const { width: iWidth, height: iHeight } = imageSize;

              // Calculate "Best Fit" dimensions (Maximize within image boundaries)
              let width = iWidth;
              let height = width / aspect;

              if (height > iHeight) {
                height = iHeight;
                width = height * aspect;
              }

              // Center the crop
              const left = (iWidth - width) / 2;
              const top = (iHeight - height) / 2;

              return { left, top, width, height };
            }

            // Otherwise, respect the existing crop
            return {
              left: cropX,
              top: cropY,
              width: element.size.width,
              height: element.size.height
            };
          }}
        />
      </div>

      {/* Footer Controls */}
      <div className="shrink-0 border-t border-white/10 bg-black/90 backdrop-blur-xl pb-6 pt-4 px-6 md:pb-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">

          {/* Left: Tools */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => setFlipH(!flipH)}
                className={cn(
                  "rounded-md p-2 transition-colors hover:bg-white/10",
                  flipH ? "bg-blue-500/20 text-blue-400" : "text-white/70"
                )}
                title="Flip Horizontal"
              >
                <FlipHorizontal size={20} />
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={cn(
                  "rounded-md p-2 transition-colors hover:bg-white/10",
                  flipV ? "bg-blue-500/20 text-blue-400" : "text-white/70"
                )}
                title="Flip Vertical"
              >
                <FlipVertical size={20} />
              </button>
            </div>
          </div>

          {/* Center: Zoom & Ratio Tools */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/10">
              <button
                onClick={() => handleZoom('out')}
                className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={() => handleZoom('in')}
                className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>

              <div className="mx-1 h-5 w-px bg-white/10" />

              <button
                onClick={() => setIsRatioLocked(!isRatioLocked)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10",
                  isRatioLocked ? "bg-blue-500/20 text-blue-400" : "text-white/70"
                )}
                title="Match Element Aspect Ratio"
              >
                <Maximize size={16} />
                <span>Best Fit</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCroppingElementId(null)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95"
            >
              <Check size={16} />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
