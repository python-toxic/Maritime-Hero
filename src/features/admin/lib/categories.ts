import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";

const DEFAULT_ARTICLE_CATEGORIES = [
  "Regulations",
  "Compliance",
  "Safety",
  "Sustainability",
];

const DEFAULT_FAQ_CATEGORIES = [
  "General",
  "Services",
  "Training",
  "Compliance",
];

export type CategoryItem = {
  id: number;
  name: string;
  type: "articles" | "faqs";
  slug: string;
  created_at: string;
};

export function useArticleCategories() {
  return useQuery<string[]>({
    queryKey: ["admin", "categories", "articles"],
    queryFn: async () => {
      try {
        const res = await categoriesApi.list('articles');
        if (res.success && Array.isArray(res.data)) {
          return res.data.map((c: any) => c.name);
        }
      } catch (err) {
        // fallthrough to default
      }
      return DEFAULT_ARTICLE_CATEGORIES;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useFaqCategories() {
  return useQuery<string[]>({
    queryKey: ["admin", "categories", "faqs"],
    queryFn: async () => {
      try {
        const res = await categoriesApi.list('faqs');
        if (res.success && Array.isArray(res.data)) {
          return res.data.map((c: any) => c.name);
        }
      } catch (err) {
        // fallthrough to default
      }
      return DEFAULT_FAQ_CATEGORIES;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useCategoryList(type: "articles" | "faqs") {
  return useQuery<CategoryItem[]>({
    queryKey: ["categories", type],
    queryFn: async () => {
      const res = await categoriesApi.list(type);
      if (res.success && Array.isArray(res.data)) return res.data as CategoryItem[];
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, type }: { name: string; type: "articles" | "faqs"; }) => {
      const res = await categoriesApi.create({ name, type });
      if (!res.success) throw new Error(res.message || 'Failed to create category');
      return res.data;
    },

    onSuccess: (data, variables) => {
      const { type } = variables as { name: string; type: "articles" | "faqs" };
      const key = ["admin", "categories", type];

      qc.setQueryData<string[]>(key, (old = []) => {
        const name = (data && (data.name || data?.data?.name)) || (variables as any).name;
        if (old.includes(name)) return old;
        return [...old, name];
      });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, type }: { id: number; name: string; type: "articles" | "faqs" }) => {
      const res = await categoriesApi.update(id, { name, type });
      if (!res.success) throw new Error(res.message || 'Failed to update category');
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["admin", "categories", "articles"] });
      qc.invalidateQueries({ queryKey: ["admin", "categories", "faqs"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await categoriesApi.delete(id);
      if (!res.success) throw new Error(res.message || 'Failed to delete category');
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["admin", "categories", "articles"] });
      qc.invalidateQueries({ queryKey: ["admin", "categories", "faqs"] });
    },
  });
}