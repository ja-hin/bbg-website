import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Shield,
  Loader2,
  Lock,
  CheckCircle,
} from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be 10 digits starting with 6-9"),
  email: z.string().email("Please enter a valid email address"),
  referralCode: z.string().optional(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface SelectedPlan {
  planType: "bbg" | "extend_plus";
  deviceType: "laptop" | "mobile";
  price: number;
  planName: string;
  validity: string;
  coverage: string;
  brand: string | null;
  purchaseDate: string | null;
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

  const getPlansUrl = () => {
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
  };

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
  }, [setLocation]);

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
      referralCode: "",
      agreeToTerms: false,
    },
  });

  const watchContact = form.watch("contact");
  const watchAgreeToTerms = form.watch("agreeToTerms");
  const isFormValid = form.formState.isValid && otpVerified && watchAgreeToTerms;

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
      referralCode: data.referralCode || null,
      planType: selectedPlan.planType,
      deviceType: selectedPlan.deviceType,
      planName: selectedPlan.planName,
      amount: selectedPlan.price,
      validity: selectedPlan.validity,
      coverage: selectedPlan.coverage,
      brand: selectedPlan.brand,
      purchaseDate: selectedPlan.purchaseDate,
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    toast({
      title: "Proceeding to Payment",
      description: "Preparing payment gateway...",
    });

    paymentMutation.mutate(checkoutData);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-800 p-0"
            data-testid="button-back"
            onClick={() => setLocation(getPlansUrl())}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </div>

        {selectedPlan && (
          <div className="bg-gradient-to-r from-[#254696] to-[#4A90E2] rounded-xl p-4 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold text-lg">
                    {selectedPlan.planName}
                  </span>
                </div>
                <p className="text-white/80 text-sm">{selectedPlan.coverage}</p>
                <p className="text-white/70 text-xs mt-1">
                  Validity: {selectedPlan.validity}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₹{selectedPlan.price}</div>
                <p className="text-white/70 text-xs">(incl. GST)</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2
            className="text-lg font-semibold text-gray-800 mb-1"
            data-testid="heading-form"
          >
            These details are needed to generate invoice.
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Enter name (As per any Govt. ID){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        className="border-blue-200 focus:border-blue-500"
                        data-testid="input-name"
                      />
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
                    <FormLabel className="text-gray-700">
                      Mobile Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter your 10 digit mobile number"
                          {...field}
                          className="border-blue-200 focus:border-blue-500 flex-1"
                          disabled={otpVerified}
                          data-testid="input-contact"
                        />
                      </FormControl>
                      {!otpVerified && (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={
                            otpLoading ||
                            countdown > 0 ||
                            !/^[6-9]\d{9}$/.test(watchContact)
                          }
                          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                          data-testid="button-send-otp"
                        >
                          {otpLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : countdown > 0 ? (
                            `Resend (${countdown}s)`
                          ) : otpSent ? (
                            "Resend OTP"
                          ) : (
                            "Send OTP"
                          )}
                        </Button>
                      )}
                      {otpVerified && (
                        <div className="flex items-center text-green-600 px-3">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {otpSent && !otpVerified && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Enter OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="border-blue-200 focus:border-blue-500 flex-1"
                      data-testid="input-otp"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyLoading || otpCode.length < 4}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-verify-otp"
                    >
                      {verifyLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        className="border-blue-200 focus:border-blue-500"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Referral Code (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter referral code if you have one"
                        {...field}
                        className="border-blue-200 focus:border-blue-500"
                        data-testid="input-referral-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-terms"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-600 font-normal">
                        By continuing, you verify that you are at least 18 years
                        old and agree to these{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="text-blue-600 hover:underline"
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-blue-600 hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <p className="text-xs text-gray-500 mt-2">
                Note: Only devices purchased within India are eligible for
                XtraCover plans.
              </p>
            </form>
          </Form>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isFormValid || paymentMutation.isPending}
            className="w-full bg-[#E72829] hover:bg-red-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-continue-payment"
          >
            {paymentMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Continue To Payment"
            )}
          </Button>

          <div className="flex items-center justify-center text-gray-600 text-sm">
            <Lock className="w-4 h-4 mr-2 text-green-600" />
            Your data is encrypted. 100% safe and secure.
          </div>
        </div>
      </div>
    </div>
  );
}
