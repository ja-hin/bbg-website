import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  UserCircle, 
  LogOut, 
  Menu,
  X,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDistributorAuth } from "@/hooks/useDistributorAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DistributorSidebarProps {
  className?: string;
}

export function DistributorSidebar({ className }: DistributorSidebarProps) {
  const { distributor, logout } = useDistributorAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Menu items
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      href: "/distributor/dashboard", 
      icon: LayoutDashboard,
      active: location === "/distributor/dashboard" 
    },
    { 
      id: "registrations", 
      label: "Customer Registrations", 
      href: "/distributor/registrations", 
      icon: Users,
      active: location === "/distributor/registrations" 
    },
    { 
      id: "payouts", 
      label: "Earnings & Payouts", 
      href: "/distributor/payouts", 
      icon: Wallet,
      active: location === "/distributor/payouts" 
    },
    { 
      id: "promote", 
      label: "Promote BBG", 
      href: "/distributor/promote", 
      icon: Megaphone,
      active: location === "/distributor/promote" 
    },
    { 
      id: "profile", 
      label: "Profile Settings", 
      href: "/distributor/profile", 
      icon: UserCircle,
      active: location === "/distributor/profile" 
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Partner Portal</h1>
            <p className="text-xs text-white/50">Referral Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal mb-1",
                  item.active
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", item.active ? "text-white" : "text-white/50")} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 bg-slate-950/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
            <span className="font-semibold text-blue-400">
              {distributor?.name?.charAt(0) || "D"}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{distributor?.name}</p>
            <p className="text-xs text-white/50 truncate">{distributor?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-50", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-50 text-slate-900">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-slate-900">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
