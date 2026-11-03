import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, FileText, HelpCircle, FileCheck, UserCheck, Loader2, Link2, Check, CalendarClock } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminArticles, useUsers } from "@/features/admin";
import { useAdminFaqs } from "@/features/faq";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SOS India Admin" }] }),
  component: () => (
    <ProtectedRoute requiredPermission="canViewDashboard">
      <Dashboard />
    </ProtectedRoute>
  ),
});

type RecentItem = {
  id: string;
  type: "Article" | "FAQ";
  title: string;
  category: string;
  updatedAt: string;
  slug: string;
};

function Dashboard() {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: articles = [], isLoading: articlesLoading } = useAdminArticles();
  const { data: faqs = [], isLoading: faqsLoading } = useAdminFaqs();
  const [copied, setCopied] = useState<string | null>(null);

  const loading = usersLoading || articlesLoading || faqsLoading;

  const stats = useMemo(() => {
    const managers = users.filter((u) => u.role === "manager").length;
    const employees = users.filter((u) => u.role === "employee").length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const draftNewsletters = articles.filter((a) => a.status === "draft").length;
    const scheduledNewsletters = articles.filter((a) => a.status === "scheduled").length;
    const publishedNewsletters = articles.filter((a) => a.status === "published").length;
    const draftFaqs = faqs.filter((f) => f.status === "draft").length;
    const publishedFaqs = faqs.filter((f) => f.status === "published").length;

    return {
      totalUsers: users.length,
      managers,
      employees,
      activeUsers,
      draftNewsletters,
      scheduledNewsletters,
      publishedNewsletters,
      draftFaqs,
      publishedFaqs,
    };
  }, [users, articles, faqs]);

  const recentItems = useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [
      ...articles.map((a) => ({
        id: String(a.id ?? a.slug),
        type: "Article" as const,
        title: a.title,
        category: a.category,
        updatedAt: a.updatedAt,
        slug: a.slug,
      })),
      ...faqs.map((f) => ({
        id: f.id,
        type: "FAQ" as const,
        title: f.question,
        category: f.category,
        updatedAt: f.updatedAt,
        slug: f.id,
      })),
    ];

    return items
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [articles, faqs]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const copyLink = async (type: "Article" | "FAQ", slug: string) => {
    const url =
      type === "Article"
        ? `${window.location.origin}/Insights/insights/${slug}`
        : `${window.location.origin}/Insights/faq#${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(slug);
    setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1800);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "yesterday";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Managers", value: stats.managers, icon: Users, color: "text-indigo-500" },
    { label: "Employees", value: stats.employees, icon: Users, color: "text-cyan-500" },
    { label: "Active Users", value: stats.activeUsers, icon: UserCheck, color: "text-green-500" },
    { label: "Draft Newsletters", value: stats.draftNewsletters, icon: FileText, color: "text-amber-500" },
    { label: "Scheduled Newsletters", value: stats.scheduledNewsletters, icon: CalendarClock, color: "text-orange-500" },
    { label: "Published Newsletters", value: stats.publishedNewsletters, icon: FileCheck, color: "text-emerald-500" },
    { label: "Draft FAQs", value: stats.draftFaqs, icon: HelpCircle, color: "text-orange-500" },
    { label: "Published FAQs", value: stats.publishedFaqs, icon: FileCheck, color: "text-teal-500" },
  ];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your published insights and FAQs.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </div>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium text-foreground">
            Recently updated content
          </h2>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/content"
              className="text-xs text-primary hover:underline"
            >
              View all articles
            </Link>
            <span className="text-border">|</span>
            <Link
              to="/admin/faq"
              className="text-xs text-primary hover:underline"
            >
              View all FAQs
            </Link>
          </div>
        </div>
        {recentItems.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No content updated yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentItems.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0 flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {item.type === "Article" ? (
                      <span
                        title="Article"
                        className="inline-flex items-center justify-center h-5 w-5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      >
                        <FileText className="h-3 w-3" />
                      </span>
                    ) : (
                      <span
                        title="FAQ"
                        className="inline-flex items-center justify-center h-5 w-5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      >
                        <HelpCircle className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {item.category} · Updated {formatDate(item.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() => copyLink(item.type, item.slug)}
                    title="Copy public link"
                    aria-label="Copy public link"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent"
                  >
                    {copied === item.slug ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {item.type === "Article" ? (
                    <Link
                      to="/admin/articles/$id/edit"
                      params={{ id: item.slug }}
                      className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      to="/admin/faq/$id/edit"
                      params={{ id: item.slug }}
                      className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
