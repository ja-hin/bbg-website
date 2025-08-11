import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Send, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";

interface WhatsAppConfig {
  userId: string;
  password: string;
  baseUrl: string;
  isEnabled: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  message: string;
  isTemplate: boolean;
  isActive: boolean;
}

export default function AdminWhatsAppSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  // Fetch WhatsApp configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["/api/admin/whatsapp/config"],
    retry: false
  });

  // Fetch message templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/admin/whatsapp/templates"],
    retry: false
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: WhatsAppConfig) => {
      return await apiRequest("/api/admin/whatsapp/config", {
        method: "POST",
        body: configData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/config"] });
      toast({
        title: "Success",
        description: "WhatsApp configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Test message mutation
  const testMessageMutation = useMutation({
    mutationFn: async ({ phone, message }: { phone: string; message: string }) => {
      return await apiRequest("/api/admin/whatsapp/test", {
        method: "POST",
        body: { phone, message }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Test Message Sent",
        description: `Message sent successfully. Response: ${data.status}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate URL for manual testing
  const generateUrl = () => {
    if (!config || !testPhone || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in phone number and message",
        variant: "destructive",
      });
      return;
    }

    const encodedMessage = encodeURIComponent(testMessage);
    const url = `${config.baseUrl}?userid=${config.userId}&password=${config.password}&send_to=${testPhone}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=${encodedMessage}&isTemplate=true`;
    setGeneratedUrl(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    });
  };

  const handleConfigSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const configData: WhatsAppConfig = {
      userId: formData.get("userId") as string,
      password: formData.get("password") as string,
      baseUrl: formData.get("baseUrl") as string,
      isEnabled: formData.get("isEnabled") === "on"
    };

    updateConfigMutation.mutate(configData);
  };

  if (configLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure WhatsApp API settings and test message delivery
          </p>
        </div>
        <Badge variant={config?.isEnabled ? "default" : "secondary"}>
          {config?.isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Test Messages
          </TabsTrigger>
          <TabsTrigger value="url-generator" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            URL Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp API Configuration
              </CardTitle>
              <CardDescription>
                Configure your WhatsApp API credentials and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      name="userId"
                      placeholder="2000203988"
                      defaultValue={config?.userId || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="API Password"
                      defaultValue={config?.password || ""}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    name="baseUrl"
                    placeholder="https://mediaapi.smsgupshup.com/GatewayAPI/rest"
                    defaultValue={config?.baseUrl || "https://mediaapi.smsgupshup.com/GatewayAPI/rest"}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEnabled"
                    name="isEnabled"
                    defaultChecked={config?.isEnabled || false}
                  />
                  <Label htmlFor="isEnabled">Enable WhatsApp API</Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateConfigMutation.isPending}
                  className="w-full"
                >
                  {updateConfigMutation.isPending ? "Updating..." : "Update Configuration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test Message Delivery
              </CardTitle>
              <CardDescription>
                Send a test message to verify your WhatsApp configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testPhone">Phone Number</Label>
                <Input
                  id="testPhone"
                  placeholder="9953410422"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter phone number without +91 prefix
                </p>
              </div>

              <div>
                <Label htmlFor="testMessage">Test Message</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Dear Customer,

Thank you for completing your product registration, Your Protection Plan is auto-activated and registered with us.

Please share your purchasing experience with us on the given link below.

Share Your Experience and Rating 

Best Regards
Team XtraCover"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={8}
                />
              </div>

              <Button 
                onClick={() => testMessageMutation.mutate({ phone: testPhone, message: testMessage })}
                disabled={!testPhone || !testMessage || testMessageMutation.isPending}
                className="w-full"
              >
                {testMessageMutation.isPending ? "Sending..." : "Send Test Message"}
              </Button>

              {testMessageMutation.isError && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Test failed: {testMessageMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}

              {testMessageMutation.isSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Test message sent successfully!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url-generator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                URL Generator
              </CardTitle>
              <CardDescription>
                Generate WhatsApp API URLs for manual testing and integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urlPhone">Phone Number</Label>
                  <Input
                    id="urlPhone"
                    placeholder="9953410422"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Current Configuration</Label>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    User ID: {config?.userId || "Not configured"}<br/>
                    Base URL: {config?.baseUrl || "Not configured"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="urlMessage">Message Content</Label>
                <Textarea
                  id="urlMessage"
                  placeholder="Enter your message here..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={generateUrl} className="w-full">
                Generate WhatsApp URL
              </Button>

              {generatedUrl && (
                <div className="space-y-2">
                  <Label>Generated URL:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedUrl}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generatedUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Click the external link button to test this URL directly in your browser
                  </p>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The generated URL uses the same format as your working API example. 
                  Make sure your WhatsApp configuration is saved before generating URLs.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}