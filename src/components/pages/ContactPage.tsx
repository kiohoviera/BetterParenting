import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, Clock, Shield } from "lucide-react";

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="heading-warm text-4xl md:text-5xl font-bold">
            Get in Touch
          </h1>
          <p className="text-gentle text-lg max-w-3xl mx-auto">
            Have questions about our parenting coach? Need help with your account? 
            We're here to support your family journey.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-white/80 backdrop-blur shadow-warm border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-primary">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-primary">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-white/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-primary">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-primary">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="bg-white/50"
                  />
                </div>
                
                <Button type="submit" className="btn-warm w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-white/80 backdrop-blur shadow-warm border-0">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-warm rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary">Email Support</h3>
                    <p className="text-gentle text-sm">support@betterparenting.com</p>
                    <p className="text-muted-foreground text-xs">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary">Live Chat</h3>
                    <p className="text-gentle text-sm">Available 24/7 for subscribers</p>
                    <p className="text-muted-foreground text-xs">Instant support when you need it</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-warm rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary">Response Times</h3>
                    <p className="text-gentle text-sm">Email: Within 24 hours</p>
                    <p className="text-muted-foreground text-xs">Priority support for Ultimate subscribers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-warm border-0">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-primary">Privacy & Security</h3>
                    <p className="text-gentle text-sm leading-relaxed">
                      Your family's privacy is our top priority. All communications are encrypted 
                      and we never share personal information. Our platform is COPPA compliant 
                      for families with children under 13.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Preview */}
            <Card className="bg-white/80 backdrop-blur shadow-warm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Quick Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-primary text-sm">How does the AI work?</h4>
                  <p className="text-gentle text-xs">Our AI is trained by child development experts and provides personalized guidance based on your family's unique situation.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-primary text-sm">Is my data safe?</h4>
                  <p className="text-gentle text-xs">Yes, all conversations are encrypted and we follow strict privacy protocols. We're COPPA compliant.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-primary text-sm">Can I cancel anytime?</h4>
                  <p className="text-gentle text-xs">Absolutely. You can cancel your subscription at any time with no penalties.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};