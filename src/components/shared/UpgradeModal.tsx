import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Sparkles, Heart, Users, X } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: (tier: string) => void;
}

export const UpgradeModal = ({ open, onClose, onSubscribe }: UpgradeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="heading-warm text-2xl md:text-3xl text-foreground">
            Get Your Personal WhatsApp Coach
          </DialogTitle>
          <p className="text-gentle mt-2">
            Upgrade to get personalized advice through your private WhatsApp number, trained on your child's profile
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* What You Get Section */}
          <Card className="p-6 bg-primary-soft/30 border-primary/20">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              What you unlock with a subscription:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Private WhatsApp Number</p>
                  <p className="text-sm text-gentle">Your dedicated coach line, just for you</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Personalized Child Profile</p>
                  <p className="text-sm text-gentle">Tailored advice based on your child's unique needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">24/7 WhatsApp Access</p>
                  <p className="text-sm text-gentle">Get help whenever you need it most</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Adaptive Learning</p>
                  <p className="text-sm text-gentle">Your coach learns your family's preferences</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Basic Plan */}
            <Card className="p-6 border-border hover:border-primary/30 transition-all duration-300 relative">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-foreground mb-2">Basic Plan</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-foreground">$5</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-sm text-gentle mt-2">Perfect for getting started</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-primary mr-3" />
                  <span>Private WhatsApp number</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-primary mr-3" />
                  <span>50 conversations per month</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-primary mr-3" />
                  <span>1 personalized child profile</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-primary mr-3" />
                  <span>Tailored parenting advice</span>
                </div>
              </div>
              
              <Button 
                variant="gentle" 
                className="w-full"
                onClick={() => onSubscribe('basic')}
              >
                Get WhatsApp Coach
              </Button>
            </Card>

            {/* Family Plan */}
            <Card className="p-6 border-accent relative transform hover:scale-[1.02] transition-all duration-300">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-2 text-accent" />
                  Family Plan
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-foreground">$12</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-sm text-gentle mt-2">For busy families</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-accent mr-3" />
                  <span>Private WhatsApp number</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-accent mr-3" />
                  <span>Unlimited conversations</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-accent mr-3" />
                  <span>Up to 3 child profiles</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-accent mr-3" />
                  <span>Priority WhatsApp support</span>
                </div>
              </div>
              
              <Button 
                variant="accent" 
                className="w-full"
                onClick={() => onSubscribe('family')}
              >
                Get Premium WhatsApp Coach
              </Button>
            </Card>
          </div>

          {/* Trust Badge */}
          <div className="text-center py-4">
            <p className="text-sm text-gentle mb-2">
              🔒 Secure payment • Cancel anytime • 7-day free trial
            </p>
            <p className="text-xs text-muted-foreground">
              Trusted by thousands of parents worldwide
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};