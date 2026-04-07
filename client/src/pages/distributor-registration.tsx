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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import reffPartnerHero from "@assets/reffpartner-hero.jpeg";

const distributorSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  declarationAccuracy: z.boolean().refine((val) => val === true, "You must declare that the information is true and correct"),
  tdsUnderstanding: z.boolean().refine((val) => val === true, "You must acknowledge TDS compliance understanding"),
  gstInvoiceAgreement: z.boolean().refine((val) => val === true, "You must agree to GST invoice requirements"),
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
  const [activeTab, setActiveTab] = useState<"registrations" | "payouts" | "account">("registrations");

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
      toast({ title: "OTP Sent", description: "Please check your phone for the verification code" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
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
      toast({ title: "Phone Verified", description: "Your phone number has been verified successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Invalid OTP", description: error.message, variant: "destructive" });
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
      setLocation(`/thank-you?type=distributor&status=success&sellerCode=${data.sellerCode}&distributorName=${encodeURIComponent(data.distributor?.name || form.getValues('name'))}`);
    },
    onError: (error: any) => {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSendOtp = () => {
    const contact = form.getValues("contact");
    if (!contact || contact.length !== 10) {
      toast({ title: "Invalid Contact", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    sendOtpMutation.mutate(contact);
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues("contact");
    if (!otp || otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }
    verifyOtpMutation.mutate({ contact, otp });
  };

  const onSubmit = (data: DistributorFormData) => {
    if (!otpVerified) {
      toast({ title: "Phone Not Verified", description: "Please verify your phone number before registering", variant: "destructive" });
      return;
    }
    registerMutation.mutate(data);
  };

  const scrollToForm = () => {
    document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── TOP BANNER ─────────────────────────────────────────────────── */}
      <section className="w-full overflow-hidden">
        <img 
          src={reffPartnerHero} 
          alt="Referral Partner Banner" 
          className="w-full h-auto object-cover"
        />
      </section>

      {/* ── NET WORTH SECTION ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
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
                Get paid for 1 referral or 1,000. Flat ₹175 for laptops, ₹100 for mobiles. Your income scales automatically.
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
                No inventory. No selling. No support tickets. Just share your link once and let our system do the rest.
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
                Stop guessing. Watch your commissions clear in real-time on your dashboard and withdraw straight to your bank.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── STEPS SECTION ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            3 Steps to Your First Payout.
          </h2>
          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Dashed Lines (Desktop only) */}
            <div className="hidden md:block absolute top-[28%] left-[20%] right-[20%] border-t-2 border-dashed border-gray-200 -z-0" />
            
            {/* Step 1 */}
            <Card className="relative z-10 border-none shadow-sm p-8 rounded-2xl text-center bg-white flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1e293b] text-white rounded-xl flex items-center justify-center text-3xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Register in 60 Seconds</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Quick onboarding with basic details. No complex documentation needed to start.
              </p>
            </Card>
            
            {/* Step 2 */}
            <Card className="relative z-10 border-none shadow-sm p-8 rounded-2xl text-center bg-white flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1e293b] text-white rounded-xl flex items-center justify-center text-3xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Attach & Earn</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Link protection plans to every device purchase within your customer network.
              </p>
            </Card>
            
            {/* Step 3 */}
            <Card className="relative z-10 border-none shadow-sm p-8 rounded-2xl text-center bg-white flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1e293b] text-white rounded-xl flex items-center justify-center text-3xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Cash Out</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive direct payouts to your bank account with real-time settlement tracking.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 text-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0f6fb 0%, #f5f9ff 50%, #faf8ff 100%)" }}>
        {/* subtle background circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: "rgba(37, 70, 150, 0.1)" }} />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: "rgba(37, 70, 150, 0.1)" }} />

        <div className="relative max-w-3xl mx-auto">
          {/* badge */}
          <div className="inline-flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full mb-6"
            style={{
              background: "rgba(37, 70, 150, 0.1)",
              borderColor: "rgba(37, 70, 150, 0.2)",
              color: "#254696"
            }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#254696" }} />
            Official Partner Program
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Empower Your Business with{" "}
            <span style={{ color: "#254696" }}>India's Best Referral Partner Program</span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg mb-2">
            Earn{" "}
            <span className="font-semibold text-gray-700">
              ₹100 on every Mobile
            </span>{" "}
            and{" "}
            <span className="font-semibold text-gray-700">
              ₹175 on every Laptop
            </span>{" "}
            protection plan sold.
          </p>
          <p className="text-gray-400 text-sm mb-10">
            No limits. No hidden fees. Monthly payouts.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="px-8 gap-2 shadow-lg"
              onClick={scrollToForm}
            >
              Register as Partner <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-gray-300 text-gray-700"
              onClick={() => document.getElementById("dashboard-preview")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Eye className="h-4 w-4" /> View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">High Commissions</h3>
              <p className="text-sm text-gray-500">
                Earn ₹100 per mobile and ₹175 per laptop registration.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(37, 70, 150, 0.1)" }}>
              <Users className="h-5 w-5" style={{ color: "#254696" }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Build Your Network</h3>
              <p className="text-sm text-gray-500">
                Grow your customer base automatically with our easy-to-use digital tools.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Real-time Tracking</h3>
              <p className="text-sm text-gray-500">
                Monitor every sale, commission and payout.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── LIVE PARTNER DASHBOARD PREVIEW ───────────────────────────────── */}
      <section id="dashboard-preview" className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Live Partner Dashboard</h2>
            <p className="text-gray-500 text-sm">Manage your referrals and track your earnings in real-time.</p>
          </div>

          {/* Dashboard Card */}
          <Card className="border border-gray-200 shadow-lg overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Referral Dashboard</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-600 font-medium">Real-time Active</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-gray-500 text-xs w-full sm:w-auto">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Partner Info */}
              {/* Partner Info */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-gray-800">John Doe</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Contact</p>
                  <p className="text-sm font-semibold text-gray-800">9876543210</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Referral Code</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold" style={{ color: "#254696" }}>JD123</p>
                    <Copy className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-[#254696]" />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37, 70, 150, 0.1)" }}>
                    <UserCheck className="h-4 w-4" style={{ color: "#254696" }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Customers</p>
                    <p className="text-xl font-bold text-gray-900">141</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Earnings</p>
                    <p className="text-xl font-bold text-green-600">₹18,450</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pending Payouts</p>
                    <p className="text-xl font-bold text-orange-500">₹3,200</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Completed Payouts</p>
                    <p className="text-xl font-bold text-purple-600">₹15,250</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-gray-100 rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
                {(["registrations", "payouts", "account"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab === "registrations"
                      ? "Customer Registrations"
                      : tab === "payouts"
                        ? "Commission Payouts"
                        : "Account Details"}
                  </button>
                ))}
              </div>

              {/* Recent Registrations Table */}
              {activeTab === "registrations" && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Recent Registrations</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Customers who registered using your referral code: <span className="font-medium text-gray-600">JD123</span>
                  </p>
                  <div className="space-y-2">
                    {MOCK_REGISTRATIONS.map((reg) => (
                      <div
                        key={reg.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 rounded-lg px-4 py-3 gap-3 sm:gap-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-white border border-gray-100 flex items-center justify-center">
                            {reg.type === "Mobile" ? (
                              <Smartphone className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Laptop className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{reg.device}</p>

                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reg.statusColor}`}>
                            {reg.status}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">Commission: {reg.commission}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "payouts" && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Commission payout history will appear here.
                </div>
              )}

              {activeTab === "account" && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Account details will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── REGISTRATION FORM ─────────────────────────────────────────────── */}
      <section id="registration-form" className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Register as Referral Partner</h2>
            <p className="text-gray-500 text-sm">
              Join today and start earning ₹100–₹175 per successful referral immediately.
            </p>
          </div>

          <Card className="border border-gray-200 shadow-md">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Building className="h-4 w-4" style={{ color: "#254696" }} />
                      Basic Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 text-sm">
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
                            <FormLabel className="text-gray-700 text-sm">
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

                    {/* Phone + OTP */}
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm">
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
                                className="whitespace-nowrap"
                              >
                                {sendOtpMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : otpSent ? (
                                  "Sent ✓"
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
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpMutation.isPending}
                          className="whitespace-nowrap"
                        >
                          {verifyOtpMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      </div>
                    )}

                    {otpVerified && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Phone number verified
                      </div>
                    )}
                  </div>

                  {/* Declaration & Consent */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-4 w-4" style={{ color: "#254696" }} />
                      Declaration &amp; Consent
                    </h3>

                    <FormField
                      control={form.control}
                      name="declarationAccuracy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm leading-relaxed font-normal text-gray-600">
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm leading-relaxed font-normal text-gray-600">
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="text-sm leading-relaxed font-normal text-gray-600">
                            If GST registered, I agree to raise tax invoices to XtraCover for each month's referral commission
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full shadow-lg"
                    disabled={
                      !otpVerified ||
                      registerMutation.isPending ||
                      !form.watch("declarationAccuracy") ||
                      !form.watch("tdsUnderstanding") ||
                      !form.watch("gstInvoiceAgreement")
                    }
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
      </section>
    </div>
  );
}