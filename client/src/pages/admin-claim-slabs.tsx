import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, TrendingUp, Calculator, Smartphone, Laptop } from "lucide-react";
import { ClaimValueSlab } from "@shared/schema";

export default function AdminClaimSlabs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<ClaimValueSlab | null>(null);
  const [activeTab, setActiveTab] = useState<'mobile' | 'laptop'>('mobile');
  const [formData, setFormData] = useState({
    deviceType: 'mobile',
    minMonths: '',
    maxMonths: '',
    percentage: '',
    isActive: true
  });

  // Fetch all claim value slabs
  const { data: slabs, isLoading } = useQuery({
    queryKey: ['/api/admin/claim-value-slabs'],
    retry: false,
  });

  // Create claim value slab mutation
  const createSlabMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('/api/admin/claim-value-slabs', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      setCreateDialogOpen(false);
      setFormData({ deviceType: 'mobile', minMonths: '', maxMonths: '', percentage: '', isActive: true });
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

  // Update claim value slab mutation
  const updateSlabMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest(`/api/admin/claim-value-slabs/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      setEditingSlab(null);
      setFormData({ deviceType: 'mobile', minMonths: '', maxMonths: '', percentage: '', isActive: true });
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

  // Delete claim value slab mutation
  const deleteSlabMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/claim-value-slabs/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data first
    if (!formData.minMonths || !formData.maxMonths || !formData.percentage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const minMonths = parseInt(formData.minMonths);
    const maxMonths = parseInt(formData.maxMonths);
    const percentage = parseInt(formData.percentage);

    // Validate ranges
    if (isNaN(minMonths) || isNaN(maxMonths) || isNaN(percentage)) {
      toast({
        title: "Error",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }

    if (minMonths >= maxMonths) {
      toast({
        title: "Error",
        description: "Min months must be less than max months",
        variant: "destructive",
      });
      return;
    }

    if (percentage < 0 || percentage > 100) {
      toast({
        title: "Error",
        description: "Percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      deviceType: formData.deviceType,
      minMonths,
      maxMonths,
      percentage,
      isActive: formData.isActive
    };

    if (editingSlab) {
      updateSlabMutation.mutate({ id: editingSlab.id, data });
    } else {
      createSlabMutation.mutate(data);
    }
  };

  const handleEdit = (slab: ClaimValueSlab) => {
    setEditingSlab(slab);
    setFormData({
      deviceType: slab.deviceType || 'mobile',
      minMonths: slab.minMonths.toString(),
      maxMonths: slab.maxMonths.toString(),
      percentage: slab.percentage.toString(),
      isActive: slab.isActive
    });
  };

  const resetForm = () => {
    setFormData({ deviceType: 'mobile', minMonths: '', maxMonths: '', percentage: '', isActive: true });
    setEditingSlab(null);
  };

  // Filter slabs by device type and active status
  const mobileSlabs = slabs?.filter((slab: ClaimValueSlab) => slab.deviceType === 'mobile') || [];
  const laptopSlabs = slabs?.filter((slab: ClaimValueSlab) => slab.deviceType === 'laptop') || [];
  const activeSlabs = slabs?.filter((slab: ClaimValueSlab) => slab.isActive) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Claim Value Slabs</h1>
            <p className="text-muted-foreground">
              Manage dynamic claim percentages based on device age and type
            </p>
          </div>
          
          <Dialog open={createDialogOpen || !!editingSlab} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Slab
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSlab ? 'Edit Claim Value Slab' : 'Create New Claim Value Slab'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select 
                    value={formData.deviceType} 
                    onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">📱 Mobile</SelectItem>
                      <SelectItem value="laptop">💻 Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minMonths">Min Months</Label>
                    <Input
                      id="minMonths"
                      type="number"
                      min="0"
                      value={formData.minMonths}
                      onChange={(e) => setFormData({ ...formData, minMonths: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxMonths">Max Months</Label>
                    <Input
                      id="maxMonths"
                      type="number"
                      min="1"
                      value={formData.maxMonths}
                      onChange={(e) => setFormData({ ...formData, maxMonths: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="percentage">Claim Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createSlabMutation.isPending || updateSlabMutation.isPending}
                  >
                    {(createSlabMutation.isPending || updateSlabMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingSlab ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slabs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slabs?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Slabs</CardTitle>
              <Calculator className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeSlabs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Percentage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSlabs.length > 0 
                  ? Math.round(activeSlabs.reduce((sum: number, slab: ClaimValueSlab) => sum + slab.percentage, 0) / activeSlabs.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Claim Value Slabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Claim Value Slabs by Device Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mobile" value={activeTab} onValueChange={(value) => setActiveTab(value as 'mobile' | 'laptop')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mobile" className="flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile ({mobileSlabs.length})
                </TabsTrigger>
                <TabsTrigger value="laptop" className="flex items-center">
                  <Laptop className="w-4 h-4 mr-2" />
                  Laptop ({laptopSlabs.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="mobile" className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : mobileSlabs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Range (Months)</TableHead>
                        <TableHead>Claim Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mobileSlabs.map((slab: ClaimValueSlab) => (
                        <TableRow key={slab.id}>
                          <TableCell className="font-medium">
                            {slab.minMonths} - {slab.maxMonths} months
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {slab.percentage}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={slab.isActive ? "default" : "secondary"}>
                              {slab.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(slab.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(slab)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteSlabMutation.mutate(slab.id)}
                                disabled={deleteSlabMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No mobile claim value slabs found.</p>
                    <p className="text-sm">Create your first mobile slab to get started.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="laptop" className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : laptopSlabs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Range (Months)</TableHead>
                        <TableHead>Claim Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laptopSlabs.map((slab: ClaimValueSlab) => (
                        <TableRow key={slab.id}>
                          <TableCell className="font-medium">
                            {slab.minMonths} - {slab.maxMonths} months
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {slab.percentage}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={slab.isActive ? "default" : "secondary"}>
                              {slab.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(slab.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(slab)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteSlabMutation.mutate(slab.id)}
                                disabled={deleteSlabMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Laptop className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No laptop claim value slabs found.</p>
                    <p className="text-sm">Create your first laptop slab to get started.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}