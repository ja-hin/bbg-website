import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminLayout } from "@/components/admin-layout";
import { Loader2, Plus, Edit2, Trash2, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PlanConfiguration {
  id: number;
  label: string;
  description: string;
  maxMonths: number;
  templateIdentifier: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPlanConfigurations() {
  useRequireAuth('admin');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    maxMonths: '',
    templateIdentifier: '',
    sortOrder: '0',
  });

  // Fetch plan configurations
  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/plan-configurations'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/plan-configurations', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plan-configurations'] });
      resetForm();
      toast({
        title: "Created",
        description: "Plan configuration created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan configuration",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/admin/plan-configurations/${editingId}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plan-configurations'] });
      resetForm();
      toast({
        title: "Updated",
        description: "Plan configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan configuration",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/plan-configurations/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plan-configurations'] });
      toast({
        title: "Deleted",
        description: "Plan configuration deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan configuration",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      label: '',
      description: '',
      maxMonths: '',
      templateIdentifier: '',
      sortOrder: '0',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (config: PlanConfiguration) => {
    setFormData({
      label: config.label,
      description: config.description,
      maxMonths: config.maxMonths.toString(),
      templateIdentifier: config.templateIdentifier,
      sortOrder: config.sortOrder.toString(),
    });
    setEditingId(config.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label.trim() || !formData.maxMonths.trim() || !formData.templateIdentifier.trim()) {
      toast({
        title: "Validation Error",
        description: "Label, max months, and template identifier are required",
        variant: "destructive",
      });
      return;
    }

    const maxMonths = parseInt(formData.maxMonths);
    if (isNaN(maxMonths) || maxMonths < 0) {
      toast({
        title: "Validation Error",
        description: "Max months must be a non-negative number",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      label: formData.label,
      description: formData.description,
      maxMonths,
      templateIdentifier: formData.templateIdentifier,
      sortOrder: parseInt(formData.sortOrder),
    };

    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this plan configuration?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Plan Configurations</h1>
            <p className="text-gray-600">Define the billing plans based on device age (in months)</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Plan Configuration' : 'Create New Plan Configuration'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Plan Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Within 6 Months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxMonths">Max Months</Label>
                  <Input
                    id="maxMonths"
                    type="number"
                    min="0"
                    value={formData.maxMonths}
                    onChange={(e) => setFormData({ ...formData, maxMonths: e.target.value })}
                    placeholder="e.g., 6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateIdentifier">Template Identifier</Label>
                <Input
                  id="templateIdentifier"
                  value={formData.templateIdentifier}
                  onChange={(e) => setFormData({ ...formData, templateIdentifier: e.target.value })}
                  placeholder="e.g., within_6_months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this plan configuration..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? 'Update' : 'Create'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Configurations List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Plan Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {configurations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No plan configurations found</p>
              ) : (
                configurations.map((config: PlanConfiguration) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Max Months: {config.maxMonths} | Template ID: {config.templateIdentifier}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(config.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
