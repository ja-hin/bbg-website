import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { insertCustomerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { validatePhoneNumber, validateEmail, validatePincode } from "@/lib/utils";
import FileUpload from "@/components/file-upload";

// Stripe imports removed - using PayU only


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Info
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
  invoiceValue: z.string().min(1, "Invoice value is required"),
  // File upload
  invoiceFile: z.instanceof(File).optional(),
  // Seller Details
  sellerCode: z.string().optional(),
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
      const response = await apiRequest("POST", "/api/create-payu-payment", { 
        deviceType, 
        customerData 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment creation failed");
      }
      
      const { payuParams, payuUrl } = await response.json();

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
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [showDepreciationSlabs, setShowDepreciationSlabs] = useState(false);

  // Device brands - this will come from admin panel later
  const deviceBrands = [
    "Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo", "Vivo", 
    "Google", "Nokia", "Motorola", "Sony", "Huawei", "Honor", "Nothing",
    "HP", "Dell", "Lenovo", "Asus", "Acer", "MSI", "Apple MacBook", 
    "Microsoft Surface", "Alienware", "Razer", "Gigabyte", "Other"
  ];

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
      invoiceFile: undefined,
      sellerCode: "",
      otpCode: "",
      agreeToTerms: false
    }
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      const response = await apiRequest("POST", "/api/otp/send", { contact });
      return response.json();
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
      const response = await apiRequest("POST", "/api/otp/verify", { contact, otp });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        setOtpVerified(true);
        toast({
          title: "Verified",
          description: "Contact number verified successfully",
        });
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

  // Registration mutation
  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData & { paymentIntentId: string }) => {
      const response = await apiRequest("POST", "/api/customers/register", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Registration Successful!",
        description: `Your BBG voucher code is: ${data.voucherCode}`,
      });
      // Store success data in session storage for thank you page
      sessionStorage.setItem('thankYouData', JSON.stringify({
        type: 'customer',
        voucherCode: data.voucherCode,
        paymentMethod: 'direct',
        customerName: data.name,
        deviceType: data.deviceType
      }));
      setLocation("/thank-you");
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

  const handleDeviceTypeChange = (deviceType: string) => {
    // Auto-calculate price based on device type
    const price = deviceType === 'laptop' ? 125 : 99;
    console.log(`Device type changed to ${deviceType}, price: ₹${price}`);
  };

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
    console.log("Form data set, payment form should show");
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (!formData) return;

    // Create JSON data with payment info
    const submitData = {
      ...formData,
      paymentIntentId,
      // Remove fields not needed for backend
      agreeToTerms: undefined,
      otpCode: undefined
    };
    
    console.log("Submitting customer data:", submitData);
    mutation.mutate(submitData);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Buy and Register for BuyBack Guarantee</h1>
        <p className="text-xl text-gray-600">
          Secure your device investment with our comprehensive BuyBack Guarantee program
        </p>
      </div>

      {showPaymentForm && formData ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Complete Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <ShoppingCart className="h-6 w-6 mr-2" />
              Buy & Register Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Device Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Device Details
                  </h3>
                  
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
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
                            <SelectContent>
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
                            <SelectContent>
                              {deviceBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
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
                          <FormControl>
                            <Input placeholder="e.g., iPhone 14, MacBook Pro" {...field} />
                          </FormControl>
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
                            Invoice Value (₹) *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter invoice amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Hash className="h-4 w-4 mr-2" />
                            Serial No. / IMEI *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter device serial number or IMEI" {...field} />
                          </FormControl>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Important: Double Check while entering IMEI/Serial No.</p>
                                <p className="mb-1">📱 <strong>For Mobile:</strong> Dial *#06# to get IMEI</p>
                                <p>💻 <strong>For Laptop:</strong> Check sticker on bottom/back or System Info → Hardware</p>
                              </div>
                            </div>
                          </div>
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
                              placeholder="Upload invoice (PDF/Image)"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Customer Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Details
                  </h3>
                  
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
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
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Verification & Seller Details
                  </h3>
                  
                  {/* OTP Verification */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleSendOtp}
                        disabled={otpSent || otpVerified || sendOtpMutation.isPending}
                        className="flex-shrink-0"
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
                        className="flex-shrink-0"
                      >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                    {otpVerified && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Phone number verified successfully
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="sellerCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Code (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter distributor seller code if you have one" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                            I agree to the terms and conditions *
                          </FormLabel>
                          <p className="text-xs text-gray-600">
                            By registering, you agree to our BBG terms and conditions.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Show Depreciation Slabs */}
                {showDepreciationSlabs && (
                  <div className="pt-4">
                    <DepreciationSlabs />
                  </div>
                )}

                {/* Depreciation Info and Submit Button */}
                <div className="pt-6 space-y-4">
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowDepreciationSlabs(!showDepreciationSlabs)}
                      className="mb-4"
                    >
                      {showDepreciationSlabs ? "Hide" : "View"} Depreciation Slabs
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold"
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