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
import { AdminLayout } from "@/components/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, TrendingUp, Calculator } from "lucide-react";
import { ClaimValueSlab } from "@shared/schema";

export default function AdminClaimSlabs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<ClaimValueSlab | null>(null);
  const [formData, setFormData] = useState({
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
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      setCreateDialogOpen(false);
      setFormData({ minMonths: '', maxMonths: '', percentage: '', isActive: true });
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
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/claim-value-slabs'] });
      setEditingSlab(null);
      setFormData({ minMonths: '', maxMonths: '', percentage: '', isActive: true });
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
    
    const data = {
      minMonths: parseInt(formData.minMonths),
      maxMonths: parseInt(formData.maxMonths),
      percentage: parseInt(formData.percentage),
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
      minMonths: slab.minMonths.toString(),
      maxMonths: slab.maxMonths.toString(),
      percentage: slab.percentage.toString(),
      isActive: slab.isActive
    });
  };

  const resetForm = () => {
    setFormData({ minMonths: '', maxMonths: '', percentage: '', isActive: true });
    setEditingSlab(null);
  };

  const activeSlabs = slabs?.filter((slab: ClaimValueSlab) => slab.isActive) || [];
  const inactiveSlabs = slabs?.filter((slab: ClaimValueSlab) => !slab.isActive) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Claim Value Slabs</h1>
            <p className="text-muted-foreground">
              Manage dynamic claim percentages based on device age
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

        {/* Active Slabs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Active Claim Value Slabs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : activeSlabs.length > 0 ? (
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
                  {activeSlabs.map((slab: ClaimValueSlab) => (
                    <TableRow key={slab.id}>
                      <TableCell className="font-medium">
                        {slab.minMonths} - {slab.maxMonths} months
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
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
                No active claim value slabs found. Create your first slab to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Slabs Table */}
        {inactiveSlabs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">Inactive Claim Value Slabs</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {inactiveSlabs.map((slab: ClaimValueSlab) => (
                    <TableRow key={slab.id} className="opacity-60">
                      <TableCell className="font-medium">
                        {slab.minMonths} - {slab.maxMonths} months
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          {slab.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
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
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">How Claim Value Slabs Work</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-2">
              <li>• <strong>Age Range:</strong> Device age in months from purchase date</li>
              <li>• <strong>Claim Percentage:</strong> Percentage of original invoice value eligible for claim</li>
              <li>• <strong>Active Status:</strong> Only active slabs are used for new customer registrations</li>
              <li>• <strong>Historical Tracking:</strong> Each customer registration saves the active slab at time of registration</li>
              <li>• <strong>Overlap Prevention:</strong> Ensure age ranges don't overlap between active slabs</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}