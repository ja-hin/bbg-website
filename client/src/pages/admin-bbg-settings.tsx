import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BbgPriceSettings {
  id: number;
  laptopPrice: number;
  mobilePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBbgSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    laptopPrice: 299,
    mobilePrice: 99
  });

  // Fetch current BBG price settings
  const { data: currentSettings, isLoading: isLoadingSettings } = useQuery<BbgPriceSettings>({
    queryKey: ['/api/admin/bbg-prices/current'],
    retry: false,
  });

  // Update form when data loads
  useEffect(() => {
    if (currentSettings) {
      setFormData({
        laptopPrice: currentSettings.laptopPrice,
        mobilePrice: currentSettings.mobilePrice
      });
    }
  }, [currentSettings]);

  // Update BBG price settings mutation
  const updatePricesMutation = useMutation({
    mutationFn: async (data: { laptopPrice: number; mobilePrice: number }) => {
      return await apiRequest('/api/admin/bbg-prices/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "BBG price settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bbg-prices/current'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update BBG price settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!formData.laptopPrice || !formData.mobilePrice) {
      toast({
        title: "Validation Error",
        description: "Both laptop and mobile prices are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.laptopPrice <= 0 || formData.mobilePrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Prices must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    updatePricesMutation.mutate({
      laptopPrice: Number(formData.laptopPrice),
      mobilePrice: Number(formData.mobilePrice)
    });
  };

  const handleInputChange = (field: 'laptopPrice' | 'mobilePrice', value: string) => {
    // Allow only positive numbers with up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value === '' ? '' : Number(value)
      }));
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading BBG price settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">BBG Price Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configure BBG Prices
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set the BBG (Buy Back Guarantee) prices for laptop and mobile devices. These prices will be used across the application.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Laptop Price */}
              <div className="space-y-2">
                <Label htmlFor="laptopPrice" className="text-sm font-medium">
                  Laptop BBG Price (₹)
                </Label>
                <Input
                  id="laptopPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.laptopPrice}
                  onChange={(e) => handleInputChange('laptopPrice', e.target.value)}
                  placeholder="Enter laptop BBG price"
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Current price for laptop BBG coverage
                </p>
              </div>

              {/* Mobile Price */}
              <div className="space-y-2">
                <Label htmlFor="mobilePrice" className="text-sm font-medium">
                  Mobile BBG Price (₹)
                </Label>
                <Input
                  id="mobilePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.mobilePrice}
                  onChange={(e) => handleInputChange('mobilePrice', e.target.value)}
                  placeholder="Enter mobile BBG price"
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Current price for mobile BBG coverage
                </p>
              </div>
            </div>

            {/* Current Settings Display */}
            {currentSettings && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Active Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Laptop Price:</span>
                    <span className="ml-2 font-medium">₹{currentSettings.laptopPrice}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile Price:</span>
                    <span className="ml-2 font-medium">₹{currentSettings.mobilePrice}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="ml-2 font-medium">
                      {new Date(currentSettings.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updatePricesMutation.isPending}
                className="flex items-center gap-2"
              >
                {updatePricesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updatePricesMutation.isPending ? "Updating..." : "Update Prices"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Important Notes</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Price changes will take effect immediately across the application</li>
              <li>• These prices are displayed to customers during BBG registration</li>
              <li>• Ensure prices are competitive and align with your business model</li>
              <li>• All prices are in Indian Rupees (₹)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}