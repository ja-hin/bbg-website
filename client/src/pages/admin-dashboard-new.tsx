import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  Smartphone, 
  FileText, 
  AlertCircle, 
  IndianRupee,
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminHeader } from "@/components/admin-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  stats: {
    totalDistributors: number;
    totalCustomers: number;
    totalClaims: number;
    pendingClaims: number;
    totalRevenue: number;
  };
}

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  deviceType: string;
  brand?: string;
  modelName: string;
  invoiceValue: number;
  voucherCode: string;
  isVerified: boolean;
  createdAt: string;
  sellerCode?: string;
}

interface Claim {
  id: number;
  customerId: number;
  voucherCode: string;
  contact: string;
  email: string;
  claimAmount: number;
  claimPercentage: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  deviceAgeMonths: number;
  createdAt: string;
}

interface Distributor {
  id: number;
  name: string;
  businessName?: string;
  contact: string;
  email: string;
  sellerCode: string;
  location: string;
  preferredMode: string;
  gstin?: string;
  commissionEarned: number;
  totalCustomers: number;
  createdAt: string;
}

export default function AdminDashboardNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and search
  const [customerSearch, setCustomerSearch] = useState("");
  const [claimFilter, setClaimFilter] = useState("all");
  const [distributorSearch, setDistributorSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Check admin authentication
  const { isLoading: adminLoading, isAuthenticated } = useRequireAuth();
  const { data: adminUser } = useQuery({
    queryKey: ["/api/admin/me"],
    enabled: isAuthenticated,
  });

  // Dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    enabled: !!adminUser,
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    enabled: !!adminUser,
  });

  // Fetch claims
  const { data: claims, isLoading: claimsLoading } = useQuery<Claim[]>({
    queryKey: ["/api/admin/claims"],
    enabled: !!adminUser,
  });

  // Fetch distributors
  const { data: distributors, isLoading: distributorsLoading } = useQuery<Distributor[]>({
    queryKey: ["/api/admin/distributors"],
    enabled: !!adminUser,
  });

  // Update claim status mutation
  const updateClaimMutation = useMutation({
    mutationFn: async ({ claimId, status }: { claimId: number; status: string }) => {
      return apiRequest(`/api/admin/claims/${claimId}/status`, {
        method: "PATCH",
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Claim status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update claim status", variant: "destructive" });
    }
  });

  if (adminLoading || !isAuthenticated) {
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
      <AdminHeader />

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
                    <p className="text-sm font-medium text-gray-600">Referral Partners</p>
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
                    <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalCustomers || 0}</p>
                    <p className="text-xs text-gray-500">
                      {dashboardStats.stats.totalRegistrations || 0} total registrations
                    </p>
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
        ) : null}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", name: "Overview", icon: Shield },
                { id: "customers", name: "Customers", icon: Users },
                { id: "claims", name: "Claims", icon: FileText },
                { id: "distributors", name: "Referral Partners", icon: ShoppingCart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : customers && customers.length > 0 ? (
                  <div className="space-y-4">
                    {customers.slice(0, 5).map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.contact} • {customer.deviceType}
                            {customer.registrationCount > 1 && (
                              <span className="ml-2 text-blue-600">
                                ({customer.registrationCount} registrations)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={customer.isVerified ? "default" : "secondary"}>
                            {customer.isVerified ? "Verified" : "Pending"}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatCurrency(customer.totalInvoiceValue || customer.invoiceValue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No customers found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Claims */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : claims && claims.length > 0 ? (
                  <div className="space-y-4">
                    {claims.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{claim.contact}</div>
                          <div className="text-sm text-gray-500">
                            Voucher: {claim.voucherCode} • Age: {claim.deviceAgeMonths} months
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            claim.status === 'approved' ? 'default' :
                            claim.status === 'pending' ? 'secondary' :
                            claim.status === 'paid' ? 'default' : 'destructive'
                          }>
                            {claim.status}
                          </Badge>
                          <div className="text-sm font-medium text-gray-900 mt-1">
                            ₹{claim.claimAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No claims found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Customer Management
                </CardTitle>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Registrations</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Primary Device</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers?.filter(customer => 
                        customerSearch === "" || 
                        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        customer.contact.includes(customerSearch) ||
                        (customer.allVoucherCodes && customer.allVoucherCodes.some((code: string) => 
                          code.toLowerCase().includes(customerSearch.toLowerCase())
                        ))
                      ).map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.contact}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {customer.registrationCount || 1} {customer.registrationCount === 1 ? 'Registration' : 'Registrations'}
                              </Badge>
                              {customer.registrationCount > 1 && (
                                <Button variant="ghost" size="sm" className="text-xs p-1 h-6">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View All
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                              {formatCurrency(customer.totalInvoiceValue || customer.invoiceValue)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Smartphone className="h-4 w-4 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{customer.brand} {customer.modelName}</div>
                                <div className="text-sm text-gray-500 capitalize">{customer.deviceType}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={customer.isVerified ? "default" : "secondary"}>
                              {customer.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(customer.createdAt)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Claims Tab */}
        {activeTab === "claims" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Claims Management
                </CardTitle>
                <Select value={claimFilter} onValueChange={setClaimFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Claims</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {claimsLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Voucher Code</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Device Age</TableHead>
                        <TableHead>Claim %</TableHead>
                        <TableHead>Claim Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Claim Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims?.filter(claim => 
                        claimFilter === "all" || claim.status === claimFilter
                      ).map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{claim.contact}</div>
                              <div className="text-sm text-gray-500">{claim.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {claim.voucherCode}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {claim.contact}
                            </div>
                          </TableCell>
                          <TableCell>{claim.deviceAgeMonths} months</TableCell>
                          <TableCell>{claim.claimPercentage}%</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                              {claim.claimAmount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              claim.status === 'approved' ? 'default' :
                              claim.status === 'pending' ? 'secondary' :
                              claim.status === 'paid' ? 'default' : 'destructive'
                            }>
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(claim.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {claim.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'approved' })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'rejected' })}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {claim.status === 'approved' && (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'paid' })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Distributors Tab */}
        {activeTab === "distributors" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                  Referral Partner Management
                </CardTitle>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search referral partners..."
                    value={distributorSearch}
                    onChange={(e) => setDistributorSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {distributorsLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referral Partner</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Referral Code</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Total Commission</TableHead>
                        <TableHead>Total Customers</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributors?.filter(distributor => 
                        distributorSearch === "" || 
                        distributor.name.toLowerCase().includes(distributorSearch.toLowerCase()) ||
                        distributor.contact.includes(distributorSearch) ||
                        distributor.sellerCode.toLowerCase().includes(distributorSearch.toLowerCase())
                      ).map((distributor) => (
                        <TableRow key={distributor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{distributor.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {distributor.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{distributor.businessName || 'Individual'}</div>
                              {distributor.gstin && (
                                <div className="text-sm text-gray-500">GSTIN: {distributor.gstin}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {distributor.contact}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {distributor.sellerCode}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              {distributor.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{distributor.preferredMode}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                              {distributor.commissionEarned.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              {distributor.totalCustomers}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(distributor.createdAt)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}