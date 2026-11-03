import type { Article } from "@/features/insights";

export interface ReviewHistory {
  id: number;
  content_type: "article" | "faq";
  content_id: string | number;
  reviewer_id: number;
  decision: "submitted" | "approved" | "rejected" | "scheduled" | "published";
  notes?: string;
  created_at: string;
}

export type ArticleStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export type AdminArticle = Article & {
  status: ArticleStatus;
  updatedAt: string;
  author_id?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  scheduled_at?: string;
  published_at?: string;
  review_history?: ReviewHistory[];
};
