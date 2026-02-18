import { useDistributorPayouts } from "@/hooks/useDistributorAuth";
import { DistributorLayout } from "@/components/distributor-layout";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wallet, Smartphone, Laptop } from "lucide-react";

export default function DistributorPayouts() {
  const { data: payouts, isLoading } = useDistributorPayouts();

  const columns = [
    {
      header: "Date",
      accessorKey: "createdAt" as const,
      sortable: true,
      cell: (item: any) => (
        <div className="flex items-center text-gray-600">
          <Calendar className="w-3 h-3 mr-2" />
          {new Date(item.paidAt || item.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount" as const,
      sortable: true,
      cell: (item: any) => (
        <div className="flex items-center font-bold text-gray-900">
          <Wallet className="w-3 h-3 mr-2 text-green-600" />
          ₹{item.amount}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      sortable: true,
      cell: (item: any) => (
        <Badge 
          variant={
            item.status === 'paid' ? 'default' : 
            item.status === 'processing' ? 'secondary' : 
            'outline'
          }
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Related Customer",
      accessorKey: "customer" as const,
      cell: (item: any) => (
        <div className="flex items-center gap-2 text-sm">
          {item.customer.deviceType === 'mobile' ? (
            <Smartphone className="w-3 h-3 text-blue-600" />
          ) : (
            <Laptop className="w-3 h-3 text-green-600" />
          )}
          <span>{item.customer.brand} {item.customer.modelName}</span>
        </div>
      ),
    },
    {
      header: "Reference",
      accessorKey: "paymentReference" as const,
      cell: (item: any) => item.paymentReference || <span className="text-gray-400">-</span>,
    }
  ];

  return (
    <DistributorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-500 mt-1">
            History of your commission payouts and current earning status.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <DataTable 
            data={(payouts as any[]) || []} 
            columns={columns}
            searchKey="status" 
            searchPlaceholder="Filter by status..."
          />
        )}
      </div>
    </DistributorLayout>
  );
}
