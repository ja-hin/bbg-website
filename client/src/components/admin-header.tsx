import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Shield, Database, Tags, LogOut, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function AdminHeader() {
  const { adminUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Logout mutation started');
      const result = await apiRequest("/api/admin/logout", { method: "POST" });
      console.log('Logout response received');
      return result;
    },
    onSuccess: (data) => {
      console.log('Logout successful:', data);
      // Signal logout to other tabs via localStorage
      localStorage.setItem('admin_logout', Date.now().toString());
      localStorage.removeItem('admin_logout'); // Clean up immediately
      
      // Clear all queries and redirect
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      setLocation("/admin/login");
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout properly",
        variant: "destructive"
      });
      // Still redirect to login even if logout fails
      queryClient.clear();
      setLocation("/admin/login");
    }
  });

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BBG Admin Panel</h1>
                <p className="text-sm text-gray-500">Welcome, {adminUser?.username || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Shield className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/distributors">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Users className="h-4 w-4 mr-2" />
                  Distributors
                </Button>
              </Link>
              <Link href="/admin/templates">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Mail className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link href="/admin/masters">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Database className="h-4 w-4 mr-2" />
                  Masters
                </Button>
              </Link>
              <Link href="/admin/brands">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Tags className="h-4 w-4 mr-2" />
                  Brands
                </Button>
              </Link>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Logout button clicked');
              logoutMutation.mutate();
            }}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}