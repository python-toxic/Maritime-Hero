// Mock data for the application until backend integration is complete

export const SAMPLE_ARTICLES = [
  {
    slug: "article-1",
    title: "IMO 2030 GHG Reduction Targets",
    category: "Regulations",
    updatedAt: "2024-11-15",
    status: "published" as const,
    author_id: 3,
  },
  {
    slug: "article-2",
    title: "Ship Recycling Basel Convention",
    category: "Compliance",
    updatedAt: "2024-11-10",
    status: "submitted" as const,
    author_id: 4,
    submitted_at: "2024-11-10T12:00:00Z",
  },
  {
    slug: "article-3",
    title: "Draft Safety Policy",
    category: "Safety",
    updatedAt: "2024-11-20",
    status: "draft" as const,
    author_id: 3,
  },
  {
    slug: "article-4",
    title: "Rejected Training Manual",
    category: "Safety",
    updatedAt: "2024-11-21",
    status: "rejected" as const,
    author_id: 3,
    review_history: [
      {
        id: 1,
        content_type: "article",
        content_id: "article-4",
        reviewer_id: 2,
        decision: "rejected",
        notes: "Please update the section on emergency protocols to match the latest 2024 guidelines.",
        created_at: "2024-11-21T14:30:00Z"
      }
    ]
  },
];

export const SAMPLE_FAQS = [
  {
    id: "faq-1",
    question: "What is ship recycling?",
    category: "General",
    updatedAt: "2024-11-12",
  },
  {
    id: "faq-2",
    question: "What are IMO regulations?",
    category: "Regulations",
    updatedAt: "2024-11-08",
  },
];

export const MOCK_USERS = [
  {
    id: 2,
    email: "manager@sosindia.org",
    role: "manager",
    status: "active",
    created_at: "2024-05-15T10:00:00Z",
  },
  {
    id: 3,
    email: "employee1@sosindia.org",
    role: "employee",
    status: "active",
    created_at: "2024-06-01T09:30:00Z",
  },
  {
    id: 4,
    email: "employee2@sosindia.org",
    role: "employee",
    status: "inactive",
    created_at: "2024-06-10T11:15:00Z",
  },
];

// Service layer functions (Promises simulate future backend API)

export async function fetchDashboardStats() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    totalUsers: 42,
    managers: 12,
    employees: 30,
    activeSessions: 8,
    draftNewsletters: 5,
    publishedNewsletters: SAMPLE_ARTICLES.length,
    draftFaqs: 3,
    publishedFaqs: SAMPLE_FAQS.length,
  };
}

export async function fetchRecentContent() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const recentItems = [
    ...SAMPLE_ARTICLES.map((a) => ({
      id: a.slug,
      type: "Article" as const,
      title: a.title,
      category: a.category,
      updatedAt: a.updatedAt,
      slug: a.slug,
    })),
    ...SAMPLE_FAQS.map((f) => ({
      id: f.id,
      type: "FAQ" as const,
      title: f.question,
      category: f.category,
      updatedAt: f.updatedAt,
      slug: f.id,
    })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
   .slice(0, 5);

  return recentItems;
}

export async function fetchUsers() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_USERS;
}

export async function fetchAdminArticles() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return SAMPLE_ARTICLES;
}

export async function reviewArticle(id: string | number, action: "approved" | "rejected", notes?: string, managerId?: number) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { id, action, notes, managerId };
}
