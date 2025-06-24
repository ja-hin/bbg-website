import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUpload from "@/components/file-upload";
import { Loader2, Laptop, Smartphone, MessageSquare, CheckCircle } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  serialNumber: z.string().min(5, "Serial number/IMEI required"),
  modelName: z.string().min(2, "Model name required"),
  invoiceValue: z.number().min(1000, "Invoice value must be at least ₹1000"),
  deviceType: z.enum(["laptop", "mobile"], { required_error: "Please select device type" }),
  invoiceFile: z.instanceof(File).optional(),
  paymentScreenshot: z.instanceof(File).optional(),
  sellerCode: z.string().optional(),
  otpCode: z.string().min(6, "OTP must be 6 digits"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string>("");

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      pincode: "",
      serialNumber: "",
      modelName: "",
      invoiceValue: 0,
      deviceType: undefined,
      sellerCode: "",
      otpCode: "",
      agreeToTerms: false
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      const response = await apiRequest("POST", "/api/otp/send", { contact });
      return response.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the OTP code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { contact: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/otp/verify", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.verified) {
        setOtpVerified(true);
        toast({
          title: "OTP Verified",
          description: "Phone number verified successfully",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "OTP Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/customers/register", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setVoucherCode(data.bbgVoucherCode);
      setRegistrationComplete(true);
      toast({
        title: "Registration Successful!",
        description: "Your BBG voucher code has been generated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendOtp = () => {
    const contact = form.getValues("contact");
    if (contact.length === 10) {
      sendOtpMutation.mutate(contact);
    } else {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit contact number",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues("contact");
    const otp = form.getValues("otpCode");
    if (contact && otp.length === 6) {
      verifyOtpMutation.mutate({ contact, otp });
    }
  };

  const onSubmit = (data: CustomerFormData) => {
    if (!otpVerified) {
      toast({
        title: "OTP Not Verified",
        description: "Please verify your phone number first",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'invoiceFile' && key !== 'paymentScreenshot' && key !== 'agreeToTerms' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add files
    if (data.invoiceFile) {
      formData.append('invoiceFile', data.invoiceFile);
    }
    if (data.paymentScreenshot) {
      formData.append('paymentScreenshot', data.paymentScreenshot);
    }

    registerMutation.mutate(formData);
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your BBG registration has been submitted successfully. Our team will verify your details and activate your guarantee.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your BBG Voucher Code:</p>
                <p className="text-2xl font-bold text-red-600">{voucherCode}</p>
              </div>
              <div className="space-y-4 text-left">
                <h3 className="font-semibold text-gray-900">What's Next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• You will receive confirmation via email and SMS</li>
                  <li>• Our team will verify your payment and documents</li>
                  <li>• BBG will be activated within 24-48 hours</li>
                  <li>• Save your voucher code for future claims</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Register for BuyBack Guarantee</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Protect your investment with our comprehensive BuyBack Guarantee program
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 border-2 border-red-200 hover:border-red-400 transition-colors">
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Laptop className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Laptop BBG</h3>
              <div className="text-4xl font-bold text-red-600 mb-2">₹125</div>
              <p className="text-gray-600">Complete protection for your laptop</p>
            </CardContent>
          </Card>

          <Card className="p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent className="text-center p-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Mobile BBG</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">₹99</div>
              <p className="text-gray-600">Complete protection for your mobile</p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Customer Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
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
                        <FormLabel>Contact Number *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="10-digit mobile number" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendOtpMutation.isPending || otpVerified}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {sendOtpMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : otpVerified ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                OTP
                              </>
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* OTP Verification */}
                {otpSent && !otpVerified && (
                  <FormField
                    control={form.control}
                    name="otpCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter OTP *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="6-digit OTP" maxLength={6} {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyOtpMutation.isPending}
                          >
                            {verifyOtpMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
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

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
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
                        <FormLabel>Pincode *</FormLabel>
                        <FormControl>
                          <Input placeholder="6-digit pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Device Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="deviceType"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Device Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="laptop">Laptop</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial No. / IMEI *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter serial number or IMEI" {...field} />
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
                            <Input placeholder="Enter device model" {...field} />
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
                        <FormLabel>Invoice Value (₹) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter invoice amount"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* File Uploads */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="invoiceFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Device Invoice *</FormLabel>
                          <FormControl>
                            <FileUpload
                              accept=".pdf,.jpg,.jpeg,.png"
                              onFileChange={(file) => field.onChange(file)}
                              placeholder="Click to upload or drag and drop"
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
                          <FormLabel>Upload Payment Screenshot *</FormLabel>
                          <FormControl>
                            <FileUpload
                              accept=".jpg,.jpeg,.png"
                              onFileChange={(file) => field.onChange(file)}
                              placeholder="Click to upload or drag and drop"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seller Code */}
                <FormField
                  control={form.control}
                  name="sellerCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter distributor seller code if applicable" {...field} />
                      </FormControl>
                      <p className="text-xs text-gray-500">Enter the seller code provided by your distributor</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the terms and conditions
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={registerMutation.isPending || !otpVerified}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Registration...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
