import React from "react";
import { cn } from "@/lib/utils";

export type UserRole = "admin" | "manager" | "employee";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
}

const ROLES: { id: UserRole; label: string; description: string }[] = [
  { id: "admin", label: "Admin", description: "Full access" },
  { id: "manager", label: "Manager", description: "Content management" },
  { id: "employee", label: "Employee", description: "Limited access" },
];

/**
 * Role selector component with three role options
 * Allows users to select their role before login
 */
export function RoleSelector({
  selectedRole,
  onRoleChange,
  disabled = false,
}: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Select Role
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              selectedRole === role.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
            aria-pressed={selectedRole === role.id}
            aria-label={`${role.label} - ${role.description}`}
          >
            <span className="text-sm font-semibold">{role.label}</span>
            <span className="text-xs text-muted-foreground">{role.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
