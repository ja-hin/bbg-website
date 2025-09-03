import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  Smartphone,
  Laptop,
  Eye,
  Save,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AdminLayout } from "@/components/admin-layout";
import { apiRequest } from "@/lib/queryClient";

interface Brand {
  id: number;
  name: string;
  deviceType: string;
  isActive: boolean;
}

interface Model {
  id: number;
  name: string;
  brandId: number;
  brandName?: string;
  isActive: boolean;
}

interface BulkUploadResult {
  totalRows: number;
  successfulRows: number;
  errors: string[];
  created?: {
    brands: number;
    models: number;
  };
}

export default function AdminBrandsNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Authentication
  const { isLoading: adminLoading, isAuthenticated } = useRequireAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState("brands");
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Edit state
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isClearingModels, setIsClearingModels] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  
  // Form state
  const [newBrand, setNewBrand] = useState({ name: "", deviceType: "mobile" });
  const [newModel, setNewModel] = useState({ name: "", brandId: "" });
  
  // Excel upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);

  // Fetch brands
  const { data: brands, isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/admin/brands"],
    enabled: !!isAuthenticated,
  });

  // Fetch models
  const { data: models, isLoading: modelsLoading } = useQuery<Model[]>({
    queryKey: ["/api/admin/models"],
    enabled: !!isAuthenticated,
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (brand: { name: string; deviceType: string }) => {
      return apiRequest("/api/admin/brands", {
        method: "POST",
        body: { name: brand.name, device_type: brand.deviceType }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      setIsAddingBrand(false);
      setNewBrand({ name: "", deviceType: "mobile" });
      toast({ title: "Brand created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create brand", variant: "destructive" });
    }
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Brand>) => {
      return apiRequest(`/api/admin/brands/${id}`, {
        method: "PATCH",
        body: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      setEditingBrand(null);
      toast({ title: "Brand updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update brand", variant: "destructive" });
    }
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/brands/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      toast({ title: "Brand deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete brand", variant: "destructive" });
    }
  });

  // Create model mutation
  const createModelMutation = useMutation({
    mutationFn: async (model: { name: string; brandId: number }) => {
      return apiRequest("/api/admin/models", {
        method: "POST",
        body: { modelName: model.name, brandId: model.brandId, deviceType: "mobile" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      setIsAddingModel(false);
      setNewModel({ name: "", brandId: "" });
      toast({ title: "Model created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create model", variant: "destructive" });
    }
  });

  // Update model mutation
  const updateModelMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<any>) => {
      // Convert name to modelName for backend compatibility
      const body = { ...updates };
      if (body.name && !body.modelName) {
        body.modelName = body.name;
      }
      return apiRequest(`/api/admin/models/${id}`, {
        method: "PATCH",
        body
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      setEditingModel(null);
      toast({ title: "Model updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update model", variant: "destructive" });
    }
  });

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/models/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      toast({ title: "Model deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete model", variant: "destructive" });
    }
  });


  // Clear all models mutation
  const clearModelsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/models", {
        method: "DELETE"
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      toast({ title: `All models cleared successfully! Deleted ${data.deletedCount} models` });
      setIsClearingModels(false);
    },
    onError: (error) => {
      toast({ title: "Failed to clear models", variant: "destructive" });
      setIsClearingModels(false);
    }
  });



  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Please select a file to upload', variant: 'destructive' });
      return;
    }

    setIsProcessingFile(true);
    setUploadResults(null);
    
    try {
      const parsedData = await processExcelFile(selectedFile);
      if (parsedData.length === 0) {
        toast({ title: 'No valid data found in file', variant: 'destructive' });
        return;
      }
      
      // Direct API call to upload data
      const response = await fetch('/api/admin/bulk-upload-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            'Device Type,Brand,Model',
            ...parsedData.map(item => `${item.device},${item.brand},${item.model}`)
          ].join('\n')
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResults(result);
        toast({ 
          title: 'Upload successful!', 
          description: `Created ${result.created?.brands || 0} brands and ${result.created?.models || 0} models` 
        });
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessingFile(false);
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

  const downloadSampleExcel = async () => {
    try {
      // Dynamically import XLSX library
      const XLSX = await import('xlsx');
      
      // Create sample Excel data
      const sampleData = [
        ['Device Type', 'Brand', 'Model'],
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
        'Device Type,Brand,Model',
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

  // Add dummy data mutation
  const addDummyDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/add-dummy-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add dummy data');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      
      toast({
        title: "Dummy data added successfully!",
        description: `${result.created?.brands || 0} brands and ${result.created?.models || 0} models created from ${result.totalProcessed} entries.`
      });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to add dummy data", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Filtered and paginated data
  const filteredBrands = brands?.filter(brand => 
    (brandSearch === "" || brand.name.toLowerCase().includes(brandSearch.toLowerCase())) &&
    (deviceTypeFilter === "all" || brand.deviceType === deviceTypeFilter)
  ) || [];

  const modelsWithBrandNames = models?.map(model => ({
    ...model,
    brandName: brands?.find(b => b.id === model.brandId)?.name || 'Unknown'
  })) || [];

  const filteredModels = modelsWithBrandNames.filter(model => 
    (modelSearch === "" || 
     (model.name || "").toLowerCase().includes(modelSearch.toLowerCase()) ||
     model.brandName.toLowerCase().includes(modelSearch.toLowerCase())) &&
    (brandFilter === "all" || model.brandId.toString() === brandFilter)
  );

  const paginatedBrands = filteredBrands.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedModels = filteredModels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand & Model Management</h1>
          <p className="text-gray-600">Manage device brands and models for the BBG system</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "brands", name: "Brands", icon: Smartphone },
                { id: "models", name: "Models", icon: Laptop },
                { id: "bulk", name: "Bulk Upload", icon: Upload }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Brands Tab */}
        {activeTab === "brands" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
                  Brand Management
                </CardTitle>
                <Button onClick={() => setIsAddingBrand(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Device Types</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand Name</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBrands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>
                            {editingBrand?.id === brand.id ? (
                              <Input
                                value={editingBrand.name}
                                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                className="w-full"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{brand.name}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingBrand?.id === brand.id ? (
                              <Select
                                value={editingBrand.deviceType}
                                onValueChange={(value) => setEditingBrand({ ...editingBrand, deviceType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mobile">Mobile</SelectItem>
                                  <SelectItem value="laptop">Laptop</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize">
                                {brand.deviceType}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={brand.isActive ? "default" : "secondary"}>
                              {brand.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {editingBrand?.id === brand.id ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateBrandMutation.mutate(editingBrand)}
                                    disabled={updateBrandMutation.isPending}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingBrand(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingBrand(brand)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => deleteBrandMutation.mutate(brand.id)}
                                    disabled={deleteBrandMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Models Tab */}
        {activeTab === "models" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Laptop className="h-5 w-5 mr-2 text-green-600" />
                  Model Management
                </CardTitle>
                <div className="flex space-x-2">
                  <Button onClick={() => setIsAddingModel(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all models? This action cannot be undone.")) {
                        setIsClearingModels(true);
                        clearModelsMutation.mutate();
                      }
                    }}
                    disabled={clearModelsMutation.isPending || isClearingModels}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {clearModelsMutation.isPending || isClearingModels ? "Clearing..." : "Clear All Models"}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search models or brands..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands?.map(brand => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {modelsLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedModels.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>
                            {editingModel?.id === model.id ? (
                              <Input
                                value={editingModel.name || ""}
                                onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                                className="w-full"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{model.name}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingModel?.id === model.id ? (
                              <Select
                                value={editingModel.brandId.toString()}
                                onValueChange={(value) => setEditingModel({ ...editingModel, brandId: parseInt(value) })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {brands?.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                      {brand.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="text-gray-600">{model.brandName}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={model.isActive ? "default" : "secondary"}>
                              {model.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {editingModel?.id === model.id ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => updateModelMutation.mutate(editingModel)}
                                    disabled={updateModelMutation.isPending}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingModel(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingModel(model)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => deleteModelMutation.mutate(model.id)}
                                    disabled={deleteModelMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bulk Upload Tab */}
        {activeTab === "bulk" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Upload className="h-5 w-5 mr-2 text-purple-600" />
                Excel Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Simple Excel File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <div className="text-center space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Upload Excel File</h3>
                    <p className="text-gray-600 mb-6">
                      Select an Excel file with columns: Device Type, Brand, Model
                    </p>
                    
                    <input 
                      id="file-upload"
                      type="file" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      size="lg"
                      className="mb-4"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Excel File
                    </Button>
                    
                    {selectedFile && (
                      <div className="bg-white p-6 rounded-lg border mt-4">
                        <p className="font-medium text-green-600 mb-2">📄 {selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mb-4">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        
                        <Button 
                          onClick={handleFileUpload}
                          disabled={isProcessingFile}
                          size="lg"
                          className="w-full"
                        >
                          {isProcessingFile ? 'Processing Excel...' : 'Submit & Process Excel'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Display */}
              {uploadResults && (
                <div className="bg-white p-6 rounded-lg border mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Upload Results</h4>
                  <div className="space-y-2">
                    <p className="text-green-600">✅ Successfully processed {uploadResults.results.successfulRows}/{uploadResults.results.totalRows} rows</p>
                    <p className="text-blue-600">📊 Created {uploadResults.results.created?.brands || 0} brands and {uploadResults.results.created?.models || 0} models</p>
                    
                    {uploadResults.results.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-red-600">Errors:</p>
                        <ul className="text-sm text-red-600 space-y-1 mt-2">
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Brand Dialog */}
        <Dialog open={isAddingBrand} onOpenChange={setIsAddingBrand}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select
                  value={newBrand.deviceType}
                  onValueChange={(value) => setNewBrand({ ...newBrand, deviceType: value })}
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingBrand(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createBrandMutation.mutate(newBrand)}
                  disabled={!newBrand.name || createBrandMutation.isPending}
                >
                  Create Brand
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Model Dialog */}
        <Dialog open={isAddingModel} onOpenChange={setIsAddingModel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="Enter model name"
                />
              </div>
              <div>
                <Label htmlFor="brand-select">Brand</Label>
                <Select
                  value={newModel.brandId}
                  onValueChange={(value) => setNewModel({ ...newModel, brandId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map(brand => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name} ({brand.deviceType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingModel(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createModelMutation.mutate({
                    name: newModel.name,
                    brandId: parseInt(newModel.brandId)
                  })}
                  disabled={!newModel.name || !newModel.brandId || createModelMutation.isPending}
                >
                  Create Model
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}