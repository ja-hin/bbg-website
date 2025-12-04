import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface DeviceFinderFormProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function DeviceFinderForm({ onClose, showCloseButton = false }: DeviceFinderFormProps) {
  const [selectedDeviceType, setSelectedDeviceType] = useState("");

  // Fetch brands based on device type
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["/api/brands", selectedDeviceType],
    enabled: !!selectedDeviceType,
    staleTime: 300000,
  });

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border" style={{ borderColor: "#e5e7eb" }}>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="mb-4 text-gray-500 hover:text-gray-700"
          data-testid="button-close-form"
        >
          ✕
        </button>
      )}

      <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: "#111827" }}>
        Find plans for your device
      </h3>
      <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
        Enter basic details to see available protection plans.
      </p>

      <div className="space-y-5">
        {/* Device Type */}
        <div>
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
              onChange={(e) => setSelectedDeviceType(e.target.value)}
            >
              <option value="">Select device type</option>
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Device Brand */}
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
            >
              <option value="">
                {brandsLoading ? "Loading brands…" : "Select device brand"}
              </option>
              {brands?.map((brand: any) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Device Purchase Date */}
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
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            className="w-full text-white font-semibold py-3 rounded-md text-base"
            style={{ backgroundColor: "#0070f3" }}
            data-testid="button-find-plans"
          >
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
