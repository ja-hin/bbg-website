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
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2,
  IndianRupee,
  Users,
  TrendingUp,
  Building,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Eye,
  LogOut,
  Copy,
  UserCheck,
  Wallet,
  Clock,
  CheckCircle2,
  Smartphone,
  Laptop,
  Infinity,
  Zap,
  Target,
} from "lucide-react";
import reffPartnerHero from "@assets/reffpartner-hero.webp";
import reffPartnerHeroMsite from "@assets/reffpartner-hero-msite.png";

const distributorSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  declarationAccuracy: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must declare that the information is true and correct",
    ),
  tdsUnderstanding: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must acknowledge TDS compliance understanding",
    ),
  gstInvoiceAgreement: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to GST invoice requirements",
    ),
});

type DistributorFormData = z.infer<typeof distributorSchema>;

// ─── Mock dashboard data ────────────────────────────────────────────────────
const MOCK_REGISTRATIONS = [
  {
    id: 1,
    device: "Apple iPhone 15",
    type: "Mobile",
    value: "₹74,500",
    date: "Oct 24, 2023",
    commission: "₹100",
    status: "APPROVED",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: 2,
    device: "Dell XPS 15 Plus",
    type: "Laptop",
    value: "₹1,10,000",
    date: "Oct 22, 2023",
    commission: "₹175",
    status: "APPROVED",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: 3,
    device: "Samsung Galaxy S23",
    type: "Mobile",
    value: "₹74,999",
    date: "Oct 20, 2023",
    commission: "₹100",
    status: "PROCESSING",
    statusColor: "bg-orange-100 text-orange-700",
  },
];

