import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Eye,
  Clock,
  User
} from 'lucide-react';

// Mobile login schema
const mobileLoginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number starting with 6-9")
});

// OTP verification schema
const otpVerificationSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 digits").max(6, "OTP cannot be more than 6 digits")
});

type MobileLoginData = z.infer<typeof mobileLoginSchema>;
type OtpVerificationData = z.infer<typeof otpVerificationSchema>;

export default function CustomerLogin() {
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    
    if (savedPhone && savedAuth === 'true') {
      window.location.href = '/customer-dashboard';
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loginForm = useForm<MobileLoginData>({
    resolver: zodResolver(mobileLoginSchema),
    defaultValues: {
      phone: ''
    }
  });

  const otpForm = useForm<OtpVerificationData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: ''
    }
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    },
    onSuccess: () => {
      setShowOtpField(true);
      setOtpSent(true);
      setCountdown(30);
      toast({
        title: "OTP Sent Successfully",
        description: `Verification code sent to ${loginForm.getValues('phone')}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please check your mobile number and try again",
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      return data;
    },
    onSuccess: () => {
      const phone = loginForm.getValues('phone');
      
      // Save authentication state
      sessionStorage.setItem('customerPhone', phone);
      sessionStorage.setItem('customerAuthenticated', 'true');
      
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/customer-dashboard';
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed", 
        description: error.message || "Please check your OTP and try again",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = (data: MobileLoginData) => {
    sendOtpMutation.mutate(data.phone);
  };

  const handleVerifyOtp = (data: OtpVerificationData) => {
    const phone = loginForm.getValues('phone');
    verifyOtpMutation.mutate({ phone, otp: data.otp });
  };

  const handleBackToPhone = () => {
    setShowOtpField(false);
    setOtpSent(false);
    setCountdown(0);
    otpForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Login
          </h1>
          <p className="text-gray-600">
            Access your BBG registrations and device information
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {!showOtpField ? 'Enter Mobile Number' : 'Verify OTP'}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {!showOtpField 
                ? 'Enter your registered mobile number to access your dashboard'
                : 'Enter the verification code sent to your mobile'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!showOtpField ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleSendOtp)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 10-digit mobile number"
                            {...field}
                            disabled={sendOtpMutation.isPending}
                            className="text-lg py-3"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                    disabled={sendOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    OTP sent to <span className="font-medium">{loginForm.getValues('phone')}</span>
                    <br />
                    Please enter the 4-6 digit verification code below.
                  </AlertDescription>
                </Alert>
                
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter OTP"
                              {...field}
                              disabled={verifyOtpMutation.isPending}
                              className="text-lg py-3 text-center tracking-widest"
                              maxLength={6}
                              autoComplete="one-time-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={verifyOtpMutation.isPending}
                      >
                        {verifyOtpMutation.isPending ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify & Login
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToPhone}
                        disabled={verifyOtpMutation.isPending}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Resend OTP Section */}
                <div className="text-center pt-4 border-t">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in <span className="font-medium text-blue-600">{countdown}</span> seconds
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={() => sendOtpMutation.mutate(loginForm.getValues('phone'))}
                      disabled={sendOtpMutation.isPending}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Need Help?</p>
                <p className="text-gray-600">
                  Make sure you're using the same mobile number that was used during BBG registration. 
                  If you're still having trouble, please contact our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="text-center mt-8 space-y-3">
          <div>
            <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Back to Home
            </a>
          </div>
          <div className="text-sm text-gray-500">
            Don't have a BBG registration? 
            <a href="/customer-registration" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Register your device
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}