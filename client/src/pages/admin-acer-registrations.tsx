import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Calendar, User, CreditCard, FileText, ChevronDown, ChevronUp, ExternalLink, X } from "lucide-react";
import { format } from "date-fns";

interface AcerDevice {
  deviceType: string;
  brand: string;
  modelName: string;
  serialNumber: string;
  voucherCode: string;
}

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
  sellerCode: string | null;
  voucherCode: string;
  paymentIntentId: string | null;
  isVerified: boolean;
  claimValueSlabId: number;
  registrationSlabData: string;
  createdAt: string;
  registrationCount: number;
  totalInvoiceValue: number;
  allVoucherCodes: string[];
  devices: AcerDevice[];
}

export default function AdminAcerRegistrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [detailViewRegistration, setDetailViewRegistration] = useState<AcerRegistration | null>(null);

  const { data: registrations = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/acer-registrations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const toggleRowExpansion = (registrationId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(registrationId)) {
      newExpandedRows.delete(registrationId);
    } else {
      newExpandedRows.add(registrationId);
    }
    setExpandedRows(newExpandedRows);
  };

  const openDetailView = (registration: AcerRegistration) => {
    setDetailViewRegistration(registration);
  };

  const closeDetailView = () => {
    setDetailViewRegistration(null);
  };

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
      'Customer ID', 'Name', 'Contact', 'Email', 'Pincode', 'Device Type', 'Serial Number',
      'Brand', 'Model', 'Invoice Value (Individual)', 'Total Invoice Value', 'Purchase Date', 
      'Seller Code', 'Voucher Code', 'Payment Status', 'Verified', 'Registration Date', 'Registration Source'
    ];

    const csvData: string[][] = [];
    
    filteredRegistrations.forEach((reg: AcerRegistration) => {
      if (reg.devices && reg.devices.length > 0) {
        // Create one row per device
        reg.devices.forEach((device, idx) => {
          csvData.push([
            reg.id.toString(),
            reg.name,
            reg.contact,
            reg.email,
            reg.pincode,
            device.deviceType,
            device.serialNumber,
            device.brand,
            device.modelName,
            (reg.totalInvoiceValue / reg.devices!.length).toString(), // Individual device value
            reg.totalInvoiceValue.toString(), // Total customer value
            reg.dateOfPurchase,
            reg.sellerCode || 'N/A',
            device.voucherCode,
            reg.paymentIntentId ? 'Paid' : 'Pending',
            reg.isVerified ? 'Yes' : 'No',
            formatDate(reg.createdAt),
            'Acer BBG'
          ]);
        });
      } else {
        // Fallback for customers without devices array
        csvData.push([
          reg.id.toString(),
          reg.name,
          reg.contact,
          reg.email,
          reg.pincode,
          reg.deviceType,
          reg.serialNumber,
          reg.brand,
          reg.modelName,
          reg.invoiceValue.toString(),
          (reg.totalInvoiceValue || reg.invoiceValue).toString(),
          reg.dateOfPurchase,
          reg.sellerCode || 'N/A',
          reg.voucherCode,
          reg.paymentIntentId ? 'Paid' : 'Pending',
          reg.isVerified ? 'Yes' : 'No',
          formatDate(reg.createdAt),
          'Acer BBG'
        ]);
      }
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `acer-bbg-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                Error loading Acer registrations. Please try again.
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
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
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {registrations.reduce((sum: number, r: AcerRegistration) => sum + (r.registrationCount || r.devices?.length || 1), 0)} Devices Total
              </p>
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
              <p className="text-xs text-green-600 font-medium mt-1">
                {registrations.filter((r: AcerRegistration) => r.isVerified).reduce((sum: number, r: AcerRegistration) => sum + (r.registrationCount || r.devices?.length || 1), 0)} Verified Devices
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(registrations.reduce((sum: number, r: AcerRegistration) => sum + (r.totalInvoiceValue || r.invoiceValue || 0), 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BBG Codes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {registrations.reduce((sum: number, r: AcerRegistration) => sum + (r.allVoucherCodes?.length || 1), 0)}
              </div>
              <p className="text-xs text-purple-600 font-medium mt-1">Voucher Codes Generated</p>
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
                    <TableHead>Devices Registered</TableHead>
                    <TableHead>Purchase Details</TableHead>
                    <TableHead>BBG Codes</TableHead>
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
                            <div className="text-sm text-gray-400">PIN: {registration.pincode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-blue-600">
                                {registration.registrationCount || registration.devices?.length || 1} Device{(registration.registrationCount > 1 || (registration.devices && registration.devices.length > 1)) ? 's' : ''}
                              </div>
                              {registration.devices && registration.devices.length > 2 && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(registration.id)}
                                    className="h-6 px-2"
                                  >
                                    {expandedRows.has(registration.id) ? (
                                      <>
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                        Hide
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                        Expand
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDetailView(registration)}
                                    className="h-6 px-2"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View All
                                  </Button>
                                </div>
                              )}
                            </div>
                            {registration.devices?.slice(0, expandedRows.has(registration.id) ? registration.devices.length : 2).map((device, idx) => (
                              <div key={idx} className="text-sm border-l-2 border-blue-200 pl-2 mb-2">
                                <div className="font-medium">{device.brand} {device.modelName}</div>
                                <Badge variant="outline" className="text-xs mr-1">
                                  {device.deviceType}
                                </Badge>
                                <div className="text-xs font-mono text-gray-500">{device.serialNumber}</div>
                              </div>
                            ))}
                            {registration.devices && registration.devices.length > 2 && !expandedRows.has(registration.id) && (
                              <div className="text-xs text-gray-500">
                                +{registration.devices.length - 2} more device{registration.devices.length - 2 > 1 ? 's' : ''}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{formatCurrency(registration.totalInvoiceValue || registration.invoiceValue)}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {registration.dateOfPurchase}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-gray-600">
                                {registration.allVoucherCodes?.length || 1} Code{(registration.allVoucherCodes && registration.allVoucherCodes.length > 1) ? 's' : ''}
                              </div>
                              {registration.allVoucherCodes && registration.allVoucherCodes.length > 2 && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(registration.id)}
                                    className="h-6 px-2"
                                  >
                                    {expandedRows.has(registration.id) ? (
                                      <>
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                        Hide
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                        Expand
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDetailView(registration)}
                                    className="h-6 px-2"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View All
                                  </Button>
                                </div>
                              )}
                            </div>
                            {registration.allVoucherCodes?.slice(0, expandedRows.has(registration.id) ? registration.allVoucherCodes.length : 2).map((code, idx) => (
                              <div key={idx} className="font-mono text-xs bg-blue-50 px-2 py-1 rounded border mb-1">
                                {code}
                              </div>
                            ))}
                            {registration.allVoucherCodes && registration.allVoucherCodes.length > 2 && !expandedRows.has(registration.id) && (
                              <div className="text-xs text-gray-500">
                                +{registration.allVoucherCodes.length - 2} more code{registration.allVoucherCodes.length - 2 > 1 ? 's' : ''}...
                              </div>
                            )}
                            {registration.sellerCode && (
                              <div className="text-sm text-gray-500 mt-2">
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
                              {registration.isVerified ? "Verified" : "Pending"}
                            </Badge>
                            
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

        {/* Detail View Modal */}
        {detailViewRegistration && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Complete Device Registration Details</h2>
                  <p className="text-gray-600">{detailViewRegistration.name} - {detailViewRegistration.devices?.length || 1} Device{(detailViewRegistration.devices && detailViewRegistration.devices.length > 1) ? 's' : ''}</p>
                </div>
                <Button variant="ghost" onClick={closeDetailView}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Customer Information */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-medium">{detailViewRegistration.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <p className="font-medium">{detailViewRegistration.contact}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="font-medium">{detailViewRegistration.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pincode</label>
                      <p className="font-medium">{detailViewRegistration.pincode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Value</label>
                      <p className="font-medium">{formatCurrency(detailViewRegistration.totalInvoiceValue || detailViewRegistration.invoiceValue)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                      <p className="font-medium">{detailViewRegistration.dateOfPurchase}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Date</label>
                      <p className="font-medium">{formatDate(detailViewRegistration.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={detailViewRegistration.isVerified ? "default" : "secondary"} className={detailViewRegistration.isVerified ? "bg-green-600" : ""}>
                        {detailViewRegistration.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Devices Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Registered Devices</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Device Type</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>BBG Voucher Code</TableHead>
                          <TableHead>Individual Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailViewRegistration.devices?.map((device, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{device.deviceType}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{device.brand}</TableCell>
                            <TableCell>{device.modelName}</TableCell>
                            <TableCell className="font-mono text-sm">{device.serialNumber}</TableCell>
                            <TableCell>
                              <div className="font-mono text-xs bg-blue-50 px-2 py-1 rounded border">
                                {device.voucherCode}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency((detailViewRegistration.totalInvoiceValue || detailViewRegistration.invoiceValue) / (detailViewRegistration.devices?.length || 1))}
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>
                              <Badge variant="outline">{detailViewRegistration.deviceType}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{detailViewRegistration.brand}</TableCell>
                            <TableCell>{detailViewRegistration.modelName}</TableCell>
                            <TableCell className="font-mono text-sm">{detailViewRegistration.serialNumber}</TableCell>
                            <TableCell>
                              <div className="font-mono text-xs bg-blue-50 px-2 py-1 rounded border">
                                {detailViewRegistration.voucherCode}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(detailViewRegistration.invoiceValue)}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Additional Information */}
                {detailViewRegistration.sellerCode && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                    <div className="p-3 bg-gray-50 rounded">
                      <label className="text-sm font-medium text-gray-500">Seller Code</label>
                      <p className="font-medium">{detailViewRegistration.sellerCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}