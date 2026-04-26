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
import bannerImg from "@assets/prtner-banner-2300x800.png";
import buybackGuaranteeImgBelow from "../../../attached_assets/partner.jpeg";
import topBannerDesktop from "@assets/Banner-BG.png";
import topBannerMobile from "@assets/Banner-BG1.png";
import heroBelowSectionImg from "@assets/hero-below-section.webp";
import heroBelowSectionMsiteImg from "@assets/hero-below-section-msite.webp";
import howPlanWorksImg from "../../../attached_assets/1234556.png";
import howPlanWorksMsiteImg from "../../../attached_assets/verti.png";
import bannerIcon1 from "@assets/icon1.png";
import bannerIcon2 from "@assets/icon2.png";
import bannerIcon3 from "@assets/icon3.png";
import HowItWorks from "./HowItWorks";
import BuyBackSection from "./BuyBackSection";
import PricingSection from "./PricingSection";
// import pricingLaptopHeaderBBG from "@assets/pricing_laptop_header_bbg.webp";
// import pricingLaptopHeaderExtend from "@assets/pricing_laptop_header_extend.webp";
// import pricingMobileHeaderBBG from "@assets/pricing_mobile_header_bbg.webp";
// import pricingMobileHeaderExtend from "@assets/pricing_mobile_header_extend.webp";

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
      <div className="flex items-center justify-between gap-3 sm:gap-4 px-4 mb-2 min-w-0">
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

