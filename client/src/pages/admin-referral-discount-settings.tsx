import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AdminLayout } from "@/components/admin-layout";
import { Loader2, Percent, IndianRupee, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ReferralDiscountSettings {
  id: number;
  isActive: boolean;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReferralDiscountSettings() {
  useRequireAuth('admin');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isActive, setIsActive] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/referral-discount/current'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Update form when data is loaded
  useEffect(() => {
    if (currentSettings) {
      setIsActive(currentSettings.isActive || false);
      setDiscountType(currentSettings.discountType || 'percentage');
      setDiscountValue(currentSettings.discountValue?.toString() || '10');
    }
  }, [currentSettings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { isActive: boolean; discountType: string; discountValue: number }) => {
      return apiRequest('/api/admin/referral-discount/update', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referral-discount/current'] });
      toast({
        title: "Settings Updated",
        description: "Referral discount settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update referral discount settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) {
      toast({
        title: "Invalid Discount Value",
        description: "Please enter a valid non-negative number",
        variant: "destructive",
      });
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      isActive,
      discountType,
      discountValue: value,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Referral Discount Settings</h1>
            <p className="text-gray-600">Configure discounts for customers using referral codes</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label htmlFor="isActive" className="text-base font-medium">
                    Enable Referral Discounts
                  </Label>
                  <p className="text-sm text-gray-600">
                    When enabled, customers using valid referral codes will receive discounts
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Discount Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Discount Type</Label>
                <RadioGroup
                  value={discountType}
                  onValueChange={(value) => setDiscountType(value as 'percentage' | 'flat')}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="flex items-center space-x-1">
                      <Percent className="h-4 w-4" />
                      <span>Percentage</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flat" id="flat" />
                    <Label htmlFor="flat" className="flex items-center space-x-1">
                      <IndianRupee className="h-4 w-4" />
                      <span>Flat Amount</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label htmlFor="discountValue" className="text-base font-medium">
                  Discount {discountType === 'percentage' ? 'Percentage' : 'Amount'}
                </Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    type="number"
                    step={discountType === 'percentage' ? '1' : '1'}
                    min="0"
                    max={discountType === 'percentage' ? '100' : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '10' : '50'}
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {discountType === 'percentage' ? (
                      <Percent className="h-4 w-4 text-gray-400" />
                    ) : (
                      <IndianRupee className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {discountType === 'percentage' 
                    ? 'Enter percentage (0-100)' 
                    : 'Enter flat discount amount in rupees'
                  }
                </p>
              </div>

              {/* Preview */}
              {isActive && discountValue && parseFloat(discountValue) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Discount Preview</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      Customers using referral codes will get{' '}
                      {discountType === 'percentage' 
                        ? `${discountValue}% off` 
                        : `₹${discountValue} off`
                      } their BBG purchase
                    </p>
                    {discountType === 'percentage' && (
                      <div className="mt-2 space-y-1">
                        <p>• Laptop BBG (₹499): ₹{Math.round(499 * (1 - parseFloat(discountValue) / 100))}</p>
                        <p>• Mobile BBG (₹299): ₹{Math.round(299 * (1 - parseFloat(discountValue) / 100))}</p>
                      </div>
                    )}
                    {discountType === 'flat' && (
                      <div className="mt-2 space-y-1">
                        <p>• Laptop BBG (₹499): ₹{Math.max(0, 499 - parseFloat(discountValue))}</p>
                        <p>• Mobile BBG (₹299): ₹{Math.max(0, 299 - parseFloat(discountValue))}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Settings Display */}
        {currentSettings && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <p className={`text-sm font-semibold ${currentSettings.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {currentSettings.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Discount Type</Label>
                  <p className="text-sm font-semibold capitalize">
                    {currentSettings.discountType}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Discount Value</Label>
                  <p className="text-sm font-semibold">
                    {currentSettings.discountType === 'percentage' 
                      ? `${currentSettings.discountValue}%` 
                      : `₹${currentSettings.discountValue}`
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm">
                    {currentSettings.updatedAt 
                      ? new Date(currentSettings.updatedAt).toLocaleDateString() 
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}