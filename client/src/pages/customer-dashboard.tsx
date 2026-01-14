import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  Phone, 
  User, 
  Shield, 
  Calendar, 
  Smartphone, 
  Laptop, 
  IndianRupee, 
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
  Ticket,
  MapPin,
  Mail,
  Building,
  Hash,
  Upload,
  CreditCard,
  FileText,
  Package,
  ClipboardList,
  Home,
  Plus,
  Pencil,
  Trash2,
  Banknote
} from 'lucide-react';

interface CustomerOrder {
  id: number;
  voucherCode: string;
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
  registrationDate: string;
  sellerCode?: string;
  registrationSource?: string;
  isVerified: boolean;
  invoiceFile?: string;
  planName?: string;
  benefitType?: string;
  claimStatus?: string;
}

interface CustomerClaim {
  id: number;
  voucherCode: string;
  deviceAgeMonths: number;
  claimPercentage: number;
  claimAmount: number;
  status: string;
  createdAt: string;
  deviceType?: string;
  brand?: string;
  modelName?: string;
}

interface CustomerBankDetails {
  id?: number;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  upiId?: string;
}

interface CustomerAddress {
  id?: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(3, "Account holder name is required"),
  accountNumber: z.string().min(9, "Valid account number is required"),
  confirmAccountNumber: z.string().min(9, "Please confirm account number"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
  upiId: z.string().optional()
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers do not match",
  path: ["confirmAccountNumber"]
});

const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., Home, Office)"),
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  isDefault: z.boolean().default(false)
});

type BankDetailsData = z.infer<typeof bankDetailsSchema>;
type AddressData = z.infer<typeof addressSchema>;

function getOrderStatus(order: CustomerOrder): { status: string; color: string; icon: React.ReactNode } {
  if (order.claimStatus === 'approved' || order.claimStatus === 'paid') {
    return { status: 'Claimed', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="h-3 w-3" /> };
  }
  if (order.claimStatus === 'pending' || order.claimStatus === 'processing') {
    return { status: 'Claim in Progress', color: 'bg-orange-100 text-orange-800', icon: <Clock className="h-3 w-3" /> };
  }
  if (order.isVerified) {
    return { status: 'Registered', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> };
  }
  return { status: 'Purchased', color: 'bg-blue-100 text-blue-800', icon: <Package className="h-3 w-3" /> };
}

