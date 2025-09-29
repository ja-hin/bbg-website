import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
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
  HelpCircle
} from "lucide-react";
import { HomepageCarousel } from "@/components/homepage-carousel";
import deviceRegistrationImg from "@assets/Untitled design (3)_1758887376037.png";
import resaleValueImg from "@assets/Untitled design (4)_1758890353128.png";
import doorstepPickupImg from "@assets/1_1758893676653.png";
import instantPaymentImg from "@assets/2_1758893843696.png";
import bbgVideoFile from "@assets/A_cinematic_hightech_202509271550_97ecx_1758972698482.mp4";
import specialOfferRibbon from "@assets/(inclusive of GST) (1)_1759126276325.png";
import whyChooseBbgIcon from "@assets/(inclusive of GST) (3)_1759127901876.png";

export default function Home() {
  // Fetch theme for dynamic coloring
  const { data: theme } = useQuery({
    queryKey: ['/api/theme/current'],
    retry: false,
  });

  // Fetch dynamic BBG prices
  const { data: bbgPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/bbg-prices"],
    queryFn: async () => {
      const response = await fetch("/api/bbg-prices");
      if (!response.ok) throw new Error("Failed to fetch BBG prices");
      return response.json();
    }
  });

  // Fetch regular claim value slabs for mobile (exclude Acer BBG special rates)
  const { data: mobileSlabs, isLoading: isMobileLoading } = useQuery({
    queryKey: ['/api/claim-value-slabs/active/mobile/regular'],
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
  });

  // Fetch regular claim value slabs for laptop (exclude Acer BBG special rates) 
  const { data: laptopSlabs, isLoading: isLaptopLoading } = useQuery({
    queryKey: ['/api/claim-value-slabs/active/laptop/regular'],
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
  });

  const activeMobileSlabs = Array.isArray(mobileSlabs) ? mobileSlabs.filter((slab: any) => slab.isActive) : [];
  const activeLaptopSlabs = Array.isArray(laptopSlabs) ? laptopSlabs.filter((slab: any) => slab.isActive) : [];
  const isSlabsLoading = isMobileLoading || isLaptopLoading;
  
  const allSlabs = [...activeMobileSlabs, ...activeLaptopSlabs];
  const maxPercentage = allSlabs.length > 0 ? Math.max(...allSlabs.map((slab: any) => slab.percentage)) : 70;



  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Homepage Carousel */}
      <HomepageCarousel />
      
      {/* What is XtraCover BBG Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Full Width Title */}
          <div className="text-left mb-8 lg:mb-12">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold text-xtra-primary leading-tight">
              What is XtraCover Buyback Guarantee (BBG)?
            </h2>
          </div>
          
          {/* Two Column Layout: Text Left, Video Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content - Text and Buttons */}
            <div className="flex flex-col justify-center">
              <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
                BuyBack Guarantee (BBG) is a plan that locks the future resale value of your phone or laptop at the time of purchase. Instead of losing money to fast depreciation, BBG secures up to 70% of your device's price upfront. When it's time to upgrade, you get instant cash to your bank or UPI after a simple quality check. BBG makes owning and upgrading your device smarter, safer, and worry-free.
              </p>
              
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-xtra-primary mb-4">
                Lock Your Device's Value Before it drops
              </h3>
              <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
                With BuyBack Guarantee, secure up to 70% resale value for your mobile or laptop. Fixed upfront, hassle-free, and ready to redeem whenever you upgrade. Trusted by thousands across India.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/buy-bbg" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-lg"
                    data-testid="button-buy-bbg"
                  >
                    Buy BBG
                  </Button>
                </Link>
                <Link href="/claim-bbg" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-lg"
                    data-testid="button-claim-bbg"
                  >
                    Claim BBG
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Video - Square Aspect Ratio */}
            <div className="flex items-center justify-center">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 w-full max-w-md">
                {/* Square Video Element */}
                <video 
                  src={bbgVideoFile}
                  className="w-full aspect-square object-cover"
                  controls
                  autoPlay
                  muted
                  preload="metadata"
                  data-testid="video-bbg-demo"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Title Sections */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* First Title */}
          <div className="bg-xtra-primary rounded-2xl py-6 sm:py-8 px-6 sm:px-8 text-center">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
              Your device starts losing value the moment you<br />
              buy it. BBG protects you from that.
            </h3>
          </div>
          
          {/* Second Title */}
          <div className="bg-xtra-primary rounded-2xl py-6 sm:py-8 px-6 sm:px-8 text-center">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              What BBG Does ?
            </h3>
          </div>
        </div>
      </section>
      
      {/* Process Flow Section */}
      <section className="py-12 sm:py-16 lg:py-20" style={{backgroundColor: "rgba(117, 157, 245, 0.27)"}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            
            {/* Step 1 - Icon Left */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative bg-white rounded-full w-full py-3 sm:py-4 pr-8 sm:pr-12 pl-24 sm:pl-32 md:pl-40">
                <h4 className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 text-right">
                  You register your device once
                </h4>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
                    <img 
                      src={deviceRegistrationImg} 
                      alt="Device registration illustration" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 - Icon Right */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative bg-white rounded-full w-full py-3 sm:py-4 pl-8 sm:pl-12 pr-24 sm:pr-32 md:pr-40">
                <h4 className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 text-left">
                  Your resale value is upfront
                </h4>
                <div className="absolute right-16 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
                    <img 
                      src={resaleValueImg} 
                      alt="Upfront resale value illustration" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 - Icon Left */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative bg-white rounded-full w-full py-3 sm:py-4 pr-8 sm:pr-12 pl-24 sm:pl-32 md:pl-40">
                <h4 className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 text-right">
                  We pick it up right from your doorstep
                </h4>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
                    <img 
                      src={doorstepPickupImg} 
                      alt="Doorstep pickup illustration" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 - Icon Right */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative bg-white rounded-full w-full py-3 sm:py-4 pl-8 sm:pl-12 pr-24 sm:pr-32 md:pr-40">
                <h4 className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 text-left">
                  You get paid instantly
                </h4>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
                    <img 
                      src={instantPaymentImg} 
                      alt="Instant payment illustration" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* BBG Pricing Cards Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
            
            {/* Laptop BBG Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-6 pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-2xl font-bold mb-2">Laptop BBG</h3>
                  <div className="text-6xl font-bold mb-3">
                    {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                  </div>
                  <p className="text-white/80 text-sm">(inclusive of GST)</p>
                </div>
              
                {/* Features Section with text shadow */}
                <div className="p-6 pt-8" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                  <ul className="space-y-3 text-white">
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Up to 70% payout value</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Coverage for up to 36 months</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Free doorstep pickup for claims</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Instant payouts at the time of device handover</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20" style={{top: '10.5rem', left: '-1.5rem'}}>
                <div className="relative">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-3 pl-14 pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-sm text-center">
                      Assured buyback value for<br />your Laptop
                    </p>
                  </div>
                  
                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[20px] left-0 w-0 h-0 border-t-[20px] border-t-blue-300 border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

            {/* Mobile BBG Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-6 pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-2xl font-bold mb-2">Mobile BBG</h3>
                  <div className="text-6xl font-bold mb-3">
                    {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                  </div>
                  <p className="text-white/80 text-sm">(inclusive of GST)</p>
                </div>
              
                {/* Features Section with text shadow */}
                <div className="p-6 pt-8" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                  <ul className="space-y-3 text-white">
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Up to 70% payout value</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Coverage for up to 18 months</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Free doorstep pickup for claims</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Instant payouts at the time of device handover</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20" style={{top: '10.5rem', left: '-1.5rem'}}>
                <div className="relative">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-3 pl-14 pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-sm text-center">
                      Assured buyback value for<br />your Mobile
                    </p>
                  </div>
                  
                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[20px] left-0 w-0 h-0 border-t-[20px] border-t-blue-300 border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

            {/* Laptop Extend+ Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-6 pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-2xl font-bold mb-2">Laptop Extend+</h3>
                  <div className="text-6xl font-bold mb-3">
                    {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                  </div>
                </div>
              
                {/* Features Section with text shadow */}
                <div className="p-6 pt-8" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                  <ul className="space-y-3 text-white">
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Free Auction Service → 10-20% higher resale than market</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">1 Free Device Repair (service charges waived, parts chargeable)</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Validity: 24 months</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20" style={{top: '10.5rem', left: '-1.5rem'}}>
                <div className="relative">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-3 pl-14 pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-sm text-center">
                      (inclusive of GST)
                    </p>
                  </div>
                  
                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[20px] left-0 w-0 h-0 border-t-[20px] border-t-blue-300 border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

            {/* Mobile Extend+ Card */}
            <div className="relative w-full max-w-xs">
              <div className="rounded-2xl shadow-xl overflow-hidden relative z-10 bg-gradient-to-b from-[#4A90E2] to-[#1E3A8A]">
                {/* Header Section with text shadow */}
                <div className="p-6 pb-14 text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                  <h3 className="text-2xl font-bold mb-2">Mobile Extend+</h3>
                  <div className="text-6xl font-bold mb-3">
                    {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                  </div>
                </div>
              
                {/* Features Section with text shadow */}
                <div className="p-6 pt-8" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>
                  <ul className="space-y-3 text-white">
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Free Auction Service → 10-20% higher resale than market</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">1 Free Device Repair (service charges waived, parts chargeable)</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-white mr-3">•</span>
                      <span className="text-sm">Validity: 24 months</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 3D Ribbon for Assured Value */}
              <div className="absolute right-6 z-20" style={{top: '10.5rem', left: '-1.5rem'}}>
                <div className="relative">
                  {/* Main ribbon extending left - completely rectangular */}
                  <div className="bg-blue-200 py-3 pl-14 pr-4 shadow-lg relative">
                    <p className="text-gray-800 font-bold text-sm text-center">
                      (inclusive of GST)
                    </p>
                  </div>
                  
                  {/* Perfect triangle positioned below ribbon */}
                  <div className="absolute -bottom-[20px] left-0 w-0 h-0 border-t-[20px] border-t-blue-300 border-l-[24px] border-l-transparent"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* Acer Special Offer Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="rounded-2xl px-8 py-6 text-white shadow-xl overflow-hidden relative" style={{background: 'linear-gradient(180deg, #4A90E2 0%, #1E3A8A 100%)'}}>
              
              {/* Special Offer Ribbon Image */}
              <div className="absolute top-0 left-0 z-10">
                <img 
                  src={specialOfferRibbon} 
                  alt="Special Offer" 
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div className="flex items-center justify-between pl-8">
                
                {/* Center Content - Features */}
                <div className="flex-1 flex justify-center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-lg font-medium">Same assured buyback protection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-lg font-medium">Coverage for up to 5 years</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-lg font-medium">Quick settlement on claim</span>
                    </div>
                  </div>
                </div>

                {/* Center Content - For Acer Users */}
                <div className="text-center mr-5" style={{fontFamily: 'Inter, sans-serif'}}>
                  <div className="text-2xl font-bold mb-1">For</div>
                  <div className="text-5xl font-extrabold mb-1">ACER</div>
                  <div className="text-2xl font-bold italic">Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why People Choose BBG & Extend+ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={whyChooseBbgIcon} 
                alt="Why Choose BBG Icons" 
                className="w-96 h-auto object-contain"
              />
            </div>
            
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-xtra-primary leading-tight mb-12">
              Why People Choose BBG & Extend+?
            </h2>
            
            {/* BBG Section */}
            <div className="mb-12">
              {/* BBG Header */}
              <div className="border-2 border-xtra-primary rounded-lg px-6 py-3 mb-6 w-full max-w-none">
                <h3 className="text-2xl font-medium text-xtra-primary">
                  For BuyBack Guarantee (BBG - Devices &lt; 6 months)
                </h3>
              </div>
              
              {/* BBG Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Assured returns - your payout is locked on day one
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Best value in India - higher buyback than any other option
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Simple process - claim is doorstep pickup + instant payment
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Trusted brand - already chosen by thousands across the country
                  </p>
                </div>
              </div>
            </div>
            
            {/* Extend+ Section */}
            <div>
              {/* Extend+ Header */}
              <div className="border-2 border-xtra-primary rounded-lg px-6 py-3 mb-6 w-full max-w-none">
                <h3 className="text-2xl font-medium text-xtra-primary">
                  For Extend+ (Devices &gt; 6 months)
                </h3>
              </div>
              
              {/* Extend+ Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Free Auction Service - get 10-20% higher resale value than market
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    1 Free Device Repair - service charges waived (parts chargeable)
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Valid for 24 months, keeping older devices valuable longer
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-6 py-4 rounded-lg">
                  <p className="font-medium text-2xl whitespace-nowrap">
                    Hassle-free, designed to extend your device's life & value
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* BBG Depreciation Slabs Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block border-2 border-xtra-primary rounded-3xl py-4 px-8 sm:px-12 mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-xtra-primary">
                How Much You'll Get Back
              </h2>
            </div>
          </div>

          {isSlabsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-xtra-primary" />
            </div>
          ) : (
            <div className="space-y-8 w-full">
              
              {/* Mobile Devices Grid */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-xtra-primary to-xtra-primary/80 text-white px-6 py-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Smartphone className="w-8 h-8 mr-3" />
                    Mobile Devices
                  </h3>
                  <p className="text-white/90 mt-2">BBG claim values based on device age</p>
                </div>
                <div className="p-6">
                  {(() => {
                    if (activeMobileSlabs.length === 0) {
                      return (
                        <div className="py-12 text-center">
                          <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No mobile device slabs available</p>
                        </div>
                      );
                    }

                    // Group mobile slabs by age range - get the highest percentage for each age range
                    const ageRanges: { [key: string]: any } = {};
                    
                    activeMobileSlabs.forEach((slab: any) => {
                      const ageKey = `${slab.minMonths}-${slab.maxMonths}`;
                      if (!ageRanges[ageKey]) {
                        ageRanges[ageKey] = {
                          minMonths: slab.minMonths,
                          maxMonths: slab.maxMonths,
                          percentage: slab.percentage
                        };
                      } else {
                        // Keep the highest percentage for this age range
                        ageRanges[ageKey].percentage = Math.max(ageRanges[ageKey].percentage, slab.percentage);
                      }
                    });

                    // Sort age ranges by minMonths
                    const sortedAgeRanges = Object.entries(ageRanges).sort(
                      ([, a], [, b]) => a.minMonths - b.minMonths
                    );

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        {sortedAgeRanges.map(([ageKey, ageData]) => {
                          // Determine color based on percentage
                          let bgColor = "bg-gradient-to-br from-green-50 to-green-100";
                          let textColor = "text-green-700";
                          let borderColor = "border-green-200";
                          
                          if (ageData.percentage < 30) {
                            bgColor = "bg-gradient-to-br from-red-50 to-red-100";
                            textColor = "text-red-700";
                            borderColor = "border-red-200";
                          } else if (ageData.percentage < 50) {
                            bgColor = "bg-gradient-to-br from-orange-50 to-orange-100";
                            textColor = "text-orange-700";
                            borderColor = "border-orange-200";
                          } else if (ageData.percentage < 70) {
                            bgColor = "bg-gradient-to-br from-yellow-50 to-yellow-100";
                            textColor = "text-yellow-700";
                            borderColor = "border-yellow-200";
                          }

                          return (
                            <div key={ageKey} className={`${bgColor} ${borderColor} border-2 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200 hover:scale-105`}>
                              <div className="text-xs font-medium text-gray-600 mb-2">
                                {ageData.minMonths}-{ageData.maxMonths} months
                              </div>
                              <div className={`text-2xl font-bold ${textColor} mb-1`}>
                                {ageData.percentage}%
                              </div>
                              <div className="text-xs text-gray-500">
                                max value
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Laptop Devices Grid */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-xtra-primary to-xtra-primary/80 text-white px-6 py-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Laptop className="w-8 h-8 mr-3" />
                    Laptop Devices
                  </h3>
                  <p className="text-white/90 mt-2">BBG claim values based on device age</p>
                </div>
                <div className="p-6">
                  {(() => {
                    if (activeLaptopSlabs.length === 0) {
                      return (
                        <div className="py-12 text-center">
                          <Laptop className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No laptop device slabs available</p>
                        </div>
                      );
                    }

                    // Group laptop slabs by age range - get the highest percentage for each age range
                    const ageRanges: { [key: string]: any } = {};
                    
                    activeLaptopSlabs.forEach((slab: any) => {
                      const ageKey = `${slab.minMonths}-${slab.maxMonths}`;
                      if (!ageRanges[ageKey]) {
                        ageRanges[ageKey] = {
                          minMonths: slab.minMonths,
                          maxMonths: slab.maxMonths,
                          percentage: slab.percentage
                        };
                      } else {
                        // Keep the highest percentage for this age range
                        ageRanges[ageKey].percentage = Math.max(ageRanges[ageKey].percentage, slab.percentage);
                      }
                    });

                    // Sort age ranges by minMonths
                    const sortedAgeRanges = Object.entries(ageRanges).sort(
                      ([, a], [, b]) => a.minMonths - b.minMonths
                    );

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        {sortedAgeRanges.map(([ageKey, ageData]) => {
                          // Determine color based on percentage
                          let bgColor = "bg-gradient-to-br from-green-50 to-green-100";
                          let textColor = "text-green-700";
                          let borderColor = "border-green-200";
                          
                          if (ageData.percentage < 30) {
                            bgColor = "bg-gradient-to-br from-red-50 to-red-100";
                            textColor = "text-red-700";
                            borderColor = "border-red-200";
                          } else if (ageData.percentage < 50) {
                            bgColor = "bg-gradient-to-br from-orange-50 to-orange-100";
                            textColor = "text-orange-700";
                            borderColor = "border-orange-200";
                          } else if (ageData.percentage < 70) {
                            bgColor = "bg-gradient-to-br from-yellow-50 to-yellow-100";
                            textColor = "text-yellow-700";
                            borderColor = "border-yellow-200";
                          }

                          return (
                            <div key={ageKey} className={`${bgColor} ${borderColor} border-2 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200 hover:scale-105`}>
                              <div className="text-xs font-medium text-gray-600 mb-2">
                                {ageData.minMonths}-{ageData.maxMonths} months
                              </div>
                              <div className={`text-2xl font-bold ${textColor} mb-1`}>
                                {ageData.percentage}%
                              </div>
                              <div className="text-xs text-gray-500">
                                max value
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          
          {/* General Information */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto mt-6">
            <div className="bg-gray-50 px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  All percentages are of invoice value for your devices in functional and fair condition. Your slabs are locked as per your purchase date/time and mapped to your unique BBG Voucher. 
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/buy-bbg">
                    <Button size="sm" className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white">Buy</Button>
                  </Link>
                  <Link href="/claim-bbg">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto border-xtra-primary text-xtra-primary hover:bg-xtra-primary/5">Claim</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about XtraCover's BuyBack Guarantee program.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What is the BuyBack Guarantee (BBG)?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    BBG gives you a fixed, assured resale value for your mobile or laptop when you claim within the coverage period.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Who can buy BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    Only customers who purchased a new device from an authorized brand sales channel. Refurbished, open-box, second-hand, or grey-market devices are not eligible.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    How long after my device purchase can I buy BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    You can buy BBG within 5 years from your device purchase date.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What's the catch?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    There isn't one. Just buy BBG for your new mobile or laptop, and when it's time, we'll buy the device back at the assured value shown when you registered.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    When can I claim BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    You can claim BBG anytime after 3 months from your BBG purchase date, provided your claim period has begun as per your device's age in the depreciation slabs.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What condition does my device need to be in?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    Your device must be fully functional, with no major cracks, damage, missing parts, or screen issues. The screen and body should be intact, and all buttons should work.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-7" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Do I need to worry about normal wear & tear?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    No. Minor cosmetic wear is okay. The QC team just checks that it's still in good working order.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-8" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if I've damaged my device?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    If there's major damage or it fails QC, your BBG value may be void and you'll get a market-based offer instead.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-9" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What do I need at the time of claim?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Original GST invoice of the device</li>
                      <li>Valid Government ID in your name</li>
                      <li>Original box, charger, and accessories in working condition</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-10" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if my device fails QC?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    If your device fails the quality check, BBG becomes void. You may still receive a re-evaluated device price based on market standards.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-11" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if I want to keep my device?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    That's fine. BBG is optional to claim — you can keep your device and skip the claim process.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-12" className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg text-gray-900 hover:text-xtra-primary">
                    How will I receive payment?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base pt-2 pb-4">
                    Once QC is passed, payment will be made instantly after device handover.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>
      {/* Distributor CTA Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-l-4" style={{ borderLeftColor: (theme as any)?.primaryColor || '#254696' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="rounded-full w-12 h-12 flex items-center justify-center" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Join Our Referral Program</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-0">Start earning ₹25 commission on every successful BBG registration. Easy setup and regular payouts.</p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/referral-partner-registration">
                  <Button className="text-white hover:opacity-90 px-6 py-2.5 font-semibold" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
                    Join Program <ArrowRight className="ml-2 h-4 w-4" />
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
