import { Shield, Lock, Award, Users } from "lucide-react";

export const TrustBadges = () => {
  return (
    <div className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Trusted by thousands of parents worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">COPPA Compliant</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">Expert-Backed</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">10,000+ Active Families</span>
          </div>
        </div>
      </div>
    </div>
  );
};