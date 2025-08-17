import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WaitingPeriodSettings {
  enabled: boolean;
  months: number;
}

export default function AdminWaitingPeriodSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<WaitingPeriodSettings>({
    enabled: true,
    months: 3
  });

  // Fetch current waiting period settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/waiting-period/current"],
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (currentSettings && typeof currentSettings === 'object' && 'enabled' in currentSettings && 'months' in currentSettings) {
      setSettings({
        enabled: currentSettings.enabled,
        months: currentSettings.months
      });
    }
  }, [currentSettings]);

  // Update waiting period settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: WaitingPeriodSettings) => {
      console.log('Sending waiting period settings:', newSettings);
      const response = await apiRequest("/api/admin/waiting-period/update", {
        method: "POST",
        body: {
          enabled: Boolean(newSettings.enabled),
          months: Number(newSettings.months)
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Waiting period settings updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/waiting-period/current"] });
    },
    onError: (error) => {
      console.error("Failed to update waiting period settings:", error);
      toast({
        title: "Error",
        description: "Failed to update waiting period settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (settings.months < 0 || settings.months > 12) {
      toast({
        title: "Invalid Input",
        description: "Months must be between 0 and 12",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate(settings);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  };

  const handleMonthsChange = (value: string) => {
    const months = parseInt(value);
    if (!isNaN(months)) {
      setSettings(prev => ({ ...prev, months }));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waiting Period Settings</h1>
          <p className="text-muted-foreground">
            Configure the waiting period for BBG claims. Acer BBG registrations are always exempt.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Claim Waiting Period Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Enable Waiting Period
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require regular BBG customers to wait before filing claims
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={handleToggleEnabled}
                  />
                </div>

                {/* Months Configuration */}
                {settings.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="months" className="text-base font-medium">
                          Waiting Period Duration (Months)
                        </Label>
                        <div className="max-w-xs">
                          <Input
                            id="months"
                            type="number"
                            min="0"
                            max="12"
                            value={settings.months}
                            onChange={(e) => handleMonthsChange(e.target.value)}
                            placeholder="Enter months (0-12)"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Number of months customers must wait from BBG registration before filing claims
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Current Status Display */}
              <Separator />
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  {settings.enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                  Current Configuration
                </h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Status:</strong> {settings.enabled ? "Enabled" : "Disabled"}
                  </p>
                  {settings.enabled && (
                    <p>
                      <strong>Duration:</strong> {settings.months} month{settings.months !== 1 ? 's' : ''}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    <strong>Note:</strong> Acer BBG registrations are always exempt from waiting periods
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                  className="min-w-[120px]"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">
                    <strong>Regular BBG customers:</strong> Must wait the configured period before filing claims
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">
                    <strong>Acer BBG customers:</strong> Always exempt from waiting periods regardless of this setting
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">
                    <strong>Setting to 0 months:</strong> Effectively disables the waiting period for regular BBG customers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm">
                    <strong>Changes take effect immediately:</strong> New settings apply to all future claim attempts
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}