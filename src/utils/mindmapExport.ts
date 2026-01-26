import { toPng } from "html-to-image";
import { toast } from "sonner";

/**
 * Download data as JSON
 */
export function downloadJSON(data: any, fileName: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export element to HIGH QUALITY PNG
 * Uses 3x pixel ratio for crisp, high-resolution output
 */
export async function exportToPNG(elementId: string, fileName: string) {
  const element = document.querySelector(elementId) as HTMLElement;
  if (!element) {
    toast.error("Element not found for export");
    return;
  }

  try {
    // High quality export with 3x pixel ratio
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: "#000000", // Black background to match dark theme
      pixelRatio: 3, // 3x resolution for crisp quality
      quality: 1.0, // Maximum quality
      style: {
        transform: "scale(1)",
      },
      // Increase canvas size for better quality
      width: element.offsetWidth * 3,
      height: element.offsetHeight * 3,
    });

    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();

    toast.success("Export successful", {
      description: "Mind map saved as high-quality PNG (3x resolution)",
    });
  } catch (err) {
    console.error("Export failed", err);
    toast.error("Export failed", {
      description: "Could not generate PNG image",
    });
  }
}
