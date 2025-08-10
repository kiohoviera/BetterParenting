import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface EmailCaptureProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  variant?: "default" | "inline";
}

export const EmailCapture = ({ 
  title = "Get Parenting Tips & Updates",
  description = "Join our community of parents and get weekly tips, articles, and early access to new features.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  variant = "default"
}: EmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Successfully subscribed!",
      description: "You'll receive our welcome email shortly.",
    });
    
    setEmail("");
    setIsLoading(false);
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? "..." : buttonText}
        </Button>
      </form>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 text-sm">{description}</p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Subscribing..." : buttonText}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
};