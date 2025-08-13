import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Smartphone, Home, Download, Info } from "lucide-react";

// Brand-Specific Claim Values Component
function BrandClaimValues({ sessionData }: { sessionData: any }) {
  if (!sessionData?.registrationSlabData?.slabs || sessionData.registrationSlabData.slabs.length === 0) {
    return null;
  }

  // Extract and deduplicate slabs by age range, keeping the most recent entry for each range
  const uniqueSlabs = sessionData.registrationSlabData.slabs.reduce((acc: any, slab: any) => {
    const key = `${slab.minMonths}-${slab.maxMonths}`;
    if (!acc[key] || new Date(slab.updatedAt) > new Date(acc[key].updatedAt)) {
      acc[key] = slab;
    }
    return acc;
  }, {} as Record<string, any>);

  const slabs = Object.values(uniqueSlabs).sort((a: any, b: any) => a.minMonths - b.minMonths);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Info className="h-5 w-5 mr-2 text-xtra-primary" />
        Your {sessionData.brand} {sessionData.deviceType} - BuyBack Guarantee Values
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {slabs.map((slab: any, index: number) => {
          // Determine color based on percentage
          let colorClass = "text-green-600";
          if (slab.percentage < 30) colorClass = "text-xtra-primary";
          else if (slab.percentage < 50) colorClass = "text-orange-600";
          else if (slab.percentage < 70) colorClass = "text-yellow-600";

          return (
            <div key={index} className="bg-white rounded-lg p-3 text-center border border-gray-200">
              <div className="text-sm font-medium text-gray-600">
                {slab.minMonths}-{slab.maxMonths} months
              </div>
              <div className={`text-lg font-bold ${colorClass}`}>
                {slab.percentage}%
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 mt-3">
        * Percentage of original invoice value you'll receive when claiming BBG for your {sessionData.brand} device
      </p>
    </div>
  );
}

export default function ThankYou() {
  const [location] = useLocation();
  const [params, setParams] = useState<URLSearchParams>();
  const [sessionData, setSessionData] = useState<any>(null);

  // Try to get data from session first
  const { data: thankYouData } = useQuery({
    queryKey: ['/api/thank-you-data'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/thank-you-data');
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    setParams(searchParams);
  }, [location]);

  useEffect(() => {
    if (thankYouData) {
      setSessionData(thankYouData);
      // Store in localStorage for persistence across page refreshes
      localStorage.setItem('thankYouData', JSON.stringify(thankYouData));
      // Also store timestamp to handle expiry (24 hours)
      localStorage.setItem('thankYouDataTimestamp', Date.now().toString());
    } else {
      // Check localStorage first (persists across refreshes)
      const storedData = localStorage.getItem('thankYouData');
      const storedTimestamp = localStorage.getItem('thankYouDataTimestamp');
      
      if (storedData && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Check if data is still valid (less than 24 hours old)
        if (now - timestamp < twentyFourHours) {
          try {
            const parsedData = JSON.parse(storedData);
            setSessionData(parsedData);
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
            // Clear invalid data
            localStorage.removeItem('thankYouData');
            localStorage.removeItem('thankYouDataTimestamp');
          }
        } else {
          // Data is expired, clear it
          localStorage.removeItem('thankYouData');
          localStorage.removeItem('thankYouDataTimestamp');
        }
      } else {
        // Fallback to sessionStorage (for backward compatibility)
        const sessionStoredData = sessionStorage.getItem('thankYouData');
        if (sessionStoredData) {
          try {
            const parsedData = JSON.parse(sessionStoredData);
            setSessionData(parsedData);
            // Move to localStorage for persistence
            localStorage.setItem('thankYouData', sessionStoredData);
            localStorage.setItem('thankYouDataTimestamp', Date.now().toString());
            // Clear session storage after moving to localStorage
            sessionStorage.removeItem('thankYouData');
          } catch (error) {
            console.error('Error parsing session storage data:', error);
          }
        }
      }
    }
  }, [thankYouData]);

  // Use session data if available, otherwise fall back to URL parameters
  const type = sessionData?.type || params?.get('type');
  const sellerCode = sessionData?.sellerCode || params?.get('sellerCode');
  const voucherCode = sessionData?.voucherCode || params?.get('voucherCode');
  const paymentMethod = sessionData?.paymentMethod || params?.get('paymentMethod');

  const handleDownloadInvoice = () => {
    // Generate and download BBG purchase invoice
    const invoiceData = {
      voucherCode,
      date: new Date().toLocaleDateString(),
      amount: '₹99', // This should come from actual payment data
      service: 'BuyBack Guarantee Registration'
    };
    
    // Create a simple invoice content
    const invoiceContent = `
XTRACOVER BBG INVOICE
=====================
Date: ${invoiceData.date}
BBG Voucher Code: ${invoiceData.voucherCode}
Service: ${invoiceData.service}
Amount Paid: ${invoiceData.amount}

Thank you for choosing Xtracover BBG!
Contact: support@xtracover.com
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BBG_Invoice_${voucherCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getContent = () => {
    switch (type) {
      case 'distributor':
        return {
          icon: <Users className="h-16 w-16 text-blue-600" />,
          title: "Welcome to Xtracover Network!",
          subtitle: "Referral Partner Registration Successful",
          message: "You are now part of our trusted referral partner network. Start promoting BBG and earn ₹25 commission on every successful registration.",
          code: sellerCode,
          codeLabel: "Your Referral Code:",
          details: [
            "Share your referral code with customers during registration",
            "Track your commission earnings through our portal",
            "Get dedicated support for all referral partner queries",
            "Monthly commission payments to your registered account"
          ]
        };
      case 'customer':
        return {
          icon: <Smartphone className="h-16 w-16 text-green-600" />,
          title: "Registration Successful!",
          subtitle: "BBG Registration Complete",
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
                <p className="text-3xl font-bold text-xtra-primary font-mono tracking-wider">
                  {content.code}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Please save this code for future reference
                </p>
              </div>
            )}

            {/* Show Brand-Specific Claim Values for Customer Registrations */}
            {type === 'customer' && <BrandClaimValues sessionData={sessionData} />}

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
                <Button className="bg-xtra-primary hover:bg-xtra-primary/90 px-6">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              
              {type === 'customer' && voucherCode && (
                <Button 
                  onClick={handleDownloadInvoice}
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50 px-6"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              )}
              
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
