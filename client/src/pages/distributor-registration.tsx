import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, DollarSign, Users, TrendingUp } from "lucide-react";

const distributorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  upiId: z.string().min(5, "Valid UPI ID required"),
  bankAccount: z.string().min(9, "Valid bank account number required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  accountHolderName: z.string().min(2, "Account holder name required"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type DistributorFormData = z.infer<typeof distributorSchema>;

export default function DistributorRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sellerCode, setSellerCode] = useState<string>("");

  const form = useForm<DistributorFormData>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      address: "",
      upiId: "",
      bankAccount: "",
      ifscCode: "",
      accountHolderName: "",
      agreeToTerms: false
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<DistributorFormData, 'agreeToTerms'>) => {
      const response = await apiRequest("POST", "/api/distributors/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSellerCode(data.sellerCode);
      toast({
        title: "Registration Successful!",
        description: `Your seller code is: ${data.sellerCode}`,
      });
      setTimeout(() => {
        setLocation("/thank-you?type=distributor&sellerCode=" + data.sellerCode);
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

  const onSubmit = (data: DistributorFormData) => {
    const { agreeToTerms, ...submitData } = data;
    registerMutation.mutate(submitData);
  };

  if (sellerCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
              <p className="text-gray-600 mb-6">
                Congratulations! You are now a registered Xtracover distributor.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Seller Code:</p>
                <p className="text-2xl font-bold text-red-600">{sellerCode}</p>
              </div>
              <p className="text-sm text-gray-600">
                Save this seller code. You'll earn ₹25 commission for every successful BBG registration using your code.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a BBG Distributor</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our network and earn commission on every BuyBack Guarantee sale. Earn ₹25 per successful registration!
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Commission</h3>
              <p className="text-gray-600">₹25 per successful BBG registration</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-gray-600">Quick registration process with instant seller code</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Performance</h3>
              <p className="text-gray-600">Monitor your sales and commission earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Distributor Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
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
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your complete business address"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Details Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Details for Commission
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="yourname@paytm" {...field} />
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
                          <FormLabel>Bank Account Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <FormField
                      control={form.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABCD0123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="As per bank records" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the terms and conditions
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register as Distributor"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
