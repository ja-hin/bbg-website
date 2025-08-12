import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  
  // PDF URL - this should point to your actual terms and conditions PDF
  const pdfUrl = "/api/documents/terms-and-conditions.pdf";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
                      Please wait while the document loads.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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