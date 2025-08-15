import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDistributorAuth } from "@/hooks/useDistributorAuth";
import { PhoneCall, Key, Building2, LogIn } from "lucide-react";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

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
    <div className="min-h-screen xtra-gradient-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-xtra-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-xtra-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Referral Partner Login
          </CardTitle>
          <CardDescription>
            Access your referral dashboard to track referrals and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mobile Number Input */}
            <div className="space-y-2">
              <Label htmlFor="contact">Mobile Number</Label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="pl-10"
                  maxLength={10}
                  disabled={isOtpSent}
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter the mobile number used during referral partner
                registration
              </p>
            </div>

            {/* Send OTP Button */}
            {!isOtpSent && (
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  !contact || contact.length !== 10 || sendOtpMutation.isPending
                }
                className="w-full"
              >
                {sendOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}

            {/* OTP Input */}
            {isOtpSent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    OTP sent to {contact}. Check your SMS inbox.
                  </p>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={!otp || otp.length !== 6 || isLoginLoading}
                  className="w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoginLoading ? "Logging in..." : "Login to Dashboard"}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in {countdown} seconds
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={sendOtpMutation.isPending}
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>
              </>
            )}
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Not a distributor yet?{" "}
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => navigate("/referral-partner-registration")}
              >
                Register here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
      <ScrollToTopButton />
    </div>
  );
}
