import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Smartphone, 
  Laptop, 
  ArrowRight, 
  Download,
  Mail,
  MessageSquare,
  Phone,
  Home,
  ShoppingCart
} from "lucide-react";

interface DeviceRegistrationData {
  voucherCode: string;
  imeiSerial: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  deviceType: string;
  brand: string;
  model: string;
  purchasePrice: number;
  purchaseDate: string;
  voucherCode: string;
}

export default function RegistrationThankYou() {
  const [registrationData, setRegistrationData] = useState<DeviceRegistrationData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic BBG prices
  const { data: bbgPrices } = useQuery({
    queryKey: ["/api/bbg-prices"],
    queryFn: async () => {
      const response = await fetch("/api/bbg-prices");
      if (!response.ok) throw new Error("Failed to fetch BBG prices");
      return response.json();
    }
  });

  useEffect(() => {
    // Get registration data from session storage
    const data = sessionStorage.getItem('deviceRegistrationSuccess');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setRegistrationData(parsedData);
        // Clear session storage after retrieving
        sessionStorage.removeItem('deviceRegistrationSuccess');
      } catch (error) {
        console.error('Error parsing registration data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch customer details when voucher code is available
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (registrationData?.voucherCode) {
        try {
          const response = await fetch(`/api/customer-details/${registrationData.voucherCode}`);
          if (response.ok) {
            const data = await response.json();
            setCustomerData(data);
          } else {
            console.error('Failed to fetch customer data');
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCustomerData();
  }, [registrationData]);

  const getDeviceIcon = () => {
    if (customerData?.deviceType === 'mobile') {
      return <Smartphone className="h-12 w-12 text-xtra-primary" />;
    }
    return <Laptop className="h-12 w-12 text-xtra-primary" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen xtra-gradient-light flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-gray-600 mb-4">Loading registration details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen xtra-gradient-light flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">No Registration Data</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We couldn't find your registration information. This may happen if you accessed this page directly.
            </p>
            <Link href="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen xtra-gradient-light py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Device Registration Successful!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your device has been successfully registered. You will receive confirmation via email and SMS shortly.
          </p>
        </div>

        {/* Registration Details Card */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-xtra-primary to-blue-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              {getDeviceIcon()}
              <span className="ml-3">Registration Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">BBG Voucher Code</label>
                  <p className="text-lg font-semibold text-xtra-primary">
                    {registrationData.voucherCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {customerData?.name || 'Loading...'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Type</label>
                  <Badge variant="outline" className="text-sm">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Website Purchase
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Device Type</label>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {customerData?.deviceType || 'Loading...'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {customerData?.brand || 'Loading...'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {customerData?.model || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* BBG Benefits Card */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Your BBG Protection Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  Up to 70%
                </div>
                <div className="text-sm text-green-700">
                  Maximum buyback value
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  Upto 36 Months
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/claim-bbg">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-claim-bbg">
              <ArrowRight className="h-5 w-5 mr-2" />
              File a BBG Claim
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-home">
              <Home className="h-5 w-5 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Support Section */}
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 text-center">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-600">contactus@xtracover.com</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Phone className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Phone Support</p>
                  <p className="text-sm text-gray-600">+91 8860396039</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">Quick assistance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}