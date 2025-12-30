// Export Utility - Export slides as images

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export async function exportSlideAsImage(
  canvasElement: HTMLCanvasElement,
  slideNumber: number,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      canvasElement.toBlob(
        (blob) => {
          if (blob) {
            saveAs(blob, `slide-${slideNumber}.${format}`);
            resolve();
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        `image/${format}`,
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
}

export async function exportAllSlidesAsZip(
  canvasElements: HTMLCanvasElement[],
  projectName: string = 'slides',
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1
): Promise<void> {
  const zip = new JSZip();
  
  for (let i = 0; i < canvasElements.length; i++) {
    const canvas = canvasElements[i];
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, `image/${format}`, quality);
    });
    
    if (blob) {
      zip.file(`slide-${i + 1}.${format}`, blob);
    }
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${projectName}.zip`);
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
