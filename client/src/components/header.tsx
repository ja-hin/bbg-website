import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Home, Shield, UserPlus, FileText, ShoppingBag, Smartphone } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/customer-registration", label: "Buy BBG", icon: ShoppingBag },
    { href: "/acer-bbg-registration", label: "Register BBG", icon: Smartphone },
    { href: "/claim-bbg", label: "Claim BBG", icon: FileText },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveLink(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`
              ${mobile 
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors' 
                : 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors'
              }
              ${isActive 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }
            `}
          >
            <Icon className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link href="/referral-partner-registration" onClick={onItemClick}>
        <Button 
          className={`
            ${mobile ? 'w-full justify-start space-x-3' : ''}
            bg-red-600 hover:bg-red-700 text-white
          `}
          size={mobile ? "default" : "sm"}
        >
          <UserPlus className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span>Join Referral Program</span>
        </Button>
      </Link>
      
      {/* Distributor Login Link */}
      <Link href="/distributor/login" onClick={onItemClick}>
        <Button 
          variant="outline"
          className={`
            ${mobile ? 'w-full justify-start space-x-3' : ''}
            border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700
          `}
          size={mobile ? "default" : "sm"}
        >
          <UserPlus className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span>Referral Partner Login</span>
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="flex items-center space-x-3">
              {/* Enhanced Logo Icon */}
              <div className="relative flex items-center justify-center">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 40 40" 
                  className="group-hover:scale-105 transition-transform duration-200"
                >
                  {/* Background Circle */}
                  <circle 
                    cx="20" 
                    cy="20" 
                    r="18" 
                    fill="url(#redGradient)" 
                    className="drop-shadow-sm"
                  />
                  
                  {/* Shield Icon */}
                  <path 
                    d="M20 6L28 10V18C28 24 24 28 20 32C16 28 12 24 12 18V10L20 6Z" 
                    fill="white" 
                    stroke="white" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Check Mark */}
                  <path 
                    d="M16 19L19 22L24 17" 
                    stroke="#10B981" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#B91C1C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Brand Name */}
              <div className="flex flex-col">
                <div className="text-xl sm:text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors leading-tight tracking-tight">
                  XTRACOVER
                </div>
                <span className="text-xs text-gray-600 uppercase tracking-wide font-medium -mt-1 opacity-80 hidden sm:block">
                  BuyBack Guarantee
                </span>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  {isOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <nav className="flex flex-col space-y-2">
                    <NavLinks 
                      mobile={true} 
                      onItemClick={() => setIsOpen(false)} 
                    />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
