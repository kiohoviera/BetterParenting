import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { WelcomePage } from "@/components/pages/WelcomePage";
import { PricingPage } from "@/components/pages/PricingPage";
import { ChatInterface } from "@/components/features/chat/ChatInterface";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { DashboardPage } from "@/components/features/dashboard/DashboardPage";
import { useToast } from "@/hooks/use-toast";

type AppState = 'welcome' | 'pricing' | 'chat' | 'onboarding';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [remainingMessages, setRemainingMessages] = useState(5);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Handle navigation state from other pages
  useEffect(() => {
    const state = location.state as { action?: string; tier?: string } | null;
    if (state?.action === 'start-chat') {
      setCurrentState('chat');
    } else if (state?.action === 'subscribe' && state.tier) {
      handleSubscribe(state.tier);
    }
  }, [location.state]);

  const handleStartChat = () => {
    setCurrentState('chat');
  };

  const handleGoToPricing = () => {
    setCurrentState('pricing');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleSubscribe = (tier: string) => {
    // In a real app, this would handle payment processing
    toast({
      title: "Subscription started!",
      description: `Welcome to the ${tier} plan. You now have unlimited access.`,
    });
    setShowUpgradeModal(false);
    setRemainingMessages(999); // Simulate unlimited
  };

  const handleSendMessage = () => {
    if (remainingMessages > 0) {
      setRemainingMessages(prev => prev - 1);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  // if (isAuthenticated) {
  //   return <DashboardPage />;
  // }

  // Show welcome/marketing pages for non-authenticated users
  if (currentState === 'welcome') {
    return <WelcomePage onStartChat={handleStartChat} onGoToPricing={handleGoToPricing} />;
  }

  if (currentState === 'pricing') {
    return <PricingPage onBack={handleBackToWelcome} onSubscribe={handleSubscribe} />;
  }

  if (currentState === 'chat') {
    return (
      <>
        <ChatInterface
          onBack={handleBackToWelcome}
          onUpgrade={handleUpgrade}
          remainingMessages={remainingMessages}
          totalFreeMessages={5}
          onSendMessage={handleSendMessage}
        />
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSubscribe={handleSubscribe}
        />
      </>
    );
  }

  return null;
};

export default Index;
