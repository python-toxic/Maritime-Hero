import { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Worker is served from /public/pdf.worker.min.js (renamed from .mjs so Apache
// serves it with correct application/javascript MIME type — .mjs is text/plain
// on most shared hosts). BASE_URL accounts for the /Insights/ sub-path in prod.
pdfjs.GlobalWorkerOptions.workerSrc =
  `${import.meta.env.BASE_URL}pdf.worker.min.js`;

export interface PageDimension {
  width: number;
  height: number;
}

interface UsePdfDocumentReturn {
  pdfDocument: PDFDocumentProxy | null;
  pageCount: number;
  pageDimensions: PageDimension[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Loads a PDF document and reads page dimensions for all pages.
 * Page dimensions are read from metadata (fast) — no pixel rendering occurs here.
 * Handles cleanup and cancellation on unmount or URL changes.
 */
export function usePdfDocument(url: string): UsePdfDocumentReturn {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageDimensions, setPageDimensions] = useState<PageDimension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setPdfDocument(null);
    setPageDimensions([]);

    // Destroy previous document if URL changes
    if (documentRef.current) {
      documentRef.current.destroy();
      documentRef.current = null;
    }

    const loadingTask = pdfjs.getDocument(url);

    loadingTask.promise
      .then(async (pdf) => {
        if (cancelled) {
          pdf.destroy();
          return;
        }

        // Read all page dimensions (metadata only — no pixel rendering)
        const dimensions: PageDimension[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          dimensions.push({ width: viewport.width, height: viewport.height });
        }

        if (cancelled) {
          pdf.destroy();
          return;
        }

        documentRef.current = pdf;
        setPdfDocument(pdf);
        setPageDimensions(dimensions);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      loadingTask.destroy().catch(() => {});
    };
  }, [url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (documentRef.current) {
        documentRef.current.destroy();
        documentRef.current = null;
      }
    };
  }, []);

  return {
    pdfDocument,
    pageCount: pageDimensions.length,
    pageDimensions,
    isLoading,
    error,
  };
}
