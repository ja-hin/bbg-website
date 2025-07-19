import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Shield, 
  Users, 
  Smartphone, 
  FileText, 
  AlertCircle, 
  IndianRupee,
  ShoppingCart,
  Calendar,
  User,
  Phone,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminHeader } from "@/components/admin-header";
import { formatCurrency, formatDate } from "@/lib/utils";

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

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  deviceType: string;
  modelName: string;
  invoiceValue: string;
  voucherCode: string;
  isVerified: boolean;
  createdAt: string;
  sellerCode?: string;
}

interface PendingPayment {
  id: number;
  name: string;
  contact: string;
  email: string;
  deviceType: string;
  modelName: string;
  invoiceValue: string;
  paymentAmount: string;
  transactionId?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  const { data: adminUser, isLoading: adminLoading, error: adminError } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: 1,
    retryDelay: 1000
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    // Only redirect to login if we have a definitive authentication failure (401 or 403)
    if (!adminLoading && !adminUser && adminError) {
      const errorResponse = adminError as any;
      if (errorResponse?.response?.status === 401 || errorResponse?.response?.status === 403) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the admin panel",
          variant: "destructive"
        });
        setLocation("/admin/login");
      }
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

  // Fetch recent orders (customers)
  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    enabled: !!adminUser,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Fetch pending payments
  const { data: pendingPayments, isLoading: pendingLoading } = useQuery<PendingPayment[]>({
    queryKey: ["/api/admin/pending-payments"],
    enabled: !!adminUser,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
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
      <AdminHeader adminUser={adminUser} />

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

        {/* Recent Orders Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-1">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{order.name}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.contact}
                          </span>
                          <span className="flex items-center">
                            <Smartphone className="h-3 w-3 mr-1" />
                            {order.deviceType} - {order.modelName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{formatCurrency(order.invoiceValue)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        #{order.voucherCode}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Pending Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
              Payment Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-1">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingPayments && pendingPayments.length > 0 ? (
              <div className="space-y-4">
                {pendingPayments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{payment.name}</p>
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                            Payment Pending
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {payment.contact}
                          </span>
                          <span className="flex items-center">
                            <Smartphone className="h-3 w-3 mr-1" />
                            {payment.deviceType} - {payment.modelName}
                          </span>
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-400 mt-1">
                            Transaction: {payment.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-900">{formatCurrency(payment.paymentAmount)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      <div className="text-xs text-red-500 mt-1">
                        Expires: {formatDate(payment.expiresAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pending payments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}