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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Bulk upload mutation with enhanced progress reporting
  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/bulk-upload-brands', {
        method: 'POST',
        body: formData,
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
      setUploadFile(null);
      setIsUploading(false);
      
      const { totalRows, successfulRows, errors, created } = result;
      
      toast({
        title: "Bulk upload completed",
        description: `${successfulRows}/${totalRows} rows processed successfully. ${created?.brands || 0} brands and ${created?.models || 0} models created. ${errors.length} errors.`
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({ 
        title: "Bulk upload failed", 
        description: error.message,
        variant: "destructive" 
      });
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

  // Handle file upload
  const handleFileUpload = () => {
    if (!uploadFile) return;
    setIsUploading(true);
    bulkUploadMutation.mutate(uploadFile);
  };

  // Download sample file
  const downloadSample = () => {
    const csvContent = "Device Type,Brand,Model\nmobile,Apple,iPhone 15\nlaptop,Dell,XPS 13";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brands_models_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
              <div className="text-center">
                <Button onClick={downloadSample} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample CSV
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Download the sample file to see the correct format
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Choose File
                    </label>
                    <p className="text-sm text-gray-500">
                      Supports CSV, Excel (.xlsx, .xls) files
                    </p>
                  </div>
                </div>
              </div>

              {uploadFile && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Selected file: {uploadFile.name}</p>
                      <p className="text-sm text-gray-500">Size: {(uploadFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="space-x-2">
                      <Button
                        onClick={() => setUploadFile(null)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={handleFileUpload}
                        disabled={isUploading || bulkUploadMutation.isPending}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
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