export default function DistributorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState<
    "registrations" | "payouts" | "account"
  >("registrations");

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      declarationAccuracy: false,
      tdsUnderstanding: false,
      gstInvoiceAgreement: false,
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      const response = await apiRequest("/api/send-otp", {
        method: "POST",
        body: { contact },
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
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ contact, otp }: { contact: string; otp: string }) => {
      const response = await apiRequest("/api/verify-otp", {
        method: "POST",
        body: { contact, otp },
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
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: DistributorFormData) => {
      const response = await apiRequest("/api/distributors/register", {
        method: "POST",
        body: data,
      });
      return response;
    },
    onSuccess: (data) => {
      setLocation(
        `/thank-you?type=distributor&status=success&sellerCode=${data.sellerCode}&distributorName=${encodeURIComponent(data.distributor?.name || form.getValues("name"))}`,
      );
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const scrollToForm = () => {
    document
      .getElementById("registration-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── TOP BANNER ─────────────────────────────────────────────────── */}
      <section className="w-full overflow-hidden">
        {/* Desktop Banner */}
        <img
          src={reffPartnerHero}
          alt="Referral Partner Banner Desktop"
          className="hidden md:block w-full h-auto object-cover"
        />
        {/* Mobile Banner */}
        <img
          src={reffPartnerHeroMsite}
          alt="Referral Partner Banner Mobile"
          className="block md:hidden w-full h-auto object-cover"
        />
      </section>

      {/* ── NET WORTH SECTION ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#f3f7ff]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center text-gray-900 mb-16">
            Turn Your Network Into Net Worth.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Zero Earning Caps */}
            <Card className="border-gray-100 shadow-sm text-center p-8 rounded-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                  <Infinity className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Zero Earning Caps</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get paid for 1 referral or 1,000. Flat ₹175 for laptops, ₹100
                for mobiles. Your income scales automatically.
              </p>
            </Card>

            {/* 100% Passive Income */}
            <Card className="border-gray-100 shadow-sm text-center p-8 rounded-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">100% Passive Income</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                No inventory. No selling. No support tickets. Just share your
                link once and let our system do the rest.
              </p>
            </Card>

            {/* Live Tracking */}
            <Card className="border-gray-100 shadow-sm text-center p-8 rounded-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Live Tracking</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Stop guessing. Watch your commissions clear in real-time on your
                dashboard and withdraw straight to your bank.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── STEPS SECTION ────────────────────────────────────────────────── */}
      <section className="py-12 md:py-24 px-4 bg-[#254696] relative overflow-hidden">
        {/* Decorative elements for the dark section */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-2xl md:text-5xl font-extrabold text-center text-white mb-10 md:mb-20 leading-tight">
            3 Steps to Your First Payout.
          </h2>
          <div className="relative grid md:grid-cols-3 gap-6 md:gap-12">
            {/* Dashed Lines (Desktop only) */}
            <div className="hidden md:block absolute top-[28%] left-[20%] right-[20%] border-t-2 border-dashed border-white/20 -z-0" />

            {/* Step 1 */}
            <Card className="relative z-10 border-none shadow-2xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#1e293b]/50 backdrop-blur-sm border border-white/10 flex flex-col items-start md:items-center text-left md:text-center">
              <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:bg-transparent">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-white text-[#254696] rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl font-black md:mb-8 shadow-xl flex-shrink-0">
                  1
                </div>
                <h3 className="text-lg md:text-xl font-bold md:mb-4 text-white">Register in 60s</h3>
              </div>
              <p className="mt-3 md:mt-0 text-blue-100/70 text-sm leading-relaxed">
                Quick onboarding with basic details. No complex documentation
                needed to start.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="relative z-10 border-none shadow-2xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#1e293b]/50 backdrop-blur-sm border border-white/10 flex flex-col items-start md:items-center text-left md:text-center">
              <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:bg-transparent">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-white text-[#254696] rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl font-black md:mb-8 shadow-xl flex-shrink-0">
                  2
                </div>
                <h3 className="text-lg md:text-xl font-bold md:mb-4 text-white">Attach & Earn</h3>
              </div>
              <p className="mt-3 md:mt-0 text-blue-100/70 text-sm leading-relaxed">
                Link protection plans to every device purchase within your
                customer network.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="relative z-10 border-none shadow-2xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#1e293b]/50 backdrop-blur-sm border border-white/10 flex flex-col items-start md:items-center text-left md:text-center">
              <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:bg-transparent">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-white text-[#254696] rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl font-black md:mb-8 shadow-xl flex-shrink-0">
                  3
                </div>
                <h3 className="text-lg md:text-xl font-bold md:mb-4 text-white">Cash Out</h3>
              </div>
              <p className="mt-3 md:mt-0 text-blue-100/70 text-sm leading-relaxed">
                Receive direct payouts to your bank account with real-time
                settlement tracking.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW SECTION ────────────────────────────────────────────── */}
      <section className="py-10 md:py-16 px-4 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Your Earnings Dashboard
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
              Track referrals, monitor payouts, and grow your income, all in one
              place.
            </p>
          </div>

          <Card className="border border-gray-100 shadow-lg rounded-2xl overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-[#eef2ff] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#254696] rounded flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-base text-[#1e293b]">
                  Partner Dashboard
                </span>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-[#ecfdf5] text-[#059669] border-none px-2.5 py-1 text-[10px] font-bold tracking-wider"
                >
                  PAYOUT READY
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-[#ecfdf5] text-[#059669] border-none px-2.5 py-1 text-[10px] font-bold tracking-wider"
                >
                  UNLIMITED EARNINGS
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 md:p-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 border-b border-gray-100 pb-6 md:pb-8">
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Total Referrals
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">502</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Total Earnings
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#065f46]">₹87,850</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Pending Payouts
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#991b1b]">₹3,200</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Payouts Done
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#1e293b]">₹84,650</p>
                </div>
              </div>

              {/* Recent Registrations List */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Recent Registrations
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  Customers who registered using your referral code:{" "}
                  <span className="font-bold text-gray-600">JD123</span>
                </p>

                <div className="space-y-2.5 md:space-y-3">
                  {[
                    {
                      device: "Apple iPhone 15",
                      status: "APPROVED",
                      commission: "₹100",
                      type: "mobile",
                    },
                    {
                      device: "Dell XPS 15 Plus",
                      status: "APPROVED",
                      commission: "₹175",
                      type: "laptop",
                    },
                    {
                      device: "Samsung S23",
                      status: "PROCESSING",
                      commission: "₹100",
                      type: "mobile",
                    },
                  ].map((reg, idx) => (
                    <div
                      key={idx}
                      className="flex flex-row items-center justify-between p-2.5 md:p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm gap-2 transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                          {reg.type === "mobile" ? (
                            <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          ) : (
                            <Laptop className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="font-bold text-sm md:text-base text-gray-800 truncate">
                          {reg.device}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className={`${reg.status === "APPROVED" ? "bg-[#ecfdf5] text-[#059669]" : "bg-[#fff7ed] text-[#9a3412]"} border-none px-2 py-0.5 font-bold text-[9px] md:text-[10px] rounded-full`}
                        >
                          {reg.status}
                        </Badge>
                        <span className="text-[10px] font-semibold text-gray-400">
                          Earn: <span className="text-gray-900 font-bold">{reg.commission}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── FINAL CTAs & REGISTRATION ────────────────────────────────────────────── */}
      <section
        id="registration-form"
        className="py-6 md:py-24 px-4 bg-gradient-to-br from-[#1e293b] via-[#254696] to-[#4338ca] relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-6 md:gap-16 items-center">
          {/* Left Column: Text & Benefits */}
          <div className="text-white text-left">
            <h2 className="text-[24px] md:text-5xl lg:text-6xl font-extrabold mb-2 md:mb-8 leading-tight text-left">
              Start Earning in Minutes
            </h2>
            <p className="text-sm md:text-xl text-blue-100 mb-4 md:mb-14 max-w-lg">
              Earn ₹100–₹175 for every successful referral sale.
            </p>

            <div className="space-y-2 md:space-y-6 mb-6 md:mb-10 lg:mb-0">
              {[
                "No upfront costs or joining fees",
                "24/7 dedicated partner support",
                "Marketing assets library included",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center justify-start gap-2.5 md:gap-4">
                  <div className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 md:w-4 h-2.5 md:h-4 text-[#254696]" />
                  </div>
                  <span className="text-xs md:text-lg font-bold text-white/90">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <Card className="border border-gray-100 shadow-xl rounded-[1.5rem] md:rounded-[2rem] bg-white overflow-hidden p-0 md:p-1">
            <CardContent className="p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-5 uppercase tracking-wider">
                Basic Details
              </h3>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2 md:space-y-4"
                >
                  <div className="space-y-2 md:space-y-3.5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-bold text-[10px] uppercase tracking-wide">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="bg-gray-50/50 border-gray-100 h-10 text-sm focus:bg-white transition-colors"
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
                        <FormItem>
                          <FormLabel className="text-gray-600 font-bold text-[10px] uppercase tracking-wide">
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              className="bg-gray-50/50 border-gray-100 h-10 text-sm focus:bg-white transition-colors"
                              {...field}
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
                          <FormLabel className="text-gray-600 font-bold text-[9px] md:text-[10px] uppercase tracking-wide">
                            Phone Number *
                          </FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="10-digit mobile"
                                maxLength={10}
                                disabled={otpVerified}
                                className="bg-gray-50/50 border-gray-100 h-9 md:h-10 text-xs md:text-sm focus:bg-white transition-colors"
                                {...field}
                              />
                            </FormControl>
                            {!otpVerified && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={sendOtpMutation.isPending || otpSent}
                                className="h-9 md:h-10 bg-white border-[#254696] text-[#254696] hover:bg-blue-50 font-bold px-3 md:px-4 text-[9px] md:text-[10px] uppercase tracking-wider whitespace-nowrap"
                              >
                                {sendOtpMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
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
                      <div className="flex gap-2">
                        <Input
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          className="bg-gray-50/50 border-gray-100 h-10 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpMutation.isPending}
                          className="h-10 bg-[#254696] text-white font-bold px-4 text-[10px] uppercase tracking-wider"
                        >
                          {verifyOtpMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-0 md:pt-1 space-y-1.5 md:space-y-3">
                    <h3 className="hidden md:block text-xs font-bold text-gray-800 uppercase tracking-widest border-l-4 border-[#254696] pl-3">
                      Terms
                    </h3>

                    <FormField
                      control={form.control}
                      name="declarationAccuracy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 md:space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 md:mt-1 border-gray-300 w-4 h-4 md:w-[18px] md:h-[18px]"
                            />
                          </FormControl>
                          <div className="grid gap-0.5 md:gap-1 leading-none">
                            <FormLabel className="text-[11px] md:text-[13px] font-medium text-gray-600 leading-normal cursor-pointer">
                              Accept information accuracy & terms:
                              <ul className="list-disc ml-4 mt-0.5 space-y-0 md:space-y-1 text-[10px] md:text-[11px] text-gray-400 font-normal">
                                <li>
                                  TDS deductions as per rules
                                </li>
                                <li>
                                  GST partner invoice requirement
                                </li>
                              </ul>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="hidden">
                      <FormField
                        control={form.control}
                        name="tdsUnderstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                checked={form.watch("declarationAccuracy")}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gstInvoiceAgreement"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                checked={form.watch("declarationAccuracy")}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-11 text-xs font-bold bg-[#254696] hover:bg-[#1e3a8a] shadow-lg rounded-xl transition-all"
                    disabled={
                      !otpVerified ||
                      registerMutation.isPending ||
                      !form.watch("declarationAccuracy")
                    }
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      "Start Earning Today"
                    )}
                  </Button>
                  <p className="text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                    No joining fees. Instant activation.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Transition gradient image effect at bottom to blend with blue footer */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />
      </section>
    </div>
  );
}
