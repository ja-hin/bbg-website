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

interface PartnerCommissionSettings {
  id: number;
  isActive: boolean;
  commissionType: 'percentage' | 'flat';
  commissionValue: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPartnerCommissionSettings() {
  useRequireAuth('admin');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isActive, setIsActive] = useState<boolean>(true);
  const [commissionType, setCommissionType] = useState<'percentage' | 'flat'>('flat');
  const [commissionValue, setCommissionValue] = useState<string>('25');

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['/api/admin/partner-commission/current'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Update form when data is loaded
  useEffect(() => {
    if (currentSettings) {
      setIsActive(currentSettings.isActive !== false);
      setCommissionType(currentSettings.commissionType || 'flat');
      setCommissionValue(currentSettings.commissionValue?.toString() || '25');
    }
  }, [currentSettings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { isActive: boolean; commissionType: string; commissionValue: number }) => {
      return apiRequest('/api/admin/partner-commission/update', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partner-commission/current'] });
      toast({
        title: "Settings Updated",
        description: "Partner commission settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update partner commission settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(commissionValue);
    if (isNaN(value) || value < 0) {
      toast({
        title: "Invalid Commission Value",
        description: "Please enter a valid non-negative number",
        variant: "destructive",
      });
      return;
    }

    if (commissionType === 'percentage' && value > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Percentage commission cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      isActive,
      commissionType,
      commissionValue: value,
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
            <h1 className="text-3xl font-bold">Partner Commission Settings</h1>
            <p className="text-gray-600">Configure commissions earned by referral partners for each BBG sale</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Commission Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label htmlFor="isActive" className="text-base font-medium">
                    Enable Partner Commissions
                  </Label>
                  <p className="text-sm text-gray-600">
                    When enabled, referral partners will earn commissions on BBG sales
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Commission Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Commission Type</Label>
                <RadioGroup
                  value={commissionType}
                  onValueChange={(value) => setCommissionType(value as 'percentage' | 'flat')}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="flex items-center space-x-1">
                      <Percent className="h-4 w-4" />
                      <span>Percentage of Sale</span>
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

              {/* Commission Value */}
              <div className="space-y-2">
                <Label htmlFor="commissionValue" className="text-base font-medium">
                  Commission {commissionType === 'percentage' ? 'Percentage' : 'Amount'}
                </Label>
                <div className="relative">
                  <Input
                    id="commissionValue"
                    type="number"
                    step={commissionType === 'percentage' ? '0.1' : '1'}
                    min="0"
                    max={commissionType === 'percentage' ? '100' : undefined}
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(e.target.value)}
                    placeholder={commissionType === 'percentage' ? '5' : '25'}
                    className="pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {commissionType === 'percentage' ? (
                      <Percent className="h-4 w-4 text-gray-400" />
                    ) : (
                      <IndianRupee className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {commissionType === 'percentage' 
                    ? 'Enter percentage (0-100)' 
                    : 'Enter flat commission amount in rupees'
                  }
                </p>
              </div>

              {/* Preview */}
              {isActive && commissionValue && parseFloat(commissionValue) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Commission Preview</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>
                      Partners will earn{' '}
                      {commissionType === 'percentage' 
                        ? `${commissionValue}% of each sale` 
                        : `₹${commissionValue} per sale`
                      }
                    </p>
                    {commissionType === 'percentage' && (
                      <div className="mt-2 space-y-1">
                        <p>• On ₹299 laptop BBG: ₹{Math.round(299 * (parseFloat(commissionValue) / 100))}</p>
                        <p>• On ₹99 mobile BBG: ₹{Math.round(99 * (parseFloat(commissionValue) / 100))}</p>
                        <p>• On ₹500 invoice value: ₹{Math.round(500 * (parseFloat(commissionValue) / 100))}</p>
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
                  <Label className="text-sm font-medium text-gray-600">Commission Type</Label>
                  <p className="text-sm font-semibold capitalize">
                    {currentSettings.commissionType}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Commission Value</Label>
                  <p className="text-sm font-semibold">
                    {currentSettings.commissionType === 'percentage' 
                      ? `${currentSettings.commissionValue}%` 
                      : `₹${currentSettings.commissionValue}`
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
