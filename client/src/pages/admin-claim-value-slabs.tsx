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
import { Plus, Edit, Trash2, X, Save, Loader2, Grid3X3, List, Eye, Filter } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedPercentageFilter, setSelectedPercentageFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    deviceType: 'laptop',
    brand: '__generic__',
    minMonths: 6,
    maxMonths: 12,
    percentage: 50,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all claim value slabs with proper error handling
  const { data: slabs = [], isLoading, error, refetch } = useQuery<ClaimValueSlab[]>({
    queryKey: ['/api/admin/claim-value-slabs'],
    queryFn: () => apiRequest('/api/admin/claim-value-slabs'),
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Auto-refetch if we get 401 error
  useEffect(() => {
    if (error?.message?.includes('401')) {
      setTimeout(() => refetch(), 1000);
    }
  }, [error, refetch]);

  // Fetch brands from brand master
  const { data: allBrands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    queryFn: () => apiRequest('/api/brands'),
  });

  // Create Acer BBG slabs mutation
  const createAcerBbgSlabsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/create-acer-bbg-slabs', {
      method: 'POST',
    }),
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `${data.created} Acer BBG slabs created successfully!`
      });
      // Force hard refresh of slabs data
      queryClient.removeQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      // Force refetch immediately
      setTimeout(() => refetch(), 500);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create Acer BBG slabs",
        variant: "destructive" 
      });
    }
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
  if (slabs && slabs.length > 0) {
    console.log('First slab sample:', slabs[0]);
    console.log('Registration sources found:', [...new Set(slabs.map(s => s.registrationSource))]);
  }
  
  const regularLaptopSlabs = Array.isArray(slabs) ? slabs.filter(s => 
    s.deviceType === 'laptop' && 
    (s.registrationSource === 'regular' || s.registrationSource === null || s.registrationSource === undefined)
  ) : [];
  const regularMobileSlabs = Array.isArray(slabs) ? slabs.filter(s => 
    s.deviceType === 'mobile' && 
    (s.registrationSource === 'regular' || s.registrationSource === null || s.registrationSource === undefined)
  ) : [];
  const acerBbgSlabs = Array.isArray(slabs) ? slabs.filter(s => s.registrationSource === 'acer_bbg') : [];
  
  console.log('After filtering:');
  console.log('Regular Laptop Slabs:', regularLaptopSlabs.length);
  console.log('Regular Mobile Slabs:', regularMobileSlabs.length);
  console.log('Acer BBG Slabs:', acerBbgSlabs.length);

  // Helper functions for filtering and grid display
  const getUniqueSlabBrands = (slabList: ClaimValueSlab[]) => {
    const brands = new Set(slabList.map(slab => slab.brand || 'Generic').filter(Boolean));
    return Array.from(brands).sort();
  };

  const getUniqueSlabPercentages = (slabList: ClaimValueSlab[]) => {
    const percentages = new Set(slabList.map(slab => slab.percentage));
    return Array.from(percentages).sort((a, b) => b - a);
  };

  const filterSlabs = (slabList: ClaimValueSlab[], brandFilter: string, percentageFilter: string) => {
    return slabList.filter(slab => {
      const brandMatch = brandFilter === 'all' || 
        (brandFilter === 'generic' && !slab.brand) ||
        (slab.brand && slab.brand === brandFilter);
      
      const percentageMatch = percentageFilter === 'all' || 
        slab.percentage.toString() === percentageFilter;
      
      return brandMatch && percentageMatch;
    });
  };

  // Grid component for displaying slabs
  const SlabGridCard = ({ slab, onEdit, onDelete }: { 
    slab: ClaimValueSlab; 
    onEdit: (slab: ClaimValueSlab) => void; 
    onDelete: (id: number) => void; 
  }) => (
    <Card key={slab.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900">
                {slab.brand || 'Generic'}
              </h3>
              {slab.registrationSource === 'acer_bbg' && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Acer BBG
                </span>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium">Age Range:</span>
                <span>{slab.minMonths}-{slab.maxMonths} months</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Device:</span>
                <span className="capitalize">{slab.deviceType}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {slab.percentage}%
            </div>
            <div className="text-xs text-gray-500">
              Claim Rate
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="text-xs text-gray-500">
            ID: {slab.id}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(slab)}
              className="h-8 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(slab.id)}
              className="h-8 px-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Filter and view controls component
  const ViewControls = ({ 
    slabList, 
    brandFilter, 
    setBrandFilter, 
    percentageFilter, 
    setPercentageFilter,
    title 
  }: {
    slabList: ClaimValueSlab[];
    brandFilter: string;
    setBrandFilter: (filter: string) => void;
    percentageFilter: string;
    setPercentageFilter: (filter: string) => void;
    title: string;
  }) => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8"
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {filterSlabs(slabList, brandFilter, percentageFilter).length} of {slabList.length}
        </div>
      </div>
      
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="generic">Generic Only</SelectItem>
              {getUniqueSlabBrands(slabList).map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={percentageFilter} onValueChange={setPercentageFilter}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue placeholder="%" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All %</SelectItem>
              {getUniqueSlabPercentages(slabList).map((percentage) => (
                <SelectItem key={percentage} value={percentage.toString()}>
                  {percentage}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

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
            
            <Button
              onClick={() => createAcerBbgSlabsMutation.mutate()}
              disabled={createAcerBbgSlabsMutation.isPending}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              {createAcerBbgSlabsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating BBG Slabs...
                </>
              ) : (
                <>
                  🚀 Create Acer BBG Slabs
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

          <TabsContent value="laptop" className="space-y-6">
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
                  <div className="space-y-6">
                    <ViewControls 
                      slabList={regularLaptopSlabs}
                      brandFilter={selectedBrandFilter}
                      setBrandFilter={setSelectedBrandFilter}
                      percentageFilter={selectedPercentageFilter}
                      setPercentageFilter={setSelectedPercentageFilter}
                      title="Laptop Slabs"
                    />
                    
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filterSlabs(regularLaptopSlabs, selectedBrandFilter, selectedPercentageFilter).map((slab) => (
                          <SlabGridCard
                            key={slab.id}
                            slab={slab}
                            onEdit={startEdit}
                            onDelete={(id) => deleteMutation.mutate(id)}
                          />
                        ))}
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
                            {filterSlabs(regularLaptopSlabs, selectedBrandFilter, selectedPercentageFilter).map((slab) => (
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
                    
                    {filterSlabs(regularLaptopSlabs, selectedBrandFilter, selectedPercentageFilter).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No slabs match the current filters</p>
                        <p className="text-sm">Try adjusting your filter criteria</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
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
                  <div className="space-y-6">
                    <ViewControls 
                      slabList={regularMobileSlabs}
                      brandFilter={selectedBrandFilter}
                      setBrandFilter={setSelectedBrandFilter}
                      percentageFilter={selectedPercentageFilter}
                      setPercentageFilter={setSelectedPercentageFilter}
                      title="Mobile Slabs"
                    />
                    
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filterSlabs(regularMobileSlabs, selectedBrandFilter, selectedPercentageFilter).map((slab) => (
                          <SlabGridCard
                            key={slab.id}
                            slab={slab}
                            onEdit={startEdit}
                            onDelete={(id) => deleteMutation.mutate(id)}
                          />
                        ))}
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
                              {filterSlabs(regularMobileSlabs, selectedBrandFilter, selectedPercentageFilter).map((slab) => (
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
                      
                      {filterSlabs(regularMobileSlabs, selectedBrandFilter, selectedPercentageFilter).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No slabs match the current filters</p>
                          <p className="text-sm">Try adjusting your filter criteria</p>
                        </div>
                      )}
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acer-bbg" className="space-y-6">
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
                  <div className="space-y-6">
                    <ViewControls 
                      slabList={acerBbgSlabs}
                      brandFilter={selectedBrandFilter}
                      setBrandFilter={setSelectedBrandFilter}
                      percentageFilter={selectedPercentageFilter}
                      setPercentageFilter={setSelectedPercentageFilter}
                      title="Acer BBG Slabs"
                    />
                    
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filterSlabs(acerBbgSlabs, selectedBrandFilter, selectedPercentageFilter).map((slab) => (
                          <SlabGridCard
                            key={slab.id}
                            slab={slab}
                            onEdit={startEdit}
                            onDelete={(id) => deleteMutation.mutate(id)}
                          />
                        ))}
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
                            {filterSlabs(acerBbgSlabs, selectedBrandFilter, selectedPercentageFilter).map((slab) => (
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
                    
                    {filterSlabs(acerBbgSlabs, selectedBrandFilter, selectedPercentageFilter).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No slabs match the current filters</p>
                        <p className="text-sm">Try adjusting your filter criteria</p>
                      </div>
                    )}
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