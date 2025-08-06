import { useEffect, useState } from "react";
import { Link } from "wouter";
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
  Home
} from "lucide-react";

interface AcerRegistrationData {
  registrationId: string;
  voucherCode?: string;
  name: string;
  deviceType: string;
  brand: string;
  model: string;
}

export default function AcerThankYou() {
  const [registrationData, setRegistrationData] = useState<AcerRegistrationData | null>(null);

  useEffect(() => {
    // Get registration data from session storage
    const data = sessionStorage.getItem('acerRegistrationSuccess');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setRegistrationData(parsedData);
        // Clear session storage after retrieving
        sessionStorage.removeItem('acerRegistrationSuccess');
      } catch (error) {
        console.error('Error parsing registration data:', error);
      }
    }
  }, []);

  const getDeviceIcon = () => {
    if (registrationData?.deviceType === 'mobile') {
      return <Smartphone className="h-12 w-12 text-blue-600" />;
    }
    return <Laptop className="h-12 w-12 text-purple-600" />;
  };

  const getDevicePrice = () => {
    return registrationData?.deviceType === 'mobile' ? '₹99' : '₹125';
  };

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-gray-600 mb-4">No registration data found.</p>
            <Link href="/acer">
              <Button>Register Your Acer Device</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Registration Successful!</h1>
              <p className="text-lg text-gray-600 mt-2">Your Acer BBG registration is complete</p>
            </div>
          </div>
        </div>

        {/* Registration Details Card */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center justify-center">
              BBG Protection Activated
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Registration Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Registration Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <span className="font-medium text-green-700">BBG Voucher Code:</span>
                      <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-green-100 border-green-300">
                        {registrationData.voucherCode || registrationData.registrationId}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Customer Name:</span>
                      <span className="font-semibold">{registrationData.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Device:</span>
                      <div className="flex items-center">
                        {getDeviceIcon()}
                        <span className="ml-2 font-semibold">
                          {registrationData.brand} {registrationData.model}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">What's Next?</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Keep your BBG voucher code safe for claims
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      You'll receive confirmation via email and SMS
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Your BBG coverage starts immediately
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Use your voucher code to claim BBG after 6 months
                    </li>
                  </ul>
                </div>
              </div>

              {/* BBG Benefits */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Your BBG Benefits</h3>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">Up to 70%</div>
                        <div className="text-sm text-green-700">Maximum buyback value</div>
                      </div>
                    </div>
                    <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">60 Months</div>
                        <div className="text-sm text-blue-700">Coverage period</div>
                      </div>
                    </div>
                    <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">Free</div>
                        <div className="text-sm text-purple-700">Pickup service</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Contact Support</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>support@xtracover.com</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>+91-9953410422</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>WhatsApp support available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-8 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Link href="/claim-bbg">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Claim BBG (After 6 months)
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Claim Eligibility</h4>
                <ul className="space-y-1">
                  <li>• Minimum 6 months from purchase date</li>
                  <li>• Device must be in working condition</li>
                  <li>• Original purchase invoice required</li>
                  <li>• No physical damage or water damage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">BBG Process</h4>
                <ul className="space-y-1">
                  <li>• Submit claim online with BBG voucher code</li>
                  <li>• Free home pickup within 24-48 hours</li>
                  <li>• Device evaluation within 7 business days</li>
                  <li>• Payment within 7 days of approval</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thank you for choosing Xtracover BBG protection for your Acer device. 
            Save your BBG Voucher Code for future reference.
          </p>
        </div>
      </div>
    </div>
  );
}