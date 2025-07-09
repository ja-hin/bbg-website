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
  LogOut,
  Check,
  X,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

interface Distributor {
  id: number;
  name: string;
  businessName?: string;
  contact: string;
  email: string;
  sellerCode: string;
  isVerified: boolean;
  createdAt: string;
}

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  deviceType: string;
  brand: string;
  modelName: string;
  voucherCode: string;
  isVerified: boolean;
  createdAt: string;
}

interface Claim {
  id: number;
  voucherCode: string;
  contact: string;
  email: string;
  claimAmount: number;
  claimPercentage: number;
  status: string;
  createdAt: string;
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



  const { data: distributors, isLoading: distributorsLoading } = useQuery<Distributor[]>({
    queryKey: ["/api/admin/distributors"],
    enabled: !!adminUser
  });

  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    enabled: !!adminUser
  });

  const { data: claims, isLoading: claimsLoading } = useQuery<Claim[]>({
    queryKey: ["/api/admin/claims"],
    enabled: !!adminUser
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/logout", {
        method: "POST"
      });
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

  // Update claim status mutation
  const updateClaimMutation = useMutation({
    mutationFn: async ({ claimId, status }: { claimId: number; status: string }) => {
      return apiRequest(`/api/admin/claims/${claimId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({
        title: "Claim Updated",
        description: "Claim status has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update claim status",
        variant: "destructive"
      });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BBG Admin Panel</h1>
                <p className="text-sm text-gray-500">Welcome, {adminUser.username}</p>
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

        {/* Tabs for different sections */}
        <Tabs defaultValue="distributors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distributors">Distributors</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>

          {/* Distributors Tab */}
          <TabsContent value="distributors">
            <Card>
              <CardHeader>
                <CardTitle>Distributors</CardTitle>
                <CardDescription>Manage distributor accounts and verify registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {distributorsLoading ? (
                  <p>Loading distributors...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Seller Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributors?.map((distributor) => (
                          <TableRow key={distributor.id}>
                            <TableCell className="font-medium">{distributor.name}</TableCell>
                            <TableCell>{distributor.businessName || '-'}</TableCell>
                            <TableCell>{distributor.contact}</TableCell>
                            <TableCell>{distributor.email}</TableCell>
                            <TableCell className="font-mono">{distributor.sellerCode}</TableCell>
                            <TableCell>
                              {distributor.isVerified ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-700 border-orange-300">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(distributor.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>View and manage customer registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <p>Loading customers...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Brand & Model</TableHead>
                          <TableHead>Voucher Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers?.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.contact}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.deviceType}</Badge>
                            </TableCell>
                            <TableCell>{customer.brand} {customer.modelName}</TableCell>
                            <TableCell className="font-mono">{customer.voucherCode}</TableCell>
                            <TableCell>
                              {customer.isVerified ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-700 border-orange-300">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(customer.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Claims</CardTitle>
                <CardDescription>Review and manage BBG claim requests</CardDescription>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <p>Loading claims...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Code</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Claim Amount</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claims?.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell className="font-mono">{claim.voucherCode}</TableCell>
                            <TableCell>{claim.contact}</TableCell>
                            <TableCell>{claim.email}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(claim.claimAmount)}</TableCell>
                            <TableCell>{claim.claimPercentage}%</TableCell>
                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                            <TableCell>{formatDate(claim.createdAt)}</TableCell>
                            <TableCell>
                              {claim.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'approved' })}
                                    disabled={updateClaimMutation.isPending}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'rejected' })}
                                    disabled={updateClaimMutation.isPending}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}