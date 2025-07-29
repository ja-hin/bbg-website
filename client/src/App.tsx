import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
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
import AcerBBG from "@/pages/acer-bbg";
import AcerThankYou from "@/pages/acer-thank-you";
import CustomerDashboard from "@/pages/customer-dashboard";
import CustomerLogin from "@/pages/customer-login";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminDashboardNew from "@/pages/admin-dashboard-new";
import AdminMasters from "@/pages/admin-masters";
import AdminBrands from "@/pages/admin-brands";
import AdminBrandsNew from "@/pages/admin-brands-new";
import AdminDistributors from "@/pages/admin-distributors";
import AdminTemplates from "@/pages/admin-templates";
import AdminLogs from "@/pages/admin-logs";
import AdminWhatsAppTest from "@/pages/admin-whatsapp-test";
import AdminCartAbandonments from "@/pages/admin-cart-abandonments";
import AdminStorage from "@/pages/admin-storage";
import AdminAcerRegistrations from "@/pages/admin-acer-registrations";
import AdminAcerImei from "@/pages/admin-acer-imei";
import DistributorLogin from "@/pages/distributor-login";
import DistributorDashboard from "@/pages/distributor-dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

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
  // Automatically scroll to top on route changes
  useScrollToTop();
  
  return (
    <Switch>
      {/* Admin routes without header/footer */}
      <Route path="/admin" component={AdminRoot} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboardNew} />
      <Route path="/admin/masters" component={AdminMasters} />
      <Route path="/admin/brands" component={AdminBrandsNew} />
      <Route path="/admin/distributors" component={AdminDistributors} />
      <Route path="/admin/templates" component={AdminTemplates} />
      <Route path="/admin/logs" component={AdminLogs} />
      <Route path="/admin/storage" component={AdminStorage} />
      <Route path="/admin/whatsapp-test" component={AdminWhatsAppTest} />
      <Route path="/admin/hsm-templates" component={lazy(() => import("./pages/admin-hsm-templates"))} />
      <Route path="/admin/cart-abandonments">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <AdminCartAbandonments />
        </Suspense>
      </Route>
      <Route path="/admin/acer-registrations" component={AdminAcerRegistrations} />
      <Route path="/admin/acer-imei">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <AdminAcerImei />
        </Suspense>
      </Route>
      
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
              <Route path="/acer" component={AcerBBG} />
              <Route path="/acer-bbg" component={AcerBBG} />
              <Route path="/acer-thank-you" component={AcerThankYou} />
              <Route path="/customer/login" component={CustomerLogin} />
              <Route path="/customer-dashboard" component={CustomerDashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
          <ScrollToTopButton />
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
