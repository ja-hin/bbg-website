import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDistributorAuth } from "@/hooks/useDistributorAuth";
import { PhoneCall, Key, Building2, LogIn, ArrowRight } from "lucide-react";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import bbgLogo from "@assets/BUY_BACK_GURANTEE_LOGO_1766210821932.webp";

export default function ReferralPartnerLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login, isLoginLoading } = useDistributorAuth();
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      return apiRequest("/api/send-otp", {
        method: "POST",
        body: { contact },
      });
    },
    onSuccess: () => {
      setIsOtpSent(true);
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "OTP Sent",
        description:
          "Please check your mobile phone for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = async () => {
    if (!contact || contact.length !== 10) {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contact)) {
      toast({
        title: "Invalid Contact",
        description:
          "Please enter a valid Indian mobile number starting with 6-9",
        variant: "destructive",
      });
      return;
    }

    await sendOtpMutation.mutateAsync(contact);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ contact, otp });
      toast({
        title: "Login Successful",
        description: "Welcome to your referral dashboard!",
      });
      navigate("/distributor/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description:
          error.message || "Invalid OTP or referral partner not found",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-4xl min-h-screen md:min-h-0 flex flex-col md:flex-row bg-white md:rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side - Visual/Info */}
        <div className="hidden md:flex md:w-1/2 bg-[#254696] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <img src={bbgLogo} alt="BBG Logo" className="h-28 w-auto brightness-0 invert mb-8" />
            <h2 className="text-3xl font-bold text-white mb-4">Partner with Us</h2>
            <p className="text-blue-100 text-lg">
              Access your referral dashboard to track referrals and earnings.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <Building2 className="h-5 w-5" />
              <span>Referral Partner Portal</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner Login</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Mobile Number Input */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-semibold text-gray-700">Mobile Number</Label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="contact"
                  type="tel"
                  placeholder="9876543210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-11 h-12 text-lg border-gray-200 focus:border-[#254696] focus:ring-[#254696] transition-all rounded-xl"
                  maxLength={10}
                  disabled={isOtpSent}
                />
              </div>
              {!isOtpSent && (
                <p className="text-xs text-gray-500">
                  Enter the registered mobile number
                </p>
              )}
            </div>

            {/* OTP Section */}
            {isOtpSent && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">One Time Password</Label>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-xs text-[#254696] hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-11 h-12 text-lg tracking-widest border-gray-200 focus:border-[#254696] focus:ring-[#254696] transition-all rounded-xl"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">OTP sent to {contact}</span>
                    {countdown > 0 ? (
                      <span className="text-gray-400">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[#254696] font-semibold hover:underline"
                        disabled={sendOtpMutation.isPending}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoginLoading || otp.length !== 6}
                  className="w-full h-12 bg-[#254696] hover:bg-[#1a326b] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {isLoginLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {!isOtpSent && (
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending || contact.length !== 10}
                className="w-full h-12 bg-[#254696] hover:bg-[#1a326b] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {sendOtpMutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Not a distributor yet?{" "}
              <button
                type="button"
                onClick={() => navigate("/referral-partner-registration")}
                className="text-[#254696] font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
