import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import GetReady from "./pages/GetReady";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/get-ready" element={<GetReady />} />
          <Route path="/discover" element={<Index defaultTab="discover" />} />
          <Route path="/matches" element={<Index defaultTab="matches" />} />
          <Route path="/chat" element={<Index defaultTab="chat" />} />
          <Route path="/profile" element={<Index defaultTab="profile" />} />
          <Route path="/edit-profile" element={<Index defaultTab="profile" subPage="edit" />} />
          <Route path="/settings" element={<Index defaultTab="profile" subPage="settings" />} />
          <Route path="/notifications" element={<Index defaultTab="profile" subPage="notifications" />} />
          <Route path="/privacy" element={<Index defaultTab="profile" subPage="privacy" />} />
          <Route path="/upgrade" element={<Index defaultTab="profile" subPage="upgrade" />} />
          <Route path="/support" element={<Index defaultTab="profile" subPage="support" />} />
          <Route path="/terms" element={<Index defaultTab="profile" subPage="terms" />} />
          <Route path="/privacy-policy" element={<Index defaultTab="profile" subPage="privacy-policy" />} />
          <Route path="/@:username" element={<PublicProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
