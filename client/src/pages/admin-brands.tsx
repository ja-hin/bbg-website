import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Brand, DeviceModel, InsertBrand, InsertDeviceModel } from '@shared/schema';

interface BrandWithModels extends Brand {
  models: DeviceModel[];
}

function AdminBrandsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingBrand, setEditingBrand] = useState<number | null>(null);
  const [editingModel, setEditingModel] = useState<number | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '', device_type: '' });
  const [newModel, setNewModel] = useState({ name: '', brand_id: 0 });
  const [editBrandData, setEditBrandData] = useState({ name: '', device_type: '' });
  const [editModelData, setEditModelData] = useState({ name: '' });

  // Fetch brands with their models
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['/api/brands-with-models'],
    queryFn: () => apiRequest('/api/brands-with-models')
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (brand: InsertBrand) => apiRequest('/api/brands', {
      method: 'POST',
      body: JSON.stringify(brand)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands-with-models'] });
      setNewBrand({ name: '', device_type: '' });
      toast({ title: 'Brand created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create brand', variant: 'destructive' });
    }
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<InsertBrand> }) => 
      apiRequest(`/api/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
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
    mutationFn: (id: number) => apiRequest(`/api/brands/${id}`, {
      method: 'DELETE'
    }),
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
    mutationFn: (model: InsertDeviceModel) => apiRequest('/api/models', {
      method: 'POST',
      body: JSON.stringify(model)
    }),
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
      apiRequest(`/api/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
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
    mutationFn: (id: number) => apiRequest(`/api/models/${id}`, {
      method: 'DELETE'
    }),
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading brands and models...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand & Model Management</h1>
          <p className="text-gray-600 mt-2">Manage device brands and models for customer registration</p>
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