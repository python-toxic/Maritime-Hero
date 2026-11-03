import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useAdminArticles,
  usePublishArticle,
  useUnscheduleArticle,
} from "@/features/admin";
import { ArticleStatusBadge } from "@/features/admin/components/ArticleStatusBadge";
import { SchedulePublicationModal } from "@/features/admin/components/SchedulePublicationModal";
import { formatDate } from "@/features/insights";
import { formatNaiveDatetime, parseLocalDatetime } from "@/lib/datetime";
import type { AdminArticle } from "@/features/admin/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/scheduled")({
  head: () => ({ meta: [{ title: "Scheduled — SOS India Admin" }] }),
  component: () => (
    <ProtectedRoute requiredPermission="canScheduleContent">
      <ScheduledList />
    </ProtectedRoute>
  ),
});

function ScheduledList() {
  const { data: articles = [], isLoading } = useAdminArticles();
  const publishMutation = usePublishArticle();
  const unscheduleMutation = useUnscheduleArticle();
  const [scheduleTarget, setScheduleTarget] = useState<AdminArticle | null>(null);

  const scheduled = useMemo(
    () =>
      [...articles]
        .filter((a) => a.status === "scheduled")
        .sort((a, b) => {
          const at = a.scheduled_at ? (parseLocalDatetime(a.scheduled_at)?.getTime() ?? 0) : 0;
          const bt = b.scheduled_at ? (parseLocalDatetime(b.scheduled_at)?.getTime() ?? 0) : 0;
          return at - bt;
        }),
    [articles],
  );

  const handlePublish = (article: AdminArticle) => {
    if (!article.id) return;
    if (confirm(`Publish "${article.title}" now?`)) {
      publishMutation.mutate(Number(article.id));
    }
  };

  const handleUnschedule = (article: AdminArticle) => {
    if (!article.id) return;
    if (confirm(`Cancel the scheduled publication for "${article.title}"?`)) {
      unscheduleMutation.mutate(Number(article.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading scheduled articles…
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Scheduled
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Newsletters waiting to be published at their scheduled time.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-background">
        {scheduled.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No scheduled newsletters yet. Schedule an approved article from the{" "}
            <Link to="/admin/content" className="text-primary hover:underline">
              newsletters list
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Scheduled for</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scheduled.map((article) => (
                  <tr key={article.slug} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground max-w-md truncate" title={article.title}>
                        {article.title}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{article.category}</td>
                    <td className="px-5 py-3">
                      <ArticleStatusBadge status={article.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {formatNaiveDatetime(article.scheduled_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setScheduleTarget(article)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnschedule(article)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePublish(article)}
                          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Publish now
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {scheduleTarget && (
        <SchedulePublicationModal
          article={scheduleTarget}
          onClose={() => setScheduleTarget(null)}
        />
      )}
    </>
  );
}
