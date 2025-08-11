import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

export interface ThemeSettings {
  id: number;
  primaryColor: string;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useTheme() {
  const queryClient = useQueryClient();

  const { data: themeSettings, isLoading } = useQuery({
    queryKey: ["/api/theme/current"],
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (settings: { primaryColor?: string; darkMode?: boolean }) => {
      await apiRequest("/api/admin/theme/update", {
        method: "POST",
        body: JSON.stringify(settings),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/theme/current"] });
    },
  });

  // Apply theme to document
  useEffect(() => {
    if (themeSettings?.primaryColor) {
      document.documentElement.style.setProperty("--xtra-primary", themeSettings.primaryColor);
    }
    
    if (themeSettings?.darkMode !== undefined) {
      if (themeSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [themeSettings]);

  const setTheme = (settings: { primaryColor?: string; darkMode?: boolean }) => {
    updateThemeMutation.mutate(settings);
  };

  const toggleDarkMode = () => {
    const currentDarkMode = themeSettings?.darkMode || false;
    setTheme({ darkMode: !currentDarkMode });
  };

  return {
    theme: themeSettings,
    isLoading,
    setTheme,
    toggleDarkMode,
    isUpdating: updateThemeMutation.isPending,
  };
}