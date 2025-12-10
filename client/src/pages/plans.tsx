import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, ShieldCheck, Truck, Wallet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.png";

export default function Plans() {
  const [, setLocation] = useLocation();
  
  // First try URL params, then fall back to sessionStorage for back navigation support
  let searchParams = new URLSearchParams(window.location.search);
  let deviceType = searchParams.get("type");
  let deviceBrand = searchParams.get("brand");
  let devicePurchaseDate = searchParams.get("date");
  
  // If URL params missing, try to restore from sessionStorage (for back navigation)
  if (!deviceType || !deviceBrand || !devicePurchaseDate) {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (storedPlan) {
      try {
        const parsed = JSON.parse(storedPlan);
        if (parsed.plansQuery) {
          const storedParams = new URLSearchParams(parsed.plansQuery);
          deviceType = storedParams.get("type");
          deviceBrand = storedParams.get("brand");
          devicePurchaseDate = storedParams.get("date");
          
          // Restore URL for proper browser history
          if (deviceType && deviceBrand && devicePurchaseDate) {
            window.history.replaceState({}, '', `/plans${parsed.plansQuery}`);
          }
        }
      } catch {}
    }
  }

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
    return allPlans.find((p: any) => p.deviceType === planDeviceType && p.planType === planType);
  };

  const laptopBBGPlan = getPlanInfo("laptop", "bbg");
  const mobileBBGPlan = getPlanInfo("mobile", "bbg");
  const laptopExtendPlan = getPlanInfo("laptop", "extend_plus");
  const mobileExtendPlan = getPlanInfo("mobile", "extend_plus");

  if (!deviceType || !deviceBrand || !devicePurchaseDate) {
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

  const [year, month, day] = devicePurchaseDate.split("-").map(Number);
  const purchaseDate = new Date(year, month - 1, day);
  purchaseDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoffDate = new Date(today);
  cutoffDate.setMonth(cutoffDate.getMonth() - 6);
  cutoffDate.setHours(0, 0, 0, 0);

  const isWithinSixMonths = purchaseDate >= cutoffDate;
  const isMobile = deviceType.toLowerCase() === "mobile";
  const isLaptop = deviceType.toLowerCase() === "laptop";

  const showLaptopBBG = isLaptop && isWithinSixMonths;
  const showMobileBBG = isMobile && isWithinSixMonths;
  const showLaptopExtend = isLaptop;
  const showMobileExtend = isMobile;

  const visibleCards = [
    showLaptopBBG,
    showMobileBBG,
    showLaptopExtend,
    showMobileExtend,
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
      purchaseDate: devicePurchaseDate,
      plansQuery: window.location.search,
    };
    
    sessionStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    setLocation('/checkout');
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
                data-testid="text-purchase-date"
              >
                <strong>Purchase Date:</strong>{" "}
                {new Date(devicePurchaseDate).toLocaleDateString("en-IN")}
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
          <div className="mt-4 mb-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">No Hidden Charges</span>
            </div>
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Free Doorstep Pickup</span>
            </div>
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Instant Payouts</span>
            </div>
            <div className="flex flex-col items-center text-center w-20 sm:w-24">
              <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-[#254696] mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Completely Digital</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-6 lg:py-8 relative overflow-hidden">
        <img
          src={pricingCardBackground}
          alt="Background pattern"
          className="absolute inset-0 w-full h-full object-fill z-0"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 ${visibleCards > 1 ? "lg:grid-cols-2" : ""} gap-8 lg:gap-12 justify-items-center items-stretch`}
          >
            {showLaptopBBG && (
              <div
                className="relative w-full max-w-xs h-full flex flex-col"
                data-testid="card-laptop-bbg"
              >
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                  <div
                    className="p-4 sm:p-6 pb-3 sm:pb-4 text-white text-center"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  >
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                      Laptop BBG
                    </h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? (
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" />
                      ) : (
                        `₹${laptopBBGPlan?.planPrice || '--'}`
                      )}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">
                      (inclusive of GST)
                    </p>
                  </div>

                  <div
                    className="p-4 sm:p-6 pt-3 sm:pt-4 flex-grow mt-10 sm:mt-12"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                  >
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          70% payout value
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Free doorstep pickup for claims
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Instant payouts
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Validity: 36 months
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 sm:p-6 pt-4 sm:pt-6">
                    <Button 
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleBuyNow(laptopBBGPlan)}
                      disabled={pricesLoading || !laptopBBGPlan}
                      data-testid="button-buy-laptop-bbg"
                    >
                      {pricesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                    </Button>
                  </div>
                </div>

                <div
                  className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]"
                  style={{ left: "-1.5rem" }}
                >
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        Assured buyback value for
                        <br />
                        your Laptop
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {showMobileBBG && (
              <div
                className="relative w-full max-w-xs h-full flex flex-col"
                data-testid="card-mobile-bbg"
              >
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                  <div
                    className="p-4 sm:p-6 pb-3 sm:pb-4 text-white text-center"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  >
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                      Mobile BBG
                    </h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? (
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" />
                      ) : (
                        `₹${mobileBBGPlan?.planPrice || '--'}`
                      )}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">
                      (inclusive of GST)
                    </p>
                  </div>

                  <div
                    className="p-4 sm:p-6 pt-3 sm:pt-4 flex-grow mt-10 sm:mt-12"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                  >
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">70% payout value</span>
                      </li>

                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Free doorstep pickup for claims
                        </span>
                      </li>

                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Instant payouts</span>
                      </li>

                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Validity: 18 months</span>
                      </li>
                    </ul>
                  </div>


                  <div className="p-4 sm:p-6 pt-4 sm:pt-6">
                    <Button 
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleBuyNow(mobileBBGPlan)}
                      disabled={pricesLoading || !mobileBBGPlan}
                      data-testid="button-buy-mobile-bbg"
                    >
                      {pricesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                    </Button>
                  </div>
                </div>

                <div
                  className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]"
                  style={{ left: "-1.5rem" }}
                >
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        Assured buyback value for
                        <br />
                        your Mobile
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {showLaptopExtend && (
              <div
                className="relative w-full max-w-xs h-full flex flex-col"
                data-testid="card-laptop-extend"
              >
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                  <div
                    className="p-4 sm:p-6 pb-3 sm:pb-4 text-white text-center"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  >
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                      Laptop Extend+
                    </h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? (
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" />
                      ) : (
                        `₹${laptopExtendPlan?.planPrice || '--'}`
                      )}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">
                      (inclusive of GST)
                    </p>
                  </div>

                  <div
                    className="p-4 sm:p-6 pt-3 sm:pt-4 flex-grow mt-10 sm:mt-12"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                  >
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          1 Free Device Repair†
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Auction Service → 10-20% higher resale than market†
                        </span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Validity: 24 months
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 sm:p-6 pt-4 sm:pt-6">
                    <Button 
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleBuyNow(laptopExtendPlan)}
                      disabled={pricesLoading || !laptopExtendPlan}
                      data-testid="button-buy-laptop-extend"
                    >
                      {pricesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                    </Button>
                  </div>
                </div>

                <div
                  className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]"
                  style={{ left: "-1.5rem" }}
                >
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        Protection, repairs, and
                        <br />
                        better resale
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {showMobileExtend && (
              <div
                className="relative w-full max-w-xs h-full flex flex-col"
                data-testid="card-mobile-extend"
              >
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                  <div
                    className="p-4 sm:p-6 pb-3 sm:pb-4 text-white text-center"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  >
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                      Mobile Extend+
                    </h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? (
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" />
                      ) : (
                        `₹${mobileExtendPlan?.planPrice || '--'}`
                      )}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">
                      (inclusive of GST)
                    </p>
                  </div>

                  <div
                    className="p-4 sm:p-6 pt-3 sm:pt-4 flex-grow mt-10 sm:mt-12"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                  >
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">1 Free Device Repair*</span>
                      </li>

                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">
                          Auction Service → 10–20% higher resale than market*
                        </span>
                      </li>

                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Validity: 24 months</span>
                      </li>
                    </ul>
                  </div>


                  <div className="p-4 sm:p-6 pt-4 sm:pt-6">
                    <Button 
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleBuyNow(mobileExtendPlan)}
                      disabled={pricesLoading || !mobileExtendPlan}
                      data-testid="button-buy-mobile-extend"
                    >
                      {pricesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy Now"}
                    </Button>
                  </div>
                </div>

                <div
                  className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]"
                  style={{ left: "-1.5rem" }}
                >
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        Protection, repairs, and
                        <br />
                        better resale
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
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
