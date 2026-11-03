interface Props {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  // Limit visible pages to 5 to prevent huge DOM tree if totalPages is very large
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-11 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      <div className="hidden gap-1 sm:flex">
        {start > 1 && (
          <>
            <button
              onClick={() => onChange(1)}
              className="h-11 w-11 rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              1
            </button>
            {start > 2 && <span className="flex items-center justify-center w-8 text-muted-foreground">...</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`h-11 w-11 rounded-md border text-sm font-medium transition-colors ${
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="flex items-center justify-center w-8 text-muted-foreground">...</span>}
            <button
              onClick={() => onChange(totalPages)}
              className="h-11 w-11 rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <span className="text-sm text-muted-foreground sm:hidden">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-11 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}
