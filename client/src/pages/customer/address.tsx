import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerLayout, useCustomerAuth } from '@/components/customer/customer-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { MapPin, Plus, Home, Building, Trash2, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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

const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., Home, Office)"),
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  isDefault: z.boolean().default(false)
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CustomerAddressPage() {
  const { customerPhone, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const form = useForm<AddressFormData>({
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

  const { data: addresses = [], isLoading } = useQuery<CustomerAddress[]>({
    queryKey: ['/api/customer/addresses', customerPhone],
    queryFn: async () => {
      const response = await fetch(`/api/customer/addresses?phone=${customerPhone}`);
      if (!response.ok) throw new Error('Failed to fetch addresses');
      return response.json();
    },
    enabled: isAuthenticated && !!customerPhone
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, phone: customerPhone, id: editingAddress?.id })
      });
      if (!response.ok) throw new Error('Failed to save address');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/addresses', customerPhone] });
      setShowDialog(false);
      setEditingAddress(null);
      form.reset();
      toast({ title: "Success", description: "Address saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customer/addresses/${id}?phone=${customerPhone}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete address');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/addresses', customerPhone] });
      toast({ title: "Success", description: "Address deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    form.reset({
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    form.reset({
      label: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setShowDialog(true);
  };

  const filteredAddresses = addresses.filter(addr =>
    addr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addr.addressLine1.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);
  const paginatedAddresses = filteredAddresses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getLabelIcon = (label: string) => {
    if (label.toLowerCase().includes('home')) return Home;
    if (label.toLowerCase().includes('office') || label.toLowerCase().includes('work')) return Building;
    return MapPin;
  };

  return (
    <CustomerLayout title="My Addresses" description="Manage your saved addresses for device pickup">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button onClick={handleAdd} className="bg-[#254696]">
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>
      </div>

      <Card className="rounded-xl border-gray-100">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search addresses..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 rounded-lg border-gray-200"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredAddresses.length} address(es) saved
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#254696] mx-auto"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Addresses Saved</h3>
              <p className="text-gray-500 mb-4">Add your first address for quick BBG claims.</p>
              <Button onClick={handleAdd} className="bg-[#254696]">
                Add Your First Address
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-bold text-gray-700">Label</TableHead>
                      <TableHead className="font-bold text-gray-700">Address</TableHead>
                      <TableHead className="font-bold text-gray-700">City</TableHead>
                      <TableHead className="font-bold text-gray-700">State</TableHead>
                      <TableHead className="font-bold text-gray-700">Pincode</TableHead>
                      <TableHead className="font-bold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAddresses.map((address) => {
                      const LabelIcon = getLabelIcon(address.label);
                      return (
                        <TableRow key={address.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <LabelIcon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 text-sm">{address.label}</span>
                                {address.isDefault && (
                                  <Badge className="ml-2 bg-green-100 text-green-700 h-5 px-1.5 text-[10px]">Default</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{address.addressLine1}</span>
                            {address.addressLine2 && (
                              <span className="text-sm text-gray-400">, {address.addressLine2}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-900">{address.city}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{address.state}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-gray-900">{address.pincode}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(address)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => address.id && deleteMutation.mutate(address.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Update Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Label</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Home, Office, Parent's House" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="House/Flat No., Building Name" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Street, Landmark" className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="State" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="6-digit pincode" maxLength={6} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">Set as default address</FormLabel>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-[#254696] rounded-xl" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
