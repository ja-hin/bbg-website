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
  
  // Bulk upload state
  const [bulkData, setBulkData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');

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

  // Bulk upload mutation for text input
  const bulkUploadMutation = useMutation({
    mutationFn: async (data: string) => {
      setUploadStatus('uploading');
      
      const response = await fetch('/api/admin/bulk-upload-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (result: BulkUploadResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/models"] });
      
      const { totalRows, successfulRows, errors, created } = result;
      
      setUploadStatus('completed');
      setIsUploading(false);
      
      toast({
        title: "Bulk upload completed successfully!",
        description: `${successfulRows}/${totalRows} rows processed. ${created?.brands || 0} brands and ${created?.models || 0} models created.${errors.length > 0 ? ` ${errors.length} errors found.` : ''}`
      });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setBulkData('');
        setUploadStatus('idle');
      }, 3000);
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadStatus('error');
      
      toast({ 
        title: "Bulk upload failed", 
        description: error.message,
        variant: "destructive" 
      });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
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

  // Handle bulk data submit
  const handleBulkSubmit = () => {
    if (!bulkData.trim()) return;
    setIsUploading(true);
    bulkUploadMutation.mutate(bulkData.trim());
  };

  // Sample data for reference with comprehensive dummy data
  const getSampleData = () => {
    return `Device Type,Brand,Model
mobile,Apple,iPhone 15
mobile,Apple,iPhone 14
mobile,Apple,iPhone 13
mobile,Samsung,Galaxy S24
mobile,Samsung,Galaxy S23
mobile,Samsung,Galaxy A54
mobile,OnePlus,OnePlus 12
mobile,OnePlus,OnePlus 11
mobile,Xiaomi,Mi 14
mobile,Xiaomi,Redmi Note 13
mobile,Vivo,V30
mobile,Vivo,Y28
mobile,Oppo,Find X7
mobile,Oppo,A78
mobile,Realme,GT 6
mobile,Realme,Narzo 70
mobile,Google,Pixel 8
mobile,Google,Pixel 7a
mobile,Nothing,Phone 2
mobile,Motorola,Edge 50
laptop,Apple,MacBook Air M3
laptop,Apple,MacBook Pro 14
laptop,Dell,XPS 13
laptop,Dell,Inspiron 15
laptop,HP,Pavilion 15
laptop,HP,Spectre x360
laptop,Lenovo,ThinkPad X1
laptop,Lenovo,IdeaPad 3
laptop,Asus,ZenBook 14
laptop,Asus,VivoBook 15
laptop,Acer,Swift 3
laptop,Acer,Aspire 5
laptop,MSI,Modern 14
laptop,MSI,Gaming GF63
laptop,Surface,Laptop 5
laptop,Surface,Pro 9`;
  };

  const insertSampleData = () => {
    setBulkData(getSampleData());
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
     (model.modelName || model.name || "").toLowerCase().includes(modelSearch.toLowerCase()) ||
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
                                value={editingModel.modelName || editingModel.name || ""}
                                onChange={(e) => setEditingModel({ ...editingModel, modelName: e.target.value, name: e.target.value })}
                                className="w-full"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{model.modelName || model.name}</div>
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
                Bulk Upload Brands & Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-2 justify-center">
                <Button onClick={insertSampleData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Insert Sample Data
                </Button>
                <Button 
                  onClick={() => setBulkData('')} 
                  variant="outline" 
                  size="sm"
                  disabled={!bulkData}
                >
                  Clear
                </Button>
                <Button 
                  onClick={() => addDummyDataMutation.mutate()}
                  variant="default" 
                  size="sm"
                  disabled={addDummyDataMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addDummyDataMutation.isPending ? "Adding..." : "Add Dummy Data to DB"}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Data (Device Type, Brand, Model)
                  </label>
                  <textarea
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder="Device Type,Brand,Model&#10;mobile,Apple,iPhone 15&#10;mobile,Samsung,Galaxy S24&#10;laptop,Dell,XPS 13&#10;laptop,HP,Pavilion 15"
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUploading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Enter one row per line. First line should be headers: Device Type,Brand,Model
                    </p>
                    <span className="text-xs text-gray-600">
                      {bulkData ? `${bulkData.split('\n').filter(line => line.trim()).length} rows` : '0 rows'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleBulkSubmit}
                    disabled={!bulkData.trim() || isUploading || bulkUploadMutation.isPending}
                    className="min-w-[140px]"
                  >
                    {isUploading ? "Processing..." : "Upload Data"}
                  </Button>
                </div>
                
                {/* Status Messages */}
                {uploadStatus === 'uploading' && (
                  <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Processing your data...</span>
                  </div>
                )}
                
                {uploadStatus === 'completed' && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Upload completed successfully!</span>
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Upload failed. Please try again.</span>
                  </div>
                )}
              </div>
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