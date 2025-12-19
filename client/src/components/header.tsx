import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { BuyModal } from "./buy-modal";
import bbgLogo from "@assets/Final_Buy_Back_Guarantee_Logo_1766149493956.png";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { theme } = useTheme();

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "#", label: "Buy", onClick: () => setIsBuyModalOpen(true) },
    { href: "/register", label: "Register" },
    { href: "/claim-bbg", label: "Claim" },
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

        if (item.onClick) {
          return (
            <button
              key={item.label}
              onClick={(e) => {
                e.preventDefault();
                if (mobile) {
                  onItemClick();
                  setTimeout(() => {
                    item.onClick();
                  }, 150);
                } else {
                  item.onClick();
                }
              }}
              className={`
                px-4 py-2 text-sm transition-colors rounded-full cursor-pointer
                ${
                  mobile
                    ? "block text-base text-gray-800 hover:bg-gray-100 font-normal text-left w-full"
                    : "bg-white text-black hover:bg-white/90 font-normal"
                }
              `}
            >
              {item.label}
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`
              px-4 py-2 text-sm transition-colors rounded-full
              ${
                mobile
                  ? "block text-base text-gray-800 hover:bg-gray-100 font-normal"
                  : isActive
                    ? "text-white bg-transparent font-bold"
                    : "bg-white text-black hover:bg-white/90 font-normal"
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
            ${mobile ? "w-full mt-2" : ""}
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
    <header className="z-50 shadow-md">
      {/* 4px Red line at top */}
      <div className="h-1 bg-xtra-primary"></div>
      {/* Logo Section - White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {/* XTRACOVER Logo - External Link */}
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src={bbgLogo}
                  alt="BBG Logo"
                  className="h-12 w-auto"
                />
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
                        className="h-10 w-auto"
                      />
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
      <div
        className="hidden lg:block"
        style={{ backgroundColor: (theme as any)?.primaryColor || "#254696" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-center py-3"
            style={{ gap: "23px" }}
          >
            <NavLinks />
          </nav>
        </div>
      </div>
      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </header>
  );
}
