import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Loader2,
} from "lucide-react";
import { ValidatedField } from "@/components/validated-field";
import { SuccessConfetti } from "@/components/confetti";

const amazonRegistrationSchema = z.object({
  // Device Details - Both laptops and mobiles for Amazon registration
  deviceType: z.enum(["laptop", "mobile"], {
    required_error: "Device type is required",
  }),
  imeiSerial: z.string().min(7, "IMEI/Serial number must be at least 7 characters"),
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

type AmazonRegistrationData = z.infer<typeof amazonRegistrationSchema>;

export default function AmazonBBG() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [licenseCodeValidated, setLicenseCodeValidated] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");
  const [validatedDeviceType, setValidatedDeviceType] = useState<"mobile" | "laptop" | null>(null);
  const { toast } = useToast();

  const form = useForm<AmazonRegistrationData>({
    resolver: zodResolver(amazonRegistrationSchema),
    defaultValues: {
      deviceType: "mobile",
    },
  });

  // License code validation mutation
  const licenseCodeValidationMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("/api/validate-amazon-license", {
        method: "POST",
        body: { licenseCode: code },
      });
    },
    onSuccess: (data: any) => {
      setLicenseCodeValidated(true);
      
      // Auto-populate device type from license code validation
      if (data.data?.deviceType) {
        const deviceType = data.data.deviceType as "mobile" | "laptop";
        setValidatedDeviceType(deviceType);
        form.setValue("deviceType", deviceType);
        
        toast({
          title: "License Code Validated!",
          description: `Valid ${deviceType} license code. Please proceed with device registration.`,
        });
      } else {
        toast({
          title: "License Code Validated!",
          description: "Your Amazon BBG license code is valid. Please proceed with device registration.",
        });
      }
    },
    onError: (error: any) => {
      setLicenseCodeValidated(false);
      setValidatedDeviceType(null);
      toast({
        title: "Invalid License Code",
        description: error.message || "Please check your license code and try again",
        variant: "destructive",
      });
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: AmazonRegistrationData) => {
      const formData = new FormData();

      // Add license code
      formData.append("licenseCode", licenseCode);

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Use fetch directly for FormData
      const response = await fetch("/api/amazon-bbg/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();

        try {
          const errorData = JSON.parse(text);
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          // If not JSON or no message field, use the raw text
        }

        throw new Error(text || response.statusText || "Registration failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setShowConfetti(true);
      toast({
        title: "Registration Successful!",
        description: `Your Amazon BBG registration has been submitted successfully. Registration ID: ${data.registrationId}`,
      });

      // Reset form
      form.reset();
      setLicenseCodeValidated(false);
      setLicenseCode("");

      // Store success data in session storage
      sessionStorage.setItem(
        "amazonRegistrationSuccess",
        JSON.stringify({
          registrationId: data.registrationId,
          licenseCode: licenseCode,
          name: data.name,
          deviceType: data.deviceType,
          brand: data.brand,
          model: data.model,
        }),
      );

      // Redirect to thank you page
      window.location.href = "/amazon-thank-you";
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleValidateLicenseCode = () => {
    if (!licenseCode || licenseCode.trim() === "") {
      toast({
        title: "License Code Required",
        description: "Please enter your Amazon BBG license code",
        variant: "destructive",
      });
      return;
    }
    licenseCodeValidationMutation.mutate(licenseCode);
  };

  const handleStartOver = () => {
    setLicenseCodeValidated(false);
    setLicenseCode("");
    setValidatedDeviceType(null);
    form.reset();
  };

  const onSubmit = (data: AmazonRegistrationData) => {
    if (!licenseCodeValidated) {
      toast({
        title: "License Code Not Validated",
        description: "Please validate your license code first",
        variant: "destructive",
      });
      return;
    }
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Amazon BBG Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Register your device purchased with Amazon BBG protection. Get up
            to 70% of your device value back!
          </p>
        </div>

        {/* License Code Validation or Registration Form */}
        {!licenseCodeValidated ? (
          <Card className="shadow-xl max-w-2xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl flex items-center">
                <Hash className="h-6 w-6 mr-2" />
                Validate License Code
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Enter your Amazon BBG license code to proceed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    Amazon BBG License Code *
                  </label>
                  <Input
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                    placeholder="Enter your license code"
                    className="h-12 text-lg"
                    disabled={licenseCodeValidationMutation.isPending}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleValidateLicenseCode}
                  disabled={licenseCodeValidationMutation.isPending}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-validate-license"
                >
                  {licenseCodeValidationMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Validating License Code...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Validate License Code
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">Where to find your license code:</p>
                      <ul className="space-y-1 text-xs">
                        <li>📧 <strong>Email:</strong> Check your Amazon BBG purchase confirmation email</li>
                        <li>📦 <strong>Package:</strong> License code card included with your Amazon delivery</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Amazon Device Registration Form
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Complete all sections to activate your BBG protection
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {/* License Code Display */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800 flex-1">
                    <p className="font-medium mb-2">✅ Valid License Code</p>
                    <div className="space-y-1 text-xs">
                      <p><strong>License Code:</strong> {licenseCode}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartOver}
                      className="mt-2 text-xs"
                    >
                      Use Different License Code
                    </Button>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Device Type Selection */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="deviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Device Type *
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-4">
                              <Button
                                type="button"
                                variant={field.value === "mobile" ? "default" : "outline"}
                                onClick={() => !validatedDeviceType && field.onChange("mobile")}
                                className="flex-1"
                                disabled={!!validatedDeviceType}
                                data-testid="button-device-mobile"
                              >
                                <Smartphone className="h-4 w-4 mr-2" />
                                Mobile
                              </Button>
                              <Button
                                type="button"
                                variant={field.value === "laptop" ? "default" : "outline"}
                                onClick={() => !validatedDeviceType && field.onChange("laptop")}
                                className="flex-1"
                                disabled={!!validatedDeviceType}
                                data-testid="button-device-laptop"
                              >
                                <Laptop className="h-4 w-4 mr-2" />
                                Laptop
                              </Button>
                            </div>
                          </FormControl>
                          {validatedDeviceType && (
                            <p className="text-xs text-green-600 mt-2 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Device type determined by license code
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Device Details Section */}
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
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
                                placeholder="Enter device model"
                                validationType="model"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="purchasePrice"
                        render={({ field }) => (
                          <FormItem className="h-full">
                            <FormLabel className="flex items-center h-6 mb-2">
                              <IndianRupee className="h-4 w-4 mr-2" />
                              Device Purchase Price (Inclusive of GST) *
                            </FormLabel>
                            <FormControl>
                              <ValidatedField
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter purchase amount"
                                validationType="price"
                                type="number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
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
                              IMEI / Serial No. *
                            </FormLabel>
                            <FormControl>
                              <ValidatedField
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter IMEI or Serial Number"
                                validationType="name"
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
                          <p className="font-medium">
                            📱 <strong>Mobile IMEI:</strong> Dial *#06# or Settings → About Phone
                            {" | "}
                            💻 <strong>Laptop Serial:</strong> Check sticker on bottom/back or System Info → Hardware
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details Section */}
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
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
                    >
                      {registrationMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Register Amazon Device
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* BBG Benefits Card */}
        <Card className="shadow-lg mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Your Amazon BBG Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">*Up to 70%</div>
                <div className="text-sm text-green-700">
                  Maximum buyback value
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">*Upto 36 Months</div>
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
