import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Calendar, 
  CheckCircle, 
  Upload, 
  Smartphone, 
  Laptop,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  IndianRupee,
  Info,
  Building
} from "lucide-react";
import FileUpload from "@/components/file-upload";
import { ValidatedField } from "@/components/validated-field";
import { SuccessConfetti } from "@/components/confetti";

const acerRegistrationSchema = z.object({
  // Device Details - Only laptops for Acer registration
  deviceType: z.literal("laptop", {
    required_error: "Device type must be laptop"
  }),
  imeiSerial: z.string().min(5, "Serial number must be at least 5 characters"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  purchasePrice: z.string().min(1, "Device purchase price is required"),
  purchaseDate: z.string().min(1, "Device purchase date is required"),
  // Customer Details  
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Contact must be 10 digits starting with 6-9"),
  email: z.string().email("Invalid email address"),
  alternatePhone: z.string().optional(),
  // Address Details
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  // File upload
  invoiceFile: z.instanceof(File).optional(),
});

type AcerRegistrationData = z.infer<typeof acerRegistrationSchema>;

export default function AcerBBG() {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const form = useForm<AcerRegistrationData>({
    resolver: zodResolver(acerRegistrationSchema),
    defaultValues: {
      brand: "Acer",
      deviceType: "laptop", // Fixed as laptop for Acer registration
    },
  });

  const deviceType = form.watch("deviceType");

  const registrationMutation = useMutation({
    mutationFn: async (data: AcerRegistrationData) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'invoiceFile') {
          formData.append(key, value.toString());
        }
      });

      // Add file if selected
      if (invoiceFile) {
        formData.append('invoice', invoiceFile);
      }

      // Use fetch directly for FormData instead of apiRequest to avoid JSON headers
      const response = await fetch("/api/acer-bbg/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        
        // Try to extract clean error message from JSON response
        try {
          const errorData = JSON.parse(text);
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          // If not JSON or no message field, use the raw text
        }
        
        // Fallback to status text or raw response
        throw new Error(text || response.statusText || 'Registration failed');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setShowConfetti(true);
      toast({
        title: "Registration Successful!",
        description: `Your Acer BBG registration has been submitted successfully. Registration ID: ${data.registrationId}`,
      });
      
      // Reset form
      form.reset();
      setInvoiceFile(null);
      
      // Store success data in session storage for thank you page
      sessionStorage.setItem('acerRegistrationSuccess', JSON.stringify({
        registrationId: data.registrationId,
        voucherCode: data.voucherCode || data.registrationId, // Use voucherCode if available, fallback to registrationId
        name: data.name,
        deviceType: data.deviceType,
        brand: data.brand,
        model: data.model,
      }));
      
      // Redirect to thank you page
      window.location.href = '/acer-thank-you';
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AcerRegistrationData) => {
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Acer BBG Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Register your Acer device for Buy Back Guarantee protection. 
            Get up to 70% of your device value back after 6 months!
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Acer Device Registration Form
            </CardTitle>
            <CardDescription className="text-blue-100 mt-2">
              Complete all sections to activate your BBG protection
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Device Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Device Details
                  </h3>
                  
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
                            <Input 
                              placeholder="Brand" 
                              {...field} 
                              value="Acer"
                              readOnly
                              className="bg-gray-50"
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
                              placeholder="e.g., Aspire 5, Predator Helios"
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
                            Serial No. *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter Serial Number"
                              validationType="imei"
                              customValidation="acerImeiValidation"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoiceFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Device Tax Invoice
                          </FormLabel>
                          <FormControl>
                            <FileUpload
                              accept="image/*,.pdf"
                              onFileChange={(file) => {
                                setInvoiceFile(file);
                                field.onChange(file);
                              }}
                              placeholder="Upload invoice"
                              className="w-full"
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
                        <p className="font-medium">💻 Laptop Serial Number: Check sticker on bottom/back of device or System Info → Hardware</p>
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
                      name="alternatePhone"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel className="flex items-center h-6 mb-2">
                            <Phone className="h-4 w-4 mr-2" />
                            Alternate Phone
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Alternate contact (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-900 border-b pb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address Details
                  </h3>
                  
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Address Line 1 *
                          </FormLabel>
                          <FormControl>
                            <ValidatedField
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder="Enter your address"
                              validationType="address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Address Line 2
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Apartment, suite, etc. (optional)" {...field} />
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
                        <Upload className="h-5 w-5 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Register Acer Device
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Your Acer BBG Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">Up to 70%</div>
                <div className="text-sm text-green-700">Maximum buyback value</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">60 Months</div>
                <div className="text-sm text-blue-700">Coverage period</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">Free</div>
                <div className="text-sm text-purple-700">Home pickup service</div>
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