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

import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FileUpload from "@/components/file-upload";
import { 
  ShoppingCart, 
  CheckCircle, 
  Upload, 
  Smartphone, 
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  CreditCard,
  Lock
} from "lucide-react";

// Initialize Stripe - will be null if key not configured
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

// Extended customer schema with validation
const customerSchema = insertCustomerSchema.extend({
  otpCode: z.string().min(6, "OTP must be 6 digits"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type CustomerFormData = z.infer<typeof customerSchema>;

// Payment form component
function PaymentForm({ 
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
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", { deviceType });
      const { clientSecret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.contact,
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Something went wrong during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">BBG for {deviceType}</span>
          <span className="text-2xl font-bold text-green-600">₹{amount}</span>
        </div>
        <div className="text-sm text-gray-600">
          Secure your device with BuyBack Guarantee
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <Label className="text-sm font-medium mb-2 flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Card Details
        </Label>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700" 
        disabled={!stripe || isProcessing}
      >
        <Lock className="h-4 w-4 mr-2" />
        {isProcessing ? 'Processing...' : `Pay ₹${amount} & Register`}
      </Button>
    </form>
  );
}

function RegistrationContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      address: "",
      pincode: "",
      deviceType: "",
      brand: "",
      modelName: "",
      purchaseDate: "",
      invoiceValue: "",
      invoiceNumber: "",
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
      setShowOtpForm(true);
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
        setIsOtpVerified(true);
        setShowOtpForm(false);
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
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/customers/register", formData);
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
        description: `Your BBG voucher code is: ${data.customer.voucherCode}`,
      });
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

  const onSubmit = (data: CustomerFormData) => {
    if (!isOtpVerified) {
      toast({
        title: "Verification Required",
        description: "Please verify your contact number with OTP first",
        variant: "destructive",
      });
      return;
    }

    if (!invoiceFile) {
      toast({
        title: "Invoice Required",
        description: "Please upload the device invoice",
        variant: "destructive",
      });
      return;
    }

    // Store form data and show payment form
    setFormData(data);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (!formData) return;

    // Create form data with payment info
    const submitData = new FormData();
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        submitData.append(key, value.toString());
      }
    });
    
    // Add files
    submitData.append('invoiceFile', invoiceFile!);
    if (paymentScreenshot) {
      submitData.append('paymentScreenshot', paymentScreenshot);
    }
    
    // Add payment info
    submitData.append('paymentIntentId', paymentIntentId);
    
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
            <span className="ml-2 text-sm font-medium">Personal Info</span>
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
            {stripePromise ? (
              <PaymentForm
                amount={formData.deviceType === 'laptop' ? 125 : 99}
                deviceType={formData.deviceType}
                onPaymentSuccess={handlePaymentSuccess}
                customerData={formData}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">BBG for {formData.deviceType}</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{formData.deviceType === 'laptop' ? 125 : 99}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-800 mb-4">
                    Payment gateway is being configured. For now, you can complete registration and pay through other methods.
                  </p>
                </div>
                <Button 
                  onClick={() => handlePaymentSuccess("demo_payment_intent")}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Registration (Demo Mode)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Device Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Smartphone className="h-5 w-5 mr-2" />
                      Device Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="laptop">Laptop (₹125)</SelectItem>
                              <SelectItem value="mobile">Mobile (₹99)</SelectItem>
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
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter device brand" {...field} />
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
                          <FormLabel>Model Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter model name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Purchase Date
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
                      name="invoiceValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Invoice Value (₹)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter invoice amount" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Invoice Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter invoice number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Number
                            </FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input 
                                  placeholder="Enter 10-digit number" 
                                  maxLength={10}
                                  {...field} 
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={sendOtpMutation.isPending || isOtpVerified}
                              >
                                {isOtpVerified ? <CheckCircle className="h-4 w-4" /> : "Send OTP"}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showOtpForm && (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                          />
                          <Button 
                            type="button" 
                            onClick={handleVerifyOtp}
                            disabled={verifyOtpMutation.isPending}
                          >
                            Verify
                          </Button>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Address
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your complete address" 
                              className="min-h-[80px]"
                              {...field} 
                            />
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
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 6-digit pincode" maxLength={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellerCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Code (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter seller code if you have one" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* File Uploads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Upload className="h-5 w-5 mr-2" />
                      Document Uploads
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="invoiceFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Invoice File *
                          </FormLabel>
                          <FormControl>
                            <FileUpload
                              accept="image/*,.pdf"
                              onFileChange={(file) => {
                                setInvoiceFile(file);
                                field.onChange(file?.name || "");
                              }}
                              placeholder="Upload device invoice (Required)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentScreenshot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Camera className="h-4 w-4 mr-2" />
                            Payment Screenshot (Optional)
                          </FormLabel>
                          <FormControl>
                            <FileUpload
                              accept="image/*"
                              onFileChange={(file) => {
                                setPaymentScreenshot(file);
                                field.onChange(file?.name || "");
                              }}
                              placeholder="Upload payment screenshot (optional)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 px-12"
                disabled={mutation.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {mutation.isPending ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

export default function CustomerRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <RegistrationContent />
        </Elements>
      ) : (
        <RegistrationContent />
      )}

      <Footer />
    </div>
  );
}