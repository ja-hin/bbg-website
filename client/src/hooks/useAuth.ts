import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}

export function useRequireAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  // If not authenticated and not loading, redirect to login
  useEffect(() => {
    if (!isLoading && !user && !error) {
      window.location.href = "/admin/login";
    }
  }, [isLoading, user, error]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}