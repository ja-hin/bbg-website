import { useQuery } from '@tanstack/react-query';
import { CustomerLayout, useCustomerAuth } from '@/components/customer/customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Calendar, Shield, Package, ClipboardList } from 'lucide-react';

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
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Account Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Phone Verification</p>
                      <p className="text-xs text-gray-500">Your phone is verified via OTP</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Session Security</p>
                      <p className="text-xs text-gray-500">Your session is encrypted and secure</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-100">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              {orders.length === 0 && claims.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity to show.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: any, index: number) => (
                    <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Registered {order.brand} {order.modelName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.registrationDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {claims.slice(0, 2).map((claim: any) => (
                    <div key={claim.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Claimed ₹{claim.claimAmount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(claim.createdAt).toLocaleDateString('en-IN')} • {claim.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}
