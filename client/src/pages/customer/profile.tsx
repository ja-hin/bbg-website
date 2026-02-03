import { useQuery } from '@tanstack/react-query';
import { CustomerLayout, useCustomerAuth } from '@/components/customer/customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Calendar, Shield, Package, ClipboardList, Laptop, Smartphone, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CustomerProfilePage() {
  const { customerPhone, isAuthenticated } = useCustomerAuth();

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['/api/customer/orders', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/orders?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const { data: claims = [] } = useQuery<any[]>({
    queryKey: ['/api/customer/claims', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/claims?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const { data: bankDetails } = useQuery<any>({
    queryKey: ['/api/customer/bank-details', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/bank-details?phone=${customerPhone}`);
      if (!response.ok && response.status !== 404) throw new Error('Failed to fetch bank details');
      if (response.status === 404) return null;
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const customerName = orders.length > 0 ? orders[0].name : 'Customer';
  const customerEmail = orders.length > 0 ? orders[0].email : '';
  const firstOrderDate = orders.length > 0 
    ? new Date(orders[0].registrationDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const totalClaimValue = claims
    .filter((c: any) => c.status === 'approved' || c.status === 'paid')
    .reduce((sum: number, c: any) => sum + (c.claimAmount || 0), 0);

  const getStatusBadge = (order: any) => {
    if (order.claimStatus === 'approved' || order.claimStatus === 'paid') {
      return <Badge className="bg-purple-100 text-purple-700">Claimed</Badge>;
    }
    if (order.claimStatus === 'pending' || order.claimStatus === 'processing') {
      return <Badge className="bg-orange-100 text-orange-700">Claim Processing</Badge>;
    }
    if (order.isVerified) {
      return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
  };

  return (
    <CustomerLayout title="My Profile" description="Your account details and activity summary">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-[#254696] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{customerName}</h2>
              <Badge className="bg-green-100 text-green-700 mb-4">Active Customer</Badge>
              
              <div className="space-y-3 text-left mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">+91 {customerPhone}</span>
                </div>
                {customerEmail && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{customerEmail}</span>
                  </div>
                )}
                {firstOrderDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Customer since {firstOrderDate}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-xl border-gray-100">
              <CardContent className="p-4 text-center">
                <Package className="h-6 w-6 text-[#254696] mx-auto mb-2" />
                <p className="text-2xl font-black text-gray-900">{orders.length}</p>
                <p className="text-xs text-gray-500">Protected Devices</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-100">
              <CardContent className="p-4 text-center">
                <ClipboardList className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-gray-900">{claims.length}</p>
                <p className="text-xs text-gray-500">Total Claims</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-100">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-green-600">₹{totalClaimValue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Claims Received</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-100">
              <CardContent className="p-4 text-center">
                <div className={`h-6 w-6 rounded-full mx-auto mb-2 flex items-center justify-center ${bankDetails ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <div className={`h-3 w-3 rounded-full ${bankDetails ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <p className="text-sm font-bold text-gray-900">{bankDetails ? 'Complete' : 'Pending'}</p>
                <p className="text-xs text-gray-500">Bank Details</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <Link href="/customer/orders" className="text-xs font-bold text-[#254696] flex items-center gap-1 hover:underline">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-xs font-bold">Device Details</TableHead>
                      <TableHead className="text-xs font-bold">Voucher</TableHead>
                      <TableHead className="text-xs font-bold">Source</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.slice(0, 5).map((order: any) => {
                        const DeviceIcon = order.deviceType?.toLowerCase() === 'laptop' ? Laptop : Smartphone;
                        const sourceDisplay = order.registrationSource 
                          ? order.registrationSource.charAt(0).toUpperCase() + order.registrationSource.slice(1).toLowerCase()
                          : 'Website';
                        
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <DeviceIcon className="h-4 w-4 text-gray-400" />
                                <div className="text-[10px]">
                                  <p className="font-semibold text-gray-900">{order.brand}</p>
                                  <p className="text-gray-500">{order.modelName}</p>
                                  <p className="font-mono text-gray-400">IMEI: {order.serialNumber?.startsWith('AUTO_') ? '-' : order.serialNumber}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-[10px] text-[#254696]">
                              {order.voucherCode}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-200">
                                {sourceDisplay}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(order)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}
