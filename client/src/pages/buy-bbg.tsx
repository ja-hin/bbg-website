import { useState } from "react";
import { DeviceFinderForm } from "@/components/device-finder-form";
import { Button } from "@/components/ui/button";

export default function BuyBBG() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1F4B88" }}>
          BuyBack Guarantee Protection
        </h1>
        <p className="text-lg mb-8" style={{ color: "#6b7280" }}>
          Lock your device's future resale value with our comprehensive BuyBack Guarantee plan.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Up to 70% Resale Value</h3>
            <p style={{ color: "#6b7280" }}>Guaranteed buyback value for your device</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Up to 36 Months Coverage</h3>
            <p style={{ color: "#6b7280" }}>Extended protection for peace of mind</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Free Doorstep Pickup</h3>
            <p style={{ color: "#6b7280" }}>Convenient claim process</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Instant Payout</h3>
            <p style={{ color: "#6b7280" }}>Get paid at the time of handover</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-12">
          <Button
            onClick={() => setShowForm(true)}
            className="text-white px-8 py-3 rounded-md text-lg font-semibold"
            style={{ backgroundColor: "#0070f3" }}
            data-testid="button-open-device-finder"
          >
            Check Your Device Plans
          </Button>
        </div>

        {/* Modal Overlay */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <DeviceFinderForm
                onClose={() => setShowForm(false)}
                showCloseButton={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
