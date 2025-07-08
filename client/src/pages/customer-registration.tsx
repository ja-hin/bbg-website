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
  DollarSign
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
  // Seller Details
  sellerCode: z.string().optional(),
  // Terms agreement
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type CustomerFormData = z.infer<typeof customerSchema>;

// Stripe PaymentForm component removed - using PayU only

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
  const { toast } = useToast();

  const handlePayUPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create PayU payment
      const response = await apiRequest("POST", "/api/create-payu-payment", { 
        deviceType, 
        customerData 
      });
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
      
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Something went wrong during payment processing",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
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
        disabled={isProcessing}
      >
        {isProcessing ? "Redirecting to PayU..." : `Pay ₹${amount} with PayU`}
      </Button>
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

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
      setLocation("/thank-you?type=customer&voucherCode=" + data.voucherCode);
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

  const handleStepSubmit = (step: number) => {
    if (step === 1) {
      // Validate device details
      const deviceFields = ['deviceType', 'serialNumber', 'brand', 'modelName', 'invoiceValue'];
      const hasErrors = deviceFields.some(field => {
        const error = form.formState.errors[field as keyof CustomerFormData];
        return error !== undefined;
      });
      
      if (!hasErrors) {
        setCurrentStep(2);
      }
    } else if (step === 2) {
      // Validate customer details
      const customerFields = ['name', 'contact', 'email', 'pincode'];
      const hasErrors = customerFields.some(field => {
        const error = form.formState.errors[field as keyof CustomerFormData];
        return error !== undefined;
      });
      
      if (!hasErrors) {
        setCurrentStep(3);
      }
    }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Buy and Register for BuyBack Guarantee</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Secure your device investment with our comprehensive BuyBack Guarantee program
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Device Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Customer Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Verification</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${showPaymentForm ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showPaymentForm ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
        </div>
      </div>

      {showPaymentForm && formData ? (
        <Card className="max-w-md mx-auto">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <ShoppingCart className="h-6 w-6 mr-2" />
              Buy & Register Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Device Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Device Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Device Type *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Building className="h-4 w-4 mr-2" />
                              Brand *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Apple, Samsung, HP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="modelName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., iPhone 14, MacBook Pro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="invoiceValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Device Invoice Value (including GST) *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter invoice amount in ₹" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="button" 
                      onClick={() => handleStepSubmit(1)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Continue to Customer Details
                    </Button>
                  </div>
                )}

                {/* Step 2: Customer Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
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
                        <FormItem>
                          <FormLabel className="flex items-center">
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
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
                          <FormItem>
                            <FormLabel className="flex items-center">
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

                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        Back to Device Details
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => handleStepSubmit(2)}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Continue to Verification
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Verification & Seller Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Verification & Seller Details</h3>
                    
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

                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1"
                      >
                        Back to Customer Details
                      </Button>
                      <Button 
                        type="button" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!otpVerified || mutation.isPending}
                        onClick={() => {
                          console.log("Proceed to Payment button clicked");
                          console.log("OTP Verified:", otpVerified);
                          console.log("Form state:", form.formState);
                          console.log("Form values:", form.getValues());
                          console.log("Form errors:", form.formState.errors);
                          
                          // Trigger form submission manually
                          form.handleSubmit(onSubmit)();
                        }}
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                  </div>
                )}
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