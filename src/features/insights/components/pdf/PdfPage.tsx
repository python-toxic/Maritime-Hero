import { useRef, useState, useEffect, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { usePdfPage } from "../../hooks/usePdfPage";
import { PdfSkeleton } from "./PdfSkeleton";
import type { PageDimension } from "../../hooks/usePdfDocument";

interface PdfPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  dimension: PageDimension;
  containerWidth: number;
}

/**
 * Renders a single PDF page as a canvas element. Uses IntersectionObserver
 * to only render when the page approaches the viewport (lazy rendering).
 * Container has a fixed height from PDF metadata to prevent layout shift.
 */
export function PdfPage({
  pdfDocument,
  pageNumber,
  dimension,
  containerWidth,
}: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Pre-calculate display height from PDF metadata — prevents layout shift
  const aspectRatio = dimension.height / dimension.width;
  const displayHeight = containerWidth > 0 ? containerWidth * aspectRatio : 0;

  // IntersectionObserver: lazy render with 400px preload buffer (~1 page ahead)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing — page stays rendered
          observer.unobserve(el);
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleRenderComplete = useCallback(() => {
    setIsRendered(true);
  }, []);

  usePdfPage({
    pdfDocument,
    pageNumber,
    canvasRef,
    containerWidth,
    isVisible,
    onRenderComplete: handleRenderComplete,
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        height: displayHeight > 0 ? `${displayHeight}px` : undefined,
      }}
    >
      {isVisible && (
        <canvas
          ref={canvasRef}
          className={`block transition-opacity duration-300 ${
            isRendered ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {!isRendered && (
        <div className="absolute inset-0">
          <PdfSkeleton
            aspectRatio={`${dimension.width} / ${dimension.height}`}
          />
        </div>
      )}
    </div>
  );
}
