import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import jsPDF from 'jspdf';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Smartphone, Home, Download, Info, AlertCircle, RefreshCw, Award } from "lucide-react";

// Device Type Claim Values Component
function BrandClaimValues({ sessionData }: { sessionData: any }) {
  if (!sessionData?.registrationSlabData?.slabs || sessionData.registrationSlabData.slabs.length === 0) {
    return null;
  }

  // Group slabs by age range and get the highest percentage for each age range (consolidated view)
  const ageRanges: { [key: string]: any } = {};
  
  sessionData.registrationSlabData.slabs.forEach((slab: any) => {
    const key = `${slab.minMonths}-${slab.maxMonths}`;
    if (!ageRanges[key]) {
      ageRanges[key] = {
        minMonths: slab.minMonths,
        maxMonths: slab.maxMonths,
        percentage: slab.percentage,
        updatedAt: slab.updatedAt
      };
    } else {
      // Keep the slab with highest percentage for this age range
      if (slab.percentage > ageRanges[key].percentage) {
        ageRanges[key].percentage = slab.percentage;
        ageRanges[key].updatedAt = slab.updatedAt;
      }
    }
  });

  const slabs = Object.values(ageRanges).sort((a: any, b: any) => a.minMonths - b.minMonths);

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200/60 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <CheckCircle className="h-6 w-6 mr-3 text-emerald-600" />
          Your {sessionData.deviceType.charAt(0).toUpperCase() + sessionData.deviceType.slice(1)} BBG Coverage
        </h3>
        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          LOCKED RATES
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-sm text-emerald-800 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          These are your guaranteed BBG rates, locked at registration time. Values shown are maximum percentages of your original invoice value.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slabs.map((slab: any, index: number) => {
          // Determine colors based on percentage with success theme
          let bgColor = "bg-gradient-to-br from-emerald-100 to-emerald-200";
          let textColor = "text-emerald-800";
          let borderColor = "border-emerald-300";
          let iconColor = "bg-emerald-500";
          
          if (slab.percentage < 30) {
            bgColor = "bg-gradient-to-br from-slate-100 to-slate-200";
            textColor = "text-slate-800";
            borderColor = "border-slate-300";
            iconColor = "bg-slate-500";
          } else if (slab.percentage < 50) {
            bgColor = "bg-gradient-to-br from-amber-100 to-amber-200";
            textColor = "text-amber-800";
            borderColor = "border-amber-300";
            iconColor = "bg-amber-500";
          } else if (slab.percentage < 70) {
            bgColor = "bg-gradient-to-br from-yellow-100 to-yellow-200";
            textColor = "text-yellow-800";
            borderColor = "border-yellow-300";
            iconColor = "bg-yellow-500";
          }

          return (
            <div key={index} className={`${bgColor} ${borderColor} border-2 rounded-xl p-5 text-center hover:shadow-md transition-all duration-300 relative group`}>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${iconColor} rounded-full opacity-80`}></div>
              <div className="text-sm font-semibold text-gray-700 mb-3">
                {slab.minMonths}-{slab.maxMonths} months
              </div>
              <div className={`text-3xl font-bold ${textColor} mb-2 group-hover:scale-110 transition-transform duration-200`}>
                {slab.percentage}%
              </div>
              <div className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full">
                guaranteed
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white/50 rounded-lg p-4">
        <p className="text-xs text-gray-700 flex items-center justify-center">
          <Award className="w-4 h-4 mr-2 text-emerald-600" />
          Your BBG rates are permanently locked and cannot be reduced, ensuring guaranteed returns for your {sessionData.deviceType}
        </p>
      </div>
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
        // Use actual charged amount from session data (includes referral discounts)
        if (sessionData?.amount) {
          return `₹${sessionData.amount}`;
        }
        // If amount is in URL params, use that
        if (params?.get('amount')) {
          return `₹${params.get('amount')}`;
        }
        // Fallback to calculating from BBG prices (for backward compatibility)
        const deviceType = sessionData?.deviceType || params?.get('deviceType') || '';
        if (bbgPrices && deviceType && typeof bbgPrices === 'object' && 'laptop' in bbgPrices && 'mobile' in bbgPrices) {
          const price = deviceType === 'laptop' ? bbgPrices.laptop : bbgPrices.mobile;
          return `₹${price}`;
        }
        // Final fallback to session data or default
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
    
    // Page constraints
    const pageHeight = 297; // A4 height in mm
    const maxContentHeight = 280; // Safe content height
    let currentY = 15; // Track current Y position
    
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
    
    // Set document properties
    doc.setDrawColor('#000000');
    doc.setLineWidth(0.3);
    
    // Header - Logo area and company name
    doc.setFontSize(14);
    doc.setTextColor('#E72829'); // XtraCover red
    doc.text('XTRACOVER', 25, currentY);
    currentY += 8;
    
    // Company details section - compressed spacing
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    doc.text('Xtracover Technologies Pvt Ltd (Delhi)', 25, currentY);
    currentY += 5;
    
    doc.setFontSize(8);
    doc.text('Near C Lal Chowk, 3rd Floor, A-1, FIEE Complex, Okhla Estate Phase 2', 25, currentY);
    currentY += 4;
    doc.text('New Delhi-110020', 25, currentY);
    currentY += 4;
    doc.text('UDYAM: UDYAM-DL-08-0002853 | GSTIN/UIN: 07AAPCA2328D1ZW | State: Delhi-07', 25, currentY);
    currentY += 4;
    doc.text('CIN: U74999DL2017PTC313555 | E-Mail: compliance@xtracover.com', 25, currentY);
    
    // Invoice details box (top right) - reset Y for right side
    const invoiceBoxY = 15;
    doc.rect(140, invoiceBoxY, 55, 35);
    doc.setFontSize(8);
    doc.text('Invoice No.', 142, invoiceBoxY + 8);
    doc.text('Dated', 175, invoiceBoxY + 8);
    doc.text('XTPLD/25-26/' + invoiceData.voucherCode, 142, invoiceBoxY + 14);
    doc.text(invoiceData.date, 175, invoiceBoxY + 14);
    doc.text('Delivery Note', 142, invoiceBoxY + 22);
    doc.text('Mode/Payment', 175, invoiceBoxY + 22);
    doc.text('Online Payment', 142, invoiceBoxY + 28);
    doc.text('PO' + invoiceData.voucherCode, 142, invoiceBoxY + 34);
    
    currentY = Math.max(currentY + 8, invoiceBoxY + 40);
    
    // Customer sections with borders - compressed
    const customerSectionY = currentY;
    // Consignee section
    doc.rect(25, customerSectionY, 85, 25);
    doc.setFontSize(8);
    doc.text('Consignee (Ship to)', 27, customerSectionY + 6);
    doc.setFontSize(9);
    doc.text(invoiceData.customerName, 27, customerSectionY + 12);
    if (invoiceData.brand && invoiceData.modelName) {
      doc.setFontSize(7);
      doc.text(invoiceData.brand + ' ' + invoiceData.modelName, 27, customerSectionY + 17);
    }
    doc.text('Indore', 27, customerSectionY + 22);
    
    // Buyer section  
    doc.rect(25, customerSectionY + 25, 85, 30);
    doc.setFontSize(8);
    doc.text('Buyer (Bill to)', 27, customerSectionY + 31);
    doc.setFontSize(9);
    doc.text(invoiceData.customerName, 27, customerSectionY + 37);
    if (invoiceData.brand && invoiceData.modelName) {
      doc.setFontSize(7);
      doc.text(invoiceData.brand + ' ' + invoiceData.modelName, 27, customerSectionY + 42);
    }
    doc.text('Indore', 27, customerSectionY + 47);
    doc.setFontSize(7);
    doc.text('GSTIN/UIN: 23CWPPS5113M1Z2 | State: Madhya Pradesh-23', 27, customerSectionY + 52);
    
    // Additional fields (right side) - compressed
    doc.setFontSize(7);
    doc.text("Buyer's Order No.", 142, customerSectionY + 8);
    doc.text('Dispatch Doc No.', 142, customerSectionY + 16);
    doc.text('Destination', 142, customerSectionY + 24);
    doc.text('Terms of Delivery', 142, customerSectionY + 32);
    
    currentY = customerSectionY + 60;
    
    // Main products/services table with complete structure
    const tableY = currentY;
    const tableWidth = 170;
    const tableHeight = 40;
    
    // Complete table border
    doc.rect(25, tableY, tableWidth, tableHeight);
    
    // Column definitions (widths in mm)
    const cols = [
      { x: 25, width: 8, title: 'Sl No.' },
      { x: 33, width: 75, title: 'Description of Goods' },
      { x: 108, width: 15, title: 'HSN/SAC' },
      { x: 123, width: 15, title: 'Quantity' },
      { x: 138, width: 17, title: 'Rate' },
      { x: 155, width: 15, title: 'per' },
      { x: 170, width: 25, title: 'Amount' }
    ];
    
    // Draw all vertical grid lines
    for (let i = 1; i < cols.length; i++) {
      doc.line(cols[i].x, tableY, cols[i].x, tableY + tableHeight);
    }
    
    // Header row
    const headerHeight = 10;
    doc.line(25, tableY + headerHeight, 25 + tableWidth, tableY + headerHeight);
    
    doc.setFontSize(7);
    cols.forEach((col, i) => {
      doc.text(col.title, col.x + 1, tableY + 7);
    });
    
    // Product row
    const productY = tableY + headerHeight + 6;
    doc.text('1', 27, productY);
    
    // Service description
    let serviceDescription = 'BuyBack Guarantee (BBG) Service B2B';
    if (invoiceData.brand && invoiceData.modelName) {
      serviceDescription = `${invoiceData.brand} ${invoiceData.modelName} BBG Service`;
    }
    doc.text(serviceDescription, 35, productY);
    doc.text('Batch: BBG' + invoiceData.voucherCode, 35, productY + 5);
    
    doc.text('998314', 110, productY); // SAC code
    doc.text('1 pcs', 125, productY); // Quantity
    doc.text(taxableValue.toFixed(2), 140, productY); // Rate
    doc.text('pcs', 157, productY); // Per unit
    doc.text(taxableValue.toFixed(2), 172, productY); // Amount
    
    // Tax lines within table structure
    const taxRowY = productY + 12;
    doc.line(25, taxRowY, 25 + tableWidth, taxRowY); // Horizontal line before tax
    
    // Empty cells for tax row alignment
    doc.text('', 27, taxRowY + 5); // Sl No
    doc.text('IGST @ 18%', 35, taxRowY + 5); // Description
    doc.text('', 110, taxRowY + 5); // HSN/SAC
    doc.text('', 125, taxRowY + 5); // Quantity
    doc.text('18%', 140, taxRowY + 5); // Rate
    doc.text('', 157, taxRowY + 5); // Per
    doc.text(igstAmount.toFixed(2), 172, taxRowY + 5); // Amount
    
    // Round off row
    const roundOffY = taxRowY + 8;
    doc.text('', 27, roundOffY); // Sl No
    doc.text('Round Off', 35, roundOffY); // Description
    doc.text('', 110, roundOffY); // HSN/SAC
    doc.text('', 125, roundOffY); // Quantity
    doc.text('', 140, roundOffY); // Rate
    doc.text('', 157, roundOffY); // Per
    doc.text(roundOff.toFixed(2), 172, roundOffY); // Amount
    
    // Total row with proper structure
    const totalRowY = roundOffY + 6;
    doc.line(25, totalRowY, 25 + tableWidth, totalRowY); // Line before total
    doc.setFontSize(8);
    doc.text('', 27, totalRowY + 4); // Sl No
    doc.text('Total', 35, totalRowY + 4); // Description
    doc.text('', 110, totalRowY + 4); // HSN/SAC
    doc.text('1 pcs', 125, totalRowY + 4); // Total Quantity
    doc.text('', 140, totalRowY + 4); // Rate
    doc.text('', 157, totalRowY + 4); // Per
    doc.text('₹ ' + baseAmount.toFixed(2), 172, totalRowY + 4); // Total Amount
    
    currentY = tableY + tableHeight + 8;
    
    // Amount in words section - compressed
    doc.setFontSize(8);
    doc.text('Amount Chargeable (in words):', 27, currentY);
    doc.text('E. & O.E', 175, currentY);
    currentY += 5;
    doc.setFontSize(7);
    doc.text(totalInWords, 27, currentY);
    currentY += 8;
    
    // Tax summary table - compressed
    const taxTableWidth = 120;
    const taxTableHeight = 25;
    doc.rect(25, currentY, taxTableWidth, taxTableHeight);
    
    // Tax table column lines
    doc.line(45, currentY, 45, currentY + taxTableHeight); // After HSN/SAC
    doc.line(75, currentY, 75, currentY + taxTableHeight); // After Taxable Value
    doc.line(105, currentY, 105, currentY + taxTableHeight); // After IGST
    
    // Tax table headers
    doc.line(25, currentY + 10, 25 + taxTableWidth, currentY + 10);
    doc.setFontSize(7);
    doc.text('HSN/SAC', 27, currentY + 6);
    doc.text('Taxable Value', 47, currentY + 6);
    doc.text('IGST', 77, currentY + 6);
    doc.text('Total Tax', 107, currentY + 6);
    
    // Tax values
    doc.text('998314', 27, currentY + 18);
    doc.text(taxableValue.toFixed(2), 47, currentY + 18);
    doc.text('18% - ' + igstAmount.toFixed(2), 77, currentY + 18);
    doc.text(igstAmount.toFixed(2), 107, currentY + 18);
    
    currentY += taxTableHeight + 6;
    
    // Tax amount in words
    doc.setFontSize(7);
    doc.text('Tax Amount (in words): ' + taxInWords, 27, currentY);
    currentY += 8;
    
    // Remarks section - highly compressed
    doc.text('Remarks: Margin Scheme (Rule 32(5)) for used goods valuation.', 27, currentY);
    currentY += 5;
    doc.text("Company's PAN: AAPCA2328D", 27, currentY);
    currentY += 8;
    
    // Declaration and Bank details in two columns - final section
    const declarationY = currentY;
    
    // Left column - Declaration (compressed)
    doc.setFontSize(7);
    doc.text('Declaration:', 27, declarationY);
    const declarations = [
      'Goods sold will not be taken back.',
      'Payments as per agreed terms.',
      'Interest @ 18% p.a. on overdue payments.',
      'Report discrepancies within 7 days.',
      'Company not responsible for transit damage.',
      'Delhi jurisdiction applies.',
      'Tax as per GST rules.'
    ];
    
    declarations.forEach((decl, i) => {
      doc.text(decl, 27, declarationY + 5 + (i * 4));
    });
    
    // Right column - Bank details (compressed)
    doc.text("Company's Bank Details:", 110, declarationY);
    const bankDetails = [
      "A/c: Xtracover Technologies Pvt Ltd",
      'Bank: Axis Bank A/c 923020046439817',
      'Branch: Okhla Phase-1, New Delhi',
      'IFS Code: UTIB0001103',
      '',
      'for Xtracover Technologies Pvt Ltd',
      'Authorised Signatory'
    ];
    
    bankDetails.forEach((detail, i) => {
      doc.text(detail, 110, declarationY + 5 + (i * 4));
    });
    
    currentY = declarationY + 35;
    
    // Footer - ensure it fits
    doc.setFontSize(8);
    doc.text('SUBJECT TO DELHI JURISDICTION', 105, currentY, { align: 'center' });
    doc.text('This is a Computer Generated Invoice', 105, currentY + 5, { align: 'center' });
    
    if (invoiceData.txnid !== 'N/A') {
      doc.setFontSize(6);
      doc.text('Transaction ID: ' + invoiceData.txnid, 27, currentY + 10);
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
