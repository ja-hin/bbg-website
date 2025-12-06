import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface DevicePlanSelectorFormProps {
  onSubmitSuccess?: () => void;
  initialDeviceType?: string;
  formRef?: React.RefObject<HTMLDivElement>;
}

export function DevicePlanSelectorForm({ 
  onSubmitSuccess, 
  initialDeviceType,
  formRef 
}: DevicePlanSelectorFormProps) {
  const [selectedDeviceType, setSelectedDeviceType] = useState(initialDeviceType || "");
  const [selectedDeviceBrand, setSelectedDeviceBrand] = useState("");
  const [devicePurchaseDate, setDevicePurchaseDate] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (initialDeviceType && initialDeviceType !== selectedDeviceType) {
      setSelectedDeviceType(initialDeviceType);
      setSelectedDeviceBrand("");
    }
  }, [initialDeviceType]);

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["/api/brands", selectedDeviceType],
    queryFn: async () => {
      const response = await fetch(`/api/brands?deviceType=${selectedDeviceType}`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    },
    enabled: !!selectedDeviceType,
    staleTime: 300000,
  });

  const handleDeviceTypeChange = (value: string) => {
    setSelectedDeviceType(value);
    setSelectedDeviceBrand("");
  };

  const handleFindPlans = () => {
    if (!selectedDeviceType) {
      toast({
        title: "Please select device type",
        description: "Device type is required to find plans",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDeviceBrand) {
      toast({
        title: "Please select device brand",
        description: "Device brand is required to find plans",
        variant: "destructive",
      });
      return;
    }
    if (!devicePurchaseDate) {
      toast({
        title: "Please select purchase date",
        description: "Device purchase date is required to find plans",
        variant: "destructive",
      });
      return;
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }

    const params = new URLSearchParams({
      type: selectedDeviceType,
      brand: selectedDeviceBrand,
      date: devicePurchaseDate,
    });
    setLocation(`/plans?${params.toString()}`);
  };

  return (
    <div
      className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border"
      style={{ borderColor: "#e5e7eb" }}
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: "#111827" }}>
        Find plans for your device
      </h3>

      <div className="space-y-5">
        <div className="mt-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#374151" }}
          >
            Device Type
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none pr-10"
              style={{
                borderColor: "#d1d5db",
                color: "#4b5563",
                backgroundColor: "#ffffff",
              }}
              data-testid="select-device-type"
              value={selectedDeviceType}
              onChange={(e) => handleDeviceTypeChange(e.target.value)}
            >
              <option value="">Select device type</option>
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#374151" }}
          >
            Device Brand
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{
                borderColor: "#d1d5db",
                color: "#4b5563",
                backgroundColor: "#ffffff",
              }}
              data-testid="select-device-brand"
              disabled={!selectedDeviceType || brandsLoading}
              value={selectedDeviceBrand}
              onChange={(e) => setSelectedDeviceBrand(e.target.value)}
            >
              <option value="">
                {brandsLoading ? "Loading brands…" : "Select device brand"}
              </option>
              {Array.isArray(brands) && brands.map((brand: any) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#374151" }}
          >
            Device Purchase Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            style={{
              borderColor: "#d1d5db",
              backgroundColor: "#ffffff",
              color: "#4b5563",
            }}
            data-testid="input-purchase-date"
            value={devicePurchaseDate}
            onChange={(e) => setDevicePurchaseDate(e.target.value)}
          />
        </div>

        <div className="pt-2">
          <Button
            className="w-full text-white font-semibold py-3 rounded-md text-base"
            style={{ backgroundColor: "#0070f3" }}
            data-testid="button-find-plans"
            onClick={handleFindPlans}
          >
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
