/**
 * Auth feature types
 * Prepared for future backend integration and role-based authentication
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "manager" | "employee";
  name: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface PasswordRecoveryConfig {
  secretCode?: string;
  email?: string;
}
