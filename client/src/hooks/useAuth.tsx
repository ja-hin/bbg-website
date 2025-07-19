import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: adminUser, isLoading, error } = useQuery<AdminUser>({
    queryKey: ["/api/admin/me"],
    retry: 1,
    retryDelay: 1000
  });

  const isAuthenticated = !isLoading && !!adminUser && !error;
  const authenticationFailed = !isLoading && !adminUser && error;

  return {
    adminUser,
    isLoading,
    isAuthenticated,
    authenticationFailed,
    redirectToLogin: () => setLocation("/admin/login")
  };
}

export function useRequireAuth() {
  const { isLoading, isAuthenticated, authenticationFailed, redirectToLogin } = useAuth();

  useEffect(() => {
    if (authenticationFailed) {
      redirectToLogin();
    }
  }, [authenticationFailed, redirectToLogin]);

  return {
    isLoading,
    isAuthenticated
  };
}