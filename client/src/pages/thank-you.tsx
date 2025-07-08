import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Smartphone, Home } from "lucide-react";

export default function ThankYou() {
  const [location] = useLocation();
  const [params, setParams] = useState<URLSearchParams>();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    setParams(searchParams);
  }, [location]);

  const type = params?.get('type');
  const sellerCode = params?.get('sellerCode');
  const voucherCode = params?.get('voucherCode');

  const getContent = () => {
    switch (type) {
      case 'distributor':
        return {
          icon: <Users className="h-16 w-16 text-blue-600" />,
          title: "Welcome to Xtracover Network!",
          subtitle: "Distributor Registration Successful",
          message: "You are now part of our trusted distributor network. Start promoting BBG and earn ₹25 commission on every successful registration.",
          code: sellerCode,
          codeLabel: "Your Seller Code:",
          details: [
            "Share your seller code with customers during registration",
            "Track your commission earnings through our portal",
            "Get dedicated support for all distributor queries",
            "Monthly commission payments to your registered account"
          ]
        };
      case 'customer':
        return {
          icon: <Smartphone className="h-16 w-16 text-green-600" />,
          title: "Registration Successful!",
          subtitle: "Your BBG is Being Processed",
          message: "Thank you for choosing Xtracover BBG. Your device is now protected with our comprehensive buyback guarantee.",
          code: voucherCode,
          codeLabel: "Your BBG Voucher Code:",
          details: [
            "Confirmation email sent to your registered email address",
            "BBG will be activated within 24-48 hours after verification",
            "Keep your voucher code safe for future claims",
            "Contact support for any queries or assistance"
          ]
        };
      default:
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: "Thank You!",
          subtitle: "Process Completed Successfully",
          message: "Your request has been processed successfully.",
          code: null,
          codeLabel: "",
          details: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {content.icon}
            </div>

            {/* Title and Subtitle */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{content.title}</h1>
            <h2 className="text-xl text-gray-600 mb-6">{content.subtitle}</h2>

            {/* Message */}
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              {content.message}
            </p>

            {/* Code Display */}
            {content.code && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">{content.codeLabel}</p>
                <p className="text-3xl font-bold text-red-600 font-mono tracking-wider">
                  {content.code}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Please save this code for future reference
                </p>
              </div>
            )}

            {/* Details List */}
            {content.details.length > 0 && (
              <div className="text-left mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  What's Next?
                </h3>
                <div className="bg-blue-50 rounded-lg p-6">
                  <ul className="space-y-3">
                    {content.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-blue-800">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-red-600 hover:bg-red-700 px-6">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              
              {type === 'distributor' && (
                <Link href="/customer-registration">
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 px-6">
                    Help Customers Register
                  </Button>
                </Link>
              )}
              
              {type === 'customer' && (
                <Link href="/claim-bbg">
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 px-6">
                    Claim BBG
                  </Button>
                </Link>
              )}
            </div>

            {/* Contact Information */}
            <div className="mt-12 pt-8 border-t">
              <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Email Support</p>
                  <p>support@xtracover.com</p>
                </div>
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p>+91 98765 43210</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
