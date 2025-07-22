import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { insertDistributorSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, IndianRupee, Users, TrendingUp, Building, MapPin, Phone, Mail, CreditCard, Upload, FileText, Shield, Receipt, ExternalLink } from "lucide-react";

const distributorSchema = z.object({
  name: z.string().min(2, "Full name (as per PAN/GST) is required"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  preferredMode: z.enum(["in-store", "online", "both"], {
    required_error: "Please select a preferred mode"
  }),
  // Tax & Compliance Details
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)"),
  panCopyFile: z.instanceof(File, { message: "PAN copy is required" }),
  isGstRegistered: z.boolean(),
  businessName: z.string().optional(),
  gstin: z.string().optional(),
  gstCertificateFile: z.instanceof(File).optional(),
  registeredBusinessAddress: z.string().optional(),
  isMsmeRegistered: z.boolean(),
  msmeCertificateFile: z.instanceof(File).optional(),
  // Bank Details
  accountHolderName: z.string().min(2, "Account holder name is required"),
  bankAccount: z.string().min(8, "Bank account number must be at least 8 digits"),
  bankAccountConfirm: z.string().min(8, "Please confirm bank account number"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  upiId: z.string().optional(),
  cancelledChequeFile: z.instanceof(File).optional(),
  // Declarations
  infoDeclaration: z.boolean().refine(val => val === true, "You must declare the information is correct"),
  tdsUnderstanding: z.boolean().refine(val => val === true, "You must understand TDS compliance"),
  gstInvoiceAgreement: z.boolean().refine(val => val === true, "You must agree to GST invoice terms"),
  termsAgreement: z.boolean().refine(val => val === true, "You must agree to terms and conditions")
}).refine((data) => data.bankAccount === data.bankAccountConfirm, {
  message: "Bank account numbers must match",
  path: ["bankAccountConfirm"]
}).refine((data) => !data.isGstRegistered || (data.businessName && data.gstin && data.gstCertificateFile), {
  message: "Business name, GSTIN and GST certificate are required for GST registered businesses",
  path: ["gstin"]
}).refine((data) => !data.isMsmeRegistered || data.msmeCertificateFile, {
  message: "MSME certificate is required if you are MSME registered",
  path: ["msmeCertificateFile"]
});

type DistributorFormData = z.infer<typeof distributorSchema>;

export default function DistributorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sellerCode, setSellerCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      pincode: "",
      preferredMode: undefined,
      // Tax & Compliance Details
      panNumber: "",
      panCopyFile: undefined,
      isGstRegistered: false,
      businessName: "",
      gstin: "",
      gstCertificateFile: undefined,
      registeredBusinessAddress: "",
      isMsmeRegistered: false,
      msmeCertificateFile: undefined,
      // Bank Details
      accountHolderName: "",
      bankAccount: "",
      bankAccountConfirm: "",
      ifscCode: "",
      upiId: "",
      cancelledChequeFile: undefined,
      // Declarations
      infoDeclaration: false,
      tdsUnderstanding: false,
      gstInvoiceAgreement: false,
      termsAgreement: false
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (contact: string) => {
      const response = await apiRequest("/api/send-otp", {
        method: "POST",
        body: { contact }
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
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ contact, otp }: { contact: string; otp: string }) => {
      const response = await apiRequest("/api/verify-otp", {
        method: "POST",
        body: { contact, otp }
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
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: DistributorFormData) => {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Log the form data for debugging
      console.log("Submitting distributor registration with data:", Object.keys(data));
      console.log("Files to upload:", {
        panCopyFile: data.panCopyFile ? data.panCopyFile.name : "none",
        gstCertificateFile: data.gstCertificateFile ? data.gstCertificateFile.name : "none", 
        msmeCertificateFile: data.msmeCertificateFile ? data.msmeCertificateFile.name : "none",
        cancelledChequeFile: data.cancelledChequeFile ? data.cancelledChequeFile.name : "none"
      });
      
      // Make direct fetch call to ensure proper FormData handling
      const response = await fetch("/api/distributors/register", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSellerCode(data.sellerCode);
      toast({
        title: "Registration Successful!",
        description: `Your seller code is: ${data.sellerCode}`,
      });
      // Store success data in session storage for thank you page
      sessionStorage.setItem('thankYouData', JSON.stringify({
        type: 'distributor',
        sellerCode: data.sellerCode,
        distributorName: data.distributor.name,
        email: data.distributor.email
      }));
      setTimeout(() => {
        setLocation("/thank-you");
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendOtp = () => {
    const contact = form.getValues("contact");
    if (contact && /^[6-9]\d{9}$/.test(contact)) {
      sendOtpMutation.mutate(contact);
    } else {
      toast({
        title: "Invalid Contact",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = () => {
    const contact = form.getValues("contact");
    if (otp.length === 6) {
      verifyOtpMutation.mutate({ contact, otp });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: DistributorFormData) => {
    if (!otpVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number first",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Referral Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our network and start earning commissions on every successful BBG registration. 
            Easy setup, dedicated support, and regular payouts.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Commission</h3>
              <p className="text-gray-600">Get paid for every successful BBG registration</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Network</h3>
              <p className="text-gray-600">Grow your customer base with our BBG platform</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Performance</h3>
              <p className="text-gray-600">Monitor your referrals and commission earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Referral Partner Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Full Name (as per PAN / GST) *
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
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Business Name (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            Mobile Number *
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Enter 10-digit mobile number" 
                                maxLength={10}
                                {...field} 
                                disabled={otpVerified}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleSendOtp}
                                disabled={otpSent || otpVerified || sendOtpMutation.isPending}
                              >
                                {sendOtpMutation.isPending ? "Sending..." : otpVerified ? "Verified" : "Send OTP"}
                              </Button>
                            </div>
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
                          <FormLabel className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email ID *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Enter OTP</label>
                        <Input 
                          placeholder="Enter 6-digit OTP" 
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleVerifyOtp}
                        disabled={verifyOtpMutation.isPending}
                      >
                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Pincode *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 6-digit pincode" maxLength={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Mode *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in-store">In-store</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tax & Compliance Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Tax & Compliance Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="panNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Receipt className="h-4 w-4 mr-2" />
                            PAN Number * (Required for TDS compliance)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ABCDE1234F" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="panCopyFile"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload PAN Copy (PDF/JPEG) *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => onChange(e.target.files?.[0])}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isGstRegistered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Are You GST Registered? *
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={field.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(true)}
                              >
                                Yes
                              </Button>
                              <Button
                                type="button"
                                variant={!field.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(false)}
                              >
                                No
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("isGstRegistered") && (
                      <div className="space-y-4 ml-6">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name (as per GST) *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter business name as registered" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="gstin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GSTIN *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter GSTIN number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gstCertificateFile"
                            render={({ field: { onChange, value, ...field } }) => (
                              <FormItem>
                                <FormLabel>Upload GST Certificate *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="file" 
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => onChange(e.target.files?.[0])}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="registeredBusinessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Business Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter registered business address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isMsmeRegistered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Are you covered in MSME? *
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={field.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(true)}
                              >
                                Yes
                              </Button>
                              <Button
                                type="button"
                                variant={!field.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(false)}
                              >
                                No
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("isMsmeRegistered") && (
                      <div className="ml-6">
                        <FormField
                          control={form.control}
                          name="msmeCertificateFile"
                          render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                              <FormLabel>Upload MSME Certificate *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="file" 
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => onChange(e.target.files?.[0])}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bank Details (for Monthly Payouts)
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Bank Account Holder Name * (Must match PAN)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account holder name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Bank Account Number *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bankAccountConfirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Account Number * (No copy-paste allowed)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Re-enter bank account number"
                              onPaste={(e) => e.preventDefault()}
                              onDrop={(e) => e.preventDefault()}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SBIN0001234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID (Optional but Recommended)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., yourname@paytm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cancelledChequeFile"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Cancelled Cheque / Bank Passbook *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => onChange(e.target.files?.[0])}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Declaration & Consent */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Declaration & Consent
                  </h3>
                  
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="infoDeclaration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed">
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
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed">
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
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            If GST registered, I agree to raise tax invoices to XtraCover for each month's referral commission - TBD
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAgreement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed">
                            I agree to the{" "}
                            <a 
                              href="/terms-and-conditions" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                            >
                              terms and conditions
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                            {" "}of the XtraCover Referral Program
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!otpVerified || registerMutation.isPending}
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

        {/* Success State */}
        {sellerCode && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Registration Successful!</h3>
              <p className="text-green-700 mb-4">
                Your referral code is: <strong className="text-2xl">{sellerCode}</strong>
              </p>
              <p className="text-sm text-green-600">
                Share this code with customers to earn commissions on their registrations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}