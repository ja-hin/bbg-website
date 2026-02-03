import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Footer = lazy(() => import("@/components/footer"));
const NotFound = lazy(() => import("@/pages/not-found"));
const DistributorRegistration = lazy(() => import("@/pages/distributor-registration"));
const ThankYou = lazy(() => import("@/pages/thank-you"));
const AcerBBG = lazy(() => import("@/pages/acer-bbg"));
const AcerThankYou = lazy(() => import("@/pages/acer-thank-you"));
const AmazonBBG = lazy(() => import("@/pages/amazon-bbg"));
const AmazonThankYou = lazy(() => import("@/pages/amazon-thank-you"));
const Register = lazy(() => import("@/pages/register"));
const RegistrationThankYou = lazy(() => import("@/pages/registration-thank-you"));
const CustomerLogin = lazy(() => import("@/pages/customer-login"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboardNew = lazy(() => import("@/pages/admin-dashboard-new"));
const AdminMasters = lazy(() => import("@/pages/admin-masters"));
const AdminBrandsNew = lazy(() => import("@/pages/admin-brands-new"));
const AdminDistributors = lazy(() => import("@/pages/admin-distributors"));
const AdminTemplates = lazy(() => import("@/pages/admin-templates"));
const AdminLogs = lazy(() => import("@/pages/admin-logs"));
const AdminWhatsAppTest = lazy(() => import("@/pages/admin-whatsapp-test"));
const AdminCartAbandonments = lazy(() => import("@/pages/admin-cart-abandonments"));
const AdminAcerRegistrations = lazy(() => import("@/pages/admin-acer-registrations"));
const AdminAcerImei = lazy(() => import("@/pages/admin-acer-imei"));
const AdminAmazonLicense = lazy(() => import("@/pages/admin-amazon-license"));
const AdminClaimSlabs = lazy(() => import("@/pages/admin-claim-slabs"));
const AdminClaimValueSlabs = lazy(() => import("@/pages/admin-claim-value-slabs"));
const AdminPlans = lazy(() => import("@/pages/admin-plans"));
const AdminSmtpSettings = lazy(() => import("@/pages/admin-smtp-settings"));
const AdminWhatsAppSettings = lazy(() => import("@/pages/admin-whatsapp-settings"));
const AdminAdminUsers = lazy(() => import("@/pages/admin-admin-users"));
const AdminMenuSettings = lazy(() => import("@/pages/admin-menu-settings"));
const AdminBbgSettings = lazy(() => import("@/pages/admin-bbg-settings"));
const AdminReferralDiscountSettings = lazy(() => import("@/pages/admin-referral-discount-settings"));
const AdminPartnerCommissionSettings = lazy(() => import("@/pages/admin-partner-commission-settings"));
const AdminPlanConfigurations = lazy(() => import("@/pages/admin-plan-configurations"));
const AdminWaitingPeriodSettings = lazy(() => import("@/pages/admin-waiting-period-settings"));
const AdminHomepageBanners = lazy(() => import("@/pages/admin/homepage-banners"));
const AdminCustomerRegistrations = lazy(() => import("@/pages/admin/customer-registrations"));
const AdminTransactionHistory = lazy(() => import("@/pages/admin/admin-transaction-history"));
const DistributorLogin = lazy(() => import("@/pages/distributor-login"));
const DistributorDashboard = lazy(() => import("@/pages/distributor-dashboard"));
const TermsAndConditions = lazy(() => import("@/pages/terms-and-conditions"));
const Plans = lazy(() => import("@/pages/plans"));
const Checkout = lazy(() => import("@/pages/checkout"));
const ScrollToTopButton = lazy(() => import("@/components/scroll-to-top-button").then(m => ({ default: m.ScrollToTopButton })));
const ThemeLoader = lazy(() => import("@/components/theme-loader").then(m => ({ default: m.ThemeLoader })));

const CustomerDashboard = lazy(() => import("@/pages/customer/dashboard"));
const CustomerOrders = lazy(() => import("@/pages/customer/orders"));
const CustomerClaims = lazy(() => import("@/pages/customer/claims"));
const CustomerBankDetails = lazy(() => import("@/pages/customer/bank-details"));
const CustomerAddress = lazy(() => import("@/pages/customer/address"));
const CustomerProfile = lazy(() => import("@/pages/customer/profile"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function AdminRoot() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    window.location.href = "/admin/dashboard";
  } else {
    window.location.href = "/admin/login";
  }

  return null;
}

function Router() {
  useScrollToTop();
  
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/admin/cart-abandonments" component={AdminCartAbandonments} />
        <Route path="/admin/acer-registrations" component={AdminAcerRegistrations} />
        <Route path="/admin/acer-imei" component={AdminAcerImei} />
        <Route path="/admin/amazon-license" component={AdminAmazonLicense} />
        <Route path="/admin/claim-slabs" component={AdminClaimSlabs} />
        <Route path="/admin/claim-value-slabs" component={AdminClaimValueSlabs} />
        <Route path="/admin/plans" component={AdminPlans} />
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
        
        {/* Customer portal routes (protected, no header/footer) */}
        <Route path="/customer/dashboard" component={CustomerDashboard} />
        <Route path="/customer/orders" component={CustomerOrders} />
        <Route path="/customer/claims" component={CustomerClaims} />
        <Route path="/customer/bank-details" component={CustomerBankDetails} />
        <Route path="/customer/address" component={CustomerAddress} />
        <Route path="/customer/profile" component={CustomerProfile} />
        
        {/* Regular routes with header/footer */}
        <Route>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/plans" component={Plans} />
                <Route path="/checkout" component={Checkout} />
                <Route path="/referral-partner-registration" component={DistributorRegistration} />
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
                <Route path="/terms-and-conditions" component={TermsAndConditions} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
            <Suspense fallback={null}>
              <ScrollToTopButton />
            </Suspense>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={null}>
          <ThemeLoader />
        </Suspense>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
