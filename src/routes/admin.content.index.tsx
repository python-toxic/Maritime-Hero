import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import { useDeleteArticle, useAdminArticles } from "@/features/admin";
import { ArticleStatusBadge } from "@/features/admin/components/ArticleStatusBadge";
import { SchedulePublicationModal } from "@/features/admin/components/SchedulePublicationModal";
import type { AdminArticle } from "@/features/admin/types";
import { formatDate } from "@/features/insights";
import { useAuth } from "@/features/auth/lib/AuthContext";
import { hasPermission } from "@/lib/permissions";

export const Route = createFileRoute("/admin/content/")({
  head: () => ({ meta: [{ title: "Content — SOS India Admin" }] }),
  component: ContentList,
});

function ContentList() {
  const { data: articles = [], isLoading } = useAdminArticles();
  const deleteMutation = useDeleteArticle();
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<AdminArticle | null>(null);

  const { user } = useAuth();
  const canSchedule = hasPermission(user?.role, "canScheduleContent");

  const filtered = useMemo(() => {
    // 1. Filter by role visibility
    const visibleArticles = articles.filter((a) => {
      if (user?.role === "admin") return true;
      if (user?.role === "manager") return a.status !== "draft" || String(a.author_id) === String(user.id);
      if (user?.role === "employee") return String(a.author_id) === String(user.id);
      return false;
    });

    // 2. Filter by search query
    const s = q.trim().toLowerCase();
    const sorted = [...visibleArticles].sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : -1,
    );
    if (!s) return sorted;
    return sorted.filter(
      (a) =>
          a.title.toLowerCase().includes(s) ||
          a.category.toLowerCase().includes(s),
    );
  }, [articles, q, user]);

  const target = confirm ? articles.find((a) => a.slug === confirm) : null;

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/Insights/insights/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Content
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all newsletters and insights.
          </p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          Create new article
        </Link>
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
            No articles found.
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
              <span>{formatDate(a.updatedAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/admin/articles/$id/edit"
                params={{ id: a.slug }}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-center text-xs font-medium text-foreground hover:bg-accent"
              >
                Edit
              </Link>
              {canSchedule && a.status === "approved" && (
                <button
                  type="button"
                  onClick={() => setScheduleTarget(a)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Schedule
                </button>
              )}
              <button
                onClick={() => setConfirm(a.slug)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
              {a.status === "published" && (
                <button
                  onClick={() => copyLink(a.slug)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent flex items-center justify-center gap-1.5"
                  title="Copy public link"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </button>
              )}
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
                <th className="px-5 py-3 font-medium">Date</th>
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
                    No articles found.
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
                    {formatDate(a.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <ArticleStatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        to="/admin/articles/$id/edit"
                        params={{ id: a.slug }}
                        className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        Edit
                      </Link>
                      {canSchedule && a.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => setScheduleTarget(a)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          Schedule
                        </button>
                      )}
                      <button
                        onClick={() => setConfirm(a.slug)}
                        className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        Delete
                      </button>
                      {a.status === "published" && (
                        <button
                          onClick={() => copyLink(a.slug)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent flex items-center gap-1.5"
                          title="Copy public link"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Copy Link</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {scheduleTarget && (
        <SchedulePublicationModal
          article={scheduleTarget}
          onClose={() => setScheduleTarget(null)}
        />
      )}

      {target && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
          onClick={() => setConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg"
          >
            <h3 className="text-base font-semibold text-foreground">
              Delete article?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              "{target.title}" will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (target.id) deleteMutation.mutate(target.id);
                  setConfirm(null);
                }}
                className="h-9 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
