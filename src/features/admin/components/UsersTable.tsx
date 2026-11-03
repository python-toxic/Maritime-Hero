import { MoreHorizontal, Edit, UserX, UserCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUsers, useUpdateUserStatus, type AdminUser } from "@/features/admin/lib/users";

interface UsersTableProps {
  onEdit: (user: AdminUser) => void;
}

export function UsersTable({ onEdit }: UsersTableProps) {
  const { data: users = [], isLoading } = useUsers();
  const updateStatusMutation = useUpdateUserStatus();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const toggleStatus = (user: AdminUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateStatusMutation.mutate(
      { id: user.id, status: newStatus },
      { onSettled: () => setOpenDropdown(null) }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const manageableUsers = users.filter((user) => user.role !== "admin");

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created At</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {manageableUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                    ${
                      user.role === "manager"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                    ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === user.id ? null : user.id
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openDropdown === user.id && (
                      <div className="absolute right-0 top-full mt-1 z-10 w-40 rounded-md border border-border bg-background shadow-lg ring-1 ring-black/5 py-1">
                        <button
                          onClick={() => {
                            onEdit(user);
                            setOpenDropdown(null);
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                          Edit Role
                        </button>
                        <button
                          onClick={() => toggleStatus(user)}
                          disabled={updateStatusMutation.isPending}
                          className={`flex w-full items-center px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 ${
                            user.status === "active"
                              ? "text-destructive hover:text-destructive"
                              : "text-green-600 hover:text-green-700"
                          }`}
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Disable User
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Enable User
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {manageableUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
