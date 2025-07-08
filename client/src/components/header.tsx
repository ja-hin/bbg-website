import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
                <div className="text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors leading-tight tracking-tight">
                  XTRACOVER
                </div>
                <span className="text-xs text-gray-600 uppercase tracking-wide font-medium -mt-1 opacity-80">
                  BuyBack Guarantee
                </span>
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors">
              Home
            </Link>
            <Link href="/customer-registration" className="text-gray-700 hover:text-red-600 transition-colors">
              Register BBG
            </Link>
            <Link href="/claim-bbg" className="text-gray-700 hover:text-red-600 transition-colors">
              Claim BBG
            </Link>
            <Link href="/distributor-registration">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Become Distributor
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
