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
// import pricingLaptopHeaderBBG from "@assets/pricing_laptop_header_bbg.webp";
// import pricingLaptopHeaderExtend from "@assets/pricing_laptop_header_extend.webp";
// import pricingMobileHeaderBBG from "@assets/pricing_mobile_header_bbg.webp";
// import pricingMobileHeaderExtend from "@assets/pricing_mobile_header_extend.webp";

const ProgressCircle = ({ percentage }: { percentage: number }) => (
  <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="#E5E7EB"
        strokeWidth="6"
        fill="transparent"
        className="origin-center"
      />
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="#254696"
        strokeWidth="6"
        fill="transparent"
        strokeDasharray="175.9"
        strokeDashoffset={175.9 * (1 - percentage / 100)}
        strokeLinecap="round"
        className="origin-center transition-all duration-1000 ease-out"
      />
    </svg>
    <span
      className="absolute text-[10px] sm:text-xs font-bold"
      style={{ color: "#1F2937" }}
    >
      {percentage}%
    </span>
  </div>
);

const PlanProductCard = ({
  title,
  subtitle,
  price,
  crossedPrice,
  headerImage,
  accent,
  reversed = false,
}: {
  title: string;
  subtitle: string;
  price: string;
  crossedPrice: string;
  headerImage: string;
  accent: string;
  reversed?: boolean;
}) => {
  return (
    <div className="rounded-[32px] overflow-hidden border border-gray-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] flex flex-col h-full">
      <div
        className="p-4 sm:p-5 text-white flex flex-col relative overflow-hidden"
        style={{ background: accent }}
      >
        <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4 w-full min-w-0">
          <div className="flex-1 min-w-0 pr-28 sm:pr-36 md:pr-44">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight break-words max-w-[70%] sm:max-w-[75%] md:max-w-[80%]">
              {title}
              <br />
              {subtitle}
            </h3>
          </div>
          <div className="text-right flex flex-col items-end pt-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 shadow-sm inline-block w-fit ml-auto">
              OFFER
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl text-white/60 line-through decoration-white/40">
                {crossedPrice}
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                {price}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 sm:p-5">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
          <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center text-center justify-center border border-gray-100">
            <div className="w-10 h-10 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative shadow-sm">
              <div className="w-10 h-10 rounded-full border-4 border-[#254696] border-t-transparent animate-spin" />
            </div>
            <h4 className="font-bold text-[13px] text-[#1F2937] mt-2 leading-tight">
              Guaranteed resale value
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">
              Get back up to 70% of device price
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center text-center justify-center border border-gray-100">
            <div className="w-10 h-10 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5 text-gray-400 transform -rotate-45" />
            </div>
            <h4 className="font-bold text-[13px] text-[#1F2937] mt-2 leading-tight">
              Repair Service Warranty
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">
              Zero service cost on repair
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center text-center justify-center border border-gray-100">
            <div className="w-10 h-10 flex-shrink-0 bg-[#EFF6FF] rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h4 className="font-bold text-[13px] text-[#1F2937] mt-2 leading-tight">
              Product Upgrade Offers
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">
              Exclusive deals for your next device
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center text-center justify-center border border-gray-100">
            <div className="w-10 h-10 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative shadow-sm">
              <Percent className="w-5 h-5 text-[#3B82F6] z-10" />
              <div className="absolute inset-0 border-[2px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>
            <h4 className="font-bold text-[13px] text-[#1F2937] mt-2 leading-tight">
              20% Off on Extended Warranty
            </h4>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">
              Save 20% on next device purchase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanSectionHeader = ({
  title,
  subtitle,
  example,
}: {
  title: string;
  subtitle: string;
  example: string;
}) => {
  return (
    <div className="text-center mb-16 sm:mb-20">
      <h2
        className="text-4xl sm:text-5xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-lg sm:text-xl text-gray-300 mb-6">{subtitle}</p>
      <div className="inline-block px-4 py-2 rounded-lg bg-gray-700/50 text-gray-200 text-sm font-medium">
        {example}
      </div>
    </div>
  );
};

const ClaimValueSlabs = ({ slabs }: { slabs: any[] }) => {
  if (!slabs || slabs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <p style={{ color: "#666666" }} className="text-sm text-center">
          No claim value slabs available
        </p>
      </div>
    );
  }

  const formatAgeRange = (slab: any, isFirst: boolean) => {
    const min = slab.minMonths || slab.min_months;
    const max = slab.maxMonths || slab.max_months;

    if (!min || !max) {
      return slab.deviceAge || slab.ageRange || slab.range || "Unknown";
    }

    const ordinalSuffix = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    const minNum = parseInt(min);
    const maxNum = parseInt(max);

    if (isNaN(minNum) || isNaN(maxNum)) {
      return `${min} to ${max} Month`;
    }

    const minSuffix = ordinalSuffix(minNum);
    const maxSuffix = ordinalSuffix(maxNum);

    return (
      <span
        className={`text-[15px] sm:text-base ${isFirst ? "font-bold text-[#254696]" : "text-[#1F2937]"}`}
      >
        {minNum}
        <sup>{minSuffix}</sup>{" "}
        <span
          className={`font-normal ${isFirst ? "text-[#254696]" : "text-gray-600"}`}
        >
          to
        </span>{" "}
        {maxNum}
        <sup>{maxSuffix}</sup> Month
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col pt-2">
      <div className="flex justify-between items-center px-4 mb-2">
        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
          DEVICE AGE
        </span>
        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
          YOU GET BACK
        </span>
      </div>
      <div className="flex flex-col relative w-full">
        {slabs.map((slab, idx) => (
          <div key={idx} className="relative w-full">
            {idx > 0 && (
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gray-200" />
            )}

            <div
              className={`flex justify-between items-center px-4 py-3.5 ${
                idx === 0 ? "bg-[#f0f6fb] rounded-xl shadow-sm" : ""
              }`}
            >
              <div>{formatAgeRange(slab, idx === 0)}</div>
              <div
                className={`text-[15px] sm:text-base ${
                  idx === 0
                    ? "font-bold text-[#254696]"
                    : "font-medium text-[#1a1a1a]"
                }`}
              >
                Get back {slab.resalePercentage || slab.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const initialView =
    deviceType?.toLowerCase() === "mobile" ? "mobile" : "laptop";
  const [selectedView, setSelectedView] = useState<"laptop" | "mobile">(
    initialView,
  );

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
    const isAuthenticated =
      sessionStorage.getItem("customerAuthenticated") === "true";

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
                {deviceAgeSelection === "1"
                  ? "Within 6 months"
                  : "More than 6 months"}
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
                  className="w-full flex flex-col flip-card min-h-[400px]"
                  data-testid="card-laptop-bbg"
                >
                  <div
                    className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${laptopBBGFlipped ? "flipped" : ""}`}
                  >
                    {/* Front Face */}
                    <div className="flip-card-front rounded-[2rem] overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl">
                      {/* Header */}
                      <div
                        className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                        style={{
                          backgroundColor: "var(--xtra-primary)",
                        }}
                      >
                        <div className="flex justify-between items-center w-full relative z-10">
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-3xl font-black leading-tight">
                              BuyBack
                              <br />
                              Guarantee
                            </h3>
                          </div>
                          <div className="text-right flex flex-col items-end z-10">
                            <div className="bg-[#FF6B6B] text-[9px] sm:text-[11px] text-white font-bold px-2 py-0.5 rounded-md mb-1 shadow-sm inline-block">
                              OFFER
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-lg sm:text-2xl text-white/50 line-through font-medium">
                                ₹1299
                              </span>
                              <div className="text-2xl sm:text-4xl font-black text-[#FFD700]">
                                {pricesLoading ? (
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                  `₹${laptopBBGPlan?.planPrice || "--"}`
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2x2 Benefits Grid */}
                      <div className="flex-grow p-4 sm:p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                          {/* Resale Value */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <ProgressCircle percentage={70} />
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                                Guaranteed resale value
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                                Get up to 70% of device price back
                              </p>
                            </div>
                          </div>

                          {/* Repair Service */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight md:mb-1">
                                Repair Service Warranty
                              </h4>
                              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-1 hidden sm:block">
                                • Protection for your device
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">
                                ₹0 service cost on repair
                              </p>
                            </div>
                          </div>

                          {/* Upgrade Offers */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                              <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10 text-[#3B82F6]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                                Best Upgrade Offers
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                                Exclusive deals for next purchase
                              </p>
                            </div>
                          </div>

                          {/* Extended Warranty */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                              <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                              <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                                20% Off Warranty
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                                Save 20% on next protection
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-3">
                          <button
                            onClick={() =>
                              setLaptopBBGFlipped(!laptopBBGFlipped)
                            }
                            className="text-gray-400 hover:text-gray-600 text-xs font-medium underline transition-colors"
                            data-testid="button-know-more-laptop-bbg"
                          >
                            Know More
                          </button>
                          <Button
                            className="w-full text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "var(--xtra-primary)" }}
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

                    {/* Back Face */}
                    <div className="flip-card-back rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                      <div
                        className="p-4 sm:p-5 text-white text-center"
                        style={{
                          background: "var(--xtra-primary)",
                        }}
                      >
                        <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                          Guaranteed Resale Value
                        </h3>
                        <p className="text-xs sm:text-sm mb-3 opacity-95">
                          Lock resale value of your device
                        </p>
                      </div>
                      <div className="flex-grow p-4 sm:p-5 flex flex-col justify-center space-y-2">
                        <ClaimValueSlabs
                          slabs={laptopBBGPlan?.claimValueSlabs || []}
                        />
                        <p
                          className="text-xs sm:text-sm text-center"
                          style={{ color: "#666666" }}
                        >
                          Resale value is calculated as a percentage of your
                          original device purchase price
                        </p>
                      </div>
                      <div className="px-4 sm:px-5 pb-4 space-y-2">
                        <button
                          onClick={() => setLaptopBBGFlipped(false)}
                          className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                          style={{ color: "var(--xtra-primary)" }}
                          data-testid="button-back-laptop-bbg"
                        >
                          Back
                        </button>
                        <Button
                          className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: "var(--xtra-primary)",
                          }}
                          onClick={() => handleBuyNow(laptopBBGPlan)}
                          disabled={pricesLoading || !laptopBBGPlan}
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
                  className="w-full flex flex-col flip-card min-h-[400px]"
                  data-testid="card-mobile-bbg"
                >
                  <div
                    className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${mobileBBGFlipped ? "flipped" : ""}`}
                  >
                    {/* Front Face */}
                    <div className="flip-card-front rounded-[2rem] overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl">
                      {/* Header */}
                      <div
                        className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                        style={{
                          backgroundColor: "var(--xtra-primary)",
                        }}
                      >
                        <div className="flex justify-between items-center w-full relative z-10">
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-3xl font-black leading-tight">
                              BuyBack
                              <br />
                              Guarantee
                            </h3>
                          </div>
                          <div className="text-right flex flex-col items-end z-10">
                            <div className="bg-[#FF6B6B] text-[9px] sm:text-[11px] text-white font-bold px-2 py-0.5 rounded-md mb-1 shadow-sm inline-block">
                              OFFER
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-lg sm:text-2xl text-white/50 line-through font-medium">
                                ₹999
                              </span>
                              <div className="text-2xl sm:text-4xl font-black text-[#FFD700]">
                                {pricesLoading ? (
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                  `₹${mobileBBGPlan?.planPrice || "--"}`
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2x2 Benefits Grid */}
                      <div className="flex-grow p-4 sm:p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                          {/* Resale Value */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <ProgressCircle percentage={70} />
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                                Guaranteed resale value
                              </h4>
                              <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                                Get up to 70% of device price back
                              </p>
                            </div>
                          </div>

                          {/* Repair Service */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                              <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight md:mb-1">
                                Repair Service Warranty
                              </h4>
                              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-1 hidden sm:block">
                                • Protection for your device
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">
                                ₹0 service cost on repair
                              </p>
                            </div>
                          </div>

                          {/* Upgrade Offers */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                              <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10 text-[#3B82F6]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                                Best Upgrade Offers
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                                Exclusive deals for your next purchase
                              </p>
                            </div>
                          </div>

                          {/* Extended Warranty */}
                          <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                              <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                              <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                                20% Off Warranty
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                                Save 20% on next protection
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-3">
                          <button
                            onClick={() =>
                              setMobileBBGFlipped(!mobileBBGFlipped)
                            }
                            className="text-gray-400 hover:text-gray-600 text-xs font-medium underline transition-colors"
                            data-testid="button-know-more-mobile-bbg"
                          >
                            Know More
                          </button>
                          <Button
                            className="w-full text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "var(--xtra-primary)" }}
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

                    {/* Back Face */}
                    <div className="flip-card-back rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                      <div
                        className="p-4 sm:p-5 text-white text-center"
                        style={{
                          background: "var(--xtra-primary)",
                        }}
                      >
                        <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                          Guaranteed Resale Value
                        </h3>
                        <p className="text-xs sm:text-sm mb-3 opacity-95">
                          Lock resale value of your device
                        </p>
                      </div>
                      <div className="flex-grow p-4 sm:p-5 flex flex-col justify-center space-y-2">
                        <ClaimValueSlabs
                          slabs={mobileBBGPlan?.claimValueSlabs || []}
                        />
                        <p
                          className="text-xs sm:text-sm text-center"
                          style={{ color: "#666666" }}
                        >
                          Resale value is calculated as a percentage of your
                          original device purchase price
                        </p>
                      </div>
                      <div className="px-4 sm:px-5 pb-4 space-y-2">
                        <button
                          onClick={() => setMobileBBGFlipped(false)}
                          className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                          style={{ color: "var(--xtra-primary)" }}
                          data-testid="button-back-mobile-bbg"
                        >
                          Back
                        </button>
                        <Button
                          className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: "var(--xtra-primary)",
                          }}
                          onClick={() => handleBuyNow(mobileBBGPlan)}
                          disabled={pricesLoading || !mobileBBGPlan}
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
                  className="w-full flex flex-col min-h-[400px]"
                  data-testid="card-laptop-extend"
                >
                  <div className="rounded-[2rem] overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl h-full">
                    {/* Header */}
                    <div
                      className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                      style={{
                        backgroundColor: "var(--xtra-primary)",
                      }}
                    >
                      <div className="flex justify-between items-center w-full relative z-10">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-3xl font-black leading-tight">
                            Extend+
                            <br />
                            Protection
                          </h3>
                        </div>
                        <div className="text-right flex flex-col items-end z-10">
                          <div className="bg-[#FF6B6B] text-[9px] sm:text-[11px] text-white font-bold px-2 py-0.5 rounded-md mb-1 shadow-sm inline-block">
                            OFFER
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg sm:text-2xl text-white/50 line-through font-medium">
                              ₹1299
                            </span>
                            <div className="text-2xl sm:text-4xl font-black text-[#FFD700]">
                              {pricesLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : (
                                `₹${laptopExtendPlan?.planPrice || "--"}`
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2x2 Benefits Grid */}
                    <div className="flex-grow p-4 sm:p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                        {/* Doorstep Auction */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                            <Gavel className="w-7 h-7 sm:w-10 sm:h-10 text-[#254696]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                              Doorstep Auction
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                              Get 10-20% higher market value
                            </p>
                          </div>
                        </div>

                        {/* Repair Service */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight md:mb-1">
                              Repair Service Warranty
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-1 hidden sm:block">
                              • Protection for your device
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">
                              ₹0 service cost on repair
                            </p>
                          </div>
                        </div>

                        {/* Upgrade Offers */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10 text-[#3B82F6]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                              Best Upgrade Offers
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                              Exclusive deals for next purchase
                            </p>
                          </div>
                        </div>

                        {/* Extended Warranty */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                            <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                            <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                              20% Off Warranty
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                              Save 20% on next protection
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col items-center gap-3">
                        <Button
                          className="w-full text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "var(--xtra-primary)" }}
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
                </div>
              )}

              {showMobileExtend && (
                <div
                  className="w-full flex flex-col min-h-[400px]"
                  data-testid="card-mobile-extend"
                >
                  <div className="rounded-[2rem] overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl h-full">
                    {/* Header */}
                    <div
                      className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                      style={{
                        backgroundColor: "var(--xtra-primary)",
                      }}
                    >
                      <div className="flex justify-between items-center w-full relative z-10">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-3xl font-black leading-tight">
                            Extend+
                            <br />
                            Protection
                          </h3>
                        </div>
                        <div className="text-right flex flex-col items-end z-10">
                          <div className="bg-[#FF6B6B] text-[9px] sm:text-[11px] text-white font-bold px-2 py-0.5 rounded-md mb-1 shadow-sm inline-block">
                            OFFER
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg sm:text-2xl text-white/50 line-through font-medium">
                              ₹999
                            </span>
                            <div className="text-2xl sm:text-4xl font-black text-[#FFD700]">
                              {pricesLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : (
                                `₹${mobileExtendPlan?.planPrice || "--"}`
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2x2 Benefits Grid */}
                    <div className="flex-grow p-4 sm:p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                        {/* Doorstep Auction */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                            <Gavel className="w-7 h-7 sm:w-10 sm:h-10 text-[#254696]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                              Doorstep Auction
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                              Get 10-20% higher market value
                            </p>
                          </div>
                        </div>

                        {/* Repair Service */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight md:mb-1">
                              Repair Service Warranty
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-1 hidden sm:block">
                              • Protection for your device
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">
                              ₹0 service cost on repair
                            </p>
                          </div>
                        </div>

                        {/* Upgrade Offers */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10 text-[#3B82F6]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                              Best Upgrade Offers
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                              Exclusive deals for your next purchase
                            </p>
                          </div>
                        </div>

                        {/* Extended Warranty */}
                        <div className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 border border-gray-50">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                            <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                            <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[13px] sm:text-base text-[#1F2937] leading-tight">
                              20% Off Warranty
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-1">
                              Save 20% on next protection
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col items-center gap-3">
                        <Button
                          className="w-full text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "var(--xtra-primary)" }}
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
                </div>
              )}

              {/*

            {showLaptopBundle && (
              <div
                className="w-full flex flex-col flip-card min-h-[350px]"
                data-testid="card-laptop-bundle"
              >
                <div className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${laptopBundleFlipped ? 'flipped' : ''}`}>
                  
                  <div className="flip-card-front rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    
                    <div
                      className="p-4 sm:p-5 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        BuyBack + Extend+ Bundle
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95 line-clamp-2">
                        Repairs, better resale & savings
                      </p>
                      <div className="text-3xl sm:text-4xl font-bold">
                        {pricesLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin inline" />
                        ) : (
                          `₹${laptopBundlePlan?.planPrice || "--"}`
                        )}
                      </div>
                    </div>

                    
                    <div className="p-4 sm:p-5 space-y-2">
                      
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Shield
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
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
                        <div className="flex gap-3">
                          <Gavel
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
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
                        <div className="flex gap-3">
                          <TrendingUp
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
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

                    <div className="px-4 sm:px-5 pb-1 sm:pb-2 space-y-2">
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
                      className="p-4 sm:p-5 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        Claim Value Slabs
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95">
                        Device age based claims
                      </p>
                    </div>

                    <div className="flex-grow p-4 sm:p-5 flex flex-col justify-center space-y-4">
                      <ClaimValueSlabs slabs={laptopBundlePlan?.claimValueSlabs || []} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: "#666666" }}>
                        Resale value is calculated as a percentage of your original device purchase price
                      </p>
                    </div>

                    <div className="px-4 sm:px-5 pb-1 sm:pb-2 space-y-2">
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
                className="w-full flex flex-col flip-card min-h-[350px]"
                data-testid="card-mobile-bundle"
              >
                <div className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${mobileBundleFlipped ? 'flipped' : ''}`}>
                  
                  <div className="flip-card-front rounded-3xl overflow-y-auto flex flex-col bg-white border border-gray-100">
                    
                    <div
                      className="p-4 sm:p-5 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        BuyBack + Extend+ Bundle
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95 line-clamp-2">
                        Repairs, better resale & savings
                      </p>
                      <div className="text-3xl sm:text-4xl font-bold">
                        {pricesLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin inline" />
                        ) : (
                          `₹${mobileBundlePlan?.planPrice || "--"}`
                        )}
                      </div>
                    </div>

                    
                    <div className="p-4 sm:p-5 space-y-2">
                      
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Shield
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
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
                        <div className="flex gap-3">
                          <Gavel
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
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
                        <div className="flex gap-3">
                          <TrendingUp
                            className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
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

                    <div className="px-4 sm:px-5 pb-1 sm:pb-2 space-y-2">
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
                      className="p-4 sm:p-5 text-white text-center"
                      style={{ background: "linear-gradient(135deg, #254696, #1F4B88)" }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        Claim Value Slabs
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 opacity-95">
                        Device age based claims
                      </p>
                    </div>

                    <div className="flex-grow p-4 sm:p-5 flex flex-col justify-center space-y-4">
                      <ClaimValueSlabs slabs={mobileBundlePlan?.claimValueSlabs || []} />
                      <p className="text-xs sm:text-sm text-center" style={{ color: "#666666" }}>
                        Resale value is calculated as a percentage of your original device purchase price
                      </p>
                    </div>

                    <div className="px-4 sm:px-5 pb-1 sm:pb-2 space-y-2">
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
