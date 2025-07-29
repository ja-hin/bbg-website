import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  User, 
  Shield, 
  Calendar, 
  Smartphone, 
  Laptop, 
  IndianRupee, 
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Ticket,
  MapPin,
  Mail,
  Building,
  Hash
} from 'lucide-react';

// Mobile login schema
const mobileLoginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number starting with 6-9"),
  otp: z.string().optional()
});

// OTP verification schema
const otpVerificationSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 digits")
});

type MobileLoginData = z.infer<typeof mobileLoginSchema>;
type OtpVerificationData = z.infer<typeof otpVerificationSchema>;

interface CustomerRegistration {
  id: number;
  voucherCode: string;
  name: string;
  contact: string;
  email: string;
  pincode: string;
  deviceType: string;
  serialNumber: string;
  brand: string;
  modelName: string;
  invoiceValue: number;
  dateOfPurchase: string;
  registrationDate: string;
  sellerCode?: string;
  registrationSource?: string;
  isVerified: boolean;
  invoiceFile?: string;
}

export default function CustomerDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    
    if (savedPhone && savedAuth === 'true') {
      setCustomerPhone(savedPhone);
      setIsAuthenticated(true);
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
      phone: '',
      otp: ''
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send OTP');
      }

      return response.json();
    },
    onSuccess: () => {
      setShowOtpField(true);
      setOtpSent(true);
      setCountdown(30);
      toast({
        title: "OTP Sent",
        description: "Please check your mobile for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send OTP",
        description: error.message,
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid OTP');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      setCustomerPhone(loginForm.getValues('phone'));
      
      // Save authentication state
      sessionStorage.setItem('customerPhone', loginForm.getValues('phone'));
      sessionStorage.setItem('customerAuthenticated', 'true');
      
      toast({
        title: "Login Successful",
        description: "Welcome to your BBG dashboard",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch customer registrations
  const { data: registrations = [], isLoading, refetch } = useQuery<CustomerRegistration[]>({
    queryKey: ['/api/customer/registrations', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/registrations?phone=${customerPhone}`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone,
  });

  const handleSendOtp = (data: MobileLoginData) => {
    sendOtpMutation.mutate(data.phone);
  };

  const handleVerifyOtp = (data: OtpVerificationData) => {
    const phone = loginForm.getValues('phone');
    verifyOtpMutation.mutate({ phone, otp: data.otp });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCustomerPhone('');
    setShowOtpField(false);
    setOtpSent(false);
    sessionStorage.removeItem('customerPhone');
    sessionStorage.removeItem('customerAuthenticated');
    loginForm.reset();
    otpForm.reset();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType.toLowerCase() === 'laptop' ? Laptop : Smartphone;
  };

  const getStatusBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Customer Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Login with your mobile number to view BBG registrations
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-xl flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Mobile Login
              </CardTitle>
              <CardDescription className="text-blue-100">
                Enter your registered mobile number
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!showOtpField ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleSendOtp)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 10-digit mobile number"
                              {...field}
                              disabled={sendOtpMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={sendOtpMutation.isPending}
                    >
                      {sendOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      OTP sent to {loginForm.getValues('phone')}. Enter the 4-digit code below.
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
                                placeholder="Enter 4-digit OTP"
                                {...field}
                                disabled={verifyOtpMutation.isPending}
                                maxLength={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-3">
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={verifyOtpMutation.isPending}
                        >
                          {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowOtpField(false);
                            setOtpSent(false);
                            otpForm.reset();
                          }}
                        >
                          Back
                        </Button>
                      </div>
                    </form>
                  </Form>

                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500 text-center">
                      Resend OTP in {countdown} seconds
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      className="w-full"
                      onClick={() => sendOtpMutation.mutate(loginForm.getValues('phone'))}
                      disabled={sendOtpMutation.isPending}
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              BBG Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back! Here are your BBG registrations.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-medium">{customerPhone}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Registration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{registrations.length}</div>
                <div className="text-sm text-gray-600">Total Registrations</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {registrations.filter((r) => r.isVerified).length}
                </div>
                <div className="text-sm text-gray-600">Verified Devices</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{registrations.reduce((sum, r) => sum + r.invoiceValue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Coverage Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations List */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't registered any devices for BBG protection yet.
              </p>
              <Button onClick={() => window.location.href = '/customer-registration'}>
                Register Your First Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {registrations.map((registration) => {
              const DeviceIcon = getDeviceIcon(registration.deviceType);
              
              return (
                <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <DeviceIcon className="h-5 w-5 mr-2" />
                        {registration.brand} {registration.modelName}
                      </CardTitle>
                      {getStatusBadge(registration.isVerified)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Voucher Code */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-900">BBG Voucher</span>
                        </div>
                      </div>
                      <div className="text-lg font-mono font-bold text-blue-700 mt-1">
                        {registration.voucherCode}
                      </div>
                    </div>

                    {/* Device Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Serial:</span>
                        <span className="ml-1 font-mono">{registration.serialNumber}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <IndianRupee className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Invoice Value:</span>
                        <span className="ml-1 font-semibold">₹{registration.invoiceValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Purchase Date:</span>
                        <span className="ml-1">{formatDate(registration.dateOfPurchase)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Registration Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Registered:</span>
                        <span className="ml-1">{formatDate(registration.registrationDate)}</span>
                      </div>
                      
                      {registration.sellerCode && (
                        <div className="flex items-center text-sm">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Referral Code:</span>
                          <span className="ml-1 font-mono">{registration.sellerCode}</span>
                        </div>
                      )}

                      {registration.registrationSource && (
                        <div className="flex items-center text-sm">
                          <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Source:</span>
                          <span className="ml-1 capitalize">{registration.registrationSource}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.location.href = `/claim-bbg?voucher=${registration.voucherCode}`}
                      >
                        Claim BBG
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}