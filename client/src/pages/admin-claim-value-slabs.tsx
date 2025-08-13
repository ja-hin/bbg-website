import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin-layout';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ExcelUpload } from '@/components/excel-upload';

// Dynamic brand detection will be done from the slabs data

interface ClaimValueSlab {
  id: number;
  deviceType: string;
  brand: string | null;
  minMonths: number;
  maxMonths: number;
  percentage: number;
  isActive: boolean;
  registrationSource: string;
}

interface Brand {
  id: number;
  name: string;
  deviceType: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminClaimValueSlabs() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [formData, setFormData] = useState({
    deviceType: 'laptop',
    brand: '__generic__',
    minMonths: 6,
    maxMonths: 12,
    percentage: 50,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all claim value slabs
  const { data: slabs = [], isLoading } = useQuery<ClaimValueSlab[]>({
    queryKey: ['/api/admin/claim-value-slabs'],
    queryFn: () => apiRequest('/api/admin/claim-value-slabs'),
  });

  // Fetch brands from brand master
  const { data: allBrands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    queryFn: () => apiRequest('/api/brands'),
  });

  // Add registration slab columns mutation
  const addRegistrationSlabColumnsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/add-registration-slab-columns', {
      method: 'POST',
    }),
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `Registration slab columns added and ${data.backfilledCustomers} customers backfilled`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add registration slab columns",
        variant: "destructive" 
      });
    },
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (data: { name: string; deviceType: string }) => apiRequest('/api/admin/brands', {
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      toast({ title: "Success", description: "Brand created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create brand",
        variant: "destructive" 
      });
    },
  });

  // Create slab mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/claim-value-slabs', {
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Claim value slab created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create claim value slab",
        variant: "destructive" 
      });
    },
  });

  // Update slab mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/claim-value-slabs/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Claim value slab updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update claim value slab",
        variant: "destructive" 
      });
    },
  });

  // Delete slab mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/claim-value-slabs/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      toast({ title: "Success", description: "Claim value slab deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete claim value slab",
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      deviceType: 'laptop',
      brand: '__generic__',
      minMonths: 6,
      maxMonths: 12,
      percentage: 50,
    });
    setEditingId(null);
    setNewBrandName(''); // Clear new brand name
  };

  const startEdit = (slab: ClaimValueSlab) => {
    setFormData({
      deviceType: slab.deviceType,
      brand: slab.brand || '__generic__',
      minMonths: slab.minMonths,
      maxMonths: slab.maxMonths,
      percentage: slab.percentage,
    });
    setEditingId(slab.id);
    setIsCreateDialogOpen(true);
  };

  const cancelEdit = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.deviceType || formData.minMonths < 0 || formData.maxMonths <= formData.minMonths || formData.percentage <= 0 || formData.percentage > 100) {
      toast({ 
        title: "Validation Error", 
        description: "Please check all fields are valid",
        variant: "destructive" 
      });
      return;
    }

    // Handle new brand creation
    if (formData.brand === '__new_brand__') {
      if (!newBrandName.trim()) {
        toast({ 
          title: "Validation Error", 
          description: "Please enter a brand name",
          variant: "destructive" 
        });
        return;
      }
      
      try {
        // Create the brand first using brand master API
        await createBrandMutation.mutateAsync({
          name: newBrandName.trim(),
          deviceType: formData.deviceType
        });
        
        // Then create the slab with the new brand
        const submitData = {
          deviceType: formData.deviceType,
          brand: newBrandName.trim(),
          minMonths: formData.minMonths,
          maxMonths: formData.maxMonths,
          percentage: formData.percentage,
          isActive: true
        };
        
        if (editingId) {
          updateMutation.mutate({ id: editingId, data: submitData });
        } else {
          createMutation.mutate(submitData);
        }
        setNewBrandName(''); // Reset new brand name
      } catch (error) {
        console.error('Failed to create brand:', error);
        return;
      }
      return;
    }
    
    const submitData = {
      ...formData,
      brand: formData.brand === '__generic__' ? null : (formData.brand.trim() || null),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Get unique brands dynamically from the slabs data
  const getBrandsForDevice = (deviceType: string): string[] => {
    const deviceSlabs = slabs.filter(slab => slab.deviceType === deviceType && slab.brand);
    const uniqueBrands = Array.from(new Set(deviceSlabs.map(slab => slab.brand))).filter((brand): brand is string => Boolean(brand));
    return uniqueBrands.sort(); // Sort alphabetically
  };

  // Get all brands from brand master
  const getAllBrands = (): string[] => {
    return allBrands.map(brand => brand.name).sort();
  };

  // Get brands for specific device type from brand master
  const getBrandsForDeviceFromMaster = (deviceType: string): string[] => {
    return allBrands
      .filter(brand => brand.deviceType === deviceType || brand.deviceType === 'both')
      .map(brand => brand.name)
      .sort();
  };

  // Organize slabs for comparative table display
  const organizeSlatData = (deviceType: string) => {
    const deviceSlabs = slabs.filter(slab => slab.deviceType === deviceType);
    const brands = getBrandsForDevice(deviceType);
    
    // Define age ranges
    const ageRanges = [
      { label: "6-12 Months", min: 6, max: 12 },
      { label: "13-18 Months", min: 13, max: 18 },
      { label: "19-24 Months", min: 19, max: 24 },
      { label: "25-30 Months", min: 25, max: 30 },
      { label: "31-36 Months", min: 31, max: 36 },
      { label: "37-48 Months", min: 37, max: 48 },
      { label: "49-60 Months", min: 49, max: 60 },
      { label: "60-120 Months", min: 60, max: 120 },
    ];

    return ageRanges.map(range => {
      const ageData: any = { 
        range: range.label, 
        minMonths: range.min, 
        maxMonths: range.max,
        brands: {}
      };

      // Find brand-specific slabs for this range
      brands.forEach(brand => {
        const slabs = deviceSlabs.filter(s => 
          s.brand === brand && 
          s.minMonths === range.min && 
          s.maxMonths === range.max
        );
        
        if (slabs.length === 1) {
          ageData.brands[brand] = slabs[0];
        } else if (slabs.length > 1) {
          // Multiple slabs for same brand/range - group by registration source
          const regular = slabs.find(s => s.registrationSource === 'regular');
          const acerBbg = slabs.find(s => s.registrationSource === 'acer_bbg');
          ageData.brands[brand] = {
            regular: regular || null,
            acerBbg: acerBbg || null,
            multiple: true
          };
        } else {
          ageData.brands[brand] = null;
        }
      });

      // Find generic slab for this range
      const genericSlab = deviceSlabs.find(s => 
        !s.brand && 
        s.minMonths === range.min && 
        s.maxMonths === range.max
      );
      ageData.genericSlab = genericSlab || null;

      return ageData;
    }).filter(ageData => {
      // Only include age ranges that have at least one slab (brand-specific or generic)
      const hasBrandSlabs = Object.values(ageData.brands).some(slab => slab !== null);
      const hasGenericSlab = ageData.genericSlab !== null;
      return hasBrandSlabs || hasGenericSlab;
    });
  };

  const laptopData = organizeSlatData('laptop');
  const mobileData = organizeSlatData('mobile');
  const laptopBrands = getBrandsForDeviceFromMaster('laptop');
  const mobileBrands = getBrandsForDeviceFromMaster('mobile');
  
  // Organize slabs by category for simpler display
  console.log('Raw slabs data:', slabs?.length || 0, 'items');
  console.log('Raw slabs sample:', slabs?.[0]);
  
  const regularLaptopSlabs = Array.isArray(slabs) ? slabs.filter(s => s.deviceType === 'laptop' && s.registrationSource === 'regular') : [];
  const regularMobileSlabs = Array.isArray(slabs) ? slabs.filter(s => s.deviceType === 'mobile' && s.registrationSource === 'regular') : [];
  const acerBbgSlabs = Array.isArray(slabs) ? slabs.filter(s => s.registrationSource === 'acer_bbg') : [];
  
  console.log('Admin Panel - Simplified Categories:');
  console.log('Regular Laptop Slabs:', regularLaptopSlabs.length);
  console.log('Regular Mobile Slabs:', regularMobileSlabs.length);
  console.log('Acer BBG Slabs:', acerBbgSlabs.length);
  console.log('Loading state:', isLoading);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claim Value Slabs</h1>
            <p className="text-gray-600 mt-2">
              Manage brand-specific claim value percentages based on device age
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => addRegistrationSlabColumnsMutation.mutate()}
              disabled={addRegistrationSlabColumnsMutation.isPending}
              variant="outline"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              {addRegistrationSlabColumnsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Schema...
                </>
              ) : (
                <>
                  🔧 Add Slab Columns
                </>
              )}
            </Button>
            
            <ExcelUpload onUploadComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
            }} />
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Slab
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Claim Value Slab" : "Create New Claim Value Slab"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select value={formData.deviceType} onValueChange={(value) => setFormData({ ...formData, deviceType: value, brand: '__generic__' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    {formData.brand === "__new_brand__" ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter new brand name"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <Button 
                            type="button" 
                            size="sm"
                            onClick={() => {
                              if (newBrandName.trim()) {
                                setFormData({ ...formData, brand: newBrandName.trim() });
                                setNewBrandName('');
                              }
                            }}
                          >
                            Use Brand
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setFormData({ ...formData, brand: '__generic__' });
                              setNewBrandName('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand (optional for generic)" />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__generic__">Generic (No Brand)</SelectItem>
                        
                        {/* Show device-specific brands first */}
                        {(formData.deviceType === 'laptop' ? laptopBrands : mobileBrands).length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-sm font-medium text-gray-500">
                              {formData.deviceType === 'laptop' ? 'Laptop' : 'Mobile'} Brands
                            </div>
                            {(formData.deviceType === 'laptop' ? laptopBrands : mobileBrands).map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        
                        {/* Show other brands from different device types */}
                        {getAllBrands().filter(brand => 
                          !(formData.deviceType === 'laptop' ? laptopBrands : mobileBrands).includes(brand)
                        ).length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-sm font-medium text-gray-500">
                              Other Brands
                            </div>
                            {getAllBrands().filter(brand => 
                              !(formData.deviceType === 'laptop' ? laptopBrands : mobileBrands).includes(brand)
                            ).map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        
                        {/* Option to add new brand */}
                        <SelectItem value="__new_brand__">+ Add New Brand</SelectItem>
                      </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minMonths">Min Months</Label>
                      <Input
                        id="minMonths"
                        type="number"
                        value={formData.minMonths}
                        onChange={(e) => setFormData({ ...formData, minMonths: parseInt(e.target.value) })}
                        min={1}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxMonths">Max Months</Label>
                      <Input
                        id="maxMonths"
                        type="number"
                        value={formData.maxMonths}
                        onChange={(e) => setFormData({ ...formData, maxMonths: parseInt(e.target.value) })}
                        min={1}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="percentage">Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
                      min={0}
                      max={100}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="laptop" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="laptop">Laptop Slabs</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Slabs</TabsTrigger>
            <TabsTrigger value="acer-bbg">Acer BBG Slabs</TabsTrigger>
          </TabsList>

          <TabsContent value="laptop">
            <Card>
              <CardHeader>
                <CardTitle>Regular Laptop Claim Value Slabs</CardTitle>
                <p className="text-sm text-gray-600">
                  Regular laptop claim percentages (includes regular Acer rates)
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Age Range</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularLaptopSlabs.map((slab) => (
                          <TableRow key={slab.id}>
                            <TableCell className="font-medium">
                              {slab.brand || 'Generic'}
                            </TableCell>
                            <TableCell>
                              {slab.minMonths}-{slab.maxMonths} months
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-blue-600">
                                {slab.percentage}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEdit(slab)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(slab.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>

          <TabsContent value="mobile">
            <Card>
              <CardHeader>
                <CardTitle>Regular Mobile Claim Value Slabs</CardTitle>
                <p className="text-sm text-gray-600">
                  Regular mobile claim percentages
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Age Range</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularMobileSlabs.map((slab) => (
                          <TableRow key={slab.id}>
                            <TableCell className="font-medium">
                              {slab.brand || 'Generic'}
                            </TableCell>
                            <TableCell>
                              {slab.minMonths}-{slab.maxMonths} months
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">
                                {slab.percentage}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEdit(slab)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(slab.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>

          <TabsContent value="acer-bbg">
            <Card>
              <CardHeader>
                <CardTitle>Acer BBG Special Rates</CardTitle>
                <p className="text-sm text-gray-600">
                  Higher claim percentages exclusively for Acer BBG customers (68%-80% range)
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Age Range</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {acerBbgSlabs.map((slab) => (
                          <TableRow key={slab.id}>
                            <TableCell className="font-medium">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                                {slab.brand || 'Generic'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {slab.minMonths}-{slab.maxMonths} months
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-purple-600">
                                {slab.percentage}%
                              </span>
                              <span className="text-xs text-purple-500 ml-1">(Acer BBG)</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEdit(slab)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(slab.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}