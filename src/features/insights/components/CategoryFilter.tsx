import { useArticleCategories } from "@/features/admin";

interface Props {
  active: string | "All";
  onChange: (c: string | "All") => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  const { data: categories = [] } = useArticleCategories();

  // Normalize category shape — backend may return objects or strings.
  const normalized: string[] = (categories as any[]).map((c) =>
    typeof c === "string" ? c : c?.name ?? String(c)
  );

  const items: (string | "All")[] = ["All", ...normalized];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 flex-nowrap hide-scrollbar">
      {items.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`h-11 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
