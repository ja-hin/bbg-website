import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DistributorRegistration from "@/pages/distributor-registration";
import CustomerRegistration from "@/pages/customer-registration";
import ClaimBBG from "@/pages/claim-bbg";
import ThankYou from "@/pages/thank-you";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/distributor-registration" component={DistributorRegistration} />
      <Route path="/customer-registration" component={CustomerRegistration} />
      <Route path="/claim-bbg" component={ClaimBBG} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
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
