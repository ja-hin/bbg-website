import { useDistributorCustomers } from "@/hooks/useDistributorAuth";
import { DistributorLayout } from "@/components/distributor-layout";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Laptop, Calendar } from "lucide-react";

export default function DistributorRegistrations() {
  const { data: customers, isLoading } = useDistributorCustomers();

  const columns = [
    {
      header: "Date",
      accessorKey: "createdAt" as const,
      sortable: true,
      cell: (item: any) => (
        <div className="flex items-center text-gray-600">
          <Calendar className="w-3 h-3 mr-2" />
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Device Info",
      accessorKey: "modelName" as const,
      sortable: true,
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          {item.deviceType === 'mobile' ? (
            <Smartphone className="w-4 h-4 text-blue-600" />
          ) : (
            <Laptop className="w-4 h-4 text-green-600" />
          )}
          <span className="font-medium">{item.brand} {item.modelName}</span>
        </div>
      ),
    },
    {
      header: "Invoice Value",
      accessorKey: "invoiceValue" as const,
      sortable: true,
      cell: (item: any) => `₹${item.invoiceValue}`,
    },
    {
      header: "Commission",
      accessorKey: "commissionAmount" as const,
      cell: (item: any) => <span className="font-medium text-green-600">₹{item.commissionAmount || 0}</span>,
    },
    {
      header: "Status",
      accessorKey: "isVerified" as const,
      sortable: true,
      cell: (item: any) => (
        <Badge variant={item.isVerified ? "default" : "secondary"}>
          {item.isVerified ? "Verified" : "Pending"}
        </Badge>
      ),
    },
  ];

  return (
    <DistributorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customer Registrations</h1>
          <p className="text-gray-500 mt-1">
            Track all customers who registered using your referral code.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <DataTable 
            data={(customers as any[]) || []} 
            columns={columns} 
            searchKey="modelName"
            searchPlaceholder="Search by device model..."
          />
        )}
      </div>
    </DistributorLayout>
  );
}
