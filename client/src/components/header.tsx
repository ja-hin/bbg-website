import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
              ${mobile 
                ? 'block px-4 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors rounded-lg' 
                : `px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                    isActive 
                      ? 'text-white' 
                      : 'bg-white text-black hover:bg-white/90'
                  }`
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
    <header className="sticky top-0 z-50 bg-[#254696] shadow-md">
      {/* Red line at top */}
      <div className="h-px bg-red-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              {/* Logo Icon */}
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#254696] font-bold text-sm">X</span>
              </div>
              
              {/* Brand Name */}
              <span className="text-white font-bold text-xl">XTRACOVER</span>
              <span className="text-white/90 text-lg font-medium">| BBG</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 text-white hover:bg-white/10"
                >
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-[#254696] text-white border-none">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-white/20">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[#254696] font-bold text-sm">X</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">XTRACOVER</div>
                      <div className="text-white/80 text-sm">BBG</div>
                    </div>
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
    </header>
  );
}
