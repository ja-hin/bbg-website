import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-red-600">XTRACOVER</div>
            <span className="ml-2 text-sm text-gray-600">BuyBack Guarantee</span>
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
