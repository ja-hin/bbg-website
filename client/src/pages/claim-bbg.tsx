import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const claimSchema = z.object({
  bbgVoucherCode: z.string().min(5, "Valid BBG voucher code required"),
  contact: z.string().regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
  email: z.string().email("Invalid email address")
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface ClaimDetails {
  customer: {
    name: string;
    deviceType: string;
    modelName: string;
    invoiceValue: string;
  };
  claimPercentage: number;
  claimAmount: string;
  deviceAge: number;
}

export default function ClaimBBG() {
  const { toast } = useToast();
  const [claimDetails, setClaimDetails] = useState<ClaimDetails | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      bbgVoucherCode: "",
      contact: "",
      email: ""
    }
  });

  const checkClaimMutation = useMutation({
    mutationFn: async (data: { bbgVoucherCode: string }) => {
      const response = await apiRequest("POST", "/api/claims/check", data);
      return response.json();
    },
    onSuccess: (data) => {
      setClaimDetails(data);
      toast({
        title: "Claim Details Retrieved",
        description: "Your claim value has been calculated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Check Claim",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      const response = await apiRequest("POST", "/api/claims/submit", data);
      return response.json();
    },
    onSuccess: () => {
      setClaimSubmitted(true);
      toast({
        title: "Claim Submitted Successfully",
        description: "You will be contacted for device verification",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCheckClaim = () => {
    const voucherCode = form.getValues("bbgVoucherCode");
    if (voucherCode) {
      checkClaimMutation.mutate({ bbgVoucherCode: voucherCode });
    }
  };

  const onSubmit = (data: ClaimFormData) => {
    submitClaimMutation.mutate(data);
  };

  if (claimSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Submitted Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Your buyback claim has been submitted and is being processed.
              </p>
              <div className="space-y-4 text-left">
                <h3 className="font-semibold text-gray-900">What's Next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Our team will contact you within 24-48 hours</li>
                  <li>• Device verification will be scheduled</li>
                  <li>• Final claim amount will be confirmed</li>
                  <li>• Payment will be processed upon approval</li>
                </ul>
              </div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Claim Your BuyBack Guarantee</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your BBG voucher code to check your claim value and process your buyback
          </p>
        </div>

        {/* Claim Process Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Enter Voucher Code</h3>
              <p className="text-gray-600">Input your BBG voucher code received after registration</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Check Claim Value</h3>
              <p className="text-gray-600">View your device's current claim value based on market conditions</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Process Claim</h3>
              <p className="text-gray-600">Complete the claim process and receive your payout</p>
            </CardContent>
          </Card>
        </div>

        {/* Claim Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Enter Your BBG Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bbgVoucherCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BBG Voucher Code *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Enter your BBG voucher code" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={handleCheckClaim}
                          disabled={checkClaimMutation.isPending}
                          variant="outline"
                        >
                          {checkClaimMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Check"
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
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
                </div>

                {/* Claim Details Display */}
                {claimDetails && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claim Details</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Customer Name</p>
                          <p className="font-semibold">{claimDetails.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Device</p>
                          <p className="font-semibold">{claimDetails.customer.deviceType} - {claimDetails.customer.modelName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Invoice Value</p>
                          <p className="font-semibold">₹{claimDetails.customer.invoiceValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Device Age</p>
                          <p className="font-semibold">{claimDetails.deviceAge} months</p>
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Your Claim Amount</p>
                        <p className="text-3xl font-bold text-green-600">₹{claimDetails.claimAmount}</p>
                        <p className="text-sm text-gray-600">({claimDetails.claimPercentage}% of invoice value)</p>
                      </div>
                    </div>
                  </div>
                )}

                {claimDetails && (
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={submitClaimMutation.isPending}
                  >
                    {submitClaimMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Claim...
                      </>
                    ) : (
                      "Submit Claim"
                    )}
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Claim Value Slabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Claim Value Slabs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Device Age</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Claim Percentage</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">0-6 months</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">80% of invoice value</td>
                    <td className="py-3 px-4">Good working condition</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">6-12 months</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">70% of invoice value</td>
                    <td className="py-3 px-4">Good working condition</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">12-18 months</td>
                    <td className="py-3 px-4 text-yellow-600 font-semibold">60% of invoice value</td>
                    <td className="py-3 px-4">Good working condition</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">18-24 months</td>
                    <td className="py-3 px-4 text-yellow-600 font-semibold">50% of invoice value</td>
                    <td className="py-3 px-4">Good working condition</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">24+ months</td>
                    <td className="py-3 px-4 text-red-600 font-semibold">40% of invoice value</td>
                    <td className="py-3 px-4">Good working condition</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Device must be in good working condition</li>
                    <li>• Original invoice and accessories required</li>
                    <li>• Physical verification will be conducted</li>
                    <li>• Final claim value subject to device condition assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
