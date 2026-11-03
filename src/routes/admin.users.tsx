import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "@/features/admin/components/UsersTable";
import { UserForm } from "@/features/admin/components/UserForm";
import type { AdminUser } from "@/features/admin/lib/users";
import { useState } from "react";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — SOS India Admin" }] }),
  component: UsersPage,
});

import { ProtectedRoute } from "@/components/ProtectedRoute";

function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  return (
    <ProtectedRoute requiredPermission="canManageUsers">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              User Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage roles and access for managers and employees.
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </button>
        </div>

        <UsersTable onEdit={handleEditUser} />

        {isFormOpen && (
          <UserForm
            user={selectedUser}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
