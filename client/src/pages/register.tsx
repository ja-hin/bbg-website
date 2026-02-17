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
import { CheckCircle, Smartphone, Hash, Info, Loader2, Upload } from "lucide-react";
import { ValidatedField } from "@/components/validated-field";
import { SuccessConfetti } from "@/components/confetti";

const postPurchaseRegistrationSchema = z.object({
  // BBG Details
  voucherCode: z.string().min(1, "BBG voucher code is required"),
  imeiSerial: z
    .string()
    .min(7, "IMEI/Serial number must be at least 7 characters"),
});

type PostPurchaseRegistrationData = z.infer<
  typeof postPurchaseRegistrationSchema
>;

export default function Register() {
  const [registrationType, setRegistrationType] = useState<
    "acer" | "website" | "amazon" | null
  >(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [voucherValidated, setVoucherValidated] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<PostPurchaseRegistrationData>({
    resolver: zodResolver(postPurchaseRegistrationSchema),
    defaultValues: {
      voucherCode: "",
      imeiSerial: "",
    },
  });

  useEffect(() => {
    // Check for voucher code in URL query params
    const searchParams = new URLSearchParams(window.location.search);
    const voucher = searchParams.get('voucher');
    
    if (voucher) {
      setRegistrationType("website");
      form.setValue("voucherCode", voucher);
      // Auto-validate if voucher is present
      voucherValidationMutation.mutate(voucher);
    }
  }, []);

  // Step 1: Voucher validation mutation
  const voucherValidationMutation = useMutation({
    mutationFn: async (voucherCode: string) => {
      return apiRequest("/api/validate-voucher", {
        method: "POST",
        body: { voucherCode },
      });
    },
    onSuccess: (data) => {
      setVoucherValidated(true);
      setCustomerInfo(data.customer);
      toast({
        title: "Voucher Validated!",
        description: `Valid BBG voucher for ${data.customer.name}'s ${data.customer.brand} ${data.customer.deviceType}`,
      });
    },
    onError: (error: any) => {
      setVoucherValidated(false);
      setCustomerInfo(null);
      toast({
        title: "Invalid Voucher Code",
        description:
          error.message || "Please check your voucher code and try again",
        variant: "destructive",
      });
    },
  });

  // Step 2: Device registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: PostPurchaseRegistrationData) => {
      const registerResponse = await apiRequest("/api/register", {
        method: "POST",
        body: data,
      });

      // If there's an invoice file, upload it immediately after registration
      if (invoiceFile && registerResponse.registrationId) {
        const formData = new FormData();
        formData.append('invoice', invoiceFile);
        formData.append('orderId', registerResponse.registrationId.toString());
        // Use the customer phone from the validation response or form context if available
        // Assuming validation response had it, otherwise we might need to ask user or get it from context
        // But api/customer/upload-invoice might need it. 
        // Let's use customerInfo.phone if available, or rely on backend session if authenticated?
        // The upload-invoice endpoint expects 'phone'.
        if (customerInfo?.phone) {
           formData.append('phone', customerInfo.phone);
        } else if (customerInfo?.contact) { // sometimes it's contact
           formData.append('phone', customerInfo.contact);
        }

        try {
          await fetch('/api/customer/upload-invoice', {
            method: 'POST',
            body: formData
          });
        } catch (uploadError) {
          console.error("Invoice upload failed but registration succeeded", uploadError);
          // We can notify user but still treat registration as success
        }
      }
      return registerResponse;
    },
    onSuccess: (data) => {
      setShowConfetti(true);
      toast({
        title: "Device Registration Successful!",
        description: `Your device has been registered successfully. Registration ID: ${data.registrationId}`,
      });

      // Reset form and state
      form.reset();
      setVoucherValidated(false);
      setCustomerInfo(null);
      setInvoiceFile(null);

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

  const handleValidateVoucher = () => {
    const voucherCode = form.getValues("voucherCode");
    if (!voucherCode) {
      toast({
        title: "Voucher Code Required",
        description: "Please enter your BBG voucher code",
        variant: "destructive",
      });
      return;
    }
    voucherValidationMutation.mutate(voucherCode);
  };

  const onSubmit = (data: PostPurchaseRegistrationData) => {
    if (!voucherValidated) {
      toast({
        title: "Voucher Not Validated",
        description: "Please validate your voucher code first",
        variant: "destructive",
      });
      return;
    }
    registrationMutation.mutate(data);
  };

  const handleRegistrationTypeSelect = (
    type: "acer" | "website" | "amazon",
  ) => {
    if (type === "acer") {
      window.location.href = "/acer";
    } else if (type === "amazon") {
      window.location.href = "/amazon";
    } else {
      setRegistrationType(type);
    }
  };

  const handleStartOver = () => {
    setVoucherValidated(false);
    setCustomerInfo(null);
    form.reset();
    setInvoiceFile(null);
  };

  // If no registration type is selected, show selection screen
  if (!registrationType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Device Registration
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Please select where you purchased your device to proceed with
              registration.
            </p>
          </div>

          {/* Main panel */}
          <Card className="shadow-xl border-0 rounded-2xl bg-white">
            <CardContent className="p-8 lg:p-10">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Acer E-Store */}
                <div className="flex flex-col rounded-2xl border border-blue-200 bg-blue-50/80 px-6 py-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Acer E-Store
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Purchased directly from the{" "}
                    <a
                      href="https://store.acer.com/en-in/"
                      className="text-primary font-bold"
                      target="_blank"
                    >
                      Acer
                    </a>{" "}
                    online store
                  </p>
                  <Button
                    onClick={() => handleRegistrationTypeSelect("acer")}
                    className="mt-auto w-full h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700"
                    data-testid="button-acer-selection"
                  >
                    Select Acer E-Store
                  </Button>
                </div>

                {/* Website Purchase */}
                <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 px-6 py-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Website Purchase
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Purchased from this website or{" "}
                    <a href="https://www.xtracover.com/" className="text-primary font-bold"
                      target="_blank">
                      Xtracover Marketplace
                    </a>
                  </p>
                  <Button
                    onClick={() => handleRegistrationTypeSelect("website")}
                    className="mt-auto w-full h-11 text-sm font-medium bg-gray-700 hover:bg-gray-800"
                    data-testid="button-website-selection"
                  >
                    Select Website Purchase
                  </Button>
                </div>

                {/* Amazon */}
                <div className="flex flex-col rounded-2xl border border-amber-200 bg-amber-50 px-6 py-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Amazon
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Purchased from the <a href="https://www.amazon.in/stores/XTRACOVER/page/9AAEC258-9B50-4F35-8DEE-37397496FCCB?lp_asin=B0FW4L6NBY&ref_=ast_bln&store_ref=bl_ast_dp_brandLogo_sto#" className="text-primary font-bold"
                                         target="_blank">Amazon</a> India Marketplace
                  </p>
                  <Button
                    onClick={() => handleRegistrationTypeSelect("amazon")}
                    className="mt-auto w-full h-11 text-sm font-medium bg-[#FF9900] hover:bg-[#E88B00]"
                    data-testid="button-amazon-selection"
                  >
                    Select Amazon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Not sure?{" "}
            <a
              href="https://www.xtracover.com/contact-us"
              target="_blank"
              className="text-blue-600 font-medium hover:underline"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => setRegistrationType(null)}
            className="mb-4"
            data-testid="button-back-to-selection"
          >
            ← Back to Selection
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Device Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your BBG voucher code and device IMEI/serial number to
            complete registration.
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
                {/* Step 1: BBG Voucher Validation */}
                {!voucherValidated && (
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Step 1: Validate BBG Voucher Code
                    </h3>

                    <div className="max-w-md mx-auto space-y-4">
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
                                disabled={voucherValidationMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        onClick={handleValidateVoucher}
                        disabled={voucherValidationMutation.isPending}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                        data-testid="button-validate-voucher"
                      >
                        {voucherValidationMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Validating Voucher...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Validate Voucher Code
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-2">
                            Where to find your BBG voucher code:
                          </p>
                          <ul className="space-y-1 text-xs">
                            <li>
                              📧 <strong>Email:</strong> Check your BBG purchase
                              confirmation email
                            </li>
                            <li>
                              📱 <strong>SMS:</strong> Sent to your registered
                              mobile number
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Customer Info & Device Registration */}
                {voucherValidated && customerInfo && (
                  <div className="space-y-6">
                    {/* Customer Information Display */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-2">
                            ✅ Valid BBG Voucher Code
                          </p>
                          <div className="space-y-1 text-xs">
                            <p>
                              <strong>Customer:</strong> {customerInfo.name}
                            </p>
                            <p>
                              <strong>Device:</strong> {customerInfo.brand}{" "}
                              {customerInfo.deviceType}
                            </p>
                            <p>
                              <strong>Voucher:</strong>{" "}
                              {customerInfo.voucherCode}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleStartOver}
                            className="mt-2 text-xs"
                          >
                            Use Different Voucher Code
                          </Button>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Step 2: Enter Device Details
                    </h3>

                    <div className="max-w-md mx-auto space-y-6">
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

                      <div className="space-y-2">
                        <FormLabel className="flex items-center text-base">
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Invoice (Optional)
                        </FormLabel>
                        <div className="flex items-center gap-4">
                          <Input 
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setInvoiceFile(file);
                            }}
                            className="cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Accepted formats: PDF, JPG, PNG. Max size: 5MB.
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-2">
                            How to find your device details:
                          </p>
                          <ul className="space-y-1 text-xs">
                            <li>
                              📱 <strong>Mobile IMEI:</strong> Dial *#06# or
                              Settings → About Phone
                            </li>
                            <li>
                              💻 <strong>Laptop Serial:</strong> Sticker on
                              bottom/back or System Info
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button - Only show when voucher is validated */}
                {voucherValidated && (
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={registrationMutation.isPending}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
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
                          Complete Device Registration
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
                  *Up to 70%
                </div>
                <div className="text-sm text-green-700">
                  Maximum buyback value
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  *Upto 36 Months
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
