import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminLayout } from "@/components/admin-layout";
import { Loader2, IndianRupee, Settings, Server, Smartphone, Laptop } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PartnerCommissionSettings {
  id: number;
  isActive: boolean;
  mobileAmount: number;
  laptopAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPartnerCommissionSettings() {
  useRequireAuth();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isActive, setIsActive] = useState<boolean>(true);
  const [mobileAmount, setMobileAmount] = useState<string>('100');
  const [laptopAmount, setLaptopAmount] = useState<string>('175');

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery<PartnerCommissionSettings>({
    queryKey: ['/api/admin/partner-commission'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Update form when data is loaded
  useEffect(() => {
    if (currentSettings) {
      setIsActive(currentSettings.isActive !== false);
      setMobileAmount(currentSettings.mobileAmount?.toString() || '100');
      setLaptopAmount(currentSettings.laptopAmount?.toString() || '175');
    }
  }, [currentSettings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { isActive: boolean; mobileAmount: number; laptopAmount: number }) => {
      return apiRequest('/api/admin/partner-commission', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partner-commission'] });
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
    
    const mobileVal = parseFloat(mobileAmount);
    const laptopVal = parseFloat(laptopAmount);
    
    if (isNaN(mobileVal) || mobileVal < 0 || isNaN(laptopVal) || laptopVal < 0) {
      toast({
        title: "Invalid Values",
        description: "Please enter valid non-negative commission amounts",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      isActive,
      mobileAmount: mobileVal,
      laptopAmount: laptopVal,
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
            <p className="text-gray-600">Configure device-specific commissions earned by referral partners</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Commission Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isActive" className="text-base font-medium">
                      Enable Partner Commissions
                    </Label>
                    <p className="text-sm text-gray-600">
                      When enabled, referral partners will earn commissions on new sales based on the rates below.
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Commission */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                      </div>
                      <Label htmlFor="mobileAmount" className="text-base font-medium">
                        Mobile Commission
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <Input
                        id="mobileAmount"
                        type="number"
                        min="0"
                        step="1"
                        value={mobileAmount}
                        onChange={(e) => setMobileAmount(e.target.value)}
                        className="pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <IndianRupee className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Fixed amount per mobile plan sale
                    </p>
                  </div>

                  {/* Laptop Commission */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Laptop className="h-5 w-5 text-indigo-600" />
                      </div>
                      <Label htmlFor="laptopAmount" className="text-base font-medium">
                        Laptop Commission
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <Input
                        id="laptopAmount"
                        type="number"
                        min="0"
                        step="1"
                        value={laptopAmount}
                        onChange={(e) => setLaptopAmount(e.target.value)}
                        className="pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <IndianRupee className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Fixed amount per laptop plan sale
                    </p>
                  </div>
                </div>

                {/* Preview */}
                {isActive && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      Current Calculation Logic
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Partners earn <strong>₹{mobileAmount}</strong> for every Mobile plan sold.</p>
                      <p>Partners earn <strong>₹{laptopAmount}</strong> for every Laptop plan sold.</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Note: Changing these values will update earnings calculations for all eligible sales.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Settings Display */}
          {currentSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Active Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className={`mt-1 flex items-center ${currentSettings.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${currentSettings.isActive ? 'bg-green-600' : 'bg-gray-400'}`} />
                    <span className="font-semibold">{currentSettings.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-700">
                      <Smartphone className="h-4 w-4 mr-2" />
                      <span className="text-sm">Mobile Rate</span>
                    </div>
                    <span className="font-bold text-lg">₹{currentSettings.mobileAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-700">
                      <Laptop className="h-4 w-4 mr-2" />
                      <span className="text-sm">Laptop Rate</span>
                    </div>
                    <span className="font-bold text-lg">₹{currentSettings.laptopAmount}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-xs font-medium text-gray-500">Last Updated</Label>
                  <p className="text-xs text-gray-700 mt-1">
                    {currentSettings.updatedAt 
                      ? new Date(currentSettings.updatedAt).toLocaleString() 
                      : 'Never'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
