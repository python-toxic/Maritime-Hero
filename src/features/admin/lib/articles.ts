import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi, { articlesApi } from "@/lib/api";
import type { AdminArticle } from "../types";
import { CATEGORIES } from "@/features/insights";
import { parseArticleBody } from "../components/editor/parseBody";

export const ADMIN_CATEGORIES = CATEGORIES;

// Map the API response format to our frontend AdminArticle type
function mapArticleResponse(a: any): AdminArticle {
  const body = parseArticleBody(a.body);

  return {
    ...a,
    category: a.category_name || a.category || "General",
    author: a.author || "SOS India Editorial",
    publishedAt: a.published_at || a.created_at,
    updatedAt: a.updated_at || a.updatedAt,
    scheduled_at: a.scheduled_at || undefined,
    published_at: a.published_at || undefined,
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

// Map frontend article object to the payload the PHP API expects
function mapArticleToPayload(article: any) {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    featured_image_url: article.coverImage || article.featured_image_url || "",
    body:
      typeof article.body === "string"
        ? article.body
        : JSON.stringify(article.body),
    category: article.category,
    status: article.status,
    author: article.author,
    author_id: article.author_id,
    content_source: article.content_source || "cms",
    ...(article.pdf_file_path ? { pdf_file_path: article.pdf_file_path } : {}),
    ...(article.submitted_at ? { submitted_at: article.submitted_at } : {}),
    ...(article.approved_by ? { approved_by: article.approved_by } : {}),
    ...(article.approved_at ? { approved_at: article.approved_at } : {}),
  };
}

/**
 * List ALL articles for admin panel (no status filter).
 * Uses fetchApi directly to avoid the default status=published filter.
 */
export function useAdminArticles() {
  return useQuery<AdminArticle[], Error>({
    queryKey: ["admin", "articles"],
    queryFn: async () => {
      const res = await fetchApi<any[]>("/articles/?page=1&limit=200");
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(mapArticleResponse);
      }
      return [];
    },
    staleTime: 30000,
    retry: false,
  });
}

/**
 * Fetch a single article by slug or numeric ID.
 * Tries slug lookup first, falls back to ID lookup.
 */
export function useArticle(idOrSlug: string | number) {
  return useQuery({
    queryKey: ["admin", "articles", idOrSlug],
    queryFn: async () => {
      try {
        const res = await articlesApi.get(idOrSlug);
        if (res.success && res.data) {
          return mapArticleResponse(res.data);
        }
      } catch {
        /* article not found */
      }
      return null;
    },
    enabled: !!idOrSlug,
  });
}

/**
 * Save (create or update) an article via the PHP API.
 * Decides create vs update based on whether article.id exists.
 */
export function useSaveArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: any) => {
      const payload = mapArticleToPayload(article);
      if (article.id) {
        const res = await articlesApi.update(Number(article.id), payload);
        if (!res.success) {
          throw new Error((res as any).error || (res as any).message || "Failed to update article");
        }
        return res.data || { ...article };
      }

      const res = await articlesApi.create(payload);
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to create article");
      }

      const createdId = (res as any).id ?? (res.data as any)?.id;
      if (!createdId) {
        throw new Error("Article was not created. Please try again.");
      }

      return res.data || { ...article, id: createdId };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"], refetchType: 'all' });
    },
  });
}

/**
 * Delete an article via the PHP API.
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await articlesApi.delete(id);
      return res.data || { id };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ["insights"], refetchType: 'all' });
    },
  });
}

/**
 * Approve or reject an article.
 * Uses articlesApi.update to change the status and associated fields.
 */
export function useReviewArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      notes,
      managerId,
    }: {
      id: string | number;
      action: "approved" | "rejected";
      notes?: string;
      managerId?: number;
    }) => {
      const updatePayload: any = { status: action };
      if (action === "approved") {
        updatePayload.approved_by = managerId;
        updatePayload.approved_at = new Date().toISOString();
      }
      if (notes) {
        updatePayload.review_notes = notes;
      }
      const res = await articlesApi.update(Number(id), updatePayload);
      return res.data || { id, action };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"], refetchType: 'all' });
    },
  });
}

export function useScheduleArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      scheduledAt,
    }: {
      id: number;
      scheduledAt: string;
    }) => {
      const res = await articlesApi.schedule(id, scheduledAt);
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to schedule article");
      }
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"], refetchType: 'all' });
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await articlesApi.publish(id);
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to publish article");
      }
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ["insights"], refetchType: 'all' });
    },
  });
}

export function useUnscheduleArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await articlesApi.unschedule(id);
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to cancel schedule");
      }
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"], refetchType: 'all' });
    },
  });
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || `article-${Date.now()}`
  );
}
