import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Database, Users, Smartphone, FileText, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin-header";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

function AdminMastersPage() {
  const [, setLocation] = useLocation();

  // Check admin authentication
  const { data: adminUser, isLoading: adminLoading, error: adminError } = useQuery({
    queryKey: ['/api/admin/me'],
    retry: 1,
    retryDelay: 1000
  });

  useEffect(() => {
    // Only redirect to login if we have a definitive authentication failure (401 or 403)
    if (!adminLoading && !adminUser && adminError) {
      const errorResponse = adminError as any;
      if (errorResponse?.response?.status === 401 || errorResponse?.response?.status === 403) {
        setLocation('/admin/login');
      }
    }
  }, [adminUser, adminLoading, adminError, setLocation]);

  if (adminLoading || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader adminUser={adminUser} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
          <p className="text-gray-600 mt-2">Configure and manage system master data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brands Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brand & Model Management</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Brands & Models</div>
              <p className="text-xs text-muted-foreground mb-4">
                Manage device brands and their models for customer registration
              </p>
              <Link href="/admin/brands">
                <Button className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Manage Brands
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Roles Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Admin Roles</div>
              <p className="text-xs text-muted-foreground mb-4">
                Configure admin user roles and permissions
              </p>
              <Button className="w-full" variant="outline" disabled>
                <Users className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Device Categories */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Device Categories</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Categories</div>
              <p className="text-xs text-muted-foreground mb-4">
                Manage device types and their configurations
              </p>
              <Button className="w-full" variant="outline" disabled>
                <Smartphone className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Claim Templates */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claim Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Templates</div>
              <p className="text-xs text-muted-foreground mb-4">
                Configure claim processing templates and rules
              </p>
              <Button className="w-full" variant="outline" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Settings</div>
              <p className="text-xs text-muted-foreground mb-4">
                Configure system-wide settings and parameters
              </p>
              <Button className="w-full" variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Back to Dashboard */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboard</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Overview</div>
              <p className="text-xs text-muted-foreground mb-4">
                Return to the main admin dashboard
              </p>
              <Link href="/admin/dashboard">
                <Button className="w-full" variant="secondary">
                  <Database className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminMastersPage;