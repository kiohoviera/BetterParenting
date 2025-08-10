import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Mom of two",
    content: "Finally, parenting advice that actually works in the moment. This app has been a game-changer for our family.",
    rating: 5
  },
  {
    name: "David L.",
    role: "Single father",
    content: "Having 24/7 access to parenting guidance on WhatsApp has reduced my stress so much. It's like having a wise friend always available.",
    rating: 5
  },
  {
    name: "Maria R.",
    role: "Mother of teenager",
    content: "The personalized advice really understands our family dynamics. It's helped us navigate some tough teenage years.",
    rating: 5
  },
  {
    name: "James K.",
    role: "New parent",
    content: "As a first-time dad, I was constantly worried. This AI coach gives me confidence and practical steps I can actually follow.",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <div className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Trusted by Parents Everywhere
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of families who have found confidence and peace of mind with personalized parenting guidance.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 border-0 bg-card/80 backdrop-blur-sm shadow-gentle">
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};