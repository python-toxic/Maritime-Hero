interface PdfSkeletonProps {
  /** CSS aspect-ratio value, e.g. "595 / 842" from PDF metadata.
   *  Defaults to US Letter (8.5 / 11). */
  aspectRatio?: string;
}

export function PdfSkeleton({ aspectRatio }: PdfSkeletonProps) {
  return (
    <div
      className="w-full animate-pulse rounded-sm bg-muted/50"
      style={{ aspectRatio: aspectRatio || "8.5 / 11" }}
    />
  );
}
