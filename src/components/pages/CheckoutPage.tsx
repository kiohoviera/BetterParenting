// src/components/pages/CheckoutPage.tsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplyPlanCreditsToChildren } from "@/components/shared/ApplyPlanCreditsToChildren";
import { freezeExtraChildrenIfNeeded } from "@/lib/FreezeExtraChildren";

interface PlanData {
  name: string;
  description: string;
  price: number;
  setupFee?: number;
  maxChildren?: number;
  maxConversations?: number;
  isDedicatedNumberPerChild?: boolean;
}

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const planId = new URLSearchParams(location.search).get("plan");

  const [currentUserPlan, setCurrentUserPlan] = useState<PlanData | null>(null);

  // Track user subscription status
  useEffect(() => {
    const fetchCurrentUserPlan = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentPlanId = userData.planId || "free";

          const planRef = doc(db, "plans", currentPlanId);
          const planSnap = await getDoc(planRef);

          if (planSnap.exists()) {
            setCurrentUserPlan(planSnap.data() as PlanData);
          } else {
            console.warn("Current plan document not found:", currentPlanId);
          }
        } else {
          console.warn("User document not found:", userId);
        }
      } catch (error) {
        console.error("Error fetching current user plan:", error);
      }
    };

    fetchCurrentUserPlan();
  }, [userId]);


  // Track authenticated user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate(`/register?next=checkout&plan=${planId}`);
        return;
      }

      if (!user.emailVerified) {
        navigate(`/verify-email`);
        return;
      }

      setUserEmail(user.email ?? null);
      setUserId(user.uid ?? null);
    });

    return () => unsubscribe();
  }, [navigate, planId]);

  // Fetch plan from Firestore
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        console.warn("No planId found in URL.");
        setLoading(false);
        return;
      }

      try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);

        if (planSnap.exists()) {
          setPlan(planSnap.data() as PlanData);
        } else {
          console.warn(" Plan does not exist in Firestore:", planId);
        }
      } catch (error) {
        console.error(" Error fetching plan from Firestore:", error);
      }

      setLoading(false);
    };

    fetchPlan();
  }, [planId]);

  const handlePay = async () => {
    if (!userId || !userEmail || !planId || !plan) return;

    const userRef = doc(db, "users", userId);

    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(now.getMonth() + 1); // Plan expires in 1 month

      // Save plan details to user
      await setDoc(
        userRef,
        {
          email: userEmail,
          planId,
          subscribedAt: now,
          expiresAt,
          isActive: true,
          maxChildren: plan.maxChildren || 0,
          maxConversations: plan.maxConversations || 0,
          isDedicatedNumberPerChild: plan.isDedicatedNumberPerChild || false,
        },
        { merge: true }
      );

      //  Freeze extra child profiles if needed
      if (plan.maxChildren !== undefined) {
        await freezeExtraChildrenIfNeeded(userId, plan.maxChildren);
      }

      //  Apply monthly message credits
      if (plan.maxConversations) {
        await ApplyPlanCreditsToChildren(userId, plan.maxConversations);
      }

      navigate("/my-children");
    } catch (err) {
      console.error("❌ Failed to store user plan:", err);
      alert("Failed to complete checkout. Please try again.");
    }
  };

  // UI below
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <p>Plan not found. Please go back and select a valid plan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header onStartChat={() => {}} />

      <div className="container max-w-6xl mx-auto px-4 py-12 fade-in-gentle">
        <h1 className="text-3xl font-bold mb-10 text-center text-foreground">
          Checkout: {plan.name}
        </h1>

        {/* Grid layout for desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column: Plan + Account Info */}
          <div className="space-y-6">

            {/* Plan Summary Card */}
            <Card className="p-6 shadow-gentle">
              <h2 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h2>
              <p className="text-muted-foreground mb-4">{plan.description}</p>

              <ul className="text-gentle text-sm mb-4 space-y-1">
                {typeof plan.maxChildren === "number" && (
                  <li>👶 Up to {plan.maxChildren} children</li>
                )}

                {typeof plan.maxConversations === "number" && (
                  <li>💬 {plan.maxConversations} conversations/month</li>
                )}

                <li>
                  📱{" "}
                  {plan.isDedicatedNumberPerChild
                    ? "Dedicated WhatsApp number per child"
                    : "Shared WhatsApp number"}
                </li>

                <li>🕐 24/7 availability</li>
                <li>🧠 AI trained on your values</li>

                {plan.name?.toLowerCase().includes("ultimate") && (
                  <>
                    <li>📊 Monthly family insights report</li>
                    <li>📘 Personalized monthly workbook</li>
                  </>
                )}
              </ul>


              <div className="text-2xl font-bold text-foreground">${plan.price} / month</div>
              {plan.setupFee && (
                <div className="text-sm text-muted-foreground">
                  + ${plan.setupFee} one-time setup fee
                </div>
              )}
            </Card>

            {/* Account Info Card */}
            <Card className="p-6 shadow-gentle">
              <h3 className="text-lg font-medium mb-2 text-foreground">Account</h3>

              {userEmail && (
                <div className="space-y-2">
                  <p className="text-foreground text-sm">
                    Signed in as <span className="font-medium">{userEmail}</span>
                  </p>
                </div>
              )}

              {currentUserPlan && (
                <p className="text-muted-foreground text-sm mt-2">
                  Current subscription: <span className="font-semibold">{currentUserPlan.name}</span>
                </p>
              )}
            </Card>
          </div>

          {/* Right Column: Payment Details */}
          <div className="space-y-6">

            <Card className="p-6 shadow-gentle">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Payment Details</h3>

              <div className="space-y-6">

                {/* Card Details */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Card Information</label>

                  <div className="rounded-md border border-input bg-background transition hover:shadow-sm focus-within:shadow-inner px-4 py-3 space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>**** **** **** 4242</span>
                      <span className="text-xs">Visa</span>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Expiry</div>
                        <div className="bg-muted rounded px-3 py-2 text-sm">MM / YY</div>
                      </div>

                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">CVC</div>
                        <div className="bg-muted rounded px-3 py-2 text-sm">•••</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Email */}
                {userEmail && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Billing Email</label>
                    <div className="mt-1 px-4 py-2 bg-muted rounded border border-input text-sm text-foreground">
                      {userEmail}
                    </div>
                  </div>
                )}

                {/* Button */}
                <Button
                  size="lg"
                  variant="warm"
                  className="w-full mt-4 transition-transform hover:scale-[1.01]"
                  onClick={handlePay}
                >
                  Pay Now (UI Only)
                </Button>
              </div>
            </Card>

            <p className="text-xs text-muted-foreground text-center">
              This is a placeholder UI. You’ll be redirected to a secure Stripe checkout.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>

  );
};
