import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '@/hooks/useAuth';
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
import { AdminHeader } from '@/components/admin-header';
import { Plus, Edit2, Trash2, Save, X, Upload, FileText, Download } from 'lucide-react';
import { Brand, DeviceModel, InsertBrand, InsertDeviceModel } from '@shared/schema';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface BrandWithModels extends Brand {
  models: DeviceModel[];
}

function AdminBrandsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin authentication using new hook
  const { isLoading: adminLoading, isAuthenticated } = useRequireAuth();
  
  const [editingBrand, setEditingBrand] = useState<number | null>(null);
  const [editingModel, setEditingModel] = useState<number | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '', device_type: '' });
  const [newModel, setNewModel] = useState({ name: '', brand_id: 0 });
  const [editBrandData, setEditBrandData] = useState({ name: '', device_type: '' });
  const [editModelData, setEditModelData] = useState({ name: '' });
  
  // Bulk upload states
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [uploadResults, setUploadResults] = useState<any>(null);

  // Fetch brands with their models only if authenticated
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['/api/brands-with-models'],
    enabled: isAuthenticated
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (brand: InsertBrand) => apiRequest('/api/brands', { method: 'POST', body: brand }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setNewBrand({ name: '', device_type: '' });
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
      setNewModel({ name: '', brand_id: 0 });
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
    if (!newBrand.name || !newBrand.device_type) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    createBrandMutation.mutate({
      name: newBrand.name,
      device_type: newBrand.device_type,
      is_active: true
    });
  };

  const handleUpdateBrand = (id: number) => {
    updateBrandMutation.mutate({
      id,
      updates: {
        name: editBrandData.name,
        device_type: editBrandData.device_type
      }
    });
  };

  const handleCreateModel = () => {
    if (!newModel.name || !newModel.brand_id) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    createModelMutation.mutate({
      name: newModel.name,
      brand_id: newModel.brand_id,
      is_active: true
    });
  };

  const handleUpdateModel = (id: number) => {
    updateModelMutation.mutate({
      id,
      updates: { name: editModelData.name }
    });
  };

  const startEditBrand = (brand: Brand) => {
    setEditingBrand(brand.id);
    setEditBrandData({
      name: brand.name,
      device_type: brand.device_type
    });
  };

  const startEditModel = (model: DeviceModel) => {
    setEditingModel(model.id);
    setEditModelData({ name: model.name });
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

  const handleBulkUpload = () => {
    if (!csvData.trim()) {
      toast({ title: 'Please enter CSV data', variant: 'destructive' });
      return;
    }

    try {
      const parsedData = parseCsvData(csvData);
      if (parsedData.length === 0) {
        toast({ title: 'No valid data found in CSV', variant: 'destructive' });
        return;
      }
      
      bulkUploadMutation.mutate(parsedData);
    } catch (error) {
      toast({ title: 'Invalid CSV format', variant: 'destructive' });
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = `Device,Brand,Model
mobile,Apple,iPhone 15 Pro
mobile,Samsung,Galaxy S24 Ultra
laptop,Dell,XPS 13
laptop,MacBook,Air M2`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'brands_models_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (adminLoading || !isAuthenticated) {
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
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Loading brands and models...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  {/* Sample CSV Download */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-900">Need a template?</h4>
                      <p className="text-sm text-blue-700">Download sample CSV with correct format</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadSampleCsv}>
                      <Download className="w-4 h-4 mr-2" />
                      Sample CSV
                    </Button>
                  </div>

                  {/* Format Instructions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">CSV Format Instructions</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• <strong>Header:</strong> Device, Brand, Model</p>
                      <p>• <strong>Device:</strong> Either "mobile" or "laptop"</p>
                      <p>• <strong>Brand:</strong> Brand name (e.g., Apple, Samsung)</p>
                      <p>• <strong>Model:</strong> Model name (e.g., iPhone 15 Pro, Galaxy S24)</p>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                      <strong>Example:</strong><br/>
                      Device,Brand,Model<br/>
                      mobile,Apple,iPhone 15 Pro<br/>
                      laptop,Dell,XPS 13
                    </div>
                  </div>

                  {/* CSV Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CSV Data</label>
                    <Textarea
                      placeholder="Paste your CSV data here or type it manually..."
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
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
                      disabled={bulkUploadMutation.isPending || !csvData.trim()}
                      className="flex-1"
                    >
                      {bulkUploadMutation.isPending ? 'Uploading...' : 'Upload Data'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setBulkUploadOpen(false);
                        setCsvData('');
                        setUploadResults(null);
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
                    value={newBrand.device_type}
                    onValueChange={(value) => setNewBrand(prev => ({ ...prev, device_type: value }))}
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
                            value={editBrandData.device_type}
                            onValueChange={(value) => setEditBrandData(prev => ({ ...prev, device_type: value }))}
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
                            <Badge variant={brand.device_type === 'mobile' ? 'default' : 'secondary'}>
                              {brand.device_type}
                            </Badge>
                            <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                              {brand.is_active ? 'Active' : 'Inactive'}
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
                    value={newModel.brand_id.toString()}
                    onValueChange={(value) => setNewModel(prev => ({ ...prev, brand_id: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand: Brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name} ({brand.device_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Model name"
                    value={newModel.name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
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
                      {brand.name} ({brand.device_type})
                    </h4>
                    <div className="space-y-2">
                      {brand.models.map((model: DeviceModel) => (
                        <div key={model.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          {editingModel === model.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editModelData.name}
                                onChange={(e) => setEditModelData({ name: e.target.value })}
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
                                <span>{model.name}</span>
                                <Badge variant={model.is_active ? 'default' : 'secondary'}>
                                  {model.is_active ? 'Active' : 'Inactive'}
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
    </div>
  );
}

export default AdminBrandsPage;