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
        if (bbgPrices && deviceType && typeof bbgPrices === 'object' && 'laptop' in bbgPrices && 'mobile' in bbgPrices) {
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
    
    // Helper function to generate unique IRN and Ack numbers
    const generateIRN = () => {
      const chars = 'abcdef0123456789';
      return Array.from({length: 64}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };
    
    const generateAckNo = () => Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
    
    // Calculate amounts and tax
    const baseAmount = parseInt(invoiceData.amount.replace('₹', ''));
    const gstRate = 18; // 18% GST for services
    const taxableValue = Math.round((baseAmount * 100) / (100 + gstRate) * 100) / 100;
    const igstAmount = Math.round((taxableValue * gstRate / 100) * 100) / 100;
    const roundOff = baseAmount - (taxableValue + igstAmount);
    
    // Amount in words function
    const numberToWords = (num: number): string => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const thousands = ['', 'Thousand', 'Lakh', 'Crore'];
      
      if (num === 0) return 'Zero';
      
      const convert = (n: number): string => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        return '';
      };
      
      let result = '';
      let place = 0;
      
      while (num > 0) {
        const chunk = place === 0 ? num % 1000 : num % 100;
        if (chunk !== 0) {
          result = convert(chunk) + (thousands[place] ? ' ' + thousands[place] : '') + (result ? ' ' + result : '');
        }
        num = place === 0 ? Math.floor(num / 1000) : Math.floor(num / 100);
        place++;
      }
      
      return result;
    };
    
    // Convert amounts to words
    const totalInWords = `INR ${numberToWords(baseAmount)} Only`;
    const taxInWords = `INR ${numberToWords(Math.floor(igstAmount))} and ${Math.round((igstAmount % 1) * 100)} paise Only`;
    
    // Header section
    doc.setFontSize(14);
    doc.setTextColor('#000000');
    doc.text('Tax Invoice', 60, 20);
    doc.text('e-Invoice', 140, 20);
    
    // IRN and Ack details
    doc.setFontSize(8);
    doc.text('IRN      : ' + generateIRN().substring(0, 32) + '-', 20, 30);
    doc.text('           ' + generateIRN().substring(32), 20, 36);
    doc.text('Ack No.  : ' + generateAckNo(), 20, 42);
    doc.text('Ack Date : ' + invoiceData.date, 20, 48);
    
    // Company header
    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text('Xtracover Technologies Pvt Ltd (Delhi)', 20, 60);
    
    doc.setFontSize(9);
    doc.text('Near C Lal Chowk, 3rd Floor', 20, 68);
    doc.text('A-1, FIEE Complex, Okhla Estate Phase 2', 20, 76);
    doc.text('New Delhi-110020', 20, 84);
    doc.text('UDYAM : UDYAM-DL-08-0002853 (Small/Traders)', 20, 92);
    doc.text('GSTIN/UIN: 07AAPCA2328D1ZW', 20, 100);
    doc.text('State Name : Delhi, Code : 07', 20, 108);
    doc.text('CIN: U74999DL2017PTC313555', 20, 116);
    doc.text('E-Mail : compliance@xtracover.com', 20, 124);
    
    // Invoice details (right side)
    doc.setFontSize(9);
    doc.text('Invoice No.', 140, 60);
    doc.text('Dated', 170, 60);
    doc.text('XTPLD/25-26/' + invoiceData.voucherCode, 140, 68);
    doc.text(invoiceData.date, 170, 68);
    
    doc.text('Delivery Note', 140, 80);
    doc.text('Mode/Terms of Payment', 170, 80);
    doc.text('Online Payment', 170, 88);
    
    doc.text('Reference No. & Date.', 140, 100);
    doc.text('Other References', 170, 100);
    doc.text('BBG/' + invoiceData.voucherCode + ' dt. ' + invoiceData.date, 140, 108);
    
    doc.text("Buyer's Order No.", 140, 120);
    doc.text('Dated', 170, 120);
    
    doc.text('Dispatch Doc No.', 140, 132);
    doc.text('Delivery Note Date', 170, 132);
    
    doc.text('Dispatched through', 140, 144);
    doc.text('Destination', 170, 144);
    
    doc.text('Terms of Delivery', 140, 156);
    
    // Consignee section
    doc.setFontSize(9);
    doc.text('Consignee (Ship to)', 20, 140);
    doc.text(invoiceData.customerName, 20, 150);
    if (invoiceData.deviceType && invoiceData.brand) {
      doc.text(`Device: ${invoiceData.brand} ${invoiceData.modelName}`, 20, 158);
    }
    doc.text('GSTIN/UIN      : N/A', 20, 166);
    doc.text('State Name     : Delhi, Code : 07', 20, 174);
    
    // Buyer section
    doc.text('Buyer (Bill to)', 20, 186);
    doc.text(invoiceData.customerName, 20, 194);
    if (invoiceData.deviceType && invoiceData.brand) {
      doc.text(`Device: ${invoiceData.brand} ${invoiceData.modelName}`, 20, 202);
    }
    doc.text('GSTIN/UIN       : N/A', 20, 210);
    doc.text('State Name      : Delhi, Code : 07', 20, 218);
    doc.text('Place of Supply : Delhi', 20, 226);
    
    // Service table
    doc.setFontSize(8);
    doc.text('Sl', 20, 240);
    doc.text('Description of Goods', 25, 240);
    doc.text('HSN/SAC', 90, 240);
    doc.text('Part No.', 110, 240);
    doc.text('Quantity', 125, 240);
    doc.text('Rate', 145, 240);
    doc.text('per', 160, 240);
    doc.text('Amount', 175, 240);
    doc.text('No.', 20, 248);
    
    // Table border
    doc.setDrawColor('#000000');
    doc.line(20, 250, 190, 250);
    
    // Service row
    doc.text('1', 20, 260);
    doc.text('BuyBack Guarantee (BBG) Service', 25, 260);
    doc.text('998314', 90, 260); // SAC code for business support services
    doc.text('', 110, 260);
    doc.text('1 service', 125, 260);
    doc.text(taxableValue.toFixed(2), 145, 260);
    doc.text('service', 160, 260);
    doc.text(taxableValue.toFixed(2), 175, 260);
    doc.text('Batch : BBG-' + invoiceData.voucherCode, 25, 268);
    doc.text('1 service', 125, 276);
    
    // Tax calculations
    doc.text('IGST @ 18%', 90, 288);
    doc.text('18 %', 160, 288);
    doc.text(igstAmount.toFixed(2), 175, 288);
    
    doc.text('Round Off', 90, 300);
    doc.text(roundOff.toFixed(2), 175, 300);
    
    doc.text('Total', 90, 312);
    doc.text('1 service', 125, 312);
    doc.text('₹ ' + baseAmount.toFixed(2), 170, 312);
    
    // Amount in words
    doc.setFontSize(9);
    doc.text('Amount Chargeable (in words)', 20, 325);
    doc.text('E. & O.E', 175, 325);
    doc.setFontSize(8);
    doc.text(totalInWords, 20, 335);
    
    // Tax summary table
    doc.setFontSize(8);
    doc.text('HSN/SAC', 25, 350);
    doc.text('Taxable', 60, 350);
    doc.text('IGST', 90, 350);
    doc.text('Total', 120, 350);
    doc.text('', 25, 358);
    doc.text('Value', 60, 358);
    doc.text('Rate    Amount', 90, 358);
    doc.text('Tax Amount', 120, 358);
    
    doc.line(20, 360, 150, 360);
    
    doc.text('998314', 25, 370);
    doc.text(taxableValue.toFixed(2), 60, 370);
    doc.text('18%     ' + igstAmount.toFixed(2), 90, 370);
    doc.text(igstAmount.toFixed(2), 120, 370);
    
    doc.line(20, 375, 150, 375);
    doc.text('Total', 25, 385);
    doc.text(taxableValue.toFixed(2), 60, 385);
    doc.text(igstAmount.toFixed(2), 105, 385);
    doc.text(igstAmount.toFixed(2), 120, 385);
    
    doc.text('Tax Amount (in words) : ' + taxInWords, 20, 395);
    
    // Remarks section
    doc.text('Remarks:', 20, 408);
    doc.text('Service provided as per agreement terms and conditions.', 20, 416);
    doc.text('GST applicable as per government regulations.', 20, 424);
    
    // Company details and signature
    doc.text("Company's PAN              : AAPCA2328D", 20, 440);
    
    doc.text('Declaration', 20, 452);
    doc.text('Services once provided will not be cancelled or refunded.', 20, 460);
    doc.text('All payments must be made as per the agreed payment terms.', 20, 468);
    doc.text('Interest @ 18% p.a. will be charged on overdue payments.', 20, 476);
    doc.text('Any discrepancies in the invoice must be reported within 7 days', 20, 484);
    doc.text('from the date of invoice.', 20, 492);
    doc.text('All disputes are subject to Delhi jurisdiction.', 20, 500);
    doc.text('Tax liability is as per applicable GST rules.', 20, 508);
    
    // Bank details
    doc.text("Company's Bank Details", 110, 440);
    doc.text("A/c Holder's Name : Xtracover Technologies Pvt Ltd", 110, 448);
    doc.text('Bank Name         : Axis Bank Current A/c', 110, 456);
    doc.text('A/c No.           : 923020046439817', 110, 464);
    doc.text('Branch & IFS Code: Okhla Phase-1, New Delhi & UTIB0001103', 110, 472);
    doc.text('for Xtracover Technologies Pvt Ltd (Delhi)', 110, 488);
    doc.text('Authorised Signatory', 110, 504);
    
    // Footer
    doc.setFontSize(9);
    doc.text('SUBJECT TO DELHI JURISDICTION', 75, 520, { align: 'center' });
    doc.text('This is a Computer Generated Invoice', 75, 530, { align: 'center' });
    
    if (invoiceData.txnid !== 'N/A') {
      doc.setFontSize(7);
      doc.text('Transaction ID: ' + invoiceData.txnid, 20, 545);
    }
    
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
