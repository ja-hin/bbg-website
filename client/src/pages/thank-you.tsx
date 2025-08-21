import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import jsPDF from 'jspdf';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Smartphone, Home, Download, Info, AlertCircle, RefreshCw } from "lucide-react";

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

  // Get current BBG pricing for invoice generation
  const { data: bbgPrices } = useQuery({
    queryKey: ['/api/bbg-prices'],
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
  const status = sessionData?.status || params?.get('status') || 'success'; // Default to success for backward compatibility
  const sellerCode = sessionData?.sellerCode || params?.get('sellerCode');
  const voucherCode = sessionData?.voucherCode || params?.get('voucherCode');
  const paymentMethod = sessionData?.paymentMethod || params?.get('paymentMethod');
  const txnid = sessionData?.txnid || params?.get('txnid');
  const error = sessionData?.error || params?.get('error');
  const errorMessage = sessionData?.errorMessage || params?.get('errorMessage');

  const handleDownloadInvoice = () => {
    // Get invoice data from session or URL parameters
    const invoiceData = {
      voucherCode,
      date: new Date().toLocaleDateString('en-IN'),
      customerName: sessionData?.customerName || params?.get('customerName') || 'Customer',
      deviceType: sessionData?.deviceType || params?.get('deviceType') || '',
      brand: sessionData?.brand || params?.get('brand') || '',
      modelName: sessionData?.modelName || params?.get('modelName') || '',
      amount: (() => {
        const deviceType = sessionData?.deviceType || params?.get('deviceType') || '';
        if (bbgPrices && deviceType && 'laptop' in bbgPrices && 'mobile' in bbgPrices) {
          const price = deviceType === 'laptop' ? bbgPrices.laptop : bbgPrices.mobile;
          return `₹${price}`;
        }
        // Fallback to session data or default
        if (sessionData?.paymentMethod === 'payu') {
          return sessionData?.deviceType === 'laptop' ? '₹125' : '₹99';
        }
        return params?.get('deviceType') === 'laptop' ? '₹125' : '₹99';
      })(),
      paymentMethod: sessionData?.paymentMethod || 'Direct Payment',
      txnid: sessionData?.txnid || params?.get('txnid') || 'N/A'
    };

    // Generate PDF invoice
    const doc = new jsPDF();
    
    // Set colors
    const primaryBlue = '#254696';
    const secondaryRed = '#E72829';
    
    // Header with company branding
    doc.setFontSize(20);
    doc.setTextColor(primaryBlue);
    doc.text('XTRACOVER', 20, 25);
    
    doc.setFontSize(14);
    doc.setTextColor(secondaryRed);
    doc.text('BuyBack Guarantee Invoice', 20, 35);
    
    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text('Date: ' + invoiceData.date, 20, 50);
    doc.text('Invoice ID: BBG-' + invoiceData.voucherCode, 20, 58);
    
    // Customer information section
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text('BILL TO:', 20, 75);
    
    doc.setFontSize(10);
    doc.setTextColor('#333333');
    doc.text('Customer Name: ' + invoiceData.customerName, 20, 85);
    if (invoiceData.deviceType && invoiceData.brand) {
      doc.text(`Device: ${invoiceData.brand} ${invoiceData.modelName} (${invoiceData.deviceType})`, 20, 93);
    }
    
    // Service details
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text('SERVICE DETAILS:', 20, 115);
    
    // Create table-like structure
    doc.setFontSize(10);
    doc.setTextColor('#333333');
    doc.text('Description', 20, 130);
    doc.text('BBG Voucher Code', 75, 130);
    doc.text('Amount', 140, 130);
    
    // Draw line under headers
    doc.setDrawColor('#CCCCCC');
    doc.line(20, 133, 180, 133);
    
    // Service row
    doc.text('BuyBack Guarantee Registration', 20, 145);
    doc.text(invoiceData.voucherCode, 75, 145);
    doc.text(invoiceData.amount, 140, 145);
    
    // Draw line above total
    doc.line(20, 155, 180, 155);
    
    // Total section
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text('TOTAL AMOUNT: ' + invoiceData.amount, 20, 168);
    
    // Payment information
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text('Payment Method: ' + invoiceData.paymentMethod, 20, 180);
    if (invoiceData.txnid !== 'N/A') {
      doc.text('Transaction ID: ' + invoiceData.txnid, 20, 188);
    }
    doc.text('Payment Status: Completed', 20, 196);
    
    // Important notes
    doc.setFontSize(10);
    doc.setTextColor(primaryBlue);
    doc.text('IMPORTANT NOTES:', 20, 215);
    
    doc.setFontSize(8);
    doc.setTextColor('#333333');
    const notes = [
      '• Keep this invoice safe for future reference and claims',
      '• BBG claims can be filed after the waiting period as per terms',
      '• Visit our website or contact support for claim assistance',
      '• This is a system-generated invoice and does not require signature'
    ];
    
    notes.forEach((note, index) => {
      doc.text(note, 20, 225 + (index * 8));
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text('XtraCover - Protecting Your Investments', 20, 265);
    doc.text('Email: support@xtracover.com | Website: www.xtracover.com', 20, 272);
    doc.text('Generated on: ' + new Date().toLocaleString('en-IN'), 20, 279);
    
    // Save the PDF
    doc.save(`BBG_Invoice_${invoiceData.voucherCode}.pdf`);
  };

  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case 'payment_failed':
        return 'Your payment could not be processed successfully. Please try again with a different payment method.';
      case 'processing_error':
        return 'There was an error processing your transaction. Please contact support if this problem persists.';
      case 'invalid_transaction':
        return 'The transaction details are invalid. Please start a new registration process.';
      case 'timeout':
        return 'Your payment session has timed out. Please start a new registration process.';
      default:
        return errorMessage || 'Unfortunately, your payment could not be completed. Please try again.';
    }
  };

  const getContent = () => {
    // Handle failure status for any type
    if (status === 'failed') {
      return {
        icon: <AlertCircle className="h-16 w-16 text-red-600" />,
        title: type === 'customer' ? "Payment Failed" : "Registration Failed",
        subtitle: `${type === 'customer' ? 'BBG Registration' : 'Registration'} Could Not Be Completed`,
        message: getErrorMessage(error || 'payment_failed'),
        code: null,
        codeLabel: "",
        isFailure: true,
        txnid: txnid,
        details: [
          "Try registering again with a different payment method",
          "Check your bank account or card details",
          "Contact our support team if the problem continues",
          "No charges have been made to your account"
        ]
      };
    }

    // Handle success status (original logic)
    switch (type) {
      case 'distributor':
        return {
          icon: <Users className="h-16 w-16 text-blue-600" />,
          title: "Welcome to XtraCover Network!",
          subtitle: "Referral Partner Registration Successful",
          message: "You are now part of our trusted referral partner network. Start promoting BBG and earn ₹25 commission on every successful registration.",
          code: sellerCode,
          codeLabel: "Your Referral Code:",
          isFailure: false,
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
          message: "Thank you for choosing XtraCover BBG. Your device is now protected with our comprehensive buyback guarantee.",
          code: voucherCode,
          codeLabel: "Your BBG Voucher Code:",
          isFailure: false,
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
          isFailure: false,
          details: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen xtra-gradient-light">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 ${content.isFailure ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mr-4`}>
              {content.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{content.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{content.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Registration/Code Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    {type === 'distributor' ? 'Referral Partner Details' : 'Registration Details'}
                  </h3>
                  <div className="space-y-3">
                    {content.code && (
                      <div className={`flex justify-between items-center p-3 ${content.isFailure ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} rounded-lg border-2`}>
                        <span className={`font-medium ${content.isFailure ? 'text-red-700' : 'text-green-700'}`}>{content.codeLabel}</span>
                        <div className={`font-mono text-lg font-bold ${content.isFailure ? 'text-red-800 bg-red-100 border-red-300' : 'text-green-800 bg-green-100 border-green-300'} px-3 py-1 rounded`}>
                          {content.code}
                        </div>
                      </div>
                    )}
                    
                    {sessionData?.customerName && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Customer Name:</span>
                        <span className="font-semibold">{sessionData.customerName}</span>
                      </div>
                    )}
                    
                    {sessionData?.deviceType && sessionData?.brand && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Device:</span>
                        <div className="flex items-center">
                          {sessionData.deviceType === 'mobile' ? 
                            <Smartphone className="h-5 w-5 text-xtra-primary mr-2" /> : 
                            <div className="h-5 w-5 bg-xtra-primary rounded mr-2" />
                          }
                          <span className="font-semibold">
                            {sessionData.brand} {sessionData.modelName}
                          </span>
                        </div>
                      </div>
                    )}

                    {txnid && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Transaction ID:</span>
                        <span className="font-mono text-sm">{txnid}</span>
                      </div>
                    )}
                  </div>
                </div>

                {content.details.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">
                      {content.isFailure ? "What you can do:" : "What's Next?"}
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      {content.details.map((detail, index) => (
                        <li key={index} className="flex items-center">
                          {content.isFailure ? (
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          )}
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column - Benefits/Actions */}
              <div className="space-y-6">
                {type === 'customer' && status === 'success' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Your BBG Benefits</h3>
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {sessionData?.registrationSource === 'acer_bbg' ? 'Up to 80%' : 'Up to 70%'}
                          </div>
                          <div className="text-sm text-green-700">Maximum buyback value</div>
                        </div>
                      </div>
                      <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">60 Months</div>
                          <div className="text-sm text-blue-700">Coverage period</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {type === 'distributor' && status === 'success' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Earn Commissions</h3>
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">₹25</div>
                          <div className="text-sm text-green-700">Per successful registration</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {type === 'customer' && status === 'success' && voucherCode && (
                    <Button 
                      onClick={handleDownloadInvoice} 
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  )}

                  <Link href="/">
                    <Button className="w-full bg-xtra-primary hover:bg-blue-700">
                      <Home className="h-4 w-4 mr-2" />
                      Go to Homepage
                    </Button>
                  </Link>

                  {type === 'distributor' && status === 'success' && (
                    <Link href="/customer-registration">
                      <Button variant="outline" className="w-full">
                        Help Customers Register
                      </Button>
                    </Link>
                  )}

                  {type === 'customer' && status === 'success' && (
                    <Link href="/claim-bbg">
                      <Button variant="outline" className="w-full">
                        Claim BBG
                      </Button>
                    </Link>
                  )}

                  {content.isFailure && (
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline" 
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show Brand-Specific Claim Values for Successful Customer Registrations */}
        {type === 'customer' && status === 'success' && <BrandClaimValues sessionData={sessionData} />}

        {/* Contact Information */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Need Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xtra-primary font-semibold">Email Support</div>
                <div className="text-gray-600">contactus@xtracover.com</div>
              </div>
              <div className="text-center">
                <div className="text-xtra-primary font-semibold">Phone Support</div>
                <div className="text-gray-600">886 039 6039</div>
                <p className="text-xs mt-1">09:30 to 18:30 IST</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success message */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thank you for choosing XtraCover BBG protection. 
            {type === 'distributor' ? 'Welcome to our referral partner network!' : 'Your device is now protected!'}
          </p>
        </div>
      </div>
    </div>
  );
}
