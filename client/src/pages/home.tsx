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
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Protect Your Investment with 
            <span className="text-xtra-primary block sm:inline"> BuyBack Guarantee</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">Get assured buyback value for your laptops and mobiles — transparent, fixed at registration, and redeemable when you’re ready to upgrade. Trusted by thousands of XtraCover customers across India.</p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link href="/customer-registration" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                Buy <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/claim-bbg" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-xtra-primary text-xtra-primary hover:bg-xtra-primary/5 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                Claim BBG
              </Button>
            </Link>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
            <Card className="p-6 sm:p-8 border-2 border-xtra-primary/20 hover:border-xtra-primary/40 transition-colors">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-xtra-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Laptop className="h-8 w-8 sm:h-10 sm:w-10 text-xtra-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Laptop BBG</h3>
                <div className="text-3xl sm:text-4xl font-bold text-xtra-primary mb-2">
                  {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : `₹${bbgPrices?.laptop || 299}`}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">(inclusive of GST)</p>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Assured buyback value for your Laptop</p>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 60% payout value
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Coverage for up to 60 months
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Free doorstep pickup for claims
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Instant payouts at the time of device handover
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-xtra-primary/20 hover:border-xtra-primary/40 transition-colors">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-xtra-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-xtra-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Mobile BBG</h3>
                <div className="text-3xl sm:text-4xl font-bold text-xtra-primary mb-2">
                  {pricesLoading ? <Loader2 className="h-8 w-8 animate-spin inline" /> : `₹${bbgPrices?.mobile || 99}`}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">(inclusive of GST)</p>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Assured buyback value for your Mobile</p>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 70% payout value
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Coverage for up to 18 months
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Free doorstep pickup for claims
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Instant payouts at the time of device handover
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Acer BBG Section */}
      <section className="py-12 sm:py-16 xtra-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Acer Device Protection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Special BBG registration for Acer users. Register your Acer devices and get the same amazing protection with up to 70% payout value.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
                  Register Your Acer Device
                </h3>
                <ul className="space-y-3 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Register your BBG purchased on Acer Store
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    70% maximum payout value
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    5-year coverage period
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Instant settlement upon device handover
                  </li>
                </ul>
                <Link href="/acer">
                  <Button className="w-full sm:w-auto xtra-gradient hover:opacity-90 text-white px-8 py-3 text-lg font-semibold">
                    Register Acer Device <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 xtra-gradient-light rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <Laptop className="h-16 w-16 text-xtra-primary mx-auto mb-2" />
                      <Smartphone className="h-12 w-12 text-xtra-secondary mx-auto" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </section>
      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose <span className="text-xtra-primary">XtraCover BBG?</span></h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              We provide the most comprehensive and reliable buyback guarantee program in the market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-xtra-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-xtra-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Guaranteed Returns</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Get assured returns based on your device condition and age. No hidden terms or conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-xtra-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-xtra-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Best Market Value</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  We offer the highest buyback percentages in the market with transparent pricing slabs.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-xtra-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-xtra-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Trusted Network</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Join our network of verified referral partners and satisfied customers across the country.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* BBG Depreciation Slabs Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              BBG Claim Value Slabs
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Transparent pricing based on your device age. Know exactly what you'll get when you claim your BBG.
            </p>
          </div>

          {isSlabsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-xtra-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
              
              {/* Mobile Devices Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-xtra-primary text-white px-6 py-4">
                  <h3 className="text-xl font-bold flex items-center">
                    <Smartphone className="w-6 h-6 mr-2" />
                    Mobile Devices
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    // Get actual brands from the data (from logs: Apple, OnePlus, Realme, Samsung, Xiaomi)
                    const mobileBrands = Array.from(new Set(activeMobileSlabs.map((slab: any) => slab.brand).filter(Boolean))).sort();
                    
                    if (mobileBrands.length === 0) {
                      return (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">No mobile device slabs available</p>
                        </div>
                      );
                    }

                    // Group mobile slabs by age range for brand comparison
                    const ageRanges: { [key: string]: any } = {};
                    
                    activeMobileSlabs.forEach((slab: any) => {
                      const ageKey = `${slab.minMonths}-${slab.maxMonths}`;
                      if (!ageRanges[ageKey]) {
                        ageRanges[ageKey] = {
                          minMonths: slab.minMonths,
                          maxMonths: slab.maxMonths,
                          brands: {}
                        };
                      }
                      
                      // Add brand-specific percentage
                      if (slab.brand) {
                        ageRanges[ageKey].brands[slab.brand] = slab.percentage;
                      }
                    });

                    // Sort age ranges by minMonths
                    const sortedAgeRanges = Object.entries(ageRanges).sort(
                      ([, a], [, b]) => a.minMonths - b.minMonths
                    );

                    return (
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left font-semibold text-sm text-gray-700">Device Age</th>
                            {mobileBrands.map(brand => (
                              <th key={brand} className="py-3 px-4 text-center font-semibold text-sm text-gray-700">{brand}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sortedAgeRanges.map(([ageKey, ageData]) => (
                            <tr key={ageKey} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {ageData.minMonths}-{ageData.maxMonths} months
                              </td>
                              {mobileBrands.map(brand => {
                                const percentage = ageData.brands[brand];
                                if (!percentage) return <td key={brand} className="py-3 px-4 text-center text-gray-400">-</td>;
                                
                                return (
                                  <td key={brand} className="py-3 px-4 text-center">
                                    <span className="text-lg font-bold text-black">{percentage}%</span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              {/* Laptop Devices Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-xtra-primary text-white px-6 py-4">
                  <h3 className="text-xl font-bold flex items-center">
                    <Laptop className="w-6 h-6 mr-2" />
                    Laptop Devices
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    // Get actual brands from the data (from logs: Acer, Apple, Asus, Dell, HP, Lenovo)
                    const laptopBrands = Array.from(new Set(activeLaptopSlabs.map((slab: any) => slab.brand).filter(Boolean))).sort();
                    
                    if (laptopBrands.length === 0) {
                      return (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">No laptop device slabs available</p>
                        </div>
                      );
                    }

                    // Group laptop slabs by age range for brand comparison
                    const ageRanges: { [key: string]: any } = {};
                    
                    activeLaptopSlabs.forEach((slab: any) => {
                      const ageKey = `${slab.minMonths}-${slab.maxMonths}`;
                      if (!ageRanges[ageKey]) {
                        ageRanges[ageKey] = {
                          minMonths: slab.minMonths,
                          maxMonths: slab.maxMonths,
                          brands: {}
                        };
                      }
                      
                      // Add brand-specific percentage
                      if (slab.brand) {
                        ageRanges[ageKey].brands[slab.brand] = slab.percentage;
                      }
                    });

                    // Sort age ranges by minMonths
                    const sortedAgeRanges = Object.entries(ageRanges).sort(
                      ([, a], [, b]) => a.minMonths - b.minMonths
                    );

                    return (
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left font-semibold text-sm text-gray-700">Device Age</th>
                            {laptopBrands.map(brand => (
                              <th key={brand} className="py-3 px-4 text-center font-semibold text-sm text-gray-700">{brand}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sortedAgeRanges.map(([ageKey, ageData]) => (
                            <tr key={ageKey} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {ageData.minMonths}-{ageData.maxMonths} months
                              </td>
                              {laptopBrands.map(brand => {
                                const percentage = ageData.brands[brand];
                                if (!percentage) return <td key={brand} className="py-3 px-4 text-center text-gray-400">-</td>;
                                
                                return (
                                  <td key={brand} className="py-3 px-4 text-center">
                                    <span className="text-lg font-bold text-black">{percentage}%</span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                  <strong>Note:</strong> All percentages are of invoice value for your devices in functional and fair condition. Your slabs are locked as per your purchase date/time and mapped to your unique BBG Voucher. 
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/customer-registration">
                    <Button size="sm" className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white">Buy</Button>
                  </Link>
                  <Link href="/claim-bbg">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto border-xtra-primary text-xtra-primary hover:bg-xtra-primary/5">Claim</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <Card className="p-4 sm:p-6 text-center">
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold text-xtra-primary mb-2">Upto 36 Months</div>
                <p className="text-sm sm:text-base text-gray-600">Months coverage period</p>
              </CardContent>
            </Card>
            
            <Card className="p-4 sm:p-6 text-center">
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">70%</div>
                <p className="text-sm sm:text-base text-gray-600">Maximum claim value</p>
              </CardContent>
            </Card>
            
            <Card className="p-4 sm:p-6 text-center">
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">100%</div>
                <p className="text-sm sm:text-base text-gray-600">Transparent pricing</p>
              </CardContent>
            </Card>
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
