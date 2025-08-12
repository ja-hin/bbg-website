import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
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

// Brand options for laptops based on your requirements
const LAPTOP_BRANDS = ["HP", "Dell", "Lenovo", "Acer", "Asus", "Macbook", "Others"];

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
      brand: formData.deviceType === "laptop" ? formData.brand : null,
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
      const rowData = { ageRange: range.label };
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

                {formData.deviceType === "laptop" && (
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
                        {LAPTOP_BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Brand Overview</TabsTrigger>
            <TabsTrigger value="laptop">Laptop Slabs</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Slabs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Laptop Brand Claim Value Overview</CardTitle>
                <p className="text-sm text-gray-600">
                  Percentage values based on device age and brand
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Age of the Laptop</TableHead>
                        {LAPTOP_BRANDS.map((brand) => (
                          <TableHead key={brand} className="text-center font-semibold">
                            {brand}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandTableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.ageRange}</TableCell>
                          {LAPTOP_BRANDS.map((brand) => (
                            <TableCell key={brand} className="text-center">
                              <Badge variant={row[brand] === "N/A" ? "secondary" : "default"}>
                                {row[brand]}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="laptop">
            <Card>
              <CardHeader>
                <CardTitle>Laptop Claim Value Slabs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Age Range</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laptopSlabs.map((slab) => (
                        <TableRow key={slab.id}>
                          <TableCell>{slab.brand || "Generic"}</TableCell>
                          <TableCell>
                            {slab.minMonths}-{slab.maxMonths} months
                          </TableCell>
                          <TableCell>{slab.percentage}%</TableCell>
                          <TableCell>
                            <Badge variant={slab.isActive ? "default" : "secondary"}>
                              {slab.isActive ? "Active" : "Inactive"}
                            </Badge>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Claim Value Slabs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Range</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mobileSlabs.map((slab) => (
                        <TableRow key={slab.id}>
                          <TableCell>
                            {slab.minMonths}-{slab.maxMonths} months
                          </TableCell>
                          <TableCell>{slab.percentage}%</TableCell>
                          <TableCell>
                            <Badge variant={slab.isActive ? "default" : "secondary"}>
                              {slab.isActive ? "Active" : "Inactive"}
                            </Badge>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}