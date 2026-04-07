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

      {/* ── DASHBOARD PREVIEW SECTION ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Earnings Dashboard</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
              Track referrals, monitor payouts, and grow your income, all in one place.
            </p>
          </div>

          <Card className="border border-gray-100 shadow-lg rounded-2xl overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-[#eef2ff] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#254696] rounded flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-base text-[#1e293b]">Partner Dashboard</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-[#ecfdf5] text-[#059669] border-none px-2.5 py-1 text-[10px] font-bold tracking-wider">PAYOUT READY</Badge>
                <Badge variant="secondary" className="bg-[#ecfdf5] text-[#059669] border-none px-2.5 py-1 text-[10px] font-bold tracking-wider">UNLIMITED EARNINGS</Badge>
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 border-b border-gray-100 pb-8">
                <div>
                  <p className="text-gray-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">Total Referrals Generated</p>
                  <p className="text-2xl font-bold text-gray-900">502</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">Total Earnings Earned</p>
                  <p className="text-2xl font-bold text-[#065f46]">₹87,850</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">Pending Payouts</p>
                  <p className="text-2xl font-bold text-[#991b1b]">₹3,200</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">Payouts Completed</p>
                  <p className="text-2xl font-bold text-[#1e293b]">₹84,650</p>
                </div>
              </div>

              {/* Recent Registrations List */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Recent Registrations</h3>
                <p className="text-xs text-gray-400 mb-5">
                  Customers who registered using your referral code: <span className="font-bold text-gray-600">JD123</span>
                </p>
                
                <div className="space-y-3">
                  {[
                    { device: "Apple iPhone 15", status: "APPROVED", commission: "₹100", type: "mobile" },
                    { device: "Dell XPS 15 Plus", status: "APPROVED", commission: "₹175", type: "laptop" },
                    { device: "Samsung Galaxy S23", status: "PROCESSING", commission: "₹100", type: "mobile" },
                  ].map((reg, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm gap-4 transition-all">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                          {reg.type === 'mobile' ? <Smartphone className="w-5 h-5 text-gray-400" /> : <Laptop className="w-5 h-5 text-gray-400" />}
                        </div>
                        <span className="font-bold text-base text-gray-800">{reg.device}</span>
                      </div>
                      <div className="flex flex-row items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <Badge variant="secondary" className={`${reg.status === 'APPROVED' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fff7ed] text-[#9a3412]'} border-none px-3 py-0.5 font-bold text-[10px] rounded-full`}>
                          {reg.status}
                        </Badge>
                        <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Commission: <span className="text-gray-900 font-bold ml-1">{reg.commission}</span></span>
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
      <section id="registration-form" className="py-20 px-4 bg-slate-50 relative overflow-hidden">
        {/* Subtle top edge for distinction */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text & Benefits */}
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Start Earning in Minutes
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              Earn ₹100–₹175 for every successful referral sale.
            </p>
            
            <div className="space-y-5">
              {[
                "No upfront costs or joining fees",
                "24/7 dedicated partner support",
                "Common marketing assets library included"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#254696] flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-base font-semibold text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <Card className="border border-gray-100 shadow-xl rounded-[2rem] bg-white overflow-hidden p-1">
            <CardContent className="p-8 md:p-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Basic Details</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-bold text-xs uppercase tracking-wide">Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" className="bg-gray-50/50 border-gray-100 h-11 text-sm focus:bg-white transition-colors" {...field} />
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
                          <FormLabel className="text-gray-600 font-bold text-xs uppercase tracking-wide">Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email address" className="bg-gray-50/50 border-gray-100 h-11 text-sm focus:bg-white transition-colors" {...field} />
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
                          <FormLabel className="text-gray-600 font-bold text-xs uppercase tracking-wide">Phone Number *</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="10-digit mobile"
                                maxLength={10}
                                disabled={otpVerified}
                                className="bg-gray-50/50 border-gray-100 h-11 text-sm focus:bg-white transition-colors"
                                {...field}
                              />
                            </FormControl>
                            {!otpVerified && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendOtp}
                                disabled={sendOtpMutation.isPending || otpSent}
                                className="h-11 bg-white border-[#254696] text-[#254696] hover:bg-blue-50 font-bold px-5 text-xs uppercase tracking-wider"
                              >
                                {sendOtpMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send OTP"}
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
                          className="bg-gray-50/50 border-gray-100 h-11 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpMutation.isPending}
                          className="h-11 bg-[#254696] text-white font-bold px-4 text-xs uppercase tracking-wider"
                        >
                          {verifyOtpMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-l-4 border-[#254696] pl-3">Terms</h3>
                    
                    <FormField
                      control={form.control}
                      name="declarationAccuracy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-300" />
                          </FormControl>
                          <div className="grid gap-1 leading-none">
                            <FormLabel className="text-[11px] font-medium text-gray-500 leading-normal cursor-pointer">
                              I confirm the information is accurate and agree to:
                              <ul className="list-disc ml-4 mt-1.5 space-y-0.5 text-[10px] text-gray-400 font-normal">
                                <li>Payouts subject to TDS as per regulations</li>
                                <li>GST registered partners will raise invoices</li>
                              </ul>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="hidden">
                      <FormField control={form.control} name="tdsUnderstanding" render={({ field }) => (
                        <FormItem><FormControl><Checkbox checked={form.watch('declarationAccuracy')} onCheckedChange={field.onChange} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="gstInvoiceAgreement" render={({ field }) => (
                        <FormItem><FormControl><Checkbox checked={form.watch('declarationAccuracy')} onCheckedChange={field.onChange} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-sm font-bold bg-[#254696] hover:bg-[#1e3a8a] shadow-lg rounded-xl transition-all"
                    disabled={!otpVerified || registerMutation.isPending || !form.watch("declarationAccuracy")}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      "Start Earning Today"
                    )}
                  </Button>
                  <p className="text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                    Free Join • Instant Activation
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