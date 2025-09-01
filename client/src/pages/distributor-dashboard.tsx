import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Form state
  const [taxFormData, setTaxFormData] = useState({
    panNumber: '',
    isGstRegistered: false,
    gstin: '',
    isMsmeRegistered: false
  });
  
  const [bankFormData, setBankFormData] = useState({
    accountHolderName: '',
    bankAccount: '',
    bankAccountConfirm: '',
    ifscCode: '',
    upiId: ''
  });

  // Profile update mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const sessionToken = localStorage.getItem('distributorToken');
      return await apiRequest("/api/distributor/profile", {
        method: "PUT",
        body: profileData,
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/distributor/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Save handlers
  const handleSaveTaxDetails = () => {
    const taxData = {
      panNumber: (document.getElementById('panNumber') as HTMLInputElement)?.value,
      isGstRegistered: (document.getElementById('gstRegistered') as HTMLInputElement)?.checked,
      gstin: (document.getElementById('gstin') as HTMLInputElement)?.value,
      isMsmeRegistered: (document.getElementById('msmeRegistered') as HTMLInputElement)?.checked
    };
    
    console.log("Saving tax details:", taxData);
    updateProfileMutation.mutate(taxData);
  };

  const handleSaveBankDetails = () => {
    const bankAccount = (document.getElementById('bankAccount') as HTMLInputElement)?.value;
    const bankAccountConfirm = (document.getElementById('bankAccountConfirm') as HTMLInputElement)?.value;
    
    if (bankAccount !== bankAccountConfirm) {
      toast({
        title: "Validation Error",
        description: "Account numbers do not match",
        variant: "destructive",
      });
      return;
    }
    
    const bankData = {
      accountHolderName: (document.getElementById('accountHolder') as HTMLInputElement)?.value,
      bankAccount: bankAccount,
      bankAccountConfirm: bankAccountConfirm,
      ifscCode: (document.getElementById('ifscCode') as HTMLInputElement)?.value,
      upiId: (document.getElementById('upiId') as HTMLInputElement)?.value
    };
    
    console.log("Saving bank details:", bankData);
    updateProfileMutation.mutate(bankData);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (distributor: any) => {
    if (!distributor) return { percentage: 0, completedFields: 0, totalFields: 0 };
    
    const requiredFields = [
      { key: 'name', value: distributor.name },
      { key: 'contact', value: distributor.contact },
      { key: 'email', value: distributor.email },
      { key: 'pincode', value: distributor.pincode },
      { key: 'panNumber', value: distributor.panNumber },
      { key: 'accountHolderName', value: distributor.accountHolderName },
      { key: 'bankAccount', value: distributor.bankAccount },
      { key: 'ifscCode', value: distributor.ifscCode }
    ];
    
    const completedFields = requiredFields.filter(field => field.value && field.value.trim() !== '').length;
    const percentage = Math.round((completedFields / requiredFields.length) * 100);
    
    return { 
      percentage, 
      completedFields, 
      totalFields: requiredFields.length,
      isEligibleForPayouts: percentage >= 90 // Need 90%+ completion for payouts
    };
  };

  const profileStats = calculateProfileCompletion(distributor);

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
                  
                  {/* Tax & Compliance Form */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number *</Label>
                        <Input
                          id="panNumber"
                          type="text"
                          placeholder="ABCDE1234F"
                          defaultValue={distributor?.panNumber || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="panFile">PAN Card Copy *</Label>
                        <Input
                          id="panFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {distributor?.panCopyFile && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            File uploaded
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gstRegistered"
                          defaultChecked={distributor?.isGstRegistered || false}
                        />
                        <Label htmlFor="gstRegistered" className="text-sm font-medium">
                          I am GST registered
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="gstin">GSTIN</Label>
                          <Input
                            id="gstin"
                            type="text"
                            placeholder="22ABCDE1234F1Z5"
                            defaultValue={distributor?.gstin || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gstFile">GST Certificate</Label>
                          <Input
                            id="gstFile"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          {distributor?.gstCertificateFile && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              File uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="msmeRegistered"
                          defaultChecked={distributor?.isMsmeRegistered || false}
                        />
                        <Label htmlFor="msmeRegistered" className="text-sm font-medium">
                          I am MSME registered
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="msmeFile">MSME Certificate</Label>
                        <Input
                          id="msmeFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {distributor?.msmeCertificateFile && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            File uploaded
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleSaveTaxDetails}
                        disabled={updateProfileMutation.isPending}
                        className="w-full md:w-auto"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Save Tax & Compliance Details
                          </>
                        )}
                      </Button>
                    </div>
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
                  
                  {/* Bank Details Form */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="accountHolder">Account Holder Name *</Label>
                        <Input
                          id="accountHolder"
                          type="text"
                          placeholder="As per bank records"
                          defaultValue={distributor?.accountHolderName || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code *</Label>
                        <Input
                          id="ifscCode"
                          type="text"
                          placeholder="SBIN0001234"
                          defaultValue={distributor?.ifscCode || ''}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account Number *</Label>
                        <Input
                          id="bankAccount"
                          type="text"
                          placeholder="Account number"
                          defaultValue={distributor?.bankAccount || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountConfirm">Confirm Account Number *</Label>
                        <Input
                          id="bankAccountConfirm"
                          type="text"
                          placeholder="Re-enter account number"
                          defaultValue={distributor?.bankAccountConfirm || ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Additional Payment Options
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="upiId">UPI ID (Optional)</Label>
                          <Input
                            id="upiId"
                            type="text"
                            placeholder="username@bankname"
                            defaultValue={distributor?.upiId || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chequeFile">Cancelled Cheque (Optional)</Label>
                          <Input
                            id="chequeFile"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          {distributor?.cancelledChequeFile && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              File uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleSaveBankDetails}
                        disabled={updateProfileMutation.isPending}
                        className="w-full md:w-auto"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Building className="w-4 h-4 mr-2" />
                            Save Bank Details
                          </>
                        )}
                      </Button>
                    </div>
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
                    {/* Profile Completion Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <Badge variant={profileStats.percentage >= 90 ? "default" : "secondary"}>
                          {profileStats.percentage}% Complete
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            profileStats.percentage >= 90 ? 'bg-green-500' : 
                            profileStats.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${profileStats.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        {profileStats.completedFields} of {profileStats.totalFields} required fields completed
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span className="font-medium text-green-900">Basic Information</span>
                      </div>
                      <Badge variant="default">Complete</Badge>
                    </div>
                    
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      distributor?.panNumber ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        {distributor?.panNumber ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                        )}
                        <span className={`font-medium ${
                          distributor?.panNumber ? 'text-green-900' : 'text-red-900'
                        }`}>Tax Compliance Details</span>
                      </div>
                      <Badge variant={distributor?.panNumber ? "default" : "destructive"}>
                        {distributor?.panNumber ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                    
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      (distributor?.bankAccount && distributor?.ifscCode) ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        {(distributor?.bankAccount && distributor?.ifscCode) ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                        )}
                        <span className={`font-medium ${
                          (distributor?.bankAccount && distributor?.ifscCode) ? 'text-green-900' : 'text-red-900'
                        }`}>Bank Account Details</span>
                      </div>
                      <Badge variant={(distributor?.bankAccount && distributor?.ifscCode) ? "default" : "destructive"}>
                        {(distributor?.bankAccount && distributor?.ifscCode) ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className={`mt-6 p-4 rounded-lg ${
                    profileStats.isEligibleForPayouts 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${
                          profileStats.isEligibleForPayouts ? 'text-green-900' : 'text-orange-900'
                        }`}>
                          {profileStats.isEligibleForPayouts ? 'Payout Eligible' : 'Profile Completion'}
                        </h4>
                        <p className={`text-sm ${
                          profileStats.isEligibleForPayouts ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {profileStats.isEligibleForPayouts 
                            ? 'Your profile is complete and eligible for commission payouts' 
                            : `Complete ${profileStats.totalFields - profileStats.completedFields} more field${profileStats.totalFields - profileStats.completedFields !== 1 ? 's' : ''} to start receiving payouts`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          profileStats.percentage >= 90 ? 'text-green-600' : 
                          profileStats.percentage >= 50 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {profileStats.percentage}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          profileStats.percentage >= 90 ? 'bg-green-600' : 
                          profileStats.percentage >= 50 ? 'bg-orange-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${profileStats.percentage}%` }}
                      ></div>
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