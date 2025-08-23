import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, Download, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAcerImei() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Acer IMEI data with force refresh
  const { data: imeiData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/acer-imei'],
    select: (response: any) => response.data || [],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache the response
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/acer-imei/upload', {
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
        description: `${data.successfulRows} IMEI records uploaded successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/acer-imei'] });
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
    // Create sample CSV file content with new format: Serial Number, Invoice Date
    const sampleData = [
      { "Serial Number": "123456789012345", "Invoice Date": "2024-01-15" },
      { "Serial Number": "678901234567890", "Invoice Date": "2024-02-20" },
      { "Serial Number": "456789012345678", "Invoice Date": "2024-03-10" }
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Serial Number,Invoice Date\n"
      + sampleData.map(row => `${row["Serial Number"]},${row["Invoice Date"]}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "acer_imei_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Acer IMEI Management</h1>
            <p className="text-gray-600">Upload and manage Acer device IMEI/Serial numbers for validation</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/admin/acer-imei'] });
                refetch();
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button 
              onClick={downloadSampleFile}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
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
                Upload IMEI Data
              </CardTitle>
              <CardDescription>
                Upload CSV files with format: Serial Number, Invoice Date
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
                    Required format: Serial Number, Invoice Date
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
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
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending}
                        size="sm"
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* IMEI Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Uploaded IMEI Records
                {imeiData && (
                  <Badge variant="secondary" className="ml-2">
                    {imeiData.length} records
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                List of all uploaded Acer IMEI/Serial numbers available for validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : imeiData && imeiData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>IMEI/Serial Number</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imeiData.slice(0, 50).map((record: any, index: number) => (
                        <TableRow key={record.id || index}>
                          <TableCell className="font-mono text-sm">
                            {record.row_num || index + 1}
                          </TableCell>
                          <TableCell className="font-mono">
                            {record.imei}
                          </TableCell>
                          <TableCell>{record.model}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.brand}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(record.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {imeiData.length > 50 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Showing first 50 records of {imeiData.length} total records
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No IMEI data uploaded yet</p>
                  <p className="text-sm">Upload an Excel or CSV file to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}