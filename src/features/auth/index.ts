/**
 * Auth feature - Frontend login page with role selection and password recovery
 * Prepared for future backend integration
 */

// Components
export { LoginPage } from "./components/LoginPage";
export { LoginForm } from "./components/LoginForm";
export { FormError } from "./components/FormError";
export { RoleSelector, type UserRole } from "./components/RoleSelector";
export { ForgotPasswordPage } from "./components/ForgotPasswordPage";
export { SecretCodeForm } from "./components/SecretCodeForm";
export { PasswordResetForm } from "./components/PasswordResetForm";

// Types
export type { LoginCredentials, AuthUser, AuthSession, AuthState, PasswordRecoveryConfig } from "./types";

// Auth library (hardcoded for development, replace with API calls in production)
export { validateCredentials, verifySecretCode, resetPassword, getSecretCodeHint } from "./lib/auth";
