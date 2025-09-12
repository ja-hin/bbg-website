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
    let currentY = 20; // Track current Y position with more top margin
    
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
    
    // Set document properties with modern styling
    doc.setDrawColor('#000000');
    doc.setLineWidth(0.5); // Slightly thicker lines for modern look
    
    // ===== MODERN HEADER SECTION =====
    // Company brand name - larger and bold
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#E72829'); // XtraCover red
    doc.text('XTRACOVER', 25, currentY);
    
    // Invoice details box (top right) - modern design
    const invoiceBoxY = 15;
    const invoiceBoxHeight = 45;
    
    // Main invoice details box
    doc.setDrawColor('#254696'); // Primary blue color
    doc.setLineWidth(1);
    doc.rect(135, invoiceBoxY, 60, invoiceBoxHeight);
    
    // Box header
    doc.setFillColor('#254696');
    doc.rect(135, invoiceBoxY, 60, 12, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 165, invoiceBoxY + 8, { align: 'center' });
    
    // Invoice details
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Labels and values in structured format
    doc.text('Invoice No.:', 137, invoiceBoxY + 18);
    doc.setFont('helvetica', 'bold');
    doc.text('XTPLD/25-26/' + invoiceData.voucherCode, 137, invoiceBoxY + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Dated:', 137, invoiceBoxY + 28);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.date, 137, invoiceBoxY + 32);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Delivery Note:', 137, invoiceBoxY + 38);
    doc.text('Mode of Payment:', 137, invoiceBoxY + 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Online Payment', 137, invoiceBoxY + 46);
    doc.text('Order Reference:', 137, invoiceBoxY + 50);
    doc.text('PO' + invoiceData.voucherCode, 137, invoiceBoxY + 54);
    
    currentY += 10;
    
    // Company details section - modern layout
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#254696');
    doc.text('Xtracover Technologies Pvt Ltd (Delhi)', 25, currentY);
    
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000');
    doc.text('Near C Lal Chowk, 3rd Floor', 25, currentY);
    currentY += 4;
    doc.text('A-1, FIEE Complex, Okhla Estate Phase 2', 25, currentY);
    currentY += 4;
    doc.text('New Delhi-110020', 25, currentY);
    
    currentY += 6;
    doc.setFontSize(8);
    doc.text('UDYAM: UDYAM-DL-08-0002853', 25, currentY);
    currentY += 3;
    doc.text('GSTIN/UIN: 07AAPCA2328D1ZW', 25, currentY);
    currentY += 3;
    doc.text('State Name: Delhi-07, Code: 07', 25, currentY);
    currentY += 3;
    doc.text('CIN: U74999DL2017PTC313555', 25, currentY);
    currentY += 3;
    doc.text('E-Mail: compliance@xtracover.com', 25, currentY);
    
    // Adjust currentY to be below invoice box
    currentY = Math.max(currentY + 10, invoiceBoxY + invoiceBoxHeight + 10);
    
    // ===== MODERN CUSTOMER SECTIONS =====
    const customerSectionY = currentY;
    
    // Consignee section with modern styling
    doc.setDrawColor('#254696');
    doc.setLineWidth(0.8);
    doc.rect(25, customerSectionY, 90, 28);
    
    // Consignee header
    doc.setFillColor('#254696');
    doc.rect(25, customerSectionY, 90, 8, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Consignee (Ship To)', 27, customerSectionY + 5.5);
    
    // Consignee details
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(invoiceData.customerName, 27, customerSectionY + 14);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (invoiceData.brand && invoiceData.modelName) {
      doc.text(`Device: ${invoiceData.brand} ${invoiceData.modelName}`, 27, customerSectionY + 19);
    }
    doc.text('Indore', 27, customerSectionY + 24);
    
    // Buyer section 
    const buyerY = customerSectionY + 32;
    doc.rect(25, buyerY, 90, 32);
    
    // Buyer header
    doc.setFillColor('#254696');
    doc.rect(25, buyerY, 90, 8, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill To)', 27, buyerY + 5.5);
    
    // Buyer details
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(invoiceData.customerName, 27, buyerY + 14);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (invoiceData.brand && invoiceData.modelName) {
      doc.text(`Device: ${invoiceData.brand} ${invoiceData.modelName}`, 27, buyerY + 19);
    }
    doc.text('Indore', 27, buyerY + 24);
    doc.setFontSize(7);
    doc.text('GSTIN/UIN: 23CWPPS5113M1Z2', 27, buyerY + 28);
    doc.text('State: Madhya Pradesh, Code: 23', 27, buyerY + 31);
    
    // Additional reference fields (right side)
    const refFieldsY = customerSectionY;
    doc.setDrawColor('#E0E0E0');
    doc.setLineWidth(0.3);
    doc.rect(135, refFieldsY, 60, 64);
    
    // Reference fields header
    doc.setFillColor('#F5F5F5');
    doc.rect(135, refFieldsY, 60, 8, 'F');
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Reference Details', 137, refFieldsY + 5.5);
    
    // Reference fields content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text("Buyer's Order No:", 137, refFieldsY + 15);
    doc.text('Dispatch Doc No:', 137, refFieldsY + 22);
    doc.text('Dispatched through:', 137, refFieldsY + 29);
    doc.text('Destination:', 137, refFieldsY + 36);
    doc.text('Terms of Delivery:', 137, refFieldsY + 43);
    doc.text('Delivery Note Date:', 137, refFieldsY + 50);
    
    // Reference values
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.voucherCode, 137, refFieldsY + 18);
    doc.text('N/A', 137, refFieldsY + 25);
    doc.text('Online', 137, refFieldsY + 32);
    doc.text('Pan India', 137, refFieldsY + 39);
    doc.text('Immediate', 137, refFieldsY + 46);
    doc.text(invoiceData.date, 137, refFieldsY + 53);
    
    currentY = buyerY + 36 + 15;
    
    // ===== MODERN INVOICE TABLE =====
    const tableY = currentY;
    const tableWidth = 170;
    const tableHeight = 50;
    
    // Main table border with thicker lines
    doc.setDrawColor('#254696');
    doc.setLineWidth(1);
    doc.rect(25, tableY, tableWidth, tableHeight);
    
    // Modern column definitions with better spacing
    const cols = [
      { x: 25, width: 12, title: 'Sl No.' },
      { x: 37, width: 65, title: 'Description of Goods' },
      { x: 102, width: 18, title: 'HSN/SAC' },
      { x: 120, width: 12, title: 'Part No.' },
      { x: 132, width: 12, title: 'Quantity' },
      { x: 144, width: 15, title: 'Rate' },
      { x: 159, width: 12, title: 'per' },
      { x: 171, width: 24, title: 'Amount' }
    ];
    
    // Draw vertical grid lines
    doc.setDrawColor('#E0E0E0');
    doc.setLineWidth(0.5);
    for (let i = 1; i < cols.length; i++) {
      doc.line(cols[i].x, tableY, cols[i].x, tableY + tableHeight);
    }
    
    // Table header with modern styling
    const headerHeight = 12;
    doc.setFillColor('#254696');
    doc.rect(25, tableY, tableWidth, headerHeight, 'F');
    
    // Header dividing line
    doc.setDrawColor('#FFFFFF');
    doc.setLineWidth(0.3);
    for (let i = 1; i < cols.length; i++) {
      doc.line(cols[i].x, tableY, cols[i].x, tableY + headerHeight);
    }
    
    // Header text
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    cols.forEach((col, i) => {
      const textX = col.x + (col.width / 2);
      doc.text(col.title, textX, tableY + 8, { align: 'center' });
    });
    
    // Product row with better spacing
    const productY = tableY + headerHeight + 8;
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Serial number
    doc.text('1', 31, productY, { align: 'center' });
    
    // Service description - modern formatting
    let serviceDescription = `${invoiceData.brand && invoiceData.modelName ? invoiceData.brand + ' ' + invoiceData.modelName : ''} BBG Service`;
    if (!invoiceData.brand || !invoiceData.modelName) {
      serviceDescription = 'Oppo A73 5G (128 GB,8GB) B2B';
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(serviceDescription, 39, productY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Batch: BBG${invoiceData.voucherCode}`, 39, productY + 4);
    
    // Other product details
    doc.setFontSize(8);
    doc.text('998314', 111, productY, { align: 'center' }); // SAC code
    doc.text('BB171300', 126, productY, { align: 'center' }); // Part No
    doc.text('1 pcs', 138, productY, { align: 'center' }); // Quantity
    doc.text(taxableValue.toFixed(2), 151.5, productY, { align: 'center' }); // Rate
    doc.text('pcs', 165, productY, { align: 'center' }); // Per unit
    doc.text(taxableValue.toFixed(2), 183, productY, { align: 'center' }); // Amount
    
    // Tax section with modern styling
    const taxSectionY = productY + 12;
    
    // Tax row background
    doc.setFillColor('#F8F9FA');
    doc.rect(25, taxSectionY, tableWidth, 8, 'F');
    
    // Tax horizontal divider
    doc.setDrawColor('#E0E0E0');
    doc.setLineWidth(0.3);
    doc.line(25, taxSectionY, 25 + tableWidth, taxSectionY);
    
    // Tax details
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('IGST @ 18%', 39, taxSectionY + 5);
    doc.text('Round Off', 135, taxSectionY + 5);
    doc.text('18%', 151.5, taxSectionY + 5, { align: 'center' });
    doc.text(igstAmount.toFixed(2), 183, taxSectionY + 5, { align: 'center' });
    
    // Total section with emphasis
    const totalSectionY = taxSectionY + 10;
    
    // Total row background
    doc.setFillColor('#254696');
    doc.rect(25, totalSectionY, tableWidth, 10, 'F');
    
    // Total dividing line
    doc.setDrawColor('#FFFFFF');
    doc.setLineWidth(0.5);
    doc.line(25, totalSectionY, 25 + tableWidth, totalSectionY);
    
    // Total text
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total', 60, totalSectionY + 7);
    doc.text('1 pcs', 138, totalSectionY + 7, { align: 'center' });
    doc.text(`₹ ${baseAmount.toFixed(2)}`, 183, totalSectionY + 7, { align: 'center' });
    
    currentY = tableY + tableHeight + 15;
    
    // ===== MODERN AMOUNT IN WORDS SECTION =====
    doc.setDrawColor('#E0E0E0');
    doc.setLineWidth(0.5);
    doc.rect(25, currentY, 170, 12);
    
    // Amount in words header
    doc.setFillColor('#F8F9FA');
    doc.rect(25, currentY, 170, 4, 'F');
    
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Amount Chargeable (in words)', 27, currentY + 3);
    doc.text('E. & O.E', 190, currentY + 3, { align: 'right' });
    
    // Amount in words content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(totalInWords, 27, currentY + 9);
    
    currentY += 18;
    
    // ===== MODERN TAX SUMMARY TABLE =====
    const taxTableY = currentY;
    const taxTableWidth = 170;
    const taxTableHeight = 28;
    
    // Tax summary table
    doc.setDrawColor('#254696');
    doc.setLineWidth(0.8);
    doc.rect(25, taxTableY, taxTableWidth, taxTableHeight);
    
    // Tax table header
    doc.setFillColor('#254696');
    doc.rect(25, taxTableY, taxTableWidth, 10, 'F');
    
    // Column dividers in header
    doc.setDrawColor('#FFFFFF');
    doc.setLineWidth(0.3);
    doc.line(65, taxTableY, 65, taxTableY + 10); // After HSN/SAC
    doc.line(105, taxTableY, 105, taxTableY + 10); // After Taxable Value
    doc.line(135, taxTableY, 135, taxTableY + 10); // After IGST Rate
    doc.line(165, taxTableY, 165, taxTableY + 10); // After IGST Amount
    
    // Tax table headers
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('HSN/SAC', 45, taxTableY + 7, { align: 'center' });
    doc.text('Taxable', 85, taxTableY + 4.5, { align: 'center' });
    doc.text('Value', 85, taxTableY + 7.5, { align: 'center' });
    doc.text('IGST', 120, taxTableY + 4.5, { align: 'center' });
    doc.text('Rate', 120, taxTableY + 7.5, { align: 'center' });
    doc.text('IGST', 150, taxTableY + 4.5, { align: 'center' });
    doc.text('Amount', 150, taxTableY + 7.5, { align: 'center' });
    doc.text('Total', 180, taxTableY + 4.5, { align: 'center' });
    doc.text('Tax Amount', 180, taxTableY + 7.5, { align: 'center' });
    
    // Tax table content with alternating row colors
    doc.setFillColor('#FFFFFF');
    doc.rect(25, taxTableY + 10, taxTableWidth, 18, 'F');
    
    // Column dividers in content
    doc.setDrawColor('#E0E0E0');
    doc.setLineWidth(0.3);
    doc.line(65, taxTableY + 10, 65, taxTableY + taxTableHeight);
    doc.line(105, taxTableY + 10, 105, taxTableY + taxTableHeight);
    doc.line(135, taxTableY + 10, 135, taxTableY + taxTableHeight);
    doc.line(165, taxTableY + 10, 165, taxTableY + taxTableHeight);
    
    // Tax values
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('998314', 45, taxTableY + 18, { align: 'center' });
    doc.text(taxableValue.toFixed(2), 85, taxTableY + 18, { align: 'center' });
    doc.text('18%', 120, taxTableY + 18, { align: 'center' });
    doc.text(igstAmount.toFixed(2), 150, taxTableY + 18, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(igstAmount.toFixed(2), 180, taxTableY + 18, { align: 'center' });
    
    currentY = taxTableY + taxTableHeight + 10;
    
    // ===== MODERN FOOTER SECTIONS =====
    const footerY = currentY;
    
    // Terms and Conditions section (left side)
    doc.setDrawColor('#E0E0E0');
    doc.setLineWidth(0.5);
    doc.rect(25, footerY, 82, 45);
    
    // Terms header
    doc.setFillColor('#F8F9FA');
    doc.rect(25, footerY, 82, 8, 'F');
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms and Conditions', 27, footerY + 5.5);
    
    // Terms content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const terms = [
      'We declare that this invoice shows the actual price of',
      'the goods described and that all particulars are true',
      'and correct.',
      '',
      'All goods sold will not be taken back or exchanged.',
      '',
      'All payments must be made as per the agreed payment terms.',
      '',
      'Any discrepancies in the invoice must be reported within 7 days',
      'from the date of this invoice.',
      '',
      'All disputes are subject to DELHI JURISDICTION.'
    ];
    
    terms.forEach((term, i) => {
      if (term) {
        doc.text(term, 27, footerY + 12 + (i * 2.8));
      }
    });
    
    // Bank Details section (right side)
    doc.rect(113, footerY, 82, 45);
    
    // Bank details header
    doc.setFillColor('#F8F9FA');
    doc.rect(113, footerY, 82, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text("Company's Bank Details", 115, footerY + 5.5);
    
    // Bank details content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text("A/c Holder's Name:", 115, footerY + 15);
    doc.setFont('helvetica', 'bold');
    doc.text("Xtracover Technologies Pvt Ltd", 115, footerY + 19);
    
    doc.setFont('helvetica', 'normal');
    doc.text('A/c No: 923020046439817', 115, footerY + 24);
    doc.text('Bank Name: Axis Bank', 115, footerY + 28);
    doc.text('Branch & IFS Code: Okhla Phase-1, New Delhi & UTIB0001103', 115, footerY + 32);
    
    // Signature area
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('for Xtracover Technologies Pvt Ltd (Delhi)', 115, footerY + 38);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorised Signatory', 115, footerY + 42);
    
    currentY = footerY + 50;
    
    // ===== MODERN FOOTER =====
    doc.setTextColor('#254696');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SUBJECT TO DELHI JURISDICTION', 105, currentY, { align: 'center' });
    
    doc.setTextColor('#666666');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('This is a Computer Generated Invoice', 105, currentY + 5, { align: 'center' });
    
    // Transaction ID footer
    if (invoiceData.txnid !== 'N/A') {
      doc.setFontSize(6);
      doc.setTextColor('#999999');
      doc.text(`Transaction ID: ${invoiceData.txnid}`, 105, currentY + 10, { align: 'center' });
    }
    
    // Save the PDF with modern filename
    doc.save(`XtraCover_BBG_Invoice_${invoiceData.voucherCode}_${new Date().getFullYear()}.pdf`);
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
