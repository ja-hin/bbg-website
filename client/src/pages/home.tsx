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
} from "lucide-react";
import { HomepageCarousel } from "@/components/homepage-carousel";
import deviceRegistrationImg from "@assets/Untitled design (3)_1758887376037.png";
import resaleValueImg from "@assets/Untitled design (4)_1758890353128.png";
import doorstepPickupImg from "@assets/1_1758893676653.png";
import instantPaymentImg from "@assets/2_1758893843696.png";
import bbgVideoFile from "@assets/A_cinematic_hightech_202509271550_97ecx_1758972698482.mp4";
import specialOfferRibbon from "@assets/(inclusive of GST) (1)_1759126276325.png";
import whyChooseBbgIcon from "@assets/(inclusive of GST) (3)_1759127901876.png";
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.png";
import planWorksBackgroundImg from "@assets/Untitled design (15) (1)_1764254452404.png";
import learnMoreBtn from "@assets/Untitled design (1) (1)_1764258271086.png";
import bannerImg from "@assets/BBG Banners Revised (1)_1764328416967.png";

export default function Home() {
  const [isBBGExpanded, setIsBBGExpanded] = useState(false);
  const [isExtendExpanded, setIsExtendExpanded] = useState(false);
  const [selectedDeviceTypeFromCard, setSelectedDeviceTypeFromCard] = useState<string | undefined>();
  const [carouselLoaded, setCarouselLoaded] = useState(false);
  const [pricingView, setPricingView] = useState<"laptop" | "mobile">("laptop");
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
    const plan = allPlans.find((p: any) => p.deviceType === "laptop" && p.planType === "bbg");
    return plan?.planPrice || 499;
  };

  const getMobileBBGPrice = () => {
    const plan = allPlans.find((p: any) => p.deviceType === "mobile" && p.planType === "bbg");
    return plan?.planPrice || 299;
  };

  const getLaptopExtendPrice = () => {
    const plan = allPlans.find((p: any) => p.deviceType === "laptop" && p.planType === "extend_plus");
    return plan?.planPrice || 399;
  };

  const getMobileExtendPrice = () => {
    const plan = allPlans.find((p: any) => p.deviceType === "mobile" && p.planType === "extend_plus");
    return plan?.planPrice || 199;
  };

  const getLaptopBundlePrice = () => {
    const plan = allPlans.find((p: any) => p.deviceType === "laptop" && p.planType === "bundle");
    return plan?.planPrice || 799;
  };

  const getMobileBundlePrice = () => {
    const plan = allPlans.find((p: any) => p.deviceType === "mobile" && p.planType === "bundle");
    return plan?.planPrice || 499;
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Featured Plans Section */}
      <section 
        className="hidden py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(135deg, #f5f9ff 0%, #f0f7ff 50%, #fafbfe 100%)"
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Grid: 1 column on mobile, 2 columns on tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            
            {/* BuyBack Guarantee Card */}
            <div
              className="group transition-all duration-300 hover:shadow-lg"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
              }}
            >
              {/* Border wrapper */}
              <div
                style={{
                  borderRadius: "20px",
                  padding: "2px",
                  background: "linear-gradient(135deg, #d4e3ff 0%, #1a5db0 50%, #0f3a5f 100%)"
                }}
              >
                {/* Content */}
                <div
                  className="p-6 sm:p-7 lg:p-8 text-center h-full flex flex-col"
                  style={{ 
                    borderRadius: "18px",
                    background: "#f9fbff"
                  }}
                >
                  {/* Title */}
                  <h3 
                    className="text-xl sm:text-2xl lg:text-2xl font-bold mb-2"
                    style={{ color: "#1F4B88", lineHeight: "1.3" }}
                    data-testid="heading-bbg-compact"
                  >
                    BuyBack Guarantee:
                  </h3>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-sm sm:text-base lg:text-base mb-6 sm:mb-8 font-medium leading-relaxed flex-shrink-0"
                    style={{ color: "#4b5563" }}
                  >
                    Lock Resale Value of your Mobile & Laptop
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-8 flex-grow flex items-center justify-center">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <Clock 
                          className="w-11 h-11 sm:w-12 sm:h-12" 
                          style={{ color: "#1F4B88" }} 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-center leading-snug" style={{ color: "#303e58" }}>
                        For devices<br className="sm:hidden" />up to 6<br className="sm:hidden" />months old
                      </p>
                    </div>
                    
                    {/* Feature 2 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <TrendingUp 
                          className="w-11 h-11 sm:w-12 sm:h-12" 
                          style={{ color: "#1F4B88" }} 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-center leading-snug" style={{ color: "#303e58" }}>
                        Upto 70%<br />Resale Value
                      </p>
                    </div>
                    
                    {/* Feature 3 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <Package 
                          className="w-11 h-11 sm:w-12 sm:h-12" 
                          style={{ color: "#1F4B88" }} 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-center leading-snug" style={{ color: "#303e58" }}>
                        Sell at<br className="sm:hidden" />doorstep
                      </p>
                    </div>
                    
                    {/* Feature 4 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <Shield 
                          className="w-11 h-11 sm:w-12 sm:h-12" 
                          style={{ color: "#1F4B88" }} 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-center leading-snug" style={{ color: "#303e58" }}>
                        Fast &amp;<br className="sm:hidden" />Secure<br className="sm:hidden" />Payment
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={scrollToForm}
                    className="mt-auto w-full sm:w-auto sm:mx-auto text-white font-semibold rounded-full text-sm sm:text-base transition-all duration-300 hover:shadow-md active:scale-95"
                    style={{
                      background: "linear-gradient(90deg, #1F4B88, #245AA3)",
                      padding: "11px 28px",
                      minHeight: "44px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    data-testid="button-bbg-compact"
                  >
                    Get BuyBack Guarantee
                  </Button>
                </div>
              </div>
            </div>

            {/* Extend+ Protection Card */}
            <div
              className="group transition-all duration-300 hover:shadow-lg"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
              }}
            >
              {/* Border wrapper */}
              <div
                style={{
                  borderRadius: "20px",
                  padding: "2px",
                  background: "linear-gradient(135deg, #5a8fd9, #1a3a6b, #0f1f35)"
                }}
              >
                {/* Content */}
                <div
                  className="p-6 sm:p-7 lg:p-8 text-center text-white h-full flex flex-col"
                  style={{ 
                    borderRadius: "18px",
                    background: "linear-gradient(180deg, rgba(26, 58, 107, 0.98) 0%, rgba(42, 95, 168, 0.98) 100%)"
                  }}
                >
                  {/* Title */}
                  <h3 
                    className="text-xl sm:text-2xl lg:text-2xl font-bold mb-2"
                    style={{ lineHeight: "1.3" }}
                    data-testid="heading-extend-compact"
                  >
                    Extend+: Protection for
                  </h3>
                  
                  {/* Subtitle */}
                  <p 
                    className="text-sm sm:text-base lg:text-base mb-6 sm:mb-8 font-medium leading-relaxed flex-shrink-0"
                  >
                    Your Mobile & Laptop
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-8 flex-grow flex items-center justify-center">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <Clock 
                          className="w-11 h-11 sm:w-12 sm:h-12 text-white" 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white text-center leading-snug">
                        For devices<br className="sm:hidden" />up to 3<br className="sm:hidden" />years old
                      </p>
                    </div>
                    
                    {/* Feature 2 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <Wrench 
                          className="w-11 h-11 sm:w-12 sm:h-12 text-white" 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white text-center leading-snug">
                        1 Free<br />Device<br className="sm:hidden" />Repair*
                      </p>
                    </div>
                    
                    {/* Feature 3 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <TrendingUp 
                          className="w-11 h-11 sm:w-12 sm:h-12 text-white" 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white text-center leading-snug">
                        10-20%<br />Better<br className="sm:hidden" />Resale Value
                      </p>
                    </div>
                    
                    {/* Feature 4 */}
                    <div className="flex flex-col items-center">
                      <div className="mb-3">
                        <Award 
                          className="w-11 h-11 sm:w-12 sm:h-12 text-white" 
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white text-center leading-snug">
                        30%<br />discount on<br className="sm:hidden" />Warranty
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={scrollToForm}
                    className="mt-auto w-full sm:w-auto sm:mx-auto text-white font-semibold rounded-full text-sm sm:text-base transition-all duration-300 hover:shadow-md active:scale-95"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "2px solid rgba(255, 255, 255, 0.35)",
                      padding: "11px 28px",
                      minHeight: "44px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    data-testid="button-extend-compact"
                  >
                    Get Extend+ Protection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Homepage Carousel - Critical path, loads first */}
      <HomepageCarousel onFirstImageLoaded={handleCarouselFirstImageLoaded} />
      {/* Smart Plans Section with Form */}
      <section
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: "linear-gradient(135deg, #e8f4f8 0%, #f0f7ff 50%, #f7f5ef 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Text + Benefits - Hidden on mobile, only form shows */}
            <div className="hidden lg:block">
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-6"
                style={{ color: "#1a1a1a" }}
              >
                Smart plans for stronger resale value and repair support
              </h2>

              <div className="space-y-4 mt-4">
                <div className="flex items-start">
                  <BsCheckLg
                    className="text-3xl mr-3 mt-1 font-bold"
                    style={{ color: "#16a34a" }}
                  />
                  <p className="text-base sm:text-lg" style={{ color: "#4b5563" }}>
                  Assured resale value                  </p>
                </div>

                <div className="flex items-start">
                  <BsCheckLg
                    className="text-3xl mr-3 mt-1 font-bold"
                    style={{ color: "#16a34a" }}
                  />
                  <p className="text-base sm:text-lg" style={{ color: "#4b5563" }}>
                    Free repair service
                  </p>
                </div>

                <div className="flex items-start">
                  <BsCheckLg
                    className="text-3xl mr-3 mt-1 font-bold"
                    style={{ color: "#16a34a" }}
                  />

                  <p className="text-base sm:text-lg" style={{ color: "#4b5563" }}>
                    Free Doorstep Pickup 
                  </p>
                </div>
                <div className="flex items-start">
                  <BsCheckLg
                    className="text-3xl mr-3 mt-1 font-bold"
                    style={{ color: "#16a34a" }}
                  />
                  <p className="text-base sm:text-lg" style={{ color: "#4b5563" }}>
                    Supports all major mobile and laptop brands
                  </p>
                </div>
                <div className="flex items-start">
                  <BsCheckLg
                    className="text-3xl mr-3 mt-1 font-bold"
                    style={{ color: "#16a34a" }}
                  />
                  <p className="text-base sm:text-lg" style={{ color: "#4b5563" }}>
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


      {/* BBG Guarantee Cards Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {/* BBG BuyBack Guarantee Card */}
            <div
              style={{
                borderRadius: "24px 24px 0 0",
                overflow: "hidden",
                background:
                  "radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)",
                padding: "1px",
              }}
            >
              <div
                style={{
                  borderRadius: "24px 24px 0 0",
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <div
                  className="text-white px-6 sm:px-8 py-3 sm:py-4"
                  style={{
                    background: "linear-gradient(-90deg, #232d35, #5e6271)",
                  }}
                >
                  <h3
                    className="text-2xl sm:text-3xl font-bold italic text-center"
                    data-testid="heading-bbg-buyback"
                  >BBG (BuyBack Guarantee)</h3>
                </div>
                <div
                  className="bg-white py-3 sm:py-4"
                  style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
                >
                  <p
                    className="text-gray-800 text-sm sm:text-base lg:text-lg leading-relaxed text-center font-normal"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    data-testid="text-bbg-buyback-desc"
                  >
                    Guarantees your new device's future resale value, activated
                    within 6 months for predictable, assured upgrades.
                  </p>
                </div>
              </div>
            </div>

            {/* Extend+ Value Protection Card */}
            <div
              style={{
                borderRadius: "24px 24px 0 0",
                overflow: "hidden",
                background:
                  "radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)",
                padding: "1px",
              }}
            >
              <div
                style={{
                  borderRadius: "24px 24px 0 0",
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <div
                  className="text-white px-6 sm:px-8 py-3 sm:py-4"
                  style={{
                    background: "linear-gradient(-90deg, #232d35, #5e6271)",
                  }}
                >
                  <h3
                    className="text-2xl sm:text-3xl font-bold italic text-center"
                    data-testid="heading-extend-protection"
                  >
                    Extend+ Value Protection
                  </h3>
                </div>
                <div
                  className="bg-white py-3 sm:py-4"
                  style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
                >
                  <p
                    className="text-gray-800 text-sm sm:text-base lg:text-lg leading-relaxed text-center font-normal"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    data-testid="text-extend-protection-desc"
                  >
                    Protects used devices with one free repair plus doorstep
                    auction support for higher resale returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Which plan is right section */}
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
                fontSize: "clamp(28px, 6vw, 50px)",
                color: "#303e58",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "900",
                letterSpacing: "-0.42px",
                lineHeight: "1.22",
              }}
              data-testid="heading-which-plan"
            >
              Which plan is right<br />for my device?
            </h2>
            <div
              className="hidden sm:block w-16 lg:w-48"
              style={{ height: "0.125rem", backgroundColor: "#303e58" }}
            ></div>
          </div>
        </div>
      </section>
      {/* BBG vs Extend+ Comparison Section */}
      <section className="bg-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* BBG Card */}
            <div
              className="flex-1"
              style={{
                borderRadius: "35px",
                padding: "1px",
                background:
                  "radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)",
                height: "fit-content",
              }}
            >
              <div
                className="p-4 sm:p-6 bg-white"
                style={{ borderRadius: "35px" }}
              >
                <div className="mb-4">
                  <h4 className="sm:text-base lg:text-lg font-bold mb-2 text-[24px]" style={{ color: "#1F4B88" }}>BuyBack Guarantee</h4>
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base mb-2 leading-relaxed font-medium">For mobiles and laptops up to 6 months old</p>
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base leading-relaxed font-medium">Locks your future resale value from day one</p>
                </div>

                <Button
                  className="text-white px-6 py-2 rounded-full font-semibold mb-4"
                  style={{
                    background: "linear-gradient(90deg, #1F4B88, #245AA3)",
                  }}
                  onClick={() => {
                    setIsBBGExpanded(!isBBGExpanded);
                  }}
                  data-testid="button-know-more-bbg"
                >
                  Know More
                </Button>

                {isBBGExpanded && (
                  <>
                    <ul className="space-y-2 sm:space-y-3 mb-4 text-xs sm:text-sm lg:text-base text-gray-800">
                      <li className="flex items-start">
                        <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                        <span>Guarantees up to 70 percent resale value</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                        <span>End-to-end digital claim with doorstep pickup</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                        <span>Up to 36 months coverage*</span>
                      </li>
                    </ul>

                    <div className="flex justify-center">
                      <Button
                        className="bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-6 rounded-lg font-semibold text-sm"
                        data-testid="button-view-plans-bbg"
                        onClick={() => handleViewPlans("mobile")}
                      >
                        View Plans
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Extend+ Card */}
            <div
              className="flex-1"
              style={{
                borderRadius: "35px",
                padding: "1px",
                background:
                  "radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)",
                height: "fit-content",
              }}
            >
              <div
                className="p-4 sm:p-6 bg-white"
                style={{ borderRadius: "35px" }}
              >
                <div className="mb-4">
                  <h4 className="sm:text-base lg:text-lg font-bold mb-2 text-[24px]" style={{ color: "#1F4B88" }}>Extend+</h4>
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base mb-2 leading-relaxed font-medium">For mobiles and laptops up to 3 years old</p>
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base leading-relaxed font-medium">Adds protection, repairs, and better resale</p>
                </div>

                <Button
                  className="text-white px-6 py-2 rounded-full font-semibold mb-4"
                  style={{
                    background: "linear-gradient(90deg, #1F4B88, #245AA3)",
                  }}
                  onClick={() => {
                    setIsExtendExpanded(!isExtendExpanded);
                  }}
                  data-testid="button-know-more-extend"
                >
                  Know More
                </Button>

                {isExtendExpanded && (
                  <>
                    <div className="mb-4">
                      <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base text-gray-800">
                        <li className="flex items-start">
                          <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                          <span>One free repair*</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                          <span>Doorstep auction service with 10-20 % higher resale value*</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                          <span>Up to 24 months of coverage*</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        className="bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-6 rounded-lg font-semibold text-sm"
                        data-testid="button-view-plans-extend"
                        onClick={() => handleViewPlans("mobile")}
                      >
                        View Plans
                      </Button>
                    </div>
                  </>
                )}
              </div>
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
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">

            {/* Laptop Plans */}
            {pricingView === "laptop" && (
              <>
                {/* Laptop BBG Card */}
                <div className="relative w-full max-w-sm">
                  <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                    <div className="p-5 sm:p-6 text-white text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Laptop BBG</h3>
                      <div className="text-4xl sm:text-5xl font-bold mb-3">
                        {pricesLoading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `₹${getLaptopBBGPrice()}`}
                      </div>
                    </div>
                    <div className="mx-4 sm:mx-6">
                      <div className="bg-blue-200 py-2 px-4 rounded-lg">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm text-center">
                          Assured buyback value for your Laptop
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow">
                      <ul className="space-y-3 text-white text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Guaranteed 70 percent future resale value*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Free doorstep pickup</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Instant payment</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Validity: 36 months</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <button
                        onClick={scrollToForm}
                        className="w-full py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
                        data-testid="button-explore-laptop-bbg"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>

                {/* Laptop Extend+ Card */}
                <div className="relative w-full max-w-sm">
                  <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                    <div className="p-5 sm:p-6 text-white text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Laptop Extend+</h3>
                      <div className="text-4xl sm:text-5xl font-bold mb-3">
                        {pricesLoading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `₹${getLaptopExtendPrice()}`}
                      </div>
                    </div>
                    <div className="mx-4 sm:mx-6">
                      <div className="bg-blue-200 py-2 px-4 rounded-lg">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm text-center">
                          Protection, repairs, and better resale
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow">
                      <ul className="space-y-3 text-white text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Free Device Repair*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>30% OFF your Extended Warranty Purchase</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Get resale value up to 20 percent higher than standard market rates</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Validity: 24 months</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <button
                        onClick={scrollToForm}
                        className="w-full py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
                        data-testid="button-explore-laptop-extend"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>

                {/* Laptop Bundle Card */}
                <div className="relative w-full max-w-sm">
                  <div className="absolute -top-2 right-4 z-10">
                    <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      BEST VALUE
                    </span>
                  </div>
                  <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-b from-[#8B5CF6] to-[#5B21B6] h-full flex flex-col">
                    <div className="p-5 sm:p-6 text-white text-center pt-8">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Laptop Bundle</h3>
                      <div className="text-4xl sm:text-5xl font-bold mb-3">
                        {pricesLoading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `₹${getLaptopBundlePrice()}`}
                      </div>
                    </div>
                    <div className="mx-4 sm:mx-6">
                      <div className="bg-purple-200 py-2 px-4 rounded-lg">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm text-center">
                          Assured resale value, Protection and repairs
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow">
                      <ul className="space-y-3 text-white text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Guaranteed 70 percent future resale value*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Free Device Repair*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>30% OFF your Extended Warranty Purchase</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Instant payment</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Validity: 36 months</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <button
                        onClick={scrollToForm}
                        className="w-full py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-gray-100 transition-colors"
                        data-testid="button-explore-laptop-bundle"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Plans */}
            {pricingView === "mobile" && (
              <>
                {/* Mobile BBG Card */}
                <div className="relative w-full max-w-sm">
                  <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                    <div className="p-5 sm:p-6 text-white text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Mobile BBG</h3>
                      <div className="text-4xl sm:text-5xl font-bold mb-3">
                        {pricesLoading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `₹${getMobileBBGPrice()}`}
                      </div>
                    </div>
                    <div className="mx-4 sm:mx-6">
                      <div className="bg-blue-200 py-2 px-4 rounded-lg">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm text-center">
                          Assured buyback value for your Mobile
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow">
                      <ul className="space-y-3 text-white text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Guaranteed 70 percent future resale value*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Free doorstep pickup</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Instant payment</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Validity: 18 months</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <button
                        onClick={scrollToForm}
                        className="w-full py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
                        data-testid="button-explore-mobile-bbg"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Extend+ Card */}
                <div className="relative w-full max-w-sm">
                  <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A] h-full flex flex-col">
                    <div className="p-5 sm:p-6 text-white text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Mobile Extend+</h3>
                      <div className="text-4xl sm:text-5xl font-bold mb-3">
                        {pricesLoading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `₹${getMobileExtendPrice()}`}
                      </div>
                    </div>
                    <div className="mx-4 sm:mx-6">
                      <div className="bg-blue-200 py-2 px-4 rounded-lg">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm text-center">
                          Protection, repairs, and better resale
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow">
                      <ul className="space-y-3 text-white text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Free Device Repair*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>30% OFF your Extended Warranty Purchase</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Get resale value up to 20 percent higher than standard market rates</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Validity: 24 months</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <button
                        onClick={scrollToForm}
                        className="w-full py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
                        data-testid="button-explore-mobile-extend"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Bundle Card */}
                <div className="relative w-full max-w-sm">
                  <div className="absolute -top-2 right-4 z-10">
                    <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      BEST VALUE
                    </span>
                  </div>
                  <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-b from-[#8B5CF6] to-[#5B21B6] h-full flex flex-col">
                    <div className="p-5 sm:p-6 text-white text-center pt-8">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">Mobile Bundle</h3>
                      <div className="text-4xl sm:text-5xl font-bold mb-3">
                        {pricesLoading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `₹${getMobileBundlePrice()}`}
                      </div>
                    </div>
                    <div className="mx-4 sm:mx-6">
                      <div className="bg-purple-200 py-2 px-4 rounded-lg">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm text-center">
                          Assured resale value, Protection and repairs
                        </p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow">
                      <ul className="space-y-3 text-white text-sm">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Guaranteed 70 percent future resale value*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Free Device Repair*</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>30% OFF your Extended Warranty Purchase</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Instant payment</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Validity: 24 months</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 sm:p-6 pt-0">
                      <button
                        onClick={scrollToForm}
                        className="w-full py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-gray-100 transition-colors"
                        data-testid="button-explore-mobile-bundle"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </section>
      {/* How the plan works? Section */}
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
                fontSize: "clamp(28px, 6vw, 50px)",
                color: "#303e58",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "900",
                letterSpacing: "-0.42px",
                lineHeight: "1.22",
              }}
            >
              How the plan<br />works?
            </h2>
            <div
              className="hidden sm:block w-16 lg:w-48"
              style={{ height: "0.125rem", backgroundColor: "#303e58" }}
            ></div>
          </div>
        </div>
      </section>
      {/* How the plan works - Steps Section */}
      <section className="bg-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step rows - restructured for mobile layout with headings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* BBG Column */}
            <div className="flex flex-col h-full">
              <h3
                className="text-center font-black mb-4 sm:mb-6"
                style={{
                  color: "#274797",
                  fontSize: "clamp(20px, 5vw, 1.8rem)",
                  lineHeight: "1.4",
                }}
              >
                BUY BACK GUARANTEE
              </h3>
              <div className="grid gap-3 sm:gap-4 items-stretch flex-1">
                {[
                  { step: "1. Buy BBG", text: "Activate BBG within 6 months of purchasing your mobile or laptop." },
                  { step: "2. Register device", text: "Enter voucher code, IMEI or serial number, and upload your invoice on the BBG portal." },
                  { step: "3. Usage", text: "Keep the device functional and retain the box and basic accessories." },
                  { step: "4. Raise claim", text: "When upgrading, log in, request a claim, complete doorstep QC, and receive your assured value." },
                ].map((item, index) => (
                  <div
                    key={`bbg-${index}`}
                    className="p-4 sm:p-5 rounded-xl flex flex-col justify-center"
                    style={{
                      backgroundColor: "#fff",
                      border: "2px solid #254696",
                      borderLeft: "4px solid #254696",
                    }}
                  >
                    <p className="text-sm sm:text-base text-gray-800">
                      <span className="font-bold text-gray-900">{item.step}</span>
                      <br />
                      <span className="text-gray-600">{item.text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Extend+ Column */}
            <div className="flex flex-col h-full">
              <h3
                className="text-center font-black mb-4 sm:mb-6"
                style={{
                  color: "#274797",
                  fontSize: "clamp(20px, 5vw, 1.8rem)",
                  lineHeight: "1.4",
                }}
              >
                EXTEND+
              </h3>
              <div className="grid gap-3 sm:gap-4 items-stretch flex-1">
                {[
                  { step: "1. Buy Extend+", text: "Choose Extend+ for your mobile or laptop up to 3 years old." },
                  { step: "2. Register device", text: "Upload device details, invoice, and ID proof on the portal to activate coverage." },
                  { step: "3. Use free repair", text: "Book a visit when needed and get service charges waived as per the plan." },
                  { step: "4. Use auction support", text: "Request doorstep auction help and secure a 10-20% better resale price." },
                ].map((item, index) => (
                  <div
                    key={`extend-${index}`}
                    className="p-4 sm:p-5 rounded-xl flex flex-col justify-center"
                    style={{ backgroundColor: "#254696" }}
                  >
                    <p className="text-sm sm:text-base text-white">
                      <span className="font-bold">{item.step}</span>
                      <br />
                      <span className="text-white/90">{item.text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What happens when you raise a request Section */}
      <section className="bg-white py-8 sm:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title with decorative lines */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-8 mb-8 sm:mb-12">
            <div className="hidden sm:block w-16 lg:w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
            <h2 className="text-center" style={{fontSize: 'clamp(24px, 5vw, 40px)', color: '#303e58', fontFamily: 'Poppins, sans-serif', fontWeight: '900', letterSpacing: '-0.42px', lineHeight: '1.22'}}>
              What happens when you<br />raise a request
            </h2>
            <div className="hidden sm:block w-16 lg:w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* BBG Column */}
            <div>
              <div 
                className="rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-3 sm:py-4 text-center text-white font-bold text-base sm:text-xl lg:text-2xl mb-6 sm:mb-8"
                style={{ backgroundImage: "linear-gradient(to top, #123675 0%, #306FC0 100%)" }}
              >
                BUY BACK GUARANTEE
              </div>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Place claim request from your BBG account</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Pick a convenient slot for doorstep visit</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Technician visits, runs quality checks, verifies IMEI and documents</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Assured value is confirmed on screen</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Device is picked up and you receive the value as part of your new device upgrade or as per the channel journey</span>
                </li>
              </ul>
            </div>

            {/* Extend+ Column */}
            <div>
              <div 
                className="rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-3 sm:py-4 text-center text-white font-bold text-base sm:text-xl lg:text-2xl mb-6 sm:mb-8"
                style={{ backgroundImage: "linear-gradient(to top, #123675 0%, #306FC0 100%)" }}
              >
                EXTEND+
              </div>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Book a repair or sell request from your Extend+ account</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Choose doorstep or partner center visit</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">Technician checks the device and applies free repair on service charges where applicable</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">For auction, multiple buyers bid on your device price</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-gray-800 font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-gray-800 text-xs sm:text-sm lg:text-base">You pick the final offer, device is picked up, and payment is processed as per the agreed mode</span>
                </li>
              </ul>
            </div>
          </div>
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
      {/* Distributor CTA Section */}
      <section className="py-4 sm:py-6 bg-[#ffffff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border-l-4"
            style={{
              borderLeftColor: (theme as any)?.primaryColor || "#254696",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6">
              <div className="flex-shrink-0">
                <div
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                  style={{
                    backgroundColor: (theme as any)?.primaryColor || "#254696",
                  }}
                >
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-base sm:text-2xl font-bold mb-1 sm:mb-2 text-gray-900">
                  Join Our Referral Program
                </h2>
                <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-0">
                  Start earning ₹25 commission on every successful BBG
                  registration. Easy setup and regular payouts.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/referral-partner-registration">
                  <Button
                    className="text-white hover:opacity-90 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-base font-semibold"
                    style={{
                      backgroundColor:
                        (theme as any)?.primaryColor || "#254696",
                    }}
                  >
                    Join Program{" "}
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
