import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/distributor-registration" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm hover:border-red-300 transition-colors">
              Distributor Registration
            </Link>
            <Link href="/customer-registration" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm hover:border-red-300 transition-colors">
              Customer Registration
            </Link>
            <Link href="/claim-bbg" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm hover:border-red-300 transition-colors">
              Claim BBG
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Protect Your Investment with 
            <span className="text-red-600"> BuyBack Guarantee</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Get assured returns on your laptops and mobiles. Join thousands of satisfied customers 
            who trust Xtracover for comprehensive device protection.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/customer-registration">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold">
                Buy and Register <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/claim-bbg">
              <Button variant="outline" size="lg" className="border-red-600 text-red-600 hover:bg-red-50 px-8 py-4 text-lg font-semibold">
                Claim BBG
              </Button>
            </Link>
          </div>

          {/* Product Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-red-200 hover:border-red-400 transition-colors">
              <CardContent className="text-center p-0">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Laptop className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Laptop BBG</h3>
                <div className="text-4xl font-bold text-red-600 mb-4">₹125</div>
                <p className="text-gray-600 mb-6">Complete protection for your laptop investment</p>
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

            <Card className="p-8 border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardContent className="text-center p-0">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Mobile BBG</h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">₹99</div>
                <p className="text-gray-600 mb-6">Complete protection for your mobile device</p>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Xtracover BBG?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the most comprehensive and reliable buyback guarantee program in the market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Guaranteed Returns</h3>
                <p className="text-gray-600">
                  Get assured returns based on your device condition and age. No hidden terms or conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Best Market Value</h3>
                <p className="text-gray-600">
                  We offer the highest buyback percentages in the market with transparent pricing slabs.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Trusted Network</h3>
                <p className="text-gray-600">
                  Join our network of verified distributors and satisfied customers across the country.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Distributor CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Become a BBG Distributor</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our distributor network and start earning commissions on every successful BBG registration. 
            Easy setup, dedicated support, and regular payouts.
          </p>
          <Link href="/distributor-registration">
            <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Register as Distributor <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
