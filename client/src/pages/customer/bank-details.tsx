import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerLayout, useCustomerAuth } from '@/components/customer/customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { CreditCard, Plus, Shield, Pencil } from 'lucide-react';

interface BankDetails {
  id?: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
}

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(3, "Account holder name is required"),
  accountNumber: z.string().min(9, "Valid account number is required"),
  confirmAccountNumber: z.string().min(9, "Please confirm account number"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code (e.g., HDFC0001234)"),
  upiId: z.string().optional()
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers do not match",
  path: ["confirmAccountNumber"]
});

type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

export default function CustomerBankDetailsPage() {
  const { customerPhone, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);

  const form = useForm<BankDetailsFormData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  const { data: bankDetails, isLoading } = useQuery<BankDetails | null>({
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

  const saveMutation = useMutation({
    mutationFn: async (data: BankDetailsFormData) => {
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
      setShowDialog(false);
      form.reset();
      toast({ title: "Success", description: "Bank details saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = () => {
    if (bankDetails) {
      form.reset({
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        confirmAccountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        upiId: bankDetails.upiId || ''
      });
    }
    setShowDialog(true);
  };

  return (
    <CustomerLayout title="Bank Details" description="Manage your payout account for BBG claims">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#254696]"></div>
        </div>
      ) : bankDetails ? (
        <div className="max-w-md">
          <Card className="rounded-2xl border-0 shadow-xl bg-gradient-to-br from-[#254696] to-[#1a326b] text-white overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-200" />
                  <span className="text-sm text-blue-200 font-medium">Secure Payout Account</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                  onClick={handleEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-xl font-bold">{bankDetails.accountHolderName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-lg font-mono tracking-wider">•••• {bankDetails.accountNumber.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">IFSC Code</p>
                    <p className="text-lg font-mono tracking-wider">{bankDetails.ifscCode}</p>
                  </div>
                </div>

                {bankDetails.upiId && (
                  <div>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">UPI ID</p>
                    <p className="text-lg">{bankDetails.upiId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Your bank details are securely encrypted and used only for BBG claim payouts.
          </p>
        </div>
      ) : (
        <Card className="rounded-xl border-gray-100 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Bank Details Added</h3>
            <p className="text-gray-500 mb-6">Add your bank account to receive BBG claim payouts directly.</p>
            <Button onClick={() => setShowDialog(true)} className="bg-[#254696]">
              <Plus className="h-4 w-4 mr-2" /> Add Bank Details
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{bankDetails ? 'Update Bank Details' : 'Add Bank Details'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="As per bank records" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="Enter account number" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Re-enter account number" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., HDFC0001234" 
                        className="rounded-xl uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI ID (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="yourname@upi" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-[#254696] rounded-xl" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Bank Details'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
