import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Edit2, Plus, Upload, ImageIcon, Smartphone, Monitor, Loader2, AlertTriangle, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { HomepageBanner } from "@shared/schema";

interface HomepageBannerFormData {
  title: string;
  description: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  desktopImage?: File;
  mobileImage?: File;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
}

const HomepageBannersPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
  const [formData, setFormData] = useState<HomepageBannerFormData>({
    title: "",
    description: "",
    linkUrl: "",
    isActive: true,
    sortOrder: 0
  });

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all homepage banners
  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/homepage-banners'],
    queryFn: () => apiRequest('/api/admin/homepage-banners'),
    retry: false
  });

  // Create banner mutation
  const createBannerMutation = useMutation({
    mutationFn: async (data: HomepageBannerFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('linkUrl', data.linkUrl);
      formData.append('isActive', String(data.isActive));
      formData.append('sortOrder', String(data.sortOrder));
      
      if (data.desktopImage) {
        formData.append('desktopImage', data.desktopImage);
      }
      if (data.mobileImage) {
        formData.append('mobileImage', data.mobileImage);
      }
      
      // Include URL fields for direct URL setting
      if (data.desktopImageUrl) {
        formData.append('desktopImageUrl', data.desktopImageUrl);
      }
      if (data.mobileImageUrl) {
        formData.append('mobileImageUrl', data.mobileImageUrl);
      }

      const response = await fetch('/api/admin/homepage-banners', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create banner');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/homepage-banners'] });
      toast({
        title: "Success",
        description: "Homepage banner created successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: HomepageBannerFormData }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('linkUrl', data.linkUrl);
      formDataToSend.append('isActive', String(data.isActive));
      formDataToSend.append('sortOrder', String(data.sortOrder));
      
      if (data.desktopImage) {
        formDataToSend.append('desktopImage', data.desktopImage);
      }
      if (data.mobileImage) {
        formDataToSend.append('mobileImage', data.mobileImage);
      }
      
      // Include URL fields for direct URL setting
      if (data.desktopImageUrl) {
        formDataToSend.append('desktopImageUrl', data.desktopImageUrl);
      }
      if (data.mobileImageUrl) {
        formDataToSend.append('mobileImageUrl', data.mobileImageUrl);
      }

      const response = await fetch(`/api/admin/homepage-banners/${id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update banner');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/homepage-banners'] });
      toast({
        title: "Success",
        description: "Homepage banner updated successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      setEditingBanner(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/homepage-banners/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/homepage-banners'] });
      toast({
        title: "Success",
        description: "Homepage banner deleted successfully",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      linkUrl: "",
      isActive: true,
      sortOrder: 0,
      desktopImageUrl: "",
      mobileImageUrl: ""
    });
    if (desktopFileInputRef.current) {
      desktopFileInputRef.current.value = '';
    }
    if (mobileFileInputRef.current) {
      mobileFileInputRef.current.value = '';
    }
  };

  const openEditDialog = (banner: HomepageBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || "",
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive || false,
      sortOrder: banner.sortOrder || 0,
      desktopImageUrl: banner.desktopImageUrl,
      mobileImageUrl: banner.mobileImageUrl
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBanner(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Banner title is required",
        variant: "destructive"
      });
      return;
    }

    if (!editingBanner) {
      // Creating new banner - require both images
      if (!formData.desktopImage || !formData.mobileImage) {
        toast({
          title: "Error",
          description: "Both desktop and mobile images are required for new banners",
          variant: "destructive"
        });
        return;
      }
      createBannerMutation.mutate(formData);
    } else {
      // Updating existing banner
      updateBannerMutation.mutate({ id: editingBanner.id, data: formData });
    }
  };

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (allow all image types and SVG)
      const allowedTypes = ['image/', 'image/svg+xml'];
      const isValid = allowedTypes.some(type => 
        file.type.startsWith(type) || file.name.toLowerCase().endsWith('.svg')
      );
      
      if (!isValid) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (PNG, JPG, SVG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Desktop image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, desktopImage: file }));
    }
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (allow all image types and SVG)
      const allowedTypes = ['image/', 'image/svg+xml'];
      const isValid = allowedTypes.some(type => 
        file.type.startsWith(type) || file.name.toLowerCase().endsWith('.svg')
      );
      
      if (!isValid) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (PNG, JPG, SVG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Mobile image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, mobileImage: file }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading homepage banners...</span>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's an authentication error and redirect to login
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (errorMessage.includes('Admin authentication required')) {
      window.location.href = '/admin/login';
      return null;
    }

    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Banners</h3>
              <p className="text-red-700 mb-4">
                {errorMessage}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedBanners = [...banners].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Homepage Banners</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage slider banners displayed on the homepage with separate desktop and mobile versions
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Homepage Banner' : 'Create Homepage Banner'}
              </DialogTitle>
              <DialogDescription>
                {editingBanner 
                  ? 'Update the banner details and images (leave image fields empty to keep existing images)'
                  : 'Create a new banner with separate desktop and mobile images for responsive display'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter banner title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter banner description (optional)"
                  rows={3}
                />
              </div>

              {/* Link URL */}
              <div className="space-y-2">
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://example.com (optional)"
                />
              </div>

              {/* Desktop Image */}
              <div className="space-y-2">
                <Label htmlFor="desktopImage">
                  Desktop Image {!editingBanner && '*'}
                  <span className="text-xs text-gray-500 ml-1">(Recommended: 1920x600px)</span>
                </Label>
                
                {/* Current Desktop Image URL (editable when editing) */}
                {editingBanner && (
                  <div className="space-y-2">
                    <Label htmlFor="desktopImageUrl" className="text-sm">Current Desktop Image URL:</Label>
                    <Input
                      id="desktopImageUrl"
                      value={formData.desktopImageUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, desktopImageUrl: e.target.value }))}
                      placeholder="https://example.com/desktop-image.jpg"
                      className="font-mono text-sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => desktopFileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    {editingBanner ? 'Upload New Desktop Image' : 'Choose Desktop Image'}
                  </Button>
                  {formData.desktopImage && (
                    <span className="text-sm text-green-600">
                      {formData.desktopImage.name} selected
                    </span>
                  )}
                </div>
                <input
                  ref={desktopFileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleDesktopImageChange}
                  className="hidden"
                />
              </div>

              {/* Mobile Image */}
              <div className="space-y-2">
                <Label htmlFor="mobileImage">
                  Mobile Image {!editingBanner && '*'}
                  <span className="text-xs text-gray-500 ml-1">(Recommended: 768x400px)</span>
                </Label>
                
                {/* Current Mobile Image URL (editable when editing) */}
                {editingBanner && (
                  <div className="space-y-2">
                    <Label htmlFor="mobileImageUrl" className="text-sm">Current Mobile Image URL:</Label>
                    <Input
                      id="mobileImageUrl"
                      value={formData.mobileImageUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileImageUrl: e.target.value }))}
                      placeholder="https://example.com/mobile-image.jpg"
                      className="font-mono text-sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => mobileFileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    {editingBanner ? 'Upload New Mobile Image' : 'Choose Mobile Image'}
                  </Button>
                  {formData.mobileImage && (
                    <span className="text-sm text-green-600">
                      {formData.mobileImage.name} selected
                    </span>
                  )}
                </div>
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleMobileImageChange}
                  className="hidden"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                className="flex items-center gap-2"
              >
                {(createBannerMutation.isPending || updateBannerMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Banner Display Guidelines</p>
              <ul className="space-y-1 text-xs">
                <li>• Banners are displayed in order of Sort Order (lower numbers first)</li>
                <li>• Desktop images should be landscape-oriented (recommended: 1920x600px)</li>
                <li>• Mobile images should be mobile-optimized (recommended: 768x400px)</li>
                <li>• Only active banners will be shown on the homepage</li>
                <li>• Images are automatically optimized and cached for fast loading</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{banners.length}</div>
              <div className="text-sm text-blue-800">Total Banners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{banners.filter((b: HomepageBanner) => b.isActive).length}</div>
              <div className="text-sm text-green-800">Active Banners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{banners.filter((b: HomepageBanner) => !b.isActive).length}</div>
              <div className="text-sm text-gray-800">Inactive Banners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {banners.length > 0 
                  ? new Date(Math.max(...banners
                      .filter((b: HomepageBanner) => b.updatedAt)
                      .map((b: HomepageBanner) => new Date(b.updatedAt!).getTime())
                    )).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-purple-800">Last Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banners List */}
      <div className="space-y-4">
        {sortedBanners.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first homepage banner
                </p>
                <Button onClick={openCreateDialog} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Add First Banner
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedBanners.map((banner) => (
            <Card key={banner.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{banner.title}</CardTitle>
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Order: {banner.sortOrder}
                      </Badge>
                    </div>
                    
                    {/* Date Information */}
                    <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(banner.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated: {new Date(banner.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {banner.description && (
                      <CardDescription className="text-sm text-gray-600">
                        {banner.description}
                      </CardDescription>
                    )}
                    {banner.linkUrl && (
                      <div className="mt-2">
                        <a 
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {banner.linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(banner)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this banner?')) {
                          deleteBannerMutation.mutate(banner.id);
                        }
                      }}
                      disabled={deleteBannerMutation.isPending}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      {deleteBannerMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Image Previews */}
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-4 w-4 text-gray-600" />
                      <Label className="text-sm font-medium">Desktop Image</Label>
                    </div>
                    <div className="aspect-[16/5] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={banner.desktopImageUrl}
                        alt={`${banner.title} - Desktop`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-gray-600" />
                      <Label className="text-sm font-medium">Mobile Image</Label>
                    </div>
                    <div className="aspect-[16/5] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={banner.mobileImageUrl}
                        alt={`${banner.title} - Mobile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                  <span>Created: {new Date(banner.createdAt).toLocaleDateString()}</span>
                  {banner.updatedAt !== banner.createdAt && (
                    <span>Updated: {new Date(banner.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HomepageBannersPage;