import { DistributorSidebar } from "./distributor-sidebar";
import { useDistributorAuth } from "@/hooks/useDistributorAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ScrollToTopButton } from "./scroll-to-top-button";
import { Loader2 } from "lucide-react";

interface DistributorLayoutProps {
  children: React.ReactNode;
}

export function DistributorLayout({ children }: DistributorLayoutProps) {
  const { distributor, isLoading, isAuthenticated } = useDistributorAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !location.includes('/distributor/login')) {
      setLocation('/distributor/login');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !location.includes('/distributor/login')) {
    return null; 
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <DistributorSidebar />
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <main className="flex-1 overflow-y-auto scrollbar-hide py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="md:mt-0 mt-12">
            {children}
          </div>
        </main>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
