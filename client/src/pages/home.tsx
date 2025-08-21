import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  HelpCircle,
  Star,
  Phone,
  Clock,
  IndianRupee,
  Target,
  Zap,
  Globe,
  HeadphonesIcon
} from "lucide-react";
import heroBannerImage from "@assets/generated_images/BBG_hero_banner_background_f6fe0fae.png";
import processInfographicImage from "@assets/generated_images/BBG_process_infographic_c03b3505.png";

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
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBannerImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/60"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          {/* Trust Badge */}
          <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-medium">
            <Star className="h-4 w-4 mr-2" />
            Trusted by 10,000+ customers across India
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            India's #1
            <span className="block text-yellow-400">BuyBack Guarantee</span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal mt-2">for Laptops & Mobiles</span>
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 max-w-4xl mx-auto font-light">
            Guaranteed cash when you're ready to upgrade • Up to <span className="font-bold text-yellow-400">{maxPercentage}% buyback value</span> • Instant payouts
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/customer-registration" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 text-lg font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200">
                Get Protected Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/claim-bbg" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200">
                Claim Your BBG
              </Button>
            </Link>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400">10,000+</div>
              <div className="text-lg">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400">₹2+ Crores</div>
              <div className="text-lg">Payouts Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-400">24-48 Hrs</div>
              <div className="text-lg">Payout Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How BBG Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and guaranteed. Your device protection in 3 easy steps.
            </p>
          </div>
          
          <div className="mb-12">
            <img 
              src={processInfographicImage} 
              alt="BBG Process" 
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-xtra-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Register Your Device</h3>
              <p className="text-gray-600 text-lg">
                Quick 2-minute registration with device details. Get instant confirmation and BBG certificate.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Your Device is Protected</h3>
              <p className="text-gray-600 text-lg">
                Enjoy peace of mind knowing your investment is secured. Fixed buyback value locked-in.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <IndianRupee className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Get Instant Payout</h3>
              <p className="text-gray-600 text-lg">
                Ready to upgrade? Claim your guaranteed amount with doorstep pickup and instant payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Offerings Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Affordable protection plans for all your devices. Start from just ₹{bbgPrices?.mobile || 99}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Laptop BBG Card */}
            <Card className="p-8 border-2 border-xtra-primary/20 hover:border-xtra-primary hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-xtra-primary to-blue-500 text-white px-4 py-2 text-sm font-bold">
                POPULAR
              </div>
              <CardContent className="text-center p-0">
                <div className="w-24 h-24 bg-gradient-to-br from-xtra-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Laptop className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Laptop BBG</h3>
                <div className="text-5xl font-bold text-xtra-primary mb-2">
                  {pricesLoading ? <Loader2 className="h-10 w-10 animate-spin inline" /> : `₹${bbgPrices?.laptop || 299}`}
                </div>
                <p className="text-sm text-gray-500 mb-6">(inclusive of GST)</p>
                <p className="text-gray-600 mb-8 text-lg">Complete protection for your laptop investment</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 60% payout value</span>
                  </div>
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Coverage for up to 60 months</span>
                  </div>
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Free doorstep pickup</span>
                  </div>
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Instant payouts on handover</span>
                  </div>
                </div>

                <Link href="/customer-registration" className="w-full block">
                  <Button className="w-full bg-xtra-primary hover:bg-xtra-primary/90 text-white py-3 text-lg font-semibold">
                    Protect My Laptop
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Mobile BBG Card */}
            <Card className="p-8 border-2 border-gray-200 hover:border-xtra-primary hover:shadow-2xl transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Mobile BBG</h3>
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {pricesLoading ? <Loader2 className="h-10 w-10 animate-spin inline" /> : `₹${bbgPrices?.mobile || 99}`}
                </div>
                <p className="text-sm text-gray-500 mb-6">(inclusive of GST)</p>
                <p className="text-gray-600 mb-8 text-lg">Smart protection for your mobile device</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 60% payout value</span>
                  </div>
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Coverage for up to 36 months</span>
                  </div>
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Free doorstep pickup</span>
                  </div>
                  <div className="flex items-center justify-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Instant payouts on handover</span>
                  </div>
                </div>

                <Link href="/customer-registration" className="w-full block">
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-3 text-lg font-semibold">
                    Protect My Mobile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose BBG Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Why XtraCover BBG?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The only buyback guarantee you can truly trust. Here's what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-xtra-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">100% Guaranteed Payouts</h3>
              <p className="text-gray-600">
                Unlike other schemes, our payouts are guaranteed. No hidden terms, no rejections.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Processing</h3>
              <p className="text-gray-600">
                Claims processed within 24-48 hours. Get your money when you hand over your device.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Pan-India Coverage</h3>
              <p className="text-gray-600">
                Free doorstep pickup available across all major cities and towns in India.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">10,000+ Happy Customers</h3>
              <p className="text-gray-600">
                Join thousands of satisfied customers who've successfully claimed their BBG.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <HeadphonesIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Customer Support</h3>
              <p className="text-gray-600">
                Dedicated support team available round the clock for all your queries.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Trusted Brand</h3>
              <p className="text-gray-600">
                Backed by XtraCover's reputation and ₹2+ crore in successful payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Value Slabs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Transparent Buyback Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Know exactly how much you'll get based on your device age. No surprises, no hidden calculations.
            </p>
          </div>

          {!isSlabsLoading && allSlabs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
                <thead className="bg-gradient-to-r from-xtra-primary to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-bold">Device Age</th>
                    <th className="px-6 py-4 text-center text-lg font-bold">Laptop Payout</th>
                    <th className="px-6 py-4 text-center text-lg font-bold">Mobile Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from(new Set(allSlabs.map((slab: any) => `${slab.minMonths}-${slab.maxMonths}`))).map((range, index) => {
                    const [minMonths, maxMonths] = range.split('-').map(Number);
                    const laptopSlab = activeLaptopSlabs.find((s: any) => s.minMonths === minMonths && s.maxMonths === maxMonths);
                    const mobileSlab = activeMobileSlabs.find((s: any) => s.minMonths === minMonths && s.maxMonths === maxMonths);
                    
                    return (
                      <tr key={range} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="px-6 py-4 text-lg font-semibold text-gray-900">
                          {minMonths} - {maxMonths} months
                        </td>
                        <td className="px-6 py-4 text-center text-lg font-bold text-xtra-primary">
                          {laptopSlab ? `${laptopSlab.percentage}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-lg font-bold text-green-600">
                          {mobileSlab ? `${mobileSlab.percentage}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {isSlabsLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-xtra-primary" />
              <p className="mt-4 text-gray-600">Loading payout information...</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to the most common questions about BBG
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg shadow-md">
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold hover:no-underline">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-xtra-primary" />
                  What is the BuyBack Guarantee (BBG)?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 text-lg">
                BBG gives you a guaranteed cash value for your laptop or mobile when you're ready to upgrade. The percentage is fixed at the time of registration and doesn't change based on market conditions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg shadow-md">
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold hover:no-underline">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-xtra-primary" />
                  How is the buyback value calculated?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 text-lg">
                The buyback value is calculated as a percentage of your device's purchase price, based on its age when you claim. The exact percentage is determined at registration and remains fixed throughout your coverage period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg shadow-md">
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold hover:no-underline">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-xtra-primary" />
                  When can I claim my BBG?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 text-lg">
                You can claim your BBG anytime after the mandatory 3-month waiting period from your device purchase date. The claim window extends up to 60 months for laptops and 36 months for mobiles.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg shadow-md">
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold hover:no-underline">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-xtra-primary" />
                  How do I get paid?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 text-lg">
                Once you schedule a pickup, our team will collect your device and process payment within 24-48 hours. Payment is made directly to your bank account via NEFT/UPI.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg shadow-md">
              <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold hover:no-underline">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-xtra-primary" />
                  Is there any inspection required?
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 text-lg">
                Yes, basic inspection is done to verify the device is genuine and functional. As long as the device powers on and matches the registered details, your claim will be processed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Referral Partner CTA */}
      <section className="py-20 bg-gradient-to-r from-xtra-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Become a BBG Partner
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Earn attractive commissions by referring customers to BBG. Join our growing network of partners across India.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">₹25+</div>
              <div className="text-lg opacity-90">Commission per registration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">1000+</div>
              <div className="text-lg opacity-90">Active partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">24-48 Hrs</div>
              <div className="text-lg opacity-90">Payout processing</div>
            </div>
          </div>

          <Link href="/distributor-registration">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 text-lg font-bold rounded-full shadow-2xl">
              Join as Partner <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Ready to Protect Your Investment?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of smart device owners who chose BBG for guaranteed peace of mind.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/customer-registration" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-xtra-primary hover:bg-xtra-primary/90 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg">
                Get BBG Protection Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/claim-bbg" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-xtra-primary text-xtra-primary hover:bg-xtra-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-full">
                Already Have BBG? Claim Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}