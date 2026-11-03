import { useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

/** Minimal interface matching PDF.js RenderTask — avoids deep type imports */
interface PdfRenderTask {
  cancel(): void;
  promise: Promise<void>;
}

interface UsePdfPageOptions {
  pdfDocument: PDFDocumentProxy | null;
  pageNumber: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerWidth: number;
  isVisible: boolean;
  onRenderComplete?: () => void;
}

/**
 * Renders a single PDF page to a canvas at the correct scale for the container
 * width and device pixel ratio. Cancels in-flight renders on cleanup.
 */
export function usePdfPage({
  pdfDocument,
  pageNumber,
  canvasRef,
  containerWidth,
  isVisible,
  onRenderComplete,
}: UsePdfPageOptions): void {
  const renderTaskRef = useRef<PdfRenderTask | null>(null);
  const onRenderCompleteRef = useRef(onRenderComplete);
  onRenderCompleteRef.current = onRenderComplete;

  useEffect(() => {
    if (
      !pdfDocument ||
      !canvasRef.current ||
      !isVisible ||
      containerWidth <= 0
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    let cancelled = false;

    // Cancel any in-flight render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    pdfDocument
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;

        const dpr = window.devicePixelRatio || 1;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth / unscaledViewport.width) * dpr;
        const viewport = page.getViewport({ scale });

        // Set canvas pixel dimensions (high-res for sharp rendering)
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Set CSS display dimensions (matches container)
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerWidth * (unscaledViewport.height / unscaledViewport.width)}px`;

        const renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        renderTaskRef.current = renderTask as unknown as PdfRenderTask;

        renderTask.promise
          .then(() => {
            if (!cancelled) {
              onRenderCompleteRef.current?.();
            }
          })
          .catch((err: unknown) => {
            // RenderingCancelledException is expected during cleanup/re-render
            const isCancel =
              err &&
              typeof err === "object" &&
              "name" in err &&
              (err as { name: string }).name === "RenderingCancelledException";
            if (!isCancel && !cancelled) {
              console.error(`PDF page ${pageNumber} render failed:`, err);
            }
          });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`Failed to get PDF page ${pageNumber}:`, err);
        }
      });

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocument, pageNumber, containerWidth, isVisible, canvasRef]);
}
