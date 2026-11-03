import { Suspense, lazy } from "react";
import { PdfErrorBoundary } from "./pdf/PdfErrorBoundary";
import { PdfSkeleton } from "./pdf/PdfSkeleton";

const PdfRenderer = lazy(() =>
  import("./pdf/PdfRenderer").then((m) => ({ default: m.PdfRenderer })),
);

export function PdfViewer({ url }: { url: string }) {
  return (
    <div className="flex flex-col space-y-4">
      <PdfErrorBoundary url={url}>
        <Suspense fallback={<PdfSkeleton />}>
          <PdfRenderer url={url} />
        </Suspense>
      </PdfErrorBoundary>
      <div className="flex justify-end">
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
