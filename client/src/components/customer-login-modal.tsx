import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PhoneCall, Key, Loader2 } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectPath?: string;
}

export function CustomerLoginModal({ isOpen, onClose, onSuccess, redirectPath }: CustomerLoginModalProps) {
  const { toast } = useToast();
  const { login } = useCustomerAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      return apiRequest("/api/send-otp", {
        method: "POST",
        body: { phone }
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
        description: "Please check your mobile phone for the verification code.",
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

  const loginMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      return apiRequest("/api/customer/login", {
        method: "POST",
        body: { phone, otp }
      });
    },
    onSuccess: () => {
      login(phone);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid OTP or customer not found",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setPhone("");
    setOtp("");
    setIsOtpSent(false);
    setCountdown(0);
    onClose();
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid Indian mobile number starting with 6-9",
        variant: "destructive",
      });
      return;
    }

    await sendOtpMutation.mutateAsync(phone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid OTP",
        variant: "destructive",
      });
      return;
    }

    await loginMutation.mutateAsync({ phone, otp });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#254696]">
            Sign In
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Mobile Number
            </Label>
            <div className="relative">
              <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-10"
                disabled={isOtpSent}
              />
            </div>
          </div>

          {!isOtpSent ? (
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={sendOtpMutation.isPending || phone.length !== 10}
              className="w-full bg-[#254696] hover:bg-[#1a3470]"
            >
              {sendOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  Enter OTP
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {countdown > 0 ? `Resend in ${countdown}s` : ''}
                </span>
                {countdown === 0 && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#254696] hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending || otp.length < 4}
                className="w-full bg-[#254696] hover:bg-[#1a3470]"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp("");
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Change mobile number
              </button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