const BuybackCompareModal = ({
  onClose,
  onExplore,
}: {
  onClose: () => void;
  onExplore: () => void;
}) => {
  const [deviceType, setDeviceType] = useState<"mobile" | "laptop">("mobile");
  const [price, setPrice] = useState("82900");

  const bbgPct    = 70;
  const marketPct = deviceType === "mobile" ? 35 : 25;
  const placeholder = deviceType === "mobile" ? "e.g. 30000" : "e.g. 80000";

  const priceNum = parseFloat(price.replace(/,/g, ""));
  const valid = !isNaN(priceNum) && priceNum > 0;

  const withBBG    = valid ? Math.round(priceNum * bbgPct / 100) : null;
  const withoutBBG = valid ? Math.round(priceNum * marketPct / 100) : null;
  const youSave    = valid && withBBG && withoutBBG ? withBBG - withoutBBG : null;

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 text-white" style={{ background: "var(--xtra-primary)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">With vs Without BuyBack</h3>
              <p className="text-sm text-white/75 mt-0.5">See how much more you get back</p>
            </div>
            <button type="button" onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>

          {/* Mobile / Laptop toggle */}
          <div className="inline-flex bg-white/15 rounded-full p-1">
            {(["mobile", "laptop"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setDeviceType(type); setPrice(type === "mobile" ? "30000" : "80000"); }}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
                style={{
                  background: deviceType === type ? "#ffffff" : "transparent",
                  color: deviceType === type ? "#254696" : "rgba(255,255,255,0.8)",
                  boxShadow: deviceType === type ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {type === "mobile" ? (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="3"/>
                    <circle cx="12" cy="17.5" r="0.8" fill="currentColor" stroke="none"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="13" rx="2"/>
                    <path d="M1 19h22"/>
                  </svg>
                )}
                {type === "mobile" ? "Mobile" : "Laptop"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Price input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Your {deviceType === "mobile" ? "Mobile" : "Laptop"} Purchase Price
            </label>
            <div className="flex items-center border-2 border-[#254696]/20 rounded-xl overflow-hidden focus-within:border-[#254696] transition-colors">
              <span className="px-3 py-3 bg-gray-50 text-gray-500 font-semibold border-r border-gray-200">₹</span>
              <input
                type="number"
                placeholder={placeholder}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 px-3 py-3 text-sm outline-none bg-white"
              />
            </div>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Without BBG */}
            <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 7.5l5-5M7.5 7.5l-5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Without <br/>BuyBack Guarantee</span>
              </div>
              <div className="mt-1">
                <p className="text-[10px] text-gray-400">You get back ~{marketPct}%</p>
                <p className="text-2xl font-black text-red-500 mt-0.5">
                  {withoutBBG !== null ? fmt(withoutBBG) : "—"}
                </p>
              </div>
              <div className="mt-1 w-full bg-red-100 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full transition-all duration-500" style={{ width: valid ? `${marketPct}%` : "0%" }} />
              </div>
            </div>

            {/* With BBG */}
            <div className="rounded-2xl border-2 border-[#254696]/20 bg-[#f0f6ff] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full bg-[#254696] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#254696] uppercase tracking-wide">With <br/>BuyBack Guarantee</span>
              </div>
              <div className="mt-1">
                <p className="text-[10px] text-gray-400">You get back ~{bbgPct}%</p>
                <p className="text-2xl font-black text-[#254696] mt-0.5">
                  {withBBG !== null ? fmt(withBBG) : "—"}
                </p>
              </div>
              <div className="mt-1 w-full bg-[#254696]/10 rounded-full h-2">
                <div className="bg-[#254696] h-2 rounded-full transition-all duration-500" style={{ width: valid ? `${bbgPct}%` : "0%" }} />
              </div>
            </div>
          </div>

          {/* You save banner */}
          {youSave !== null && (
            <div className="rounded-2xl bg-green-50 border-2 border-green-200 px-5 py-4 flex items-center justify-center">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">You save extra</p>
                <p className="text-2xl font-black text-green-600 mt-0.5">{fmt(youSave)}</p>
                <p className="text-xs text-gray-400">vs open market</p>

              </div>
              {/* <div className="text-right">
                <p className="text-xs text-gray-400">vs open market</p>
                <p className="text-sm font-bold text-green-500 mt-0.5">+{Math.round((youSave / (withoutBBG ?? 1)) * 100)}% more</p>
              </div> */}
            </div>
          )}

          <button
            type="button"
            onClick={() => { onClose(); onExplore(); }}
            className="w-full text-white font-bold py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "var(--xtra-primary)" }}
          >
            Get BuyBack Plan Now
          </button>
        </div>
      </div>
    </div>
  );
};

const BBGModal = ({
  slabs,
  onClose,
  onExplore,
}: {
  slabs: any[];
  onClose: () => void;
  onExplore: () => void;
}) => {
  const minMonth = slabs.length
    ? Math.min(...slabs.map((s) => parseInt(s.minMonths || s.min_months || "1")))
    : 1;
  const maxMonth = slabs.length
    ? Math.max(...slabs.map((s) => parseInt(s.maxMonths || s.max_months || "36")))
    : 36;

  const [age, setAge] = useState(minMonth);
  const [devicePrice, setDevicePrice] = useState("");

  const currentSlab = slabs.find((s) => {
    const min = parseInt(s.minMonths || s.min_months || "0");
    const max = parseInt(s.maxMonths || s.max_months || "0");
    return age >= min && age <= max;
  }) || slabs[slabs.length - 1];

  const percentage = currentSlab
    ? parseInt(currentSlab.resalePercentage || currentSlab.percentage || "0")
    : 0;

  const progressWidth = ((age - minMonth) / (maxMonth - minMonth)) * 100;
  const priceNum = parseFloat(devicePrice.replace(/,/g, ""));
  const rupeeValue = !isNaN(priceNum) && priceNum > 0
    ? Math.round((percentage / 100) * priceNum)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 text-white"
          style={{ background: "var(--xtra-primary)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold">Guaranteed Resale Value</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-white/80">
            See how much you get back based on your device age
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Price input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Device Purchase Price (optional)
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#254696]/30">
              <span className="px-3 py-3 bg-gray-50 text-gray-500 font-semibold border-r border-gray-200">₹</span>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={devicePrice}
                onChange={(e) => setDevicePrice(e.target.value)}
                className="flex-1 px-3 py-3 text-sm outline-none bg-white"
              />
            </div>
          </div>

          {/* Age display */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Device Age</p>
            <p className="text-3xl font-black" style={{ color: "#254696" }}>
              {age} <span className="text-lg font-semibold">month{age !== 1 ? "s" : ""}</span>
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range"
              aria-label="Device age in months"
              min={minMonth}
              max={maxMonth}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #254696 ${progressWidth}%, #e5e7eb ${progressWidth}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{minMonth}m</span>
              <span>{maxMonth}m</span>
            </div>
          </div>

          {/* Progress bar — resale % + optional ₹ value */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">You get back</span>
              <div className="text-right">
                <span className="text-2xl font-black" style={{ color: "#254696" }}>
                  {percentage}%
                </span>
                {rupeeValue !== null && (
                  <p className="text-base font-bold text-green-600 leading-tight">
                    ≈ ₹{rupeeValue.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: "linear-gradient(to right, #254696, #3b82f6)",
                }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {rupeeValue !== null
                ? `Based on your ₹${priceNum.toLocaleString("en-IN")} device price`
                : "of your device's original purchase price"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); onExplore(); }}
            className="w-full text-white font-bold py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "var(--xtra-primary)" }}
          >
            Explore Plans
          </button>
        </div>
      </div>
    </div>
  );
};

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

export default function Home() {
  const [isBBGExpanded, setIsBBGExpanded] = useState(false);
  const [isExtendExpanded, setIsExtendExpanded] = useState(false);
  const [selectedDeviceTypeFromCard, setSelectedDeviceTypeFromCard] = useState<
    string | undefined
  >();
  const [carouselLoaded, setCarouselLoaded] = useState(false);
  const [pricingView, setPricingView] = useState<"laptop" | "mobile">("mobile");
  const [laptopBBGFlipped, setLaptopBBGFlipped] = useState(false);
  const [mobileBBGFlipped, setMobileBBGFlipped] = useState(false);
  const [laptopExtendFlipped, setLaptopExtendFlipped] = useState(false);
  const [mobileExtendFlipped, setMobileExtendFlipped] = useState(false);
  const [laptopBundleFlipped, setLaptopBundleFlipped] = useState(false);
  const [mobileBundleFlipped, setMobileBundleFlipped] = useState(false);
  const [bbgModal, setBbgModal] = useState<{ deviceType: "laptop" | "mobile"; slabs: any[] } | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
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
      <style>{`
        .top-banner-section {
          background-image: url(${topBannerDesktop});
          background-size: cover;
          background-position: center;
          min-height: clamp(220px, 28vw, 460px);
        }
        @media (max-width: 639px) {
          .top-banner-section {
            background-image: url(${topBannerMobile}) !important;
            min-height: auto !important;
            background-position: top center !important;
          }
          .banner-h1       { font-size: 17px !important; line-height: 1.2 !important; }
          .banner-subtext  { font-size: 10px !important; }
          .banner-with     { font-size: 15px !important; }
          .unlock-lock-btn { font-size: 13px !important; padding: 10px 18px !important; }
          .banner-features { gap: 10px !important; }
          .banner-feat-label { font-size: 10px !important; }
        }
        .unlock-lock-btn .lock-icon-wrap {
          position: relative;
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
        .unlock-lock-btn .icon-locked {
          position: absolute;
          top: 0; left: 0;
          opacity: 1;
          transform: rotate(0deg) scale(1);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .unlock-lock-btn .icon-unlocked {
          position: absolute;
          top: 0; left: 0;
          opacity: 0;
          transform: rotate(-25deg) scale(0.7);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .unlock-lock-btn:hover .icon-locked {
          opacity: 0;
          transform: rotate(25deg) scale(0.7);
        }
        .unlock-lock-btn:hover .icon-unlocked {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      `}</style>
      <section
        className="top-banner-section w-full cursor-pointer"
        onClick={scrollToForm}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-16 flex items-center relative" style={{ minHeight: "inherit" }}>
          {/* Left Content */}
          <div className="flex-1 pt-16 pb-8 sm:py-10 lg:pt-28 lg:pb-12 z-10">
            {/* Badge */}
            <div className="items-center gap-2 bg-[#1e4fc2] text-white text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-6 border border-white/20 hidden sm:inline-flex">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              BUY BACK GUARANTEE
            </div>

            {/* Heading */}
            <h1
              className="banner-h1 text-white font-black leading-[1.15] mb-3 sm:mb-4"
              style={{ fontSize: "clamp(26px, 4vw, 48px)" }}
            >
              Your Device loses 30% value<br/> the day you unbox it
            </h1>

            {/* Subtext */}
            <p
              className="banner-subtext text-white/75 mb-3 sm:mb-5 max-w-md leading-relaxed"
              style={{ fontSize: "clamp(13px, 1.8vw, 1.25rem)" }}
            >
              Get guaranteed resale value upto<br class="block sm:hidden"/> 70% of your Purchase Price.
            </p>

            {/* "With BuyBack Guarantee" line */}
            <p
              className="banner-with font-bold leading-tight mb-4 sm:mb-5"
              style={{ fontSize: "clamp(15px, 2vw, 1.75rem)", color: "rgba(255,255,255,0.92)" }}
            >
              With{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #2563eb, #8eadf1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 900,
                }}
              >
                BuyBack Guarantee
              </span>
            </p>

            {/* CTA Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); scrollToForm(); }}
              className="unlock-lock-btn flex mb-5 sm:mb-6 items-center gap-2 font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
              style={{
                background: "#145eda",
                color: "white",
                fontSize: "clamp(13px, 1.5vw, 18px)",
                padding: "clamp(10px, 1.2vw, 16px) clamp(18px, 2vw, 28px)",
                letterSpacing: "0.02em",
              }}
            >
              <span className="lock-icon-wrap">
                {/* Locked icon — shown by default */}
                <svg className="icon-locked" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
                </svg>
                {/* Unlocked icon — shown on hover */}
                <svg className="icon-unlocked" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 019.9-1"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </span>
              Unlock 70% Value
            </button>

            {/* Features row */}
            <div className="banner-features flex-wrap items-center gap-3 sm:gap-0 hidden sm:flex">
              <div className="flex items-center gap-2 sm:pr-6 sm:border-r sm:border-white/25">
                <img src={bannerIcon1} alt="Guaranteed Resale Value" className="w-7 h-7 sm:w-10 sm:h-10 flex-shrink-0 object-contain" />
                <span className="text-white text-[10px] sm:text-sm font-semibold leading-tight">
                  Guaranteed<br />Resale Value
                </span>
              </div>

              <div className="flex items-center gap-2 sm:px-6 sm:border-r sm:border-white/25">
                <img src={bannerIcon2} alt="Instant Quote" className="w-7 h-7 sm:w-10 sm:h-10 flex-shrink-0 object-contain" />
                <span className="text-white text-[10px] sm:text-sm font-semibold leading-tight">
                  Instant<br />Quote
                </span>
              </div>

              <div className="flex items-center gap-2 sm:pl-6">
                <img src={bannerIcon3} alt="Valid for upto 6 months" className="w-7 h-7 sm:w-10 sm:h-10 flex-shrink-0 object-contain" />
                <span className="text-white text-[10px] sm:text-sm font-semibold leading-tight">
                  Valid for<br />upto 6 months
                </span>
              </div>
            </div>
          </div>

          {/* Right — trust badges (desktop only) */}
          <div className="hidden sm:flex flex-col flex-shrink-0 items-start justify-between" style={{ width: "clamp(260px, 40%, 560px)", paddingTop: "31rem" }}>
            <div className="flex items-center gap-10 mt-4">
              {["Hassle-free", "Transparent", "Trusted"].map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#3b82f6] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-white/85 text-xs sm:text-lg font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* <section
        className="w-full cursor-pointer transition-opacity hover:opacity-95"
        onClick={() => setShowCompareModal(true)}
      >
        <picture>
          <source
            media="(max-width: 639px)"
            srcSet={heroBelowSectionMsiteImg}
          />
          <img
            src={heroBelowSectionImg}
            alt="Value Proposition"
            className="w-full h-auto block"
          />
        </picture>
      </section> */}
      <BuyBackSection setShowCompareModal={setShowCompareModal} />
      {/* Smart Plans Section */}

      {/* Homepage Carousel - Critical path, loads first */}
      <div className="hidden">
        <HomepageCarousel onFirstImageLoaded={handleCarouselFirstImageLoaded} />
      </div>
      {/* Smart Plans Section with Form */}

<section
  className="py-12 sm:py-16 lg:py-12 px-4 sm:px-6 lg:px-8"
  style={{
    background: "#f9fafb",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Subtle dot-grid texture */}
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(circle, rgba(37,70,150,0.06) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      pointerEvents: "none",
      zIndex: 0,
    }}
  />
  {/* Soft blue glow — top left */}
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      top: -200,
      left: -140,
      width: 600,
      height: 600,
      borderRadius: "50%",
      background:
        "radial-gradient(ellipse, rgba(214,227,255,0.5) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0,
    }}
  />

  <div className="max-w-7xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">

      {/* ───────────────────────────────────────
          LEFT SIDE
          className="hidden lg:block" UNCHANGED
      ─────────────────────────────────────── */}
      <div className="hidden lg:block">

        {/* Eyebrow tag */}
        <div className="mb-2">
          <span
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase px-0 py-2"
            style={{ color: "#254696", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}
          >
            <span
              style={{
                display: "inline-block", width: 24, height: 1.5,
                background: "#254696", borderRadius: 999, opacity: 0.35,
              }}
            />
            Find Your Perfect Plan
            <span
              style={{
                display: "inline-block", width: 24, height: 1.5,
                background: "#254696", borderRadius: 999, opacity: 0.35,
              }}
            />
          </span>
        </div>

        {/* Headline — same text, refined styling */}
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 mt-4"
          style={{
            color: "#0c1629",
            fontFamily: "Poppins, sans-serif",
            letterSpacing: "-0.5px",
            lineHeight: 1.14,
          }}
        >
          Smart plans for stronger{" "}
          <span style={{ color: "#254696" }}>resale value</span>{" "}
          and repair support
        </h2>

        {/* Short rule */}
        <div
          style={{
            width: 36, height: 2,
            background: "#254696", opacity: 0.2,
            borderRadius: 999, marginBottom: 28,
          }}
        />

        {/* Benefit rows — same 6 items, divider-row layout */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            {
              label: "Guaranteed resale value",
              sub: "Lock in up to 70% of your device's original price",
            },
            {
              label: "1-Year Extended Accidental Damage Repair Service",
              sub: "₹0 service cost on every covered repair",
            },
            {
              label: "Best Product Upgrade Offers",
              sub: "Exclusive deals when upgrading your next device",
            },
            {
              label: "20% Off on 1-Year Extended Warranty",
              sub: "Save on protection for your next device purchase",
            },
            {
              label: "Supports all major mobile and laptop brands",
              sub: "Apple, Samsung, OnePlus, Dell, HP and more",
            },
            {
              label: "100% authorized services",
              sub: "Certified technicians and partner service centers",
            },
          ].map(({ label, sub }, i, arr) => (
            <div
              key={i}
              className="flex items-start gap-3"
              style={{
                padding: "15px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(15,23,42,0.07)" : "none",
              }}
            >
              {/* Clean outlined square checkmark — no fill, no circle, minimal */}
              <div
                className="flex-shrink-0 mt-1"
                style={{
                  width: 20, height: 20, borderRadius: 5,
                  border: "1.5px solid rgba(37,70,150,0.55)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5L3.8 7.5L8.5 2.5"
                    stroke="#254696"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{
                    color: "#1e293b",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ───────────────────────────────────────
          RIGHT SIDE — form wrapped in styled card
          ref={formRef} UNCHANGED
          DevicePlanSelectorForm + all props UNCHANGED
      ─────────────────────────────────────── */}
      <div ref={formRef}>

        {/* Visual card shell */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            border: "1px solid rgba(15,23,42,0.09)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(37,70,150,0.08), 0 40px 80px rgba(37,70,150,0.05)",
            overflow: "hidden",
          }}
        >


          {/* ✅ DevicePlanSelectorForm — 100% UNTOUCHED */}
          <DevicePlanSelectorForm
            initialDeviceType={selectedDeviceTypeFromCard}
            formRef={formRef}
          />

        </div>

      </div>

    </div>
  </div>
</section>

      <PricingSection/>
      {/* How It Works Section */}
      <section
        className="w-full cursor-pointer transition-opacity hover:opacity-95 relative bg-[#090929]"
        onClick={scrollToForm}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <h2
          className="text-center font-black text-white z-10 pt-6 pb-4 sm:pt-10 sm:pb-8 px-4"
          style={{ fontSize: "clamp(30px, 5vw, 56px)" }}
        >
          How It Works
        </h2>

        <picture>
          <source media="(max-width: 639px)" srcSet={howPlanWorksMsiteImg} />
          <img
            src={howPlanWorksImg}
            alt="How the plan works"
            className="w-full h-auto block"
          />
        </picture>

        {/* CTA Button */}
        <style>{`
          .home-gradient-btn {
            font-size: 17px;
            padding: 1em 1.7em;
            font-weight: bold;
            background: white;
            color: black;
            border: none;
            position: relative;
            overflow: hidden;
            border-radius: 0.6em;
            cursor: pointer;
            font-family: inherit;
            transition: color 0.3s ease;
          }
          .home-gradient-btn:hover { color: black; }
          .home-gradient-btn:active { transform: scale(0.97); }
          .home-gradient-btn .home-ripple {
            transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
            transition-duration: 500ms;
            transition-property: width, height;
            background-color: #f6d30e;
            border-radius: 9999px;
            width: 0;
            height: 0;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: block;
          }
          .home-gradient-btn:hover .home-ripple {
            width: 14em;
            height: 14em;
          }
          .home-gradient-btn .home-gradient-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            border-radius: 0.6em;
            margin-top: -0.25em;
            display: block;
          }
          .home-gradient-btn .home-label {
            position: relative;
            top: -1px;
          }
        `}</style>
        <div className="flex justify-center py-8 sm:py-10 bg-[#090929]">
          <button
            type="button"
            className="home-gradient-btn"
            onClick={(e) => { e.stopPropagation(); scrollToForm(); }}
          >
            <span className="home-ripple" />
            <span className="home-gradient-layer" />
            <span className="home-label">START SAVING NOW</span>
          </button>
        </div>
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

<section className="py-8 sm:py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Mobile Referral Banner */}
    <div className="block md:hidden">
      <Link href="/referral-partner-registration">
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
          {/* Full image at natural height */}
          <img
            src={buybackGuaranteeImgBelow}
            alt="Referral Program"
            style={{ width: "100%", height: "auto", display: "block" }}
          />

          {/* Dark gradient overlay so text is readable */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }} />

          {/* Content pinned to bottom */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "start", padding: "25px 18px 22px" }}>

            {/* Headline */}
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, lineHeight: 1.2, marginBottom: 25 }}>
              Join Referral<br />Program Now
            </h2>

            {/* Commission pills — side by side */}
            <div style={{ display: "flex", gap: 8, marginBottom: 25 }}>
              {/* Mobile pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 12px", backdropFilter: "blur(8px)", flex: 1 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5"/>
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>Mobile</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#FFD700" }}>₹</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", lineHeight: 1 }}>100</span>
                  </div>
                  <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)" }}>per referral</span>
                </div>
              </div>

              {/* Laptop pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 12, padding: "8px 12px", backdropFilter: "blur(8px)", flex: 1 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,215,0,0.9)" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="14" rx="2"/><path d="M0 20h24"/>
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>Laptop</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#FFD700" }}>₹</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", lineHeight: 1 }}>175</span>
                  </div>
                  <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)" }}>per referral</span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button
              type="button"
              style={{ fontWeight: 700, fontSize: 14, padding: "10px 20px", borderRadius: 100, background: "rgb(255,217,27)", border: "none", display: "inline-flex", alignItems: "center", gap: 8, color: "black", fontFamily: "inherit", cursor: "pointer", alignSelf: "flex-start" }}
            >
              Start Earning Today
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 74 74" style={{ width: 22 }}>
                <circle strokeWidth="3" stroke="black" r="35.5" cy="37" cx="37"/>
                <path fill="black" d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"/>
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>

    {/* Desktop HTML Banner — outer wrapper 100% UNTOUCHED */}
    <Link href="/referral-partner-registration">
      <div
        className="hidden md:flex items-center justify-between rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.005] shadow-xl px-12 lg:px-20"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "468px",
        }}
      >
        {/* Left content — headline + commission pills + CTA */}
        <div className="py-10 flex-shrink-0 max-w-xs lg:max-w-sm">

          {/* Headline — UNTOUCHED */}
          <h2
            className="text-white font-black leading-tight mb-5"
            style={{ fontSize: "clamp(28px, 3.2vw, 52px)" }}
          >
            Join Referral<br />Program Now
          </h2>

          {/* ── Commission pills — replaces the two <p> lines ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>

            {/* Mobile pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 14,
                padding: "10px 14px",
                backdropFilter: "blur(8px)",
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Mobile icon chip */}
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                  stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" />
                </svg>
              </div>

              {/* Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
                  Commission
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>
                  Mobile Plan
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FFD700", opacity: 0.8 }}>₹</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", lineHeight: 1, letterSpacing: "-0.5px" }}>100</span>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>per referral</span>
              </div>
            </div>

            {/* Laptop pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 14,
                padding: "10px 14px",
                backdropFilter: "blur(8px)",
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Laptop icon chip */}
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,215,0,0.12)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                  stroke="rgba(255,215,0,0.9)" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="14" rx="2" />
                  <path d="M0 20h24" />
                </svg>
              </div>

              {/* Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
                  Commission
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>
                  Laptop Plan
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FFD700", opacity: 0.8 }}>₹</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", lineHeight: 1, letterSpacing: "-0.5px" }}>175</span>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>per referral</span>
              </div>
            </div>

          </div>

          {/* CTA Button */}
          <button
            type="button"
            style={{
              cursor: "pointer",
              fontWeight: 700,
              transition: "transform 0.2s",
              padding: "11px 20px",
              borderRadius: 100,
              background: "rgb(255 217 27)",
              border: "1px solid transparent",
              display: "flex",
              alignItems: "center",
              fontSize: 15,
              color: "black",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              const svg = e.currentTarget.querySelector<SVGSVGElement>("svg");
              if (svg) svg.style.transform = "translateX(5px)";
            }}
            onMouseLeave={e => {
              const svg = e.currentTarget.querySelector<SVGSVGElement>("svg");
              if (svg) svg.style.transform = "translateX(0)";
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.95)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Start Earning Today
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 74 74"
              style={{ width: 28, marginLeft: 10, transition: "transform 0.3s ease-in-out" }}
            >
              <circle strokeWidth="3" stroke="black" r="35.5" cy="37" cx="37" />
              <path
                fill="black"
                d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"
              />
            </svg>
          </button>

        </div>
      </div>
    </Link>

  </div>
</section>
      {bbgModal && (
        <BBGModal
          slabs={bbgModal.slabs}
          onClose={() => setBbgModal(null)}
          onExplore={scrollToForm}
        />
      )}
      {showCompareModal && (
        <BuybackCompareModal
          onClose={() => setShowCompareModal(false)}
          onExplore={scrollToForm}
        />
      )}
    </div>
  );
}
