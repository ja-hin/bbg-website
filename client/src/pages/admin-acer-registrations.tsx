import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/admin-layout";
import { 
  Search, 
  Eye, 
  Download, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Smartphone, 
  Laptop,
  User,
  CreditCard,
  FileText,
  Building,
  CheckCircle
} from "lucide-react";

interface AcerRegistration {
  id: number;
  registration_id: string;
  device_type: string;
  imei_serial: string;
  brand: string;
  name: string;
  model: string;
  email: string;
  phone: string;
  purchase_price: string;
  alternate_phone?: string;
  purchase_date: string;
  address_line1: string;
  address_line2?: string;
  invoice_file_path?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminAcerRegistrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<AcerRegistration | null>(null);

  const { data: registrations = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/acer-registrations"],
  });

  const filteredRegistrations = registrations.filter((reg: AcerRegistration) =>
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.includes(searchTerm) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const handleDownloadData = () => {
    const csvContent = [
      [
        'Registration ID', 'Name', 'Device Type', 'Brand', 'Model', 'IMEI/Serial',
        'Email', 'Phone', 'Alternate Phone', 'Purchase Price', 'Purchase Date',
        'Address Line 1', 'Address Line 2', 'Status', 'Registration Date'
      ],
      ...filteredRegistrations.map((reg: AcerRegistration) => [
        reg.registration_id,
        reg.name,
        reg.device_type,
        reg.brand,
        reg.model,
        reg.imei_serial,
        reg.email,
        reg.phone,
        reg.alternate_phone || '',
        reg.purchase_price,
        formatDate(reg.purchase_date),
        reg.address_line1,
        reg.address_line2 || '',
        reg.status,
        formatDate(reg.created_at)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Acer BBG Registrations</h1>
            <p className="text-muted-foreground">
              Manage and view all Acer device BBG registrations
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
            <Button onClick={handleDownloadData} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registrations.filter((reg: AcerRegistration) => reg.device_type === 'mobile').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laptop Devices</CardTitle>
              <Laptop className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registrations.filter((reg: AcerRegistration) => reg.device_type === 'laptop').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{registrations.reduce((sum: number, reg: AcerRegistration) => 
                  sum + parseFloat(reg.purchase_price || '0'), 0
                ).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, registration ID, phone, email, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Acer Registrations ({filteredRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No registrations found matching your search.' : 'No Acer registrations yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Registration ID</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Device</th>
                      <th className="text-left p-4 font-medium">Purchase Price</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((registration: AcerRegistration) => (
                      <tr key={registration.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-mono text-sm">{registration.registration_id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{registration.name}</div>
                          <div className="text-sm text-gray-500">{registration.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {registration.device_type === 'mobile' ? (
                              <Smartphone className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Laptop className="h-4 w-4 text-purple-600" />
                            )}
                            <div>
                              <div className="font-medium">{registration.brand} {registration.model}</div>
                              <div className="text-sm text-gray-500 capitalize">{registration.device_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{formatPrice(registration.purchase_price)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{formatDate(registration.created_at)}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(registration.status)}>
                            {registration.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRegistration(registration)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>Acer Registration Details</DialogTitle>
                              </DialogHeader>
                              {selectedRegistration && (
                                <ScrollArea className="max-h-[70vh]">
                                  <div className="space-y-6 p-4">
                                    {/* Registration Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <h3 className="font-semibold mb-3 flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Customer Information
                                          </h3>
                                          <div className="space-y-2 text-sm">
                                            <div><strong>Name:</strong> {selectedRegistration.name}</div>
                                            <div className="flex items-center">
                                              <Mail className="h-3 w-3 mr-2" />
                                              {selectedRegistration.email}
                                            </div>
                                            <div className="flex items-center">
                                              <Phone className="h-3 w-3 mr-2" />
                                              {selectedRegistration.phone}
                                            </div>
                                            {selectedRegistration.alternate_phone && (
                                              <div className="flex items-center">
                                                <Phone className="h-3 w-3 mr-2" />
                                                {selectedRegistration.alternate_phone} (Alt)
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <h3 className="font-semibold mb-3 flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Address
                                          </h3>
                                          <div className="text-sm space-y-1">
                                            <div>{selectedRegistration.address_line1}</div>
                                            {selectedRegistration.address_line2 && (
                                              <div>{selectedRegistration.address_line2}</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <h3 className="font-semibold mb-3 flex items-center">
                                            {selectedRegistration.device_type === 'mobile' ? (
                                              <Smartphone className="h-4 w-4 mr-2" />
                                            ) : (
                                              <Laptop className="h-4 w-4 mr-2" />
                                            )}
                                            Device Information
                                          </h3>
                                          <div className="space-y-2 text-sm">
                                            <div><strong>Type:</strong> <span className="capitalize">{selectedRegistration.device_type}</span></div>
                                            <div><strong>Brand:</strong> {selectedRegistration.brand}</div>
                                            <div><strong>Model:</strong> {selectedRegistration.model}</div>
                                            <div><strong>IMEI/Serial:</strong> {selectedRegistration.imei_serial}</div>
                                          </div>
                                        </div>

                                        <div>
                                          <h3 className="font-semibold mb-3 flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Purchase Information
                                          </h3>
                                          <div className="space-y-2 text-sm">
                                            <div><strong>Price:</strong> {formatPrice(selectedRegistration.purchase_price)}</div>
                                            <div><strong>Date:</strong> {formatDate(selectedRegistration.purchase_date)}</div>
                                            <div><strong>Status:</strong> 
                                              <Badge className={`ml-2 ${getStatusColor(selectedRegistration.status)}`}>
                                                {selectedRegistration.status}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Registration Details */}
                                    <div>
                                      <h3 className="font-semibold mb-3 flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Registration Details
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><strong>Registration ID:</strong> <span className="font-mono">{selectedRegistration.registration_id}</span></div>
                                        <div><strong>Registration Date:</strong> {formatDate(selectedRegistration.created_at)}</div>
                                        {selectedRegistration.invoice_file_path && (
                                          <div><strong>Invoice:</strong> 
                                            <span className="text-blue-600 ml-1">File uploaded</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </ScrollArea>
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}