import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, IndianRupee, Users, TrendingUp, Building, Phone, Mail, FileText, DollarSign } from "lucide-react";
import { SuccessConfetti } from "@/components/confetti";

const distributorSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  declarationAccuracy: z.boolean().refine(val => val === true, "You must declare that the information is true and correct"),
  tdsUnderstanding: z.boolean().refine(val => val === true, "You must acknowledge TDS compliance understanding"),
  gstInvoiceAgreement: z.boolean().refine(val => val === true, "You must agree to GST invoice requirements")
});

type DistributorFormData = z.infer<typeof distributorSchema>;

export default function DistributorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sellerCode, setSellerCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      declarationAccuracy: false,
      tdsUnderstanding: false,
      gstInvoiceAgreement: false
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
      const response = await apiRequest("/api/verify-otp", {
        method: "POST",
        body: { contact, otp }
      });
      return response;
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
    mutationFn: async (data: DistributorFormData) => {
      const response = await apiRequest("/api/distributors/register", {
        method: "POST",
        body: data
      });
      return response;
    },
    onSuccess: (data) => {
      // Redirect to thank you page with distributor parameters
      setLocation(`/thank-you?type=distributor&status=success&sellerCode=${data.sellerCode}`);
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
    if (!contact || contact.length !== 10) {
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
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ contact, otp });
  };

  const onSubmit = (data: DistributorFormData) => {
    if (!otpVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number before registering",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(data);
  };

  const handleLoginRedirect = () => {
    setLocation("/distributor-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Our Referral Partner Program
          </h1>
          <p className="text-lg text-gray-600">
            Earn ₹25 for every successful BBG registration you refer
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Earn 10% + ₹25 Per BBG Sale</h3>
              <p className="text-sm text-gray-600 mt-1">
                Get rewarded for every BBG you help sell using your code
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Build Your Network</h3>
              <p className="text-sm text-gray-600 mt-1">
                Grow your customer base and increase monthly earnings
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Monthly Payouts</h3>
              <p className="text-sm text-gray-600 mt-1">
                Receive commissions directly to your bank account
              </p>
            </CardContent>
          </Card>
        </div>

        

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Register as Referral Partner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Basic Information
                  </h3>
                  
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
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
                            Phone Number *
                          </FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                placeholder="Enter 10-digit mobile number" 
                                maxLength={10}
                                disabled={otpVerified}
                                {...field} 
                              />
                            </FormControl>
                            {!otpVerified && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={sendOtpMutation.isPending || otpSent}
                              >
                                {sendOtpMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : otpSent ? (
                                  "Sent"
                                ) : (
                                  "Send OTP"
                                )}
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {otpSent && !otpVerified && (
                      <FormItem>
                        <FormLabel>Enter OTP *</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                          />
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
                      </FormItem>
                    )}

                    {otpVerified && (
                      <div className="flex items-center text-green-600">
                        <span className="text-sm">✓ Phone number verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Declaration & Consent */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Declaration & Consent
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="declarationAccuracy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm leading-relaxed font-normal text-[#374151]">
                            I declare that the information provided above is true and correct
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tdsUnderstanding"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-gray-700 leading-relaxed font-normal">
                            I understand that commission payout is subject to TDS as per income tax laws
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gstInvoiceAgreement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm text-gray-700 leading-relaxed font-normal">
                            If GST registered, I agree to raise tax invoices to XtraCover for each month's referral commission
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!otpVerified || registerMutation.isPending || !form.watch('declarationAccuracy') || !form.watch('tdsUnderstanding') || !form.watch('gstInvoiceAgreement')}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Join Referral Program"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}