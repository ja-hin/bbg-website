import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Save, X, Calculator, Smartphone, Laptop, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ClaimValueSlab {
  id: number;
  deviceType: string;
  brand: string | null;
  minMonths: number;
  maxMonths: number;
  percentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClaimValueSlabForm {
  deviceType: string;
  brand?: string;
  minMonths: number;
  maxMonths: number;
  percentage: number;
  isActive: boolean;
}

// Brand options based on your requirements
const LAPTOP_BRANDS = ["HP", "Dell", "Lenovo", "Acer", "Asus", "Macbook", "Others"];
const MOBILE_BRANDS = ["Samsung", "Apple", "OnePlus", "Xiaomi", "Realme", "Others"];

export default function AdminClaimValueSlabsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ClaimValueSlabForm>({
    deviceType: "laptop",
    brand: "",
    minMonths: 6,
    maxMonths: 12,
    percentage: 60,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slabs = [], isLoading } = useQuery<ClaimValueSlab[]>({
    queryKey: ["/api/admin/claim-value-slabs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClaimValueSlabForm) => {
      await apiRequest("/api/admin/claim-value-slabs", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/claim-value-slabs"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Claim value slab created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create claim value slab",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClaimValueSlabForm }) => {
      await apiRequest(`/api/admin/claim-value-slabs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/claim-value-slabs"] });
      setEditingId(null);
      resetForm();
      toast({
        title: "Success",
        description: "Claim value slab updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update claim value slab",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/claim-value-slabs/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/claim-value-slabs"] });
      toast({
        title: "Success",
        description: "Claim value slab deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete claim value slab",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      deviceType: "laptop",
      brand: "",
      minMonths: 6,
      maxMonths: 12,
      percentage: 60,
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      brand: formData.deviceType === "laptop" ? formData.brand || undefined : undefined,
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const startEdit = (slab: ClaimValueSlab) => {
    setFormData({
      deviceType: slab.deviceType,
      brand: slab.brand || "",
      minMonths: slab.minMonths,
      maxMonths: slab.maxMonths,
      percentage: slab.percentage,
      isActive: slab.isActive,
    });
    setEditingId(slab.id);
    setIsCreateDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    setIsCreateDialogOpen(false);
  };

  // Group slabs by device type and brand for better display
  const laptopSlabs = slabs.filter((slab) => slab.deviceType === "laptop");
  const mobileSlabs = slabs.filter((slab) => slab.deviceType === "mobile");

  // Create brand-organized table data for laptops
  const getBrandTable = () => {
    const ageRanges = [
      { label: "6 to 12 Months", min: 6, max: 12 },
      { label: "13 to 18 Months", min: 13, max: 18 },
      { label: "19 to 24 Months", min: 19, max: 24 },
      { label: "25 to 30 Months", min: 25, max: 30 },
      { label: "31 to 36 Months", min: 31, max: 36 },
    ];

    return ageRanges.map((range) => {
      const rowData: { [key: string]: string } = { ageRange: range.label };
      LAPTOP_BRANDS.forEach((brand) => {
        const slab = laptopSlabs.find(
          (s) => s.brand === brand && s.minMonths === range.min && s.maxMonths === range.max
        );
        rowData[brand] = slab ? `${slab.percentage}%` : "N/A";
      });
      return rowData;
    });
  };

  const brandTableData = getBrandTable();

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
                  <Select
                    value={formData.deviceType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deviceType: value, brand: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) =>
                      setFormData({ ...formData, brand: value })
                    }
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.deviceType === "laptop" 
                          ? LAPTOP_BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))
                          : MOBILE_BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minMonths">Min Months</Label>
                    <Input
                      id="minMonths"
                      type="number"
                      value={formData.minMonths}
                      onChange={(e) =>
                        setFormData({ ...formData, minMonths: parseInt(e.target.value) })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, maxMonths: parseInt(e.target.value) })
                      }
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
                    onChange={(e) =>
                      setFormData({ ...formData, percentage: parseInt(e.target.value) })
                    }
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

        <Tabs defaultValue="laptop" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="laptop">Laptop Slabs</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Slabs</TabsTrigger>
          </TabsList>

          <TabsContent value="laptop">
            <Card>
              <CardHeader>
                <CardTitle>Laptop Claim Value Slabs</CardTitle>
                <p className="text-sm text-gray-600">
                  Brand-comparison view for laptop device claim percentages
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (() => {
                  // Group laptop slabs by age range for brand comparison
                  const ageRanges: { [key: string]: any } = {};
                  const laptopBrands = ['HP', 'Lenovo', 'Dell', 'Acer', 'Asus'];
                  
                  // First, get all unique age ranges
                  laptopSlabs.forEach((slab: any) => {
                    const ageKey = `${slab.minMonths}-${slab.maxMonths}`;
                    if (!ageRanges[ageKey]) {
                      ageRanges[ageKey] = {
                        minMonths: slab.minMonths,
                        maxMonths: slab.maxMonths,
                        brands: {},
                        genericSlab: null // Store generic slab for editing
                      };
                    }
                    
                    // Add brand-specific percentage or fallback to generic
                    if (slab.brand) {
                      ageRanges[ageKey].brands[slab.brand] = { percentage: slab.percentage, slab };
                    } else {
                      // This is a generic slab - store it and use as fallback for missing brands
                      ageRanges[ageKey].genericSlab = slab;
                      laptopBrands.forEach(brand => {
                        if (!ageRanges[ageKey].brands[brand]) {
                          ageRanges[ageKey].brands[brand] = { percentage: slab.percentage, slab };
                        }
                      });
                    }
                  });

                  // Sort age ranges by minMonths
                  const sortedAgeRanges = Object.entries(ageRanges).sort(
                    ([, a], [, b]) => a.minMonths - b.minMonths
                  );

                  return (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Device Age</TableHead>
                            {laptopBrands.map(brand => (
                              <TableHead key={brand} className="text-center">{brand}</TableHead>
                            ))}
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedAgeRanges.map(([ageKey, ageData]) => (
                            <TableRow key={ageKey}>
                              <TableCell className="font-medium">
                                {ageData.minMonths}-{ageData.maxMonths} months
                              </TableCell>
                              {laptopBrands.map(brand => {
                                const brandData = ageData.brands[brand];
                                if (!brandData) return <TableCell key={brand} className="text-center text-gray-400">-</TableCell>;
                                
                                const isBrandSpecific = brandData.slab?.brand === brand;
                                
                                return (
                                  <TableCell key={brand} className="text-center">
                                    <Badge variant={isBrandSpecific ? "default" : "secondary"} 
                                           className={isBrandSpecific ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                      {brandData.percentage}%
                                    </Badge>
                                  </TableCell>
                                );
                              })}
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  {laptopBrands.map(brand => {
                                    const brandData = ageData.brands[brand];
                                    if (!brandData?.slab?.brand) return null; // Only show edit buttons for brand-specific slabs
                                    
                                    return (
                                      <div key={brand} className="flex items-center space-x-1">
                                        <span className="text-xs text-gray-500 w-12">{brand}:</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => startEdit(brandData.slab)}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => deleteMutation.mutate(brandData.slab.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Claim Value Slabs</CardTitle>
                <p className="text-sm text-gray-600">
                  Brand-comparison view for mobile device claim percentages
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (() => {
                  // Group mobile slabs by age range for brand comparison
                  const ageRanges: { [key: string]: any } = {};
                  const mobileBrands = ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Realme'];
                  
                  // First, get all unique age ranges
                  mobileSlabs.forEach((slab: any) => {
                    const ageKey = `${slab.minMonths}-${slab.maxMonths}`;
                    if (!ageRanges[ageKey]) {
                      ageRanges[ageKey] = {
                        minMonths: slab.minMonths,
                        maxMonths: slab.maxMonths,
                        brands: {},
                        actions: slab // Store one slab for editing generic values
                      };
                    }
                    
                    // Add brand-specific percentage or fallback to generic
                    if (slab.brand) {
                      ageRanges[ageKey].brands[slab.brand] = { percentage: slab.percentage, slab };
                    } else {
                      // This is a generic slab - use as fallback for missing brands
                      mobileBrands.forEach(brand => {
                        if (!ageRanges[ageKey].brands[brand]) {
                          ageRanges[ageKey].brands[brand] = { percentage: slab.percentage, slab };
                        }
                      });
                    }
                  });

                  // Sort age ranges by minMonths
                  const sortedAgeRanges = Object.entries(ageRanges).sort(
                    ([, a], [, b]) => a.minMonths - b.minMonths
                  );

                  return (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Device Age</TableHead>
                            {mobileBrands.map(brand => (
                              <TableHead key={brand} className="text-center">{brand}</TableHead>
                            ))}
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedAgeRanges.map(([ageKey, ageData]) => (
                            <TableRow key={ageKey}>
                              <TableCell className="font-medium">
                                {ageData.minMonths}-{ageData.maxMonths} months
                              </TableCell>
                              {mobileBrands.map(brand => {
                                const brandData = ageData.brands[brand];
                                if (!brandData) return <TableCell key={brand} className="text-center text-gray-400">-</TableCell>;
                                
                                const isBrandSpecific = brandData.slab?.brand === brand;
                                
                                return (
                                  <TableCell key={brand} className="text-center">
                                    <Badge variant={isBrandSpecific ? "default" : "secondary"} 
                                           className={isBrandSpecific ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                      {brandData.percentage}%
                                    </Badge>
                                  </TableCell>
                                );
                              })}
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  {mobileBrands.map(brand => {
                                    const brandData = ageData.brands[brand];
                                    if (!brandData?.slab?.brand) return null; // Only show edit buttons for brand-specific slabs
                                    
                                    return (
                                      <div key={brand} className="flex items-center space-x-1">
                                        <span className="text-xs text-gray-500 w-16">{brand}:</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => startEdit(brandData.slab)}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => deleteMutation.mutate(brandData.slab.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}