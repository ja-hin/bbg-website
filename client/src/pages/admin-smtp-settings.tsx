import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AdminLayout } from '@/components/admin-layout';
import { Eye, EyeOff, Mail } from 'lucide-react';

interface SmtpSettings {
  id: number;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  fromAddress: string;
  isActive: boolean;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSmtpSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromAddress: ''
  });

  const [testEmail, setTestEmail] = useState('');
  const [showTestSection, setShowTestSection] = useState(false);

  // Get current SMTP settings
  const { data: smtpSettings, isLoading } = useQuery<SmtpSettings | null>({
    queryKey: ['/api/admin/smtp/current'],
    retry: false,
  });

  // Update form when data loads
  useEffect(() => {
    if (smtpSettings) {
      setFormData({
        smtpHost: smtpSettings.smtpHost || '',
        smtpPort: smtpSettings.smtpPort || 587,
        smtpUsername: smtpSettings.smtpUsername || '',
        smtpPassword: '', // Never pre-fill password for security
        fromAddress: smtpSettings.fromAddress || ''
      });
    }
  }, [smtpSettings]);

  // Update SMTP settings mutation
  const updateSmtpMutation = useMutation({
    mutationFn: async (settings: typeof formData) => {
      console.log('Sending SMTP settings:', settings);
      return await apiRequest('/api/admin/smtp/update', {
        method: 'POST',
        body: settings
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMTP settings updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/smtp/current'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update SMTP settings",
        variant: "destructive",
      });
    },
  });

  // Test SMTP settings mutation
  const testSmtpMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('/api/admin/smtp/test', {
        method: 'POST',
        body: { testEmail: email }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully! Check your inbox.",
        variant: "default",
      });
      setTestEmail('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.smtpHost || !formData.smtpUsername || !formData.fromAddress) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.fromAddress)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address for From Address",
        variant: "destructive",
      });
      return;
    }

    // If updating existing settings and password is empty, show warning
    if (smtpSettings && !formData.smtpPassword) {
      toast({
        title: "Warning",
        description: "Password field is empty. Enter password to update SMTP settings.",
        variant: "destructive",
      });
      return;
    }

    updateSmtpMutation.mutate(formData);
  };

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address to test",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    testSmtpMutation.mutate(testEmail);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-8 w-8 text-xtra-primary" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SMTP Email Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure SMTP settings for sending emails through AWS SES or other email providers
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Email Server Configuration</CardTitle>
          <CardDescription>
            {smtpSettings 
              ? 'Update your email server settings below' 
              : 'Configure your email server settings to enable email notifications'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host *</Label>
                <Input
                  id="smtpHost"
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                  placeholder="email-smtp.ap-south-1.amazonaws.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port *</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value) || 587)}
                  placeholder="587"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="smtpUsername">SMTP Username *</Label>
              <Input
                id="smtpUsername"
                type="text"
                value={formData.smtpUsername}
                onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                placeholder="AKIAW7BFAQICWUNNHW6T"
                required
              />
            </div>

            <div>
              <Label htmlFor="smtpPassword">SMTP Password *</Label>
              <div className="relative">
                <Input
                  id="smtpPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  placeholder={smtpSettings?.hasPassword ? "Enter new password to update" : "Enter SMTP password"}
                  required={!smtpSettings}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="fromAddress">From Email Address *</Label>
              <Input
                id="fromAddress"
                type="email"
                value={formData.fromAddress}
                onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                placeholder="no-reply@xtracover.com"
                required
              />
            </div>

            {smtpSettings && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Current Settings</h4>
                <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <div>Host: {smtpSettings.smtpHost}</div>
                  <div>Port: {smtpSettings.smtpPort}</div>
                  <div>Username: {smtpSettings.smtpUsername}</div>
                  <div>From: {smtpSettings.fromAddress}</div>
                  <div>Password: {smtpSettings.hasPassword ? '••••••••' : 'Not set'}</div>
                  <div>Status: {smtpSettings.isActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={updateSmtpMutation.isPending}
                className="flex-1 sm:flex-none bg-gradient-to-r from-xtra-primary to-xtra-secondary hover:opacity-90 text-white"
              >
                {updateSmtpMutation.isPending ? 'Updating...' : (smtpSettings ? 'Update Settings' : 'Save Settings')}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowTestSection(!showTestSection)}
                className="flex-1 sm:flex-none border-xtra-primary text-xtra-primary hover:bg-xtra-primary hover:text-white"
              >
                {showTestSection ? "Hide Test" : "Test SMTP"}
              </Button>
              
              {smtpSettings && (
                <Button type="button" variant="outline" onClick={() => {
                  setFormData({
                    smtpHost: smtpSettings.smtpHost || '',
                    smtpPort: smtpSettings.smtpPort || 587,
                    smtpUsername: smtpSettings.smtpUsername || '',
                    smtpPassword: '',
                    fromAddress: smtpSettings.fromAddress || ''
                  });
                }}>
                  Reset Form
                </Button>
              )}
            </div>
          </form>

          {/* Test Section */}
          {showTestSection && (
            <div className="mt-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold text-xtra-primary mb-4">Test SMTP Configuration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Send a test email to verify your SMTP settings are working correctly.
              </p>
              
              <form onSubmit={handleTestEmail} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to test"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-xtra-primary focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={testSmtpMutation.isPending || !testEmail}
                  className="px-6 py-2 bg-gradient-to-r from-xtra-secondary to-xtra-primary hover:opacity-90 text-white transition-all duration-200"
                >
                  {testSmtpMutation.isPending ? "Sending..." : "Send Test Email"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-6">
        <CardHeader>
          <CardTitle>AWS SES Configuration Guide</CardTitle>
          <CardDescription>
            Quick setup guide for Amazon Simple Email Service (SES)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <strong>1. SMTP Host:</strong> Use your AWS region's SES SMTP endpoint
            <div className="ml-4 text-gray-600 dark:text-gray-400">
              • US East (N. Virginia): email-smtp.us-east-1.amazonaws.com
              <br />
              • Asia Pacific (Mumbai): email-smtp.ap-south-1.amazonaws.com
            </div>
          </div>
          <div>
            <strong>2. Port:</strong> Use 587 for STARTTLS or 465 for SSL
          </div>
          <div>
            <strong>3. Credentials:</strong> Use your AWS SES SMTP credentials (not IAM credentials)
          </div>
          <div>
            <strong>4. From Address:</strong> Must be a verified domain or email in SES
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}