export type Category = string;

export type Block =
  | { type: "p"; text: string }
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "h5"; text: string }
  | { type: "h6"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" };

export interface Article {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  publishedAt: string; // ISO
  readingTime: number; // minutes
  coverImage: string;
  author: string;
  body: Block[];
  content_source?: "cms" | "pdf";
  pdf_file_path?: string | null;
}

/** Default article categories (seeds). Custom ones are managed via admin. */
export const CATEGORIES: string[] = [
  "Regulations",
  "Compliance",
  "Safety",
  "Sustainability",
];
