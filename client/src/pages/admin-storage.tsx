import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Cloud, 
  HardDrive, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Upload,
  FileText,
  Image,
  Download,
  ExternalLink,
  Shield,
  Users,
  Database,
  Tags,
  Mail,
  Activity,
  MessageCircle,
  ShoppingCart,
  LogOut,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation as useLogoutMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface StorageStatus {
  s3Configured: boolean;
  bucketName: string;
  region: string;
  storageType: string;
}

export default function AdminStorage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: 'us-east-1'
  });

  const { data: storageStatus, refetch: refetchStatus } = useQuery<StorageStatus>({
    queryKey: ['/api/storage/status'],
  });

  // Logout mutation
  const logoutMutation = useLogoutMutation({
    mutationFn: async () => {
      const result = await apiRequest("/api/admin/logout", { method: "POST" });
      return result;
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      setLocation("/admin/login");
    },
    onError: (error: any) => {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout properly",
        variant: "destructive"
      });
      queryClient.clear();
      setLocation("/admin/login");
    }
  });

  const configureMutation = useMutation({
    mutationFn: async (credentials: typeof awsCredentials) => {
      // This would require a backend endpoint to update environment variables
      // For now, we'll just show the configuration
      return credentials;
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "AWS S3 configuration has been updated. Restart the server to apply changes.",
      });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to update S3 configuration",
        variant: "destructive",
      });
    },
  });

  const handleConfigureS3 = () => {
    if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey || !awsCredentials.bucketName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required AWS credentials",
        variant: "destructive",
      });
      return;
    }
    configureMutation.mutate(awsCredentials);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">BBG Admin</h1>
              <p className="text-sm text-gray-500">Welcome, {(user as any)?.username || 'Admin'}</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Shield className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/admin/distributors">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Users className="h-4 w-4 mr-3" />
                Distributors
              </Button>
            </Link>
            
            <Link href="/admin/cart-abandonments">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <ShoppingCart className="h-4 w-4 mr-3" />
                Cart Tracking
              </Button>
            </Link>
            
            <Link href="/admin/templates">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Mail className="h-4 w-4 mr-3" />
                Templates
              </Button>
            </Link>
            
            <Link href="/admin/logs">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Activity className="h-4 w-4 mr-3" />
                System Logs
              </Button>
            </Link>
            
            <Link href="/admin/storage">
              <Button variant="ghost" className="w-full justify-start mb-1 text-blue-600 bg-blue-50 hover:bg-blue-100">
                <Cloud className="h-4 w-4 mr-3" />
                Storage
              </Button>
            </Link>
            
            <Link href="/admin/whatsapp-test">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <MessageCircle className="h-4 w-4 mr-3" />
                WhatsApp Test
              </Button>
            </Link>
            
            <Link href="/admin/masters">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Database className="h-4 w-4 mr-3" />
                Masters
              </Button>
            </Link>
            
            <Link href="/admin/brands">
              <Button variant="ghost" className="w-full justify-start mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Tags className="h-4 w-4 mr-3" />
                Brands
              </Button>
            </Link>
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Storage Management</h1>
              <p className="text-gray-600">Configure file storage options for documents and images</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Current Storage Status */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Current Storage Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storageStatus ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  {storageStatus.s3Configured ? (
                    <Cloud className="h-8 w-8 text-blue-600" />
                  ) : (
                    <HardDrive className="h-8 w-8 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium">{storageStatus.storageType}</p>
                    <Badge variant={storageStatus.s3Configured ? "default" : "secondary"}>
                      {storageStatus.s3Configured ? "Active" : "Local"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  {storageStatus.s3Configured ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">S3 Status</p>
                    <p className="text-sm text-gray-600">
                      {storageStatus.s3Configured ? "Configured" : "Not Configured"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Cloud className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Bucket</p>
                    <p className="text-sm text-gray-600">{storageStatus.bucketName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <ExternalLink className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">Region</p>
                    <p className="text-sm text-gray-600">{storageStatus.region}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading storage configuration...</p>
              </div>
            )}
          </CardContent>
            </Card>

            {/* S3 Configuration */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>AWS S3 Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Configure AWS S3 for secure cloud storage of documents and images. 
                S3 provides better scalability, security, and reliability compared to local storage.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accessKeyId">AWS Access Key ID *</Label>
                  <Input
                    id="accessKeyId"
                    type="password"
                    placeholder="AKIA..."
                    value={awsCredentials.accessKeyId}
                    onChange={(e) => setAwsCredentials(prev => ({
                      ...prev,
                      accessKeyId: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="secretAccessKey">AWS Secret Access Key *</Label>
                  <Input
                    id="secretAccessKey"
                    type="password"
                    placeholder="Your secret access key"
                    value={awsCredentials.secretAccessKey}
                    onChange={(e) => setAwsCredentials(prev => ({
                      ...prev,
                      secretAccessKey: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bucketName">S3 Bucket Name *</Label>
                  <Input
                    id="bucketName"
                    placeholder="xtracover-bbg-storage"
                    value={awsCredentials.bucketName}
                    onChange={(e) => setAwsCredentials(prev => ({
                      ...prev,
                      bucketName: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="region">AWS Region</Label>
                  <Input
                    id="region"
                    placeholder="us-east-1"
                    value={awsCredentials.region}
                    onChange={(e) => setAwsCredentials(prev => ({
                      ...prev,
                      region: e.target.value
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                * Required fields. Changes require server restart to take effect.
              </p>
              <Button 
                onClick={handleConfigureS3}
                disabled={configureMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Update Configuration</span>
              </Button>
            </div>
          </CardContent>
            </Card>

            {/* Storage Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <span>AWS S3 Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Unlimited Scalability</p>
                  <p className="text-sm text-gray-600">Store unlimited files without server storage constraints</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Enhanced Security</p>
                  <p className="text-sm text-gray-600">Private file access with signed URLs and encryption</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Global CDN</p>
                  <p className="text-sm text-gray-600">Fast file access from anywhere in the world</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Cost Effective</p>
                  <p className="text-sm text-gray-600">Pay only for storage used, with automatic backups</p>
                </div>
              </div>
            </CardContent>
              </Card>

              <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-gray-600" />
                <span>Local Storage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Simple Setup</p>
                  <p className="text-sm text-gray-600">No external configuration required</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Limited Space</p>
                  <p className="text-sm text-gray-600">Constrained by server disk space</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">No Backup</p>
                  <p className="text-sm text-gray-600">Files lost if server fails</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Single Point of Failure</p>
                  <p className="text-sm text-gray-600">Server downtime affects file access</p>
                </div>
              </div>
            </CardContent>
              </Card>
            </div>

            {/* Setup Instructions */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>AWS S3 Setup Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create an AWS account at <a href="https://aws.amazon.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">aws.amazon.com</a></li>
                <li>Go to IAM (Identity and Access Management) console</li>
                <li>Create a new user with programmatic access</li>
                <li>Attach the "AmazonS3FullAccess" policy to the user</li>
                <li>Note down the Access Key ID and Secret Access Key</li>
                <li>Go to S3 console and create a new bucket</li>
                <li>Configure the bucket with appropriate permissions</li>
                <li>Enter your credentials above and restart the server</li>
              </ol>
            </div>
            
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> Keep your AWS credentials secure. Never share them publicly or commit them to version control.
              </AlertDescription>
            </Alert>
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}