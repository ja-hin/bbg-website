import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  Smartphone,
  Laptop,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  IndianRupee,
  Info,
  Building,
  AlertTriangle,
  Clock,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { ValidatedField } from "@/components/validated-field";
import { SuccessConfetti } from "@/components/confetti";

const postPurchaseRegistrationSchema = z.object({
  // BBG Details
  voucherCode: z.string().min(1, "BBG voucher code is required"),
  imeiSerial: z.string().min(7, "IMEI/Serial number must be at least 7 characters"),
});

type PostPurchaseRegistrationData = z.infer<typeof postPurchaseRegistrationSchema>;

export default function Register() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const form = useForm<PostPurchaseRegistrationData>({
    resolver: zodResolver(postPurchaseRegistrationSchema),
    defaultValues: {
      voucherCode: "",
      imeiSerial: "",
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: PostPurchaseRegistrationData) => {
      return apiRequest("/api/register", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data) => {
      setShowConfetti(true);
      toast({
        title: "Device Registration Successful!",
        description: `Your device has been registered successfully. Registration ID: ${data.registrationId}`,
      });

      // Reset form
      form.reset();

      // Store success data in session storage for thank you page
      sessionStorage.setItem(
        "deviceRegistrationSuccess",
        JSON.stringify({
          voucherCode: data.voucherCode,
          imeiSerial: data.registration?.imeiSerial,
        }),
      );

      // Redirect to thank you page
      window.location.href = "/registration-thank-you";
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostPurchaseRegistrationData) => {
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Device Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your BBG voucher code and device IMEI/serial number to complete registration.
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Device Registration Form
            </CardTitle>
            <CardDescription className="text-blue-100 mt-2">
              Complete all sections to activate your BBG protection
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* BBG Registration Details */}
                <div className="space-y-6">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    BBG Registration Details
                  </h3>

                  <div className="grid sm:grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
                    <FormField
                      control={form.control}
                      name="voucherCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-base">
                            <Hash className="h-5 w-5 mr-2" />
                            BBG Voucher Code *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter your BBG voucher code"
                              validationType="name"
                              className="h-12 text-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imeiSerial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-base">
                            <Smartphone className="h-5 w-5 mr-2" />
                            IMEI / Serial Number *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter device IMEI or serial number"
                              validationType="imei"
                              className="h-12 text-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">How to find your device details:</p>
                        <ul className="space-y-1 text-xs">
                          <li>📱 <strong>Mobile IMEI:</strong> Dial *#06# or Settings → About Phone</li>
                          <li>💻 <strong>Laptop Serial:</strong> Sticker on bottom/back or System Info</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={registrationMutation.isPending}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
                    data-testid="button-submit-registration"
                  >
                    {registrationMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Registering Device...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Register Device
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* BBG Benefits Card */}
        <Card className="shadow-lg mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Your BBG Protection Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  Up to 80%
                </div>
                <div className="text-sm text-green-700">
                  Maximum buyback value
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  60 Months
                </div>
                <div className="text-sm text-blue-700">Coverage period</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  Free
                </div>
                <div className="text-sm text-purple-700">
                  Home pickup service
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Confetti */}
        {showConfetti && (
          <SuccessConfetti
            isActive={showConfetti}
            onComplete={() => setShowConfetti(false)}
          />
        )}
      </div>
    </div>
  );
}