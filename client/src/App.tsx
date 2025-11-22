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
import AmazonBBG from "@/pages/amazon-bbg";
import AmazonThankYou from "@/pages/amazon-thank-you";
import Register from "@/pages/register";
import RegistrationThankYou from "@/pages/registration-thank-you";
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

import AdminAcerRegistrations from "@/pages/admin-acer-registrations";
import AdminAcerImei from "@/pages/admin-acer-imei";
import AdminAmazonLicense from "@/pages/admin-amazon-license";
import AdminClaimSlabs from "@/pages/admin-claim-slabs";
import AdminClaimValueSlabs from "@/pages/admin-claim-value-slabs";

import AdminSmtpSettings from "@/pages/admin-smtp-settings";
import AdminWhatsAppSettings from "@/pages/admin-whatsapp-settings";
import AdminAdminUsers from "@/pages/admin-admin-users";
import AdminMenuSettings from "@/pages/admin-menu-settings";
import AdminBbgSettings from "@/pages/admin-bbg-settings";
import AdminReferralDiscountSettings from "@/pages/admin-referral-discount-settings";
import AdminPartnerCommissionSettings from "@/pages/admin-partner-commission-settings";
import AdminPlanConfigurations from "@/pages/admin-plan-configurations";
import AdminWaitingPeriodSettings from "@/pages/admin-waiting-period-settings";
import AdminHomepageBanners from "@/pages/admin/homepage-banners";
import AdminCustomerRegistrations from "@/pages/admin/customer-registrations";
import AdminTransactionHistory from "@/pages/admin/admin-transaction-history";
import DistributorLogin from "@/pages/distributor-login";
import DistributorDashboard from "@/pages/distributor-dashboard";
import TermsAndConditions from "@/pages/terms-and-conditions";
import { useAuth } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { ThemeLoader } from "@/components/theme-loader";

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
      <Route path="/admin/amazon-license">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <AdminAmazonLicense />
        </Suspense>
      </Route>
      <Route path="/admin/claim-slabs" component={AdminClaimSlabs} />
      <Route path="/admin/claim-value-slabs" component={AdminClaimValueSlabs} />

      <Route path="/admin/smtp-settings" component={AdminSmtpSettings} />
      <Route path="/admin/whatsapp-settings" component={AdminWhatsAppSettings} />
      <Route path="/admin/admin-users" component={AdminAdminUsers} />
      <Route path="/admin/menu-settings" component={AdminMenuSettings} />
      <Route path="/admin/bbg-settings" component={AdminBbgSettings} />
      <Route path="/admin/referral-discount-settings" component={AdminReferralDiscountSettings} />
      <Route path="/admin/partner-commission-settings" component={AdminPartnerCommissionSettings} />
      <Route path="/admin/plan-configurations" component={AdminPlanConfigurations} />
      <Route path="/admin/waiting-period-settings" component={AdminWaitingPeriodSettings} />
      <Route path="/admin/homepage-banners" component={AdminHomepageBanners} />
      <Route path="/admin/customer-registrations" component={AdminCustomerRegistrations} />
      <Route path="/admin/transaction-history" component={AdminTransactionHistory} />
      
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
              <Route path="/buy-bbg" component={CustomerRegistration} />
              <Route path="/claim-bbg" component={ClaimBBG} />
              <Route path="/thank-you" component={ThankYou} />
              <Route path="/acer" component={AcerBBG} />
              <Route path="/acer-bbg" component={AcerBBG} />
              <Route path="/acer-thank-you" component={AcerThankYou} />
              <Route path="/amazon" component={AmazonBBG} />
              <Route path="/amazon-bbg" component={AmazonBBG} />
              <Route path="/amazon-thank-you" component={AmazonThankYou} />
              <Route path="/register" component={Register} />
              <Route path="/registration-thank-you" component={RegistrationThankYou} />
              <Route path="/customer/login" component={CustomerLogin} />
              <Route path="/customer-dashboard" component={CustomerDashboard} />
              <Route path="/terms-and-conditions" component={TermsAndConditions} />
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
        <ThemeLoader />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
