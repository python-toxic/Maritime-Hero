import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { faqsApi, categoriesApi } from "@/lib/api";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — SOS India" },
      {
        name: "description",
        content:
          "Find answers to common questions about maritime safety, ship recycling compliance, worker training, and consulting services from SOS India.",
      },
    ],
  }),
  component: PublicFaqPage,
});

function PublicFaqPage() {
  const [search, setSearch] = useState("");
  // Multi-select category filters: empty = show all
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
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
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs", "published"],
    queryFn: async () => {
      const res = await faqsApi.list(1, 200, undefined, "published");
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    staleTime: 60000,
  });

  const { data: apiCategories = [] } = useQuery<string[]>({
    queryKey: ["categories", "faqs"],
    queryFn: async () => {
      try {
        const res = await categoriesApi.list("faqs");
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
      : Array.from(new Set(faqs.map((f: any) => f.category || f.category_name).filter(Boolean)));
    return ["All", ...list];
  }, [apiCategories, faqs]);

  // Filter FAQs based on search and category
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return faqs.filter((f: any) => {
      const cat = f.category || f.category_name || "General";
      const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(cat);

      const matchesQ =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);

      return matchesCat && matchesQ;
    });
  }, [search, selectedCategories, faqs]);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-16 animate-in fade-in duration-300">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-primary sm:text-sm">
          Support & Guidance
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Frequently asked questions
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          Find quick answers to common regulatory, training, safety,
          and operational questions.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        {/* Search Input */}
        <div className="relative w-full md:max-w-sm" onClickCapture={(e) => e.stopPropagation()}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="search"
            value={search}
            onChange={(e) => {
              e.stopPropagation();
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            placeholder="Search FAQs..."
            className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Category Filter (icon + dropdown multi-select) */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((s) => !s)}
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
            <div ref={filterRef} className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-border bg-background p-3 shadow-lg">
              <div className="max-h-56 space-y-2 overflow-auto">
                {categories.filter((c) => c !== "All").map((cat) => {
                  const checked = selectedCategories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
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
                  onClick={() => setSelectedCategories([])}
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

      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-border bg-muted/40 p-12 text-center">
          No FAQs found.
        </div>
      ) : (
        <div className="mt-10 max-w-4xl space-y-3">
          {filtered.map((faq: any) => {
            const isOpen = openId === faq.id;

            return (
              <div 
                key={faq.id} 
                id={faq.id}
                className={`rounded-xl border transition-all duration-200 ${
                  isOpen 
                    ? "border-border bg-card shadow-sm" 
                    : "border-border/60 bg-card/50 hover:border-border hover:bg-card hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="group flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 sm:px-6 sm:py-5"
                >
                  <span className={`text-base font-medium leading-tight transition-colors ${
                    isOpen ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                  }`}>
                    {faq.question}
                  </span>

                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                    isOpen 
                      ? "border-primary/20 bg-primary/10 text-primary" 
                      : "border-transparent bg-muted/50 text-muted-foreground group-hover:border-border/50 group-hover:bg-muted group-hover:text-foreground"
                  }`}>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap sm:px-6 sm:pb-6 sm:text-base">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}