import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AdminLayout } from '@/components/admin-layout';
import { Plus, Edit2, Trash2, Save, X, Upload, FileText, Download } from 'lucide-react';
import { Brand, DeviceModel, InsertBrand, InsertDeviceModel } from '@shared/schema';

interface BrandWithModels extends Brand {
  models: DeviceModel[];
}

function AdminBrandsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingBrand, setEditingBrand] = useState<number | null>(null);
  const [editingModel, setEditingModel] = useState<number | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '', deviceType: '' });
  const [newModel, setNewModel] = useState({ modelName: '', brandId: 0 });
  const [editBrandData, setEditBrandData] = useState({ name: '', deviceType: '' });
  const [editModelData, setEditModelData] = useState({ modelName: '' });
  
  // Bulk upload states
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Fetch brands with their models
  const { data: brands = [], isLoading } = useQuery<BrandWithModels[]>({
    queryKey: ['/api/brands-with-models']
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (brand: InsertBrand) => apiRequest('/api/brands', { method: 'POST', body: brand }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setNewBrand({ name: '', deviceType: '' });
      toast({ title: 'Brand created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create brand', variant: 'destructive' });
    }
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: (data: Array<{ device: string; brand: string; model: string }>) => 
      apiRequest('/api/admin/brands/bulk-upload', { method: 'POST', body: { data } }),
    onSuccess: (results: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setUploadResults(results);
      setCsvData('');
      toast({ 
        title: 'Bulk upload completed', 
        description: `${results.results.successfulRows}/${results.results.totalRows} rows processed successfully`
      });
    },
    onError: (error: any) => {
      toast({ title: 'Bulk upload failed', description: error.message, variant: 'destructive' });
    }
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<InsertBrand> }) => 
      apiRequest(`/api/brands/${id}`, { method: 'PUT', body: updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setEditingBrand(null);
      toast({ title: 'Brand updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update brand', variant: 'destructive' });
    }
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/brands/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      toast({ title: 'Brand deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete brand', variant: 'destructive' });
    }
  });

  // Create model mutation
  const createModelMutation = useMutation({
    mutationFn: (model: InsertDeviceModel) => apiRequest('/api/models', { method: 'POST', body: model }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setNewModel({ modelName: '', brandId: 0 });
      toast({ title: 'Model created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create model', variant: 'destructive' });
    }
  });

  // Update model mutation
  const updateModelMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<InsertDeviceModel> }) => 
      apiRequest(`/api/models/${id}`, { method: 'PUT', body: updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setEditingModel(null);
      toast({ title: 'Model updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update model', variant: 'destructive' });
    }
  });

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/models/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      toast({ title: 'Model deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete model', variant: 'destructive' });
    }
  });

  const handleCreateBrand = () => {
    if (!newBrand.name || !newBrand.deviceType) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    createBrandMutation.mutate({
      name: newBrand.name,
      deviceType: newBrand.deviceType
    });
  };

  const handleUpdateBrand = (id: number) => {
    updateBrandMutation.mutate({
      id,
      updates: {
        name: editBrandData.name,
        deviceType: editBrandData.deviceType
      }
    });
  };

  const handleCreateModel = () => {
    if (!newModel.modelName || !newModel.brandId) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    createModelMutation.mutate({
      modelName: newModel.modelName,
      brandId: newModel.brandId
    });
  };

  const handleUpdateModel = (id: number) => {
    updateModelMutation.mutate({
      id,
      updates: { modelName: editModelData.modelName }
    });
  };

  const startEditBrand = (brand: BrandWithModels) => {
    setEditingBrand(brand.id);
    setEditBrandData({
      name: brand.name,
      deviceType: brand.deviceType
    });
  };

  const startEditModel = (model: DeviceModel) => {
    setEditingModel(model.id);
    setEditModelData({ modelName: model.modelName });
  };

  // CSV parsing and bulk upload functions
  const parseCsvData = (csvText: string): Array<{ device: string; brand: string; model: string }> => {
    const lines = csvText.trim().split('\n');
    const data: Array<{ device: string; brand: string; model: string }> = [];
    
    // Skip header row if it exists
    const startIndex = lines[0]?.toLowerCase().includes('device') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      if (columns.length >= 3) {
        data.push({
          device: columns[0],
          brand: columns[1], 
          model: columns[2]
        });
      }
    }
    
    return data;
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Please select a file to upload', variant: 'destructive' });
      return;
    }

    setIsProcessingFile(true);
    try {
      const parsedData = await processExcelFile(selectedFile);
      if (parsedData.length === 0) {
        toast({ title: 'No valid data found in file', variant: 'destructive' });
        return;
      }
      bulkUploadMutation.mutate(parsedData);
    } catch (error: any) {
      toast({ title: 'File processing failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const downloadSampleExcel = async () => {
    try {
      // Dynamically import XLSX library
      const XLSX = await import('xlsx');
      
      // Create sample Excel data
      const sampleData = [
        ['Device', 'Brand', 'Model'],
        ['mobile', 'Apple', 'iPhone 15 Pro'],
        ['mobile', 'Samsung', 'Galaxy S24 Ultra'],
        ['laptop', 'Dell', 'XPS 13'],
        ['laptop', 'MacBook', 'Air M2']
      ];
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
      
      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands & Models');
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, 'brands_models_sample.xlsx');
      
      toast({ title: 'Sample file downloaded successfully' });
    } catch (error) {
      // Fallback to CSV if Excel generation fails
      const csvContent = [
        'Device,Brand,Model',
        'mobile,Apple,iPhone 15 Pro',
        'mobile,Samsung,Galaxy S24 Ultra',
        'laptop,Dell,XPS 13',
        'laptop,MacBook,Air M2'
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'brands_models_sample.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: 'Sample CSV file downloaded (Excel not available)' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCsvData(''); // Clear manual input when file is selected
    }
  };

  const processExcelFile = async (file: File): Promise<Array<{ device: string; brand: string; model: string }>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          // For Excel files, we'll use a library to parse
          // For CSV files, we'll parse manually
          const fileName = file.name.toLowerCase();
          
          if (fileName.endsWith('.csv')) {
            const text = data as string;
            const parsedData = parseCsvData(text);
            resolve(parsedData);
          } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // Import XLSX library dynamically
            import('xlsx').then((XLSX) => {
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              const processedData: Array<{ device: string; brand: string; model: string }> = [];
              
              // Skip header row if it exists
              const startIndex = jsonData[0] && Array.isArray(jsonData[0]) && 
                               (jsonData[0] as any[])[0]?.toString().toLowerCase().includes('device') ? 1 : 0;
              
              for (let i = startIndex; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                if (row && row.length >= 3 && row[0] && row[1] && row[2]) {
                  processedData.push({
                    device: row[0].toString().trim(),
                    brand: row[1].toString().trim(),
                    model: row[2].toString().trim()
                  });
                }
              }
              
              resolve(processedData);
            }).catch(reject);
          } else {
            reject(new Error('Unsupported file format. Please use .xlsx, .xls, or .csv files.'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center">Loading brands and models...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand & Model Management</h1>
              <p className="text-gray-600 mt-2">Manage device brands and models for customer registration</p>
            </div>
            
            {/* Bulk Upload Button */}
            <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Brands & Models</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Sample File Download */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-900">Need a template?</h4>
                      <p className="text-sm text-blue-700">Download sample file with correct format</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadSampleExcel}>
                      <Download className="w-4 h-4 mr-2" />
                      Sample File
                    </Button>
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="space-y-3">
                          <FileText className="w-12 h-12 text-green-600 mx-auto" />
                          <p className="text-lg font-medium text-green-600">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-lg text-gray-600">
                            Upload Excel or CSV file
                          </p>
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-8 py-2"
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Results */}
                  {uploadResults && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Upload Results:</p>
                          <p>✅ {uploadResults.results.successfulRows}/{uploadResults.results.totalRows} rows processed successfully</p>
                          {uploadResults.results.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium text-red-600">Errors:</p>
                              <ul className="text-sm text-red-600 space-y-1">
                                {uploadResults.results.errors.slice(0, 5).map((error: string, index: number) => (
                                  <li key={index}>• {error}</li>
                                ))}
                                {uploadResults.results.errors.length > 5 && (
                                  <li>• ... and {uploadResults.results.errors.length - 5} more errors</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Upload Button */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleBulkUpload}
                      disabled={bulkUploadMutation.isPending || isProcessingFile || !selectedFile}
                      className="flex-1"
                      size="lg"
                    >
                      {isProcessingFile ? 'Processing File...' : 
                       bulkUploadMutation.isPending ? 'Uploading...' : 
                       'Process File'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setBulkUploadOpen(false);
                        setCsvData('');
                        setSelectedFile(null);
                        setUploadResults(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brands Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Brands
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Brand */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900">Add New Brand</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Brand name"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Select
                    value={newBrand.deviceType}
                    onValueChange={(value) => setNewBrand(prev => ({ ...prev, deviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateBrand}
                  disabled={createBrandMutation.isPending}
                  className="w-full"
                >
                  {createBrandMutation.isPending ? 'Creating...' : 'Add Brand'}
                </Button>
              </div>

              {/* Existing Brands */}
              <div className="space-y-3">
                {brands.map((brand: BrandWithModels) => (
                  <div key={brand.id} className="p-4 border rounded-lg">
                    {editingBrand === brand.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            value={editBrandData.name}
                            onChange={(e) => setEditBrandData(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <Select
                            value={editBrandData.deviceType}
                            onValueChange={(value) => setEditBrandData(prev => ({ ...prev, deviceType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile">Mobile</SelectItem>
                              <SelectItem value="laptop">Laptop</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateBrand(brand.id)}
                            disabled={updateBrandMutation.isPending}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingBrand(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{brand.name}</span>
                            <Badge variant={brand.deviceType === 'mobile' ? 'default' : 'secondary'}>
                              {brand.deviceType}
                            </Badge>
                            <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                              {brand.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{brand.models.length} models</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEditBrand(brand)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteBrandMutation.mutate(brand.id)}
                            disabled={deleteBrandMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Models Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Model */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900">Add New Model</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    value={newModel.brandId.toString()}
                    onValueChange={(value) => setNewModel(prev => ({ ...prev, brandId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand: BrandWithModels) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name} ({brand.deviceType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Model name"
                    value={newModel.modelName}
                    onChange={(e) => setNewModel(prev => ({ ...prev, modelName: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleCreateModel}
                  disabled={createModelMutation.isPending}
                  className="w-full"
                >
                  {createModelMutation.isPending ? 'Creating...' : 'Add Model'}
                </Button>
              </div>

              {/* Existing Models by Brand */}
              <div className="space-y-4">
                {brands.map((brand: BrandWithModels) => (
                  <div key={brand.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {brand.name} ({brand.deviceType})
                    </h4>
                    <div className="space-y-2">
                      {brand.models.map((model: DeviceModel) => (
                        <div key={model.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          {editingModel === model.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editModelData.modelName}
                                onChange={(e) => setEditModelData({ modelName: e.target.value })}
                                className="flex-1"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateModel(model.id)}
                                disabled={updateModelMutation.isPending}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setEditingModel(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span>{model.modelName}</span>
                                <Badge variant={model.isActive ? 'default' : 'secondary'}>
                                  {model.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => startEditModel(model)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => deleteModelMutation.mutate(model.id)}
                                  disabled={deleteModelMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {brand.models.length === 0 && (
                        <p className="text-sm text-gray-500">No models added yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBrandsPage;