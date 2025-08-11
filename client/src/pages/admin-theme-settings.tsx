import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { Palette, RefreshCw, Eye, Wand2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ThemeSettings {
  id?: number;
  primaryColor: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminThemeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [colorInput, setColorInput] = useState("#254696");
  const [previewColor, setPreviewColor] = useState("#254696");
  // Fetch current theme settings
  const { data: currentTheme, isLoading } = useQuery<ThemeSettings>({
    queryKey: ["/api/admin/theme/current"],
    retry: false,
  });

  // Update theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (settings: { primaryColor?: string }) => {
      const response = await fetch("/api/admin/theme/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update theme");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Theme updated successfully! Changes will be visible across the website.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/theme/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/theme/current"] });
      
      // Apply the new theme settings immediately
      if (data.theme.primaryColor) {
        applyThemeColor(data.theme.primaryColor);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update theme",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (currentTheme?.primaryColor) {
      setColorInput(currentTheme.primaryColor);
      setPreviewColor(currentTheme.primaryColor);
    }
  }, [currentTheme]);

  const applyThemeColor = (color: string) => {
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

    const hslValue = hexToHsl(color);
    document.documentElement.style.setProperty('--xtra-primary', `hsl(${hslValue})`);
  };



  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColorInput(newColor);
    setPreviewColor(newColor);
  };

  const handlePreview = () => {
    applyThemeColor(previewColor);
    toast({
      title: "Preview Applied",
      description: "This is a temporary preview. Click 'Update Theme' to save permanently.",
      variant: "default",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate hex color format
    if (!/^#[0-9A-F]{6}$/i.test(colorInput)) {
      toast({
        title: "Invalid Color",
        description: "Please enter a valid hex color code (e.g., #254696)",
        variant: "destructive",
      });
      return;
    }

    updateThemeMutation.mutate({ primaryColor: colorInput });
  };

  const resetToDefault = () => {
    const defaultColor = "#254696";
    setColorInput(defaultColor);
    setPreviewColor(defaultColor);
    applyThemeColor(defaultColor);
  };

  const predefinedColors = [
    { name: "Xtracover Blue", color: "#254696" },
    { name: "Professional Navy", color: "#1a365d" },
    { name: "Modern Purple", color: "#6b46c1" },
    { name: "Corporate Green", color: "#059669" },
    { name: "Tech Orange", color: "#ea580c" },
    { name: "Premium Gold", color: "#d97706" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Theme Settings</h1>
            <p className="text-muted-foreground">
              Customize the website's primary color theme and branding
            </p>
          </div>
          <Palette className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Picker Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Primary Color
              </CardTitle>
              <CardDescription>
                Choose the primary color for buttons, headers, and brand elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="colorInput">Hex Color Code</Label>
                  <div className="flex gap-3">
                    <Input
                      id="colorInput"
                      type="text"
                      value={colorInput}
                      onChange={handleColorChange}
                      placeholder="#254696"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1 font-mono"
                    />
                    <div 
                      className="w-12 h-10 rounded border-2 border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: previewColor }}
                      title={`Preview: ${previewColor}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color Picker</Label>
                  <input
                    type="color"
                    value={previewColor}
                    onChange={(e) => {
                      setColorInput(e.target.value.toUpperCase());
                      setPreviewColor(e.target.value.toUpperCase());
                    }}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateThemeMutation.isPending}
                    className="flex-1 bg-xtra-primary hover:bg-xtra-primary/90"
                  >
                    {updateThemeMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Palette className="h-4 w-4 mr-2" />
                    )}
                    Update Theme
                  </Button>
                </div>
              </form>

              <Button
                type="button"
                variant="ghost"
                onClick={resetToDefault}
                className="w-full"
              >
                Reset to Default
              </Button>
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Predefined Colors Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Colors</CardTitle>
              <CardDescription>
                Choose from predefined professional colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {predefinedColors.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => {
                      setColorInput(preset.color);
                      setPreviewColor(preset.color);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {preset.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {preset.color}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Theme Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
            <CardDescription>
              Active theme settings and preview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-background shadow-md"
                  style={{ backgroundColor: currentTheme?.primaryColor || "#254696" }}
                />
                <div>
                  <p className="font-medium">Primary Color</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {currentTheme?.primaryColor || "#254696"}
                  </p>
                </div>
              </div>
              
              {currentTheme?.updatedAt && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">
                    {new Date(currentTheme.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Sample UI Elements Preview */}
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-3 text-gray-700">UI Preview</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-xtra-primary text-white rounded text-sm">
                    Primary Button
                  </button>
                  <button className="px-4 py-2 border border-xtra-primary text-xtra-primary rounded text-sm">
                    Outline Button
                  </button>
                </div>
                <p className="text-sm">
                  Sample text with <span className="text-xtra-primary font-medium">primary color highlight</span>
                </p>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full w-1/2 bg-xtra-primary rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}