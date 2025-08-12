import { useState } from "react";
import { Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  
  // PDF URL - this should point to your actual terms and conditions PDF
  const pdfUrl = "/api/documents/terms-and-conditions.pdf";
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'XtraCover-Terms-and-Conditions.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read our terms and conditions carefully. These terms govern your use of XtraCover's BuyBack Guarantee services.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={handleDownload}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          
          <Button 
            onClick={() => window.open(pdfUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View in New Tab
          </Button>
        </div>

        {/* PDF Viewer */}
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              XtraCover Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full" style={{ height: '800px' }}>
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Terms and Conditions PDF"
                onLoad={() => setPdfLoaded(true)}
                onError={() => setPdfLoaded(false)}
              />
              
              {!pdfLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Loading Terms and Conditions...</p>
                    <p className="text-gray-500 text-sm">
                      If the PDF doesn't load, please try downloading it or viewing in a new tab.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fallback Content */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Having trouble viewing the PDF? 
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleDownload}
              variant="outline"
              size="sm"
            >
              Download PDF
            </Button>
            <Button 
              onClick={() => window.open(pdfUrl, '_blank')}
              variant="outline"
              size="sm"
            >
              Open in New Window
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Questions about our Terms?</h3>
              <p className="text-gray-600 text-sm mb-4">
                If you have any questions about these terms and conditions, please contact us.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@xtracover.com</p>
                <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}