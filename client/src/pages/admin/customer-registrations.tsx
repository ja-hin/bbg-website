import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Smartphone, 
  Laptop, 
  Download,
  Filter,
  Search
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  pincode: string;
  deviceType: string;
  serialNumber: string;
  brand: string;
  modelName: string;
  invoiceValue: number;
  dateOfPurchase: string;
  sellerCode?: string;
  voucherCode: string;
  paymentIntentId?: string;
  isVerified: boolean;
  registrationSource: string;
  registrationSlabData?: string;
  createdAt: string;
  claimStatus?: string;
  claimId?: number;
  estimatedPayout?: number;
  deviceAge?: number;
  claimPercentage?: number;
}

export default function CustomerRegistrations() {
  const [dateTo, setDateTo] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customer registrations with filters
  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/customer-registrations", dateTo, deviceTypeFilter, statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateTo) params.set('dateTo', dateTo);
      if (deviceTypeFilter !== 'all') params.set('deviceType', deviceTypeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/admin/customer-registrations?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch customer registrations");
      return response.json();
    }
  });

  const customerList = Array.isArray(customers) ? customers : [];

  // Calculate total customers for display
  const totalCustomers = customerList.length;

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      'ID', 'Name', 'Contact', 'Email', 'Device Type', 'Brand', 'Model', 
      'Serial Number', 'Invoice Value', 'Purchase Date', 'Registration Date',
      'Voucher Code', 'Seller Code', 'Transaction ID', 'Registration Source', 'Device Age (Months)',
      'Claim Percentage', 'Estimated Payout', 'Claim Status', 'Verified'
    ];
    
    const csvContent = [
      headers.join(','),
      ...customerList.map((customer: Customer) => [
        customer.id,
        `"${customer.name}"`,
        customer.contact,
        customer.email,
        customer.deviceType,
        customer.brand,
        customer.modelName,
        customer.serialNumber,
        customer.invoiceValue,
        customer.dateOfPurchase,
        new Date(customer.createdAt).toLocaleDateString(),
        customer.voucherCode,
        customer.sellerCode || '',
        customer.paymentIntentId || 'N/A',
        customer.registrationSource,
        customer.deviceAge || 0,
        `${customer.claimPercentage || 0}%`,
        customer.estimatedPayout || 0,
        customer.claimStatus || 'No Claim',
        customer.isVerified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Registrations</h1>
          <p className="text-gray-600">
            Manage customer BBG registrations with payout calculations and claim tracking
          </p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reference Date for Payout Calculation */}
            <div className="space-y-2">
              <Label>Payout Calculation Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Leave empty for current date"
              />
              <p className="text-xs text-gray-500">
                Shows payouts as they would be on this date (based on device age)
              </p>
            </div>

            {/* Device Type Filter */}
            <div className="space-y-2">
              <Label>Device Type</Label>
              <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="laptop">Laptops</SelectItem>
                  <SelectItem value="mobile">Mobiles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Claim Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unclaimed">No Claims</SelectItem>
                  <SelectItem value="pending">Pending Claims</SelectItem>
                  <SelectItem value="approved">Approved Claims</SelectItem>
                  <SelectItem value="rejected">Rejected Claims</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Name, email, voucher code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDateTo("");
                setDeviceTypeFilter("all");
                setStatusFilter("all");
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Customer Table */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle>Customer Registrations ({totalCustomers})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : customerList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No customer registrations found for the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Details</TableHead>
                    <TableHead>Device Info</TableHead>
                    <TableHead>Purchase Details</TableHead>
                    <TableHead>Registration Info</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Device Age</TableHead>
                    <TableHead>Estimated Payout</TableHead>
                    <TableHead>Claim Status</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerList.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-sm text-gray-600">{customer.contact}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {customer.deviceType === 'laptop' ? 
                              <Laptop className="h-4 w-4" /> : 
                              <Smartphone className="h-4 w-4" />
                            }
                            <span className="font-medium">{customer.brand}</span>
                          </div>
                          <p className="text-sm text-gray-600">{customer.modelName}</p>
                          <p className="text-xs text-gray-500">SN: {customer.serialNumber}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{formatCurrency(customer.invoiceValue)}</p>
                          <p className="text-sm text-gray-600">{customer.dateOfPurchase}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-mono">{customer.voucherCode}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                          {customer.sellerCode && (
                            <Badge variant="outline" className="text-xs">
                              {customer.sellerCode}
                            </Badge>
                          )}
                          <Badge variant={customer.registrationSource === 'acer_bbg' ? 'default' : 'secondary'} className="text-xs">
                            {customer.registrationSource === 'acer_bbg' ? 'Acer BBG' : 'Regular'}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {customer.paymentIntentId ? (
                            <p className="text-sm font-mono text-blue-600">
                              {customer.paymentIntentId.length > 20 ? 
                                `${customer.paymentIntentId.substring(0, 20)}...` : 
                                customer.paymentIntentId
                              }
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">No Transaction</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {customer.paymentIntentId?.startsWith('free_') ? 'Free Registration' : 
                             customer.paymentIntentId?.startsWith('BBG_') ? 'PayU Payment' : 
                             customer.paymentIntentId ? 'Payment Completed' : 'Direct Entry'}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium">{customer.deviceAge || 0}</p>
                          <p className="text-xs text-gray-500">months</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium text-green-600">
                            {formatCurrency(customer.estimatedPayout || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.estimatedPayout ? 
                              `${Math.round((customer.estimatedPayout / customer.invoiceValue) * 100)}%` : 
                              'N/A'
                            }
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(customer.claimStatus || 'No Claim')}>
                          {customer.claimStatus || 'No Claim'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                          {customer.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}