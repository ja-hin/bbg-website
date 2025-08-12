import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Home, Shield, UserPlus, FileText, ShoppingBag, Smartphone, Phone, Mail } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/customer-registration", label: "Buy BBG", icon: ShoppingBag },
    { href: "/acer", label: "Register Acer BBG", icon: Smartphone },
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
                : 'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105'
              }
              ${isActive 
                ? 'text-white bg-xtra-primary shadow-md' 
                : 'text-gray-700 hover:text-xtra-primary hover:bg-xtra-primary/5'
              }
            `}
          >
            <Icon className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100">
      {/* Top Contact Bar */}
      <div className="bg-xtra-primary text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@xtracover.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/distributor/login" className="hover:text-gray-200 transition-colors">
                Distributor Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/referral-partner-registration" className="hover:text-gray-200 transition-colors">
                Join as Partner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="flex items-center space-x-4">
              {/* Enhanced Logo Icon */}
              <div className="relative flex items-center justify-center">
                <svg 
                  width="50" 
                  height="50" 
                  viewBox="0 0 50 50" 
                  className="group-hover:scale-105 transition-transform duration-300"
                >
                  {/* Background Circle with Gradient */}
                  <circle 
                    cx="25" 
                    cy="25" 
                    r="22" 
                    fill="url(#logoGradient)" 
                    className="drop-shadow-lg"
                  />
                  
                  {/* Outer Ring */}
                  <circle 
                    cx="25" 
                    cy="25" 
                    r="18" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  
                  {/* Shield Icon */}
                  <path 
                    d="M25 10L32 13V20C32 25 29 29 25 32C21 29 18 25 18 20V13L25 10Z" 
                    fill="white" 
                    stroke="white" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Check Mark */}
                  <path 
                    d="M21 22L24 25L29 20" 
                    stroke="#10B981" 
                    strokeWidth="2.5" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#254696" />
                      <stop offset="50%" stopColor="#1e3a8a" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Brand Name */}
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl font-bold text-xtra-primary group-hover:text-xtra-primary/90 transition-colors leading-tight tracking-tight">
                  XTRACOVER
                </div>
                <span className="text-xs text-gray-600 uppercase tracking-wider font-medium -mt-1 opacity-80 hidden sm:block">
                  BuyBack Guarantee Protection
                </span>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <NavLinks />
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
              <Link href="/customer-registration">
                <Button 
                  className="bg-gradient-to-r from-xtra-primary to-blue-600 hover:from-xtra-primary/90 hover:to-blue-600/90 text-white font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Get BBG Now
                </Button>
              </Link>
              
              <Link href="/claim-bbg">
                <Button 
                  variant="outline"
                  className="border-2 border-xtra-primary text-xtra-primary hover:bg-xtra-primary hover:text-white font-medium px-6 py-2 transition-all duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Claim BBG
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-12 w-12 p-0 hover:bg-xtra-primary/10"
                >
                  {isOpen ? (
                    <X className="h-6 w-6 text-xtra-primary" />
                  ) : (
                    <Menu className="h-6 w-6 text-xtra-primary" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="url(#mobileGradient)" />
                      <path d="M20 8L26 11V17C26 21 24 24 20 26C16 24 14 21 14 17V11L20 8Z" fill="white" />
                      <path d="M17 18L19 20L23 16" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="mobileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#254696" />
                          <stop offset="100%" stopColor="#1e40af" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div>
                      <div className="text-lg font-bold text-xtra-primary">XTRACOVER</div>
                      <div className="text-xs text-gray-600">BuyBack Guarantee</div>
                    </div>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    <NavLinks 
                      mobile={true} 
                      onItemClick={() => setIsOpen(false)} 
                    />
                    
                    {/* Mobile Contact Info */}
                    <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                      <div className="flex items-center space-x-3 px-4 py-2 text-gray-600">
                        <Phone className="w-5 h-5" />
                        <span>+91 1800-XXX-XXXX</span>
                      </div>
                      <div className="flex items-center space-x-3 px-4 py-2 text-gray-600">
                        <Mail className="w-5 h-5" />
                        <span>support@xtracover.com</span>
                      </div>
                    </div>
                    
                    {/* Mobile CTA Buttons */}
                    <div className="pt-4 space-y-3">
                      <Link href="/customer-registration" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-xtra-primary hover:bg-xtra-primary/90 text-white">
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          Get BBG Now
                        </Button>
                      </Link>
                      <Link href="/distributor/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-xtra-primary text-xtra-primary">
                          <UserPlus className="w-5 h-5 mr-2" />
                          Distributor Login
                        </Button>
                      </Link>
                    </div>
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
