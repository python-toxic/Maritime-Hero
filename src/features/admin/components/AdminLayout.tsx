import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode, useRef } from "react";
import { Menu, X, ChevronDown, Plus, LayoutDashboard, Users, FileText, HelpCircle, ClipboardCheck, CalendarClock } from "lucide-react";
import { useAuth } from "@/features/auth/lib/AuthContext";
import { hasPermission, type Permission } from "@/lib/permissions";

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu AND dropdown on route change
  useEffect(() => {
    setOpen(false);
    setCreateDropdownOpen(false);
  }, [pathname]);

  const toggleDropdown = (e: React.MouseEvent) => {
    setCreateDropdownOpen(!createDropdownOpen);
  };

  const nav: { to: string; label: string; icon: any; permission?: Permission }[] = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "canViewDashboard" },
    { to: "/admin/reviews", label: "Review Queue", icon: ClipboardCheck, permission: "canReviewContent" },
    { to: "/admin/users", label: "Users", icon: Users, permission: "canManageUsers" },
    { to: "/admin/content", label: "Newsletters", icon: FileText, permission: "canManageNewsletters" },
    { to: "/admin/scheduled", label: "Scheduled", icon: CalendarClock, permission: "canScheduleContent" },
    { to: "/admin/faq", label: "FAQs", icon: HelpCircle, permission: "canManageFaqs" },
  ];

  const filteredNav = nav.filter((n) => 
    !n.permission || hasPermission(user?.role as any, n.permission)
  );

  const isActive = (to: string) => {
    if (to === "/admin/reviews") return pathname.startsWith("/admin/reviews");
    if (to === "/admin/content") return pathname.startsWith("/admin/content") || pathname.startsWith("/admin/articles");
    if (to === "/admin/scheduled") return pathname.startsWith("/admin/scheduled");
    if (to === "/admin/faq") return pathname.startsWith("/admin/faq");
    if (to === "/admin/users") return pathname.startsWith("/admin/users");
    return pathname === to;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border bg-background md:flex sticky top-0 h-screen">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link to="/admin/dashboard" className="truncate text-lg font-bold text-foreground">
            SOS India <span className="text-muted-foreground font-normal capitalize">· {user?.role || "Admin"}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {filteredNav.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                    (isActive(n.to)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          {/* Create Button Dropdown */}
          <div ref={dropdownRef} className="relative w-full">
            <button
              onClick={toggleDropdown}
              className="flex w-full items-center justify-between gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/80 focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create New</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${createDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {createDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-md border border-border bg-background shadow-lg ring-1 ring-black/5 py-1 z-50">
                <Link
                  to="/admin/articles/new"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  onClick={() => setCreateDropdownOpen(false)}
                >
                  <FileText className="h-4 w-4" />
                  <span>Newsletter</span>
                </Link>
                <Link
                  to="/admin/faq/new"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  onClick={() => setCreateDropdownOpen(false)}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>FAQ</span>
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/admin" });
            }}
            className="mt-4 flex w-full items-center justify-start gap-3 rounded-md px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <Link to="/admin/dashboard" className="truncate text-lg font-bold text-foreground">
            SOS India <span className="text-muted-foreground font-normal capitalize">· {user?.role || "Admin"}</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {open && (
          <div className="border-b border-border bg-background md:hidden">
            <nav className="flex flex-col space-y-1 px-4 py-4">
              {filteredNav.map((n) => {
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors " +
                      (isActive(n.to)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground")
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {n.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/admin" });
                }}
                className="mt-4 flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <X className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
