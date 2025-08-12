import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/customer-registration", label: "Buy BBG" },
    { href: "/acer", label: "Register Acer BBG" },
    { href: "/claim-bbg", label: "Claim BBG" },
    { href: "/referral-partner-registration", label: "Join Referral Program" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navigationItems.map((item) => {
        const isActive = isActiveLink(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`
              px-4 py-2 text-sm transition-colors rounded-full
              ${mobile 
                ? 'block text-base text-white hover:bg-white/10 font-normal' 
                : isActive 
                  ? 'text-white bg-transparent font-bold' 
                  : 'bg-white text-black hover:bg-white/90 font-normal'
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
      
      {/* Referral Partner Login Button */}
      <Link href="/distributor/login" onClick={onItemClick}>
        <Button 
          className={`
            ${mobile ? 'w-full mt-2' : ''}
            bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-full transition-colors
          `}
          size="sm"
        >
          Referral Partner Login
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 4px Red line at top */}
      <div className="h-1 bg-red-500"></div>
      
      {/* Logo Section - White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="flex items-center space-x-3">
                {/* XTRACOVER Logo */}
                <img 
                  src="https://images.xtracover.com/StaticImages/mobile_img/newui/logo.svg" 
                  alt="XTRACOVER Logo" 
                  className="h-12 w-auto"
                />
                <span className="text-gray-600 text-xl font-medium">| BBG</span>
              </div>
            </Link>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 p-0 text-gray-600 hover:bg-gray-100"
                  >
                    {isOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 text-white border-none" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Mobile Logo */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-white/20">
                      <img 
                        src="https://images.xtracover.com/StaticImages/mobile_img/newui/logo.svg" 
                        alt="XTRACOVER Logo" 
                        className="h-10 w-auto"
                      />
                      <span className="text-white/90 text-xl font-medium">| BBG</span>
                    </div>
                    
                    {/* Mobile Navigation */}
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
      </div>

      {/* Navigation Section - Theme Color Background */}
      <div className="hidden lg:block" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-2 py-3">
            <NavLinks />
          </nav>
        </div>
      </div>
    </header>
  );
}
