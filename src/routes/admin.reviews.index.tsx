import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAdminArticles } from "@/features/admin";
import { ArticleStatusBadge } from "@/features/admin/components/ArticleStatusBadge";
import { formatDate } from "@/features/insights";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/reviews/")({
  head: () => ({ meta: [{ title: "Review Queue — SOS India Admin" }] }),
  component: () => (
    <ProtectedRoute requiredPermission="canReviewContent">
      <ReviewQueue />
    </ProtectedRoute>
  ),
});

function ReviewQueue() {
  const { data: articles = [], isLoading } = useAdminArticles();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    // 1. Filter by submitted status only
    const submittedArticles = articles.filter((a) => a.status === "submitted");

    // 2. Filter by search query
    const s = q.trim().toLowerCase();
    const sorted = [...submittedArticles].sort((a, b) =>
      a.submitted_at && b.submitted_at 
        ? (a.submitted_at < b.submitted_at ? 1 : -1) 
        : (a.updatedAt < b.updatedAt ? 1 : -1)
    );
    if (!s) return sorted;
    return sorted.filter(
      (a) =>
          a.title.toLowerCase().includes(s) ||
          a.category.toLowerCase().includes(s),
    );
  }, [articles, q]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Review Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve submitted newsletters and insights.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or category…"
          className="h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Mobile: card list */}
      <div className="mt-4 space-y-3 sm:hidden">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            No items pending review.
          </div>
        )}
        {filtered.map((a) => (
          <div
            key={a.slug}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="text-sm font-medium text-foreground">{a.title}</div>
            <div className="mt-1 text-xs text-muted-foreground flex gap-2">
              <span>{a.category}</span>
              <span>·</span>
              <ArticleStatusBadge status={a.status} />
              <span>·</span>
              <span>{formatDate(a.submitted_at || a.updatedAt)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                to="/admin/reviews/$id"
                params={{ id: a.slug }}
                className="flex-1 rounded-md border border-input bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Review
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="mt-4 hidden overflow-hidden rounded-lg border border-border bg-background sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Submitted Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    No items pending review.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.slug} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.category}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {formatDate(a.submitted_at || a.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <ArticleStatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        to="/admin/reviews/$id"
                        params={{ id: a.slug }}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Review
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
