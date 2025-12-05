import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Package, Smartphone, Laptop, IndianRupee } from "lucide-react";
import { Plan } from "@shared/schema";

export default function AdminPlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    planName: '',
    planPrice: '',
    deviceType: 'mobile',
    planType: 'bbg'
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/admin/plans'],
    retry: false,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/admin/plans', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/admin/plans/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      setEditingPlan(null);
      resetForm();
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/plans/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.planName || !formData.planPrice || !formData.deviceType || !formData.planType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.planPrice);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      planName: formData.planName,
      planPrice: formData.planPrice,
      deviceType: formData.deviceType,
      planType: formData.planType
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      planPrice: plan.planPrice.toString(),
      deviceType: plan.deviceType,
      planType: plan.planType
    });
  };

  const handleDelete = (plan: Plan) => {
    if (confirm(`Are you sure you want to delete "${plan.planName}"?`)) {
      deletePlanMutation.mutate(plan.id);
    }
  };

  const resetForm = () => {
    setFormData({ planName: '', planPrice: '', deviceType: 'mobile', planType: 'bbg' });
    setEditingPlan(null);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  const getPlanTypeBadge = (planType: string) => {
    if (planType === 'bbg') {
      return <Badge className="bg-blue-500">BBG</Badge>;
    }
    return <Badge className="bg-purple-500">Extend+</Badge>;
  };

  const getDeviceTypeBadge = (deviceType: string) => {
    if (deviceType === 'mobile') {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          Mobile
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Laptop className="w-3 h-3" />
        Laptop
      </Badge>
    );
  };

  const mobilePlans = plans?.filter((plan: Plan) => plan.deviceType === 'mobile') || [];
  const laptopPlans = plans?.filter((plan: Plan) => plan.deviceType === 'laptop') || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Plans Management</h1>
            <p className="text-muted-foreground">
              Manage BBG and Extend+ plan pricing for mobile and laptop devices
            </p>
          </div>
          
          <Dialog open={createDialogOpen || !!editingPlan} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button 
                className="bg-xtra-secondary hover:bg-xtra-secondary/90 text-white" 
                onClick={() => setCreateDialogOpen(true)}
                data-testid="button-add-plan"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    placeholder="e.g., BBG for Mobile"
                    data-testid="input-plan-name"
                  />
                </div>

                <div>
                  <Label htmlFor="planPrice">Price (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="planPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-10"
                      value={formData.planPrice}
                      onChange={(e) => setFormData({ ...formData, planPrice: e.target.value })}
                      placeholder="99.00"
                      data-testid="input-plan-price"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select 
                    value={formData.deviceType} 
                    onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                  >
                    <SelectTrigger data-testid="select-device-type">
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="planType">Plan Type</Label>
                  <Select 
                    value={formData.planType} 
                    onValueChange={(value) => setFormData({ ...formData, planType: value })}
                  >
                    <SelectTrigger data-testid="select-plan-type">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bbg">BBG (BuyBack Guarantee)</SelectItem>
                      <SelectItem value="extend_plus">Extend+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
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
                    disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                    data-testid="button-submit-plan"
                  >
                    {(createPlanMutation.isPending || updatePlanMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plans?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mobile Plans</CardTitle>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mobilePlans.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Laptop Plans</CardTitle>
                  <Laptop className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{laptopPlans.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                  <Badge className="bg-green-500">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {plans?.filter((p: Plan) => p.isActive).length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Plan Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans?.map((plan: Plan) => (
                      <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                        <TableCell className="font-medium">{plan.id}</TableCell>
                        <TableCell>{plan.planName}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPrice(plan.planPrice)}
                        </TableCell>
                        <TableCell>{getDeviceTypeBadge(plan.deviceType)}</TableCell>
                        <TableCell>{getPlanTypeBadge(plan.planType)}</TableCell>
                        <TableCell>
                          {plan.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                              data-testid={`button-edit-plan-${plan.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(plan)}
                              disabled={deletePlanMutation.isPending}
                              data-testid={`button-delete-plan-${plan.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!plans || plans.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No plans found. Click "Add New Plan" to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
