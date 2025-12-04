import { useLocation } from "wouter";
import { Loader2, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import planWorksBackgroundImg from "@assets/Untitled design (15) (1)_1764254452404.png";

export default function Plans() {
  const location = useLocation();
  
  // Parse query parameters
  const params = new URLSearchParams(location[0].split("?")[1] || "");
  const deviceType = params.get("type") || "";
  const deviceBrand = params.get("brand") || "";
  const purchaseDate = params.get("date") || "";

  // Fetch dynamic BBG prices
  const { data: bbgPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/bbg-prices"],
    queryFn: async () => {
      const response = await fetch("/api/bbg-prices");
      if (!response.ok) throw new Error("Failed to fetch BBG prices");
      return response.json();
    },
  });

  // Compute if device is within 6 months
  const isWithinSixMonths = (() => {
    if (!purchaseDate) return false;
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    const pDate = new Date(purchaseDate);
    return pDate >= sixMonthsAgo;
  })();

  const isMobile = deviceType === "mobile";
  const isLaptop = deviceType === "laptop";

  // Determine which cards to show
  const showMobileBBG = isMobile && isWithinSixMonths;
  const showMobileExtend = isMobile;
  const showLaptopBBG = isLaptop && isWithinSixMonths;
  const showLaptopExtend = isLaptop;

  if (!deviceType || !deviceBrand || !purchaseDate) {
    return (
      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "#303e58" }}>
            Please go back and select your device details
          </h2>
          <p className="text-gray-600">You need to fill in all fields to see available plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Pricing Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "#303e58" }}>
              Available Plans
            </h1>
            <p className="text-gray-600">
              {isWithinSixMonths ? "Your device is eligible for both BBG and Extend+" : "Your device qualifies for Extend+ plan"}
            </p>
          </div>

          {/* Grid of Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
            {/* Mobile BBG */}
            {showMobileBBG && (
              <div className="relative w-full max-w-xs">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Mobile BBG</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">(inclusive of GST)</p>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Up to 70% payout value</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Coverage for up to 18 months</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Free doorstep pickup for claims</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Instant payouts at the time of device handover</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{ left: "-1.5rem" }}>
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        Assured buyback value for<br />your Mobile
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Extend+ */}
            {showMobileExtend && (
              <div className="relative w-full max-w-xs">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Mobile Extend+</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Free Auction Service → 10-20% higher resale than market</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">1 Free Device Repair (service charges waived, parts chargeable)</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Validity: 24 months</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{ left: "-1.5rem" }}>
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        (inclusive of GST)
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Laptop BBG */}
            {showLaptopBBG && (
              <div className="relative w-full max-w-xs">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Laptop BBG</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">(inclusive of GST)</p>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Up to 70% payout value</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Coverage for up to 36 months</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Free doorstep pickup for claims</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Instant payouts at the time of device handover</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{ left: "-1.5rem" }}>
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        Assured buyback value for<br />your Laptop
                      </p>
                    </div>
                    <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Laptop Extend+ */}
            {showLaptopExtend && (
              <div className="relative w-full max-w-xs">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Laptop Extend+</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                    <ul className="space-y-2 sm:space-y-3 text-white">
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Free Auction Service → 10-20% higher resale than market</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">1 Free Device Repair (service charges waived, parts chargeable)</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-white mr-2 sm:mr-3">•</span>
                        <span className="text-xs sm:text-sm">Validity: 24 months</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{ left: "-1.5rem" }}>
                  <div className="relative sm:block">
                    <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                      <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                        (inclusive of GST)
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
