import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, User, ShoppingCart, ChevronDown, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { BuyModal } from "./buy-modal";
import { CustomerLoginModal } from "./customer-login-modal";
import bbgLogo from "@assets/BUY_BACK_GURANTEE_LOGO_1766210821932.webp";

export default function Header() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useCustomerAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "#", label: "Buy", onClick: () => setIsBuyModalOpen(true) },
    { href: "/register", label: "Register" },
    { href: "https://www.xtracover.com/about-us", label: "About Us", external: true },
    { href: "https://www.xtracover.com/contact-us", label: "Contact Us", external: true },
  ];

  const profileMenuItems = [
    { href: "/customer/orders", label: "My Orders", requiresAuth: true },
    { href: "/customer/claims", label: "My Claims", requiresAuth: true },
    { href: "/customer/address", label: "Manage Addresses", requiresAuth: true },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && href !== "#" && location.startsWith(href)) return true;
    return false;
  };

  const handleProtectedNavigation = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate(`/customer/login?redirect=${encodeURIComponent(path)}`);
    }
    setIsProfileDropdownOpen(false);
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate(`/customer/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate("/");
  };

  const NavLinks = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navigationItems.map((item) => {
        const isActive = isActiveLink(item.href);

        if (item.onClick) {
          return (
            <button
              key={item.label}
              onClick={(e) => {
                e.preventDefault();
                if (mobile) {
                  onItemClick();
                  setTimeout(() => {
                    item.onClick!();
                  }, 150);
                } else {
                  item.onClick!();
                }
              }}
              className={`
                px-4 py-2 text-sm transition-all cursor-pointer
                ${
                  mobile
                    ? "block text-base text-gray-800 hover:bg-gray-100 font-normal text-left w-full rounded-lg"
                    : "text-white hover:opacity-80 font-medium"
                }
              `}
            >
              {item.label}
            </button>
          );
        }

        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onItemClick}
              className={`
                px-4 py-2 text-sm transition-all
                ${
                  mobile
                    ? "block text-base text-gray-800 hover:bg-gray-100 font-normal rounded-lg"
                    : "text-white hover:opacity-80 font-medium"
                }
              `}
            >
              {item.label}
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`
              px-4 py-2 text-sm transition-all
              ${
                mobile
                  ? "block text-base text-gray-800 hover:bg-gray-100 font-normal rounded-lg"
                  : isActive
                    ? "text-white font-bold"
                    : "text-white hover:opacity-80 font-medium"
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="z-50 shadow-md">
      {/* 4px Red line */}
      <div className="h-1 bg-xtra-primary"></div>

      {/* Logo Section - White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src={bbgLogo}
                  alt="BBG Logo"
                  className="h-32 w-auto"
                />
              </Link>
            </div>

            {/* Partner Links - Right Aligned in White Section */}
            <div className="hidden lg:flex items-center gap-4 ml-auto mr-8">
              <Link 
                href="/referral-partner-registration"
                className="text-sm text-gray-600 hover:text-[#254696] font-medium transition-colors"
              >
                Become a Partner
              </Link>
              <Link href="/distributor/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-sm border-[#254696] text-[#254696] hover:bg-[#254696] hover:text-white"
                >
                  Partner Login
                </Button>
              </Link>
            </div>

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
                <SheetContent
                  side="right"
                  className="w-80 text-gray-800 border-none bg-white"
                >
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Mobile Logo */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                      <img
                        src={bbgLogo}
                        alt="BBG Logo"
                        className="h-24 w-auto"
                      />
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-2">
                      <NavLinks
                        mobile={true}
                        onItemClick={() => setIsOpen(false)}
                      />
                      <hr className="my-2 border-gray-100" />
                      <Link 
                        href="/referral-partner-registration"
                        className="block px-4 py-2 text-base text-gray-800 hover:bg-gray-100 font-normal rounded-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        Become a Partner
                      </Link>
                      <Link 
                        href="/distributor/login"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start h-10 px-4 text-base border-[#254696] text-[#254696]"
                        >
                          Partner Login
                        </Button>
                      </Link>
                    </nav>

                    {/* Mobile Profile Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Account</p>
                      {isAuthenticated ? (
                        <>
                          {profileMenuItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setIsOpen(false);
                                handleProtectedNavigation(item.href);
                              }}
                              className="block w-full text-left text-base text-gray-800 hover:bg-gray-100 font-normal rounded-lg px-4 py-2"
                            >
                              {item.label}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              handleLogout();
                            }}
                            className="block w-full text-left text-base text-red-600 hover:bg-red-50 font-normal rounded-lg px-4 py-2 mt-2"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/customer/login");
                          }}
                          className="block w-full text-left text-base text-[#254696] hover:bg-gray-100 font-medium rounded-lg px-4 py-2"
                        >
                          Sign In
                        </button>
                      )}
                    </div>

                    {/* Mobile Cart */}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleCartClick();
                      }}
                      className="flex items-center gap-2 text-base text-gray-800 hover:bg-gray-100 font-normal rounded-lg px-4 py-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section - Theme Color Background */}
      <div
        className="hidden lg:block"
        style={{ backgroundColor: (theme as any)?.primaryColor || "#254696" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-3">
            {/* Left spacer for balance */}
            <div className="w-32"></div>

            {/* Center Navigation Links */}
            <div className="flex items-center" style={{ gap: "20px" }}>
              <NavLinks />
            </div>

            {/* Right - Profile & Cart */}
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1 text-white hover:opacity-80 transition-opacity"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handleProtectedNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.label}
                          </button>
                        ))}
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigate("/customer/login");
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                        >
                          Sign In
                        </button>
                        <hr className="my-2 border-gray-200" />
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handleProtectedNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                          >
                            {item.label}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <button
                onClick={handleCartClick}
                className="text-white hover:opacity-80 transition-opacity"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </header>
  );
}
