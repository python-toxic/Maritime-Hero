import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { AuthProvider, useAuth } from "@/features/auth/lib/AuthContext";

export const Route = createFileRoute("/admin")({
  component: AdminRouteWrapper,
});

function AdminRouteWrapper() {
  return (
    <AuthProvider>
      <AdminRouteContent />
    </AuthProvider>
  );
}

function AdminRouteContent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If we're at exactly /admin and authenticated, redirect based on role
  const isExactAdmin = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
  if (isAuthenticated && isExactAdmin) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/admin/content" />;
    }
  }

  return isAuthenticated ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <LoginPage />
  );
}
