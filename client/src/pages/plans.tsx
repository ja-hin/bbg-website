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
  IndianRupee,
  Wrench,
  Percent,
  Gavel,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.webp";

const ClaimValueSlabs = ({ slabs }: { slabs: any[] }) => {
  if (!slabs || slabs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p style={{ color: "#666666" }} className="text-sm text-center">No claim value slabs available</p>
      </div>
    );
  }

  // Format age range from min_months and max_months
  const formatAgeRange = (slab: any) => {
    const min = slab.minMonths || slab.min_months;
    const max = slab.maxMonths || slab.max_months;
    
    if (!min || !max) {
      return slab.deviceAge || slab.ageRange || slab.range || 'Unknown';
    }
    
    return `${min}–${max} months`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {slabs.map((slab, idx) => (
        <div key={idx} className="flex justify-between items-center text-sm">
          <span style={{ color: "#666666" }}>{formatAgeRange(slab)}</span>
          <span style={{ color: "#254696", fontWeight: "600" }}>Get back {slab.resalePercentage || slab.percentage}%</span>
        </div>
      ))}
    </div>
  );
};

export default function Plans() {
  const [, setLocation] = useLocation();
  const [laptopBBGFlipped, setLaptopBBGFlipped] = useState(false);
  const [mobileBBGFlipped, setMobileBBGFlipped] = useState(false);
  const [laptopBundleFlipped, setLaptopBundleFlipped] = useState(false);
  const [mobileBundleFlipped, setMobileBundleFlipped] = useState(false);

  // First try URL params, then fall back to sessionStorage for back navigation support
  let searchParams = new URLSearchParams(window.location.search);
  let deviceType = searchParams.get("type");
  let deviceBrand = searchParams.get("brand");
  let deviceModel = searchParams.get("model");
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
          deviceModel = storedParams.get("model");
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
  const showLaptopExtend = showingLaptop && !isWithinSixMonths;
  const showMobileExtend = showingMobile && !isWithinSixMonths;
  const showLaptopBundle = false;
  const showMobileBundle = false;

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
    // Check if user has selected all required device info
    // NOTE: selectedDeviceBrand and selectedDeviceModel are not defined in the provided context.
    // Assuming they are defined elsewhere or will be added by the user.
    // Also, 'toast' is not defined. Assuming it's a utility function.
    // if (!selectedDeviceBrand || !selectedDeviceModel) {
    //   toast({
    //     title: "Missing Information",
    //     description: "Please select your device brand and model to proceed.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Create plan object
    const selectedPlan = {
      id: planInfo.id,
      planType: planInfo.planType,
      deviceType: planInfo.deviceType,
      price: planInfo.planPrice,
      planName: planInfo.planName,
      validity: planInfo.validity,
      coverage: planInfo.coverage,
      brand: deviceBrand,
      model: deviceModel,
      deviceAgeSelection: deviceAgeSelection,
      plansQuery: window.location.search,
    };

    // Store selected plan in session storage
    sessionStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));

    // Check authentication
    const isAuthenticated = sessionStorage.getItem("customerAuthenticated") === "true";
    
    if (isAuthenticated) {
      setLocation("/checkout");
    } else {
      setLocation("/customer/login?redirect=/checkout");
    }
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
              {deviceModel && (
                <span
                  className="bg-gray-100 px-3 py-1 rounded-full"
                  data-testid="text-device-model"
                >
                  <strong>Model:</strong> {deviceModel}
                </span>
              )}
              <span
                className="bg-gray-100 px-3 py-1 rounded-full"
                data-testid="text-device-age"
              >
                <strong>Device Age:</strong>{" "}
                {deviceAgeSelection === "1" ? "Within 6 months" : "More than 6 months"}
              </span>
            </div>
            {/* {!isWithinSixMonths && (
              <p
                className="mt-3 text-sm text-amber-600"
                data-testid="text-older-device-note"
              >
                Your device is more than 6 months old. Only Extend+ plans are
                available.
              </p>
            )} */}
          </div>

          
        </div>
      </section>

      <section className="py-4 sm:py-6 lg:py-8 relative overflow-hidden">
        
        <img
          src={pricingCardBackground}
          alt="Background pattern"
          className="absolute inset-0 w-full h-full object-fill z-0"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Amazon and Acer purchase links */}
          

          <div className="flex justify-center">
            <div className="grid gap-6 sm:gap-8 lg:gap-10 items-stretch max-w-full [grid-template-columns:repeat(auto-fit,minmax(340px,550px))]">
            {showLaptopBBG && (
              <div
                className="w-full flex flex-col flip-card min-h-96"
                data-testid="card-laptop-bbg"
              >
                <div className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${laptopBBGFlipped ? 'flipped' : ''}`}>
                  {/* Front Face */}
                  <div className="flip-card-front rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    {/* Blue Header */}
                    <div
                      className="p-6 sm:p-7 text-white text-left relative"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-h-[120px] sm:min-h-[150px]">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-3xl sm:text-4xl font-bold whitespace-nowrap">
                              BuyBack
                            </h3>
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-bold mb-2">
                            Guarantee
                          </h3>
                          <p className="text-xs sm:text-sm opacity-90">
                            Lock your laptop's resale value.
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end pt-2">
                          <span className="text-lg sm:text-xl text-white/60 line-through decoration-white/40 mb-[-4px]">
                            ₹1299
                          </span>
                          <div className="text-5xl sm:text-6xl font-bold text-[#D4AF37]">
                            {pricesLoading ? (
                              <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                              `₹${laptopBBGPlan?.planPrice || "--"}`
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* White Content Area */}
                    <div className="p-6 sm:p-8 space-y-3">
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <Shield
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Guaranteed resale value
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Get back up to 70% of your device's purchase price*
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Gavel
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              1-Year Extended Repair Service Warranty*
                            </p>
                            <div className="text-xs sm:text-sm space-y-1" style={{ color: "#6B7280" }}>
                              <p>• Protection for your existing device that begins after your brand warranty ends.</p>
                              <p>• Zero service costs on repairs.</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Wallet
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Best Product Upgrade Offers
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Exclusive deals for your next device purchase.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Percent
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              20% Off on 1-Year Extended Warranty
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Save 20% on protection of your next device purchase.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="text-center text-xs sm:text-sm" style={{ color: "#666666" }}>
                        Validity {(laptopBBGPlan?.coverage || '36').toString().replace(/_months/g, '').replace(/months/g, '').trim()} months
                      </div>
                    </div>

                    {/* Know More Button and Buy Now Button */}
                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setLaptopBBGFlipped(!laptopBBGFlipped)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-know-more-laptop-bbg"
                      >
                        Know More
                      </button>
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

                  {/* Back Face */}
                  <div className="flip-card-back rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    {/* Blue Header */}
                    <div
                      className="p-6 sm:p-7 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        Claim Value Slabs
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95">
                        Device age based claims
                      </p>
                    </div>

                    {/* Device Age Slabs */}
                    <div className="flex-grow p-6 sm:p-8 flex flex-col justify-center space-y-4">
                      <ClaimValueSlabs slabs={laptopBBGPlan?.claimValueSlabs || []} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: "#666666" }}>
                        Resale value is calculated as a percentage of your original device purchase price
                      </p>
                    </div>

                    {/* Back and Buy Now Buttons */}
                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setLaptopBBGFlipped(false)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-back-laptop-bbg"
                      >
                        Back
                      </button>
                      <Button
                        className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(90deg, #254696, #1F4B88)",
                        }}
                        onClick={() => handleBuyNow(laptopBBGPlan)}
                        disabled={pricesLoading || !laptopBBGPlan}
                        data-testid="button-buy-flipped-laptop-bbg"
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
              </div>
            )}

            {showMobileBBG && (
              <div
                className="w-full flex flex-col flip-card min-h-96"
                data-testid="card-mobile-bbg"
              >
                <div className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${mobileBBGFlipped ? 'flipped' : ''}`}>
                  {/* Front Face */}
                  <div className="flip-card-front rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    {/* Blue Header */}
                    <div
                      className="p-6 sm:p-7 text-white text-left relative"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-h-[120px] sm:min-h-[150px]">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-3xl sm:text-4xl font-bold whitespace-nowrap">
                              BuyBack
                            </h3>
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-bold mb-2">
                            Guarantee
                          </h3>
                          <p className="text-xs sm:text-sm opacity-90">
                            Lock your mobile's resale value.
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end pt-2">
                          <span className="text-lg sm:text-xl text-white/60 line-through decoration-white/40 mb-[-4px]">
                            ₹999
                          </span>
                          <div className="text-5xl sm:text-6xl font-bold text-[#D4AF37]">
                            {pricesLoading ? (
                              <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                              `₹${mobileBBGPlan?.planPrice || "--"}`
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* White Content Area */}
                    <div className="p-6 sm:p-8 space-y-3">
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <Shield
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Guaranteed resale value
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Get back up to 70% of your device's purchase price*
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Gavel
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              1-Year Extended Repair Service Warranty*
                            </p>
                            <div className="text-xs sm:text-sm space-y-1" style={{ color: "#6B7280" }}>
                              <p>• Protection for your existing device that begins after your brand warranty ends.</p>
                              <p>• Zero service costs on repairs.</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Wallet
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Best Product Upgrade Offers
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Exclusive deals for your next device purchase.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Percent
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              20% Off on 1-Year Extended Warranty
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Save 20% on protection of your next device purchase.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="text-center text-xs sm:text-sm" style={{ color: "#666666" }}>
                        Validity {(mobileBBGPlan?.coverage || '36').toString().replace(/_months/g, '').replace(/months/g, '').trim()} months
                      </div>
                    </div>

                    {/* Know More Button and Buy Now Button */}
                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setMobileBBGFlipped(!mobileBBGFlipped)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-know-more-mobile-bbg"
                      >
                        Know More
                      </button>
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

                  {/* Back Face */}
                  <div className="flip-card-back rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    {/* Blue Header */}
                    <div
                      className="p-6 sm:p-7 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        Claim Value Slabs
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95">
                        Device age based claims
                      </p>
                    </div>

                    {/* Device Age Slabs */}
                    <div className="flex-grow p-6 sm:p-8 flex flex-col justify-center space-y-4">
                      <ClaimValueSlabs slabs={mobileBBGPlan?.claimValueSlabs || []} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: "#666666" }}>
                        Resale value is calculated as a percentage of your original device purchase price
                      </p>
                    </div>

                    {/* Back and Buy Now Buttons */}
                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setMobileBBGFlipped(false)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-back-mobile-bbg"
                      >
                        Back
                      </button>
                      <Button
                        className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(90deg, #254696, #1F4B88)",
                        }}
                        onClick={() => handleBuyNow(mobileBBGPlan)}
                        disabled={pricesLoading || !mobileBBGPlan}
                        data-testid="button-buy-flipped-mobile-bbg"
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
              </div>
            )}

            {showLaptopExtend && (
              <div
                className="w-full flex flex-col min-h-96"
                data-testid="card-laptop-extend"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden flex flex-col bg-white border border-gray-100 h-full">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-7 text-white text-left relative"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-h-[120px] sm:min-h-[150px]">

                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-3xl sm:text-4xl font-bold whitespace-nowrap">
                            Extend+
                          </h3>
                          <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                        </div>
                        <p className="text-xs sm:text-sm opacity-90 mt-4">
                          Repairs, better resale & extra savings.
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end pt-2">
                        <span className="text-lg sm:text-xl text-white/60 line-through decoration-white/40 mb-[-4px]">
                          ₹1299
                        </span>
                        <div className="text-5xl sm:text-6xl font-bold text-[#D4AF37]">
                          {pricesLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            `₹${laptopExtendPlan?.planPrice || "--"}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 flex flex-col space-y-3">
                    {/* Benefits with Icons */}
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <Gavel
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Doorstep Device Auction
                          </p>
                          <div className="text-xs sm:text-sm space-y-1" style={{ color: "#6B7280" }}>
                            <p>• Auction your device at the best market value.</p>
                            <p>• 100+ buyers compete to give you the best possible price in India.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Wrench
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            1-Year Extended Repair Service Warranty*
                          </p>
                          <div className="text-xs sm:text-sm space-y-1" style={{ color: "#6B7280" }}>
                            <p>• Protection for your existing device that begins after your brand warranty ends.</p>
                            <p>• Zero service costs on repairs.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <TrendingUp
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Best Product Upgrade Offers
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Exclusive deals for your next device purchase.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Percent
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            20% Off on 1-Year Extended Warranty
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Save 20% on protection of your next device purchase.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="mt-auto text-center text-xs sm:text-sm pt-4" style={{ color: "#666666" }}>
                      Validity: {(laptopExtendPlan?.coverage || '24').toString().replace(/_months/g, '').replace(/months/g, '').trim()} months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="px-6 sm:px-8 pb-2 sm:pb-3">
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
                className="w-full flex flex-col min-h-96"
                data-testid="card-mobile-extend"
              >
                <div className="rounded-3xl shadow-xl overflow-hidden flex flex-col bg-white border border-gray-100 h-full">
                  {/* Blue Header */}
                  <div
                    className="p-6 sm:p-7 text-white text-left relative"
                    style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-h-[120px] sm:min-h-[150px]">

                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-3xl sm:text-4xl font-bold whitespace-nowrap">
                            Extend+
                          </h3>
                          <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                        </div>
                        <p className="text-xs sm:text-sm opacity-90 mt-4">
                          Repairs, better resale & extra savings.
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end pt-2">
                        <span className="text-lg sm:text-xl text-white/60 line-through decoration-white/40 mb-[-4px]">
                          ₹999
                        </span>
                        <div className="text-5xl sm:text-6xl font-bold text-[#D4AF37]">
                          {pricesLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            `₹${mobileExtendPlan?.planPrice || "--"}`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* White Content Area */}
                  <div className="flex-grow p-6 sm:p-8 flex flex-col space-y-3">
                    {/* Benefits with Icons */}
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <Gavel
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Doorstep Device Auction
                          </p>
                          <div className="text-xs sm:text-sm space-y-1" style={{ color: "#6B7280" }}>
                            <p>• Auction your device at the best market value.</p>
                            <p>• 100+ buyers compete to give you the best possible price in India.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Wrench
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            1-Year Extended Repair Service Warranty*
                          </p>
                          <div className="text-xs sm:text-sm space-y-1" style={{ color: "#6B7280" }}>
                            <p>• Protection for your existing device that begins after your brand warranty ends.</p>
                            <p>• Zero service costs on repairs.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <TrendingUp
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            Best Product Upgrade Offers
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Exclusive deals for your next device purchase.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Percent
                          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                          style={{ color: "#254696" }}
                        />
                        <div>
                          <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                            20% Off on 1-Year Extended Warranty
                          </p>
                          <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                            Save 20% on protection of your next device purchase.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="mt-auto text-center text-xs sm:text-sm pt-4" style={{ color: "#666666" }}>
                      Validity: {(mobileExtendPlan?.coverage || '24').toString().replace(/_months/g, '').replace(/months/g, '').trim()} months
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <div className="px-6 sm:px-8 pb-2 sm:pb-3">
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

            {/*

            {showLaptopBundle && (
              <div
                className="w-full flex flex-col flip-card min-h-96"
                data-testid="card-laptop-bundle"
              >
                <div className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${laptopBundleFlipped ? 'flipped' : ''}`}>
                  
                  <div className="flip-card-front rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    
                    <div
                      className="p-6 sm:p-7 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        BuyBack + Extend+ Bundle
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95 line-clamp-2">
                        Repairs, better resale & savings
                      </p>
                      <div className="text-5xl sm:text-6xl font-bold">
                        {pricesLoading ? (
                          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin inline" />
                        ) : (
                          `₹${laptopBundlePlan?.planPrice || "--"}`
                        )}
                      </div>
                    </div>

                    
                    <div className="p-6 sm:p-8 space-y-3">
                      
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <Shield
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Guaranteed resale value
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Get back up to 70% of your device's purchase price*
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Gavel
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Doorstep Device Auction
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              We pick up, fix, and return your device
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <TrendingUp
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Best Product Upgrade Offers
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Exclusive deals for your next device purchase.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-xs sm:text-sm" style={{ color: "#666666" }}>
                        Validity: {(laptopBundlePlan?.coverage || '36').toString().replace(/_months/g, '').replace(/months/g, '').trim()} months
                      </div>
                    </div>

                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setLaptopBundleFlipped(!laptopBundleFlipped)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-know-more-laptop-bundle"
                      >
                        Know More
                      </button>
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

                  <div className="flip-card-back rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    <div
                      className="p-6 sm:p-7 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        Claim Value Slabs
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95">
                        Device age based claims
                      </p>
                    </div>

                    <div className="flex-grow p-6 sm:p-8 flex flex-col justify-center space-y-4">
                      <ClaimValueSlabs slabs={laptopBundlePlan?.claimValueSlabs || []} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: "#666666" }}>
                        Resale value is calculated as a percentage of your original device purchase price
                      </p>
                    </div>

                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setLaptopBundleFlipped(false)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-back-laptop-bundle"
                      >
                        Back
                      </button>
                      <Button
                        className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(90deg, #254696, #1F4B88)",
                        }}
                        onClick={() => handleBuyNow(laptopBundlePlan)}
                        disabled={pricesLoading || !laptopBundlePlan}
                        data-testid="button-buy-flipped-laptop-bundle"
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
              </div>
            )}

            */}

            {/* 
            {showMobileBundle && (
              <div
                className="w-full flex flex-col flip-card min-h-96"
                data-testid="card-mobile-bundle"
              >
                <div className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${mobileBundleFlipped ? 'flipped' : ''}`}>
                  
                  <div className="flip-card-front rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    
                    <div
                      className="p-6 sm:p-7 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        BuyBack + Extend+ Bundle
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95 line-clamp-2">
                        Repairs, better resale & savings
                      </p>
                      <div className="text-5xl sm:text-6xl font-bold">
                        {pricesLoading ? (
                          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin inline" />
                        ) : (
                          `₹${mobileBundlePlan?.planPrice || "--"}`
                        )}
                      </div>
                    </div>

                    
                    <div className="p-6 sm:p-8 space-y-3">
                      
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <Shield
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Guaranteed resale value
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Get back up to 70% of your device's purchase price*
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Gavel
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Doorstep Device Auction
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              We pick up, fix, and return your device
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <TrendingUp
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-1"
                            style={{ color: "#254696" }}
                          />
                          <div>
                            <p className="font-semibold text-sm sm:text-base" style={{ color: "#1F2937" }}>
                              Best Product Upgrade Offers
                            </p>
                            <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                              Exclusive deals for your next device purchase.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-xs sm:text-sm" style={{ color: "#666666" }}>
                        Validity: {(mobileBundlePlan?.coverage || '24').toString().replace(/_months/g, '').replace(/months/g, '').trim()} months
                      </div>
                    </div>

                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setMobileBundleFlipped(!mobileBundleFlipped)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-know-more-mobile-bundle"
                      >
                        Know More
                      </button>
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

                  <div className="flip-card-back rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    <div
                      className="p-6 sm:p-7 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        Claim Value Slabs
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95">
                        Device age based claims
                      </p>
                    </div>

                    <div className="flex-grow p-6 sm:p-8 flex flex-col justify-center space-y-4">
                      <ClaimValueSlabs slabs={mobileBundlePlan?.claimValueSlabs || []} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: "#666666" }}>
                        Resale value is calculated as a percentage of your original device purchase price
                      </p>
                    </div>

                    <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                      <button
                        onClick={() => setMobileBundleFlipped(false)}
                        className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                        style={{ color: "#254696" }}
                        data-testid="button-back-mobile-bundle"
                      >
                        Back
                      </button>
                      <Button
                        className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(90deg, #254696, #1F4B88)",
                        }}
                        onClick={() => handleBuyNow(mobileBundlePlan)}
                        disabled={pricesLoading || !mobileBundlePlan}
                        data-testid="button-buy-flipped-mobile-bundle"
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
              </div>
            )}

            */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
