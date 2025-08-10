import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Shield, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { Testimonials } from "@/components/shared/Testimonials";
import { EmailCapture } from "@/components/shared/EmailCapture";
import heroImage from "@/assets/hero-parenting.jpg";

import { useNavigate } from "react-router-dom";

interface WelcomePageProps {
  onStartChat?: () => void;
  onGoToPricing: () => void;
}

export const WelcomePage = ({ onStartChat, onGoToPricing }: WelcomePageProps) => {
  const navigate = useNavigate();
  
  const handleStartChat = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header onStartChat={onStartChat} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-12 fade-in-gentle">
          <h1 className="heading-warm text-4xl md:text-5xl font-semibold mb-6 text-foreground">
            Your Personal Parenting Coach
            <span className="block text-primary">Available on WhatsApp</span>
          </h1>
          <p className="text-gentle text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            24/7 AI chatbot trained for your child's personality and your parenting values. 
            Like having a wise coach in your pocket — one who knows your child.
            <span className="block mt-2 font-medium text-primary">Available anytime on WhatsApp.</span>
          </p>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-semibold text-accent">1</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Sign up & tell us about your child</h3>
                <p className="text-gentle text-sm">Quick intake quiz to personalize your AI coach</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-semibold text-accent">2</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Get your private WhatsApp number</h3>
                <p className="text-gentle text-sm">Your own dedicated parenting coach line</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-semibold text-accent">3</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Chat anytime you need help</h3>
                <p className="text-gentle text-sm">Real-time advice that fits your family</p>
              </div>
            </div>
          </div>
          
          <div className="relative max-w-2xl mx-auto mb-12 scale-in-warm">
            <img 
              src={heroImage} 
              alt="Parent and child together" 
              className="rounded-2xl shadow-warm w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
          </div>

          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button 
              variant="warm" 
              size="lg" 
              onClick={handleStartChat}
              className="w-full md:w-auto"
            >
              <MessageCircle className="w-5 h-5" />
              Try for Free
            </Button>
            <Button 
              variant="gentle" 
              size="lg"
              className="w-full md:w-auto"
              onClick={onGoToPricing}
            >
              Get Personalized Advice
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Free trial: 5 conversations or 1 per day (whichever comes first)
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-primary-soft mr-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Personalized for You</h3>
            </div>
            <p className="text-gentle">
              Personalized WhatsApp coach trained on your child's specific needs and your parenting style.
            </p>
          </Card>

          <Card className="p-6 shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-accent-soft mr-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Safe & Private</h3>
            </div>
            <p className="text-gentle">
              Your private WhatsApp number ensures secure, confidential conversations with your coach.
            </p>
          </Card>

          <Card className="p-6 shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-primary-soft mr-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Expert-Backed</h3>
            </div>
            <p className="text-gentle">
              Guidance rooted in child psychology and positive parenting approaches.
            </p>
          </Card>
        </div>

        {/* Email Capture */}
        <div className="mt-16 max-w-md mx-auto">
          <EmailCapture
            title="Stay Updated"
            description="Get weekly parenting tips and early access to new features."
            variant="default"
          />
        </div>
      </div>

      <Testimonials />
      <TrustBadges />
      <Footer />
    </div>
  );
};