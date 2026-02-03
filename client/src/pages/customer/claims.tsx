import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerLayout, useCustomerAuth } from '@/components/customer/customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { ClipboardList, Search, ChevronLeft, ChevronRight, Plus, FileText, AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';

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

interface EligibleOrder {
  id: number;
  voucherCode: string;
  brand: string;
  modelName: string;
  invoiceValue: number;
  serialNumber: string;
  contact: string;
}

const claimSchema = z.object({
  voucherCode: z.string().min(1, "Please select an order"),
  address: z.string().min(10, "Please provide complete pickup address"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTimeSlot: z.string().min(1, "Pickup time slot is required"),
});

type ClaimFormData = z.infer<typeof claimSchema>;

export default function CustomerClaimsPage() {
  const { customerPhone, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<EligibleOrder | null>(null);
  const [claimDetails, setClaimDetails] = useState<any>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const itemsPerPage = 10;

  const searchParams = new URLSearchParams(window.location.search);
  const preselectedVoucher = searchParams.get('voucher');

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      voucherCode: preselectedVoucher || '',
      address: '',
      pickupDate: '',
      pickupTimeSlot: ''
    }
  });

  const { data: claims = [], isLoading } = useQuery<CustomerClaim[]>({
    queryKey: ['/api/customer/claims', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/claims?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['/api/customer/orders', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/orders?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const eligibleOrders = orders.filter(o => 
    o.isVerified && 
    !o.claimStatus && 
    o.invoiceFile && 
    o.invoiceFile !== 'N/A'
  );

  useEffect(() => {
    if (preselectedVoucher && eligibleOrders.length > 0) {
      const order = eligibleOrders.find(o => o.voucherCode === preselectedVoucher);
      if (order) {
        setSelectedOrder(order);
        setShowClaimDialog(true);
        checkEligibility(preselectedVoucher, order.contact);
      }
    }
  }, [preselectedVoucher, eligibleOrders.length]);

  const checkEligibility = async (voucherCode: string, contact: string) => {
    try {
      const response = await fetch('/api/claims/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherCode })
      });
      const data = await response.json();
      if (response.ok) {
        setClaimDetails(data);
      } else {
        toast({ title: "Not Eligible", description: data.message || "Failed to check eligibility", variant: "destructive" });
        setShowClaimDialog(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to check eligibility", variant: "destructive" });
    }
  };

  const submitClaimMutation = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      if (!selectedOrder || !claimDetails) throw new Error("Missing claim details");
      
      const formData = new FormData();
      formData.append('voucherCode', data.voucherCode);
      formData.append('contact', selectedOrder.contact);
      formData.append('email', '');
      formData.append('serialNumber', selectedOrder.serialNumber);
      formData.append('address', data.address);
      formData.append('pickupDate', data.pickupDate);
      formData.append('pickupTimeSlot', data.pickupTimeSlot);
      if (invoiceFile) {
        formData.append('invoiceFile', invoiceFile);
      }

      const response = await fetch('/api/claims/submit', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit claim');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/claims', customerPhone] });
      queryClient.invalidateQueries({ queryKey: ['/api/customer/orders', customerPhone] });
      setShowClaimDialog(false);
      setSelectedOrder(null);
      setClaimDetails(null);
      setInvoiceFile(null);
      form.reset();
      toast({ title: "Success", description: "Your BBG claim has been submitted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const filteredClaims = claims.filter(claim =>
    claim.voucherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const paginatedClaims = filteredClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      paid: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" /> {status}
      </Badge>
    );
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  return (
    <CustomerLayout title="My Claims" description="View and file BBG claims">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        {eligibleOrders.length > 0 && (
          <Button onClick={() => setShowClaimDialog(true)} className="bg-[#254696]">
            <Plus className="h-4 w-4 mr-2" /> File New Claim
          </Button>
        )}
      </div>

      <Card className="rounded-xl border-gray-100">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 rounded-lg border-gray-200"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {paginatedClaims.length} of {filteredClaims.length} claims
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#254696] mx-auto"></div>
            </div>
          ) : claims.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Claims Yet</h3>
              <p className="text-gray-500 mb-4">You haven't filed any BBG claims yet.</p>
              {eligibleOrders.length > 0 && (
                <Button onClick={() => setShowClaimDialog(true)} className="bg-[#254696]">
                  File Your First Claim
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-bold text-gray-700">Voucher Code</TableHead>
                      <TableHead className="font-bold text-gray-700">Device</TableHead>
                      <TableHead className="font-bold text-gray-700">Device Age</TableHead>
                      <TableHead className="font-bold text-gray-700">Claim %</TableHead>
                      <TableHead className="font-bold text-gray-700">Claim Amount</TableHead>
                      <TableHead className="font-bold text-gray-700">Status</TableHead>
                      <TableHead className="font-bold text-gray-700">Filed On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <span className="font-mono text-sm text-[#254696]">{claim.voucherCode}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{claim.brand}</p>
                            <p className="text-xs text-gray-500">{claim.modelName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{claim.deviceAgeMonths} months</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900">{claim.claimPercentage}%</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600 text-lg">₹{claim.claimAmount?.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{formatDate(claim.createdAt)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'bg-[#254696]' : ''}
                      >
                        {pageNum}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>File BBG Claim</DialogTitle>
            <DialogDescription>Submit a claim for your eligible device</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => submitClaimMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="voucherCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Device</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const order = eligibleOrders.find(o => o.voucherCode === value);
                        if (order) {
                          setSelectedOrder(order);
                          checkEligibility(value, order.contact);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select an eligible device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eligibleOrders.map((order) => (
                          <SelectItem key={order.id} value={order.voucherCode}>
                            {order.brand} {order.modelName} ({order.voucherCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {claimDetails && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-800">Eligible for Claim!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Device Age:</span>
                      <span className="ml-2 font-bold">{claimDetails.deviceAge} months</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Claim %:</span>
                      <span className="ml-2 font-bold">{claimDetails.claimPercentage}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Claim Amount:</span>
                      <span className="ml-2 font-bold text-lg text-green-700">₹{claimDetails.claimAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter complete address for device pickup" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pickupDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} min={getMinDate()} className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickupTimeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Slot</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="9am-12pm">9 AM - 12 PM</SelectItem>
                          <SelectItem value="12pm-3pm">12 PM - 3 PM</SelectItem>
                          <SelectItem value="3pm-6pm">3 PM - 6 PM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Invoice Document (Optional)</FormLabel>
                <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="invoice-upload"
                  />
                  <label htmlFor="invoice-upload" className="cursor-pointer">
                    {invoiceFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">{invoiceFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Click to upload invoice</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#254696] rounded-xl" 
                disabled={submitClaimMutation.isPending || !claimDetails}
              >
                {submitClaimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
