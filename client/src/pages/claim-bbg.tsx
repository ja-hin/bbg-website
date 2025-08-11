import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { SuccessConfetti } from "@/components/confetti";

const claimSchema = z.object({
  voucherCode: z.string().min(5, "Valid BBG voucher code required"),
  contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  serialNumber: z.string().min(10, "Serial Number/IMEI must be at least 10 characters"),
  address: z.string().min(10, "Please provide a complete pickup address"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTimeSlot: z.string().min(1, "Pickup time slot is required")
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface ClaimDetails {
  customer: {
    name: string;
    deviceType: string;
    modelName: string;
    invoiceValue: string;
    contact: string;
    serialNumber: string;
  };
  claimPercentage: number;
  claimAmount: string;
  deviceAge: number;
  eligible: boolean;
}

interface ClaimError {
  message: string;
  eligible: boolean;
  deviceAge: number;
  minimumAge?: number;
  maximumAge?: number;
}

export default function ClaimBBG() {
  const { toast } = useToast();
  const [claimDetails, setClaimDetails] = useState<ClaimDetails | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [otp, setOtp] = useState("");
  const [eligibilityError, setEligibilityError] = useState<ClaimError | null>(null);

  // Fetch dynamic claim value slabs for both mobile and laptop
  const { data: mobileSlabs, isLoading: isMobileSlabsLoading } = useQuery({
    queryKey: ['/api/claim-value-slabs/active/mobile'],
    retry: false,
  });

  const { data: laptopSlabs, isLoading: isLaptopSlabsLoading } = useQuery({
    queryKey: ['/api/claim-value-slabs/active/laptop'],
    retry: false,
  });

  const mobileSlabsArray = Array.isArray(mobileSlabs) ? mobileSlabs : [];
  const laptopSlabsArray = Array.isArray(laptopSlabs) ? laptopSlabs : [];

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      voucherCode: "",
      contact: "",
      email: "",
      serialNumber: "",
      address: "",
      pickupDate: "",
      pickupTimeSlot: ""
    }
  });

  const checkClaimMutation = useMutation({
    mutationFn: async (data: { voucherCode: string }) => {
      return await apiRequest("/api/claims/check", { method: "POST", body: data });
    },
    onSuccess: (data) => {
      setClaimDetails(data);
      setEligibilityError(null);
      toast({
        title: "Claim Details Retrieved",
        description: "Your claim value has been calculated",
      });
    },
    onError: (error: any) => {
      // Clear any previous claim details
      setClaimDetails(null);
      setEligibilityError(null);
      
      toast({
        title: "Invalid BBG Voucher Code",
        description: error.message || "Please check your voucher code and try again.",
        variant: "destructive",
      });
    }
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      return await apiRequest("/api/claims/submit", { method: "POST", body: data });
    },
    onSuccess: () => {
      setClaimSubmitted(true);
      setShowConfetti(true);
      toast({
        title: "Claim Submitted Successfully",
        description: "You will be contacted for device verification",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      return await apiRequest("/api/otp/send", { method: "POST", body: { contact } });
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "A 6-digit OTP has been sent to your mobile number.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send OTP",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { contact: string, otp: string }) => {
      return await apiRequest("/api/otp/verify", { method: "POST", body: data });
    },
    onSuccess: () => {
      setOtpVerified(true);
      toast({
        title: "OTP Verified",
        description: "Your mobile number has been successfully verified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "OTP Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Auto-populate form fields when claim details are loaded
  useEffect(() => {
    if (claimDetails) {
      form.setValue("contact", claimDetails.customer.contact);
      form.setValue("serialNumber", claimDetails.customer.serialNumber);
    }
  }, [claimDetails, form]);

  const handleCheckClaim = () => {
    const voucherCode = form.getValues("voucherCode");
    if (voucherCode) {
      // Clear previous states
      setClaimDetails(null);
      setEligibilityError(null);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      
      checkClaimMutation.mutate({ voucherCode });
    }
  };

  const handleSendOtp = () => {
    const contact = form.getValues("contact");
    if (contact) {
      sendOtpMutation.mutate(contact);
    }
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues("contact");
    if (contact && otp) {
      verifyOtpMutation.mutate({ contact, otp });
    }
  };

  const onSubmit = (data: ClaimFormData) => {
    submitClaimMutation.mutate(data);
  };

  if (claimSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Submitted Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Your buyback claim has been submitted and is being processed.
              </p>
              <div className="space-y-4 text-left">
                <h3 className="font-semibold text-gray-900">What's Next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Our team will contact you within 24-48 hours</li>
                  <li>• Device verification will be scheduled</li>
                  <li>• Final claim amount will be confirmed</li>
                  <li>• Payment will be processed upon approval</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Claim Your BuyBack Guarantee</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your BBG voucher code to check your claim value and process your buyback
          </p>
        </div>

        {/* Claim Process Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-xtra-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Enter Voucher Code</h3>
              <p className="text-gray-600">Input your BBG voucher code received after registration</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-xtra-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Check Claim Value</h3>
              <p className="text-gray-600">View your device's current claim value based on market conditions</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-xtra-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Process Claim</h3>
              <p className="text-gray-600">Complete the claim process and receive your payout</p>
            </CardContent>
          </Card>
        </div>

        {/* Claim Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Enter Your BBG Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Voucher Code Field - Always Visible */}
                <FormField
                  control={form.control}
                  name="voucherCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BBG Voucher Code *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Enter your BBG voucher code" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={handleCheckClaim}
                          disabled={checkClaimMutation.isPending}
                          variant="outline"
                        >
                          {checkClaimMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Check"
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Message if claim check failed */}
                {checkClaimMutation.isError && !eligibilityError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-xtra-primary mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-1">Invalid BBG Voucher Code</h4>
                        <p className="text-sm text-red-800">
                          {checkClaimMutation.error?.message || "Please check your voucher code and try again."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility Error Message */}
                {eligibilityError && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-orange-800">
                          {eligibilityError.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Only show remaining fields after successful claim check */}
                {claimDetails && (
                  <>
                    {/* Contact and Email Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
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
                                disabled={sendOtpMutation.isPending || otpSent}
                                variant="outline"
                              >
                                {sendOtpMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  otpSent ? "Resend" : "Send OTP"
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                            <p className="text-sm text-gray-500 mt-1">
                              Pre-filled from registration, but you can edit if needed
                            </p>
                          </FormItem>
                        )}
                      />

                      {otpSent && !otpVerified && (
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <FormLabel className="text-sm font-medium">Enter OTP</FormLabel>
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
                    </div>

                    {/* Pickup Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Address *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter complete address where device should be picked up" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500 mt-1">
                            Please provide a complete address including building/house details and landmarks
                          </p>
                        </FormItem>
                      )}
                    />

                    {/* Device Serial Number - Read Only */}
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number / IMEI *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Serial number will be auto-filled from registration" 
                              readOnly
                              className="bg-gray-50 cursor-not-allowed"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500 mt-1">
                            This is the serial number/IMEI from your device registration
                          </p>
                        </FormItem>
                      )}
                    />

                    {/* Pickup Schedule Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Device Pickup</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="pickupDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pickup Date *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupTimeSlot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pickup Time Slot *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time slot" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="09:00-12:00">9:00 AM - 12:00 PM</SelectItem>
                                  <SelectItem value="12:00-15:00">12:00 PM - 3:00 PM</SelectItem>
                                  <SelectItem value="15:00-18:00">3:00 PM - 6:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Pickup Instructions:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Keep your device, original box, and invoice ready</li>
                              <li>• Ensure device is functional and in fair condition</li>
                              <li>• Our pickup executive will verify device condition</li>
                              <li>• Payment will be processed within 7 days after verification</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Claim Details Display */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claim Details</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Customer Name</p>
                            <p className="font-semibold">{claimDetails.customer.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Device</p>
                            <p className="font-semibold">{claimDetails.customer.deviceType} - {claimDetails.customer.modelName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Invoice Value</p>
                            <p className="font-semibold">₹{claimDetails.customer.invoiceValue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Device Age</p>
                            <p className="font-semibold">{claimDetails.deviceAge} months</p>
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Your Claim Amount</p>
                          <p className="text-3xl font-bold text-green-600">₹{claimDetails.claimAmount}</p>
                          <p className="text-sm text-gray-600">({claimDetails.claimPercentage}% of invoice value)</p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button - Show when claim details are loaded */}
                    {claimDetails && (
                      <Button
                        type="submit"
                        style={{ backgroundColor: '#E72829', borderColor: '#E72829', color: 'white' }}
                        className="w-full hover:opacity-90 font-semibold py-3 text-lg border-2 shadow-lg transition-all duration-200 hover:shadow-xl"
                        disabled={submitClaimMutation.isPending}
                      >
                        {submitClaimMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Claim...
                          </>
                        ) : (
                          "Submit Claim"
                        )}
                      </Button>
                    )}
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Claim Value Slabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Claim Value Slabs</CardTitle>
          </CardHeader>
          <CardContent>
            {(isMobileSlabsLoading || isLaptopSlabsLoading) ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mobile Device Slabs */}
                {mobileSlabsArray.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-xtra-secondary mb-3 flex items-center">
                      📱 Mobile Device Claim Values
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-xtra-secondary/5">
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Device Age</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Claim Percentage</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Condition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mobileSlabsArray
                            .filter((slab: any) => slab.isActive)
                            .sort((a: any, b: any) => a.minMonths - b.minMonths)
                            .map((slab: any, index: number) => {
                              let colorClass = "text-green-600";
                              if (slab.percentage < 30) colorClass = "text-xtra-primary";
                              else if (slab.percentage < 50) colorClass = "text-orange-600";
                              else if (slab.percentage < 70) colorClass = "text-yellow-600";

                              return (
                                <tr key={`mobile-${slab.id}`} className={index < mobileSlabsArray.filter((s: any) => s.isActive).length - 1 ? "border-b" : ""}>
                                  <td className="py-3 px-4">{slab.minMonths}-{slab.maxMonths} months</td>
                                  <td className={`py-3 px-4 font-semibold ${colorClass}`}>{slab.percentage}% of invoice value</td>
                                  <td className="py-3 px-4">Functional and fair condition</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Laptop Device Slabs */}
                {laptopSlabsArray.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-xtra-primary mb-3 flex items-center">
                      💻 Laptop Device Claim Values
                    </h3>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-xtra-primary/5">
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Device Age</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Claim Percentage</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Condition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {laptopSlabsArray
                            .filter((slab: any) => slab.isActive)
                            .sort((a: any, b: any) => a.minMonths - b.minMonths)
                            .map((slab: any, index: number) => {
                              let colorClass = "text-green-600";
                              if (slab.percentage < 30) colorClass = "text-xtra-primary";
                              else if (slab.percentage < 50) colorClass = "text-orange-600";
                              else if (slab.percentage < 70) colorClass = "text-yellow-600";

                              return (
                                <tr key={`laptop-${slab.id}`} className={index < laptopSlabsArray.filter((s: any) => s.isActive).length - 1 ? "border-b" : ""}>
                                  <td className="py-3 px-4">{slab.minMonths}-{slab.maxMonths} months</td>
                                  <td className={`py-3 px-4 font-semibold ${colorClass}`}>{slab.percentage}% of invoice value</td>
                                  <td className="py-3 px-4">Functional and fair condition</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> All claim percentages are calculated based on the original invoice value. 
                Final claim amount is subject to device verification and condition assessment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Confetti */}
        {showConfetti && (
          <SuccessConfetti 
            isActive={showConfetti} 
            onComplete={() => setShowConfetti(false)} 
          />
        )}
      </div>
    </div>
  );
}