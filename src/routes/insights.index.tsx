import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const PAGE_SIZE = 6;

import { useQuery } from "@tanstack/react-query";
import { articlesApi, categoriesApi } from "@/lib/api";
import { type Article } from "@/features/insights/types";
import { parseArticleBody } from "@/features/admin/components/editor/parseBody";

function mapArticleResponse(a: any): Article {
  const body = parseArticleBody(a.body);
  return {
    ...a,
    category: a.category_name || a.category || "General",
    author: a.author || "SOS India Editorial",
    publishedAt: a.published_at || a.created_at,
    coverImage: a.featured_image_url || a.coverImage || "",
    body,
    readingTime:
      a.readingTime ||
      Math.max(1, Math.ceil(JSON.stringify(body).length / 1000)) ||
      5,
    content_source: a.content_source || "cms",
    pdf_file_path: a.pdf_file_path || null,
  };
}



export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Insights & Newsletters — SOS India" },
      {
        name: "description",
        content:
          "Maritime consultancy and ship recycling insights from SOS India — regulations, compliance, safety, and sustainability updates for shipping professionals.",
      },
      { property: "og:title", content: "Insights & Newsletters — SOS India" },
      {
        property: "og:description",
        content:
          "Regulations, compliance, safety, and sustainability updates for maritime and ship recycling professionals.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const [search, setSearch] = useState("");
  // Multi-select filters: empty = no filtering (show all)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const filterRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!filterRef.current) return;
      const target = e.target as Node | null;
      if (target && !filterRef.current.contains(target)) {
        setFilterOpen(false);
      }
    }

    if (filterOpen) {
      document.addEventListener('mousedown', handleDocClick);
    }

    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [filterOpen]);

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["insights", "published"],
    queryFn: async () => {
      const res = await articlesApi.list(1, 100, undefined, "published");
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(mapArticleResponse);
      }
      return [];
    },
    staleTime: 0,
  });

  // Load all categories from the categories API (falls back to deriving from articles)
  const { data: apiCategories = [] } = useQuery<string[]>({
    queryKey: ["categories", "articles"],
    queryFn: async () => {
      try {
        const res = await categoriesApi.list("articles");
        if (res.success && Array.isArray(res.data)) {
          return res.data.map((c: any) => (typeof c === "string" ? c : c.name || String(c)));
        }
      } catch (err) {
        // ignore and fall back
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const categories = useMemo(() => {
    const list = apiCategories && apiCategories.length > 0
      ? apiCategories
      : Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return ["All", ...list];
  }, [apiCategories, articles]);

  // Filter and search logic inline
  const filtered = useMemo(() => {
    let results = articles;

    // Filter by selected categories (multi-select). Empty => no filtering.
    if (selectedCategories.length > 0) {
      results = results.filter((a) => selectedCategories.includes(a.category));
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return results;
  }, [search, selectedCategories, articles]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-16">
      {/* Header */}
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-primary sm:text-sm">
          Insights & Newsletters
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Maritime and ship recycling intelligence
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          Practical analysis, regulatory updates, and operational guidance for
          shipowners, managers, and recycling stakeholders — curated by the SOS
          India team.
        </p>
      </header>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Search and Filter Controls */}
      <div className="mt-8 flex flex-col gap-4 md:mt-10 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs" onClickCapture={(e) => e.stopPropagation()}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              e.stopPropagation();
              setSearch(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            placeholder="Search articles…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Category Filter (icon + dropdown multi-select) */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((s) => !s)}
            aria-expanded={filterOpen}
            className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
            {selectedCategories.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {selectedCategories.length}
              </span>
            )}
          </button>

          {filterOpen && (
            <div
              ref={filterRef}
              className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-border bg-background p-3 shadow-lg"
            >
              <div className="max-h-56 space-y-2 overflow-auto">
                {categories.filter((c) => c !== "All").map((cat) => {
                  const checked = selectedCategories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setPage(1);
                          setSelectedCategories((prev) =>
                            prev.includes(cat) ? prev.filter((p) => p !== cat) : [...prev, cat]
                          );
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-foreground">{cat}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setFilterOpen(false);
                    setPage(1);
                  }}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Clear
                </button>

                <button
                  onClick={() => setFilterOpen(false)}
                  className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {visible.length === 0 ? (
        <div className="mt-16 rounded-lg border border-dashed border-border bg-muted/40 p-12 text-center">
          <p className="text-base font-medium text-foreground">
            No articles match your search
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword or category.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <Link
              key={a.slug}
              to="/insights/$slug"
              params={{ slug: a.slug }}
              className="group overflow-hidden rounded-lg border border-border bg-background transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={a.coverImage}
                  alt={a.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-primary">
                    {a.category}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {a.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {a.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-end pt-3 border-t border-border text-xs text-muted-foreground">
                  <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-md border border-input bg-background p-2 text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-input bg-background p-2 text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}
