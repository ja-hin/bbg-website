import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight, FileText, Smartphone, Laptop } from "lucide-react";

interface BuySuccessData {
  customerName: string;
  contact: string;
  email: string;
  deviceType: 'mobile' | 'laptop';
  amount: number;
  transactionId?: string;
}

export default function BuySuccess() {
  const [purchaseData, setPurchaseData] = useState<BuySuccessData | null>(null);

  useEffect(() => {
    // Get purchase data from session storage
    const storedData = sessionStorage.getItem('buyBbgData');
    if (storedData) {
      setPurchaseData(JSON.parse(storedData));
      // Clear the session data
      sessionStorage.removeItem('buyBbgData');
    }
  }, []);

  const handleDownloadReceipt = () => {
    if (!purchaseData) return;
    
    // Create a simple receipt content
    const receiptContent = `
BBG PROTECTION PURCHASE RECEIPT
================================

Customer Name: ${purchaseData.customerName}
Contact: ${purchaseData.contact}
Email: ${purchaseData.email}
Device Type: ${purchaseData.deviceType.toUpperCase()}
Amount Paid: ₹${purchaseData.amount}
Purchase Date: ${new Date().toLocaleDateString()}
Transaction ID: ${purchaseData.transactionId || 'Processing...'}

Thank you for your purchase!
Next Step: Register your device to receive BBG voucher code.

Xtracover BBG Protection
www.xtracover.com
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BBG-Receipt-${purchaseData.contact}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Loading purchase details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Your BBG protection has been activated
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Purchase Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium">{purchaseData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{purchaseData.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{purchaseData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Device Type</p>
                  <div className="flex items-center gap-2">
                    {purchaseData.deviceType === 'mobile' ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Laptop className="h-4 w-4" />
                    )}
                    <span className="font-medium capitalize">{purchaseData.deviceType}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Amount Paid</span>
                  <span className="text-2xl font-bold text-green-600">₹{purchaseData.amount}</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleDownloadReceipt}
                  variant="outline" 
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                  <div>
                    <h4 className="font-medium text-green-600">BBG Protection Purchased</h4>
                    <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <h4 className="font-medium">Register Your Device</h4>
                    <p className="text-sm text-gray-600">Provide device details to complete your BBG setup</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <h4 className="font-medium">Receive BBG Voucher</h4>
                    <p className="text-sm text-gray-600">Get your unique voucher code for future claims</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Important!</h4>
                <p className="text-sm text-blue-800 mb-3">
                  You must register your device within 30 days to activate your BBG voucher code.
                </p>
                <Link href="/customer-registration">
                  <Button className="w-full">
                    Register Device Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Other Actions</h4>
                <div className="space-y-2">
                  <Link href="/claim-bbg">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Make a Claim
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}