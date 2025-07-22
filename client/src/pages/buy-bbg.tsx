import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, IndianRupee, Shield, CheckCircle, Clock, Smartphone, Laptop, ArrowRight } from "lucide-react";

const buyBbgSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  deviceType: z.enum(["mobile", "laptop"], {
    required_error: "Please select device type"
  }),
  otp: z.string().min(4, "OTP is required")
});

type BuyBbgFormData = z.infer<typeof buyBbgSchema>;

const devicePrices = {
  mobile: 99,
  laptop: 125
};

export default function BuyBBG() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const form = useForm<BuyBbgFormData>({
    resolver: zodResolver(buyBbgSchema),
    defaultValues: {
      customerName: "",
      contact: "",
      email: "",
      deviceType: undefined,
      otp: ""
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      const response = await apiRequest("/api/send-otp", {
        method: "POST",
        body: { contact }
      });
      return response;
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your mobile for the verification code"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { contact: string; otp: string }) => {
      const response = await apiRequest("/api/verify-otp", {
        method: "POST",
        body: data
      });
      return response;
    },
    onSuccess: () => {
      setOtpVerified(true);
      toast({
        title: "OTP Verified",
        description: "Phone number verified successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const processPurchaseMutation = useMutation({
    mutationFn: async (data: BuyBbgFormData) => {
      const deviceType = data.deviceType;
      const amount = devicePrices[deviceType];
      
      // Create PayU payment using existing endpoint
      const customerData = {
        name: data.customerName,
        contact: data.contact,
        email: data.email,
        deviceType,
        // Add minimal required fields for PayU processing
        pincode: "000000", // Placeholder for buy process
        serialNumber: "TBD", // To be determined during registration
        brand: "TBD",
        modelName: "TBD", 
        invoiceValue: 0, // Not applicable for buy process
        dateOfPurchase: new Date().toISOString().split('T')[0]
      };
      
      const response = await apiRequest("/api/create-payu-payment", {
        method: "POST",
        body: { customerData }
      });
      return response;
    },
    onSuccess: (data) => {
      setPaymentProcessing(true);
      // Store purchase data in session for thank you page
      sessionStorage.setItem('buyBbgData', JSON.stringify({
        customerName: form.getValues('customerName'),
        contact: form.getValues('contact'),
        email: form.getValues('email'),
        deviceType: form.getValues('deviceType'),
        amount: devicePrices[form.getValues('deviceType') as keyof typeof devicePrices],
        transactionId: data.txnid
      }));
      
      // Create PayU form and submit
      const payuForm = document.createElement('form');
      payuForm.method = 'POST';
      payuForm.action = data.payuUrl;
      
      // Add PayU parameters as hidden inputs
      Object.entries(data.payuParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        payuForm.appendChild(input);
      });
      
      document.body.appendChild(payuForm);
      payuForm.submit();
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSendOtp = () => {
    const contact = form.getValues('contact');
    if (contact && contact.match(/^[6-9]\d{9}$/)) {
      sendOtpMutation.mutate(contact);
    } else {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues('contact');
    const otp = form.getValues('otp');
    if (contact && otp) {
      verifyOtpMutation.mutate({ contact, otp });
    }
  };

  const onSubmit = (data: BuyBbgFormData) => {
    if (!otpVerified) {
      toast({
        title: "Verification Required",
        description: "Please verify your mobile number first",
        variant: "destructive"
      });
      return;
    }
    processPurchaseMutation.mutate(data);
  };

  const watchedDeviceType = form.watch('deviceType');
  const selectedPrice = watchedDeviceType ? devicePrices[watchedDeviceType] : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Buy BBG Protection
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Secure your device with our comprehensive buyback guarantee
          </p>
          
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Full Protection</h3>
              <p className="text-gray-600 text-sm">Complete device protection with guaranteed buyback value</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Claims</h3>
              <p className="text-gray-600 text-sm">Simple claim process with quick approval and payout</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">60 Months Coverage</h3>
              <p className="text-gray-600 text-sm">Extended protection for up to 5 years from purchase</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Purchase BBG Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Customer Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="customerName"
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
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="Enter 10-digit mobile number" {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSendOtp}
                              disabled={sendOtpMutation.isPending || otpSent}
                            >
                              {sendOtpMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : otpSent ? (
                                "OTP Sent"
                              ) : (
                                "Send OTP"
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {otpSent && (
                      <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter OTP</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="Enter 6-digit OTP" {...field} />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleVerifyOtp}
                                disabled={verifyOtpMutation.isPending || otpVerified}
                              >
                                {verifyOtpMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : otpVerified ? (
                                  "Verified"
                                ) : (
                                  "Verify"
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Device Selection */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Device Type</h3>
                    
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Device Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose device type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mobile">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="h-4 w-4" />
                                  Mobile (₹99)
                                </div>
                              </SelectItem>
                              <SelectItem value="laptop">
                                <div className="flex items-center gap-2">
                                  <Laptop className="h-4 w-4" />
                                  Laptop (₹125)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price Display */}
                  {selectedPrice > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">BBG Protection Cost:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{selectedPrice}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={processPurchaseMutation.isPending || !otpVerified || paymentProcessing}
                  >
                    {processPurchaseMutation.isPending || paymentProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <IndianRupee className="mr-2 h-4 w-4" />
                        Pay ₹{selectedPrice} & Buy Protection
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Guaranteed Buyback</h4>
                    <p className="text-sm text-gray-600">Up to 70% of invoice value based on device age</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Extended Coverage</h4>
                    <p className="text-sm text-gray-600">Protection valid for 60 months from purchase</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Easy Claims</h4>
                    <p className="text-sm text-gray-600">Simple online claim process with quick payouts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Free Pickup</h4>
                    <p className="text-sm text-gray-600">Doorstep device pickup at no extra cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <span>Purchase BBG protection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <span>Register your device details</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <span>Receive BBG voucher code</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> After purchase, you'll need to register your device separately to receive your BBG voucher code.
                  </p>
                  <Link href="/customer-registration">
                    <Button variant="outline" size="sm" className="mt-3">
                      Go to Device Registration <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}