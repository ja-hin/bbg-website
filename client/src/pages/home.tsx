import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Laptop, 
  Shield, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">


      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Protect Your Investment with 
            <span className="text-red-600 block sm:inline"> BuyBack Guarantee</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
            Get assured returns on your laptops and mobiles. Join thousands of satisfied customers 
            who trust Xtracover for comprehensive device protection.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link href="/customer-registration" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                Buy BBG <ArrowRight className="ml-2 h-4 h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/claim-bbg" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                Claim BBG
              </Button>
            </Link>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
            <Card className="p-6 sm:p-8 border-2 border-red-200 hover:border-red-400 transition-colors">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Laptop className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Laptop BBG</h3>
                <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">₹125</div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">(inclusive of GST)</p>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Complete protection for your laptop investment</p>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 70% buyback value
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    60-month coverage period
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Free pickup service
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Mobile BBG</h3>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">₹99</div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">(inclusive of GST)</p>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Complete protection for your mobile device</p>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Up to 70% buyback value
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    60-month coverage period
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Fast payment in 7 days
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Xtracover BBG?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              We provide the most comprehensive and reliable buyback guarantee program in the market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Guaranteed Returns</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Get assured returns based on your device condition and age. No hidden terms or conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Best Market Value</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  We offer the highest buyback percentages in the market with transparent pricing slabs.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
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

          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="py-4 px-4 sm:px-6 text-left font-semibold text-sm sm:text-base">Device Age</th>
                    <th className="py-4 px-4 sm:px-6 text-left font-semibold text-sm sm:text-base">Claim Percentage</th>
                    <th className="py-4 px-4 sm:px-6 text-left font-semibold text-sm sm:text-base">Condition Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">6-12 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-green-600">70%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">13-18 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-green-600">60%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">19-24 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-yellow-600">50%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">25-30 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-yellow-600">40%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">31-36 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-orange-600">30%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">37-48 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-orange-600">20%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-gray-900">49-60 months</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-lg sm:text-xl font-bold text-red-600">10%</span>
                      <span className="text-sm text-gray-500 ml-2">of invoice value</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-sm sm:text-base text-gray-600">Functional and fair condition</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>Note:</strong> BBG Pricing & Depreciation slabs are subject to monthly review. However, slabs are locked as per your purchase date/time and mapped to your unique BBG Voucher.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/customer-registration">
                    <Button size="sm" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/claim-bbg">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50">
                      Claim BBG
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <Card className="p-4 sm:p-6 text-center">
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">6-60</div>
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

      {/* Distributor CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Join Our Referral Program</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Join our referral partner network and start earning commissions on every successful BBG registration. 
            Easy setup, dedicated support, and regular payouts.
          </p>
          <Link href="/referral-partner-registration" className="inline-block w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-red-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
              Join Referral Program <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
