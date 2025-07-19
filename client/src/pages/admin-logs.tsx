import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/admin-header";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Phone, 
  Mail, 
  MessageCircle,
  Activity,
  Database,
  Wifi
} from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  service: string;
  message: string;
  details?: any;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  lastChecked: string;
  responseTime?: number;
  details?: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testContact, setTestContact] = useState({
    name: "Test User",
    email: "test@example.com", 
    phone: "9953410422"
  });
  const [customMessage, setCustomMessage] = useState("");
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    user: "",
    password: ""
  });
  const [showSmtpForm, setShowSmtpForm] = useState(false);
  const { toast } = useToast();

  // Fetch system status
  const { data: systemStatus, refetch: refetchStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/system-status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent logs
  const { data: recentLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['/api/admin/logs'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch SMTP status
  const { data: smtpStatus, refetch: refetchSmtpStatus } = useQuery({
    queryKey: ['/api/admin/smtp-status'],
  });

  // Test communication channels
  const testCommunicationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/test-communications', {
        method: 'POST',
        body: testContact
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Communication Test Completed",
        description: "Check the logs below for detailed results",
      });
      addLog('success', 'Communication Test', 'Test completed successfully', data);
      refetchLogs();
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
      addLog('error', 'Communication Test', 'Test failed', error);
    }
  });

  // Test SMS specifically
  const testSMSMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/test-kaleyra-sms', {
        method: 'POST',
        body: {
          phoneNumber: testContact.phone,
          testMessage: customMessage || `Admin Log Test: Communication system check from BBG Admin Panel at ${new Date().toLocaleString()}`
        }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Test Successful",
        description: `Message sent to ${testContact.phone}`,
      });
      addLog('success', 'Kaleyra SMS', 'SMS sent successfully', data);
      refetchLogs();
    },
    onError: (error: any) => {
      toast({
        title: "SMS Test Failed", 
        description: error.message,
        variant: "destructive",
      });
      addLog('error', 'Kaleyra SMS', 'SMS test failed', error);
    }
  });

  // Configure SMTP
  const configureSMTPMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/configure-smtp', {
        method: 'POST',
        body: smtpConfig
      });
    },
    onSuccess: (data) => {
      toast({
        title: "SMTP Configuration Successful",
        description: "Email service is now configured and ready",
      });
      setShowSmtpForm(false);
      refetchSmtpStatus();
      refetchStatus();
      addLog('success', 'Email SMTP', 'SMTP configuration successful', data);
    },
    onError: (error: any) => {
      toast({
        title: "SMTP Configuration Failed",
        description: error.message,
        variant: "destructive",
      });
      addLog('error', 'Email SMTP', 'SMTP configuration failed', error);
    }
  });

  // Test templates
  const testTemplatesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/test-templates', {
        method: 'POST',
        body: testContact
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Template Test Completed",
        description: "All templates tested with your contact details",
      });
      addLog('success', 'Template System', 'All templates tested successfully', data);
      refetchLogs();
    },
    onError: (error: any) => {
      toast({
        title: "Template Test Failed",
        description: error.message,
        variant: "destructive",
      });
      addLog('error', 'Template System', 'Template test failed', error);
    }
  });

  const addLog = (level: LogEntry['level'], service: string, message: string, details?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      details
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';  
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (recentLogs) {
      setLogs(prev => [...recentLogs, ...prev]);
    }
  }, [recentLogs]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">System Logs & Monitoring</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                refetchStatus();
                refetchLogs();
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="test">Test Communications</TabsTrigger>
          <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Database Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${systemStatus?.services?.database?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {systemStatus?.services?.database?.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  SQL Server: {systemStatus?.services?.database?.host || 'Unknown'}
                </p>
              </CardContent>
            </Card>

            {/* Kaleyra SMS Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kaleyra SMS</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${systemStatus?.services?.sms?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {systemStatus?.services?.sms?.status === 'connected' ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStatus?.services?.sms?.message || 'Status unknown'}
                </p>
              </CardContent>
            </Card>

            {/* Email Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email (SMTP)</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${systemStatus?.services?.email?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm">
                    {systemStatus?.services?.email?.status === 'connected' ? 'Configured' : 'Needs Setup'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStatus?.services?.email?.message || 'Status unknown'}
                </p>
                {systemStatus?.services?.email?.status !== 'connected' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={() => setShowSmtpForm(!showSmtpForm)}
                  >
                    {showSmtpForm ? 'Hide Setup' : 'Configure SMTP'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* WhatsApp Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${systemStatus?.services?.whatsapp?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm">
                    {systemStatus?.services?.whatsapp?.status === 'connected' ? 'Configured' : 'Needs Setup'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStatus?.services?.whatsapp?.message || 'Status unknown'}
                </p>
              </CardContent>
            </Card>

            {/* Template System Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Template System</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Active</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Templates: {systemStatus?.services?.templates?.count || 0} configured
                </p>
              </CardContent>
            </Card>

            {/* Server Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uptime: {systemStatus?.system?.uptime || 'Unknown'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SMTP Configuration Form */}
          {showSmtpForm && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Email SMTP</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Set up SMTP credentials to enable email notifications for registrations, claims, and payouts.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.gmail.com"
                        value={smtpConfig.host}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-port">Port</Label>
                      <Input
                        id="smtp-port"
                        placeholder="587"
                        value={smtpConfig.port}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="smtp-user">Email Address</Label>
                    <Input
                      id="smtp-user"
                      placeholder="noreply@yourcompany.com"
                      value={smtpConfig.user}
                      onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      placeholder="App password or email password"
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Gmail Setup Instructions:</p>
                      <ol className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>1. Enable 2-factor authentication on your Google account</li>
                        <li>2. Go to Google Account → Security → App passwords</li>
                        <li>3. Generate an app password for "Mail"</li>
                        <li>4. Use smtp.gmail.com, port 587, your Gmail address, and the app password</li>
                      </ol>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Outlook/Hotmail Setup Instructions:</p>
                      <ol className="text-xs text-green-700 mt-1 space-y-1">
                        <li>1. Enable 2-factor authentication on your Microsoft account</li>
                        <li>2. Go to Microsoft Account → Security → Advanced security options → App passwords</li>
                        <li>3. Generate an app password for "Mail"</li>
                        <li>4. Use smtp-mail.outlook.com, port 587, your Outlook email, and the app password</li>
                      </ol>
                      <p className="text-xs text-green-600 mt-2 font-medium">
                        ⚠️ Regular passwords don't work - you MUST use an app password!
                      </p>
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        🔒 If you see "account locked" errors, wait 15-30 minutes before trying again.
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Alternative: Use Gmail for Testing</p>
                      <ol className="text-xs text-yellow-700 mt-1 space-y-1">
                        <li>1. Create a free Gmail account if you don't have one</li>
                        <li>2. Enable 2-factor authentication on the Gmail account</li>
                        <li>3. Generate an app password for "Mail"</li>
                        <li>4. Use smtp.gmail.com, port 587, Gmail address, and app password</li>
                        <li>5. This is often easier and more reliable for SMTP setup</li>
                      </ol>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => configureSMTPMutation.mutate()}
                      disabled={configureSMTPMutation.isPending || !smtpConfig.host || !smtpConfig.user || !smtpConfig.password}
                      className="flex-1"
                    >
                      {configureSMTPMutation.isPending ? 'Testing...' : 'Test & Save Configuration'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowSmtpForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="test">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    value={testContact.name}
                    onChange={(e) => setTestContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testContact.email}
                    onChange={(e) => setTestContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={testContact.phone}
                    onChange={(e) => setTestContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Custom Test Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom message for SMS test..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => testCommunicationMutation.mutate()}
                  disabled={testCommunicationMutation.isPending}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {testCommunicationMutation.isPending ? 'Testing...' : 'Test All Channels'}
                </Button>
                
                <Button
                  onClick={() => testSMSMutation.mutate()}
                  disabled={testSMSMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {testSMSMutation.isPending ? 'Sending...' : 'Test SMS Only'}
                </Button>
                
                <Button
                  onClick={() => testTemplatesMutation.mutate()}
                  disabled={testTemplatesMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {testTemplatesMutation.isPending ? 'Testing...' : 'Test All Templates'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Real-time System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No logs yet. Run some tests to see activity here.
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className={`mt-0.5 ${getLevelColor(log.level)}`}>
                          {getLevelIcon(log.level)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {log.service}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{log.message}</p>
                          {log.details && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer text-muted-foreground">
                                View Details
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}