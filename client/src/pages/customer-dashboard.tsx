import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
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
  Banknote,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import bbgLogo from "@assets/BUY_BACK_GURANTEE_LOGO_1766210821932.png";

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
  const [location, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    navigate('/customer/login');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#254696] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by App.tsx or already navigating
  }

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-[#254696] text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/">
              <img src={bbgLogo} alt="BBG Logo" className="h-12 w-auto cursor-pointer" />
            </Link>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem id="orders" icon={Package} label="My Orders" />
            <SidebarItem id="claims" icon={ClipboardList} label="My Claims" />
            <SidebarItem id="addresses" icon={CreditCard} label="Bank & Address" />
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#254696] flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Customer</p>
                <p className="text-xs text-gray-500 truncate">{customerPhone}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 border-green-100 bg-green-50 text-green-700">
              <Shield className="h-3 w-3" /> Secure Session
            </Badge>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab.replace('-', ' & ')}
              </h1>
              <p className="text-gray-500">Welcome to your BuyBack Guarantee portal</p>
            </div>

            {/* Notifications */}
            {(ordersNeedingInvoice.length > 0 || !hasBankDetails) && (
              <div className="space-y-4 mb-8">
                {ordersNeedingInvoice.length > 0 && (
                  <Alert className="bg-orange-50 border-orange-200 rounded-2xl">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <AlertTitle className="text-orange-800 font-bold">Action Required: Invoice Upload</AlertTitle>
                      <AlertDescription className="text-orange-700">
                        You have {ordersNeedingInvoice.length} registration(s) missing invoices. Please upload them to ensure claim eligibility.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
                {!hasBankDetails && (
                  <Alert className="bg-blue-50 border-blue-200 rounded-2xl">
                    <Banknote className="h-5 w-5 text-[#254696]" />
                    <div>
                      <AlertTitle className="text-[#254696] font-bold">Payout Setup</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Add your bank details to enable instant claim payouts when you're eligible.
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-2 text-[#254696] font-bold underline" 
                          onClick={() => setActiveTab('addresses')}
                        >
                          Setup Now
                        </Button>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>
            )}

            {/* Dynamic Content Based on Tab */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {isLoadingOrders ? (
                    <div className="grid gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Protections</h3>
                      <p className="text-gray-500 mb-6">You haven't registered any devices for BuyBack Guarantee yet.</p>
                      <Button 
                        onClick={() => navigate('/buy-bbg')}
                        className="bg-[#254696] hover:bg-[#1a326b] px-8 py-6 rounded-2xl text-lg h-auto"
                      >
                        Protect a Device Now
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {orders.map((order) => {
                        const DeviceIcon = getDeviceIcon(order.deviceType);
                        const orderStatus = getOrderStatus(order);
                        const needsInvoice = isInvoiceMissing(order.invoiceFile);
                        
                        return (
                          <Card key={order.id} className={`overflow-hidden rounded-3xl border-gray-100 transition-all hover:shadow-xl ${needsInvoice ? 'ring-2 ring-orange-200' : 'hover:border-[#254696]/20'}`}>
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/4 bg-gray-50/80 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
                                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                                    <DeviceIcon className="h-8 w-8 text-[#254696]" />
                                  </div>
                                  <Badge className={`${orderStatus.color} rounded-full px-3 mb-2`}>
                                    {orderStatus.status}
                                  </Badge>
                                  <p className="text-xs text-gray-400 font-medium">#{order.voucherCode}</p>
                                </div>
                                <div className="md:w-3/4 p-6">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900">{order.brand} {order.modelName}</h3>
                                      <p className="text-gray-500 text-sm">{order.planName || 'BuyBack Guarantee Plan'}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                      <p className="text-2xl font-bold text-[#254696]">₹{order.invoiceValue?.toLocaleString()}</p>
                                      <p className="text-xs text-gray-400">Invoice Value</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    <div className="space-y-1">
                                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Serial/IMEI</p>
                                      <p className="text-sm font-semibold text-gray-700">{order.serialNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Purchase Date</p>
                                      <p className="text-sm font-semibold text-gray-700">{formatDate(order.dateOfPurchase)}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Registered On</p>
                                      <p className="text-sm font-semibold text-gray-700">{formatDate(order.registrationDate)}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                      {needsInvoice ? (
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none font-bold">
                                          Invoice Missing
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" /> Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {needsInvoice && (
                                        <div className="relative">
                                          <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleInvoiceUpload(order.id, file);
                                            }}
                                            disabled={uploadingInvoice === order.id}
                                          />
                                          <Button size="sm" className="bg-[#254696] hover:bg-[#1a326b] rounded-xl font-bold">
                                            {uploadingInvoice === order.id ? <Clock className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                            Upload Invoice
                                          </Button>
                                        </div>
                                      )}
                                      {!needsInvoice && !order.claimStatus && order.isVerified && (
                                        <Button 
                                          size="sm"
                                          className="bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg shadow-red-100"
                                          onClick={() => navigate(`/claim-bbg?voucher=${order.voucherCode}`)}
                                        >
                                          File BBG Claim
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'claims' && (
                <div className="space-y-6">
                  {isLoadingClaims ? (
                    <div className="grid gap-4">
                      {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : claims.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <ClipboardList className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Claims Filed</h3>
                      <p className="text-gray-500 mb-6">All your filed claims will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {claims.map((claim) => (
                        <Card key={claim.id} className="rounded-3xl border-gray-100 hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-[#254696]" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">Claim for {claim.brand} {claim.modelName}</h4>
                                  <p className="text-sm text-gray-500">#{claim.voucherCode} • {formatDate(claim.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end gap-1">
                                <p className="text-2xl font-black text-green-600">₹{claim.claimAmount?.toLocaleString()}</p>
                                {getClaimStatusBadge(claim.status)}
                              </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1 text-center border-r border-gray-50 last:border-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Age</p>
                                <p className="text-sm font-bold text-gray-700">{claim.deviceAgeMonths} Mo</p>
                              </div>
                              <div className="space-y-1 text-center border-r border-gray-50 last:border-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Value %</p>
                                <p className="text-sm font-bold text-gray-700">{claim.claimPercentage}%</p>
                              </div>
                              <div className="space-y-1 text-center border-r border-gray-50 last:border-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Status</p>
                                <p className="text-sm font-bold text-gray-700 capitalize">{claim.status}</p>
                              </div>
                              <div className="space-y-1 text-center last:border-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Payout</p>
                                <p className="text-sm font-bold text-gray-700">{claim.status === 'paid' ? 'Completed' : 'Pending'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Bank Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-[#254696]" /> Bank Account
                      </h3>
                      {!hasBankDetails && (
                        <Button 
                          onClick={() => setShowBankDialog(true)} 
                          className="bg-[#254696] hover:bg-[#1a326b] rounded-xl h-10"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Details
                        </Button>
                      )}
                    </div>
                    
                    {isLoadingBank ? (
                      <div className="h-40 bg-gray-100 rounded-3xl animate-pulse" />
                    ) : bankDetails ? (
                      <Card className="rounded-3xl border-gray-100 shadow-lg bg-gradient-to-br from-[#254696] to-[#1a326b] text-white">
                        <CardContent className="p-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                          <div className="flex justify-between items-start mb-8 relative z-10">
                            <Shield className="h-8 w-8 text-blue-200" />
                            <Badge className="bg-white/20 text-white border-none">Active Payout Account</Badge>
                          </div>
                          <div className="space-y-4 relative z-10">
                            <div>
                              <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Account Holder</p>
                              <p className="text-lg font-bold">{bankDetails.accountHolderName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Account Number</p>
                                <p className="text-base font-mono tracking-wider">•••• {bankDetails.accountNumber.slice(-4)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">IFSC Code</p>
                                <p className="text-base font-mono tracking-wider">{bankDetails.ifscCode}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-500 mb-4">No bank details added. Please add them to receive your BuyBack Guarantee payments.</p>
                      </div>
                    )}
                  </div>

                  {/* Addresses Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#254696]" /> My Addresses
                      </h3>
                      <Button 
                        onClick={() => setShowAddressDialog(true)}
                        variant="outline"
                        className="rounded-xl h-10 border-gray-200"
                      >
                        <Plus className="h-4 w-4 mr-2" /> New Address
                      </Button>
                    </div>

                    {isLoadingAddresses ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-500 mb-4">No saved addresses found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <Card key={address.id} className="rounded-3xl border-gray-100 hover:shadow-md transition-all">
                            <CardContent className="p-5 flex items-start gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                <Home className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900">{address.label}</h4>
                                  {address.isDefault && <Badge className="bg-green-100 text-green-700 h-5 px-2">Default</Badge>}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{address.addressLine1}, {address.addressLine2}</p>
                                <p className="text-sm text-gray-500">{address.city}, {address.state} - {address.pincode}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Details</DialogTitle>
            <DialogDescription>Details for receiving your BBG claim payouts</DialogDescription>
          </DialogHeader>
          <Form {...bankForm}>
            <form onSubmit={bankForm.handleSubmit((data) => saveBankMutation.mutate(data))} className="space-y-4">
              <FormField
                control={bankForm.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bankForm.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl><Input type="password" {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bankForm.control}
                name="confirmAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Account Number</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bankForm.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. HDFC0001234" className="rounded-xl uppercase" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-[#254696] rounded-xl" disabled={saveBankMutation.isPending}>
                Save Bank Details
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit((data) => saveAddressMutation.mutate(data))} className="space-y-4">
              <FormField
                control={addressForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Label (Home/Office)</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input {...field} className="rounded-xl" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl><Input {...field} maxLength={6} className="rounded-xl" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-[#254696] rounded-xl" disabled={saveAddressMutation.isPending}>
                Save Address
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
