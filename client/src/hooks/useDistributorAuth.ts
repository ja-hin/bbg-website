import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Distributor {
  id: number;
  name: string;
  businessName?: string;
  contact: string;
  email: string;
  sellerCode: string;
}

interface DistributorStats {
  totalCustomers: number;
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
}

export function useDistributorAuth() {
  const queryClient = useQueryClient();

  // Get distributor session
  const { data: distributor, isLoading, error } = useQuery({
    queryKey: ["/api/distributor/me"],
    retry: false,
    enabled: !!getStoredToken(),
    staleTime: 0, // Don't cache distributor data
    meta: {
      headers: {
        Authorization: `Bearer ${getStoredToken()}`
      }
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ contact, otp }: { contact: string; otp: string }) => {
      // Clear all previous cache and tokens before login
      queryClient.clear();
      localStorage.removeItem('distributorToken');
      
      const response = await apiRequest("/api/distributor/login", {
        method: "POST",
        body: { contact, otp }
      });
      
      // Store new session token
      localStorage.setItem('distributorToken', response.sessionToken);
      return response;
    },
    onSuccess: () => {
      // Force refresh all distributor-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/distributor/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/distributor/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/distributor/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/distributor/payouts"] });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getStoredToken();
      if (token) {
        await apiRequest("/api/distributor/logout", {
          method: "POST",
          body: { sessionToken: token }
        });
      }
      
      // Clear all local storage and cache
      localStorage.removeItem('distributorToken');
      queryClient.clear();
    },
    onSuccess: () => {
      // Force clear all cache and redirect
      queryClient.clear();
      window.location.href = "/distributor/login";
    }
  });

  return {
    distributor: (distributor as any)?.distributor,
    isLoading,
    isAuthenticated: !!(distributor as any)?.distributor && !error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error
  };
}

export function useDistributorStats() {
  return useQuery<DistributorStats>({
    queryKey: ["/api/distributor/stats"],
    enabled: !!getStoredToken(),
    staleTime: 0, // Always fetch fresh data
    meta: {
      headers: {
        Authorization: `Bearer ${getStoredToken()}`
      }
    }
  });
}

export function useDistributorCustomers() {
  return useQuery({
    queryKey: ["/api/distributor/customers"],
    enabled: !!getStoredToken(),
    staleTime: 0, // Always fetch fresh data
    meta: {
      headers: {
        Authorization: `Bearer ${getStoredToken()}`
      }
    }
  });
}

export function useDistributorPayouts() {
  return useQuery({
    queryKey: ["/api/distributor/payouts"],
    enabled: !!getStoredToken(),
    staleTime: 0, // Always fetch fresh data
    meta: {
      headers: {
        Authorization: `Bearer ${getStoredToken()}`
      }
    }
  });
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('distributorToken');
}