import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ExcelUploadProps {
  onUploadComplete?: () => void;
}

export function ExcelUpload({ onUploadComplete }: ExcelUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/claim-value-slabs/excel-template', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'claim-value-slabs-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Template Downloaded",
        description: "Excel template downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('excel', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/claim-value-slabs/excel-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      setUploadResult(result);
      setFile(null);
      
      if (onUploadComplete) {
        onUploadComplete();
      }

      toast({
        title: "Upload Successful",
        description: `Processed ${result.totalProcessed} records successfully`,
      });

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload Excel file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={resetUpload}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Excel Import/Export - Claim Value Slabs</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Download Template</h3>
            </div>
            <p className="text-sm text-gray-600">
              Download the Excel template with current data and proper formatting. 
              You can add new rows or edit existing ones.
            </p>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Excel Template
            </Button>
          </div>

          {/* Upload Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Upload Excel File</h3>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Instructions:</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                  <li>Use the downloaded template for proper format</li>
                  <li>Required columns: Device Type, Brand, Min Months, Max Months, Percentage</li>
                  <li>Leave ID column empty for new records</li>
                  <li>Existing records (with ID) will be updated</li>
                  <li>Brand column can be empty for generic slabs</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {file ? file.name : 'Click to select Excel file'}
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    onClick={() => setFile(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">
                    Processing Excel file... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Excel File
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Upload Results</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Total Processed:</strong> {uploadResult.totalProcessed}</p>
                  <p><strong>New Records:</strong> {uploadResult.created}</p>
                  <p><strong>Updated Records:</strong> {uploadResult.updated}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Errors:</strong> {uploadResult.errors}</p>
                  <p><strong>Skipped:</strong> {uploadResult.skipped}</p>
                </div>
              </div>

              {uploadResult.errorMessages && uploadResult.errorMessages.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-600 mb-2">Errors:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {uploadResult.errorMessages.map((error: string, index: number) => (
                      <li key={index} className="ml-4">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}