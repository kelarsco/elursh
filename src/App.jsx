import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ManagerLayout from "./pages/manager/ManagerLayout";
import Dashboard from "./pages/manager/Dashboard";
import AnalysedStores from "./pages/manager/AnalysedStores";
import Services from "./pages/manager/Services";
import Orders from "./pages/manager/Orders";
import Payments from "./pages/manager/Payments";
import Messages from "./pages/manager/Messages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
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
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analysed-stores" element={<AnalysedStores />} />
            <Route path="services" element={<Services />} />
            <Route path="orders" element={<Orders />} />
            <Route path="payments" element={<Payments />} />
            <Route path="messages" element={<Messages />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
