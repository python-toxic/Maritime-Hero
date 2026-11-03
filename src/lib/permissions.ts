export type Role = "admin" | "manager" | "employee";

export type Permission =
  | "canManageUsers"
  | "canPublishContent"
  | "canViewLogs"
  | "canManageSettings"
  | "canManageFaqs"
  | "canManageNewsletters"
  | "canReviewContent"
  | "canScheduleContent"
  | "canCreateContent"
  | "canEditOwnContent"
  | "canViewDashboard";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "canManageUsers",
    "canPublishContent",
    "canViewLogs",
    "canManageSettings",
    "canManageFaqs",
    "canManageNewsletters",
    "canReviewContent",
    "canScheduleContent",
    "canCreateContent",
    "canEditOwnContent",
    "canViewDashboard",
  ],
  manager: [
    "canManageNewsletters",
    "canManageFaqs",
    "canPublishContent",
    "canReviewContent",
    "canScheduleContent",
  ],
  employee: [
    "canManageNewsletters",
    "canManageFaqs",
    "canCreateContent",
    "canEditOwnContent",
  ],
};

/**
 * Helper to check if a role has a specific permission
 */
export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
