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
import pricingCardBackground from "@assets/(inclusive of GST) (4)_1759147213189.png";
import planWorksBackgroundImg from "@assets/Untitled design (15) (1)_1764254452404.png";

export default function Home() {
  const [isBBGExpanded, setIsBBGExpanded] = useState(false);
  const [isExtendExpanded, setIsExtendExpanded] = useState(false);

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
      
      {/* BBG Guarantee Cards Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {/* BBG BuyBack Guarantee Card */}
            <div style={{borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)', padding: '1px'}}>
              <div style={{borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'white'}}>
                <div className="text-white px-6 sm:px-8 py-3 sm:py-4" style={{background: 'linear-gradient(-90deg, #232d35, #5e6271)'}}>
                  <h3 className="text-2xl sm:text-3xl font-bold italic text-center" data-testid="heading-bbg-buyback">
                    BBG BuyBack Guarantee
                  </h3>
                </div>
                <div className="bg-white py-3 sm:py-4" style={{paddingLeft: '0.5rem', paddingRight: '0.5rem'}}>
                  <p className="text-gray-800 text-lg leading-relaxed text-center font-normal" style={{fontFamily: 'Inter, sans-serif'}} data-testid="text-bbg-buyback-desc">
                    Guarantees your new device's future resale value, activated within 6 months for predictable, assured upgrades.
                  </p>
                </div>
              </div>
            </div>

            {/* Extend+ Value Protection Card */}
            <div style={{borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)', padding: '1px'}}>
              <div style={{borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'white'}}>
                <div className="text-white px-6 sm:px-8 py-3 sm:py-4" style={{background: 'linear-gradient(-90deg, #232d35, #5e6271)'}}>
                  <h3 className="text-2xl sm:text-3xl font-bold italic text-center" data-testid="heading-extend-protection">
                    Extend+ Value Protection
                  </h3>
                </div>
                <div className="bg-white py-3 sm:py-4" style={{paddingLeft: '0.5rem', paddingRight: '0.5rem'}}>
                  <p className="text-gray-800 text-lg leading-relaxed text-center font-normal" style={{fontFamily: 'Inter, sans-serif'}} data-testid="text-extend-protection-desc">
                    Protects used devices with one free repair plus doorstep auction support for higher resale returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Which plan is right section */}
      <section className="bg-white" style={{paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            <div className="w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
            <h2 className="text-center whitespace-nowrap" style={{fontSize: '50px', color: '#303e58', fontFamily: 'Poppins, sans-serif', fontWeight: '900', letterSpacing: '-0.42px', lineHeight: '1.22'}} data-testid="heading-which-plan">
              Which plan is right<br />for my device?
            </h2>
            <div className="w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
          </div>
        </div>
      </section>

      {/* BBG vs Extend+ Comparison Section */}
      <section className="bg-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* BBG Card */}
            <div className="flex-1" style={{borderRadius: '35px', padding: '1px', background: 'radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)', height: 'fit-content'}}>
              <div className="p-4 sm:p-6 bg-white" style={{borderRadius: '35px'}}>
              <p className="text-gray-900 text-base sm:text-lg font-normal mb-4 leading-relaxed">
                <strong>BBG</strong> is for new devices only. It locks your future resale value on the day you buy your mobile or laptop so you already know what you will get back when you upgrade.
              </p>
              
              <Button 
                className="text-white px-6 py-2 rounded-full font-semibold mb-4"
                style={{background: 'linear-gradient(90deg, #1F4B88, #245AA3)'}}
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
                  <ul className="space-y-2 mb-4 text-sm sm:text-base text-gray-800">
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>For brand new mobiles and laptops</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Device purchase must be from an authorised channel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Device age at activation: up to 6 months</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Guaranteed buyback value up to 70% as per slabs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Claim journey is fully digital with doorstep pickup</span>
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                    <Link href="/buy-bbg">
                      <Button 
                        className="bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-6 rounded-lg font-semibold text-sm"
                        data-testid="button-buy-bbg-card"
                      >
                        Buy BBG
                      </Button>
                    </Link>
                    <Link href="/claim-bbg">
                      <Button 
                        className="bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-6 rounded-lg font-semibold text-sm"
                        data-testid="button-claim-bbg-card"
                      >
                        Claim BBG
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              </div>
            </div>

            {/* Extend+ Card */}
            <div className="flex-1" style={{borderRadius: '35px', padding: '1px', background: 'radial-gradient(circle at 50% 50%, #c6d8ff, #0f5eb4, #303e59)', height: 'fit-content'}}>
              <div className="p-4 sm:p-6 bg-white" style={{borderRadius: '35px'}}>
              <p className="text-gray-900 text-base sm:text-lg font-normal mb-4 leading-relaxed">
                <strong>Extend+</strong> is for devices that are already in use. It gives you one free repair on service charges and doorstep auction support so that when you sell, you get a better price than local offers.
              </p>
              
              <Button 
                className="text-white px-6 py-2 rounded-full font-semibold mb-4"
                style={{background: 'linear-gradient(90deg, #1F4B88, #245AA3)'}}
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
                  <ul className="space-y-2 mb-4 text-sm sm:text-base text-gray-800">
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>For mobiles and laptops already in use</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Device age at activation: up to 3 years</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>One free device repair where service charges are waived</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Doorstep auction help with 10 to 20% better price than competition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">•</span>
                      <span>Designed to extend life and boost resale value</span>
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                    <Link href="/buy-extend">
                      <Button 
                        className="bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-6 rounded-lg font-semibold text-sm"
                        data-testid="button-buy-extend-card"
                      >
                        Buy Extend+
                      </Button>
                    </Link>
                    <Link href="/claim-extend">
                      <Button 
                        className="bg-gray-800 hover:bg-gray-900 text-white py-1.5 px-6 rounded-lg font-semibold text-sm"
                        data-testid="button-claim-extend-card"
                      >
                        Claim Extend+
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How the plan works? Section */}
      <section className="bg-white" style={{paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            <div className="w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
            <h2 className="text-center whitespace-nowrap" style={{fontSize: '50px', color: '#303e58', fontFamily: 'Poppins, sans-serif', fontWeight: '900', letterSpacing: '-0.42px', lineHeight: '1.22'}}>
              How the plan<br />works?
            </h2>
            <div className="w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
          </div>
        </div>
      </section>

      {/* How the plan works - Steps Section */}
      <section className="bg-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
            {/* BBG Column */}
            <div className="max-w-xl w-full">
              <h3 className="text-center font-black text-blue-700 mb-6" style={{color: '#274797', fontSize: '2.4rem', lineHeight: '2'}}>
                BUY BACK GUARANTEE
              </h3>
              <div className="space-y-12">
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#0771de', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">1. Buy BBG:</span> <span className="font-normal">Activate BBG within 6 months of purchasing your mobile or laptop.</span>
                  </p>
                </div>
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#1F4B88', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">2. Register device:</span> <span className="font-normal">Enter voucher code, IMEI or serial number, and upload your invoice on the BBG portal.</span>
                  </p>
                </div>
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#0771de', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">3. Usage:</span> <span className="font-normal">Keep the device functional and retain the box and basic accessories.</span>
                  </p>
                </div>
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#1F4B88', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">4. Raise claim:</span> <span className="font-normal">When upgrading, log in, request a claim, complete doorstep QC, and receive your assured value.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Extend+ Column */}
            <div className="max-w-xl w-full">
              <h3 className="text-center font-black text-blue-700 mb-6" style={{color: '#274797', fontSize: '2.4rem', lineHeight: '2'}}>
                EXTEND+
              </h3>
              <div className="space-y-12">
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#245AA3', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">1. Buy Extend+:</span> <span className="font-normal">Choose Extend+ for your mobile or laptop up to 3 years old.</span>
                  </p>
                </div>
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#0771de', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">2. Register device:</span> <span className="font-normal">Upload device details, invoice, and ID proof on the portal to activate coverage.</span>
                  </p>
                </div>
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#245AA3', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">3. Use free repair:</span> <span className="font-normal">Book a visit when needed and get service charges waived as per the plan.</span>
                  </p>
                </div>
                <div className="relative p-4 sm:p-6 rounded-2xl text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: `url('${planWorksBackgroundImg}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  <div className="absolute inset-0" style={{backgroundColor: '#0771de', opacity: 0.93}}></div>
                  <p className="text-lg sm:text-xl relative z-10" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}>
                    <span className="font-bold">4. Use auction support:</span> <span className="font-normal">Request doorstep auction help and secure a 10-20% better resale price.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan pricing and coverage Section */}
      <section className="bg-white" style={{paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            <div className="w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
            <h2 className="text-center whitespace-nowrap" style={{fontSize: '50px', color: '#303e58', fontFamily: 'Poppins, sans-serif', fontWeight: '900', letterSpacing: '-0.42px', lineHeight: '1.22'}}>
              Plan pricing and<br />coverage
            </h2>
            <div className="w-48" style={{height: '0.125rem', backgroundColor: '#303e58'}}></div>
          </div>
        </div>
      </section>
      
      {/* What is XtraCover BBG Section */}
      <section className="py-6 sm:py-8 lg:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Full Width Title */}
          <div className="text-left mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-[32px] lg:text-[40px] font-bold text-xtra-primary leading-tight">
              What is XtraCover Buyback Guarantee (BBG)?
            </h2>
          </div>
          
          {/* Two Column Layout: Text Left, Video Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Content - Text and Buttons */}
            <div className="flex flex-col justify-center">
              <p className="text-sm sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                BuyBack Guarantee (BBG) is a plan that locks the future resale value of your phone or laptop at the time of purchase. Instead of losing money to fast depreciation, BBG secures up to 70% of your device's price upfront. When it's time to upgrade, you get instant cash to your bank or UPI after a simple quality check. BBG makes owning and upgrading your device smarter, safer, and worry-free.
              </p>
              
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-xtra-primary mb-3 sm:mb-4">
                Lock Your Device's Value Before it drops
              </h3>
              <p className="text-sm sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                With BuyBack Guarantee, secure up to 70% resale value for your mobile or laptop. Fixed upfront, hassle-free, and ready to redeem whenever you upgrade. Trusted by thousands across India.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/buy-bbg" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg"
                    data-testid="button-buy-bbg"
                  >
                    Buy BBG
                  </Button>
                </Link>
                <Link href="/claim-bbg" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg"
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
      <section className="py-4 sm:py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          {/* First Title */}
          <div className="bg-xtra-primary rounded-2xl py-4 sm:py-8 px-4 sm:px-8 text-center">
            <h3 className="text-base sm:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
              Your device starts losing value the moment you<br />
              buy it. BBG protects you from that.
            </h3>
          </div>
          
          {/* Second Title */}
          <div className="bg-xtra-primary rounded-2xl py-4 sm:py-8 px-4 sm:px-8 text-center">
            <h3 className="text-base sm:text-2xl lg:text-3xl font-bold text-white">
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
                <h4 className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900 text-right">
                  You register your device once
                </h4>
                <div className="absolute top-1/2 -translate-y-1/2 z-10" style={{left: '-0.1rem'}}>
                  <div className="w-28 h-28 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
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
                <h4 className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900 text-left">
                  Your resale value is upfront
                </h4>
                <div className="absolute top-1/2 -translate-y-1/2 z-10" style={{right: '1rem'}}>
                  <div className="w-28 h-28 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
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
                <h4 className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900 text-right">
                  We pick it up right from your doorstep
                </h4>
                <div className="absolute top-1/2 -translate-y-1/2 z-10" style={{left: '-0.1rem'}}>
                  <div className="w-28 h-28 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
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
                <h4 className="text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900 text-left">
                  You get paid instantly
                </h4>
                <div className="absolute top-1/2 -translate-y-1/2 z-10" style={{right: '0.5rem'}}>
                  <div className="w-28 h-28 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-xtra-primary/20 rounded-3xl flex items-center justify-center p-2">
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
      
      {/* Acer Special Offer Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Link href="/acer" className="block">
              <div className="rounded-2xl px-8 py-6 text-white shadow-xl overflow-hidden relative cursor-pointer transition-transform hover:scale-105" style={{background: 'linear-gradient(180deg, #4A90E2 0%, #1E3A8A 100%)'}}>
                
                {/* Special Offer Ribbon Image */}
                <div className="absolute top-0 left-0 z-10">
                  <img 
                    src={specialOfferRibbon} 
                    alt="Special Offer" 
                    className="w-28 h-28 sm:w-40 sm:h-40 object-contain"
                  />
                </div>

                {/* Mobile Layout */}
                <div className="flex flex-col sm:hidden pl-16 space-y-3">
                  {/* For Acer Users - Top */}
                  <div className="text-center" style={{fontFamily: 'Inter, sans-serif'}}>
                    <span className="text-base font-bold">For </span>
                    <span className="text-2xl force-bold-android">ACER </span>
                    <span className="text-base font-bold italic">Users</span>
                  </div>
                  
                  {/* Features - Below */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-xs font-medium whitespace-nowrap">Same assured buyback protection</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-xs font-medium">Coverage for up to 5 years</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-xs font-medium">Quick settlement on claim</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between pl-8">
                  
                  {/* Center Content - Features */}
                  <div className="flex-1 flex justify-center">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-lg font-medium whitespace-nowrap">Same assured buyback protection</span>
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
                    <div className="text-5xl force-bold-android mb-1">ACER</div>
                    <div className="text-2xl font-bold italic">Users</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Why People Choose BBG & Extend+ Section */}
      <section className="py-6 sm:py-8 lg:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img 
                src={whyChooseBbgIcon} 
                alt="Why Choose BBG Icons" 
                className="w-64 sm:w-96 h-auto object-contain"
              />
            </div>
            
            {/* Title */}
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold text-xtra-primary leading-tight mb-8 sm:mb-12">
              Why People Choose BBG & Extend+?
            </h2>
            
            {/* BBG Section */}
            <div className="mb-8 sm:mb-12">
              {/* BBG Header */}
              <div className="border-2 border-xtra-primary rounded-lg px-3 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 w-full max-w-none">
                <h3 className="text-sm sm:text-2xl font-medium text-xtra-primary">
                  For BuyBack Guarantee (BBG - Devices &lt; 6 months)
                </h3>
              </div>
              
              {/* BBG Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Assured returns - your payout is locked on day one
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Best value in India - higher buyback than any other option
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Simple process - claim is doorstep pickup + instant payment
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Trusted brand - already chosen by thousands across the country
                  </p>
                </div>
              </div>
            </div>
            
            {/* Extend+ Section */}
            <div>
              {/* Extend+ Header */}
              <div className="border-2 border-xtra-primary rounded-lg px-3 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 w-full max-w-none">
                <h3 className="text-sm sm:text-2xl font-medium text-xtra-primary">
                  For Extend+ (Devices &gt; 6 months)
                </h3>
              </div>
              
              {/* Extend+ Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Free Auction Service - get 10-20% higher resale value than market
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    1 Free Device Repair - service charges waived (parts chargeable)
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Valid for 24 months, keeping older devices valuable longer
                  </p>
                </div>
                <div className="bg-xtra-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-lg">
                  <p className="font-medium text-xs sm:text-lg">
                    Hassle-free, designed to extend your device's life & value
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* BBG Depreciation Slabs Section */}
      <section className="py-6 sm:py-8 lg:py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
          </div>

          {isSlabsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-xtra-primary" />
            </div>
          ) : (
            <div className="space-y-8 w-full">
              
              {/* Mobile Devices Grid */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-xtra-primary to-xtra-primary/80 text-white px-4 sm:px-6 py-4 sm:py-6">
                  <h3 className="text-lg sm:text-2xl font-bold flex items-center">
                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                    Mobile Devices
                  </h3>
                  <p className="text-white/90 mt-1 sm:mt-2 text-xs sm:text-base">BBG claim values based on device age</p>
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
                <div className="bg-gradient-to-r from-xtra-primary to-xtra-primary/80 text-white px-4 sm:px-6 py-4 sm:py-6">
                  <h3 className="text-lg sm:text-2xl font-bold flex items-center">
                    <Laptop className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                    Laptop Devices
                  </h3>
                  <p className="text-white/90 mt-1 sm:mt-2 text-xs sm:text-base">BBG claim values based on device age</p>
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
                <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What is BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    BBG (BuyBack Guarantee) is for devices less than 6 months old. It locks your resale value upfront — up to 70% of your invoice price. When you sell, we pick it up and pay you instantly.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What is Extend+?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Extend+ is for devices more than 6 months old. It gives:<br/>
                    Free Auction Service → sell from home & get 10–20% higher resale value<br/>
                    1 Free Repair → service charges waived (parts extra)<br/>
                    Valid for 24 months.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Who can buy these plans?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Anyone with a valid invoice for their phone or laptop.<br/>
                    BBG → for new devices (&lt;6 months)<br/>
                    Extend+ → for older devices (&gt;6 months)
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    How much will I get with BBG?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    It depends on how old the device is when you sell:<br/><br/>
                    <strong>Mobiles</strong><br/>
                    4–6 months → 70% back<br/>
                    7–9 months → 60% back<br/>
                    10–12 months → 50% back<br/>
                    13–15 months → 40% back<br/>
                    16–18 months → 30% back<br/><br/>
                    <strong>Laptop</strong><br/>
                    Similar percentages apply based on device age.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if my phone has scratches?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Small scratches are okay. The device just needs to be in working condition.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What if my device fails BBG checks?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    No problem — you can still sell it through Extend+ Auction Service at market value.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-7" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    What repairs are included in Extend+?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    One free repair service during plan validity. You only pay for parts if needed.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-8" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    How do I get my money?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    We pay directly to your bank or UPI at the time of pickup/claim.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-9" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Can I transfer my plan to someone else?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    No, the plan stays with the device you registered.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-10" className="border border-gray-200 rounded-lg px-3 sm:px-6">
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-lg text-gray-900 hover:text-xtra-primary">
                    Why should I choose BBG or Extend+?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xs sm:text-base pt-2 pb-4">
                    Because you either:<br/>
                    Lock your resale value upfront (BBG)<br/>
                    Or get better resale + free repair for older devices (Extend+)
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>
      {/* Distributor CTA Section */}
      <section className="py-4 sm:py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border-l-4" style={{ borderLeftColor: (theme as any)?.primaryColor || '#254696' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-base sm:text-2xl font-bold mb-1 sm:mb-2 text-gray-900">Join Our Referral Program</h2>
                <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-0">Start earning ₹25 commission on every successful BBG registration. Easy setup and regular payouts.</p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/referral-partner-registration">
                  <Button className="text-white hover:opacity-90 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-base font-semibold" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
                    Join Program <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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
