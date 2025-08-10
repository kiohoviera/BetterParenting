import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { sendEmailVerification, onAuthStateChanged, reload } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const VerifyEmailPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check if URL has ?notice=resent or others
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const notice = query.get("notice");
    if (notice === "resent") {
      setMessage("Verification email resent! Please check your inbox.");
    }
  }, [location.search]);

  // ✅ Auto-check email verification and update Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.emailVerified) {
        setCheckingVerification(true);
        await reload(user);

        if (user.emailVerified) {
          // ✅ Update Firestore emailVerified field
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            emailVerified: true,
          });

          // Redirect after successful verification
          navigate("/email-verified"); // You can customize this
        }

        setCheckingVerification(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleResendVerification = async () => {
    const user = auth.currentUser;

    if (!user) {
      setMessage("You are not logged in.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await sendEmailVerification(user);
      setMessage("Verification email resent! Please check your inbox.");
    } catch (error: any) {
      setMessage(error.message || "Failed to resend email.");
    } finally {
      setSending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 shadow-gentle border-0 bg-card/50 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-center mb-4">Verify Your Email</h1>
          <p className="text-sm text-foreground mb-4 text-center">
            We’ve sent a verification link to your email. Please check your inbox and verify before logging in (check your spam).
          </p>

          {checkingVerification && (
            <p className="text-sm text-blue-500 text-center mb-4">
              Checking verification status...
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600 text-center mb-4">{message}</p>
          )}

          <Button
            onClick={handleResendVerification}
            variant="warm"
            className="w-full mb-2"
            disabled={sending}
          >
            {sending ? "Resending..." : "Resend Verification Email"}
          </Button>

          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded mb-2 transition-colors"
          >
            Open Gmail
          </a>

          <Button
            onClick={handleBackToLogin}
            variant="ghost"
            className="w-full text-sm"
          >
            Back to Login
          </Button>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
