import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";

export interface AdminUser {
  id: number;
  email: string;
  role: "manager" | "employee" | "admin";
  status: "active" | "inactive";
  created_at: string;
  updated_at?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  secret_code?: string;
  role: "manager" | "employee";
  status: "active" | "inactive";
}

function mapUserResponse(u: any): AdminUser {
  return {
    id: Number(u.id),
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

export function useUsers() {
  return useQuery<AdminUser[], Error>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await usersApi.list();
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(mapUserResponse);
      }
      return [];
    },
    staleTime: 30000,
    retry: false,
  });
}

export function useSaveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      id,
    }: {
      user: UserFormData;
      id?: number;
    }) => {
      if (id) {
        const payload: Record<string, string> = {
          role: user.role,
          status: user.status,
        };
        if (user.password) payload.password = user.password;
        if (user.secret_code) payload.secret_code = user.secret_code;

        const res = await usersApi.update(id, payload);
        if (!res.success) {
          throw new Error((res as any).error || (res as any).message || "Failed to update user");
        }
        return res.data ? mapUserResponse(res.data) : { ...user, id, email: user.email } as AdminUser;
      }

      const res = await usersApi.create({
        email: user.email,
        password: user.password,
        secret_code: user.secret_code,
        role: user.role,
        status: user.status,
      });
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to create user");
      }

      const createdId = (res as any).id ?? (res.data as any)?.id;
      if (!createdId) {
        throw new Error("User was not created. Please try again.");
      }

      return res.data && !Array.isArray(res.data)
        ? mapUserResponse(res.data)
        : mapUserResponse({ ...user, id: createdId, created_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "active" | "inactive";
    }) => {
      const res = await usersApi.update(id, { status });
      if (!res.success) {
        throw new Error((res as any).error || (res as any).message || "Failed to update user status");
      }
      return res.data ? mapUserResponse(res.data) : { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
