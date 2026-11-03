import { useRef, useState, useEffect } from "react";
import { usePdfDocument } from "../../hooks/usePdfDocument";
import { PdfPage } from "./PdfPage";
import { PdfSkeleton } from "./PdfSkeleton";

interface PdfRendererProps {
  url: string;
}

/**
 * Main PDF rendering orchestrator. Loads the PDF document, tracks container
 * width with ResizeObserver, and renders pages as stacked canvases.
 * Throws errors for the parent ErrorBoundary to catch.
 */
export function PdfRenderer({ url }: PdfRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { pdfDocument, pageDimensions, isLoading, error } =
    usePdfDocument(url);

  // Track container width with debounced ResizeObserver for responsive rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width != null && width > 0) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setContainerWidth(width);
        }, 100);
      }
    });

    observer.observe(el);

    // Set initial width immediately (no debounce for first paint)
    setContainerWidth(el.clientWidth);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Throw errors so PdfErrorBoundary can catch them
  if (error) {
    throw error;
  }

  return (
    <div ref={containerRef} className="w-full">
      {isLoading || containerWidth === 0 ? (
        <div className="flex flex-col gap-2">
          <PdfSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pdfDocument &&
            pageDimensions.map((dim, index) => (
              <PdfPage
                key={index}
                pdfDocument={pdfDocument}
                pageNumber={index + 1}
                dimension={dim}
                containerWidth={containerWidth}
              />
            ))}
        </div>
      )}
    </div>
  );
}
