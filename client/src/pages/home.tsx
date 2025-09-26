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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left Content */}
            <div className="order-2 lg:order-1 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-xtra-primary mb-6">
                What is XtraCover Buyback Guarantee (BBG)?
              </h2>
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
                    className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-8 py-3 text-lg font-semibold"
                    data-testid="button-buy-bbg"
                  >
                    Buy
                  </Button>
                </Link>
                <Link href="/claim-bbg" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-xtra-primary text-xtra-primary hover:bg-xtra-primary/5 px-8 py-3 text-lg font-semibold"
                    data-testid="button-claim-bbg"
                  >
                    Claim
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Video */}
            <div className="order-1 lg:order-2 flex items-center">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 w-full">
                {/* Video placeholder - you can replace this with an actual video element */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-xtra-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Laptop className="w-10 h-10 text-xtra-primary" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      BBG Protection Demo
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Video placeholder - Replace with actual video
                    </p>
                  </div>
                </div>
                {/* Overlay for video styling similar to the image */}
                <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Laptop BBG Card */}
            <div className="relative ml-12">
              <div className="bg-xtra-primary rounded-2xl shadow-xl overflow-hidden">
                {/* Blue Header Section */}
                <div className="bg-xtra-primary rounded-t-2xl p-8 sm:p-10 text-white text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold mb-6">Laptop BBG</h3>
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
                    {pricesLoading ? <Loader2 className="h-12 w-12 animate-spin inline" /> : `₹${bbgPrices?.laptop || 499}`}
                    </div>
                  <p className="text-white/90 text-lg">(inclusive of GST)</p>
                </div>
              
                {/* Blue Features Section */}
                <div className="bg-xtra-primary p-8 sm:p-10 rounded-b-2xl">
                  <ul className="space-y-4 text-white">
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Up to 70% payout value</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Coverage for up to 36 months</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Free doorstep pickup for claims</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Instant payouts at the time of device handover</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 3D Ribbon positioned absolutely */}
              <div className="absolute top-48 -left-12 z-20">
                <div className="relative">
                  {/* Main ribbon */}
                  <div className="bg-blue-200 py-4 px-8 pr-12 rounded-r-2xl shadow-lg">
                    <p className="text-gray-800 font-bold text-base sm:text-lg text-center whitespace-nowrap">
                      Assured buyback value for<br />your Laptop
                    </p>
                  </div>
                  
                  {/* 3D fold effect */}
                  <div className="absolute -bottom-2 -left-2 w-0 h-0 border-l-[16px] border-l-blue-300 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                </div>
              </div>
            </div>

            {/* Mobile BBG Card */}
            <div className="relative ml-12">
              <div className="bg-xtra-primary rounded-2xl shadow-xl overflow-hidden">
                {/* Blue Header Section */}
                <div className="bg-xtra-primary rounded-t-2xl p-8 sm:p-10 text-white text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold mb-6">Mobile BBG</h3>
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
                    {pricesLoading ? <Loader2 className="h-12 w-12 animate-spin inline" /> : `₹${bbgPrices?.mobile || 299}`}
                  </div>
                  <p className="text-white/90 text-lg">(inclusive of GST)</p>
                </div>
              
                {/* Blue Features Section */}
                <div className="bg-xtra-primary p-8 sm:p-10 rounded-b-2xl">
                  <ul className="space-y-4 text-white">
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Up to 70% payout value</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Coverage for up to 18 months</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Free doorstep pickup for claims</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3 mt-1 text-lg">•</span>
                      <span className="text-base sm:text-lg">Instant payouts at the time of device handover</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 3D Ribbon positioned absolutely */}
              <div className="absolute top-48 -left-12 z-20">
                <div className="relative">
                  {/* Main ribbon */}
                  <div className="bg-blue-200 py-4 px-8 pr-12 rounded-r-2xl shadow-lg">
                    <p className="text-gray-800 font-bold text-base sm:text-lg text-center whitespace-nowrap">
                      Assured buyback value for<br />your Mobile
                    </p>
                  </div>
                  
                  {/* 3D fold effect */}
                  <div className="absolute -bottom-2 -left-2 w-0 h-0 border-l-[16px] border-l-blue-300 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* Acer Special Offer Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="bg-xtra-primary rounded-2xl p-6 sm:p-8 lg:p-10 text-white shadow-xl overflow-hidden">
              
              {/* Golden Special Offer Ribbon */}
              <div className="absolute top-0 left-0 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold px-6 py-3 transform -rotate-45 -translate-x-4 -translate-y-2 origin-top-left shadow-lg">
                <div className="transform rotate-45 text-xs sm:text-sm whitespace-nowrap">
                  SPECIAL<br />OFFER
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                
                {/* Left Content - Features */}
                <div className="flex-1 lg:ml-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-lg sm:text-xl font-medium">Same assured buyback protection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-lg sm:text-xl font-medium">Coverage for up to 5 years</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-lg sm:text-xl font-medium">Quick settlement on claim</span>
                    </div>
                  </div>
                </div>

                {/* Right Content - For Acer Users */}
                <div className="text-center lg:text-right">
                  <div className="text-xl sm:text-2xl font-medium mb-2">For</div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-1">acer</div>
                  <div className="text-xl sm:text-2xl font-medium">Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why People Choose BBG Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 mb-6">
              
              {/* Left Question Mark */}
              <div className="flex-shrink-0">
                <HelpCircle className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-300 stroke-1" />
              </div>
              
              {/* Center People Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {/* Group of people icon */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      {/* Main center person */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-xtra-primary rounded-full flex items-center justify-center relative z-10">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      {/* Left person */}
                      <div className="absolute -left-6 sm:-left-8 top-2 w-12 h-12 sm:w-16 sm:h-16 bg-xtra-primary rounded-full opacity-80"></div>
                      {/* Right person */}
                      <div className="absolute -right-6 sm:-right-8 top-2 w-12 h-12 sm:w-16 sm:h-16 bg-xtra-primary rounded-full opacity-80"></div>
                      {/* Back left person */}
                      <div className="absolute -left-3 sm:-left-4 -top-2 w-10 h-10 sm:w-12 sm:h-12 bg-xtra-primary rounded-full opacity-60"></div>
                      {/* Back right person */}
                      <div className="absolute -right-3 sm:-right-4 -top-2 w-10 h-10 sm:w-12 sm:h-12 bg-xtra-primary rounded-full opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Question Mark */}
              <div className="flex-shrink-0">
                <HelpCircle className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-300 stroke-1" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-xtra-primary leading-tight mb-12">
              Why People<br />Choose BBG?
            </h2>

            {/* Benefits List */}
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Benefit 1 */}
              <div className="bg-xtra-primary rounded-2xl py-6 sm:py-8 px-6 sm:px-8 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Assured returns – your payout is locked on day one
                </h3>
              </div>
              
              {/* Benefit 2 */}
              <div className="bg-xtra-primary rounded-2xl py-6 sm:py-8 px-6 sm:px-8 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Best value in India – higher buyback than any other option
                </h3>
              </div>
              
              {/* Benefit 3 */}
              <div className="bg-xtra-primary rounded-2xl py-6 sm:py-8 px-6 sm:px-8 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Simple process – claim is doorstep pickup + instant payment
                </h3>
              </div>
              
              {/* Benefit 4 */}
              <div className="bg-xtra-primary rounded-2xl py-6 sm:py-8 px-6 sm:px-8 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Trusted brand – already chosen by thousands across the country
                </h3>
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
