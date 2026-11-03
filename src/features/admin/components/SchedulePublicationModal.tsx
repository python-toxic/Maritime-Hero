import { useState } from "react";
import type { AdminArticle } from "@/features/admin/types";
import { useScheduleArticle } from "@/features/admin/lib/articles";
import {
  datetimeLocalToApi,
  defaultScheduledDatetimeLocal,
  mysqlToDatetimeLocal,
  parseLocalDatetime,
} from "@/lib/datetime";

interface Props {
  article: AdminArticle;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SchedulePublicationModal({ article, onClose, onSuccess }: Props) {
  const scheduleMutation = useScheduleArticle();
  const [scheduledAt, setScheduledAt] = useState(
    article.scheduled_at
      ? mysqlToDatetimeLocal(article.scheduled_at) ?? defaultScheduledDatetimeLocal()
      : defaultScheduledDatetimeLocal(),
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const selected = parseLocalDatetime(scheduledAt);
    if (!selected) {
      setError("Please enter a valid date and time.");
      return;
    }
    if (selected.getTime() <= Date.now()) {
      setError("Scheduled time must be in the future.");
      return;
    }

    const apiValue = datetimeLocalToApi(scheduledAt);
    if (!apiValue) {
      setError("Please enter a valid date and time.");
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        id: Number(article.id),
        scheduledAt: apiValue,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule article");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
      >
        <h3 className="text-base font-semibold text-foreground">Schedule publication</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose when &ldquo;{article.title}&rdquo; should go live.
        </p>

        <div className="mt-4">
          <label htmlFor="scheduled-at" className="mb-1.5 block text-xs font-medium text-foreground">
            Publish date & time
          </label>
          <input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={scheduleMutation.isPending}
            onClick={handleSubmit}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {scheduleMutation.isPending ? "Scheduling…" : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
