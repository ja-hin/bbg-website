import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { insertDistributorSchema } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, DollarSign, Users, TrendingUp, Building, MapPin, Phone, Mail, CreditCard } from "lucide-react";

const distributorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().optional(),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  location: z.string().min(2, "Location/City is required"),
  preferredMode: z.enum(["in-store", "online", "both"], {
    required_error: "Please select a preferred mode"
  }),
  gstin: z.string().optional(),
  // Bank details (optional)
  bankAccount: z.string().optional(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format").optional().or(z.literal("")),
  accountHolderName: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type DistributorFormData = z.infer<typeof distributorSchema>;

export default function DistributorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sellerCode, setSellerCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      businessName: "",
      contact: "",
      email: "",
      pincode: "",
      location: "",
      preferredMode: undefined,
      gstin: "",
      bankAccount: "",
      ifscCode: "",
      accountHolderName: "",
      agreeToTerms: false
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      const response = await apiRequest("POST", "/api/send-otp", { contact });
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
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ contact, otp }: { contact: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/verify-otp", { contact, otp });
      return response.json();
    },
    onSuccess: () => {
      setOtpVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid OTP",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<DistributorFormData, 'agreeToTerms'>) => {
      const response = await apiRequest("POST", "/api/distributors/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSellerCode(data.sellerCode);
      toast({
        title: "Registration Successful!",
        description: `Your seller code is: ${data.sellerCode}`,
      });
      setTimeout(() => {
        setLocation("/thank-you?type=distributor&sellerCode=" + data.sellerCode);
      }, 3000);
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
    if (contact && /^[6-9]\d{9}$/.test(contact)) {
      sendOtpMutation.mutate(contact);
    } else {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues("contact");
    if (otp.length === 6) {
      verifyOtpMutation.mutate({ contact, otp });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: DistributorFormData) => {
    if (!otpVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number first",
        variant: "destructive",
      });
      return;
    }

    const { agreeToTerms, ...submitData } = data;
    registerMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a BBG Distributor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our network and start earning commissions on every successful BBG registration. 
            Easy setup, dedicated support, and regular payouts.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Commission</h3>
              <p className="text-gray-600">Get paid for every successful BBG registration</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Network</h3>
              <p className="text-gray-600">Grow your customer base with our BBG platform</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Performance</h3>
              <p className="text-gray-600">Monitor your sales and commission earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Distributor Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Full Name *
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
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Business Name (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            Mobile Number * (OTP Verified)
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Enter 10-digit mobile number" 
                                maxLength={10}
                                {...field} 
                                disabled={otpVerified}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleSendOtp}
                                disabled={otpSent || otpVerified || sendOtpMutation.isPending}
                              >
                                {sendOtpMutation.isPending ? "Sending..." : otpVerified ? "Verified" : "Send OTP"}
                              </Button>
                            </div>
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
                            Email ID *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Enter OTP</label>
                        <Input 
                          placeholder="Enter 6-digit OTP" 
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleVerifyOtp}
                        disabled={verifyOtpMutation.isPending}
                      >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
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

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Location/City *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your city/location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="preferredMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Mode *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in-store">In-store</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GSTIN (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter GSTIN number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Bank Details (Optional)</h3>
                  <p className="text-sm text-gray-600">Required for commission payouts</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Bank Account Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IFSC code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account holder name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the terms and conditions *
                        </FormLabel>
                        <p className="text-xs text-gray-600">
                          By registering, you agree to our distributor terms and commission structure.
                        </p>
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
                      Registering...
                    </>
                  ) : (
                    "Register as Distributor"
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