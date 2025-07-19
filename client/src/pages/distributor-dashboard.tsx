import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useDistributorAuth, 
  useDistributorStats, 
  useDistributorCustomers, 
  useDistributorPayouts 
} from "@/hooks/useDistributorAuth";
import { 
  Users, 
  Wallet, 
  Clock, 
  CheckCircle, 
  LogOut, 
  Copy,
  Phone,
  Mail,
  Calendar,
  Smartphone,
  Laptop,
  IndianRupee
} from "lucide-react";

export default function DistributorDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { distributor, isLoading, isAuthenticated, logout, isLogoutLoading } = useDistributorAuth();
  const { data: stats, isLoading: statsLoading } = useDistributorStats();
  const { data: customers, isLoading: customersLoading } = useDistributorCustomers();
  const { data: payouts, isLoading: payoutsLoading } = useDistributorPayouts();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/distributor/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  const copySellerCode = () => {
    if (distributor?.sellerCode) {
      navigator.clipboard.writeText(distributor.sellerCode);
      toast({
        title: "Copied!",
        description: "Seller code copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !distributor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {distributor.name}!</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={isLogoutLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLogoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Distributor Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Distributor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-semibold">{distributor.name}</p>
              </div>
              {distributor.businessName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Name</p>
                  <p className="text-lg font-semibold">{distributor.businessName}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="text-lg font-semibold">{distributor.contact}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Seller Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                    {distributor.sellerCode}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copySellerCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.totalCustomers || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statsLoading ? "..." : `₹${stats?.totalEarnings || 0}`}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {statsLoading ? "..." : `₹${stats?.pendingPayouts || 0}`}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Payouts</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {statsLoading ? "..." : `₹${stats?.completedPayouts || 0}`}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Customers and Payouts */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Customer Registrations</TabsTrigger>
            <TabsTrigger value="payouts">Commission Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Registrations</CardTitle>
                <p className="text-sm text-gray-600">
                  Customers who registered using your seller code: {distributor.sellerCode}
                </p>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading customers...</p>
                  </div>
                ) : !customers || customers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No customers found</p>
                    <p className="text-sm text-gray-500">Share your seller code to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customers.map((customer: any) => (
                      <div key={customer.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold">{customer.name}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Phone className="w-3 h-3" />
                              {customer.contact}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {customer.deviceType === 'mobile' ? (
                                <Smartphone className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Laptop className="w-4 h-4 text-green-600" />
                              )}
                              <span className="font-medium">{customer.brand} {customer.modelName}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Invoice Value: ₹{customer.invoiceValue}
                            </p>
                            <p className="text-xs text-gray-500">
                              Voucher: {customer.voucherCode}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={customer.isVerified ? "default" : "secondary"}>
                              {customer.isVerified ? "Verified" : "Pending"}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              Commission: ₹25
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Commission Payouts</CardTitle>
                <p className="text-sm text-gray-600">
                  Track your commission payments and their status
                </p>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading payouts...</p>
                  </div>
                ) : !payouts || payouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payouts yet</p>
                    <p className="text-sm text-gray-500">Payouts will appear here once customers complete registration</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payouts.map((payout: any) => (
                      <div key={payout.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-lg">₹{payout.amount}</span>
                              <Badge 
                                variant={
                                  payout.status === 'paid' ? 'default' : 
                                  payout.status === 'processing' ? 'secondary' : 
                                  'outline'
                                }
                              >
                                {payout.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Customer: {payout.customer.name} ({payout.customer.contact})
                            </p>
                            <p className="text-sm text-gray-600">
                              Device: {payout.customer.brand} {payout.customer.modelName}
                            </p>
                            {payout.paymentReference && (
                              <p className="text-xs text-gray-500 mt-1">
                                Ref: {payout.paymentReference}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>
                              {payout.paidAt ? 
                                new Date(payout.paidAt).toLocaleDateString() :
                                new Date(payout.createdAt).toLocaleDateString()
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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