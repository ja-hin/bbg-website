import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  Shield, 
  Users, 
  Smartphone, 
  FileText, 
  AlertCircle, 
  IndianRupee,
  LogOut,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface DashboardStats {
  stats: {
    totalDistributors: number;
    totalCustomers: number;
    totalClaims: number;
    pendingClaims: number;
    totalRevenue: number;
    recentCustomers: any[];
    recentClaims: any[];
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  const { data: adminUser, isLoading: adminLoading, error: adminError } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!adminLoading && (adminError || !adminUser)) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin panel",
        variant: "destructive"
      });
      setLocation("/admin/login");
    }
  }, [adminLoading, adminError, adminUser, setLocation, toast]);

  // Dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    enabled: !!adminUser,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0 // Always consider data stale to force fresh fetch
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      setLocation("/admin/login");
    }
  });

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BBG Admin Panel</h1>
                  <p className="text-sm text-gray-500">Welcome, {adminUser.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Shield className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/masters">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Database className="h-4 w-4 mr-2" />
                    Masters
                  </Button>
                </Link>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboardStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Distributors</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalDistributors || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Smartphone className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalCustomers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalClaims || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.pendingClaims || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <IndianRupee className="h-8 w-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.stats.totalRevenue || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Failed to load dashboard statistics. Please refresh the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}