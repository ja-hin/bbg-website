import { useDistributorAuth, useDistributorStats, useDistributorCustomers } from "@/hooks/useDistributorAuth";
import { DistributorLayout } from "@/components/distributor-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Wallet, 
  Clock, 
  CheckCircle, 
  Copy,
  ArrowUpRight,
  User,
  Smartphone,
  Laptop
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function DistributorDashboard() {
  const { distributor } = useDistributorAuth();
  const { data: stats, isLoading: statsLoading } = useDistributorStats();
  const { data: customers, isLoading: customersLoading } = useDistributorCustomers();
  const { toast } = useToast();

  const copySellerCode = () => {
    if (distributor?.sellerCode) {
      navigator.clipboard.writeText(distributor.sellerCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, link }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-2xl font-bold">{value}</div>
        </div>
        {link && (
          <Link href={link}>
            <a className="text-xs text-blue-600 hover:underline flex items-center mt-2">
              View Details <ArrowUpRight className="h-3 w-3 ml-1" />
            </a>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DistributorLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your referral performance</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <div className="px-3 py-1">
              <p className="text-xs text-gray-500 font-medium uppercase">Your Referral Code</p>
              <p className="text-lg font-mono font-bold text-blue-600">{distributor?.sellerCode}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-10 w-10 p-0" onClick={copySellerCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={statsLoading ? "..." : stats?.totalCustomers || 0}
            icon={Users}
            colorClass="text-blue-600"
            link="/distributor/registrations"
          />
          <StatCard
            title="Total Earnings"
            value={statsLoading ? "..." : `₹${stats?.totalEarnings || 0}`}
            icon={Wallet}
            colorClass="text-green-600"
            link="/distributor/payouts"
          />
          <StatCard
            title="Pending Payouts"
            value={statsLoading ? "..." : `₹${stats?.pendingPayouts || 0}`}
            icon={Clock}
            colorClass="text-orange-600"
            link="/distributor/payouts"
          />
          <StatCard
            title="Completed Payouts"
            value={statsLoading ? "..." : `₹${stats?.completedPayouts || 0}`}
            icon={CheckCircle}
            colorClass="text-indigo-600"
            link="/distributor/payouts"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Registrations */}
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Registrations</CardTitle>
              <Link href="/distributor/registrations">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : !customers || (customers as any[]).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No customers registered yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {(customers as any[]).slice(0, 5).map((customer: any) => (
                    <div key={customer.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${customer.deviceType === 'mobile' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                          {customer.deviceType === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.brand} {customer.modelName}</p>
                          <p className="text-xs text-gray-500">
                             {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹25.00</p>
                        <p className={`text-xs ${customer.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                          {customer.isVerified ? 'Verified' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DistributorLayout>
  );
}
