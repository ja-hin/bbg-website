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
  MapPin,
  X,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin-layout";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  stats: {
    totalDistributors: number;
    totalCustomers: number;
    totalRegistrations: number;
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
  pincode: string;
  deviceType: string;
  serialNumber: string;
  brand?: string;
  modelName: string;
  invoiceValue: number;
  voucherCode: string;
  isVerified: boolean;
  createdAt: string;
  sellerCode?: string;
  // Additional properties from grouped data
  registrationCount?: number;
  totalInvoiceValue?: number;
  allVoucherCodes?: string[];
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

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

  // Export customers to CSV function
  const exportCustomersToCSV = () => {
    window.open('/api/admin/export/customers', '_blank');
    toast({
      title: "Export Started",
      description: "Customer data export has been initiated. Download will start shortly.",
    });
  };

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
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 animate-pulse">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dashboardStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Referral Partners Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Referral Partners</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalDistributors || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalCustomers || 0}</p>
                    <p className="text-xs text-gray-500">
                      {dashboardStats.stats.totalRegistrations || 0} total registrations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Claims Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.totalClaims || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Claims Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.stats.pendingClaims || 0}</p>
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
                            {(customer.registrationCount || 0) > 1 && (
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
                <div className="flex items-center gap-4">
                  <Button
                    onClick={exportCustomersToCSV}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
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
                            <Badge variant="outline">
                              {customer.registrationCount || 1} {customer.registrationCount === 1 ? 'Registration' : 'Registrations'}
                            </Badge>
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                                    Customer Details - {selectedCustomer?.name}
                                  </DialogTitle>
                                </DialogHeader>
                                
                                {selectedCustomer && (
                                  <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Contact Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="font-medium">{selectedCustomer.contact}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{selectedCustomer.email}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{selectedCustomer.pincode}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <Badge variant={selectedCustomer.isVerified ? "default" : "secondary"}>
                                              {selectedCustomer.isVerified ? "Verified" : "Pending"}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Device Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex items-center">
                                            <Smartphone className="h-4 w-4 mr-2 text-gray-400" />
                                            <div>
                                              <div className="font-medium">{selectedCustomer.brand} {selectedCustomer.modelName}</div>
                                              <div className="text-sm text-gray-500 capitalize">{selectedCustomer.deviceType}</div>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-sm text-gray-500">Serial Number:</span>
                                            <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                                              {selectedCustomer.serialNumber}
                                            </div>
                                          </div>
                                          <div className="flex items-center">
                                            <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                                            <span className="font-medium">
                                              {formatCurrency(selectedCustomer.totalInvoiceValue || selectedCustomer.invoiceValue)}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Registration Summary */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Registration Summary</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                              {selectedCustomer.registrationCount || 1}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {selectedCustomer.registrationCount === 1 ? 'Registration' : 'Registrations'}
                                            </div>
                                          </div>
                                          <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                              {formatCurrency(selectedCustomer.totalInvoiceValue || selectedCustomer.invoiceValue)}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Value</div>
                                          </div>
                                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                              {formatDate(selectedCustomer.createdAt)}
                                            </div>
                                            <div className="text-sm text-gray-600">First Registration</div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Voucher Codes */}
                                    {selectedCustomer.allVoucherCodes && selectedCustomer.allVoucherCodes.length > 1 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">All Voucher Codes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {selectedCustomer.allVoucherCodes.map((code: string, index: number) => (
                                              <div key={index} className="bg-gray-100 p-3 rounded font-mono text-sm">
                                                {code}
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Referral Information */}
                                    {selectedCustomer.sellerCode && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Referral Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="flex items-center">
                                            <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-500 mr-2">Referral Code:</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                              {selectedCustomer.sellerCode}
                                            </code>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
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
    </AdminLayout>
  );
}