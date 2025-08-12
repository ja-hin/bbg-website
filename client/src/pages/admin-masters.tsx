import { Link } from "wouter";
import { Database, Users, Smartphone, FileText, Settings, DollarSign, MessageSquare, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin-layout";

function AdminMastersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
          <p className="text-gray-600 mt-2">Configure and manage system master data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brands Management */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brand & Model Management</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">Brands & Models</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
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

          {/* Admin Users Management */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">Admin Users</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Manage admin users and their access permissions
              </p>
              <Link href="/admin/admin-users">
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Admin Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Claim Value Slabs */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claim Value Slabs</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">Value Slabs</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Configure claim value percentage slabs for different device ages
              </p>
              <Link href="/admin/claim-value-slabs">
                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Manage Value Slabs
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Communication Templates */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communication Templates</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">Templates</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Manage email, SMS and WhatsApp message templates
              </p>
              <Link href="/admin/templates">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Manage Templates
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Theme Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">Themes</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Configure application theme colors and appearance
              </p>
              <Link href="/admin/theme-settings">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Themes
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* SMTP Settings */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SMTP Settings</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">Email Config</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Configure SMTP settings for email communications
              </p>
              <Link href="/admin/smtp-settings">
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage SMTP
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* WhatsApp Settings */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp Settings</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="text-2xl font-bold mb-2">WhatsApp API</div>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Configure WhatsApp Business API for messaging
              </p>
              <Link href="/admin/whatsapp-settings">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Manage WhatsApp
                </Button>
              </Link>
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
    </AdminLayout>
  );
}

export default AdminMastersPage;