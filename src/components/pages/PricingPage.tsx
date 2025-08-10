import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Clock, Brain, MessageCircle, Heart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { onAuthStateChanged, User } from "firebase/auth";

type Plan = {
  id: string;
  name: string;
  price: number;
  setupFee: number;
  description: string;
  maxChildren: number;
  maxConversations: number;
  isDedicatedNumberPerChild: boolean;
};

export const PricingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);

  // Track authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Get user's current plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserPlanId(userDoc.data().planId || "free");
      }
    };
    fetchUserPlan();
  }, [currentUser]);

  // Fetch all available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const snapshot = await getDocs(collection(db, "plans"));
        const data: Plan[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Plan[];
        setPlans(data.filter((plan) => plan.id !== "free"));
      } catch (err) {
        console.error("🔥 Failed to load pricing plans:", err);
        setError("Failed to load pricing plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Main subscribe handler
  const handleSubscribe = (planId: string) => {
    if (!currentUser) {
      navigate(`/register?next=checkout&plan=${planId}`);
      return;
    }

    if (!currentUser.emailVerified) {
      navigate(`/verify-email`);
      return;
    }

    //  downgrade warning
    if (userPlanId && userPlanId !== planId) {
      const currentPlanIndex = plans.findIndex((p) => p.id === userPlanId);
      const targetPlanIndex = plans.findIndex((p) => p.id === planId);

      if (targetPlanIndex < currentPlanIndex) {
        const confirm = window.confirm(
          "You're downgrading your plan. Some child profiles or features may be frozen. Do you want to continue?"
        );
        if (!confirm) return;
      }
    }

    if (userPlanId === planId) {
      const confirm = window.confirm("Do you want to re-subscribe to this plan?");
      if (!confirm) return;
    }

    navigate(`/checkout?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 fade-in-gentle">
          <h1 className="heading-warm text-3xl md:text-4xl font-semibold mb-6 text-foreground">
            Get Your Personal Parenting Coach
            <span className="block text-primary mt-2">24/7 AI Support on WhatsApp</span>
          </h1>
          <p className="text-gentle text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Your AI coach is trained specifically for your child's personality and your parenting values. 
            Available anytime you need guidance, right in WhatsApp.
          </p>

          <div className="bg-accent-soft/30 rounded-lg p-4 max-w-lg mx-auto mb-8">
            <p className="text-sm text-foreground font-medium">
              <span className="text-accent">One-time setup fee:</span> $24 to train your AI coach on your children and values
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <Feature icon={<Clock />} title="24/7 Available" description="Chat anytime, day or night" />
            <Feature icon={<Brain />} title="AI Trained for You" description="Personalized for your child & values" />
            <Feature icon={<MessageCircle />} title="Private WhatsApp" description="Your own dedicated coach number" />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Loading pricing plans...</div>
        ) : error ? (
          <div className="text-center text-sm text-destructive">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 shadow-gentle border-2 ${
                  plan.id === "family"
                    ? "border-primary/20 bg-card/50 backdrop-blur-sm relative"
                    : plan.id === "ultimate"
                    ? "border-accent/20 bg-card/50 backdrop-blur-sm relative"
                    : "border-muted bg-card/50 backdrop-blur-sm"
                } flex flex-col h-full`}
              >
                {plan.id === "family" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.id === "ultimate" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold text-primary">${plan.price}</span>
                    <span className="text-gentle ml-2">/month</span>
                  </div>
                  <div className="text-xs text-accent mb-2">+ ${plan.setupFee} setup fee</div>
                  <p className="text-gentle text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.id === "basic" && (
                    <>
                      <PlanFeature label={`${plan.maxConversations} conversations per month`} />
                      <PlanFeature label={`${plan.maxChildren} child profile`} />
                      <PlanFeature label="AI trained on your values" />
                      <PlanFeature label="Private chat in an app" />
                      <PlanFeature label="24/7 availability" />
                    </>
                  )}

                  {plan.id === "family" && (
                    <>
                      <PlanFeature label="150 conversations per month" />
                      <PlanFeature label="Up to 3 children profiles" />
                      <PlanFeature label="Shared family chat in an app" />
                      <PlanFeature label="Advanced AI personalization" />
                      <PlanFeature label="Priority AI responses" />
                      <PlanFeature label="24/7 availability" />
                    </>
                  )}
                  
                  {plan.id === "ultimate" && (
                    <>
                      <PlanFeature label="Unlimited conversations" />
                      <PlanFeature label="Up to 5 children profiles" />
                      <PlanFeature label="Shared family chat in an app" />
                      <PlanFeature label="Premium AI personalization" />
                      <PlanFeature label="Instant AI responses" />
                      <PlanFeature label="Monthly family insights report" checkClassName="text-accent font-medium" />
                      <PlanFeature label="Personalized monthly workbook" checkClassName="text-accent font-medium" />
                    </>
                  )}


                </ul>


                <Button
                  variant={plan.id === "family" ? "warm" : plan.id === "ultimate" ? "accent" : "gentle"}
                  size="lg"
                  className="w-full mt-auto"
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {userPlanId === plan.id ? `Renew ${plan.name}` : `Start ${plan.name}`}
                  
                </Button>
              </Card>
            ))}
          </div>
        )}
        {/*  Testimonial and Info Block — Inserted Here  */}
        <div className="text-center mt-16 max-w-2xl mx-auto">
           <p className="text-gentle text-sm italic mb-4">
               "Having a parenting coach available 24/7 has been life-changing. The AI really understands my daughter and gives advice that actually works."
          </p>
          <p className="text-muted-foreground text-xs">— Emily R., Mom of 6-year-old</p>
            <div className="mt-8 p-4 bg-primary-soft/30 rounded-lg">
            <p className="text-sm text-gentle">
              <strong>How it works: </strong> 
              After subscribing, you'll complete a quick intake about your child and parenting style. Then you'll start chatting with your personalized AI coach in the app.
            </p>
          </div>
          </div>
        
      </div>
      <Footer />
    </div>
  );
};

// Feature block
const Feature = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center p-4">
    <div className="p-3 rounded-xl bg-primary-soft mb-3">{icon}</div>
    <h3 className="font-medium text-foreground mb-2">{title}</h3>
    <p className="text-gentle text-sm text-center">{description}</p>
  </div>
);

// Plan features
const PlanFeature = ({
  label,
  checkClassName,
}: {
  label: string;
  checkClassName?: string;
}) => (
  <li className="flex items-center">
    <Check className={`w-4 h-4 mr-2 flex-shrink-0 ${checkClassName ?? "text-primary"}`} />
    <span className="text-gentle text-sm">{label}</span>
  </li>
);
