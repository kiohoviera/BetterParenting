import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/components/pages/Index";
import { AboutPage } from "@/components/pages/AboutPage";
import { ContactPage } from "@/components/pages/ContactPage";
import { PricingPage } from "@/components/pages/PricingPage";
import { TermsOfService } from "@/components/shared/TermsOfService";
import { PrivacyPolicy } from "@/components/shared/PrivacyPolicy";
import { FAQ } from "@/components/pages/FAQ";
import NotFound from "@/components/shared/NotFound";
import { LoginPage } from "@/components/pages/LoginPage";
import { RegisterPage } from "@/components/pages/RegisterPage";
import { AuthProvider } from "./contexts/AuthContext";

import { AccountUpdatePage } from "@/components/pages/AccountUpdatePage";
import { CheckoutPage } from "@/components/pages/CheckoutPage";
import { MyChildrenPage } from "@/components/pages/MyChildrenPage";
import { ChatPage } from "@/components/pages/ChatPage";

import { VerifyEmailPage } from "@/components/pages/VerifyEmailPage"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />

            <Route path="/account-update" element={<AccountUpdatePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-children" element={<MyChildrenPage />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;