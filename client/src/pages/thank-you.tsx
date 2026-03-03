import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import jsPDF from 'jspdf';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Smartphone, Home, Download, Info, AlertCircle, RefreshCw, Award, Gavel, Wrench, Star, ArrowRight, Copy, Calendar } from "lucide-react";
import refPartnerLogo from "@assets/refpartnerlogo.webp";
import bbgLogo from "@assets/BUY_BACK_GURANTEE_LOGO_1766210821932.webp";

// Helper to format a date string (ISO or YYYY-MM-DD) to DD/MM/YYYY
function formatDateDDMMYYYY(dateStr: string | null | undefined): string {
  if (!dateStr) return 'DD/MM/YYYY';
  try {
    // Handle ISO strings and YYYY-MM-DD
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // return as-is if unparseable
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

// Customer Card Preview Component
function CustomerCardPreview({ sessionData, params, isBbg, voucherCode }: { sessionData: any, params: any, isBbg: boolean, voucherCode: string }) {
  const brand = sessionData?.brand || params?.get('brand') || 'Brand';
  const model = sessionData?.deviceModel || sessionData?.modelName || params?.get('model') || params?.get('modelName') || 'Model';
  const customerName = sessionData?.customerName || params?.get('customerName') || 'Customer';
  const devicePurchaseDate = formatDateDDMMYYYY(sessionData?.devicePurchaseDate || params?.get('devicePurchaseDate'));
  const planPurchaseDate = new Date().toLocaleDateString('en-IN');

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl font-sans text-black my-8 relative">
      {/* Blue Header */}
      <div className="bg-[#1b3476] p-6 flex justify-center items-center">
        <img src={bbgLogo} alt="XtraCover BBG" className="h-10 object-contain" />
      </div>

      {/* Name Section */}
      <div className="p-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">{customerName}</h2>
      </div>

      <div className="px-5 pb-6">
        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-4"></div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-4 text-[11px] sm:text-xs text-gray-400 mb-6">
          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wider text-[10px]">Device</p>
            <p className="text-gray-900 font-bold text-[13px] leading-tight">{brand} {model}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wider text-[10px]">Voucher Code</p>
            <p className="text-gray-900 font-bold text-[13px]">{voucherCode || 'XYZ'}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wider text-[10px]">Plan</p>
            <p className="text-gray-900 font-bold text-[13px]">{isBbg ? 'BuyBack Guarantee' : 'Extend+'}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wider text-[10px]">Plan Purchase Date</p>
            <p className="text-gray-900 font-bold text-[13px]">{planPurchaseDate}</p>
          </div>
          <div className="col-span-2 space-y-0.5">
            <p className="font-bold uppercase tracking-wider text-[10px]">Device Purchase Date</p>
            <p className="text-gray-900 font-bold text-[13px]">{devicePurchaseDate}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-6"></div>

        {isBbg ? (
          <>
            <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wide">Resale Value Chart</h3>
            <div className="bg-gray-50 rounded-2xl overflow-hidden mb-6 border border-gray-100">
              <div className="flex justify-between bg-gray-100 px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <span>Device Age</span>
                <span>Resale Value</span>
              </div>
              <div className="divide-y divide-gray-100">
                {(sessionData?.registrationSlabData?.slabs || [
                  { minMonths: 4, maxMonths: 6, percentage: 70 },
                  { minMonths: 7, maxMonths: 12, percentage: 50 },
                  { minMonths: 13, maxMonths: 18, percentage: 45 },
                  { minMonths: 19, maxMonths: 24, percentage: 40 },
                  { minMonths: 25, maxMonths: 30, percentage: 30 },
                  { minMonths: 31, maxMonths: 36, percentage: 25 }
                ]).slice(0, 6).map((slab: any, i: number) => (
                  <div key={i} className={`flex justify-between px-4 py-2.5 text-[13px] ${i % 2 === 0 ? '' : 'bg-white/50'}`}>
                    <span className="text-gray-600 font-medium">{slab.minMonths}th-{slab.maxMonths}th month</span>
                    <span className={`font-black ${slab.percentage >= 70 ? 'text-[#1b3476]' : 'text-gray-900'}`}>{slab.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
               <div className="flex flex-col items-center space-y-2">
                 <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                   <Award className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] font-bold text-gray-800 leading-tight">1-Year Repair Service Warranty*</p>
               </div>
               <div className="flex flex-col items-center space-y-2">
                 <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
                   <RefreshCw className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] font-bold text-gray-800 leading-tight">Best Product Upgrade Offers</p>
               </div>
               <div className="flex flex-col items-center space-y-2">
                 <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                   <Star className="w-5 h-5" />
                 </div>
                 <p className="text-[10px] font-bold text-gray-800 leading-tight">20% Off Extra Warranty</p>
               </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-black text-gray-900 mb-4 text-center uppercase tracking-widest">Premium Benefits</h3>
            <div className="space-y-4 mb-4 px-2">
              {[
                { title: 'Doorstep Device Auction', desc: 'Auction your device at best market value.', icon: <Gavel className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: '1-Year Repair Service Warranty*', desc: 'Zero service costs on repairs.', icon: <Wrench className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { title: 'Best Product Upgrade Offers', desc: 'Exclusive deals for your next device.', icon: <Award className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-50' },
                { title: '20% Off Extra Warranty', desc: 'Save on your next device protection.', icon: <Star className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' }
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                  <div className={`${b.bg} ${b.color} p-2 rounded-lg`}>
                    {b.icon}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-black text-gray-900 leading-none">{b.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 flex justify-between items-center opacity-40">
           <img src={bbgLogo} alt="XtraCover" className="h-4 grayscale" />
           <p className="text-[9px] font-bold italic tracking-tight">*Terms and Conditions apply</p>
        </div>
      </div>
    </div>
  );
}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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

// Auction and Repair Benefits Component for auction_repair customers
function AuctionRepairBenefits({ sessionData }: { sessionData: any }) {
  const deviceType = sessionData?.deviceType || 'device';
  const deviceTypeDisplay = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  
  // Default benefits if benefitsJson is missing or malformed
  const defaultBenefits = {
    auctionService: {
      price: deviceType === 'mobile' ? 599 : 799,
      description: `Professional auction service for your ${deviceType}`
    },
    repairBenefit: {
      price: deviceType === 'mobile' ? 599 : 799, 
      description: `Professional repair services for your ${deviceType}`
    }
  };
  
  let benefits = defaultBenefits;
  
  if (sessionData?.benefitsJson) {
    try {
      const parsedBenefits = typeof sessionData.benefitsJson === 'string' 
        ? JSON.parse(sessionData.benefitsJson) 
        : sessionData.benefitsJson;
      benefits = { ...defaultBenefits, ...parsedBenefits };
    } catch (error) {
      console.error('Error parsing benefits JSON:', error);
      // Continue with defaultBenefits
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200/60 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <CheckCircle className="h-6 w-6 mr-3 text-orange-600" />
          Your {deviceTypeDisplay} BBG Benefits
        </h3>
        <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          PREMIUM SERVICES
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-sm text-orange-800 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Your device qualifies for our premium auction and repair services. Contact us to activate these benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auction Service Card */}
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 rounded-xl p-6 text-center hover:shadow-md transition-all duration-300">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-full">
              <Gavel className="h-8 w-8 text-white" />
            </div>
          </div>
          <h4 className="text-lg font-bold text-orange-800 mb-2">Auction Service</h4>
          <div className="text-3xl font-bold text-orange-600 mb-3">
            ₹{Number(benefits.auctionService?.price || (deviceType === 'mobile' ? 599 : 799))}
          </div>
          <p className="text-sm text-orange-700 bg-white/50 px-3 py-2 rounded-lg">
            {benefits.auctionService?.description || `Professional auction service for your ${deviceType}`}
          </p>
        </div>

        {/* Repair Benefit Card */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-xl p-6 text-center hover:shadow-md transition-all duration-300">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-500 p-3 rounded-full">
              <Wrench className="h-8 w-8 text-white" />
            </div>
          </div>
          <h4 className="text-lg font-bold text-amber-800 mb-2">Repair Benefit</h4>
          <div className="text-3xl font-bold text-amber-600 mb-3">
            ₹{Number(benefits.repairBenefit?.price || (deviceType === 'mobile' ? 599 : 799))}
          </div>
          <p className="text-sm text-amber-700 bg-white/50 px-3 py-2 rounded-lg">
            {benefits.repairBenefit?.description || `Professional repair services for your ${deviceType}`}
          </p>
        </div>
      </div>

      {/* Value Summary */}
      <div className="mt-6 bg-white/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Total Services Value:</span>
          <span className="text-lg font-bold text-orange-600">
            ₹{(Number(benefits.auctionService?.price || (deviceType === 'mobile' ? 599 : 799)) + 
               Number(benefits.repairBenefit?.price || (deviceType === 'mobile' ? 599 : 799)))}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">You Paid:</span>
          <span className="text-lg font-bold text-green-600">₹{sessionData.planPrice || (deviceType === 'mobile' ? '499' : '799')}</span>
        </div>
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
          <p className="text-sm font-semibold text-green-800 flex items-center justify-center">
            <Star className="w-4 h-4 mr-2" />
            You saved ₹{(Number(benefits.auctionService?.price || (deviceType === 'mobile' ? 599 : 799)) + 
                        Number(benefits.repairBenefit?.price || (deviceType === 'mobile' ? 599 : 799))) - 
                       Number(sessionData.planPrice || (deviceType === 'mobile' ? 499 : 799))} with this BBG plan!
          </p>
        </div>
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
        if (response.ok) return response.json();
        return null;
      } catch {
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

  // Fix: wouter's useLocation only returns pathname, not search. Use window.location.search.
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, [location]);

  // Version bump forces all stale localStorage data to be discarded
  const CACHE_VERSION = 'v3'; // bumped - URL-params approach

  useEffect(() => {
    if (thankYouData) {
      setSessionData(thankYouData);
      localStorage.setItem('thankYouData', JSON.stringify({ ...thankYouData, _v: CACHE_VERSION }));
      localStorage.setItem('thankYouDataTimestamp', Date.now().toString());
    } else {
      // Check localStorage
      const storedData = localStorage.getItem('thankYouData');
      const storedTimestamp = localStorage.getItem('thankYouDataTimestamp');
      if (storedData && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp);
        const now = Date.now();
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          try {
            const parsedData = JSON.parse(storedData);
            if (parsedData._v !== CACHE_VERSION) {
              localStorage.removeItem('thankYouData');
              localStorage.removeItem('thankYouDataTimestamp');
            } else {
              const { _v, ...cleanData } = parsedData;
              setSessionData(cleanData);
            }
          } catch {
            localStorage.removeItem('thankYouData');
            localStorage.removeItem('thankYouDataTimestamp');
          }
        } else {
          localStorage.removeItem('thankYouData');
          localStorage.removeItem('thankYouDataTimestamp');
        }
      }
    }
  }, [thankYouData]);

  // When URL has a voucherCode (fresh PayU redirect), seed sessionData from URL params first
  // then fetch fresh customer data from DB (gives us devicePurchaseDate + slabs)
  useEffect(() => {
    const urlVoucher = new URLSearchParams(window.location.search).get('voucherCode');
    if (urlVoucher) {
      // Seed from URL params immediately so the page isn't blank
      const urlParams = new URLSearchParams(window.location.search);
      setSessionData((prev: any) => ({
        type: urlParams.get('type') || prev?.type || 'customer',
        status: urlParams.get('status') || prev?.status || 'success',
        voucherCode: urlParams.get('voucherCode') || prev?.voucherCode,
        customerName: urlParams.get('customerName') || prev?.customerName,
        deviceType: urlParams.get('deviceType') || prev?.deviceType,
        brand: urlParams.get('brand') || prev?.brand,
        modelName: urlParams.get('modelName') || prev?.modelName,
        planType: urlParams.get('planType') || urlParams.get('benefitType') || prev?.planType,
        benefitType: urlParams.get('benefitType') || urlParams.get('planType') || prev?.benefitType,
        devicePurchaseDate: urlParams.get('devicePurchaseDate') || prev?.devicePurchaseDate,
        txnid: urlParams.get('txnid') || prev?.txnid,
        amount: urlParams.get('amount') || prev?.amount,
        paymentMethod: urlParams.get('paymentMethod') || prev?.paymentMethod,
        // keep invoice / slabs from previous state if already loaded
        invoiceNumber: prev?.invoiceNumber,
        invoiceUrl: prev?.invoiceUrl,
        registrationSlabData: prev?.registrationSlabData,
      }));
    }
  }, []); // run once on mount




  // Always fetch fresh customer data from DB when we have a voucherCode
  // This gives us registrationSlabData (slabs) and devicePurchaseDate from the actual DB
  const urlVoucherCode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('voucherCode')
    : null;
  const knownVoucherCode = sessionData?.voucherCode || urlVoucherCode;

  const { data: freshCustomerData } = useQuery({
    queryKey: ['/api/customer/by-voucher', knownVoucherCode],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/customer/by-voucher/${encodeURIComponent(knownVoucherCode!)}`);
        if (response.ok) return response.json();
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!knownVoucherCode,
    retry: false
  });

  // Merge fresh DB data into sessionData (fills in slabs + devicePurchaseDate)
  useEffect(() => {
    if (freshCustomerData) {
      setSessionData((prev: any) => ({
        ...prev,
        // Only fill in missing fields from fresh data
        devicePurchaseDate: prev?.devicePurchaseDate || freshCustomerData.devicePurchaseDate,
        registrationSlabData: prev?.registrationSlabData || freshCustomerData.registrationSlabData,
        planType: prev?.planType || freshCustomerData.planType,
        benefitType: prev?.benefitType || freshCustomerData.benefitType,
        benefitsJson: prev?.benefitsJson || freshCustomerData.benefitsJson,
        planPrice: prev?.planPrice || freshCustomerData.planPrice,
      }));
    }
  }, [freshCustomerData]);

  // Use session data if available, otherwise fall back to URL parameters
  const type = sessionData?.type || params?.get('type');
  const status = sessionData?.status || params?.get('status') || 'success'; // Default to success for backward compatibility
  const sellerCode = sessionData?.sellerCode || params?.get('sellerCode');
  const voucherCode = sessionData?.voucherCode || params?.get('voucherCode');
  const paymentMethod = sessionData?.paymentMethod || params?.get('paymentMethod');
  const txnid = sessionData?.txnid || params?.get('txnid');
  const error = sessionData?.error || params?.get('error');
  const errorMessage = sessionData?.errorMessage || params?.get('errorMessage');
  

  const planType = sessionData?.planType || sessionData?.benefitType || params?.get('planType');
  const planName = sessionData?.planName || JSON.parse(sessionData?.benefitsJson || '{}')?.planName || params?.get('planName') || '';
  
  const registrationSlabData = typeof sessionData?.registrationSlabData === 'string' 
    ? JSON.parse(sessionData.registrationSlabData) 
    : sessionData?.registrationSlabData;

  const isBbg = planType === 'bbg' || 
                planType === 'bundle' || 
                planName.toLowerCase().includes('bbg') || 
                planName.toLowerCase().includes('buy back') ||
                !!registrationSlabData;

  const handleDownloadInvoice = () => {
    // Check if server-generated invoice is available
    const serverInvoiceUrl = sessionData?.invoiceUrl;
    if (serverInvoiceUrl) {
      // Open server-generated invoice in new tab for download
      window.open(serverInvoiceUrl, '_blank');
      return;
    }

    // Fallback to client-side PDF generation if server invoice not available
    // Get invoice data from session or URL parameters
    const invoiceData = {
      voucherCode,
      date: new Date().toLocaleDateString('en-IN'),
      customerName: sessionData?.customerName || params?.get('customerName') || 'Customer',
      customerEmail: sessionData?.email || params?.get('email') || '',
      customerPhone: sessionData?.contact || params?.get('contact') || '',
      customerPincode: sessionData?.pincode || params?.get('pincode') || '',
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
    // Use base64 encoded logo for reliable PDF generation
    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAoCAYAAAAqoGhiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAgFSURBVHgB7Z3Lbh05EIafMrfYeQM/gTd5gshvYL+B7TfwG9h+A9tvYPsN7CfIJk+QTd7A8hMkb+BsFrOYTZ5AFNAFJ1QVRbbdbdN3tgGCEFtdXVVd/6+qyO4228wMD4jLy8tvBwcHr4nof4norZmdI/rMzH8x82fP877c3d29+bx9/Pj82/Pnz1+trKy8IKL/MPNzIvqBmX9n5s/MfM3Mn8fj8dej0ejP/0ufLiwsnBLRKyJ6w8yfmPmKiK48z/tzOBx+WVpa+uZxGfhAIKK3RHRh/T6q9f6vmb+srq7+8fTp03/T9mhqYlks/CKiX4noH2b+7Hnen0dHR1dnZ2fb/f39X9bX1//V7+vt7e3h/v7+z+vr6283NzffbGxs/Nrt9nN3d+dt+Pz8/CsR/VY4Oj6srKw8e/HixUtm/p2ZPzLzNTP/VToKmXlwfHz8eX19/c/pdJ9msVgsiGhbMhIz/8zMvzLzB2b+f2Q4HP5pPcCTwmO9tNb+P0OZIAJ7d3f3+9HR0fv19fV/B4PBb0mC3d3db7vdrrvT6VzTBCg8F01iu7vf1WowN2wHdrvdP9bW1n4vNxEa3/v7+z/u7Oxsz2MxTgfLYrEgohd2d/uemf/CQZhXxuPxP/bOd0VEO51Op/E1u1ZJbfP7zXRa7p9xgJrFZTJgwefTUqKNjY2/9/b23uj5SQcrGI/Hf9ihcJWINv/PCWl6FxKOnfnKfJnm8T3Qg1L3GYnb5k4GV/R+F2f6WUPqd8YgS8yT3d3db9P2MJDuq4sRvV6PiOiy+xmEcXV1dbm1tfVqeXn5D/1+r9f7S9cpOi46/hJ06b1iX6s+8bpaHwTGZ5tImkYZP+zv7/9md9Q36ft+XWFdBAl5cHLtT09P7/R6vdeLxWJBRJd58zjn3zDz3+PFt+84Do1Go7/y1y8WC1kMv2sj/mImJ2PtBRFN5JjVarXY3t7e3djY+Ed7T9j3pY6xjI82XR+fn5/X/i5xLJOZh9A2Nzf/lrFZvyMex75/rRUvjLMEt8J6AY/19PG7qI7n9H69s+D4Zja5GiIkHiGNfEYSJJ/3kIej3qJr4w9ItNFVcA+d8Jmk25vVkuEK15vbMg1g0qjCYrH4kZJjLFv79g4yOaEm2Q7fGr/1M5YjkLqNXHbNJrPHvdZlNwdnE9TxhbEkXxO5z6zXMh4j2+E4I5kZG4EJfEY25uKcuJQjBYzJXbevgTJzLJGOqQwWCMcZGZsb4/xYQQhTQ7NuXDOe3T4n9jXgIGaSSWCRbPBh+DUfkwbNzLHC9ujcNlh4rvPl5eUXOzsGQ+L1uY4lxlNOVp3tKfyOa5F8Xlr9LBFjZpPrCsrXhLMXGpHpLMYG7Ky++2qJuJKYONZKMH8Qhm8hk1NMpXCtjHFpG2ZYXw2WOH8wGLzu9/tvBoPBq/D9YLF04sWI3cnrS6yFfhLnDSxHOEJxpF2BT5tQ+lPeQyYN6/RzWBelYNW1Lco9Lmz7+vr6H9vb2+9xnI1hPLe9vf2+bqzN5WBZzPyBZs4EWGCPawEHT6/XeyGJZikfCCaQZNxGJg/GEEMGLrfTEKOKR8LrzWQsm1hxvuX3kq6f1yB1xjLRlVHKp1a8eNDH8HmdqIgZiZIVIzI5/+Gc/3w2Xl5e/mNzc/NdqePJfMI5n5YmppXy3BnLMoKON6Qzx7LXaXQvlcphlXxeOL8XVrEeS8cjJpzCMLHNZPNiZLl6ZGaZKcNGJqfqbCbzTJOUKGUcO7YjG60vCKcxvGqH3X6/v720tPQtzI/Qbgh4XabEPOW5M5ZlhMzLR4kH0iYM1sJONFqLY8i2MQxjECKKNvSgmcxrbQqrhPrfIiIlnFo8MJqAGrx5EaWK10imMGJd/sQ11A2rXq/3w/r6+h9ra2t/wjhj6WJNhNMWjQ82Y4SrjYjQcxDjUYNlJFN8gLWFNOIhxrLJJUGEJN3G8e2CWzKNTOFDJ5Gx4mVclDIFcWZUytcfTMcRqsaJxzwJajGXPYb+ZOYr4X9/f/+n0vGFJhOUHGPF9cHmBqsrk3e4NuJbG3mNJJPIxj4ZVIcLjb3GyKauT2QKp1Hc97BpyLWbNjXpnx2OjI4vmfkDS2excB6tPsj8qkbqjZX5DhVcllO4Wh/qkqvEevFUNhkZpVCsZubdZBK5pCOzWCZqc6cydxQ8WPjhaTKPyQNT6gxWyFhST5fQ1u/3d3d2dmqHFJ2I2PiRmpAoZWEKdZn0XDbdVqnlBTLJwzWZE0fFfJJ9P0w8L6TUYLdvI1P5OMbx2TCeM4HnM+HDjPaEvqJHjmvjHlIfx2SSOr7yedJJFNoUNjKJT8LyPZVYkkzqKHFcYr+yWQmnyxpNJhPgZFg9vtD6mF1fOrFlPE4ZVmELGaJQNEolnEvjcEp6UhKLfhBnHGUO5JDQhD7tKIx9e9yKPww2OrnOBWBZOGTmK2b+yMy3j6bh3eGWmcEkN8z8bx72A9b1J2a+vbm5+e8h1f6+5SuLxWJJyh9Ivmv8i8YNFCWZz7d4YGqOVf+ByVcWi8WCiNZaR+rBA9LIr0aBtz9w92iMYrXO1IOXGBa/s5F8fq6FXy7aOK01+t8B7+L6MFg5FWwAAAAASUVORK5CYII=';
    
    try {
      // Add the XTRACOVER logo to the PDF
      doc.addImage(logoBase64, 'PNG', 25, currentY - 5, 30, 8);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Fallback to text if logo fails
      doc.setFontSize(14);
      doc.setTextColor('#E72829');
      doc.text('XTRACOVER', 25, currentY);
    }
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
    doc.rect(140, invoiceBoxY, 55, 42);
    doc.setFontSize(8);
    doc.text('Invoice No.', 142, invoiceBoxY + 8);
    doc.text('Dated', 180, invoiceBoxY + 8);
    doc.text('XTPLD/25-26/' + invoiceData.voucherCode, 142, invoiceBoxY + 18);
    doc.text(invoiceData.date, 180, invoiceBoxY + 18);
    doc.text('Delivery Note', 142, invoiceBoxY + 26);
    doc.text('Mode/Payment', 175, invoiceBoxY + 26);
    doc.text('Online Payment', 142, invoiceBoxY + 32);
    doc.text('PO' + invoiceData.voucherCode, 142, invoiceBoxY + 38);
    
    currentY = Math.max(currentY + 8, invoiceBoxY + 47);
    
    // Customer Information section
    const customerSectionY = currentY;
    doc.rect(25, customerSectionY, 170, 35);
    doc.setFontSize(8);
    doc.text('Customer Information', 27, customerSectionY + 8);
    
    // Customer details in a grid format
    doc.setFontSize(9);
    doc.text('Name:', 27, customerSectionY + 16);
    doc.text(invoiceData.customerName, 50, customerSectionY + 16);
    
    doc.text('Email:', 27, customerSectionY + 23);
    doc.text(invoiceData.customerEmail, 50, customerSectionY + 23);
    
    doc.text('Phone:', 120, customerSectionY + 16);
    doc.text(invoiceData.customerPhone, 145, customerSectionY + 16);
    
    doc.text('Pincode:', 120, customerSectionY + 23);
    doc.text(invoiceData.customerPincode, 145, customerSectionY + 23);
    
    currentY = customerSectionY + 45;
    
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
    doc.text('Total   Amount Chargeable (in words):', 27, currentY);
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
    
    // Declaration section - full width due to longer BBG text
    const declarationY = currentY;
    
    // Declaration (compressed font size and spacing)
    doc.setFontSize(6);
    doc.text('Declaration:', 27, declarationY);
    const declarations = [
      'BBG applicable only on the original device registered with a valid BBG voucher and tax invoice.',
      'Assured value as per voucher/slab on bbg.xtracover.com; slabs valid only if BBG is bought within 1 year of device invoice.',
      'One successful claim per voucher; minimum 3-month waiting period from BBG purchase.',
      'Device must be functional and pass QC; original box, charger & accessories and Govt. ID mandatory.',
      'Free Device Repair: service charges waived once; parts cost extra. Auction Service (if QC fails): highest bid on authorized platform is final.',
      'BBG is non-transferable and non-refundable; fraudulent claims will be blacklisted and may invite legal action.',
      'Customer must factory-reset and remove all data; XtraCover not liable for data recovery after handover.'
    ];
    
    // Use smaller line spacing for compact layout
    declarations.forEach((decl, i) => {
      doc.text(decl, 27, declarationY + 5 + (i * 3), { maxWidth: 160 });
    });
    
    // Calculate where declarations end
    const declarationEndY = declarationY + 5 + (declarations.length * 3) + 5;
    
    // Bank details positioned below declarations to avoid overlap
    doc.setFontSize(6);
    doc.text("Company's Bank Details:", 27, declarationEndY);
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
      doc.text(detail, 27, declarationEndY + 5 + (i * 3));
    });
    
    currentY = declarationEndY + (bankDetails.length * 3) + 10;
    
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
          subtitle: "Referral Partner Registration Successful",
          message: "Earn ₹100 on every Mobile and ₹175 on every Laptop protection plan sold.",
          code: sellerCode,
          codeLabel: "Your Referral Code:",
          isFailure: false,
          details: [
            "Share your Referral Code with customers during purchase",
            "Track your commission earnings through your portal",
            "Get dedicated support for all queries",
            "Monthly commission payments to your registered account"
          ]
        };
      case 'customer':
        return {
          icon: <Smartphone className="h-16 w-16 text-green-600" />,
          title: "Purchase Successful!",
          subtitle: "Thank you for choosing XtraCover",
          message: `You’ve taken a smart step to safeguard your device and its future value.\nMore value for you. Less waste for the planet.`,
          code: voucherCode,
          codeLabel: "Your BBG Voucher Code:",
          isFailure: false,
          details: [
            "Confirmation email sent to your registered email address",
            "Complete your device registration with IMEI / Serial No.",
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
  const partnerName = sessionData?.distributorName || sessionData?.customerName || params?.get('customerName') || params?.get('distributorName') || 'Official Partner';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSaveCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCard = (logoImg?: HTMLImageElement) => {
      const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
      gradient.addColorStop(0, '#1e3a7a');
      gradient.addColorStop(0.4, '#15285c');
      gradient.addColorStop(1, '#0f1d45');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 700);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.arc(1000, 50, 350, 0, Math.PI * 2);
      ctx.fill();

      if (logoImg) {
        const logoH = 100;
        const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
        ctx.drawImage(logoImg, (1200 - logoW) / 2, 60, logoW, logoH);
      }

      ctx.textAlign = 'center';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 28px sans-serif';
      ctx.fillText('Name', 600, 260);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 60px sans-serif';
      ctx.fillText(partnerName, 600, 360);

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 32px sans-serif';
      const codeLabel = 'Referral Code ';
      const codeVal = content.code || '';
      const labelW = ctx.measureText(codeLabel).width;
      ctx.font = '900 32px sans-serif';
      const valW = ctx.measureText(codeVal).width;
      const totalW = labelW + valW;
      const startX = (1200 - totalW) / 2;
      ctx.textAlign = 'left';
      ctx.font = '500 32px sans-serif';
      ctx.fillText(codeLabel, startX, 450);
      ctx.font = '900 32px sans-serif';
      ctx.fillText(codeVal, startX + labelW, 450);
      ctx.textAlign = 'center';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '600 28px sans-serif';
      ctx.fillText('Referral Partner', 600, 500);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 580);
      ctx.lineTo(1120, 580);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 24px sans-serif';
      const footerText = 'Use the referral code at bbg.xtracover.com to claim your discount';
      ctx.fillText(footerText, 600, 645);

      const link = document.createElement('a');
      link.download = `XtraCover_Partner_Card_${content.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => drawCard(img);
    img.onerror = () => drawCard();
    img.src = refPartnerLogo;
  };

    const handleSaveCustomerCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1250; // Increased height for rectangular look and more space
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCustomerCard = (logoImg?: HTMLImageElement) => {
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1000, 1250);

      // Header blue bar
      ctx.fillStyle = '#1b3476';
      ctx.fillRect(0, 0, 1000, 200);

      if (logoImg) {
        const logoH = 80;
        const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
        ctx.drawImage(logoImg, (1000 - logoW) / 2, 60, logoW, logoH);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 60px sans-serif';
      ctx.fillText(sessionData?.customerName || 'Customer', 500, 300);

      // Divider line
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 330);
      ctx.lineTo(950, 330);
      ctx.stroke();

      // Details Grid
      ctx.textAlign = 'left';
      ctx.font = '30px sans-serif';
      ctx.fillStyle = '#6b7280'; // gray-500

      const leftCol = 70;
      const rightCol = 520;
      const row1 = 380;
      const row2 = 440;
      const row3 = 500;

      // Labels
      ctx.fillText('Device:', leftCol, row1);
      ctx.fillText('Plan:', leftCol, row2);
      ctx.fillText('Device Purchase Date:', leftCol, row3);

      ctx.fillText('Voucher Code:', rightCol, row1);
      ctx.fillText('Plan Purchase Date:', rightCol, row2);
      ctx.fillText('Registration Source:', rightCol, row3);

      const brand = sessionData?.brand || params?.get('brand') || '';
      const model = sessionData?.deviceModel || sessionData?.modelName || params?.get('model') || params?.get('modelName') || '';
      const devicePurchaseDate = formatDateDDMMYYYY(sessionData?.devicePurchaseDate || params?.get('devicePurchaseDate'));

      // Values
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(brand + ' ' + model, leftCol + 110, row1);
      ctx.fillText(isBbg ? 'BuyBack Guarantee' : 'Extend+', leftCol + 80, row2);
      ctx.fillText(devicePurchaseDate, leftCol + 320, row3);

      ctx.fillText(voucherCode || 'XYZ', rightCol + 210, row1);
      ctx.fillText(new Date().toLocaleDateString('en-IN'), rightCol + 270, row2);
      ctx.fillText(sessionData?.registrationSource || 'Direct', rightCol + 270, row3);

      // Bottom border for details
      ctx.strokeStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(50, 530);
      ctx.lineTo(950, 530);
      ctx.stroke();

      if (isBbg) {
        // Resale Value Chart
        ctx.fillStyle = '#1b3476';
        ctx.font = 'bold 35px sans-serif';
        ctx.fillText('Resale Value Chart', 70, 590);

        const tableTop = 620;
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(70, tableTop, 860, 50); // Header bg

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('DEVICE AGE', 250, tableTop + 35);
        ctx.fillText('RESALE VALUE', 650, tableTop + 35);

        const slabs = registrationSlabData?.slabs || [
          { minMonths: 4, maxMonths: 6, percentage: 70 },
          { minMonths: 7, maxMonths: 12, percentage: 50 },
          { minMonths: 13, maxMonths: 18, percentage: 45 },
          { minMonths: 19, maxMonths: 24, percentage: 40 },
          { minMonths: 25, maxMonths: 30, percentage: 30 },
          { minMonths: 31, maxMonths: 36, percentage: 25 },
        ];

        slabs.slice(0, 6).forEach((slab: any, idx: number) => {
          const y = tableTop + 100 + (idx * 60);
          if (idx % 2 !== 0) {
            ctx.fillStyle = '#f9fafb';
            ctx.fillRect(70, y - 40, 860, 60);
          }
          ctx.font = '28px sans-serif';
          ctx.fillStyle = '#374151';
          ctx.textAlign = 'center';
          ctx.fillText(`${slab.minMonths}th-${slab.maxMonths}th month`, 330, y);
          ctx.font = 'bold 28px sans-serif';
          ctx.fillStyle = slab.percentage >= 70 ? '#1b3476' : '#374151';
          ctx.fillText(`${slab.percentage}%`, 730, y);
        });

        // Benefits Icons
        const benefitsY = 980;
        
        const drawIcon = (x: number, y: number, char: string, color: string) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x - 40, y - 90, 80, 80, 15);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 45px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(char, x, y - 35);
        };

        drawIcon(250, benefitsY, '★', '#3b82f6');
        drawIcon(500, benefitsY, '↻', '#10b981');
        drawIcon(750, benefitsY, '✓', '#6366f1');

        ctx.textAlign = 'center';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#111827';
        ctx.fillText('1-Year Extended Repair', 250, benefitsY + 20);
        ctx.fillText('Best Product', 500, benefitsY + 20);
        ctx.fillText('20% Off on 1-Year', 750, benefitsY + 20);
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Service Warranty*', 250, benefitsY + 50);
        ctx.fillText('Upgrade Offers', 500, benefitsY + 50);
        ctx.fillText('Extended Warranty', 750, benefitsY + 50);
      } else {
        // Extend+ Benefits
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'center';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText('PREMIUM BENEFITS', 500, 590);

        const benefits = [
          { title: 'Doorstep Device Auction', desc: 'Auction your device at the best market value.' },
          { title: '1-Year Extended Repair Service Warranty*', desc: 'Zero service costs on repairs.' },
          { title: 'Best Product Upgrade Offers', desc: 'Exclusive deals for your next device purchase.' },
          { title: '20% Off on 1-Year Extended Warranty', desc: 'Save on protection of your next device purchase.' }
        ];

        benefits.forEach((b, idx) => {
          const y = 670 + (idx * 100);
          ctx.textAlign = 'left';
          ctx.font = 'bold 30px sans-serif';
          ctx.fillStyle = '#111827';
          ctx.fillText('✓ ' + b.title, 150, y);
          ctx.font = '22px sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.fillText(b.desc, 190, y + 35);
        });
      }

      ctx.textAlign = 'right';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('*Terms and Conditions apply', 950, 1220);

      const link = document.createElement('a');
      link.download = `XtraCover_Card_${voucherCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => drawCustomerCard(img);
    img.onerror = () => drawCustomerCard();
    img.src = bbgLogo;
  };

  const isDistributor = type === 'distributor';

  if (isDistributor) {
    return (
      <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
        <div className="md:w-5/12 bg-gray-50/50 flex flex-col p-5 sm:p-8 lg:p-12 relative border-r border-gray-100 justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/40 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/4"></div>

          <div className="relative z-10 max-w-sm mx-auto w-full space-y-6">
            {content.code && (
              <div className="group space-y-6">
                <div id="partner-card" className="relative rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center text-center group-hover:scale-[1.02] transition-transform duration-500" style={{ background: 'linear-gradient(160deg, #1e3a7a 0%, #15285c 40%, #0f1d45 100%)' }}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full blur-[60px] pointer-events-none -translate-y-1/4 translate-x-1/4"></div>
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/[0.02] rounded-full blur-[50px] pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

                  <div className="relative z-10 w-full px-6 pt-7 pb-5 flex flex-col items-center gap-5">
                    <img src={refPartnerLogo} alt="XtraCover Buy Back Guarantee" className="h-14 sm:h-16 w-auto object-contain drop-shadow-lg" />

                    <div className="w-full space-y-1">
                      <p className="text-white/50 text-sm font-medium tracking-wide">Name</p>
                      <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{partnerName}</h2>
                    </div>

                    <div className="w-full space-y-1.5 pt-1">
                      <p className="text-white text-base font-medium">
                        Referral Code <span className="font-black tracking-wide">{content.code}</span>
                      </p>
                      <p className="text-white/50 text-sm font-semibold tracking-wide">Referral Partner</p>
                    </div>
                  </div>

                  <div className="relative z-10 w-full px-6 py-4 border-t border-white/10 bg-white/[0.03]">
                    <p className="text-white/70 text-xs sm:text-sm font-medium">
                      Use the referral code at <span className="font-bold text-white/90">bbg.xtracover.com</span> to claim your discount
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSaveCard}
                    className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl h-12 font-bold shadow-xl transition-all active:scale-95 border-none"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Save ID Card as Image
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => copyToClipboard(content.code || '')}
                    className="w-full text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl h-10 text-xs font-bold transition-all"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy My Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center p-8 lg:p-20 bg-[#fcfdfe]">
          <div className="max-w-xl mx-auto w-full space-y-10">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {content.title}
              </h1>
              <p className="text-primary text-sm font-bold uppercase tracking-wider">
                {content.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 text-xl font-medium leading-relaxed">
                {content.message}
              </p>
            </div>

            {content.details.length > 0 && (
              <div className="grid gap-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  HOW TO GET STARTED
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                  {content.details.map((detail, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm font-semibold text-gray-600 leading-snug">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-10 border-t border-gray-100 space-y-8">
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900">
                  <Home className="h-5 w-5 mr-2" />
                  Go to Home
                </Button>
              </Link>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter">Support Email</span>
                  <a href="mailto:contactus@xtracover.com" className="text-xs font-bold text-gray-900 underline decoration-primary/30 underline-offset-4 decoration-2">
                    contactus@xtracover.com
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter">Helpline</span>
                  <a href="tel:+918860396039" className="text-xs font-bold text-gray-900 underline decoration-primary/30 underline-offset-4 decoration-2">
                    +91-8860396039
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12 font-sans">
      <div className="max-w-6xl w-full flex flex-col-reverse lg:flex-row items-start gap-12">
        {/* Left Column: Customer Card & Main Action */}
        <div className="lg:w-1/2 w-full space-y-8 lg:sticky lg:top-12">
          {!content.isFailure && type === 'customer' && (
            <div className="space-y-6">
              <CustomerCardPreview 
                sessionData={sessionData} 
                params={params} 
                isBbg={isBbg} 
                voucherCode={voucherCode || ''} 
              />
              
              {status === 'success' && (
                <Button 
                  onClick={handleSaveCustomerCard}
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl h-14 font-bold shadow-xl transition-all active:scale-95 border-none"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}

              {/* DEBUG INFO - remove after fixing */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-xs font-mono text-gray-700 space-y-1">
                <p className="font-bold text-yellow-700 mb-2">🐛 Debug Info (raw session data)</p>
                <p><b>devicePurchaseDate:</b> {String(sessionData?.devicePurchaseDate ?? 'undefined')}</p>
                <p><b>planType:</b> {String(sessionData?.planType ?? 'undefined')}</p>
                <p><b>benefitType:</b> {String(sessionData?.benefitType ?? 'undefined')}</p>
                <p><b>deviceType:</b> {String(sessionData?.deviceType ?? 'undefined')}</p>
                <p><b>brand:</b> {String(sessionData?.brand ?? 'undefined')}</p>
                <p><b>modelName:</b> {String(sessionData?.modelName ?? 'undefined')}</p>
                <p><b>deviceModel:</b> {String(sessionData?.deviceModel ?? 'undefined')}</p>
                <p><b>voucherCode:</b> {String(sessionData?.voucherCode ?? 'undefined')}</p>
                <p><b>customerName:</b> {String(sessionData?.customerName ?? 'undefined')}</p>
              </div>
            </div>
          )}
          
          {content.isFailure && (
            <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-red-50">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-8">{content.message}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-primary hover:opacity-90 h-14 rounded-2xl font-bold"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Details & Next Steps */}
        <div className="lg:w-1/2 w-full space-y-8">
          <div className="text-center lg:text-left">
            {!content.isFailure && (
              <div className="flex items-center justify-center lg:justify-start">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
            )}
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">
              {content.title}
            </h1>
            <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
              {content.subtitle}
            </p>
            <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
              {content.message}
            </p>
          </div>

          {content.code && !content.isFailure && (
            <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 text-center lg:text-left shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-2">{content.codeLabel}</p>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="text-3xl font-black tracking-wider" style={{ color: '#254696' }}>{content.code}</span>
                <button 
                  onClick={() => copyToClipboard(content.code || '')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Copy code"
                >
                  <Copy className="h-5 w-5 text-gray-400 hover:text-primary" />
                </button>
              </div>
            </div>
          )}

          {!content.isFailure && isBbg && registrationSlabData && (
            <BrandClaimValues sessionData={sessionData} />
          )}

          {!content.isFailure && !isBbg && sessionData?.planType === 'auction_repair' && (
            <AuctionRepairBenefits sessionData={sessionData} />
          )}

          {content.details.length > 0 && !content.isFailure && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                NEXT STEPS
              </h3>
              <div className="space-y-4">
                {content.details.map((detail, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed pt-1">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            {!content.isFailure && (
              <>
                <div className="flex flex-col gap-3">
                  {status === 'success' && content.code && (
                    <Button 
                      className="w-full bg-primary hover:opacity-90 h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 group"
                      onClick={() => window.location.href = `/register?voucher=${content.code}`}
                    >
                      Complete My Registration
                      <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {status === 'success' && (
                    <Button 
                      onClick={handleDownloadInvoice} 
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl font-bold border-emerald-200 text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Receipt
                    </Button>
                  )}
                  <Link href="/" className="flex-1">
                    <Button 
                      variant="ghost" 
                      className="w-full h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-900"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Go to Home
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 pt-6 border-t border-gray-100">
            <div className="space-y-1 text-center lg:text-left">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter">Support Email</span>
              <a href="mailto:contactus@xtracover.com" className="text-xs font-bold text-gray-900 underline decoration-primary/30 underline-offset-4 decoration-2">
                contactus@xtracover.com
              </a>
            </div>
            <div className="space-y-1 text-center lg:text-left">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter">Helpline</span>
              <a href="tel:+918860396039" className="text-xs font-bold text-gray-900 underline decoration-primary/30 underline-offset-4 decoration-2">
                +91-8860396039
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
