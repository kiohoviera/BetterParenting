import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleIcon } from "@/components/ui/google-icon";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        navigate("/verify-email");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        await updateDoc(userRef, {
          emailVerified: true,
        });

        const subscribedAt = userData.subscribedAt?.toDate?.();
        const now = new Date();
        const planExpired =
          subscribedAt &&
          now.getTime() > subscribedAt.getTime() + 30 * 24 * 60 * 60 * 1000;

        if (planExpired && userData.planId !== "free") {
          await updateDoc(userRef, {
            planId: "free",
            maxChildren: 1,
            maxConversations: 10,
          });

          console.log("User subscription expired. Downgraded to Free plan.");
        }
      }

      navigate("/");
    } catch (err: any) {
      let message = "Login failed";

      switch (err.code) {
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/user-disabled":
          message = "This account has been disabled.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
        case "auth/internal-error":
          message = "Something went wrong. Please try again.";
          break;
        case "auth/operation-not-allowed":
          message = "Login is currently disabled. Please contact support.";
          break;
        case "auth/missing-password":
          message = "Password cannot be empty.";
          break;
        default:
          console.error("Unhandled login error:", err);
          message = err.message || "Something went wrong. Please try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      let message = "Google sign-in failed";

      switch (err.code) {
        case "auth/popup-closed-by-user":
          message = "Sign-in popup was closed. Please try again.";
          break;
        case "auth/popup-blocked":
          message = "Popup was blocked by browser. Please allow popups and try again.";
          break;
        case "auth/cancelled-popup-request":
          message = "Sign-in was cancelled. Please try again.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
        case "auth/internal-error":
          message = "Something went wrong. Please try again.";
          break;
        default:
          console.error("Unhandled Google sign-in error:", err);
          message = err.message || "Something went wrong. Please try again.";
      }

      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";

      switch (err.code) {
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;
        default:
          console.error("Forgot password error:", err);
          message = err.message || message;
      }

      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-center text-foreground mb-6">Log In</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
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

            {/* Password Field with Toggle */}
            <div>
              <label className="block text-sm text-foreground mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 px-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Login Button */}
            <Button
              type="submit"
              variant="warm"
              className="w-full"
              disabled={loading || googleLoading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-3 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          {/* Register Link */}
          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account?{" "}
            <a href="/register" className="text-primary underline">Register</a>
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
