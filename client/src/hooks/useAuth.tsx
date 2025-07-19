import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const { data: adminUser, isLoading, error, refetch } = useQuery<AdminUser>({
    queryKey: ["/api/admin/me"],
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute to check session status
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Listen for logout and login events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_logout' && e.newValue) {
        // Clear all queries and redirect to login
        queryClient.clear();
        setLocation("/admin/login");
      } else if (e.key === 'admin_login' && e.newValue) {
        // Refresh authentication state when login occurs in another tab
        refetch();
      }
    };

    // Listen for broadcast channel messages (cross-tab communication)
    const handleBeforeUnload = () => {
      // Cleanup on page unload
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [queryClient, setLocation]);

  // Check authentication status more frequently when window is focused
  useEffect(() => {
    const handleFocus = () => {
      // Force a fresh check when tab becomes active
      refetch();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Force a fresh check when tab becomes visible
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const isAuthenticated = !isLoading && !!adminUser && !error;
  const authenticationFailed = !isLoading && !adminUser && error;

  return {
    adminUser,
    isLoading,
    isAuthenticated,
    authenticationFailed,
    redirectToLogin: () => setLocation("/admin/login"),
    refetchAuth: refetch
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