import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Save,
  X,
  Code,
  Monitor,
  Smartphone,
  RefreshCw
} from "lucide-react";

interface MessageTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  event: string;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const eventLabels = {
  'customer_registration': 'Customer Registration',
  'referral_partner_welcome': 'Referral Partner Welcome', 
  'claim_status_update': 'Claim Status Update',
  'payout_notification': 'Payout Notification',
  'otp_verification': 'OTP Verification'
};

const typeIcons = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare
};

const sampleData = {
  'customer_registration': {
    name: 'John Doe',
    email: 'john@example.com',
    contact: '9876543210',
    voucherCode: 'BBG123456',
    deviceType: 'mobile',
    brand: 'Samsung',
    modelName: 'Galaxy S21',
    claimValueSlabsHtml: '<div style="background: white; padding: 10px 15px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #0277bd;"><span style="font-weight: bold; color: #1976d2;">6-12 months old:</span><span style="color: #2e7d32; font-weight: bold; float: right;">65%</span></div><div style="background: white; padding: 10px 15px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #0277bd;"><span style="font-weight: bold; color: #1976d2;">13-18 months old:</span><span style="color: #2e7d32; font-weight: bold; float: right;">60%</span></div>'
  },
  'referral_partner_welcome': {
    name: 'Jane Smith',
    email: 'jane@example.com',
    contact: '9876543210',
    sellerCode: 'REF12345',
    businessName: 'ABC Electronics'
  },
  'claim_status_update': {
    name: 'John Doe',
    email: 'john@example.com',
    contact: '9876543210',
    voucherCode: 'BBG123456',
    claimAmount: 15000,
    status: 'approved'
  },
  'payout_notification': {
    name: 'Jane Smith',
    email: 'jane@example.com',
    contact: '9876543210',
    amount: 500,
    status: 'paid',
    paymentReference: 'TXN123456'
  },
  'otp_verification': {
    otp: '123456',
    name: 'John Doe',
    contact: '9876543210'
  }
};

