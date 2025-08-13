import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Calendar, User, Smartphone, FileText } from "lucide-react";
import { format } from "date-fns";

interface AcerRegistration {
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
  sellerCode: string;
  voucherCode: string;
  paymentIntentId: string;
  isVerified: boolean;
  registrationSource: string;
  createdAt: string;
}

export default function AdminAcerRegistrations() {
  const { isLoading: adminLoading, isAuthenticated } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: registrations = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/acer-registrations'],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthenticated, // Only fetch if authenticated
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

  const filteredRegistrations = registrations.filter((registration: AcerRegistration) =>
    registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.contact.includes(searchTerm) ||
    registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.voucherCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch {
      return dateString;
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Name', 'Contact', 'Email', 'Device Type', 'Serial Number',
      'Brand', 'Model', 'Invoice Value', 'Purchase Date', 'Seller Code',
      'Voucher Code', 'Payment Status', 'Verified', 'Registration Date'
    ];

    const csvData = filteredRegistrations.map((reg: AcerRegistration) => [
      reg.id,
      reg.name,
      reg.contact,
      reg.email,
      reg.deviceType,
      reg.serialNumber,
      reg.brand,
      reg.modelName,
      reg.invoiceValue,
      reg.dateOfPurchase,
      reg.sellerCode || 'N/A',
      reg.voucherCode,
      reg.paymentIntentId ? 'Paid' : 'Pending',
      reg.isVerified ? 'Yes' : 'No',
      formatDate(reg.createdAt)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `acer-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                Error loading Acer registrations. Please try again.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Acer BBG Registrations</h1>
            <p className="text-gray-600">Manage Acer-specific device registrations</p>
          </div>
          <Button onClick={exportToCSV} disabled={!filteredRegistrations.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {registrations.filter((r: AcerRegistration) => r.isVerified).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(registrations.reduce((sum: number, r: AcerRegistration) => sum + r.invoiceValue, 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Registrations</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {registrations.filter((r: AcerRegistration) => r.paymentIntentId).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Search by name, contact, email, serial number, or voucher code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Acer Registrations ({filteredRegistrations.length})</CardTitle>
            <CardDescription>
              {isLoading ? "Loading registrations..." : `Showing ${filteredRegistrations.length} of ${registrations.length} registrations`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Purchase Details</TableHead>
                    <TableHead>BBG Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading registrations...
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? "No registrations match your search" : "No Acer registrations found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration: AcerRegistration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{registration.name}</div>
                            <div className="text-sm text-gray-500">{registration.contact}</div>
                            <div className="text-sm text-gray-500">{registration.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{registration.brand} {registration.modelName}</div>
                            <div className="text-sm text-gray-500">
                              <Badge variant="outline" className="text-xs">
                                {registration.deviceType}
                              </Badge>
                            </div>
                            <div className="text-sm font-mono">{registration.serialNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{formatCurrency(registration.invoiceValue)}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {registration.dateOfPurchase}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {registration.voucherCode}
                            </div>
                            {registration.sellerCode && (
                              <div className="text-sm text-gray-500">
                                Seller: {registration.sellerCode}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge 
                              variant={registration.isVerified ? "default" : "secondary"}
                              className={registration.isVerified ? "bg-green-600" : ""}
                            >
                              {registration.isVerified ? "Verified" : "Unverified"}
                            </Badge>
                            <div>
                              <Badge 
                                variant={registration.paymentIntentId ? "default" : "destructive"}
                                className={registration.paymentIntentId ? "bg-blue-600" : ""}
                              >
                                {registration.paymentIntentId ? "Paid" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(registration.createdAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}