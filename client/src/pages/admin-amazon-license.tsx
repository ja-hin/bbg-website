import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, Download, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAmazonLicense() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Amazon license data with force refresh
  const { data: licenseData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/amazon-license'],
    select: (response: any) => response.data || [],
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/amazon-license/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `${data.successfulRows} license codes uploaded successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/amazon-license'] });
      setFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const downloadSampleFile = () => {
    const sampleData = [
      { "License Code": "AMZN-BBG-2024-001", "Device Type": "mobile" },
      { "License Code": "AMZN-BBG-2024-002", "Device Type": "laptop" },
      { "License Code": "AMZN-BBG-2024-003", "Device Type": "mobile" }
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,"
      + "License Code,Device Type\n"
      + sampleData.map(row => `${row["License Code"]},${row["Device Type"]}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "amazon_license_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Amazon License Code Management</h1>
            <p className="text-gray-600">Upload and manage Amazon BBG license codes for customer registration</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/admin/amazon-license'] });
                refetch();
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
              data-testid="button-refresh"
            >
              <Database className="h-4 w-4" />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button 
              onClick={downloadSampleFile}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-download-sample"
            >
              <Download className="h-4 w-4" />
              Download Sample
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload License Codes
              </CardTitle>
              <CardDescription>
                Upload CSV/Excel files with format: License Code, Device Type (mobile/laptop)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500">
                    Supports CSV and Excel files
                  </p>
                  <p className="text-xs text-gray-400">
                    Required format: License Code, Device Type
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </label>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFile(null)}
                        data-testid="button-remove-file"
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending}
                        size="sm"
                        data-testid="button-upload"
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Uploaded License Codes</span>
                <Badge variant="outline">
                  {licenseData?.length || 0} total codes
                </Badge>
              </CardTitle>
              <CardDescription>
                All Amazon BBG license codes in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading license codes...</div>
                </div>
              ) : !licenseData || licenseData.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No license codes uploaded yet</p>
                    <p className="text-sm">Upload a file to get started</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                      <TableRow>
                        <TableHead className="w-[80px]">#</TableHead>
                        <TableHead>License Code</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Uploaded At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licenseData.map((item: any, index: number) => (
                        <TableRow key={item.license_code}>
                          <TableCell className="font-mono text-xs text-gray-500">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            {item.license_code}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.device_type === 'mobile' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {item.device_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.is_used ? (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                <XCircle className="h-3 w-3" />
                                Used
                              </Badge>
                            ) : (
                              <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Available
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {item.used_by_customer_id ? (
                              <span>Customer #{item.used_by_customer_id}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(item.uploaded_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
