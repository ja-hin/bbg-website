import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FiCheck } from "react-icons/fi";
import { BsCheckLg } from "react-icons/bs";

import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useCallback, useEffect } from "react";
import { DevicePlanSelectorForm } from "@/components/device-plan-selector-form";
import {
  Smartphone,
  Laptop,
  Shield,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Loader2,
  HelpCircle,
  Clock,
  Wrench,
  Package,
  Car,
  IndianRupee,
  Calendar,
  Truck,
  Zap,
  Gift,
  DollarSign,
  Hand,
  ShieldCheck,
  Percent,
  Gavel,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HomepageCarousel } from "@/components/homepage-carousel";
import deviceRegistrationImg from "@assets/BBG process - website.webp";
import resaleValueImg from "@assets/Extend+ process - webiste.webp";
import doorstepPickupImg from "@assets/BBG_Process_mob.webp";
import instantPaymentImg from "@assets/Extend+_process_mob.webp";
import bbgVideoFile from "@assets/Video final BBG ky hota_1758894912803.mp4";
import specialOfferRibbon from "@assets/(inclusive of GST) (1)_1759126276325.webp";
import whyChooseBbgIcon from "@assets/(inclusive of GST) (3)_1759127901876.webp";
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.webp";
import planWorksBackgroundImg from "@assets/Untitled design (15) (1)_1764254452404.webp";
import learnMoreBtn from "@assets/Untitled design (1) (1)_1764258271086.webp";
import bannerImg from "@assets/Referral_website.webp";
import buybackGuaranteeImgBelow from "@assets/Referral_mobile.webp";
import topBannerDesktop from "@assets/holiwebsite.webp";
import topBannerMobile from "@assets/holimobile.webp";
import heroBelowSectionImg from "@assets/hero-below-section.webp";
import heroBelowSectionMsiteImg from "@assets/hero-below-section-msite.webp";
import howPlanWorksImg from "@assets/how-plan-works.webp";
import howPlanWorksMsiteImg from "@assets/how-plan-works-msite.webp";
import pricingLaptopHeaderBBG from "@assets/pricing_laptop_header_bbg.webp";
import pricingLaptopHeaderExtend from "@assets/pricing_laptop_header_extend.webp";
import pricingMobileHeaderBBG from "@assets/pricing_mobile_header_bbg.webp";
import pricingMobileHeaderExtend from "@assets/pricing_mobile_header_extend.webp";

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

const ProgressCircle = ({ percentage }: { percentage: number }) => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
    <svg className="w-full h-full transform -rotate-90">
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
    <span className="absolute text-[10px] sm:text-xs font-bold" style={{ color: "#1F2937" }}>
      {percentage}%
    </span>
  </div>
);

