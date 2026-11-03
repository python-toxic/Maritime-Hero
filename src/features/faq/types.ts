export type FAQCategory = string;

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  status: "draft" | "published";
  updatedAt: string; // ISO String
}

/** Default FAQ categories (seeds). Custom ones are managed via admin. */
export const FAQ_CATEGORIES: string[] = [
  "General",
  "Services",
  "Training",
  "Compliance",
];
