import type { ArticleStatus } from "@/features/admin/types";

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  rejected: "Rejected",
};

const STATUS_CLASSES: Record<ArticleStatus, string> = {
  draft: "text-muted-foreground",
  submitted: "text-blue-600 dark:text-blue-400",
  approved: "text-indigo-600 dark:text-indigo-400",
  scheduled: "text-amber-600 dark:text-amber-400",
  published: "text-emerald-600 dark:text-emerald-400",
  rejected: "text-destructive",
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`text-xs font-medium capitalize ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
