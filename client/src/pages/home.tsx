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
import { useState } from "react";
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
  ChevronDown,
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
  const [selectedDeviceType, setSelectedDeviceType] = useState("");

  // Fetch theme for dynamic coloring
  const { data: theme } = useQuery({
    queryKey: ["/api/theme/current"],
    retry: false,
  });

  // Fetch "Who can use these plans?" banner
  const { data: whoCanUseBanner } = useQuery({
    queryKey: ["/api/homepage-banners/by-title/Who can use these plans"],
    retry: false,
  });

  // Fetch dynamic BBG prices
  const { data: bbgPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/bbg-prices"],
    queryFn: async () => {
      const response = await fetch("/api/bbg-prices");
      if (!response.ok) throw new Error("Failed to fetch BBG prices");
      return response.json();
    },
  });

  // Fetch regular claim value slabs for mobile (exclude Acer BBG special rates)
  const { data: mobileSlabs, isLoading: isMobileLoading } = useQuery({
    queryKey: ["/api/claim-value-slabs/active/mobile/regular"],
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
  });

  // Fetch regular claim value slabs for laptop (exclude Acer BBG special rates)
  const { data: laptopSlabs, isLoading: isLaptopLoading } = useQuery({
    queryKey: ["/api/claim-value-slabs/active/laptop/regular"],
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
  });

  // Fetch brands based on device type
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["/api/brands", selectedDeviceType],
    enabled: !!selectedDeviceType,
    staleTime: 300000,
  });

  const activeMobileSlabs = Array.isArray(mobileSlabs)
    ? mobileSlabs.filter((slab: any) => slab.isActive)
    : [];
  const activeLaptopSlabs = Array.isArray(laptopSlabs)
    ? laptopSlabs.filter((slab: any) => slab.isActive)
    : [];
  const isSlabsLoading = isMobileLoading || isLaptopLoading;

  const allSlabs = [...activeMobileSlabs, ...activeLaptopSlabs];
  const maxPercentage =
    allSlabs.length > 0
      ? Math.max(...allSlabs.map((slab: any) => slab.percentage))
      : 70;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Homepage Carousel */}
      <HomepageCarousel />
      
      {/* Smart Plans Section with Form */}
      <section
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: "linear-gradient(135deg, #e8f4f8 0%, #f0f7ff 50%, #f7f5ef 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Text + Benefits */}
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold leading-tight mb-6"
                style={{ color: "#1a1a1a" }}
              >
                Protection for your
                <br /> phone, old or new, with
                <br /> monthly/yearly plans
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
            <div
              className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border"
              style={{ borderColor: "#e5e7eb" }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: "#111827" }}>
                Find plans for your device
              </h3>
              <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
                Enter basic details to see available protection plans.
              </p>

              <div className="space-y-5">
                {/* Unified form field classes */}
                {/* Device Type */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    Device Type
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none pr-10"
                      style={{
                        borderColor: "#d1d5db",
                        color: "#4b5563",
                        backgroundColor: "#ffffff",
                      }}
                      data-testid="select-device-type"
                      value={selectedDeviceType}
                      onChange={(e) => setSelectedDeviceType(e.target.value)}
                    >
                      <option value="">Select device type</option>
                      <option value="mobile">Mobile</option>
                      <option value="laptop">Laptop</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Device Brand */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    Device Brand
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: "#d1d5db",
                        color: "#4b5563",
                        backgroundColor: "#ffffff",
                      }}
                      data-testid="select-device-brand"
                      disabled={!selectedDeviceType || brandsLoading}
                    >
                      <option value="">
                        {brandsLoading ? "Loading brands…" : "Select device brand"}
                      </option>
                      {brands?.map((brand: any) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Device Purchase Date */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    Device Purchase Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    style={{
                      borderColor: "#d1d5db",
                      backgroundColor: "#ffffff",
                      color: "#4b5563",
                    }}
                    data-testid="input-purchase-date"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    className="w-full text-white font-semibold py-3 rounded-md text-base"
                    style={{ backgroundColor: "#0070f3" }}
                    data-testid="button-find-plans"
                  >
                    Find Plans
                  </Button>
                </div>
              </div>
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
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base font-normal mb-2 leading-relaxed">For new mobiles and laptops</p>
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base font-normal leading-relaxed">Locks your future resale value from day one</p>
                </div>

                <Button
                  className="text-white px-6 py-2 rounded-full font-semibold mb-4"
                  style={{
                    background: "linear-gradient(90deg, #1F4B88, #245AA3)",
                  }}
                  onClick={() => {
                    setIsBBGExpanded(!isBBGExpanded);
                    setIsExtendExpanded(false);
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
                        <span>Covers mobiles and laptops up to 6 months old</span>
                      </li>
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
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base font-normal mb-2 leading-relaxed">For devices already in use</p>
                  <p className="text-gray-900 text-xs sm:text-sm lg:text-base font-normal leading-relaxed">Adds protection, repairs, and better resale</p>
                </div>

                <Button
                  className="text-white px-6 py-2 rounded-full font-semibold mb-4"
                  style={{
                    background: "linear-gradient(90deg, #1F4B88, #245AA3)",
                  }}
                  onClick={() => {
                    setIsExtendExpanded(!isExtendExpanded);
                    setIsBBGExpanded(false);
                  }}
                  data-testid="button-know-more-extend"
                >
                  Know More
                </Button>

                {isExtendExpanded && (
                  <>
                    <div className="mb-4">
                      <h5 className="text-gray-900 text-xs sm:text-sm lg:text-base font-bold mb-3">What it does</h5>
                      <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base text-gray-800">
                        <li className="flex items-start">
                          <CheckCircle className="mr-3 flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                          <span>Covers mobiles and laptops up to 3 years old</span>
                        </li>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
            {/* BBG Column */}
            <div className="max-w-xl w-full">
              <h3
                className="text-center font-black text-blue-700 mb-6"
                style={{
                  color: "#274797",
                  fontSize: "clamp(24px, 6vw, 2.4rem)",
                  lineHeight: "2",
                }}
              >
                BUY BACK GUARANTEE
              </h3>
              <div className="space-y-12">
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#0771de", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-base sm:text-lg lg:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">1. Buy BBG:</span>{" "}
                    <span className="font-normal">
                      Activate BBG within 6 months of purchasing your mobile or
                      laptop.
                    </span>
                  </p>
                </div>
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#1F4B88", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-base sm:text-lg lg:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">2. Register device:</span>{" "}
                    <span className="font-normal">
                      Enter voucher code, IMEI or serial number, and upload your
                      invoice on the BBG portal.
                    </span>
                  </p>
                </div>
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#0771de", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-base sm:text-lg lg:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">3. Usage:</span>{" "}
                    <span className="font-normal">
                      Keep the device functional and retain the box and basic
                      accessories.
                    </span>
                  </p>
                </div>
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#1F4B88", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-base sm:text-lg lg:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">4. Raise claim:</span>{" "}
                    <span className="font-normal">
                      When upgrading, log in, request a claim, complete doorstep
                      QC, and receive your assured value.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Extend+ Column */}
            <div className="max-w-xl w-full">
              <h3
                className="text-center font-black text-blue-700 mb-6"
                style={{
                  color: "#274797",
                  fontSize: "clamp(24px, 6vw, 2.4rem)",
                  lineHeight: "2",
                }}
              >
                EXTEND+
              </h3>
              <div className="space-y-12">
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#245AA3", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-lg sm:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">1. Buy Extend+:</span>{" "}
                    <span className="font-normal">
                      Choose Extend+ for your mobile or laptop up to 3 years
                      old.
                    </span>
                  </p>
                </div>
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#0771de", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-base sm:text-lg lg:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">2. Register device:</span>{" "}
                    <span className="font-normal">
                      Upload device details, invoice, and ID proof on the portal
                      to activate coverage.
                    </span>
                  </p>
                </div>
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#245AA3", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-lg sm:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">3. Use free repair:</span>{" "}
                    <span className="font-normal">
                      Book a visit when needed and get service charges waived as
                      per the plan.
                    </span>
                  </p>
                </div>
                <div
                  className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${planWorksBackgroundImg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#0771de", opacity: 0.93 }}
                  ></div>
                  <p
                    className="text-lg sm:text-xl relative z-10"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
                  >
                    <span className="font-bold">4. Use auction support:</span>{" "}
                    <span className="font-normal">
                      Request doorstep auction help and secure a 10-20% better
                      resale price.
                    </span>
                  </p>
                </div>
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
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 justify-items-center">

            {/* Laptop BBG Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Laptop BBG</h3>
                  <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                    {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm">(inclusive of GST)</p>
                </div>

                {/* Features Section with text shadow */}
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

              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
                <div className="relative sm:block">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                      Assured buyback value for<br />your Laptop
                    </p>
                  </div>

                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

            {/* Mobile BBG Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Mobile BBG</h3>
                  <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                    {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm">(inclusive of GST)</p>
                </div>

                {/* Features Section with text shadow */}
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

              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
                <div className="relative sm:block">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                      Assured buyback value for<br />your Mobile
                    </p>
                  </div>

                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

            {/* Laptop Extend+ Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Laptop Extend+</h3>
                  <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                    {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                  </div>
                </div>

                {/* Features Section with text shadow */}
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

              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
                <div className="relative sm:block">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                      (inclusive of GST)
                    </p>
                  </div>

                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

            {/* Mobile Extend+ Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-4 sm:p-6 pb-10 sm:pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Mobile Extend+</h3>
                  <div className="text-4xl sm:text-6xl font-bold mb-2 sm:mb-3">
                    {pricesLoading ? <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                  </div>
                </div>

                {/* Features Section with text shadow */}
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

              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20 top-[7.5rem] sm:top-[8.5rem]" style={{left: '-1.5rem'}}>
                <div className="relative sm:block">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-2 sm:py-3 pl-10 sm:pl-14 pr-3 sm:pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-xs sm:text-sm text-center">
                      (inclusive of GST)
                    </p>
                  </div>

                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[15px] sm:-bottom-[20px] left-0 w-0 h-0 border-t-[15px] sm:border-t-[20px] border-t-blue-300 border-l-[18px] sm:border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Who Can Use These Plans Banner Section */}
      <section className="bg-white pt-4">
        {whoCanUseBanner ? (
          <>
            {/* Desktop Image */}
            <img
              src={whoCanUseBanner.desktopImageUrl}
              alt={whoCanUseBanner.title || "Who can use these plans"}
              className="w-full h-auto hidden md:block"
              data-testid="image-who-can-use-desktop"
              onClick={() => whoCanUseBanner.linkUrl && (window.location.href = whoCanUseBanner.linkUrl)}
              style={{ cursor: whoCanUseBanner.linkUrl ? 'pointer' : 'default' }}
            />
            {/* Mobile Image */}
            <img
              src={whoCanUseBanner.mobileImageUrl}
              alt={whoCanUseBanner.title || "Who can use these plans"}
              className="w-full h-auto md:hidden"
              data-testid="image-who-can-use-mobile"
              onClick={() => whoCanUseBanner.linkUrl && (window.location.href = whoCanUseBanner.linkUrl)}
              style={{ cursor: whoCanUseBanner.linkUrl ? 'pointer' : 'default' }}
            />
          </>
        ) : (
          <img
            src={bannerImg}
            alt="Woman with laptop"
            className="w-full h-auto"
            data-testid="image-who-can-use"
          />
        )}
      </section>
      {/* Eligibility Requirements Section */}
      <section className="bg-white py-8 sm:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* BBG Column */}
            <div 
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12"
              style={{ backgroundImage: "linear-gradient(to top, #123675 0%, #306FC0 100%)" }}
            >
              <h3 className="text-white font-bold text-lg sm:text-2xl lg:text-3xl mb-4 sm:mb-6 text-center">Buy Back Guarantee</h3>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-white font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-white text-xs sm:text-sm lg:text-base">Only for brand-new mobiles and laptops.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Must be purchased from an authorised retailer or marketplace.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Registration must match the original buyer's name and government ID.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Device should be fully functional with no major damage.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">IMEI/serial must match the registered details.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Original invoice, box, and basic accessories required.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Device must be factory-reset before pickup.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">BBG is not transferable or refundable.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Assured value is given only during an upgrade or purchase, not as cash.</span>
                </li>
              </ul>
            </div>

            {/* Extend+ Column */}
            <div 
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12"
              style={{ backgroundImage: "linear-gradient(to top, #123675 0%, #306FC0 100%)" }}
            >
              <h3 className="text-white font-bold text-lg sm:text-2xl lg:text-3xl mb-4 sm:mb-6 text-center">Extend+</h3>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-white font-bold text-base sm:text-lg flex-shrink-0">•</span>
                  <span className="text-white text-xs sm:text-sm lg:text-base">Device can be up to 3 years old with a valid invoice.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Device must not be stolen, blocked, or flagged.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Free repair covers service charges; parts may be chargeable.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Auction support applies only if the device passes quality checks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Final offer depends on live bids and actual device condition.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold text-lg flex-shrink-0">•</span>
                  <span className="text-white text-sm sm:text-base">Plan remains in the registered user's name and cannot be transferred.</span>
                </li>
              </ul>
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
