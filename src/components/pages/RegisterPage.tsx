import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleIcon } from "@/components/ui/google-icon";

export const RegisterPage = () => {
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const selectedPlanId = searchParams.get("plan") || "free";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const planRef = doc(db, "plans", selectedPlanId);
        const planSnap = await getDoc(planRef);

        if (!planSnap.exists()) {
          throw new Error("Selected plan does not exist.");
        }

        const planData = planSnap.data();

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          planId: selectedPlanId,
          emailVerified: user.emailVerified || false,
          createdAt: serverTimestamp(),
          isActive: true,
          subscribedAt: serverTimestamp(),
          maxChildren: planData.maxChildren,
          maxConversations: planData.maxConversations,
        });

        await sendEmailVerification(user);
        await signOut(auth);
        navigate("/verify-email?notice=unverified");
      }
    } catch (err: any) {
      let message = "Registration failed";

      switch (err.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/weak-password":
          message = "Password is too weak. Please use at least 6 characters.";
          break;
        case "auth/missing-email":
          message = "Please enter an email address.";
          break;
        case "auth/missing-password":
          message = "Please enter a password.";
          break;
        case "auth/operation-not-allowed":
          message = "Account creation is currently disabled. Please contact support.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
        case "auth/internal-error":
          message = "Something went wrong. Please try again.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later.";
          break;
        default:
          console.error("Unhandled registration error:", err);
          message = err.message || "Something went wrong. Please try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      await signInWithGoogle();
      // If the user successfully signs in with Google, redirect them
      navigate("/");
    } catch (err: any) {
      let message = "Google sign-up failed";

      switch (err.code) {
        case "auth/popup-closed-by-user":
          message = "Sign-up popup was closed. Please try again.";
          break;
        case "auth/popup-blocked":
          message = "Popup was blocked by browser. Please allow popups and try again.";
          break;
        case "auth/cancelled-popup-request":
          message = "Sign-up was cancelled. Please try again.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
        case "auth/internal-error":
          message = "Something went wrong. Please try again.";
          break;
        default:
          console.error("Unhandled Google sign-up error:", err);
          message = err.message || "Something went wrong. Please try again.";
      }

      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-center text-foreground mb-6">Sign Up</h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-foreground mb-1">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {infoMessage && <p className="text-sm text-green-600">{infoMessage}</p>}

            <Button type="submit" variant="warm" className="w-full" disabled={loading || googleLoading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-3 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Google Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            {googleLoading ? "Signing up..." : "Continue with Google"}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-primary underline">Log in</a>
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
