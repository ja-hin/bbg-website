import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
  Calculator,
  Move
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

  // Icon mapping for menu items
  const iconMap: Record<string, any> = {
    BarChart3,
    Database,
    Tags,
    Users,
    ShoppingCart,
    Laptop,
    Shield,
    Calculator,
    Mail,
    MessageCircle,
    MessageSquare,
    Activity,
    Move
  };

  // Default menu items for fallback
  const defaultMenuItems = [
    { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "BarChart3", order: 1 },
    { id: "masters", label: "Masters", href: "/admin/masters", icon: "Database", order: 2 },
    { id: "brands", label: "Brands", href: "/admin/brands", icon: "Tags", order: 3 },
    { id: "distributors", label: "Referral Partners", href: "/admin/distributors", icon: "Users", order: 4 },
    { id: "cart", label: "Cart Tracking", href: "/admin/cart-abandonments", icon: "ShoppingCart", order: 5 },
    { id: "acer-reg", label: "Acer Registrations", href: "/admin/acer-registrations", icon: "Laptop", order: 6 },
    { id: "acer-imei", label: "Acer IMEI Management", href: "/admin/acer-imei", icon: "Shield", order: 7 },
    { id: "claim-slabs", label: "Claim Value Slabs", href: "/admin/claim-value-slabs", icon: "Calculator", order: 8 },
    { id: "smtp", label: "SMTP Settings", href: "/admin/smtp-settings", icon: "Mail", order: 9 },
    { id: "whatsapp", label: "WhatsApp Settings", href: "/admin/whatsapp-settings", icon: "MessageCircle", order: 10 },
    { id: "communication", label: "Communication", href: "/admin/templates", icon: "MessageSquare", order: 11 },
    { id: "logs", label: "System Logs", href: "/admin/logs", icon: "Activity", order: 12 },
    { id: "whatsapp-test", label: "WhatsApp Test", href: "/admin/whatsapp-test", icon: "MessageCircle", order: 13 }
  ];

  // Fetch menu order from backend
  const { data: menuOrderData } = useQuery({
    queryKey: ["/api/admin/menu-order"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Build menu items based on saved order or use default
  const menuItems = (menuOrderData?.menuItems || defaultMenuItems)
    .sort((a: any, b: any) => a.order - b.order)
    .map((item: any) => ({
      label: item.label,
      href: item.href,
      icon: iconMap[item.icon] || BarChart3,
      active: location === item.href || (item.href === "/admin/dashboard" && location === "/admin")
    }));

  // Add Menu Settings at the end
  menuItems.push({
    label: "Menu Settings",
    href: "/admin/menu-settings",
    icon: Move,
    active: location === "/admin/menu-settings"
  });

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