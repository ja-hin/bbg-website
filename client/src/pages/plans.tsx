import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Wallet,
  Smartphone,
  Laptop,
  Shield,
  Car,
  DollarSign,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.png";

const ClaimValueSlabs = ({ deviceType, isBundle }: { deviceType: string; isBundle?: boolean }) => {
  const slabs = isBundle
    ? [
        { range: "4-6 months", percentage: "70%" },
        { range: "7-9 months", percentage: "60%" },
        { range: "10-12 months", percentage: "50%" },
        { range: "13-15 months", percentage: "40%" },
        { range: "16-18 months", percentage: "30%" },
      ]
    : [
        { range: "4-6 months", percentage: "70%" },
        { range: "7-12 months", percentage: "50%" },
        { range: "13-18 months", percentage: "45%" },
        { range: "19-24 months", percentage: "40%" },
        { range: "31-36 months", percentage: "25%" },
      ];

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {slabs.map((slab, idx) => (
        <div key={idx} className="flex justify-between items-center text-sm">
          <span style={{ color: "#666666" }}>{slab.range}</span>
          <span style={{ color: "#254696", fontWeight: "600" }}>Get back {slab.percentage}</span>
        </div>
      ))}
    </div>
  );
};

export default function Plans() {
  const [, setLocation] = useLocation();

  // First try URL params, then fall back to sessionStorage for back navigation support
  let searchParams = new URLSearchParams(window.location.search);
  let deviceType = searchParams.get("type");
  let deviceBrand = searchParams.get("brand");
  let deviceAgeSelection = searchParams.get("age");

  // If URL params missing, try to restore from sessionStorage (for back navigation)
  if (!deviceType || !deviceBrand || !deviceAgeSelection) {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (storedPlan) {
      try {
        const parsed = JSON.parse(storedPlan);
        if (parsed.plansQuery) {
          const storedParams = new URLSearchParams(parsed.plansQuery);
          deviceType = storedParams.get("type");
          deviceBrand = storedParams.get("brand");
          deviceAgeSelection = storedParams.get("age");

          // Restore URL for proper browser history
          if (deviceType && deviceBrand && deviceAgeSelection) {
            window.history.replaceState({}, "", `/plans${parsed.plansQuery}`);
          }
        }
      } catch {}
    }
  }

  // Initialize toggle based on device type from URL
  const initialView = deviceType?.toLowerCase() === "mobile" ? "mobile" : "laptop";
  const [selectedView, setSelectedView] = useState<"laptop" | "mobile">(initialView);

  const { data: allPlans = [], isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: async () => {
      const response = await fetch("/api/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      return response.json();
    },
  });

  // Extract plan info from database-driven plans
  const getPlanInfo = (planDeviceType: string, planType: string) => {
    return allPlans.find(
      (p: any) => p.deviceType === planDeviceType && p.planType === planType,
    );
  };

  const laptopBBGPlan = getPlanInfo("laptop", "bbg");
  const mobileBBGPlan = getPlanInfo("mobile", "bbg");
  const laptopExtendPlan = getPlanInfo("laptop", "extend_plus");
  const mobileExtendPlan = getPlanInfo("mobile", "extend_plus");
  const laptopBundlePlan = getPlanInfo("laptop", "bundle");
  const mobileBundlePlan = getPlanInfo("mobile", "bundle");

  if (!deviceType || !deviceBrand || !deviceAgeSelection) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1
            className="text-2xl font-bold text-gray-800 mb-4"
            data-testid="heading-no-device"
          >
            No device details found
          </h1>
          <p className="text-gray-600 mb-6" data-testid="text-no-device-desc">
            Please go back and select your device details to view available
            plans.
          </p>
          <Link href="/">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-go-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Device age selection: 1 = within 6 months, 2 = more than 6 months
  const isWithinSixMonths = deviceAgeSelection === "1";
  
  // Use toggle view instead of URL device type for showing plans
  const showingLaptop = selectedView === "laptop";
  const showingMobile = selectedView === "mobile";

  const showLaptopBBG = showingLaptop && isWithinSixMonths;
  const showMobileBBG = showingMobile && isWithinSixMonths;
  const showLaptopExtend = showingLaptop;
  const showMobileExtend = showingMobile;
  const showLaptopBundle = showingLaptop && isWithinSixMonths;
  const showMobileBundle = showingMobile && isWithinSixMonths;

  const visibleCards = [
    showLaptopBBG,
    showMobileBBG,
    showLaptopExtend,
    showMobileExtend,
    showLaptopBundle,
    showMobileBundle,
  ].filter(Boolean).length;

  const handleBuyNow = (planInfo: any) => {
    if (!planInfo || !planInfo.planPrice || !planInfo.planName) return;

    const selectedPlan = {
      id: planInfo.id,
      planType: planInfo.planType,
      deviceType: planInfo.deviceType,
      price: planInfo.planPrice,
      planName: planInfo.planName,
      validity: planInfo.validity,
      coverage: planInfo.coverage,
      brand: deviceBrand,
      deviceAgeSelection: deviceAgeSelection,
      plansQuery: window.location.search,
    };

    sessionStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-2">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-4">
            <h1
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
              data-testid="heading-available-plans"
            >
              Available Plans for Your Device
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span
                className="bg-gray-100 px-3 py-1 rounded-full"
                data-testid="text-device-type"
              >
                <strong>Type:</strong>{" "}
                {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
              </span>
              <span
                className="bg-gray-100 px-3 py-1 rounded-full"
                data-testid="text-device-brand"
              >
                <strong>Brand:</strong> {deviceBrand}
              </span>
              <span
                className="bg-gray-100 px-3 py-1 rounded-full"
                data-testid="text-device-age"
              >
                <strong>Device Age:</strong>{" "}
                {deviceAgeSelection === "1" ? "Within 6 months" : "More than 6 months"}
              </span>
            </div>
            {!isWithinSixMonths && (
              <p
                className="mt-3 text-sm text-amber-600"
                data-testid="text-older-device-note"
              >
                Your device is more than 6 months old. Only Extend+ plans are
                available.
              </p>
            )}
          </div>

          {/* Benefit Strip */}
          <div className="mt-4 mb-1 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                No Hidden Charges
              </span>
            </div>
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                Free Doorstep Pickup
              </span>
            </div>
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                Instant Payouts
              </span>
            </div>
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                Completely Digital
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center bg-white/90 rounded-lg p-3 shadow-sm">
        <p className="text-sm sm:text-base text-gray-700">
          Also available on our partner stores{" "}
          {showingMobile ? (
            <>
              <a
                href="https://www.amazon.in/Xtracover-Months-BuyBack-Guarantee-Delivery/dp/B0FW4L6NBY/ref=sr_1_2?crid=24QTJT6QA2W5W&dib=eyJ2IjoiMSJ9.a8P_SgtRFczb5F_6aAebivaon7zytbpphnxB2aC1TzM.quPafkCUjmfxo0ma9hp3S3sxdpQxQjVgaytnwgirQNc&dib_tag=se&keywords=xtracover+buyback+guarantee&qid=1765616560&s=electronics&sprefix=xtracover+buyback+guarantee%2Celectronics%2C213&sr=1-2-catcorr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#254696] font-semibold underline hover:text-[#1a3366]"
              >
                Amazon
              </a>
            </>
          ) : (
            <>
              <a
                href="https://www.amazon.in/Xtracover-BuyBack-Guarantee-Laptop-Delivery/dp/B0FW4JTYV7/ref=sr_1_1?crid=24QTJT6QA2W5W&dib=eyJ2IjoiMSJ9.a8P_SgtRFczb5F_6aAebivaon7zytbpphnxB2aC1TzM.quPafkCUjmfxo0ma9hp3S3sxdpQxQjVgaytnwgirQNc&dib_tag=se&keywords=xtracover+buyback+guarantee&qid=1765616560&s=electronics&sprefix=xtracover+buyback+guarantee%2Celectronics%2C213&sr=1-1-catcorr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#254696] font-semibold underline hover:text-[#1a3366]"
              >
                Amazon
              </a>
            </>
          )}{" "}
          and{" "}
          <a
            href="https://store.acer.com/en-in/buybackpolicy-offer-terms-conditions-in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#254696] font-semibold underline hover:text-[#1a3366]"
          >
            Acer
          </a>{" "}
        </p>
      </div>

      <section className="py-4 sm:py-6 lg:py-8 relative overflow-hidden">
        
        <img
          src={pricingCardBackground}
          alt="Background pattern"
          className="absolute inset-0 w-full h-full object-fill z-0"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Amazon and Acer purchase links */}
          

          <div className="grid gap-8 lg:gap-12 items-stretch [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {showLaptopBBG && (
              <div
                className="w-full h-full flex flex-col"
                data-testid="card-laptop-bbg"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden h-full flex flex-col bg-white">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      BuyBack Guarantee
                    </h3>
                    <p className="text-sm sm:text-base mb-4 opacity-90">
                      Lock your laptop's resale value
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold">
                      {pricesLoading ? (
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin inline" />
                      ) : (
                        `₹${laptopBBGPlan?.planPrice || "--"}`
                      )}
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 space-y-6">
                    {/* Benefits with Icons */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base" style={{ color: "#374151" }}>
                          Assured resale value
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <Car
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base" style={{ color: "#374151" }}>
                          Sell your device at doorstep
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <DollarSign
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base" style={{ color: "#374151" }}>
                          Fast & secure payment
                        </span>
                      </div>
                    </div>

                    {/* Device Age Slabs */}
                    <div className="border-t pt-4">
                      <ClaimValueSlabs deviceType="laptop" />
                    </div>

                    {/* Validity */}
                    <div className="text-center text-xs sm:text-sm" style={{ color: "#666666" }}>
                      Validity 36 months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                    <Button
                      className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(90deg, #254696, #1F4B88)",
                      }}
                      onClick={() => handleBuyNow(laptopBBGPlan)}
                      disabled={pricesLoading || !laptopBBGPlan}
                      data-testid="button-buy-laptop-bbg"
                    >
                      {pricesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showMobileBBG && (
              <div
                className="w-full h-full flex flex-col"
                data-testid="card-mobile-bbg"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden h-full flex flex-col bg-white">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      BuyBack Guarantee
                    </h3>
                    <p className="text-sm sm:text-base mb-4 opacity-90">
                      Lock your mobile's resale value
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold">
                      {pricesLoading ? (
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin inline" />
                      ) : (
                        `₹${mobileBBGPlan?.planPrice || "--"}`
                      )}
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 space-y-6">
                    {/* Benefits with Icons */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base" style={{ color: "#374151" }}>
                          Assured resale value
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <Car
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base" style={{ color: "#374151" }}>
                          Sell your device at doorstep
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <DollarSign
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base" style={{ color: "#374151" }}>
                          Fast & secure payment
                        </span>
                      </div>
                    </div>

                    {/* Device Age Slabs */}
                    <div className="border-t pt-4">
                      <ClaimValueSlabs deviceType="mobile" />
                    </div>

                    {/* Validity */}
                    <div className="text-center text-xs sm:text-sm" style={{ color: "#666666" }}>
                      Validity 18 months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                    <Button
                      className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(90deg, #254696, #1F4B88)",
                      }}
                      onClick={() => handleBuyNow(mobileBBGPlan)}
                      disabled={pricesLoading || !mobileBBGPlan}
                      data-testid="button-buy-mobile-bbg"
                    >
                      {pricesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showLaptopExtend && (
              <div
                className="w-full h-full flex flex-col"
                data-testid="card-laptop-extend"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden h-full flex flex-col bg-white">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      Extend+
                    </h3>
                    <p className="text-sm sm:text-base mb-4 opacity-90">
                      Repairs, better resale & extra savings for your laptop
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold">
                      {pricesLoading ? (
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin inline" />
                      ) : (
                        `₹${laptopExtendPlan?.planPrice || "--"}`
                      )}
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 space-y-6">
                    {/* Benefits with Icons */}
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <Wrench
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            1 Free Repair Service
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            We pick up, fix, and return your device
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Car
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Sell your device from Doorstep
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Get 10-20% higher resale value
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            30% OFF XtraCover Warranty Plans
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            One-time use during validity
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="text-center text-xs sm:text-sm pt-2" style={{ color: "#666666" }}>
                      Validity: 24 months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                    <Button
                      className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(90deg, #254696, #1F4B88)",
                      }}
                      onClick={() => handleBuyNow(laptopExtendPlan)}
                      disabled={pricesLoading || !laptopExtendPlan}
                      data-testid="button-buy-laptop-extend"
                    >
                      {pricesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showMobileExtend && (
              <div
                className="w-full h-full flex flex-col"
                data-testid="card-mobile-extend"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden h-full flex flex-col bg-white">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      Extend+
                    </h3>
                    <p className="text-sm sm:text-base mb-4 opacity-90">
                      Repairs, better resale & extra savings for your phone
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold">
                      {pricesLoading ? (
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin inline" />
                      ) : (
                        `₹${mobileExtendPlan?.planPrice || "--"}`
                      )}
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 space-y-6">
                    {/* Benefits with Icons */}
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <Wrench
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            1 Free Repair Service
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            We pick up, fix, and return your device
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Car
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Sell your device from Doorstep
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Get 10-20% higher resale value
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            30% OFF XtraCover Warranty Plans
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            One-time use during validity
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="text-center text-xs sm:text-sm pt-2" style={{ color: "#666666" }}>
                      Validity: 24 months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                    <Button
                      className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(90deg, #254696, #1F4B88)",
                      }}
                      onClick={() => handleBuyNow(mobileExtendPlan)}
                      disabled={pricesLoading || !mobileExtendPlan}
                      data-testid="button-buy-mobile-extend"
                    >
                      {pricesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showLaptopBundle && (
              <div
                className="w-full h-full flex flex-col"
                data-testid="card-laptop-bundle"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden h-full flex flex-col bg-white">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      BuyBack + Extend+ Bundle
                    </h3>
                    <p className="text-sm sm:text-base mb-4 opacity-90">
                      Repairs, better resale & extra savings for your laptop
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold">
                      {pricesLoading ? (
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin inline" />
                      ) : (
                        `₹${laptopBundlePlan?.planPrice || "--"}`
                      )}
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 space-y-6">
                    {/* Benefits with Icons */}
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base font-semibold" style={{ color: "#1F2937" }}>
                          Assured resale value
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <Wrench
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            1 Free Repair Service
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            We pick up, fix, and return your device
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Car
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Sell your device from Doorstep
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Get higher resale value
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            30% OFF XtraCover Warranty Plans
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            One-time use during validity
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Device Age Slabs */}
                    <div className="border-t pt-4">
                      <ClaimValueSlabs deviceType="laptop" isBundle={true} />
                    </div>

                    {/* Validity */}
                    <div className="text-center text-xs sm:text-sm pt-2" style={{ color: "#666666" }}>
                      Validity: 36 months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                    <Button
                      className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(90deg, #254696, #1F4B88)",
                      }}
                      onClick={() => handleBuyNow(laptopBundlePlan)}
                      disabled={pricesLoading || !laptopBundlePlan}
                      data-testid="button-buy-laptop-bundle"
                    >
                      {pricesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showMobileBundle && (
              <div
                className="w-full h-full flex flex-col"
                data-testid="card-mobile-bundle"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden h-full flex flex-col bg-white">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                      BuyBack + Extend+ Bundle
                    </h3>
                    <p className="text-sm sm:text-base mb-4 opacity-90">
                      Repairs, better resale & extra savings for your phone
                    </p>
                    <div className="text-5xl sm:text-7xl font-bold">
                      {pricesLoading ? (
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin inline" />
                      ) : (
                        `₹${mobileBundlePlan?.planPrice || "--"}`
                      )}
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 space-y-6">
                    {/* Benefits with Icons */}
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <span className="text-sm sm:text-base font-semibold" style={{ color: "#1F2937" }}>
                          Assured resale value
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <Wrench
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            1 Free Repair Service
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            We pick up, fix, and return your device
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Car
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Sell your device from Doorstep
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Get higher resale value
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Shield
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            30% OFF XtraCover Warranty Plans
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            One-time use during validity
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Device Age Slabs */}
                    <div className="border-t pt-4">
                      <ClaimValueSlabs deviceType="mobile" isBundle={true} />
                    </div>

                    {/* Validity */}
                    <div className="text-center text-xs sm:text-sm pt-2" style={{ color: "#666666" }}>
                      Validity: 24 months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                    <Button
                      className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(90deg, #254696, #1F4B88)",
                      }}
                      onClick={() => handleBuyNow(mobileBundlePlan)}
                      disabled={pricesLoading || !mobileBundlePlan}
                      data-testid="button-buy-mobile-bundle"
                    >
                      {pricesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
