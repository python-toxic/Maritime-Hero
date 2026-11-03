/**
 * Auth library - Authentication logic and API calls
 * Connects to the PHP backend.
 */

import type { AuthUser, LoginCredentials } from "../types";

// Base URL for the PHP API. 
// We use a relative path '/api/auth' as fallback so it works instantly when deployed to public_html/api
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth` : "/api/auth";

/**
 * Validates login credentials against the PHP backend
 */
export async function validateCredentials(
  credentials: LoginCredentials,
  role: string
): Promise<{ success: boolean; error?: string; user?: AuthUser; token?: string }> {
  try {
    const response = await fetch(`${API_BASE}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        role: role,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.error || "Invalid credentials" };
    }

    const user: AuthUser = {
      id: String(data.user.id),
      email: data.user.email,
      role: data.user.role,
      name: data.user.email.split("@")[0],
    };

    return { success: true, user, token: "session" };
  } catch (err) {
    return { success: false, error: "Network error occurred." };
  }
}

/**
 * Verifies secret code for password recovery
 */
export async function verifySecretCode(
  email: string,
  secretCode: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/verify-secret-code.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        secretCode,
        role,
      }),
    });

    const data = await response.json();

    if (!data.valid) {
      return { success: false, error: data.error || "Invalid secret code." };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Network error occurred." };
  }
}

/**
 * Resets password in database
 */
export async function resetPassword(
  email: string,
  newPassword: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/reset-password.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        newPassword,
        role,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.error || "Failed to reset password." };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Network error occurred." };
  }
}

/**
 * Get secret code hint for user (for display only)
 */
export function getSecretCodeHint(role: string): string {
  // We keep the hints local so they display nicely without an API call
  const lengths: Record<string, number> = {
    admin: 10,
    manager: 12,
    employee: 13,
  };
  const codeLength = lengths[role] || 10;
  return `Secret code is ${codeLength} characters (format: ROLE@YEAR)`;
}
