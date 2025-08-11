import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ThemeSettings {
  id: number;
  primaryColor: string;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ThemeLoader() {
  const { data: themeSettings } = useQuery<ThemeSettings>({
    queryKey: ["/api/theme/current"],
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (themeSettings?.primaryColor) {
      // Convert hex to HSL for CSS variable
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l;

        l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
          }
          h /= 6;
        }

        return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
      };

      const hslValue = hexToHsl(themeSettings.primaryColor);
      document.documentElement.style.setProperty('--xtra-primary', `hsl(${hslValue})`);
    }
    
    if (themeSettings?.darkMode !== undefined) {
      if (themeSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeSettings]);

  // This component doesn't render anything visible
  return null;
}