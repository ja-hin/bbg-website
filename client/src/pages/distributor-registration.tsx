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
  Link,
} from "lucide-react";
import reffPartnerHero from "@assets/prtner-banner-2300x800.png";
import reffPartnerHeroMsite from "@assets/reffpartner-hero-msite.webp";
import buybackGuaranteeImgBelow from "../../../attached_assets/partner.jpeg";
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
      setOtpVerified(false);
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
    if (!/^[6-9]\d{9}$/.test(contact)) {
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
      <section className="w-full overflow-hidden cursor-pointer relative" onClick={scrollToForm}>
        {/* Desktop Banner */}
        <div className="hidden md:block relative">
          <img src={reffPartnerHero} alt="Referral Partner Banner Desktop" className="w-full h-auto object-cover block" />
          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center" style={{ padding: "0 5%" }}>
            <div style={{ maxWidth: 500 }}>
              <p className="text-white font-bold mb-1" style={{ fontSize: "clamp(16px, 2vw, 32px)", lineHeight: 1.2 }}>Refer &amp; Earn</p>
              {/* Unlimited Earnings — green with text-stroke glow */}
              <p className="font-black mb-4" style={{
                fontSize: "clamp(28px, 4.2vw, 72px)",
                lineHeight: 1,
                color: "#4ade80",
                textShadow: "0 0 30px rgba(74,222,128,0.45), 0 0 60px rgba(74,222,128,0.2)",
                WebkitTextStroke: "0.5px rgba(74,222,128,0.6)",
              }}>Unlimited<br />Earnings</p>
              <p style={{ fontSize: "clamp(11px, 1.05vw, 16px)", lineHeight: 1.6, color: "rgba(255,255,255,0.65)", maxWidth: 360, marginBottom: 18 }}>
                Every time someone buys through your code,<br />you get paid. Simple. Trackable. Guaranteed.
              </p>
              <p className="font-black text-white mb-5" style={{ fontSize: "clamp(13px, 1.25vw, 19px)", lineHeight: 1.6 }}>
                Earn up to{" "}
                <span style={{ color: "#FFD91B", textShadow: "0 0 12px rgba(255,217,27,0.5)" }}>₹175</span>
                {" "}per sale<br />No limits. No cap.
              </p>
              {/* Yellow CTA button — same as home.tsx referral section */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); scrollToForm(); }}
                style={{
                  cursor: "pointer", fontWeight: 700,
                  padding: "11px 22px", borderRadius: 100,
                  background: "rgb(255,217,27)", border: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: "clamp(12px, 1.05vw, 15px)", color: "black",
                  fontFamily: "inherit", transition: "transform 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                Start Earning Today
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 74 74" style={{ width: 22 }}>
                  <circle strokeWidth="3" stroke="black" r="35.5" cy="37" cx="37"/>
                  <path fill="black" d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"/>
                </svg>
              </button>
              <p style={{ fontSize: "clamp(9px, 0.8vw, 12px)", color: "rgba(255,255,255,0.35)", marginTop: 10 }}>Zero investment. Instant activation.</p>
            </div>
          </div>
        </div>

        {/* Mobile Banner */}
        <div className="block md:hidden relative">
          <img src={buybackGuaranteeImgBelow} alt="Referral Partner Banner Mobile" className="w-full h-[88vh] object-cover block" />
          {/* Dark gradient so text stays readable over image */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,11,35,0.82) 0%, rgba(4,11,35,0.45) 55%, transparent 100%)" }} />
          <div className="absolute inset-0 flex items-start" style={{ padding: "60px 20px 28px" }}>
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Refer &amp; Earn</p>
              <p style={{ fontSize: 35, fontWeight: 900, lineHeight: 1.05, color: "#4ade80", textShadow: "0 0 20px rgba(74,222,128,0.4)", marginBottom: 18 }}>
                Unlimited<br />Earnings
              </p>
              <p style={{ fontSize: "clamp(11px, 1.05vw, 16px)", lineHeight: 1.6, color: "rgba(255,255,255,0.65)", maxWidth: 360, marginBottom: 18 }}>
                Every time someone buys through your code,<br />you get paid. Simple. Trackable. Guaranteed.
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.5, marginBottom: 20 }}>
                Earn up to <span style={{ color: "#FFD91B" }}>₹175</span> per sale · No limits. No cap.
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); scrollToForm(); }}
                style={{ background: "rgb(255,217,27)", padding: "10px 20px", fontSize: 13, border: "none", cursor: "pointer", borderRadius: 100, fontWeight: 700, color: "black", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit" }}
              >
                Start Earning Today
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 74 74" style={{ width: 17 }}>
                  <circle strokeWidth="3" stroke="black" r="35.5" cy="37" cx="37"/>
                  <path fill="black" d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── NET WORTH SECTION ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4" style={{ background: "#0f1f4a" }}>
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Why Partner With Us</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Turn Your Network Into{" "}
              <span style={{ color: "#7ba8ff" }}>Net Worth.</span>
            </h2>
            <p className="text-white/50 text-sm mt-4 max-w-md mx-auto leading-relaxed">
              No selling, no cold calls. Just share, refer, and earn — on autopilot.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Unlimited Earnings */}
            <div
              className="group"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px 24px", transition: "all 0.2s", cursor: "default" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(123,168,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Infinity style={{ width: 22, height: 22, color: "#7ba8ff" }} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 4 }}>₹175
                <span style={{ fontSize: 14, fontWeight: 600, color: "#7ba8ff", marginLeft: 6 }}>/ laptop</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>₹100 per mobile</div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 14 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Unlimited Earnings</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                No caps, no limits. Every referral puts money in your pocket, permanently.
              </p>
            </div>

            {/* Truly Passive — highlighted center card */}
            <div
              style={{ background: "#254696", border: "1px solid rgba(123,168,255,0.3)", borderRadius: 20, padding: "28px 24px", position: "relative", overflow: "hidden", transition: "all 0.2s", cursor: "default" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2d55b0")}
              onMouseLeave={e => (e.currentTarget.style.background = "#254696")}
            >
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative" }}>
                <Zap style={{ width: 22, height: 22, color: "#fff" }} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 4 }}>100%
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginLeft: 6 }}>passive</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>zero inventory needed</div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 14 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Truly Passive Income</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                We handle everything — inventory, support, logistics. You just share.
              </p>
            </div>

            {/* Real-time Tracking */}
            <div
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px 24px", transition: "all 0.2s", cursor: "default" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(123,168,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Target style={{ width: 22, height: 22, color: "#7ba8ff" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>Live</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>real-time dashboard</div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 14 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Real-Time Tracking</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                Watch every referral and commission in real time. Withdraw instantly to your bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEPS SECTION ────────────────────────────────────────────────── */}
      <section className="py-12 md:py-12 px-4" style={{ background: "#f4f7ff" }}>
        <style>{`
          .step-card { background: #fff; border-radius: 20px; padding: 32px 28px; border: 1px solid #e8eef8; transition: box-shadow 0.2s, transform 0.2s; }
          .step-card:hover { box-shadow: 0 12px 40px rgba(37,70,150,0.10); transform: translateY(-3px); }
          .step-num { width: 52px; height: 52px; border-radius: 16px; background: #254696; color: #fff; font-size: 22px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .step-icon-wrap { width: 44px; height: 44px; border-radius: 12px; background: #eef3ff; display: flex; align-items: center; justify-content: center; }
          @media (max-width: 767px) { .step-arrow { display: none !important; } }
        `}</style>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#254696] bg-[#eef3ff] px-4 py-1.5 rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              3 Steps to Your <span className="text-[#254696]">First Payout.</span>
            </h2>
            <p className="text-gray-400 text-sm mt-3 max-w-xs mx-auto leading-relaxed">
              Sign up once, earn forever. No inventory, no hassle.
            </p>
          </div>

          {/* Steps row */}
          <div className="flex flex-col md:flex-row gap-5 md:gap-4 items-stretch">

            {/* Step 1 */}
            <div className="step-card flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="step-num">1</div>
                <div>
                  <p className="text-[10px] font-bold text-[#254696]/50 uppercase tracking-widest">Step One</p>
                  <p className="text-[11px] font-semibold text-gray-400">Takes ~60 seconds</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
              <div className="step-icon-wrap mb-4">
                <UserCheck className="w-5 h-5 text-[#254696]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">Register</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fill your basic details. No documents, no waiting. You're live the moment you submit.
              </p>
            </div>

            {/* Arrow */}
            <div className="step-arrow hidden md:flex items-center justify-center px-1 flex-shrink-0" style={{ paddingTop: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#254696" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            {/* Step 2 — highlighted */}
            <div className="flex-1 rounded-[20px] p-7 md:p-8" style={{ background: "#254696" }}>
              <div className="flex items-center gap-3 mb-6">
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Step Two</p>
                  <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Per device sold</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Link className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 tracking-tight">Attach & Earn</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Every device your customer buys — attach a BBG plan. Flat ₹175 per laptop, ₹100 per mobile credited instantly.
              </p>
            </div>

            {/* Arrow */}
            <div className="step-arrow hidden md:flex items-center justify-center px-1 flex-shrink-0" style={{ paddingTop: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#254696" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            {/* Step 3 */}
            <div className="step-card flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="step-num">3</div>
                <div>
                  <p className="text-[10px] font-bold text-[#254696]/50 uppercase tracking-widest">Step Three</p>
                  <p className="text-[11px] font-semibold text-gray-400">Monthly payouts</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
              <div className="step-icon-wrap mb-4">
                <Wallet className="w-5 h-5 text-[#254696]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">Cash Out</h3>
             </div> 
              <p className="text-sm text-gray-400 leading-relaxed">
                Watch your dashboard fill up. Withdraw directly to your bank account every month.
              </p>
            </div>

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
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    502
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Total Earnings
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#065f46]">
                    ₹87,850
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Pending Payouts
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#991b1b]">
                    ₹3,200
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] md:text-[11px] mb-0.5 md:mb-1 font-semibold uppercase tracking-wider">
                    Payouts Done
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#1e293b]">
                    ₹84,650
                  </p>
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
                          Earn:{" "}
                          <span className="text-gray-900 font-bold">
                            {reg.commission}
                          </span>
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
                "Sales library included",
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-start gap-2.5 md:gap-4"
                >
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
                      Declaration
                    </h3>

                    <FormField
                      control={form.control}
                      name="declarationAccuracy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 md:space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              id="terms-checkbox"
                              checked={field.value}
                              onCheckedChange={(val) => {
                                field.onChange(val);
                                // Synchronize other required flags
                                form.setValue("tdsUnderstanding", !!val);
                                form.setValue("gstInvoiceAgreement", !!val);
                              }}
                              className="mt-0.5 md:mt-1 border-gray-300 w-4 h-4 md:w-[18px] md:h-[18px]"
                            />
                          </FormControl>
                          <div className="grid gap-0.5 md:gap-1 leading-none">
                            <FormLabel
                              htmlFor="terms-checkbox"
                              className="text-[11px] md:text-[13px] font-medium text-gray-600 leading-normal cursor-pointer"
                            >
                              I confirm the details above are accurate,
                              understand that payouts are subject to TDS, and
                              agree to provide monthly tax invoices to XtraCover
                              if GST-registered.
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
                                checked={field.value}
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
                                checked={field.value}
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
                      registerMutation.isPending ||
                      !otpVerified ||
                      !form.watch("name") ||
                      !form.watch("email") ||
                      !form.watch("contact") ||
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