export default function Home() {
  const [isBBGExpanded, setIsBBGExpanded] = useState(false);
  const [isExtendExpanded, setIsExtendExpanded] = useState(false);
  const [selectedDeviceTypeFromCard, setSelectedDeviceTypeFromCard] = useState<
    string | undefined
  >();
  const [carouselLoaded, setCarouselLoaded] = useState(false);
  const [pricingView, setPricingView] = useState<"laptop" | "mobile">("laptop");
  const [laptopBBGFlipped, setLaptopBBGFlipped] = useState(false);
  const [mobileBBGFlipped, setMobileBBGFlipped] = useState(false);
  const [laptopExtendFlipped, setLaptopExtendFlipped] = useState(false);
  const [mobileExtendFlipped, setMobileExtendFlipped] = useState(false);
  const [laptopBundleFlipped, setLaptopBundleFlipped] = useState(false);
  const [mobileBundleFlipped, setMobileBundleFlipped] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleCarouselFirstImageLoaded = useCallback(() => {
    setCarouselLoaded(true);
  }, []);

  // Fallback: if carousel doesn't load within 2 seconds, enable deferred queries anyway
  useEffect(() => {
    if (carouselLoaded) return;
    const timeout = setTimeout(() => {
      setCarouselLoaded(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [carouselLoaded]);

  const handleViewPlans = (deviceType: string) => {
    setSelectedDeviceTypeFromCard(deviceType);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  // Fetch theme for dynamic coloring - DEFERRED until carousel loads
  const { data: theme } = useQuery({
    queryKey: ["/api/theme/current"],
    retry: false,
    staleTime: 600000,
    enabled: carouselLoaded,
  });

  // Fetch plans for dynamic pricing - DEFERRED until carousel loads (with fallback timeout)
  const { data: allPlans = [], isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/plans"],
    staleTime: 600000,
    enabled: carouselLoaded,
  });

  // Extract prices from plans based on device type and plan type
  const getLaptopBBGPrice = () => {
    const plan = allPlans.find(
      (p: any) => p.deviceType === "laptop" && p.planType === "bbg",
    );
    return plan?.planPrice || 499;
  };

  const getMobileBBGPrice = () => {
    const plan = allPlans.find(
      (p: any) => p.deviceType === "mobile" && p.planType === "bbg",
    );
    return plan?.planPrice || 299;
  };

  const getLaptopExtendPrice = () => {
    const plan = allPlans.find(
      (p: any) => p.deviceType === "laptop" && p.planType === "extend_plus",
    );
    return plan?.planPrice || 399;
  };

  const getMobileExtendPrice = () => {
    const plan = allPlans.find(
      (p: any) => p.deviceType === "mobile" && p.planType === "extend_plus",
    );
    return plan?.planPrice || 299;
  };

  const getLaptopBundlePrice = () => {
    const plan = allPlans.find(
      (p: any) => p.deviceType === "laptop" && p.planType === "bundle",
    );
    return plan?.planPrice || 799;
  };

  const getMobileBundlePrice = () => {
    const plan = allPlans.find(
      (p: any) => p.deviceType === "mobile" && p.planType === "bundle",
    );
    return plan?.planPrice || 499;
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Top Banner Section */}
      <section className="w-full">
        <div
          onClick={scrollToForm}
          className="w-full cursor-pointer overflow-hidden transition-opacity hover:opacity-95"
        >
          <picture>
            <source media="(max-width: 639px)" srcSet={topBannerMobile} />
            <img
              src={topBannerDesktop}
              alt="Special Offer Banner"
              className="w-full h-auto object-cover"
            />
          </picture>
        </div>
      </section>
      
      {/* Hero Below Section */}
      <section 
        className="w-full cursor-pointer transition-opacity hover:opacity-95"
        onClick={scrollToForm}
      >
        <picture>
          <source media="(max-width: 639px)" srcSet={heroBelowSectionMsiteImg} />
          <img
            src={heroBelowSectionImg}
            alt="Value Proposition"
            className="w-full h-auto block"
          />
        </picture>
      </section>

      {/* Smart Plans Section */}

      {/* Homepage Carousel - Critical path, loads first */}
      <div className="hidden">
        <HomepageCarousel onFirstImageLoaded={handleCarouselFirstImageLoaded} />
      </div>
      {/* Smart Plans Section with Form */}
      <section
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        style={{
          background:
            "linear-gradient(135deg, #f0f6fb 0%, #f5f9ff 50%, #faf8ff 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Left Side - Text + Benefits - Hidden on mobile, only form shows */}
            <div className="hidden lg:block">
              <div className="mb-2">
                <span
                  className="inline-block text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full px-4 py-2"
                  style={{
                    background: "rgba(37, 70, 150, 0.1)",
                    color: "#254696",
                  }}
                >
                  Find Your Perfect Plan
                </span>
              </div>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 mt-4"
                style={{ color: "#1a1a1a", fontFamily: "Poppins, sans-serif" }}
              >
                Smart plans for stronger resale value and repair support
              </h2>

              <div className="space-y-5 mt-8">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "rgba(37, 70, 150, 0.15)" }}
                  >
                    <BsCheckLg
                      className="text-lg font-bold"
                      style={{ color: "#254696" }}
                    />
                  </div>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    Guaranteed resale value
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "rgba(37, 70, 150, 0.15)" }}
                  >
                    <BsCheckLg
                      className="text-lg font-bold"
                      style={{ color: "#254696" }}
                    />
                  </div>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    1-Year Extended Repair Service Warranty
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "rgba(37, 70, 150, 0.15)" }}
                  >
                    <BsCheckLg
                      className="text-lg font-bold"
                      style={{ color: "#254696" }}
                    />
                  </div>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    Best Product Upgrade Offers
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "rgba(37, 70, 150, 0.15)" }}
                  >
                    <BsCheckLg
                      className="text-lg font-bold"
                      style={{ color: "#254696" }}
                    />
                  </div>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    20% Off on 1-Year Extended Warranty
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "rgba(37, 70, 150, 0.15)" }}
                  >
                    <BsCheckLg
                      className="text-lg font-bold"
                      style={{ color: "#254696" }}
                    />
                  </div>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    Supports all major mobile and laptop brands
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1"
                    style={{ background: "rgba(37, 70, 150, 0.15)" }}
                  >
                    <BsCheckLg
                      className="text-lg font-bold"
                      style={{ color: "#254696" }}
                    />
                  </div>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{ color: "#4b5563" }}
                  >
                    100% authorized services
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Form Card */}
            <div ref={formRef}>
              <DevicePlanSelectorForm
                initialDeviceType={selectedDeviceTypeFromCard}
                formRef={formRef}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plan pricing and coverage Section */}
      <section
        className="bg-white"
        style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-8">
            <div
              className="hidden sm:block w-16 lg:w-48"
              style={{ height: "0.125rem", backgroundColor: "#303e58" }}
            ></div>
            <h2
              className="text-center"
              style={{
                fontSize: "clamp(26px, 6vw, 48px)",
                color: "#303e58",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "900",
                letterSpacing: "-0.42px",
                lineHeight: "1.22",
              }}
            >
              Plan pricing and coverage
            </h2>
            <div
              className="hidden sm:block w-16 lg:w-48"
              style={{ height: "0.125rem", backgroundColor: "#303e58" }}
            ></div>
          </div>

          {/* Plan Type Toggle */}
          <div className="flex justify-center mt-6 mb-2">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setPricingView("laptop")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  pricingView === "laptop"
                    ? "bg-[#254696] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                data-testid="toggle-pricing-laptop"
              >
                <Laptop className="w-4 h-4" />
                Laptop Plans
              </button>
              <button
                onClick={() => setPricingView("mobile")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  pricingView === "mobile"
                    ? "bg-[#254696] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                data-testid="toggle-pricing-mobile"
              >
                <Smartphone className="w-4 h-4" />
                Mobile Plans
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* BBG Pricing Section */}
      <section className="py-6 sm:py-8 lg:py-10 relative overflow-hidden">
        {/* Background Image */}
        <img
          src={pricingCardBackground}
          alt="Background pattern"
          className="absolute inset-0 w-full h-full object-fill z-0"
        />
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 lg:gap-10 items-stretch [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            {/* Laptop Plans */}
            {pricingView === "laptop" && (
              <>
                {/* Laptop BBG Card */}
                <div
                  className="w-full flex flex-col flip-card min-h-[400px]"
                  data-testid="card-laptop-bbg"
                >
                  <div
                    className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${laptopBBGFlipped ? "flipped" : ""}`}
                  >
                    {/* Front Face */}
                    <div className="flip-card-front rounded-[2rem] overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl">
                      {/* Header with Background and Asset */}
                        <div
                          className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                          style={{
                            backgroundColor: "var(--xtra-primary)",
                          }}
                        >
                          <div className="flex justify-between items-center w-full relative z-10">
                            <div className="flex-1">
                              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                                BuyBack
                                <br />
                                Guarantee
                              </h3>
                            </div>
                            <div className="absolute right-[25%] top-1/2 -translate-y-1/2 w-20 sm:w-32 opacity-90 pointer-events-none z-0">
                              <img 
                                src={pricingLaptopHeaderBBG} 
                                alt="Laptop Guarantee" 
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="bg-[#FF6B6B] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-md mb-2 shadow-sm inline-block">
                                OFFER
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xl sm:text-2xl text-white/50 line-through font-medium">
                                  ₹1299
                                </span>
                                <div className="text-3xl sm:text-4xl font-black text-[#FFD700]">
                                  {pricesLoading ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  ) : (
                                    `₹${getLaptopBBGPrice()}`
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* 2x2 Benefits Grid */}
                      <div className="flex-grow p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Resale Value */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <ProgressCircle percentage={70} />
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Guaranteed resale value</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Get back up to 70% of your device's purchase price when you sell it back</p>
                            </div>
                          </div>

                          {/* Repair Service */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                              <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Accidental Damage Repair Service</h4>
                              <ul className="text-[10px] sm:text-[11px] text-gray-500 mt-1 space-y-0.5">
                                <li>• Protection for your existing device</li>
                                <li>• Begins after brand warranty ends</li>
                                <li>• ₹0 service cost on repair</li>
                              </ul>
                            </div>
                          </div>

                          {/* Upgrade Offers */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                               <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-[#3B82F6]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Best Product Upgrade Offers</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Exclusive deals for your next device purchase</p>
                            </div>
                          </div>

                          {/* Extended Warranty */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                               <Percent className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                               <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">20% Off on 1-Year Extended Warranty</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Save 20% on protection of your next device purchase</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-3">
                          <button
                            onClick={() => setLaptopBBGFlipped(!laptopBBGFlipped)}
                            className="text-gray-400 hover:text-gray-600 text-xs font-medium underline transition-colors"
                            data-testid="button-know-more-laptop-bbg"
                          >
                            Know More
                          </button>
                          <button
                            onClick={scrollToForm}
                            className="w-full bg-xtra-primary text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: "var(--xtra-primary)" }}
                            data-testid="button-explore-laptop-bbg"
                          >
                            Explore Plans
                          </button>
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
                      <div className="flex-grow p-4 sm:p-5 flex flex-col justify-center space-y-4">
                        <ClaimValueSlabs
                          slabs={
                            allPlans.find(
                              (p: any) =>
                                p.deviceType === "laptop" &&
                                p.planType === "bbg",
                            )?.claimValueSlabs || []
                          }
                        />
                        <p
                          className="text-xs sm:text-sm text-center"
                          style={{ color: "#666666" }}
                        >
                          Resale value is calculated as a percentage of your
                          original device purchase price
                        </p>
                      </div>
                      <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                        <button
                          onClick={() => setLaptopBBGFlipped(false)}
                          className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                          style={{ color: "#254696" }}
                          data-testid="button-back-laptop-bbg"
                        >
                          Back
                        </button>
                        <button
                          onClick={scrollToForm}
                          className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg"
                           style={{
                            background: "var(--xtra-primary)",
                          }}
                          data-testid="button-explore-flipped-laptop-bbg"
                        >
                          Explore Plans
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop Extend+ Card */}
                <div
                  className="w-full flex flex-col min-h-[400px]"
                  data-testid="card-laptop-extend"
                >
                  <div className="rounded-3xl shadow-xl overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl h-full">
                      {/* Header with Background and Asset */}
                        <div
                          className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                          style={{
                            backgroundColor: "var(--xtra-primary)",
                          }}
                        >
                          <div className="flex justify-between items-center w-full relative z-10">
                            <div className="flex-1">
                              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                                Extend+
                                <br />
                                Protection
                              </h3>
                            </div>
                            <div className="absolute right-[25%] top-1/2 -translate-y-1/2 w-20 sm:w-32 opacity-90 pointer-events-none z-0">
                              <img 
                                src={pricingLaptopHeaderExtend} 
                                alt="Laptop Protection" 
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="bg-[#FF6B6B] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-md mb-2 shadow-sm inline-block">
                                OFFER
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xl sm:text-2xl text-white/50 line-through font-medium">
                                  ₹1299
                                </span>
                                <div className="text-3xl sm:text-4xl font-black text-[#FFD700]">
                                  {pricesLoading ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  ) : (
                                    `₹${getLaptopExtendPrice()}`
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* 2x2 Benefits Grid */}
                      <div className="flex-grow p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Doorstep Auction */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                              <Gavel className="w-8 h-8 sm:w-10 sm:h-10 text-[#254696]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Doorstep Device Auction</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Get 10-20% higher market value through our exclusive buyer network</p>
                            </div>
                          </div>

                          {/* Repair Service */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                              <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Accidental Damage Repair Service</h4>
                              <ul className="text-[10px] sm:text-[11px] text-gray-500 mt-1 space-y-0.5">
                                <li>• Protection for your existing device</li>
                                <li>• Begins after brand warranty ends</li>
                                <li>• ₹0 service cost on repair</li>
                              </ul>
                            </div>
                          </div>

                          {/* Upgrade Offers */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                               <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-[#3B82F6]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Best Product Upgrade Offers</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Exclusive deals for your next device purchase</p>
                            </div>
                          </div>

                          {/* Extended Warranty */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                               <Percent className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                               <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">20% Off on 1-Year Extended Warranty</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Save 20% on protection of your next device purchase</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-3">
                          <button
                            onClick={scrollToForm}
                            className="w-full bg-xtra-primary text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: "var(--xtra-primary)" }}
                            data-testid="button-explore-laptop-extend"
                          >
                            Explore Plans
                          </button>
                        </div>
                      </div>
                </div>
                </div>

                {/* Laptop Bundle Card removed */}
              </>
            )}

            {/* Mobile Plans */}
            {pricingView === "mobile" && (
              <>
                {/* Mobile BBG Card */}
                <div
                  className="w-full flex flex-col flip-card min-h-[400px]"
                  data-testid="card-mobile-bbg"
                >
                  <div
                    className={`rounded-3xl shadow-xl overflow-visible relative flip-card-inner ${mobileBBGFlipped ? "flipped" : ""}`}
                  >
                    {/* Front Face */}
                    <div className="flip-card-front rounded-[2rem] overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl">
                      {/* Header with Background and Asset */}
                        <div
                          className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                          style={{
                            backgroundColor: "var(--xtra-primary)",
                          }}
                        >
                          <div className="flex justify-between items-center w-full relative z-10">
                            <div className="flex-1">
                              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                                BuyBack
                                <br />
                                Guarantee
                              </h3>
                            </div>
                            <div className="absolute right-[25%] top-1/2 -translate-y-1/2 w-20 sm:w-32 opacity-90 pointer-events-none z-0">
                              <img 
                                src={pricingMobileHeaderBBG} 
                                alt="Mobile Guarantee" 
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="bg-[#FF6B6B] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-md mb-2 shadow-sm inline-block">
                                OFFER
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xl sm:text-2xl text-white/50 line-through font-medium">
                                  ₹999
                                </span>
                                <div className="text-3xl sm:text-4xl font-black text-[#FFD700]">
                                  {pricesLoading ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  ) : (
                                    `₹${getMobileBBGPrice()}`
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* 2x2 Benefits Grid */}
                      <div className="flex-grow p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Resale Value */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <ProgressCircle percentage={70} />
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Guaranteed resale value</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Get back up to 70% of your device's purchase price when you sell it back</p>
                            </div>
                          </div>

                          {/* Repair Service */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                              <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Accidental Damage Repair Service</h4>
                              <ul className="text-[10px] sm:text-[11px] text-gray-500 mt-1 space-y-0.5">
                                <li>• Protection for your existing device</li>
                                <li>• Begins after brand warranty ends</li>
                                <li>• ₹0 service cost on repair</li>
                              </ul>
                            </div>
                          </div>

                          {/* Upgrade Offers */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                               <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-[#3B82F6]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Best Product Upgrade Offers</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Exclusive deals for your next device purchase</p>
                            </div>
                          </div>

                          {/* Extended Warranty */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                               <Percent className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                               <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">20% Off on 1-Year Extended Warranty</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Save 20% on protection of your next device purchase</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-3">
                          <button
                            onClick={() => setMobileBBGFlipped(!mobileBBGFlipped)}
                            className="text-gray-400 hover:text-gray-600 text-xs font-medium underline transition-colors"
                            data-testid="button-know-more-mobile-bbg"
                          >
                            Know More
                          </button>
                          <button
                            onClick={scrollToForm}
                            className="w-full bg-xtra-primary text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: "var(--xtra-primary)" }}
                            data-testid="button-explore-mobile-bbg"
                          >
                            Explore Plans
                          </button>
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
                      <div className="flex-grow p-4 sm:p-5 flex flex-col justify-center space-y-4">
                        <ClaimValueSlabs
                          slabs={
                            allPlans.find(
                              (p: any) =>
                                p.deviceType === "mobile" &&
                                p.planType === "bbg",
                            )?.claimValueSlabs || []
                          }
                        />
                        <p
                          className="text-xs sm:text-sm text-center"
                          style={{ color: "#666666" }}
                        >
                          Resale value is calculated as a percentage of your
                          original device purchase price
                        </p>
                      </div>
                      <div className="px-6 sm:px-8 pb-2 sm:pb-3 space-y-2">
                        <button
                          onClick={() => setMobileBBGFlipped(false)}
                          className="w-full text-center font-semibold py-2 rounded-full text-sm transition-all duration-300 hover:underline"
                          style={{ color: "#254696" }}
                          data-testid="button-back-mobile-bbg"
                        >
                          Back
                        </button>
                        <button
                          onClick={scrollToForm}
                          className="w-full text-white font-semibold py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-lg"
                           style={{
                            background: "var(--xtra-primary)",
                          }}
                          data-testid="button-explore-flipped-mobile-bbg"
                        >
                          Explore Plans
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Extend+ Card */}
                <div
                  className="w-full flex flex-col min-h-[400px]"
                  data-testid="card-mobile-extend"
                >
                  <div className="rounded-3xl shadow-xl overflow-hidden flex flex-col bg-[#F3F4F6] border border-gray-100 shadow-2xl h-full">
                      {/* Header with Background and Asset */}
                        <div
                          className="p-5 sm:p-7 text-white relative min-h-[140px] sm:min-h-[160px] flex items-center"
                          style={{
                            backgroundColor: "var(--xtra-primary)",
                          }}
                        >
                          <div className="flex justify-between items-center w-full relative z-10">
                            <div className="flex-1">
                              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                                Extend+
                                <br />
                                Protection
                              </h3>
                            </div>
                            <div className="absolute right-[25%] top-1/2 -translate-y-1/2 w-20 sm:w-32 opacity-90 pointer-events-none z-0">
                              <img 
                                src={pricingMobileHeaderExtend} 
                                alt="Mobile Protection" 
                                className="w-full h-auto object-contain"
                              />
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="bg-[#FF6B6B] text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-md mb-2 shadow-sm inline-block">
                                OFFER
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xl sm:text-2xl text-white/50 line-through font-medium">
                                  ₹999
                                </span>
                                <div className="text-3xl sm:text-4xl font-black text-[#FFD700]">
                                  {pricesLoading ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  ) : (
                                    `₹${getMobileExtendPrice()}`
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* 2x2 Benefits Grid */}
                      <div className="flex-grow p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Doorstep Auction */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                              <Gavel className="w-8 h-8 sm:w-10 sm:h-10 text-[#254696]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Doorstep Device Auction</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Get 10-20% higher market value through our buyer network</p>
                            </div>
                          </div>

                          {/* Repair Service */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-full flex items-center justify-center">
                              <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 transform -rotate-45" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Accidental Damage Repair Service</h4>
                              <ul className="text-[10px] sm:text-[11px] text-gray-500 mt-1 space-y-0.5">
                                <li>• Protection for your existing device</li>
                                <li>• Begins after brand warranty ends</li>
                                <li>• ₹0 service cost on repair</li>
                              </ul>
                            </div>
                          </div>

                          {/* Upgrade Offers */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                               <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-[#3B82F6]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">Best Product Upgrade Offers</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Exclusive deals for your next device purchase</p>
                            </div>
                          </div>

                          {/* Extended Warranty */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-50">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                               <Percent className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] z-10" />
                               <div className="absolute inset-0 border-[3px] border-dashed border-[#3B82F6]/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-[#1F2937]">20% Off on 1-Year Extended Warranty</h4>
                              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed mt-1">Save 20% on protection of your next device purchase</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-3">
                          <button
                            onClick={scrollToForm}
                            className="w-full bg-xtra-primary text-white font-bold py-3.5 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: "var(--xtra-primary)" }}
                            data-testid="button-explore-mobile-extend"
                          >
                            Explore Plans
                          </button>
                        </div>
                      </div>
                    </div>
                </div>

                {/* Mobile Bundle Card removed */}
              </>
            )}
          </div>
        </div>
      </section>
      {/* How the plan works Section */}
      <section 
        className="w-full cursor-pointer transition-opacity hover:opacity-95"
        onClick={scrollToForm}
      >
        <picture>
          <source media="(max-width: 639px)" srcSet={howPlanWorksMsiteImg} />
          <img
            src={howPlanWorksImg}
            alt="How the plan works"
            className="w-full h-auto block"
          />
        </picture>
      </section>
      {/* FAQ Section */}
      <section className="py-4 sm:py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about BBG and Extend+ programs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-1"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What is BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    BBG (BuyBack Guarantee) is for devices less than 6 months
                    old. It locks your resale value upfront — up to 70% of your
                    invoice price. When you sell, we pick it up and pay you
                    instantly.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-2"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What is Extend+?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Extend+ is for devices more than 6 months old. It gives:
                    <br />
                    Free Auction Service → sell from home & get 10–20% higher
                    resale value
                    <br />
                    1 Free Repair → service charges waived (parts extra)
                    <br />
                    Valid for 24 months.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-3"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Who can buy these plans?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Anyone with a valid invoice for their phone or laptop.
                    <br />
                    BBG → for new devices (&lt;6 months)
                    <br />
                    Extend+ → for older devices (&gt;6 months)
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-4"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    How much will I get with BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    It depends on how old the device is when you sell:
                    <br />
                    <br />
                    <strong>Mobiles</strong>
                    <br />
                    4–6 months → 70% back
                    <br />
                    7–9 months → 60% back
                    <br />
                    10–12 months → 50% back
                    <br />
                    13–15 months → 40% back
                    <br />
                    16–18 months → 30% back
                    <br />
                    <br />
                    <strong>Laptop</strong>
                    <br />
                    Similar percentages apply based on device age.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-5"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if my phone has scratches?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Small scratches are okay. The device just needs to be in
                    working condition.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-6"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if my device fails BBG checks?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    No problem — you can still sell it through Extend+ Auction
                    Service at market value.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-7"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What repairs are included in Extend+?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    One free repair service during plan validity. You only pay
                    for parts if needed.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-8"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    How do I get my money?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    We pay directly to your bank or UPI at the time of
                    pickup/claim.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-9"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Can I transfer my plan to someone else?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    No, the plan stays with the device you registered.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem
                  value="item-10"
                  className="border border-gray-200 rounded-lg px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Why should I choose BBG or Extend+?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Because you either:
                    <br />
                    Lock your resale value upfront (BBG)
                    <br />
                    Or get better resale + free repair for older devices
                    (Extend+)
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>
      {/* Referral Program Section: Single Distinct Images */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            {/* Mobile Image */}
            <div className="block md:hidden">
              <Link href="/referral-partner-registration">
                <img
                  src={buybackGuaranteeImgBelow}
                  alt="Referral Program Mobile"
                  className="w-full h-auto rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
                />
              </Link>
            </div>

            {/* Desktop Image */}
            <div className="hidden md:block">
              <Link href="/referral-partner-registration">
                <img
                  src={bannerImg}
                  alt="Referral Program Desktop"
                  className="w-full h-auto rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