export default function AdminTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'whatsapp',
    event: 'customer_registration',
    subject: '',
    content: '',
    variables: [] as string[]
  });
  const [previewContent, setPreviewContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [htmlEditorMode, setHtmlEditorMode] = useState<'visual' | 'code'>('visual');
  const [autoPreview, setAutoPreview] = useState(true);

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/admin/templates"],
    retry: false
  });

  // Get available variables
  const { data: availableVariables } = useQuery({
    queryKey: ["/api/admin/templates/variables", formData.event],
    retry: false
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/admin/templates", {
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      resetForm();
      toast({
        title: "Success",
        description: "Template created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive"
      });
    }
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      return await apiRequest(`/api/admin/templates/${id}`, {
        method: "PUT",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      setIsEditMode(false);
      setSelectedTemplate(null);
      resetForm();
      toast({
        title: "Success",
        description: "Template updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive"
      });
    }
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/templates/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive"
      });
    }
  });

  // Toggle template status mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/templates/${id}/toggle`, {
        method: "PATCH"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/templates"] });
      toast({
        title: "Success",
        description: "Template status updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template status",
        variant: "destructive"
      });
    }
  });

  // Preview template mutation
  const previewMutation = useMutation({
    mutationFn: async ({ content, variables }: { content: string; variables: Record<string, any> }) => {
      return await apiRequest("/api/admin/templates/preview", {
        method: "POST",
        body: { content, variables }
      });
    },
    onSuccess: (data) => {
      setPreviewContent(data.rendered);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to preview template",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      event: 'customer_registration',
      subject: '',
      content: '',
      variables: []
    });
    setPreviewContent('');
  };

  const handlePreview = () => {
    if (formData.content && formData.event) {
      const sampleVariables = sampleData[formData.event as keyof typeof sampleData] || {};
      previewMutation.mutate({ 
        content: formData.content, 
        variables: sampleVariables 
      });
    }
  };

  // Auto-preview when content changes and auto-preview is enabled
  useEffect(() => {
    if (autoPreview && formData.content && formData.event) {
      const timeoutId = setTimeout(() => {
        handlePreview();
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.content, formData.event, autoPreview]);

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('#content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = formData.content.substring(0, cursorPos);
      const textAfter = formData.content.substring(cursorPos);
      const newContent = textBefore + `{{${variable}}}` + textAfter;
      setFormData({ ...formData, content: newContent });
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos + variable.length + 4, cursorPos + variable.length + 4);
      }, 0);
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      event: template.event,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables
    });
    setIsEditMode(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Name and content are required",
        variant: "destructive"
      });
      return;
    }

    if (isEditMode && selectedTemplate) {
      updateMutation.mutate({
        id: selectedTemplate.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type as keyof typeof typeIcons];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div>Loading templates...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
            <p className="text-gray-600 mt-2">Manage communication templates for different events</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsEditMode(false);
                setSelectedTemplate(null);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Edit Template' : 'Create New Template'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Customer Welcome Email"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: 'email' | 'sms' | 'whatsapp') => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">📧 Email</SelectItem>
                          <SelectItem value="sms">📱 SMS</SelectItem>
                          <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="event">Event</Label>
                      <Select value={formData.event} onValueChange={(value) => setFormData({...formData, event: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(eventLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.type === 'email' && (
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="Email subject with {{variables}}"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="content">Content</Label>
                      <div className="flex gap-2">
                        {formData.type === 'email' && (
                          <div className="flex rounded-lg border p-1">
                            <Button
                              size="sm"
                              variant={htmlEditorMode === 'visual' ? 'default' : 'ghost'}
                              onClick={() => setHtmlEditorMode('visual')}
                              className="px-3 py-1 text-xs"
                            >
                              Visual
                            </Button>
                            <Button
                              size="sm"
                              variant={htmlEditorMode === 'code' ? 'default' : 'ghost'}
                              onClick={() => setHtmlEditorMode('code')}
                              className="px-3 py-1 text-xs"
                            >
                              <Code className="h-3 w-3 mr-1" />
                              HTML
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Auto Preview:</label>
                          <Button
                            size="sm"
                            variant={autoPreview ? 'default' : 'outline'}
                            onClick={() => setAutoPreview(!autoPreview)}
                            className="px-2 py-1 text-xs"
                          >
                            {autoPreview ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {formData.type === 'email' && htmlEditorMode === 'visual' ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 mb-2">
                          Tip: Use the toolbar below for common HTML formatting, or switch to HTML mode for advanced editing.
                        </div>
                        <div className="flex gap-1 mb-2 p-2 border rounded bg-gray-50">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => insertVariable('name')}
                            className="text-xs px-2 py-1"
                          >
                            Name
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => insertVariable('email')}
                            className="text-xs px-2 py-1"
                          >
                            Email
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => insertVariable('voucherCode')}
                            className="text-xs px-2 py-1"
                          >
                            Voucher
                          </Button>
                          <div className="border-l mx-1"></div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              const newContent = formData.content + '\n<h2 style="color: #254696;">Heading</h2>';
                              setFormData({...formData, content: newContent});
                            }}
                            className="text-xs px-2 py-1"
                          >
                            H2
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              const newContent = formData.content + '\n<p style="margin: 10px 0;">Paragraph text here...</p>';
                              setFormData({...formData, content: newContent});
                            }}
                            className="text-xs px-2 py-1"
                          >
                            Para
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              const newContent = formData.content + '\n<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">\n  <p>Highlighted content</p>\n</div>';
                              setFormData({...formData, content: newContent});
                            }}
                            className="text-xs px-2 py-1"
                          >
                            Box
                          </Button>
                        </div>
                        <Textarea
                          id="content-editor"
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          placeholder="HTML content with {{variables}} - Use the toolbar above for common elements"
                          rows={14}
                          className="font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <Textarea
                        id="content-editor"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder={formData.type === 'email' ? 
                          "HTML content with {{variables}}" : 
                          "Text content with {{variables}}"
                        }
                        rows={14}
                        className={formData.type === 'email' ? 'font-mono text-sm' : ''}
                      />
                    )}
                  </div>
                  
                  <div>
                    <Label>Available Variables</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableVariables?.variables?.map((variable: string) => (
                        <Badge key={variable} variant="outline" className="cursor-pointer"
                          onClick={() => {
                            const cursorPos = (document.getElementById('content') as HTMLTextAreaElement)?.selectionStart || 0;
                            const newContent = formData.content.slice(0, cursorPos) + `{{${variable}}}` + formData.content.slice(cursorPos);
                            setFormData({...formData, content: newContent});
                          }}>
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={handlePreview} disabled={previewMutation.isPending}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Live Preview</Label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={previewMode === 'desktop' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('desktop')}
                        className="px-2 py-1 text-xs"
                      >
                        <Monitor className="h-3 w-3 mr-1" />
                        Desktop
                      </Button>
                      <Button
                        size="sm"
                        variant={previewMode === 'mobile' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('mobile')}
                        className="px-2 py-1 text-xs"
                      >
                        <Smartphone className="h-3 w-3 mr-1" />
                        Mobile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePreview}
                        disabled={previewMutation.isPending}
                        className="px-2 py-1 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg bg-white overflow-auto ${
                    previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                  }`} style={{ minHeight: '400px' }}>
                    <div className="p-4">
                      {previewContent ? (
                        <div>
                          {formData.type === 'email' ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: previewContent }}
                              className="email-preview"
                              style={{
                                fontFamily: 'Arial, sans-serif',
                                lineHeight: '1.6',
                                color: '#333'
                              }}
                            />
                          ) : (
                            <div 
                              className="whitespace-pre-wrap text-sm"
                              style={{ 
                                fontFamily: previewMode === 'mobile' ? 'system-ui' : 'inherit',
                                fontSize: previewMode === 'mobile' ? '14px' : '16px'
                              }}
                            >
                              {previewContent}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic text-center py-20">
                          {autoPreview ? 
                            'Type content above to see live preview...' : 
                            'Click "Preview" to see rendered template with sample data'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {formData.event && (
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Sample data being used:</strong>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono">
                        {JSON.stringify(sampleData[formData.event as keyof typeof sampleData] || {}, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="email">📧 Email</TabsTrigger>
            <TabsTrigger value="sms">📱 SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">💬 WhatsApp</TabsTrigger>
          </TabsList>

          {['all', 'email', 'sms', 'whatsapp'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {templates?.filter((template: MessageTemplate) => 
                tab === 'all' || template.type === tab
              ).map((template: MessageTemplate) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(template.type)}
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              {eventLabels[template.event as keyof typeof eventLabels]}
                            </Badge>
                            {getStatusBadge(template.isActive)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate(template.id)}>
                          {template.isActive ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {template.subject && (
                      <div className="mb-2">
                        <strong>Subject:</strong> {template.subject}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Variables:</strong> {template.variables.join(', ') || 'None'}
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                      {template.content}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {new Date(template.updatedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}