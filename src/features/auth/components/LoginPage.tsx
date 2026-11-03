import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LoginForm } from "./LoginForm";
import { RoleSelector, type UserRole } from "./RoleSelector";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoginCredentials } from "../types";
import { useAuth } from "../lib/AuthContext";
import { validateCredentials } from "../lib/auth";

type ViewMode = "login" | "forgot-password";

/**
 * Main login page for SOS India Admin Portal
 *
 * Flow:
 * 1. User selects role and submits credentials
 * 2. validateCredentials() calls the PHP backend (login.php)
 * 3. On success, AuthContext.login() stores the session (context + localStorage)
 * 4. AdminRouteContent detects isAuthenticated → renders AdminLayout + Outlet
 *
 * Password recovery: verify secret code → reset-password.php → user logs in again
 */
export function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("login");

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the real PHP backend
      const result = await validateCredentials(credentials, selectedRole);

      if (!result.success) {
        throw new Error(result.error || "Invalid credentials");
      }

      if (!result.user) {
        throw new Error("Login succeeded but no user data was returned.");
      }

      login(result.user, result.token || "session");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setViewMode("forgot-password");
    setError(null);
  };

  const handleBackFromForgotPassword = () => {
    setViewMode("login");
    setError(null);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Insights button */}
      <div className="absolute top-4 left-4">
        <Link
          to="/insights"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm hover:text-foreground hover:bg-accent transition-colors"
        >
          ← Back to Insights
        </Link>
      </div>
      <div className="w-full max-w-md space-y-8">
        {viewMode === "forgot-password" ? (
          // Forgot Password View
          <>
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="text-xl font-bold text-primary">SOS</div>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Password Recovery</h1>
              <p className="text-muted-foreground text-sm">
                Secure your account with your secret code
              </p>
            </div>

            <Card className="border border-border shadow-lg">
              <CardContent className="p-6">
                <ForgotPasswordPage onBack={handleBackFromForgotPassword} />
              </CardContent>
            </Card>
          </>
        ) : (
          // Login View
          <>
            {/* Branding Section */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="text-xl font-bold text-primary">SOS</div>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Portal</h1>
              <p className="text-muted-foreground text-sm">
                Secure access for content management
              </p>
            </div>

            {/* Role Selection */}
            <Card className="border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">Select Your Role</CardTitle>
              </CardHeader>
              <CardContent>
                <RoleSelector
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* Login Card */}
            <Card className="border border-border shadow-lg">
              <CardHeader className="space-y-1 pb-5">
                <CardTitle className="text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs">
                  Enter your credentials to access the admin dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm
                  role={selectedRole}
                  isLoading={isLoading}
                  error={error}
                  onSubmit={handleLogin}
                  onForgotPassword={handleForgotPassword}
                />
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground border border-border/50">
              <p>
                SOS India takes security seriously. Your credentials are never shared with
                third parties.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
