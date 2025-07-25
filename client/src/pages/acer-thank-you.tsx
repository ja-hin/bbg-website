import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Home, Calendar, Smartphone, Laptop } from "lucide-react";
import { Link } from "wouter";

interface RegistrationData {
  registrationId: string;
  name: string;
  deviceType: string;
  brand: string;
  model: string;
}

export default function AcerThankYou() {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('acerRegistrationSuccess');
    if (data) {
      setRegistrationData(JSON.parse(data));
      // Clear the data after use
      sessionStorage.removeItem('acerRegistrationSuccess');
    }
  }, []);

  const handleDownloadReceipt = () => {
    if (!registrationData) return;
    
    // Create a simple receipt
    const receiptContent = `
ACER BBG REGISTRATION RECEIPT
=============================

Registration ID: ${registrationData.registrationId}
Name: ${registrationData.name}
Device Type: ${registrationData.deviceType.charAt(0).toUpperCase() + registrationData.deviceType.slice(1)}
Brand: ${registrationData.brand}
Model: ${registrationData.model}
Registration Date: ${new Date().toLocaleDateString()}

Thank you for registering with Acer BBG!
Your device is now protected under our Buy Back Guarantee program.

For support, contact: support@xtracover.com
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acer-bbg-receipt-${registrationData.registrationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <p className="text-gray-600">No registration data found. Please complete a registration first.</p>
            <Link href="/acer">
              <Button className="mt-4">Go to Registration</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Registration Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your Acer device has been successfully registered for BBG protection.
          </p>
        </div>

        {/* Registration Details */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              {registrationData.deviceType === 'mobile' ? (
                <Smartphone className="h-6 w-6 mr-2" />
              ) : (
                <Laptop className="h-6 w-6 mr-2" />
              )}
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Registration ID</h3>
                <p className="text-xl font-mono bg-gray-100 p-3 rounded border">
                  {registrationData.registrationId}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Registration Date</h3>
                <p className="text-lg text-gray-900">
                  {new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Customer Name</h3>
                <p className="text-lg text-gray-900">{registrationData.name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Device Details</h3>
                <p className="text-lg text-gray-900">
                  {registrationData.brand} {registrationData.model}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {registrationData.deviceType}
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Important Information
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Your device is now covered under Acer BBG for up to 5 years</li>
                <li>• Claims can be made after 6 months from registration date</li>
                <li>• Keep your registration ID safe for future reference</li>
                <li>• You'll receive email confirmation within 24 hours</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* BBG Claim Value Structure */}
        <Card className="shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl">BBG Claim Value Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Age of Device</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Claim Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">6-12 months</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-green-600">70%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">13-18 months</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-green-600">60%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">19-24 months</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-blue-600">50%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">25-36 months</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-blue-600">40%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">37-48 months</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">30%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">49-60 months</td>
                    <td className="border border-gray-300 px-4 py-2 font-semibold text-orange-600">25%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownloadReceipt}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Link href="/">
              <Button variant="outline" className="flex items-center justify-center w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-600 mt-6">
            Need help? Contact us at{" "}
            <a href="mailto:support@xtracover.com" className="text-blue-600 hover:underline">
              support@xtracover.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}