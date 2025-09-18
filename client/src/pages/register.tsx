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
  // Purchase Type
  purchaseType: z.enum(["acer_estore", "website"], {
    required_error: "Please select purchase type",
  }),
  // Device Details
  deviceType: z.enum(["laptop", "mobile"], {
    required_error: "Device type is required",
  }),
  imeiSerial: z.string().min(7, "Serial number must be at least 7 characters"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  purchasePrice: z
    .string()
    .min(1, "Device purchase price (inclusive of GST) is required"),
  purchaseDate: z.string().min(1, "Device purchase date is required"),
  // Customer Details
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  pincode: z
    .string()
    .regex(
      /^[1-9][0-9]{5}$/,
      "Pincode must be 6 digits and cannot start with 0",
    ),
});

type PostPurchaseRegistrationData = z.infer<typeof postPurchaseRegistrationSchema>;

export default function Register() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const form = useForm<PostPurchaseRegistrationData>({
    resolver: zodResolver(postPurchaseRegistrationSchema),
    defaultValues: {},
  });

  const selectedDeviceType = form.watch("deviceType");
  const selectedPurchaseType = form.watch("purchaseType");

  const registrationMutation = useMutation({
    mutationFn: async (data: PostPurchaseRegistrationData) => {
      return apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
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
          registrationId: data.registrationId,
          voucherCode: data.voucherCode || data.registrationId,
          name: data.name,
          deviceType: data.deviceType,
          brand: data.brand,
          model: data.model,
          purchaseType: data.purchaseType,
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
            Device Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your device registration to activate your BBG protection.
            Provide your device serial number and details below.
          </p>
        </div>

        {/* Important Registration Notice */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">
                ⚠️ Post-Purchase Registration Required
              </span>
            </div>
            <p className="mt-1 text-sm">
              This form is for customers who have already purchased BBG coverage and need to register their device details.
            </p>
          </AlertDescription>
        </Alert>

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
                {/* Purchase Type Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="purchaseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase Type *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select where you purchased your device" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="acer_estore">Acer E-Store Purchase</SelectItem>
                            <SelectItem value="website">Website Purchase</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Device Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Device Details
                  </h3>

                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Laptop className="h-4 w-4 mr-2" />
                            Device Type *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="laptop">Laptop</SelectItem>
                              <SelectItem value="mobile">Mobile</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Building className="h-4 w-4 mr-2" />
                            Brand *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter device brand"
                              validationType="name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Hash className="h-4 w-4 mr-2" />
                            Model *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter device model name"
                              validationType="model"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-2" />
                            Device Purchase Price (Inclusive of GST) *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter purchase amount (inclusive of GST)"
                              validationType="price"
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Device Purchase Date *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel className="flex items-center">
                            <Hash className="h-4 w-4 mr-2" />
                            {selectedDeviceType === "mobile" ? "IMEI Number" : "Serial Number"} *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder={selectedDeviceType === "mobile" ? "Enter IMEI Number" : "Enter Serial Number"}
                              validationType="imei"
                              customValidation={selectedPurchaseType === "acer_estore" ? "acerImeiValidation" : undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="flex items-start space-x-2">
                      <Info className="h-3 w-3 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        {selectedDeviceType === "mobile" ? (
                          <p className="font-medium">
                            📱 Mobile IMEI: Dial *#06# or check Settings → About Phone → IMEI
                          </p>
                        ) : (
                          <p className="font-medium">
                            💻 Laptop Serial Number: Check sticker on bottom/back of device or System Info → Hardware
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Details
                  </h3>

                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <User className="h-4 w-4 mr-2" />
                            Customer Name *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter your full name"
                              validationType="name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Number *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter 10-digit mobile number"
                              validationType="phone"
                              customValidation="phoneExists"
                              type="tel"
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
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Mail className="h-4 w-4 mr-2" />
                            Email ID *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter your email address"
                              validationType="email"
                              customValidation="emailExists"
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            Pincode *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter 6-digit pincode"
                              validationType="pincode"
                              type="tel"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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