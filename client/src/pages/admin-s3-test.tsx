import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import FileUpload from "@/components/file-upload";

interface UploadResult {
  success: boolean;
  message: string;
  s3Key?: string;
  fileName?: string;
  size?: number;
  downloadUrl?: string;
}

export default function AdminS3Test() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Use fetch directly for FormData uploads
      const response = await fetch('/api/admin/s3-test/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Upload failed with status ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (result) => {
      setUploadResult(result);
      setSelectedFile(null);
      toast({
        title: "Upload Successful",
        description: `File uploaded to S3: ${result.fileName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file to S3",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (s3Key: string) => {
      return await apiRequest(`/api/admin/s3-test/download/${encodeURIComponent(s3Key)}`, {
        method: "GET",
      });
    },
    onSuccess: (result) => {
      // Open the signed URL in a new tab
      window.open(result.downloadUrl, '_blank');
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to generate download URL",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDownload = (s3Key: string) => {
    downloadMutation.mutate(s3Key);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">S3 PDF Upload Test</h1>
          <p className="text-gray-600 mt-2">Test PDF file uploads to AWS S3</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload PDF File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                accept=".pdf"
                onFileChange={(file) => {
                  setSelectedFile(file);
                  setUploadResult(null); // Clear previous results
                }}
                placeholder="Select a PDF file to upload"
                className="w-full"
              />
              
              {selectedFile && (
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">{selectedFile.name}</p>
                      <p className="text-sm text-blue-700">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-sm text-blue-700">Type: {selectedFile.type}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading to S3...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload to S3
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${uploadResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {uploadResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${uploadResult.success 
                        ? 'text-green-900' 
                        : 'text-red-900'}`}>
                        {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                      </span>
                    </div>
                    <p className={`text-sm ${uploadResult.success 
                      ? 'text-green-800' 
                      : 'text-red-800'}`}>
                      {uploadResult.message}
                    </p>
                  </div>

                  {uploadResult.success && uploadResult.s3Key && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm font-medium text-gray-700">S3 Details:</p>
                        <p className="text-sm text-gray-600 break-all">
                          <strong>Key:</strong> {uploadResult.s3Key}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>File:</strong> {uploadResult.fileName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Size:</strong> {uploadResult.size ? 
                            `${(uploadResult.size / 1024 / 1024).toFixed(2)} MB` : 
                            'Unknown'}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleDownload(uploadResult.s3Key!)}
                        disabled={downloadMutation.isPending}
                        variant="outline"
                        className="w-full"
                      >
                        {downloadMutation.isPending ? (
                          <>
                            <Download className="mr-2 h-4 w-4 animate-spin" />
                            Generating Download Link...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Upload a PDF file to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Select a PDF file using the file picker above</p>
              <p>• Click "Upload to S3" to test the upload functionality</p>
              <p>• The file will be uploaded to AWS S3 with a unique key</p>
              <p>• Use "Download File" to test signed URL generation</p>
              <p>• Check the network tab for detailed request/response data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}