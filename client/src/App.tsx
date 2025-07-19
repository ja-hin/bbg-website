import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DistributorRegistration from "@/pages/distributor-registration";
import CustomerRegistration from "@/pages/customer-registration";
import ClaimBBG from "@/pages/claim-bbg";
import ThankYou from "@/pages/thank-you";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminMasters from "@/pages/admin-masters";
import AdminBrands from "@/pages/admin-brands";
import AdminDistributors from "@/pages/admin-distributors";
import AdminTemplates from "@/pages/admin-templates";
import DistributorLogin from "@/pages/distributor-login";
import DistributorDashboard from "@/pages/distributor-dashboard";
import { useAuth } from "@/hooks/useAuth";

function AdminRoot() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    window.location.href = "/admin/dashboard";
  } else {
    window.location.href = "/admin/login";
  }

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Admin routes without header/footer */}
      <Route path="/admin" component={AdminRoot} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/masters" component={AdminMasters} />
      <Route path="/admin/brands" component={AdminBrands} />
      <Route path="/admin/distributors" component={AdminDistributors} />
      <Route path="/admin/templates" component={AdminTemplates} />
      
      {/* Distributor routes without header/footer */}
      <Route path="/distributor/login" component={DistributorLogin} />
      <Route path="/distributor/dashboard" component={DistributorDashboard} />
      
      {/* Regular routes with header/footer */}
      <Route>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/referral-partner-registration" component={DistributorRegistration} />
              <Route path="/customer-registration" component={CustomerRegistration} />
              <Route path="/claim-bbg" component={ClaimBBG} />
              <Route path="/thank-you" component={ThankYou} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
