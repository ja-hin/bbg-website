import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Wallet, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  CreditCard,
  Calendar,
  IndianRupee,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Distributor {
  id: number;
  name: string;
  businessName?: string;
  contact: string;
  email: string;
  pincode: string;
  preferredMode?: string;
  gstin?: string;
  bankAccount?: string;
  ifscCode?: string;
  accountHolderName?: string;
  sellerCode: string;
  totalCustomers: number;
  commissionEarned: number;
  pendingPayouts: number;
  completedPayouts: number;
  createdAt: string;
}

interface Payout {
  id: number;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
  distributor: {
    id: number;
    name: string;
    contact: string;
    email: string;
    sellerCode: string;
  };
  customer: {
    name: string;
    contact: string;
    deviceType: string;
    brand: string;
    modelName: string;
  };
}

export default function AdminDistributors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState<string>("");

  // Check admin authentication
  const { isLoading: adminLoading, isAuthenticated } = useRequireAuth();

  // Fetch distributors
  const { data: distributors, isLoading: distributorsLoading } = useQuery<Distributor[]>({
    queryKey: ["/api/admin/distributors"],
    enabled: isAuthenticated,
    refetchOnMount: true,
    staleTime: 0
  });

  // Fetch payouts
  const { data: payouts, isLoading: payoutsLoading } = useQuery<Payout[]>({
    queryKey: ["/api/admin/payouts"],
    enabled: isAuthenticated,
    refetchOnMount: true,
    staleTime: 0
  });

  // Update payout status mutation
  const updatePayoutMutation = useMutation({
    mutationFn: async ({ payoutId, status, paymentReference }: { 
      payoutId: number; 
      status: string; 
      paymentReference?: string; 
    }) => {
      return await apiRequest(`/api/admin/payouts/${payoutId}/status`, {
        method: "PATCH",
        body: { status, paymentReference }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/distributors"] });
      setSelectedPayout(null);
      setPayoutStatus("");
      setPaymentReference("");
      toast({
        title: "Success",
        description: "Payout status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout status",
        variant: "destructive"
      });
    }
  });

  const handleUpdatePayout = () => {
    if (!selectedPayout || !payoutStatus) return;
    
    updatePayoutMutation.mutate({
      payoutId: selectedPayout.id,
      status: payoutStatus,
      paymentReference: paymentReference || undefined
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      processing: { variant: "default" as const, icon: AlertCircle, color: "text-blue-600" },
      paid: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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

  return (
    <AdminLayout>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Referral Partner & Payout Management</h1>
          <p className="text-gray-600">Manage referral partner details and track commission payouts</p>
        </div>

        <Tabs defaultValue="distributors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distributors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Referral Partners
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distributors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Referral Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                {distributorsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-40"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="space-y-1">
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : distributors && distributors.length > 0 ? (
                  <div className="space-y-4">
                    {distributors.map((distributor) => (
                      <div key={distributor.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{distributor.name}</h3>
                            {distributor.businessName && (
                              <p className="text-gray-600 flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {distributor.businessName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {distributor.sellerCode}
                            </code>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyToClipboard(distributor.sellerCode)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Contact
                            </p>
                            <p className="font-medium">{distributor.contact}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Email
                            </p>
                            <p className="font-medium text-sm">{distributor.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Pincode
                            </p>
                            <p className="font-medium">{distributor.pincode}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined
                            </p>
                            <p className="font-medium">{formatDate(distributor.createdAt)}</p>
                          </div>
                        </div>

                        {/* Bank Details */}
                        {distributor.bankAccount && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Account Holder</p>
                              <p className="font-medium">{distributor.accountHolderName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Account Number</p>
                              <p className="font-medium font-mono">****{distributor.bankAccount.slice(-4)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">IFSC Code</p>
                              <p className="font-medium">{distributor.ifscCode}</p>
                            </div>
                          </div>
                        )}

                        {/* Performance Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{distributor.totalCustomers}</p>
                            <p className="text-sm text-gray-600">Total Customers</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(distributor.commissionEarned)}</p>
                            <p className="text-sm text-gray-600">Total Earned</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(distributor.pendingPayouts)}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(distributor.completedPayouts)}</p>
                            <p className="text-sm text-gray-600">Paid</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No distributors found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Commission Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-40"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="space-y-1">
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : payouts && payouts.length > 0 ? (
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {formatCurrency(payout.amount)}
                              </h3>
                              {getStatusBadge(payout.status)}
                            </div>
                            <p className="text-gray-600">
                              Commission for {payout.customer.name}'s registration
                            </p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setPayoutStatus(payout.status);
                                  setPaymentReference(payout.paymentReference || "");
                                }}
                              >
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Update Payout Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select value={payoutStatus} onValueChange={setPayoutStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="processing">Processing</SelectItem>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="reference">Payment Reference (Optional)</Label>
                                  <Input
                                    id="reference"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    placeholder="e.g., TXN123456789"
                                  />
                                </div>
                                <Button 
                                  onClick={handleUpdatePayout}
                                  disabled={updatePayoutMutation.isPending || !payoutStatus}
                                  className="w-full"
                                >
                                  {updatePayoutMutation.isPending ? "Updating..." : "Update Status"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Distributor Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Distributor Details</h4>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-gray-500">Name:</span> {payout.distributor.name}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Contact:</span> {payout.distributor.contact}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Seller Code:</span> {payout.distributor.sellerCode}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-gray-500">Name:</span> {payout.customer.name}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Device:</span> {payout.customer.brand} {payout.customer.modelName}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">Type:</span> {payout.customer.deviceType}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>Created: {formatDate(payout.createdAt)}</span>
                            {payout.paidAt && (
                              <span>Paid: {formatDate(payout.paidAt)}</span>
                            )}
                          </div>
                          {payout.paymentReference && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>Ref: {payout.paymentReference}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No payouts found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}