export default function CustomerDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    
    if (savedPhone && savedAuth === 'true') {
      setCustomerPhone(savedPhone);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const bankForm = useForm<BankDetailsData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  const addressForm = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    }
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<CustomerOrder[]>({
    queryKey: ['/api/customer/orders', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/orders?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const { data: claims = [], isLoading: isLoadingClaims } = useQuery<CustomerClaim[]>({
    queryKey: ['/api/customer/claims', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/claims?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const { data: bankDetails, isLoading: isLoadingBank } = useQuery<CustomerBankDetails | null>({
    queryKey: ['/api/customer/bank-details', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/bank-details?phone=${customerPhone}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch bank details');
      }
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery<CustomerAddress[]>({
    queryKey: ['/api/customer/addresses', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/addresses?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch addresses');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const saveBankMutation = useMutation({
    mutationFn: async (data: BankDetailsData) => {
      const response = await fetch('/api/customer/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, phone: customerPhone })
      });
      if (!response.ok) throw new Error('Failed to save bank details');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/bank-details', customerPhone] });
      setShowBankDialog(false);
      bankForm.reset();
      toast({ title: "Success", description: "Bank details saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (data: AddressData) => {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, phone: customerPhone })
      });
      if (!response.ok) throw new Error('Failed to save address');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/addresses', customerPhone] });
      setShowAddressDialog(false);
      addressForm.reset();
      toast({ title: "Success", description: "Address saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleInvoiceUpload = async (orderId: number, file: File) => {
    setUploadingInvoice(orderId);
    const formData = new FormData();
    formData.append('invoice', file);
    formData.append('orderId', orderId.toString());
    formData.append('phone', customerPhone);

    try {
      const response = await fetch('/api/customer/upload-invoice', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload invoice');
      queryClient.invalidateQueries({ queryKey: ['/api/customer/orders', customerPhone] });
      toast({ title: "Success", description: "Invoice uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadingInvoice(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCustomerPhone('');
    sessionStorage.removeItem('customerPhone');
    sessionStorage.removeItem('customerAuthenticated');
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType?.toLowerCase() === 'laptop' ? Laptop : Smartphone;
  };

  const getClaimStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      paid: { color: 'bg-purple-100 text-purple-800', label: 'Paid' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    const s = statusMap[status] || statusMap.pending;
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  const isInvoiceMissing = (invoiceFile: string | undefined | null): boolean => {
    return !invoiceFile || invoiceFile === 'N/A' || invoiceFile.trim() === '';
  };
  const ordersNeedingInvoice = orders.filter(o => isInvoiceMissing(o.invoiceFile));
  const hasBankDetails = !!bankDetails;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/customer/login';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Manage your orders, claims, and account details</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-medium">{customerPhone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>

        {(ordersNeedingInvoice.length > 0 || !hasBankDetails) && (
          <div className="space-y-3 mb-6">
            {ordersNeedingInvoice.length > 0 && (
              <Alert variant="destructive" className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Invoice Upload Required</AlertTitle>
                <AlertDescription className="text-orange-700">
                  You have {ordersNeedingInvoice.length} order(s) without invoice uploaded. Please upload invoices to complete registration.
                </AlertDescription>
              </Alert>
            )}
            {!hasBankDetails && (
              <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
                <Banknote className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Bank Details Required</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Please add your bank details to receive claim payouts.
                  <Button variant="link" className="p-0 h-auto ml-2 text-yellow-800 underline" onClick={() => { setActiveTab('addresses'); setShowBankDialog(true); }}>
                    Add Bank Details
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">My Claims</span>
              <span className="sm:hidden">Claims</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Bank & Address</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  My Orders ({orders.length})
                </CardTitle>
                <CardDescription>Your BBG protection purchases and registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-4">You haven't purchased any BBG protection plans yet.</p>
                    <Button onClick={() => window.location.href = '/buy-bbg'}>Browse Plans</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const DeviceIcon = getDeviceIcon(order.deviceType);
                      const orderStatus = getOrderStatus(order);
                      const needsInvoice = isInvoiceMissing(order.invoiceFile);
                      
                      return (
                        <Card key={order.id} className={`border ${needsInvoice ? 'border-orange-300 bg-orange-50/30' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <DeviceIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold">{order.brand} {order.modelName}</h4>
                                    <Badge className={orderStatus.color}>
                                      {orderStatus.icon}
                                      <span className="ml-1">{orderStatus.status}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {order.planName || 'BBG Protection'} • {order.deviceType}
                                  </p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Ticket className="h-3 w-3" />
                                      {order.voucherCode}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      {order.serialNumber}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IndianRupee className="h-3 w-3" />
                                      ₹{order.invoiceValue?.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(order.dateOfPurchase)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 md:items-end">
                                {needsInvoice && (
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleInvoiceUpload(order.id, file);
                                      }}
                                      disabled={uploadingInvoice === order.id}
                                    />
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="border-orange-400 text-orange-600 hover:bg-orange-50"
                                      disabled={uploadingInvoice === order.id}
                                    >
                                      {uploadingInvoice === order.id ? (
                                        <><Clock className="h-4 w-4 mr-1 animate-spin" /> Uploading...</>
                                      ) : (
                                        <><Upload className="h-4 w-4 mr-1" /> Upload Invoice</>
                                      )}
                                    </Button>
                                  </div>
                                )}
                                {!needsInvoice && (
                                  <Badge variant="outline" className="text-green-600 border-green-300">
                                    <FileText className="h-3 w-3 mr-1" /> Invoice Uploaded
                                  </Badge>
                                )}
                                {!order.claimStatus && order.isVerified && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => window.location.href = `/claim-bbg?voucher=${order.voucherCode}`}
                                  >
                                    Claim BBG
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  My Claims ({claims.length})
                </CardTitle>
                <CardDescription>Track your BBG claim requests and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingClaims ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : claims.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Yet</h3>
                    <p className="text-gray-600">You haven't submitted any BBG claims.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <Card key={claim.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">Claim #{claim.id}</span>
                                {getClaimStatusBadge(claim.status)}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Voucher: {claim.voucherCode}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                <span>Device Age: {claim.deviceAgeMonths} months</span>
                                <span>Claim %: {claim.claimPercentage}%</span>
                                <span className="font-medium text-gray-700">Amount: ₹{claim.claimAmount?.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              Submitted: {formatDate(claim.createdAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Bank Details
                    </CardTitle>
                    <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant={bankDetails ? "outline" : "default"}>
                          {bankDetails ? <><Pencil className="h-4 w-4 mr-1" /> Edit</> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{bankDetails ? 'Edit' : 'Add'} Bank Details</DialogTitle>
                          <DialogDescription>Enter your bank account details for receiving claim payouts.</DialogDescription>
                        </DialogHeader>
                        <Form {...bankForm}>
                          <form onSubmit={bankForm.handleSubmit((data) => saveBankMutation.mutate(data))} className="space-y-4">
                            <FormField control={bankForm.control} name="accountHolderName" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Holder Name</FormLabel>
                                <FormControl><Input placeholder="Enter name as per bank account" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={bankForm.control} name="accountNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl><Input placeholder="Enter account number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={bankForm.control} name="confirmAccountNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Account Number</FormLabel>
                                <FormControl><Input placeholder="Re-enter account number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={bankForm.control} name="ifscCode" render={({ field }) => (
                              <FormItem>
                                <FormLabel>IFSC Code</FormLabel>
                                <FormControl><Input placeholder="e.g., SBIN0001234" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={bankForm.control} name="upiId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>UPI ID (Optional)</FormLabel>
                                <FormControl><Input placeholder="e.g., name@upi" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={saveBankMutation.isPending}>
                              {saveBankMutation.isPending ? 'Saving...' : 'Save Bank Details'}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingBank ? (
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                  ) : bankDetails ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Holder:</span>
                        <span className="font-medium">{bankDetails.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Number:</span>
                        <span className="font-medium">****{bankDetails.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">IFSC Code:</span>
                        <span className="font-medium">{bankDetails.ifscCode}</span>
                      </div>
                      {bankDetails.upiId && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">UPI ID:</span>
                          <span className="font-medium">{bankDetails.upiId}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Banknote className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No bank details added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Saved Addresses
                    </CardTitle>
                    <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                          <DialogDescription>Add a new address for pickups and deliveries.</DialogDescription>
                        </DialogHeader>
                        <Form {...addressForm}>
                          <form onSubmit={addressForm.handleSubmit((data) => saveAddressMutation.mutate(data))} className="space-y-4">
                            <FormField control={addressForm.control} name="label" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl><Input placeholder="e.g., Home, Office" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={addressForm.control} name="addressLine1" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl><Input placeholder="House/Flat No., Building Name" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={addressForm.control} name="addressLine2" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 2 (Optional)</FormLabel>
                                <FormControl><Input placeholder="Street, Landmark" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={addressForm.control} name="city" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl><Input placeholder="City" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={addressForm.control} name="state" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl><Input placeholder="State" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                            <FormField control={addressForm.control} name="pincode" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl><Input placeholder="6-digit pincode" maxLength={6} {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={saveAddressMutation.isPending}>
                              {saveAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAddresses ? (
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <Home className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No addresses saved yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{addr.label}</span>
                            {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
