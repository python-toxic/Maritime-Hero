import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/lib/AuthContext";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin" />;
  }

  if (requiredPermission && !hasPermission(user.role as any, requiredPermission)) {
    // Redirect unauthorized users to content page (since dashboard is admin only)
    return <Navigate to="/admin/content" />;
  }

  return <>{children}</>;
}
