import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          <nav className="flex space-x-4">
            <a href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/admin/hsm-templates" className="text-gray-600 hover:text-gray-900">HSM Templates</a>
            <a href="/admin/whatsapp-test" className="text-gray-600 hover:text-gray-900">WhatsApp Test</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageSquare, Settings } from "lucide-react";

interface HSMTemplate {
  id: string;
  name: string;
  description: string;
  parameters: string[];
  status: 'approved' | 'pending' | 'rejected';
  language: string;
  category: string;
}

export default function AdminHSMTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Test message state
  const [testPhone, setTestPhone] = useState('9953410422');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateParams, setTemplateParams] = useState(['']);
  const [customMessage, setCustomMessage] = useState('Testing HSM template from admin panel');
  
  // Mock HSM templates - in real implementation, these would come from Gupshup API
  const mockTemplates: HSMTemplate[] = [
    {
      id: 'welcome_message',
      name: 'Welcome Message',
      description: 'Welcome new users to the platform',
      parameters: ['customer_name', 'voucher_code'],
      status: 'approved',
      language: 'en',
      category: 'utility'
    },
    {
      id: 'claim_update',
      name: 'Claim Status Update',
      description: 'Notify customers about claim status changes',
      parameters: ['customer_name', 'claim_status', 'amount'],
      status: 'approved',
      language: 'en',
      category: 'utility'
    },
    {
      id: 'payout_notification',
      name: 'Payout Notification',
      description: 'Notify partners about payout status',
      parameters: ['partner_name', 'amount', 'status'],
      status: 'approved',
      language: 'en',
      category: 'utility'
    }
  ];

  // Test HSM template mutation
  const testHSMMutation = useMutation({
    mutationFn: async (data: { phone: string; templateText?: string; params?: string[] }) => {
      return apiRequest(`/api/test-hsm-template`, {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      toast({
        title: "HSM Template Test Successful",
        description: `Message sent successfully: ${data.result?.response?.details || 'HSM template delivered'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "HSM Template Test Failed",
        description: error.message || 'Failed to send HSM template',
        variant: "destructive",
      });
    },
  });

  // Test regular message mutation
  const testMessageMutation = useMutation({
    mutationFn: async (data: { phone: string; message: string }) => {
      return apiRequest(`/api/test-gupshup-whatsapp`, {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Message Test Successful", 
          description: data.result?.response?.details || 'Message sent successfully',
        });
      } else {
        toast({
          title: "Message Test Result",
          description: data.error || 'HSM template error shown as expected',
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Message Test Failed",
        description: error.message,
        variant: "destructive", 
      });
    },
  });

  const handleTestHSMTemplate = () => {
    if (!selectedTemplate || !testPhone) {
      toast({
        title: "Missing Information",
        description: "Please select a template and enter a phone number",
        variant: "destructive",
      });
      return;
    }

    const template = mockTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Filter out empty parameters
    const params = templateParams.filter(p => p.trim() !== '');
    
    testHSMMutation.mutate({
      phone: testPhone,
      template: selectedTemplate,
      params: params
    });
  };

  const handleTestCustomMessage = () => {
    if (!testPhone || !customMessage.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please enter both phone number and message",
        variant: "destructive",
      });
      return;
    }

    testMessageMutation.mutate({
      phone: testPhone,
      message: customMessage
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      // Initialize parameter inputs based on template
      const newParams = template.parameters.map(() => '');
      setTemplateParams(newParams);
    }
  };

  const updateParameter = (index: number, value: string) => {
    const newParams = [...templateParams];
    newParams[index] = value;
    setTemplateParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HSM Template Management</h1>
          <p className="text-gray-600">Manage and test WhatsApp HSM templates for Gupshup account 2000203988</p>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Available Templates</TabsTrigger>
            <TabsTrigger value="test">Test HSM Templates</TabsTrigger>
            <TabsTrigger value="message">Test Custom Message</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Approved HSM Templates
                  </CardTitle>
                  <CardDescription>
                    These templates are approved for use with Gupshup WhatsApp Business API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <Badge variant={template.status === 'approved' ? 'default' : 'secondary'}>
                            {template.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Template ID:</span> {template.id}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {template.category}
                          </div>
                          <div>
                            <span className="font-medium">Language:</span> {template.language.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium">Parameters:</span> {template.parameters.length}
                          </div>
                        </div>
                        
                        {template.parameters.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-sm">Required Parameters:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.parameters.map((param, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {param}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Test HSM Templates
                  </CardTitle>
                  <CardDescription>
                    Send HSM approved templates to test WhatsApp delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Test Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="Enter phone number (e.g., 9953410422)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="template">Select HSM Template</Label>
                      <select
                        id="template"
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Choose a template...</option>
                        {mockTemplates.filter(t => t.status === 'approved').map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedTemplate && (
                    <div>
                      <Label>Template Parameters</Label>
                      <div className="grid gap-2 mt-2">
                        {mockTemplates.find(t => t.id === selectedTemplate)?.parameters.map((param, index) => (
                          <div key={index}>
                            <Label className="text-sm text-gray-600">{param}</Label>
                            <Input
                              value={templateParams[index] || ''}
                              onChange={(e) => updateParameter(index, e.target.value)}
                              placeholder={`Enter ${param}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTestHSMTemplate}
                    disabled={testHSMMutation.isPending || !selectedTemplate}
                    className="w-full"
                  >
                    {testHSMMutation.isPending ? 'Sending HSM Template...' : 'Send HSM Template'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="message">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Test Custom Message
                  </CardTitle>
                  <CardDescription>
                    Test custom messages (will show HSM template error as expected)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customPhone">Test Phone Number</Label>
                    <Input
                      id="customPhone"
                      type="tel" 
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="Enter phone number (e.g., 9953410422)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea
                      id="customMessage"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Enter your custom message..."
                      rows={4}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Expected Behavior</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Custom messages will show "Message does not match WhatsApp HSM template" error as expected, since only approved templates can be sent via WhatsApp Business API.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleTestCustomMessage}
                    disabled={testMessageMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {testMessageMutation.isPending ? 'Testing Message...' : 'Test Custom Message (Expect HSM Error)'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}