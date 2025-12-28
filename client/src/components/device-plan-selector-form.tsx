import { useState, useEffect } from "react";
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
  const [deviceAgeSelection, setDeviceAgeSelection] = useState<"" | "1" | "2">("");
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
    if (!deviceAgeSelection) {
      toast({
        title: "Please select device age",
        description: "Please tell us how old your device is",
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
      age: deviceAgeSelection,
    });
    setLocation(`/plans?${params.toString()}`);
  };

  return (
    <div
      className="bg-white rounded-2xl p-7 sm:p-8 lg:p-10 shadow-xl"
      style={{
        background: "linear-gradient(135deg, #fafbff 0%, #f5f9ff 100%)",
        border: "2px solid",
        borderColor: "rgba(37, 70, 150, 0.1)"
      }}
    >
      <h3 
        className="text-xl sm:text-2xl font-bold mb-1" 
        style={{ color: "#254696", fontFamily: "Poppins, sans-serif" }}
      >
        Find plans for your device
      </h3>
      
      <p 
        className="text-sm sm:text-base mb-6" 
        style={{ color: "#6b7280" }}
      >
        Get started in 3 simple steps
      </p>

      <div className="space-y-6">
        <div>
          <label
            className="block text-sm font-semibold mb-3"
            style={{ color: "#254696" }}
          >
            Device Type
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none transition-all appearance-none pr-10"
              style={{
                borderColor: "rgba(37, 70, 150, 0.2)",
                color: "#4b5563",
                backgroundColor: "#ffffff",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#254696";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 70, 150, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(37, 70, 150, 0.2)";
                e.currentTarget.style.boxShadow = "none";
              }}
              data-testid="select-device-type"
              value={selectedDeviceType}
              onChange={(e) => handleDeviceTypeChange(e.target.value)}
            >
              <option value="">Select device type</option>
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "#254696" }} />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-3"
            style={{ color: "#254696" }}
          >
            Device Brand
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none transition-all appearance-none pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{
                borderColor: "rgba(37, 70, 150, 0.2)",
                color: "#4b5563",
                backgroundColor: "#ffffff",
              }}
              onFocus={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.borderColor = "#254696";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 70, 150, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(37, 70, 150, 0.2)";
                e.currentTarget.style.boxShadow = "none";
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
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "#254696" }} />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-4"
            style={{ color: "#254696" }}
          >
            How old is your device?
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 flex-1"
              style={{
                borderColor: deviceAgeSelection === "1" ? "#254696" : "rgba(37, 70, 150, 0.2)",
                backgroundColor: deviceAgeSelection === "1" ? "rgba(37, 70, 150, 0.05)" : "#ffffff"
              }}
            >
              <input
                type="radio"
                name="deviceAge"
                value="1"
                checked={deviceAgeSelection === "1"}
                onChange={(e) => setDeviceAgeSelection(e.target.value as "1" | "2")}
                className="w-4 h-4 accent-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                style={{ accentColor: "#254696" }}
                data-testid="radio-within-6-months"
              />
              <span className="text-sm sm:text-base font-medium" style={{ color: "#374151" }}>
                Within 6 months
              </span>
            </label>
            <label
              className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 flex-1"
              style={{
                borderColor: deviceAgeSelection === "2" ? "#254696" : "rgba(37, 70, 150, 0.2)",
                backgroundColor: deviceAgeSelection === "2" ? "rgba(37, 70, 150, 0.05)" : "#ffffff"
              }}
            >
              <input
                type="radio"
                name="deviceAge"
                value="2"
                checked={deviceAgeSelection === "2"}
                onChange={(e) => setDeviceAgeSelection(e.target.value as "1" | "2")}
                className="w-4 h-4 accent-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                style={{ accentColor: "#254696" }}
                data-testid="radio-more-than-6-months"
              />
              <span className="text-sm sm:text-base font-medium" style={{ color: "#374151" }}>
                More than 6 months
              </span>
            </label>
          </div>
        </div>

        <div className="pt-3">
          <Button
            className="w-full text-white font-semibold py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg active:scale-95"
            style={{ 
              background: "linear-gradient(90deg, #254696, #1F4B88)",
              minHeight: "48px"
            }}
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
