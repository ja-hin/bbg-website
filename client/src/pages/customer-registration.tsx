import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { insertCustomerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { validatePhoneNumber, validateEmail, validatePincode } from "@/lib/utils";
import FileUpload from "@/components/file-upload";
import { SuccessConfetti } from "@/components/confetti";
import { scrollToTopInstant } from "@/hooks/useScrollToTop";

// Generate unique session ID for cart abandonment tracking
const generateSessionId = () => {
  return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Stripe imports removed - using PayU only


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  ShoppingCart, 
  CheckCircle, 
  Smartphone, 
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Hash,
  Building,
  IndianRupee,
  Upload,
  Info,
  Calendar,
  ExternalLink,
  X
} from "lucide-react";

// Initialize Stripe - will be null if key not configured
// Stripe initialization removed - using PayU only

// Extended customer schema with validation
const customerSchema = z.object({
  // Customer Details
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  // Device Details
  deviceType: z.enum(["mobile", "laptop"], {
    required_error: "Please select device type"
  }),
  serialNumber: z.string().min(5, "Serial number/IMEI must be at least 5 characters"),
  brand: z.string().min(2, "Brand is required"),
  modelName: z.string().min(2, "Model name is required"),
  invoiceValue: z.string().min(1, "Device purchase price (inclusive of GST) is required"),
  dateOfPurchase: z.string().min(10, "Date of purchase is required"),
  // File upload
  invoiceFile: z.instanceof(File).optional(),
  // Seller Details
  sellerCode: z.string().optional(),
  // OTP verification
  otpCode: z.string().optional(),
  // Terms agreement
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type CustomerFormData = z.infer<typeof customerSchema>;

// Stripe PaymentForm component removed - using PayU only

// Depreciation Slabs Component
function DepreciationSlabs() {
  const slabs = [
    { period: "6-12 months", percentage: "70%" },
    { period: "13-18 months", percentage: "60%" },
    { period: "19-24 months", percentage: "50%" },
    { period: "25-30 months", percentage: "40%" },
    { period: "31-36 months", percentage: "30%" },
    { period: "37-48 months", percentage: "20%" },
    { period: "49-60 months", percentage: "10%" }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Info className="h-5 w-5 mr-2 text-blue-600" />
        BuyBack Guarantee - Depreciation Slabs
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {slabs.map((slab, index) => (
          <div key={index} className="bg-white rounded-lg p-3 text-center border border-gray-200">
            <div className="text-sm font-medium text-gray-600">{slab.period}</div>
            <div className="text-lg font-bold text-green-600">{slab.percentage}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3">
        * Percentage of original invoice value you'll receive when claiming BBG
      </p>
    </div>
  );
}

// PayU Payment Component
function PayUPaymentForm({ 
  amount, 
  deviceType, 
  onPaymentSuccess, 
  customerData 
}: { 
  amount: number;
  deviceType: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  customerData: CustomerFormData;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [canRetry, setCanRetry] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const handlePayUPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create PayU payment
      const paymentData = await apiRequest("/api/create-payu-payment", { 
        method: "POST",
        body: { 
          deviceType, 
          customerData 
        }
      });
      
      const { payuParams, payuUrl } = paymentData;

      // Create form and submit to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuUrl;
      form.style.display = 'none';

      // Add all PayU parameters as hidden inputs
      Object.keys(payuParams).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payuParams[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
    } catch (error: any) {
      setIsProcessing(false);
      
      // Handle specific rate limiting from our server
      if (error.message?.includes("Too many payment requests") || error.message?.includes("wait")) {
        // Extract wait time from error message
        const waitMatch = error.message.match(/wait (\d+) seconds/);
        const waitTime = waitMatch ? parseInt(waitMatch[1]) : 60;
        
        setRetryCount(prev => prev + 1);
        setCanRetry(false);
        
        toast({
          title: "Payment Rate Limited",
          description: `Please wait ${waitTime} seconds before trying again. This prevents PayU service overload.`,
          variant: "destructive",
        });
        
        // Start countdown timer
        setCountdown(waitTime);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setCanRetry(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } else if (error.message?.includes("Too many Requests") || error.message?.includes("rate limit")) {
        // Handle PayU's own rate limiting
        setRetryCount(prev => prev + 1);
        if (retryCount < 2) {
          toast({
            title: "Payment Gateway Busy",
            description: `PayU is experiencing high traffic. Please wait 60 seconds and try again. (Attempt ${retryCount + 1}/3)`,
            variant: "destructive",
          });
          
          setTimeout(() => {
            setCanRetry(true);
          }, 60000);
        } else {
          setCanRetry(false);
          toast({
            title: "Payment Service Temporarily Unavailable",
            description: "PayU is experiencing high traffic. Please try again after a few minutes or contact support.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Payment Error",
          description: error.message || "Something went wrong during payment processing. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Show Depreciation Slabs during checkout */}
      <DepreciationSlabs />
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">BBG for {deviceType}</span>
          <span className="text-2xl font-bold text-green-600">₹{amount}</span>
        </div>
        <div className="text-sm text-gray-600">
          Secure your device with BuyBack Guarantee via PayU
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Secure Payment with PayU</p>
            <p className="text-sm text-blue-700">Pay with Credit Card, Debit Card, Net Banking, UPI & Wallets</p>
          </div>
        </div>
      </div>

      <Button 
        onClick={handlePayUPayment}
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isProcessing || (!canRetry && retryCount >= 2) || countdown > 0}
      >
        {isProcessing 
          ? "Redirecting to PayU..." 
          : countdown > 0
            ? `Please wait ${countdown}s before retry...`
            : (!canRetry && retryCount >= 2)
              ? "Payment Service Unavailable"
              : retryCount > 0 
                ? `Retry Payment ₹${amount} (${retryCount}/3)`
                : `Pay ₹${amount} with PayU`
        }
      </Button>
      
      {retryCount > 0 && retryCount < 3 && (
        <div className="text-center mt-2">
          <p className="text-sm text-amber-600">
            PayU test environment has request limits. Please wait 60 seconds between attempts.
          </p>
        </div>
      )}
      
      {retryCount >= 3 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-red-800 mb-2">
            <strong>Payment service temporarily unavailable</strong>
          </p>
          <p className="text-xs text-red-600">
            This is a known issue with PayU test environment rate limiting. 
            Please try again after a few minutes or contact support at care@payu.in
          </p>
        </div>
      )}
    </div>
  );
}

// Payment Method Selector Component - PayU Only
function PaymentMethodSelector({ 
  amount, 
  deviceType, 
  onPaymentSuccess, 
  customerData 
}: { 
  amount: number;
  deviceType: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  customerData: CustomerFormData;
}) {
  // Direct PayU payment - no method selection needed
  return (
    <PayUPaymentForm
      amount={amount}
      deviceType={deviceType}
      onPaymentSuccess={onPaymentSuccess}
      customerData={customerData}
    />
  );
}

function RegistrationContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [referralCodeStatus, setReferralCodeStatus] = useState<{
    isValid: boolean | null;
    message: string;
    distributorName?: string;
  }>({ isValid: null, message: "" });
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Cart abandonment tracking
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('cart_session_id');
    if (stored) return stored;
    const newId = generateSessionId();
    sessionStorage.setItem('cart_session_id', newId);
    return newId;
  });


  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      pincode: "",
      deviceType: undefined,
      serialNumber: "",
      brand: "",
      modelName: "",
      invoiceValue: "",
      dateOfPurchase: "",
      invoiceFile: undefined,
      sellerCode: "",
      otpCode: "",
      agreeToTerms: false
    }
  });

  // Watch device type to fetch appropriate brands
  const deviceType = form.watch("deviceType");
  const selectedBrand = form.watch("brand");

  // Fetch brands based on device type
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["/api/brands", deviceType],
    enabled: !!deviceType,
    queryFn: async () => {
      const response = await fetch(`/api/brands?deviceType=${deviceType}`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    }
  });

  // Fetch models based on selected brand
  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ["/api/models", selectedBrand],
    enabled: !!selectedBrand && brands.length > 0,
    queryFn: async () => {
      const brand = brands.find((b: any) => b.name === selectedBrand);
      if (!brand) return [];
      const response = await fetch(`/api/models?brandId=${brand.id}`);
      if (!response.ok) throw new Error("Failed to fetch models");
      return response.json();
    }
  });

  // Handle device type change
  const handleDeviceTypeChange = (deviceType: string) => {
    form.setValue("brand", "");
    form.setValue("modelName", "");
    // Auto-calculate price based on device type
    const price = deviceType === 'laptop' ? 125 : 99;
    console.log(`Device type changed to ${deviceType}, price: ₹${price}`);
  };

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      return await apiRequest("/api/otp/send", { method: "POST", body: { contact } });
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ contact, otp }: { contact: string; otp: string }) => {
      return await apiRequest("/api/otp/verify", { method: "POST", body: { contact, otp } });
    },
    onSuccess: (data) => {
      if (data.verified) {
        setOtpVerified(true);
        toast({
          title: "Verified",
          description: "Contact number verified successfully",
        });
        // Track OTP verification stage
        trackCartAbandonment('otp_verified');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    }
  });

  // Cart abandonment tracking mutation
  const trackCartAbandonmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/cart-abandonment", { method: "POST", body: data });
    },
    onError: (error: any) => {
      // Silent error - cart abandonment tracking shouldn't interrupt user flow
      console.log("Cart abandonment tracking error:", error.message);
    }
  });

  // Cart abandonment tracking function with debouncing
  const trackCartAbandonment = (() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastStage = '';
    
    return (stage: string) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Skip if same stage as last call
      if (lastStage === stage && stage === 'details_entered') {
        return;
      }
      
      lastStage = stage;
      
      // Debounce for form changes, immediate for important stages
      const delay = stage === 'details_entered' ? 2000 : 0;
      
      timeoutId = setTimeout(() => {
        const formValues = form.getValues();
        const trackingData = {
          sessionId,
          stage,
          name: formValues.name || null,
          contact: formValues.contact || null,
          email: formValues.email || null,
          pincode: formValues.pincode || null,
          deviceType: formValues.deviceType || null,
          serialNumber: formValues.serialNumber || null,
          brand: formValues.brand || null,
          modelName: formValues.modelName || null,
          invoiceValue: formValues.invoiceValue ? parseFloat(formValues.invoiceValue) : null,
          sellerCode: formValues.sellerCode || null
        };

        // Only track if there's meaningful data
        if (trackingData.name || trackingData.contact || trackingData.deviceType) {
          trackCartAbandonmentMutation.mutate(trackingData);
        }
      }, delay);
    };
  })();

  // Track form start on component mount
  useEffect(() => {
    trackCartAbandonment('form_started');
  }, []);

  // Track when user starts entering details - only for key fields
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only track for important fields that indicate real user engagement
      const importantFields = ['name', 'contact', 'email', 'deviceType', 'serialNumber'];
      if (name && importantFields.includes(name) && value[name]) {
        trackCartAbandonment('details_entered');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Registration mutation
  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData & { paymentIntentId: string }) => {
      return await apiRequest("/api/customers/register", { method: "POST", body: data });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setShowConfetti(true);
      toast({
        title: "Registration Successful!",
        description: `Your BBG voucher code is: ${data.voucherCode}`,
      });
      // Delay navigation to allow confetti to show
      setTimeout(() => {
        setLocation("/thank-you");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const handleSendOtp = () => {
    const contact = form.getValues("contact");
    if (!validatePhoneNumber(contact)) {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate(contact);
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues("contact");
    verifyOtpMutation.mutate({ contact, otp });
  };

  // Validate referral code mutation
  const validateReferralCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!code || code.trim() === '') {
        return { valid: false, message: "" };
      }
      return await apiRequest(`/api/validate-referral-code/${encodeURIComponent(code)}`, { method: "GET" });
    },
    onSuccess: (data) => {
      setReferralCodeStatus({
        isValid: data.valid,
        message: data.message || "",
        distributorName: data.distributorName
      });
    },
    onError: () => {
      setReferralCodeStatus({
        isValid: false,
        message: "Error validating referral code"
      });
    }
  });

  // Debounced referral code validation with cleanup
  const validateReferralCode = (() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (code: string) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (!code || code.trim() === '') {
        setReferralCodeStatus({ isValid: null, message: "" });
        return;
      }
      
      // Set new timeout for debouncing
      timeoutId = setTimeout(() => {
        validateReferralCodeMutation.mutate(code);
      }, 800);
    };
  })();



  const onSubmit = (data: CustomerFormData) => {
    console.log("=== FORM SUBMIT CALLED ===");
    console.log("Form submission attempt:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("OTP Verified:", otpVerified);
    console.log("Current showPaymentForm:", showPaymentForm);
    
    if (!otpVerified) {
      console.log("OTP not verified, showing toast");
      toast({
        title: "Verification Required",
        description: "Please verify your contact number with OTP first",
        variant: "destructive",
      });
      return;
    }

    console.log("Setting form data and showing payment form");
    // Store form data and show payment form
    setFormData(data);
    setShowPaymentForm(true);
    // Scroll to top when payment form is shown
    scrollToTopInstant();
    // Track when user proceeds to payment
    trackCartAbandonment('payment_pending');
    console.log("Form data set, payment form should show");
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (!formData) return;

    // Create JSON data with payment info
    const submitData = {
      ...formData,
      paymentIntentId
    };
    
    console.log("Submitting customer data:", submitData);
    mutation.mutate(submitData);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Buy and Register for BuyBack Guarantee</h1>
        <p className="text-lg text-gray-600">
          Secure your device investment with our comprehensive BuyBack Guarantee program
        </p>
      </div>



      {showPaymentForm && formData ? (
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Complete Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PaymentMethodSelector
              amount={formData.deviceType === 'laptop' ? 125 : 99}
              deviceType={formData.deviceType}
              onPaymentSuccess={handlePaymentSuccess}
              customerData={formData}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Buy & Register Form
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Device Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Device Details
                  </h3>
                  
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Device Type *
                          </FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            handleDeviceTypeChange(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent side="bottom" align="start">
                              <SelectItem value="mobile">Mobile (₹99)</SelectItem>
                              <SelectItem value="laptop">Laptop (₹125)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Building className="h-4 w-4 mr-2" />
                            Brand *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent side="bottom" align="start">
                              {brandsLoading ? (
                                <SelectItem value="loading" disabled>Loading brands...</SelectItem>
                              ) : brands.length === 0 ? (
                                <SelectItem value="none" disabled>No brands available</SelectItem>
                              ) : (
                                brands.map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.name}>
                                    {brand.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modelName"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <span className="h-4 w-4 mr-2"></span>
                            Model Name *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBrand}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={selectedBrand ? "Select model" : "Select brand first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent side="bottom" align="start">
                              {modelsLoading ? (
                                <SelectItem value="loading" disabled>Loading models...</SelectItem>
                              ) : models.length === 0 ? (
                                <SelectItem value="none" disabled>No models available</SelectItem>
                              ) : (
                                models.map((model: any) => (
                                  <SelectItem key={model.id} value={model.name}>
                                    {model.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoiceValue"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <IndianRupee className="h-4 w-4 mr-2" />
                            Device Purchase Price (Inclusive of GST) *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter invoice amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfPurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Device Purchase Date *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Hash className="h-4 w-4 mr-2" />
                            IMEI/Serial Number *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IMEI or Serial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoiceFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Device Tax Invoice *
                          </FormLabel>
                          <FormControl>
                            <FileUpload
                              accept="image/*,.pdf"
                              onFileChange={(file) => {
                                setInvoiceFile(file);
                                field.onChange(file);
                              }}
                              placeholder="Upload invoice"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="flex items-start space-x-2">
                      <Info className="h-3 w-3 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium">📱 Mobile: Dial *#06# to get IMEI | 💻 Laptop: Check sticker on bottom/back or System Info → Hardware</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Details
                  </h3>
                  
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <User className="h-4 w-4 mr-2" />
                            Customer Name *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Number *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter 10-digit mobile number" 
                              maxLength={10}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Mail className="h-4 w-4 mr-2" />
                            Email ID *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            Pincode *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 6-digit pincode" maxLength={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Verification & Seller Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verification & Referral Details
                  </h3>
                  
                  {/* OTP Verification and Referral Code in same row */}
                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">OTP Verification *</label>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleSendOtp}
                          disabled={otpSent || otpVerified || sendOtpMutation.isPending}
                          className="flex-shrink-0 text-xs px-3"
                        >
                          {sendOtpMutation.isPending ? "Sending..." : otpVerified ? "Verified" : "Send OTP"}
                        </Button>
                        <div className="flex-1">
                          <Input 
                            placeholder="Enter 6-digit OTP" 
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={!otpSent || otpVerified}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleVerifyOtp}
                          disabled={!otpSent || otpVerified || verifyOtpMutation.isPending}
                          className="flex-shrink-0 text-xs px-4 bg-green-600 hover:bg-green-700 text-white border-0"
                        >
                          {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                      {otpVerified && (
                        <div className="flex items-center text-green-600 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Phone verified successfully
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="sellerCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Referral Code (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter referral code" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                validateReferralCode(e.target.value);
                              }}
                            />
                          </FormControl>
                          {referralCodeStatus.message && (
                            <div className={`text-xs mt-1 flex items-center ${
                              referralCodeStatus.isValid 
                                ? 'text-green-600' 
                                : referralCodeStatus.isValid === false 
                                  ? 'text-red-600' 
                                  : 'text-gray-600'
                            }`}>
                              {referralCodeStatus.isValid && <CheckCircle className="h-3 w-3 mr-1" />}
                              {referralCodeStatus.isValid === false && <X className="h-3 w-3 mr-1" />}
                              {referralCodeStatus.message}
                            </div>
                          )}
                          {validateReferralCodeMutation.isPending && (
                            <div className="text-xs text-gray-500 mt-1">
                              Validating referral code...
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the{" "}
                            <a 
                              href="/terms-and-conditions" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                            >
                              terms and conditions
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                            {" *"}
                          </FormLabel>
                          <p className="text-xs text-gray-600">
                            By registering, you agree to our BBG terms and conditions.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 space-y-3">
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 py-2 text-md font-semibold"
                    disabled={!otpVerified || mutation.isPending}
                  >
                    {mutation.isPending ? "Processing..." : "Buy & Register for BBG"}
                  </Button>
                  {!otpVerified && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Please verify your phone number with OTP first
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Success Confetti */}
      {showConfetti && (
        <SuccessConfetti 
          isActive={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />
      )}

    </div>
  );
}

export default function CustomerRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <RegistrationContent />
    </div>
  );
}