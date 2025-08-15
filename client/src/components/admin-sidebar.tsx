import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  Shield, 
  Database, 
  Tags, 
  LogOut, 
  Users, 
  Mail, 
  Activity, 
  MessageCircle, 
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Settings,
  Home,
  Cloud,
  Laptop,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("/api/admin/logout", { method: "POST" });
      return result;
    },
    onSuccess: () => {
      localStorage.setItem('admin_logout', Date.now().toString());
      localStorage.removeItem('admin_logout');
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      setLocation("/admin/login");
    },
    onError: (error: any) => {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout properly",
        variant: "destructive"
      });
      queryClient.clear();
      setLocation("/admin/login");
    }
  });

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
      active: location === "/admin/dashboard" || location === "/admin"
    },
    {
      label: "Referral Partners",
      href: "/admin/distributors", 
      icon: Users,
      active: location === "/admin/distributors"
    },
    {
      label: "Cart Tracking",
      href: "/admin/cart-abandonments",
      icon: ShoppingCart,
      active: location === "/admin/cart-abandonments"
    },
    {
      label: "Acer Registrations",
      href: "/admin/acer-registrations",
      icon: Laptop,
      active: location === "/admin/acer-registrations"
    },
    {
      label: "Acer IMEI Management",
      href: "/admin/acer-imei",
      icon: Shield,
      active: location === "/admin/acer-imei"
    },
    {
      label: "Claim Value Slabs",
      href: "/admin/claim-value-slabs",
      icon: Calculator,
      active: location === "/admin/claim-value-slabs"
    },

    {
      label: "SMTP Settings",
      href: "/admin/smtp-settings",
      icon: Mail,
      active: location === "/admin/smtp-settings"
    },
    {
      label: "WhatsApp Settings",
      href: "/admin/whatsapp-settings",
      icon: MessageCircle,
      active: location === "/admin/whatsapp-settings"
    },
    {
      label: "Communication",
      href: "/admin/templates",
      icon: MessageSquare,
      active: location === "/admin/templates"
    },
    {
      label: "System Logs",
      href: "/admin/logs",
      icon: Activity,
      active: location === "/admin/logs"
    },

    {
      label: "WhatsApp Test",
      href: "/admin/whatsapp-test",
      icon: MessageCircle,
      active: location === "/admin/whatsapp-test"
    },
    {
      label: "Masters",
      href: "/admin/masters",
      icon: Database,
      active: location === "/admin/masters"
    },
    {
      label: "Brands",
      href: "/admin/brands",
      icon: Tags,
      active: location === "/admin/brands"
    }
  ];

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-xtra-primary text-white overflow-hidden", className)}>
      {/* Header */}
      <div className="flex h-16 items-center border-b border-white/20 px-6">
        <Shield className="h-8 w-8 text-white mr-3" />
        <div>
          <h1 className="text-lg font-semibold">BBG Admin</h1>
          <p className="text-xs text-white/70">Management Panel</p>
        </div>
      </div>

      {/* User Info */}
      <div className="border-b border-white/20 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{(user as any)?.username || 'Admin'}</p>
            <p className="text-xs text-white/70">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  item.active
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "text-white/80 hover:bg-white/20 hover:text-white"
                )}
                size="sm"
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Logout */}
      <div className="border-t border-white/20 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-left font-normal text-white/80 hover:bg-white/20 hover:text-white"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          size="sm"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}