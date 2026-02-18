import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GoogleTranslateWidget, LanguageDetectionBanner } from "@/components/GoogleTranslateWidget";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import WeAre from "./pages/WeAre";
import StoreAudit from "./pages/StoreAudit";
import AnalyzeStore from "./pages/AnalyzeStore";
import Theme from "./pages/Theme";
import ThemeThankYou from "./pages/ThemeThankYou";
import ImproveStore from "./pages/ImproveStore";
import AllProjects from "./pages/AllProjects";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import UserDashboardLayout from "./layouts/UserDashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardAudit from "./pages/dashboard/DashboardAudit";
import DashboardChat from "./pages/dashboard/DashboardChat";
import DashboardMarketplace from "./pages/dashboard/DashboardMarketplace";
import DashboardProjects from "./pages/dashboard/DashboardProjects";
import DashboardResources from "./pages/dashboard/DashboardResources";
import NotFound from "./pages/NotFound";
import ManagerLayout from "./pages/manager/ManagerLayout";
import Dashboard from "./pages/manager/Dashboard";
import AnalysedStores from "./pages/manager/AnalysedStores";
import Services from "./pages/manager/Services";
import Orders from "./pages/manager/Orders";
import Payments from "./pages/manager/Payments";
import Messages from "./pages/manager/Messages";
import ManagerCustomerChat from "./pages/manager/ManagerCustomerChat";
import ManagerProjects from "./pages/manager/ManagerProjects";
import SignupUsers from "./pages/manager/SignupUsers";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isManager = location.pathname.startsWith("/manager");

  return (
    <>
      {!isManager && <LanguageDetectionBanner />}
      {!isManager && (
        <div className="fixed bottom-4 right-4 z-40 [&_.goog-te-banner-frame]:!hidden [&_.skiptranslate]:!hidden">
          <GoogleTranslateWidget />
        </div>
      )}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
          <Route path="/we-are" element={<WeAre />} />
          <Route path="/store-audit" element={<StoreAudit />} />
          <Route path="/analyze-store" element={<AnalyzeStore />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/theme/thank-you" element={<ThemeThankYou />} />
          <Route path="/improve-store" element={<ImproveStore />} />
          <Route path="/all-projects" element={<AllProjects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/dashboard" element={<UserDashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="audit" element={<DashboardAudit />} />
            <Route path="chat" element={<DashboardChat />} />
            <Route path="marketplace" element={<DashboardMarketplace />} />
            <Route path="projects" element={<DashboardProjects />} />
            <Route path="resources" element={<DashboardResources />} />
          </Route>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analysed-stores" element={<AnalysedStores />} />
            <Route path="services" element={<Services />} />
            <Route path="orders" element={<Orders />} />
            <Route path="payments" element={<Payments />} />
            <Route path="customer-chat" element={<ManagerCustomerChat />} />
            <Route path="messages" element={<Messages />} />
            <Route path="projects" element={<ManagerProjects />} />
            <Route path="signups" element={<SignupUsers />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
