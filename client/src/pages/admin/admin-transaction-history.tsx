import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter, CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionHistoryItem {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerContact?: string;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  deviceType?: string;
  deviceBrand?: string;
  referralCode?: string;
  discountApplied: number;
  originalAmount: number;
  registrationSource: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTransactionHistory() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/transaction-history', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      
      const response = await fetch(`/api/admin/transaction-history?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }
      return response.json() as TransactionHistoryItem[];
    }
  });

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/admin/export/transaction-history?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export transaction history');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction_history_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Transaction history has been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting transaction history:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export transaction history",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'payu':
        return <CreditCard className="h-4 w-4" />;
      case 'free':
      case 'direct':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage all payment transactions and customer registrations
          </p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers, transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="payu">PayU Gateway</SelectItem>
                  <SelectItem value="free">Free Registration</SelectItem>
                  <SelectItem value="direct">Direct Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={() => refetch()} variant="outline">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilters({
                status: 'all',
                paymentMethod: 'all',
                dateFrom: '',
                dateTo: '',
                search: ''
              })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Transaction History ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading transaction history...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Transaction ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Payment Method</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Device</th>
                    <th className="text-left p-2">Referral Code</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-mono text-sm">{transaction.transactionId}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{transaction.customerName}</div>
                        {transaction.customerContact && (
                          <div className="text-sm text-muted-foreground">
                            {transaction.customerContact}
                          </div>
                        )}
                        {transaction.customerEmail && (
                          <div className="text-sm text-muted-foreground">
                            {transaction.customerEmail}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{formatAmount(transaction.amount)}</div>
                        {transaction.discountApplied > 0 && (
                          <div className="text-sm text-green-600">
                            Discount: -{formatAmount(transaction.discountApplied)}
                          </div>
                        )}
                        {transaction.originalAmount > 0 && transaction.originalAmount !== transaction.amount && (
                          <div className="text-sm text-muted-foreground line-through">
                            Original: {formatAmount(transaction.originalAmount)}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {transaction.deviceType && (
                          <div className="text-sm">
                            <div className="font-medium capitalize">{transaction.deviceType}</div>
                            {transaction.deviceBrand && (
                              <div className="text-muted-foreground">{transaction.deviceBrand}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        {transaction.referralCode && (
                          <Badge variant="outline">{transaction.referralCode}</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}