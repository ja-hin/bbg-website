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
    staleTime: 60000, // 1 minute - increased to reduce checks
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
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

  // Removed excessive authentication checking to prevent modal spam

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
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (authenticationFailed) {
      // Silent redirect without showing error modals
      setLocation("/admin/login");
    }
  }, [authenticationFailed, setLocation]);

  return {
    isLoading,
    isAuthenticated
  };
}