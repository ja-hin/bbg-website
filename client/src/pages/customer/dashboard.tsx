import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CustomerLayout, useCustomerAuth } from '@/components/customer/customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Package, ClipboardList, CreditCard, AlertTriangle, Banknote, ArrowRight, CheckCircle } from 'lucide-react';

export default function CustomerDashboardPage() {
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

  const ordersNeedingInvoice = orders.filter(o => !o.invoiceFile || o.invoiceFile === 'N/A');
  const hasBankDetails = !!bankDetails;
  const pendingClaims = claims.filter(c => c.status === 'pending' || c.status === 'processing');
  const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'paid');

  return (
    <CustomerLayout title="Dashboard" description="Overview of your BuyBack Guarantee account">
      {(ordersNeedingInvoice.length > 0 || !hasBankDetails) && (
        <div className="space-y-3 mb-6">
          {ordersNeedingInvoice.length > 0 && (
            <Alert className="bg-orange-50 border-orange-200 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800 font-bold text-sm">Invoice Upload Required</AlertTitle>
              <AlertDescription className="text-orange-700 text-sm">
                {ordersNeedingInvoice.length} registration(s) missing invoices.
                <Link href="/customer/orders">
                  <span className="ml-2 text-orange-800 underline font-semibold cursor-pointer">Upload Now</span>
                </Link>
              </AlertDescription>
            </Alert>
          )}
          {!hasBankDetails && (
            <Alert className="bg-blue-50 border-blue-200 rounded-xl">
              <Banknote className="h-4 w-4 text-[#254696]" />
              <AlertTitle className="text-[#254696] font-bold text-sm">Bank Details Missing</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm">
                Add bank details to receive claim payouts.
                <Link href="/customer/bank-details">
                  <span className="ml-2 text-[#254696] underline font-semibold cursor-pointer">Add Now</span>
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Protected Devices</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-[#254696]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Claims</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{claims.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending Claims</p>
                <p className="text-3xl font-black text-orange-600 mt-1">{pendingClaims.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Approved Claims</p>
                <p className="text-3xl font-black text-green-600 mt-1">{approvedClaims.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Orders</h3>
              <Link href="/customer/orders">
                <span className="text-sm text-[#254696] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  View All <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders yet. Protect your first device!</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{order.brand} {order.modelName}</p>
                      <p className="text-xs text-gray-500">{order.voucherCode}</p>
                    </div>
                    <Badge className={order.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {order.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Claims</h3>
              <Link href="/customer/claims">
                <span className="text-sm text-[#254696] font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                  View All <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
            {claims.length === 0 ? (
              <p className="text-gray-500 text-sm">No claims filed yet.</p>
            ) : (
              <div className="space-y-3">
                {claims.slice(0, 3).map((claim: any) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">₹{claim.claimAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{claim.voucherCode}</p>
                    </div>
                    <Badge className={
                      claim.status === 'approved' || claim.status === 'paid' ? 'bg-green-100 text-green-700' :
                      claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {claim.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-gray-100 mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/buy-bbg">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 rounded-xl border-gray-200 hover:border-[#254696] hover:bg-blue-50">
                <Package className="h-5 w-5 text-[#254696]" />
                <span className="text-xs font-medium">New Protection</span>
              </Button>
            </Link>
            <Link href="/customer/claims">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 rounded-xl border-gray-200 hover:border-[#254696] hover:bg-blue-50">
                <ClipboardList className="h-5 w-5 text-[#254696]" />
                <span className="text-xs font-medium">File Claim</span>
              </Button>
            </Link>
            <Link href="/customer/bank-details">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 rounded-xl border-gray-200 hover:border-[#254696] hover:bg-blue-50">
                <CreditCard className="h-5 w-5 text-[#254696]" />
                <span className="text-xs font-medium">Bank Details</span>
              </Button>
            </Link>
            <Link href="/customer/profile">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 rounded-xl border-gray-200 hover:border-[#254696] hover:bg-blue-50">
                <CreditCard className="h-5 w-5 text-[#254696]" />
                <span className="text-xs font-medium">My Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </CustomerLayout>
  );
}
