import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Upload, Smartphone, Laptop } from "lucide-react";

const acerRegistrationSchema = z.object({
  deviceType: z.enum(["mobile", "laptop"], {
    required_error: "Please select a device type",
  }),
  imeiSerial: z.string().min(1, "IMEI/Serial number is required"),
  brand: z.string().min(1, "Brand is required"),
  name: z.string().min(1, "Name is required"),
  model: z.string().min(1, "Model is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  purchasePrice: z.string().min(1, "Purchase price is required"),
  alternatePhone: z.string().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  invoice: z.any().optional(),
});

type AcerRegistrationData = z.infer<typeof acerRegistrationSchema>;

export default function AcerBBG() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AcerRegistrationData>({
    resolver: zodResolver(acerRegistrationSchema),
    defaultValues: {
      brand: "Acer",
    },
  });

  const deviceType = watch("deviceType");

  const registrationMutation = useMutation({
    mutationFn: async (data: AcerRegistrationData) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Add file if selected
      if (selectedFile) {
        formData.append('invoice', selectedFile);
      }

      const response = await apiRequest("/api/acer-bbg/register", {
        method: "POST",
        body: formData,
      });

      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: `Your Acer BBG registration has been submitted successfully. Registration ID: ${data.registrationId}`,
      });
      
      // Reset form
      reset();
      setSelectedFile(null);
      
      // Store success data in session storage for thank you page
      sessionStorage.setItem('acerRegistrationSuccess', JSON.stringify({
        registrationId: data.registrationId,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const onSubmit = (data: AcerRegistrationData) => {
    if (!selectedFile) {
      toast({
        title: "Invoice Required",
        description: "Please upload an invoice document",
        variant: "destructive",
      });
      return;
    }
    
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Acer_2011.svg/1200px-Acer_2011.svg.png" 
              alt="Acer Logo" 
              className="h-12 mr-4"
            />
            <h1 className="text-4xl font-bold text-gray-900">
              Acer BBG Registration
            </h1>
          </div>
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
              Device Registration Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Device Type */}
              <div>
                <Label htmlFor="deviceType" className="text-base font-semibold">
                  Select Device *
                </Label>
                <Select onValueChange={(value) => setValue("deviceType", value as "mobile" | "laptop")}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose your device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Mobile
                      </div>
                    </SelectItem>
                    <SelectItem value="laptop">
                      <div className="flex items-center">
                        <Laptop className="h-4 w-4 mr-2" />
                        Laptop
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.deviceType && (
                  <p className="text-red-500 text-sm mt-1">{errors.deviceType.message}</p>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IMEI/Serial Number */}
                <div>
                  <Label htmlFor="imeiSerial" className="text-base font-semibold">
                    IMEI/Serial Number *
                  </Label>
                  <Input
                    id="imeiSerial"
                    {...register("imeiSerial")}
                    placeholder={deviceType === "mobile" ? "Dial *#06# to find IMEI" : "Check system settings"}
                    className="mt-2"
                  />
                  {errors.imeiSerial && (
                    <p className="text-red-500 text-sm mt-1">{errors.imeiSerial.message}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <Label htmlFor="brand" className="text-base font-semibold">
                    Brand *
                  </Label>
                  <Input
                    id="brand"
                    {...register("brand")}
                    value="Acer"
                    readOnly
                    className="mt-2 bg-gray-50"
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-base font-semibold">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter your full name"
                    className="mt-2"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <Label htmlFor="model" className="text-base font-semibold">
                    Model *
                  </Label>
                  <Input
                    id="model"
                    {...register("model")}
                    placeholder="e.g., Aspire 5, Predator Helios"
                    className="mt-2"
                  />
                  {errors.model && (
                    <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email ID *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="your.email@example.com"
                    className="mt-2"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="10-digit mobile number"
                    className="mt-2"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Purchase Price */}
                <div>
                  <Label htmlFor="purchasePrice" className="text-base font-semibold">
                    Purchase Price *
                  </Label>
                  <Input
                    id="purchasePrice"
                    {...register("purchasePrice")}
                    placeholder="₹ Enter purchase amount"
                    className="mt-2"
                  />
                  {errors.purchasePrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.purchasePrice.message}</p>
                  )}
                </div>

                {/* Alternate Phone */}
                <div>
                  <Label htmlFor="alternatePhone" className="text-base font-semibold">
                    Alternate Phone
                  </Label>
                  <Input
                    id="alternatePhone"
                    {...register("alternatePhone")}
                    placeholder="Optional alternate number"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Purchase Date */}
              <div>
                <Label htmlFor="purchaseDate" className="text-base font-semibold">
                  Purchase Date *
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...register("purchaseDate")}
                  className="mt-2"
                />
                {errors.purchaseDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.purchaseDate.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="addressLine1" className="text-base font-semibold">
                    Address Line 1 *
                  </Label>
                  <Textarea
                    id="addressLine1"
                    {...register("addressLine1")}
                    placeholder="Street address, house number, building name"
                    className="mt-2"
                    rows={2}
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="addressLine2" className="text-base font-semibold">
                    Address Line 2
                  </Label>
                  <Textarea
                    id="addressLine2"
                    {...register("addressLine2")}
                    placeholder="Landmark, area, city, state, pincode (optional)"
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </div>

              {/* Invoice Upload */}
              <div>
                <Label htmlFor="invoice" className="text-base font-semibold">
                  Upload Invoice * (Max. Size 2 MB)
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="invoice-upload"
                  />
                  <label htmlFor="invoice-upload" className="cursor-pointer">
                    <span className="text-blue-600 font-semibold">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF, PNG, JPG up to 2MB
                  </p>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 font-medium">
                        ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  disabled={registrationMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 text-lg"
                >
                  {registrationMutation.isPending ? (
                    "Registering..."
                  ) : (
                    "Register for Acer BBG"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* BBG Benefits */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Why Choose Acer BBG?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Up to 70% Value Back</h3>
                <p className="text-gray-600 text-sm">Get maximum return on your device investment</p>
              </div>
              <div>
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">5 Year Coverage</h3>
                <p className="text-gray-600 text-sm">Long-term protection for your device</p>
              </div>
              <div>
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Easy Process</h3>
                <p className="text-gray-600 text-sm">Simple registration and claim process</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}