import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  ClipboardList, 
  CreditCard, 
  MapPin, 
  User, 
  LogOut, 
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import bbgLogo from "@assets/BUY_BACK_GURANTEE_LOGO_1766210821932.png";

interface CustomerLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navItems = [
  { id: 'dashboard', path: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders', path: '/customer/orders', icon: Package, label: 'My Orders' },
  { id: 'claims', path: '/customer/claims', icon: ClipboardList, label: 'My Claims' },
  { id: 'bank-details', path: '/customer/bank-details', icon: CreditCard, label: 'Bank Details' },
  { id: 'address', path: '/customer/address', icon: MapPin, label: 'Addresses' },
  { id: 'profile', path: '/customer/profile', icon: User, label: 'Profile' },
];

export function CustomerLayout({ children, title, description }: CustomerLayoutProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [customerPhone, setCustomerPhone] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    
    if (savedPhone && savedAuth === 'true') {
      setCustomerPhone(savedPhone);
      setIsAuthenticated(true);
    } else {
      navigate('/customer/login?redirect=' + encodeURIComponent(location));
    }
    setIsLoading(false);
  }, [location, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('customerPhone');
    sessionStorage.removeItem('customerAuthenticated');
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
    navigate('/customer/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#254696] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen h-screen bg-gray-50 flex overflow-hidden">
      {/* Static Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col h-full sticky top-0">
        <div className="border-b border-gray-100 flex items-center justify-center overflow-hidden h-24 shrink-0">
          <Link href="/">
            <img src={bbgLogo} alt="BBG Logo" className="h-32 w-auto cursor-pointer" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.id} href={item.path}>
                <div className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#254696] text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link href="/">
              <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium text-sm">Back to Home</span>
              </div>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#254696] flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">Customer</p>
              <p className="text-xs text-gray-500 truncate">{customerPhone}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <Link href="/">
          <div className="h-20 w-32 flex items-center justify-center overflow-hidden">
            <img src={bbgLogo} alt="BBG Logo" className="h-full w-auto scale-150 cursor-pointer" />
          </div>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.id} href={item.path}>
              <div className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                isActive ? 'text-[#254696]' : 'text-gray-400'
              }`}>
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-semibold tracking-tight">{item.label.split(' ')[0]}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pt-0 pt-14 pb-16 lg:pb-0 h-full relative">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function useCustomerAuth() {
  const [customerPhone, setCustomerPhone] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem('customerPhone');
    const savedAuth = sessionStorage.getItem('customerAuthenticated');
    
    if (savedPhone && savedAuth === 'true') {
      setCustomerPhone(savedPhone);
      setIsAuthenticated(true);
    }
  }, []);

  return { customerPhone, isAuthenticated };
}
