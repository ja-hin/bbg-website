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
          title: "Welcome to Xtracover Network!",
          subtitle: "Distributor Registration Successful",
          message: "You are now part of our trusted distributor network. Start promoting BBG and earn ₹25 commission on every successful registration.",
          code: sellerCode,
          codeLabel: "Your Seller Code:",
          isFailure: false,
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

            {/* Show Brand-Specific Claim Values for Successful Customer Registrations */}
            {type === 'customer' && status === 'success' && <BrandClaimValues sessionData={sessionData} />}

            {/* Transaction ID for failed payments */}
            {content.isFailure && txnid && (
              <div className="bg-gray-50 p-4 rounded-lg mb-8">
                <p className="text-sm text-gray-600 mb-1">Transaction Reference:</p>
                <p className="font-mono text-sm text-gray-800">{txnid}</p>
              </div>
            )}

            {/* Action Details */}
            {content.details.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-3">
                  {content.details.map((detail, index) => (
                    <div key={index} className="flex items-start text-left">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Invoice Button - Only for successful customer registrations */}
            {type === 'customer' && status === 'success' && voucherCode && (
              <div className="mb-8">
                <Button 
                  onClick={handleDownloadInvoice} 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {content.isFailure ? (
                <>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-xtra-primary hover:bg-blue-700 text-white px-6 py-3"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="px-6 py-3">
                      <Home className="h-4 w-4 mr-2" />
                      Go to Homepage
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/">
                    <Button className="bg-xtra-primary hover:bg-blue-700 text-white px-6 py-3">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  {type === 'distributor' && (
                    <Link href="/customer-registration">
                      <Button variant="outline" className="px-6 py-3">
                        Help Customers Register
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xtra-primary font-semibold">Email Support</div>
                  <div className="text-gray-600">support@xtracover.com</div>
                </div>
                <div className="text-center">
                  <div className="text-xtra-primary font-semibold">Phone Support</div>
                  <div className="text-gray-600">+91-8860396039</div>
                  <p className="text-xs mt-1">between 09:30 to 18:30 IST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
