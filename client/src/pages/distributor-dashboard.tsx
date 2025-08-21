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
  IndianRupee,
  Shield,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
  User
} from "lucide-react";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

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
        description: "Referral code copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xtra-primary mx-auto"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Referral Dashboard</h1>
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
            <CardTitle>Your Referral Partner Information</CardTitle>
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
                <p className="text-sm font-medium text-gray-500">Referral Code</p>
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
            <TabsTrigger value="account">Account Details</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Registrations</CardTitle>
                <p className="text-sm text-gray-600">
                  Customers who registered using your referral code: {distributor.sellerCode}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {customer.deviceType === 'mobile' ? (
                                <Smartphone className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Laptop className="w-4 h-4 text-green-600" />
                              )}
                              <span className="font-medium">{customer.brand} {customer.modelName}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Device Type: {customer.deviceType === 'mobile' ? 'Mobile' : 'Laptop'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Invoice Value: ₹{customer.invoiceValue}
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
                              Device: {payout.customer.brand} {payout.customer.modelName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Device Type: {payout.customer.deviceType === 'mobile' ? 'Mobile' : 'Laptop'}
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

          <TabsContent value="account">
            <div className="space-y-6">
              {/* Tax & Compliance Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Tax & Compliance Details
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Complete your tax information to comply with TDS regulations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">Required for Commission Payouts</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          PAN details are mandatory for TDS compliance. GST registration details are optional but recommended for business entities.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Details Form</h3>
                    <p className="text-gray-600 mb-4">
                      This section will allow you to upload PAN card, GST certificate, and MSME certificate
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bank Details for Payouts
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Add your bank account details to receive monthly commission payouts
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Secure Bank Account Setup</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          Your bank details are encrypted and stored securely. Account holder name must match your PAN card details.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Details Form</h3>
                    <p className="text-gray-600 mb-4">
                      This section will allow you to add bank account details, IFSC code, and upload cancelled cheque
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Completion Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span className="font-medium text-green-900">Basic Information</span>
                      </div>
                      <Badge variant="default">Complete</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                        <span className="font-medium text-red-900">Tax Compliance Details</span>
                      </div>
                      <Badge variant="destructive">Pending</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                        <span className="font-medium text-red-900">Bank Account Details</span>
                      </div>
                      <Badge variant="destructive">Pending</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Profile Completion</h4>
                        <p className="text-sm text-gray-600">Complete all sections to start receiving payouts</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">33%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ScrollToTopButton />
    </div>
  );
}