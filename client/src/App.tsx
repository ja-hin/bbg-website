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

function Router() {
  return (
    <Switch>
      {/* Admin routes without header/footer */}
      <Route path="/admin" component={() => {
        // Redirect /admin to /admin/login
        window.location.href = "/admin/login";
        return null;
      }} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      {/* Regular routes with header/footer */}
      <Route>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/distributor-registration" component={DistributorRegistration} />
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
