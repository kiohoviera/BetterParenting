import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, MessageCircle, Clock, Brain, Heart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PricingPageProps {
  onBack: () => void;
  onSubscribe: (tier: string) => void;
}

export const PricingPage = ({ onBack, onSubscribe }: PricingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 fade-in-gentle">
          <h1 className="heading-warm text-3xl md:text-4xl font-semibold mb-6 text-foreground">
            Get Your Personal Parenting Coach
            <span className="block text-primary mt-2">24/7 AI Support on WhatsApp</span>
          </h1>
          <p className="text-gentle text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Your AI coach is trained specifically for your child's personality and your parenting values. 
            Available anytime you need guidance, right in WhatsApp.
          </p>
          
          {/* Setup Fee Notice */}
          <div className="bg-accent-soft/30 rounded-lg p-4 max-w-lg mx-auto mb-8">
            <p className="text-sm text-foreground font-medium">
              <span className="text-accent">One-time setup fee:</span> $24 to train your AI coach on your children and values
            </p>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="flex flex-col items-center p-4">
              <div className="p-3 rounded-xl bg-primary-soft mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">24/7 Available</h3>
              <p className="text-gentle text-sm text-center">Chat anytime, day or night</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 rounded-xl bg-accent-soft mb-3">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-medium text-foreground mb-2">AI Trained for You</h3>
              <p className="text-gentle text-sm text-center">Personalized for your child & values</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 rounded-xl bg-primary-soft mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Private WhatsApp</h3>
              <p className="text-gentle text-sm text-center">Your own dedicated coach number</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <Card className="p-6 shadow-gentle border-0 bg-card/50 backdrop-blur-sm relative flex flex-col h-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Basic Plan</h3>
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-primary">$5</span>
                <span className="text-gentle ml-2">/month</span>
              </div>
              <div className="text-xs text-accent mb-2">+ $24 setup fee</div>
              <p className="text-gentle text-sm">Perfect for 1 child</p>
            </div>

            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">50 conversations per month</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">1 child profile</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">AI trained on your values</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Private WhatsApp number</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">24/7 availability</span>
              </li>
            </ul>

            <Button 
              variant="gentle" 
              size="lg" 
              className="w-full mt-auto"
              onClick={() => onSubscribe('basic')}
            >
              Start Basic Plan
            </Button>
          </Card>

          {/* Family Plan */}
          <Card className="p-6 shadow-gentle border-0 bg-card/50 backdrop-blur-sm relative border-2 border-primary/20 flex flex-col h-full">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Family Plan</h3>
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-primary">$15</span>
                <span className="text-gentle ml-2">/month</span>
              </div>
              <div className="text-xs text-accent mb-2">+ $24 setup fee</div>
              <p className="text-gentle text-sm">For families with up to 3 children</p>
            </div>

            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">150 conversations per month</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Up to 3 children profiles</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Shared family WhatsApp number</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Advanced AI personalization</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Priority AI responses</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">24/7 availability</span>
              </li>
            </ul>

            <Button 
              variant="warm" 
              size="lg" 
              className="w-full mt-auto"
              onClick={() => onSubscribe('family')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Start Family Plan
            </Button>
          </Card>

          {/* Ultimate Plan */}
          <Card className="p-6 shadow-gentle border-0 bg-card/50 backdrop-blur-sm relative border-2 border-accent/20 flex flex-col h-full">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Ultimate Family</h3>
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-primary">$35</span>
                <span className="text-gentle ml-2">/month</span>
              </div>
              <div className="text-xs text-accent mb-2">+ $24 setup fee</div>
              <p className="text-gentle text-sm">For data-driven, intentional parenting</p>
            </div>

            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Unlimited conversations</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Up to 5 children profiles</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Shared family WhatsApp number</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Premium AI personalization</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm">Instant AI responses</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm font-medium">Monthly family insights report</span>
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                <span className="text-gentle text-sm font-medium">Personalized monthly workbook</span>
              </li>
            </ul>

            <Button 
              variant="accent" 
              size="lg" 
              className="w-full mt-auto"
              onClick={() => onSubscribe('ultimate')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Start Ultimate Plan
            </Button>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="text-center mt-16 max-w-2xl mx-auto">
          <p className="text-gentle text-sm italic mb-4">
            "Having a parenting coach available 24/7 has been life-changing. The AI really understands my daughter and gives advice that actually works."
          </p>
          <p className="text-muted-foreground text-xs">
            — Emily R., Mom of 6-year-old
          </p>
          
          <div className="mt-8 p-4 bg-primary-soft/30 rounded-lg">
            <p className="text-sm text-gentle">
              <strong>How it works:</strong> After subscribing, you'll complete a quick intake about your child and parenting style. 
              Then you'll receive your private WhatsApp number to start chatting with your personalized AI coach.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};