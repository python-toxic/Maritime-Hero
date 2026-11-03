import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api";
import type { Article } from "../types";

function mapArticle(a: any): Article {
  return {
    ...a,
    category: a.category_name || a.category || "General",
    publishedAt: a.created_at,
    coverImage: a.featured_image_url || "",
    readingTime: a.readingTime || Math.ceil(JSON.stringify(a.body).length / 1000) || 5,
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  // For frontend development, return undefined (no API call)
  return undefined;
}

export async function getRelatedArticles(slug: string, limit = 3): Promise<Article[]> {
  // For frontend development, return empty array (no API calls)
  return [];
}

export function useRelatedArticles(slug: string, limit = 3) {
  return useQuery({
    queryKey: ["public", "articles", "related", slug, limit],
    queryFn: () => getRelatedArticles(slug, limit),
    enabled: !!slug
  });
}

export function usePublicArticles(query = "", category = "All", page = 1, limit = 6) {
  return useQuery<{ articles: Article[], totalPages: number }, Error>({
    queryKey: ["public", "articles", query, category, page, limit],
    queryFn: async () => {
      // For frontend development, return empty list (no API calls)
      return { articles: [], totalPages: 1 };
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
  });
}
