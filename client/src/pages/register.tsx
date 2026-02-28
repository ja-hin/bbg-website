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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  Smartphone, 
  Hash, 
  Info, 
  Loader2, 
  Upload, 
  Camera,
  FileText
} from "lucide-react";
import { ValidatedField } from "@/components/validated-field";
import { SuccessConfetti } from "@/components/confetti";
import { RegistrationHelpGuide } from "@/components/registration-help-guide";

const postPurchaseRegistrationSchema = z.object({
  // BBG Details - Voucher code made optional as visual input is removed
  voucherCode: z.string().optional(),
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
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [voucherFromUrl, setVoucherFromUrl] = useState<string | null>(null);

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
      setRegistrationType("website"); // Set registration type to show form directly when voucher is present
      setVoucherFromUrl(voucher);
      form.setValue("voucherCode", voucher);
    }
  }, []);

  // Device registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: PostPurchaseRegistrationData) => {
      // Ensure voucher code is present if required by backend, using URL param if available
      const payload = {
        ...data,
        voucherCode: data.voucherCode || voucherFromUrl || "NO_VOUCHER_PROVIDED" 
      };

      const registerResponse = await apiRequest("/api/register", {
        method: "POST",
        body: payload,
      });

      // If there's an invoice file, upload it immediately after registration
      if (invoiceFile && registerResponse.registrationId) {
        const formData = new FormData();
        formData.append('invoice', invoiceFile);
        formData.append('orderId', registerResponse.registrationId.toString());
        
        try {
          await fetch('/api/customer/upload-invoice', {
            method: 'POST',
            body: formData
          });
        } catch (uploadError) {
          console.error("Invoice upload failed but registration succeeded", uploadError);
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

  const handleRegistrationTypeSelect = (
    type: "acer" | "website" | "amazon",
  ) => {
    if (type === "acer") {
      window.location.href = "/acer";
    } else if (type === "amazon") {
      window.location.href = "/amazon";
    } else {
      // For website purchases, redirect to customer orders page
      window.location.href = "/customer/orders";
    }
  };

  const handleStartOver = () => {
    setRegistrationType(null);
    setVoucherFromUrl(null);
    form.reset();
    setInvoiceFile(null);
  };

  // ─── SELECTION SCREEN ──────────────────────────────────────────────────
  if (!registrationType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Device Registration
            </h1>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Please select where you purchased your device to proceed.
            </p>
          </div>

          <Card className="shadow-lg border-0 rounded-2xl bg-white">
            <CardContent className="p-6 lg:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Acer E-Store */}
                <div className="flex flex-col rounded-xl border border-blue-200 bg-blue-50/80 p-5 text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Acer E-Store
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
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
                    className="mt-auto w-full h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700"
                    data-testid="button-acer-selection"
                  >
                    Select Acer E-Store
                  </Button>
                </div>

                {/* Website Purchase */}
                <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Website Purchase
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Purchased from this website or{" "}
                    <a href="https://www.xtracover.com/" className="text-primary font-bold"
                      target="_blank">
                      Xtracover Marketplace
                    </a>
                  </p>
                  <Button
                    onClick={() => handleRegistrationTypeSelect("website")}
                    className="mt-auto w-full h-10 text-sm font-medium bg-gray-700 hover:bg-gray-800"
                    data-testid="button-website-selection"
                  >
                    Select Website Purchase
                  </Button>
                </div>

                {/* Amazon */}
                <div className="flex flex-col rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Amazon
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Purchased from the <a href="https://www.amazon.in/stores/XTRACOVER/page/9AAEC258-9B50-4F35-8DEE-37397496FCCB?lp_asin=B0FW4L6NBY&ref_=ast_bln&store_ref=bl_ast_dp_brandLogo_sto#" className="text-primary font-bold"
                                         target="_blank">Amazon</a> India Marketplace
                  </p>
                  <Button
                    onClick={() => handleRegistrationTypeSelect("amazon")}
                    className="mt-auto w-full h-10 text-sm font-medium bg-[#FF9900] hover:bg-[#E88B00]"
                    data-testid="button-amazon-selection"
                  >
                    Select Amazon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-gray-500">
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

  const onSubmit = (data: PostPurchaseRegistrationData) => {
    registrationMutation.mutate(data);
  };

  // ─── MAIN REGISTRATION LAYOUT ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* ── Left Column: Form (60%) ────────────────────────────────────── */}
      {/* Changed justify-center to justify-start and added pt-12/pt-24 to fix expansion issue */}
      <div className="w-full md:w-[60%] p-4 md:p-8 lg:p-12 flex flex-col bg-white order-2 md:order-1 relative justify-start pt-12 md:pt-24">
        <div className="max-w-xl mx-auto w-full">
          
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Register Device
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Enter your device details to activate protection.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24 md:pb-0">
              
              {/* Device Details Section - Always visible now */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="imeiSerial"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                        <div className="flex justify-between items-center">
                        <FormLabel className="text-gray-700 font-semibold text-xs uppercase tracking-wide">
                          IMEI / Serial Number
                        </FormLabel>
                        {/* Mobile-only help trigger */}
                        <button
                          type="button"
                          onClick={() => setIsHelpOpen(true)}
                          className="md:hidden flex items-center gap-1.5 text-[#1e3a8a] text-xs font-semibold hover:underline"
                        >
                          <Info className="h-3.5 w-3.5" />
                          Where to find this?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <ValidatedField
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Enter 15-digit IMEI or Serial Number"
                            validationType="imei"
                            className="h-12 pl-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#1e3a8a]/20 rounded-xl text-lg tracking-wide placeholder:tracking-normal font-medium shadow-sm transition-all"
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Smartphone className="h-5 w-5" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-gray-700 font-semibold text-xs uppercase tracking-wide">
                    Upload Invoice (Optional)
                  </FormLabel>
                  
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      id="invoice-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setInvoiceFile(file);
                      }}
                    />
                    <label
                      htmlFor="invoice-upload"
                      className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                        ${invoiceFile 
                          ? "border-green-300 bg-green-50 text-green-700" 
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300"
                        }
                      `}
                    >
                      {invoiceFile ? (
                        <>
                          <FileText className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">{invoiceFile.name}</span>
                          <span className="text-xs opacity-70 mt-1">Click to change</span>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-3 mb-2">
                            <div className="p-1.5 bg-white rounded-full shadow-sm">
                              <Upload className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="p-1.5 bg-white rounded-full shadow-sm">
                              <Camera className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          <span className="text-sm font-medium">Choose file or take photo</span>
                          <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Sticky Mobile Submit Button */}
              <div className="pt-4 md:pt-0">
                <Button
                  type="submit"
                  disabled={registrationMutation.isPending}
                  className="w-full h-12 md:h-12 bg-[#1e3a8a] text-white hover:bg-[#152861] text-base font-bold rounded-xl shadow-lg md:shadow-md transition-all active:scale-[0.98]"
                >
                  {registrationMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </div>
        
        {/* Success Confetti */}
        {showConfetti && (
          <SuccessConfetti
            isActive={showConfetti}
            onComplete={() => setShowConfetti(false)}
          />
        )}
      </div>

      {/* ── Right Column: Help Sidebar (40%) - Hidden on Mobile ──────────────── */}
      <div className="hidden md:flex w-[40%] bg-white border-l border-gray-100 p-8 lg:p-12 flex-col justify-start pt-24 order-2 h-screen sticky top-0 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Need Help?</h2>
            <p className="text-sm text-gray-500">
              Can't find your device details? We've got you covered.
            </p>
          </div>
          
          <RegistrationHelpGuide />

          {/* Additional Support Card */}
          <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-[#1e3a8a] mb-1 flex items-center gap-2">
              <Info className="h-3.5 w-3.5" /> Why do we need this?
            </h3>
            <p className="text-xs text-blue-900/70 leading-relaxed">
              Your unique IMEI or Serial Number ensures that we protect the correct device. It serves as a digital fingerprint for your coverage plan.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile Help Modal ────────────────────────────────────────────── */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-md h-[90vh] md:h-auto flex flex-col rounded-t-2xl md:rounded-2xl top-[5%] md:top-[50%] translate-y-0 md:-translate-y-1/2 p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-lg font-bold">Find Device Details</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <RegistrationHelpGuide />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
             <Button 
              className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold h-11 rounded-xl text-sm"
              onClick={() => setIsHelpOpen(false)}
            >
              Close Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
