import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Loader2,
  Lock,
  CheckCircle,
  Tag,
  XCircle,
  Info,
  Calendar,
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be 10 digits starting with 6-9"),
  email: z.string().email("Please enter a valid email address"),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  state: z
    .string()
    .optional(),
  devicePurchaseDate: z
    .string()
    .min(1, "Device purchase date is required"),
  deviceModel: z
    .string()
    .min(1, "Device model is required"),
  referralCode: z.string().optional(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface SelectedPlan {
  id: number;
  planType: "bbg" | "extend_plus" | "bundle";
  deviceType: "laptop" | "mobile";
  price: number;
  planName: string;
  validity: string;
  coverage: string;
  brand: string | null;
  model: string | null;
  deviceAgeSelection: string | null;
}

interface ReferralValidation {
  valid: boolean;
  partnerName?: string;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  discountedPrice?: number;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [referralValidation, setReferralValidation] = useState<ReferralValidation | null>(null);
  const [referralValidating, setReferralValidating] = useState(false);



  const getPlansUrl = useCallback(() => {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (storedPlan) {
      try {
        const parsed = JSON.parse(storedPlan);
        if (parsed.plansQuery) {
          return `/plans${parsed.plansQuery}`;
        }
      } catch {}
    }
    return "/plans";
  }, []);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        if (
          parsedPlan &&
          parsedPlan.price &&
          parsedPlan.planName &&
          parsedPlan.planType &&
          parsedPlan.deviceType
        ) {
          setSelectedPlan(parsedPlan);
        } else {
          setLocation(getPlansUrl());
        }
      } catch {
        setLocation(getPlansUrl());
      }
    } else {
      setLocation(getPlansUrl());
    }
  }, [setLocation, getPlansUrl]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      pincode: "",
      state: "",
      devicePurchaseDate: "",
      deviceModel: "",
      referralCode: "",
      agreeToTerms: false,
    },
  });

  useEffect(() => {
    if (selectedPlan?.model) {
      form.setValue("deviceModel", selectedPlan.model);
    }

    // Check for authenticated customer
    const isAuth = sessionStorage.getItem("customerAuthenticated") === "true";
    const savedPhone = sessionStorage.getItem("customerPhone");
    const storedDetails = sessionStorage.getItem("customerDetails");

    if (isAuth) {
      if (!savedPhone && !storedDetails) {
        // Authenticated but missing critical data (likely from an old session).
        // Redirect to login to refresh data.
        sessionStorage.removeItem("customerAuthenticated");
        toast({
          title: "Session Expired",
          description: "Please login again to sync your profile details.",
          variant: "destructive",
        });
        setLocation("/customer/login?redirect=/checkout");
        return;
      }

      if (savedPhone) {
         setOtpVerified(true);
         // Fetch fresh profile details from API
         fetch(`/api/customer/profile/${savedPhone}`)
           .then(res => {
             if (res.ok) return res.json();
             throw new Error('Failed to fetch profile');
           })
           .then(data => {
             if (data && Object.keys(data).length > 0) {
               console.log("Fetched fresh profile data:", data);
               
               const name = data.name || data.customer_name;
               const email = data.email || data.customer_email;
               const pincode = data.pincode || data.customer_pincode;
               const state = data.state || data.customer_state;

               // Filter out placeholder values from system auto-registration
               const finalName = name === "Customer" ? "" : (name || "");
               const finalEmail = email === "pending@xtracover.com" ? "" : (email || "");
               const finalPincode = pincode === "000000" ? "" : (pincode || "");

               if (finalName) form.setValue("name", finalName, { shouldValidate: true });
               if (finalEmail) form.setValue("email", finalEmail, { shouldValidate: true });
               if (finalPincode) form.setValue("pincode", finalPincode, { shouldValidate: true });
               if (state) form.setValue("state", state, { shouldValidate: true });
               form.setValue("contact", savedPhone, { shouldValidate: true });
               
               sessionStorage.setItem("customerDetails", JSON.stringify(data));
               
               toast({
                 title: "Welcome back!",
                 description: `Logged in as ${name || 'Customer'}`,
               });
             } else {
               console.warn("API returned empty data object");
               form.setValue("contact", savedPhone, { shouldValidate: true });
             }
           })
            .catch(err => {
              console.error("Error fetching profile:", err);
              form.setValue("contact", savedPhone, { shouldValidate: true });
            });
         }
    } else {
      // Not authenticated - check if we can pre-fill based on recent orders
      const savedPhoneForFill = sessionStorage.getItem("customerPhone");
      if (savedPhoneForFill) {
        fetch(`/api/customer/profile/${savedPhoneForFill}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const name = data.name === "Customer" ? "" : data.name;
              const email = data.email === "pending@xtracover.com" ? "" : data.email;
              const pincode = data.pincode === "000000" ? "" : data.pincode;

              if (name) form.setValue("name", name, { shouldValidate: true });
              if (email) form.setValue("email", email, { shouldValidate: true });
              if (pincode) form.setValue("pincode", pincode, { shouldValidate: true });
              if (data.state) form.setValue("state", data.state, { shouldValidate: true });
              if (data.phone) form.setValue("contact", data.phone, { shouldValidate: true });
            }
          })
          .catch(e => console.error("Auto-fetch error:", e));
      }
    }
  }, [selectedPlan, form]);

  const watchContact = form.watch("contact");
  const watchAgreeToTerms = form.watch("agreeToTerms");
  
  // Debug log form state
  const formValues = form.watch();
  const isFormValid = form.formState.isValid && otpVerified && watchAgreeToTerms;

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form Validation Errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("/api/otp/send", {
        method: "POST",
        body: { phone },
      });
      return response;
    },
    onSuccess: () => {
      setOtpSent(true);
      setCountdown(60);
      toast({
        title: "OTP Sent",
        description: "Please check your mobile for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const response = await apiRequest("/api/otp/verify", {
        method: "POST",
        body: { phone, otp },
      });
      return response;
    },
    onSuccess: () => {
      setOtpVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check the code and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = async () => {
    const contact = form.getValues("contact");
    if (!/^[6-9]\d{9}$/.test(contact)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }
    setOtpLoading(true);
    try {
      await sendOtpMutation.mutateAsync(contact);
    } catch (error: any) {
      // Error already handled by onError callback
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete OTP.",
        variant: "destructive",
      });
      return;
    }
    setVerifyLoading(true);
    try {
      await verifyOtpMutation.mutateAsync({
        phone: form.getValues("contact"),
        otp: otpCode,
      });
    } catch (error: any) {
      // Error already handled by onError callback
    } finally {
      setVerifyLoading(false);
    }
  };

  const validateReferralCode = async (code: string) => {
    if (!code || code.trim().length < 3) {
      setReferralValidation(null);
      return;
    }
    
    setReferralValidating(true);
    try {
      // First try to validate as a Special Code (price override)
      const specialResponse = await fetch('/api/special-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      
      if (specialResponse.ok) {
        const specialData = await specialResponse.json();
        if (specialData.success && specialData.specialCode && selectedPlan) {
          const specialCode = specialData.specialCode;
          const overridePrice = selectedPlan.deviceType === 'mobile' 
            ? parseFloat(specialCode.mobilePlanPrice) 
            : parseFloat(specialCode.laptopPlanPrice);

          setReferralValidation({
            valid: true,
            partnerName: "Special Pricing",
            discountType: 'flat',
            discountValue: selectedPlan.price - overridePrice,
            discountedPrice: overridePrice,
          });

          // Store identified special code flag in form context if needed, 
          // but we can just use the referralCode field
          
          toast({
            title: "Special Pricing Applied!",
            description: `Plan price updated to ₹${overridePrice}`,
          });
          setReferralValidating(false);
          return;
        }
      }

      // Fallback to Referral Code (percentage/flat discount)
      const response = await fetch(`/api/validate-referral-code/${encodeURIComponent(code.trim())}`);
      const data = await response.json();
      
      if (data.valid && selectedPlan) {
        let discountedPrice = selectedPlan.price;
        if (data.discountType === 'percentage' && data.discountValue) {
          discountedPrice = Math.round(selectedPlan.price - (selectedPlan.price * data.discountValue / 100));
        } else if (data.discountType === 'flat' && data.discountValue) {
          discountedPrice = Math.max(1, selectedPlan.price - data.discountValue);
        }
        
        setReferralValidation({
          valid: true,
          partnerName: data.partnerName,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountedPrice,
        });
        
        toast({
          title: "Referral Code Applied!",
          description: data.discountValue 
            ? `${data.discountType === 'percentage' ? data.discountValue + '%' : '₹' + data.discountValue} discount applied` 
            : "Valid referral code",
        });
      } else {
        setReferralValidation({ valid: false });
        toast({
          title: "Invalid Referral Code",
          description: "Please check the code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setReferralValidation({ valid: false });
    } finally {
      setReferralValidating(false);
    }
  };

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("/api/payment/initiate", {
        method: "POST",
        body: paymentData,
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast({
          title: "Payment Initiated",
          description: "Redirecting to payment gateway...",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (!otpVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlan) {
      toast({
        title: "No Plan Selected",
        description: "Please select a plan before continuing.",
        variant: "destructive",
      });
      return;
    }

    const checkoutData = {
      customerName: data.name,
      customerContact: data.contact,
      customerEmail: data.email,
      customerPincode: data.pincode,
      customerState: data.state,
      devicePurchaseDate: data.devicePurchaseDate,
      deviceModel: data.deviceModel,
      referralCode: data.referralCode || null,
      planId: selectedPlan.id,
      planType: selectedPlan.planType,
      deviceType: selectedPlan.deviceType,
      planName: selectedPlan.planName,
      amount: selectedPlan.price,
      validity: selectedPlan.validity,
      coverage: selectedPlan.coverage,
      brand: selectedPlan.brand,
      deviceAgeSelection: selectedPlan.deviceAgeSelection,
      isSpecialCode: referralValidation?.partnerName === "Special Pricing",
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    toast({
      title: "Proceeding to Payment",
      description: "Preparing payment gateway...",
    });

    paymentMutation.mutate(checkoutData);
  };

  const formatCoverage = (coverage: string | number | undefined) => {
    if (coverage == null) return "";

    const str = String(coverage).trim();
    const num = parseInt(str, 10);

    // If it looks like a number, standardize to "36 months"
    if (!isNaN(num)) {
      return `${num} month${num === 1 ? "" : "s"}`;
    }

    // Otherwise just show whatever is stored
    return str;
  };


  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600" data-testid="text-loading">
            Loading plan details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-br from-[#1b3476] to-[#254696] pt-6 pb-8 md:pt-10 md:pb-12 px-4 md:px-8 text-white relative flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col">
          <div className="mb-6 md:mb-8 -ml-2">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 h-auto"
              data-testid="button-back"
              onClick={() => setLocation(getPlansUrl())}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex items-start justify-between w-full gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center bg-white/10 shrink-0">
                <Shield className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="font-semibold text-xl md:text-3xl leading-tight">
                {selectedPlan?.planName?.replace('BBG', 'Buy Back Guarantee')}
              </div>
            </div>
            <div className="text-right shrink-0">
              {referralValidation?.valid && referralValidation.discountedPrice ? (
                <>
                  <div className="text-sm md:text-lg line-through text-white/60 mb-0.5 md:mb-1">₹{selectedPlan?.price}</div>
                  <div className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-0.5 md:mb-1">₹{referralValidation.discountedPrice}</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-white/80">INCL. GST</div>
                </>
              ) : (
                <>
                  <div className="text-3xl md:text-5xl font-bold tracking-tight mb-0.5 md:mb-1">₹{selectedPlan?.price}</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-white/80">INCL. GST</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 w-full flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 flex flex-col flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-8 flex flex-col flex-1 pb-6">
              {/* Full Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex gap-1">
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="As per any Govt. ID"
                          {...field}
                          className="bg-[#f8f9fa] border-0 h-[52px] rounded-xl px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#254696] focus-visible:bg-white transition-all shadow-none"
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="hidden">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={otpVerified}
                            data-testid="input-contact"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Keep OTP fields in DOM for hook form if ever needed */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex gap-1">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            {...field}
                            className="bg-[#f8f9fa] border-0 h-[52px] rounded-xl px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#254696] focus-visible:bg-white transition-all shadow-none"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pincode */}
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex gap-1">
                          Pincode <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="6-digit pincode"
                            maxLength={6}
                            {...field}
                            className="bg-[#f8f9fa] border-0 h-[52px] rounded-xl px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#254696] focus-visible:bg-white transition-all shadow-none"
                            data-testid="input-pincode"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="hidden">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-state">
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDIAN_STATES.map((stateName) => (
                              <SelectItem key={stateName} value={stateName}>
                                {stateName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <FormField
                    control={form.control}
                    name="devicePurchaseDate"
                    render={({ field }) => {
                      const today = new Date();
                      const maxDate = today.toISOString().split('T')[0];
                      const isBbgOrBundle = selectedPlan?.planType === 'bbg' || selectedPlan?.planType === 'bundle';
                      let minDate: string;
                      
                      if (isBbgOrBundle) {
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        minDate = sixMonthsAgo.toISOString().split('T')[0];
                      } else {
                        const threeYearsAgo = new Date();
                        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
                        minDate = threeYearsAgo.toISOString().split('T')[0];
                      }
                      
                      return (
                        <FormItem>
                          <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex gap-1">
                            Device Purchase Date <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type="date"
                                placeholder="dd/mm/yyyy"
                                {...field}
                                max={maxDate}
                                onClick={(e) => {
                                  try {
                                    (e.target as any).showPicker();
                                  } catch (err) {
                                    console.warn("showPicker not supported", err);
                                  }
                                }}
                                className="bg-[#f8f9fa] border-0 h-[52px] rounded-xl pl-12 pr-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#254696] focus-visible:bg-white transition-all shadow-none w-full xl:[&::-webkit-calendar-picker-indicator]:opacity-0 xl:[&::-webkit-calendar-picker-indicator]:absolute xl:[&::-webkit-calendar-picker-indicator]:w-full xl:[&::-webkit-calendar-picker-indicator]:h-full xl:[&::-webkit-calendar-picker-indicator]:cursor-pointer cursor-pointer"
                                data-testid="input-device-purchase-date"
                              />
                            </FormControl>
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                          <span>Referral Code (Optional)</span>
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="Enter code"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (referralValidation) {
                                  setReferralValidation(null);
                                }
                              }}
                              className={`bg-[#f8f9fa] border-0 h-[52px] rounded-xl pl-4 pr-20 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#254696] focus-visible:bg-white transition-all shadow-none ${
                                referralValidation?.valid === true ? 'ring-1 ring-green-500 bg-green-50' : 
                                referralValidation?.valid === false ? 'ring-1 ring-red-500 bg-red-50' : ''
                              }`}
                              data-testid="input-referral-code"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => validateReferralCode(field.value || '')}
                            disabled={referralValidating || !field.value || field.value.length < 3}
                            className="absolute right-1 top-1 bottom-1 h-auto px-4 text-xs font-bold text-[#1b3476] hover:bg-transparent hover:text-blue-800 disabled:opacity-50"
                            data-testid="button-apply-referral"
                          >
                            {referralValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "APPLY"}
                          </Button>
                        </div>
                        {referralValidation?.valid === true && (
                          <div className="flex items-center gap-2 text-green-600 text-xs font-medium mt-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>
                              Code applied! 
                              {referralValidation.discountValue && (
                                <span>
                                  {' '}({referralValidation.discountType === 'percentage' 
                                    ? `${referralValidation.discountValue}% off` 
                                    : `₹${referralValidation.discountValue} off`})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {referralValidation?.valid === false && (
                          <div className="flex items-center gap-2 text-red-600 text-xs font-medium mt-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Invalid referral code</span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 rounded-full border-gray-300 data-[state=checked]:bg-[#254696] data-[state=checked]:border-[#254696] data-[state=checked]:text-white"
                            data-testid="checkbox-terms"
                          />
                        </FormControl>
                        <div className="leading-none text-[13px] text-gray-500 font-medium">
                          By continuing, you agree to these{" "}
                          <a href="/terms-and-conditions" target="_blank" className="font-bold text-[#1b3476] hover:underline">Terms & Conditions</a>
                          {" "}and{" "}
                          <a href="https://www.xtracover.com/privacy-policy" target="_blank" className="font-bold text-[#1b3476] hover:underline">Privacy Policy</a>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-auto pt-6">
                  <div className="bg-[#f8f9fa] rounded-xl p-3 md:p-4 flex gap-3 mb-5 items-start border border-gray-50">
                    <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                      <span className="font-bold text-gray-800">Note:</span> Only devices purchased within India are eligible for XtraCover plans. The plan shall be subject to a cooling off period of 3 months from the date of plan purchase.
                    </p>
                  </div>

                <div className="pt-4 pb-2">
                  <Button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)(e);
                    }}
                    disabled={paymentMutation.isPending}
                    className="w-full h-14 bg-[#1b3476] hover:bg-[#132554] text-white text-[15px] font-semibold rounded-[16px] shadow-lg shadow-blue-900/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="button-continue-payment"
                  >
                    {paymentMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Secure Payment
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
                </div>
              </form>
            </Form>
          </div>
        
        {/* Footer */}
        <div className="bg-[#fcfdff] border-t border-gray-100 py-4 flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[11px] font-bold text-emerald-600 uppercase tracking-widest px-4 md:px-6 w-full mt-auto relative z-10">
          <div className="flex items-center gap-1.5 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            256-Bit AES Encryption
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0 mx-1"></div>
          <div className="shrink-0 text-gray-400">
            100% Secure Transaction
          </div>
        </div>
      </div>
    </div>
  );
}
