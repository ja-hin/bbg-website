import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.png";

export default function Plans() {
  const searchParams = new URLSearchParams(window.location.search);
  const deviceType = searchParams.get("type");
  const deviceBrand = searchParams.get("brand");
  const devicePurchaseDate = searchParams.get("date");

  const { data: bbgPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/bbg-prices"],
    queryFn: async () => {
      const response = await fetch("/api/bbg-prices");
      if (!response.ok) throw new Error("Failed to fetch BBG prices");
      return response.json();
    },
  });

  if (!deviceType || !deviceBrand || !devicePurchaseDate) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4" data-testid="heading-no-device">
            No device details found
          </h1>
          <p className="text-gray-600 mb-6" data-testid="text-no-device-desc">
            Please go back and select your device details to view available plans.
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

  const [year, month, day] = devicePurchaseDate.split('-').map(Number);
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

  return (
    <div className="min-h-screen bg-white">
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
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

          <div className="text-center mb-8">
            <h1 
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              data-testid="heading-available-plans"
            >
              Available Plans for Your Device
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full" data-testid="text-device-type">
                <strong>Type:</strong> {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full" data-testid="text-device-brand">
                <strong>Brand:</strong> {deviceBrand}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full" data-testid="text-purchase-date">
                <strong>Purchase Date:</strong> {new Date(devicePurchaseDate).toLocaleDateString("en-IN")}
              </span>
            </div>
            {!isWithinSixMonths && (
              <p className="mt-4 text-sm text-amber-600" data-testid="text-older-device-note">
                Your device is more than 6 months old. Only Extend+ plans are available.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 lg:py-10 relative overflow-hidden">
        <img 
          src={pricingCardBackground} 
          alt="Background pattern" 
          className="absolute inset-0 w-full h-full object-fill z-0"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 ${visibleCards > 1 ? 'lg:grid-cols-2' : ''} gap-8 lg:gap-12 justify-items-center`}>

            {showLaptopBBG && (
              <div className="relative w-full max-w-xs" data-testid="card-laptop-bbg">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Laptop BBG</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">(inclusive of GST)</p>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
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

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
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

            {showMobileBBG && (
              <div className="relative w-full max-w-xs" data-testid="card-mobile-bbg">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Mobile BBG</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm">(inclusive of GST)</p>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
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

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
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

            {showLaptopExtend && (
              <div className="relative w-full max-w-xs" data-testid="card-laptop-extend">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Laptop Extend+</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
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

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
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

            {showMobileExtend && (
              <div className="relative w-full max-w-xs" data-testid="card-mobile-extend">
                <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                  <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Mobile Extend+</h3>
                    <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                      {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 pt-8 sm:pt-14 mt-4 sm:mt-4" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
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

                <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
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
