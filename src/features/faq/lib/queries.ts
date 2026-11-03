import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqsApi } from "@/lib/api";
import type { FAQ } from "../types";

// Map API response to local FAQ type
function mapFaqResponse(f: any): FAQ {
  return {
    ...f,
    category: f.category_name || f.category || "General",
    updatedAt: f.updated_at,
    id: f.id.toString(), // Frontend expects string ID, API returns number
  };
}
export function useAdminFaqs() {
  return useQuery<FAQ[], Error>({
    queryKey: ["admin", "faqs"],
    queryFn: async () => {
      const res = await faqsApi.list(1, 200, undefined, 'all');
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(mapFaqResponse);
      }
      return [];
    },
    staleTime: 30000,
    retry: false,
  });
}

export function useFaq(id: string | number) {
  return useQuery({
    queryKey: ["admin", "faqs", id],
    queryFn: async () => {
      try {
        const res = await faqsApi.get(Number(id));
        if (res.success && res.data) {
          return mapFaqResponse(res.data);
        }
      } catch (e) {
        // Fallback for not found
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useSaveFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faq: FAQ) => {
      // Only numeric IDs are persisted records; slug/temp strings mean "create"
      const numericId = Number(faq.id);
      const isNew = !faq.id || Number.isNaN(numericId);

      const payload = {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        status: faq.status,
        order: faq.order || 0,
        author_id: faq.author_id,
      };

      if (isNew) {
        const res = await faqsApi.create(payload);
        if (!res.success) {
          throw new Error((res as any).error || (res as any).message || "Failed to create FAQ");
        }

        const createdId = (res as any).id ?? (res.data as any)?.id;
        if (!createdId) {
          throw new Error("FAQ was not created. Please try again.");
        }

        return res.data && !Array.isArray(res.data)
          ? mapFaqResponse(res.data)
          : mapFaqResponse({ ...faq, id: createdId });
      }

      const res = await faqsApi.update(numericId, payload);
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to update FAQ");
      }
      return res.data ? mapFaqResponse(res.data) : { ...faq };
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "faqs"], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ["public", "faqs"], refetchType: 'all' });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await faqsApi.delete(Number(id));
      return res.data || { id };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "faqs"], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ["public", "faqs"], refetchType: 'all' });
    },
  });
}

export function useRelatedFaqs(category: string, limit = 3) {
  return useQuery<FAQ[]>({
    queryKey: ["public", "faqs", "related", category, limit],
    queryFn: async () => {
      try {
        const res = await faqsApi.list(1, limit, category, 'published');
        if (res.success && Array.isArray(res.data)) {
          return res.data.map(mapFaqResponse);
        }
      } catch (e) {
        // Ignored
      }
      return [];
    },
    enabled: !!category,
  });
}
