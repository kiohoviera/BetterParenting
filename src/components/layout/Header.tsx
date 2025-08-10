import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { BetterParentingLogo } from "@/components/shared/BetterParentingLogo";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";

// Assuming User type is defined elsewhere, e.g., in firebase.ts or a types file
// interface User {
//   uid: string;
//   email: string | null;
//   // other user properties
// }

interface HeaderProps {
  onStartChat?: () => void;
}

export const Header = ({ onStartChat }: HeaderProps) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null); // Using 'any' for simplicity as original code did
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStartChat = () => {
    navigate("/chat");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleTryForFree = () => {
    if (onStartChat) {
      onStartChat();
    } else {
      handleStartChat(); // Use the new handler
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between relative">
        {/* Logo on left */}
        <Link to="/" className="flex items-center space-x-2">
          <BetterParentingLogo className="w-8 h-8" />
          <span className="font-bold text-lg text-primary">BetterParenting</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons - Right */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          {currentUser && (
            <Button 
              onClick={() => navigate("/my-children")} 
              className="btn-warm"
            >
              My Children
            </Button>
          )}

          {!currentUser && (
            <Button 
              variant="warm" 
              size="sm"
              onClick={handleStartChat} // Use handleStartChat here
            >
              Try for Free
            </Button>
          )}

          <Button
            onClick={currentUser ? handleLogout : handleLogin}
            className="btn-warm"
          >
            {currentUser ? "Logout" : (
              <>
                <span className="text-xs">Already have an account?</span> Login
              </>
            )}
          </Button>

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border md:hidden">
            <div className="container py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {currentUser && (
                <Button
                  onClick={() => {
                    navigate("/my-children");
                    setIsMenuOpen(false);
                  }}
                  className="btn-warm w-full mt-4"
                >
                  My Children
                </Button>
              )}

              {!currentUser && (
                <Button 
                  variant="warm" 
                  size="sm" 
                  className="w-full"
                  onClick={handleStartChat} // Use handleStartChat here
                >
                  Try for Free
                </Button>
              )}

              <Button
                onClick={() => {
                  currentUser ? handleLogout() : handleLogin();
                  setIsMenuOpen(false);
                }}
                className="btn-warm w-full"
              >
                {currentUser ? "Logout" : "Login"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};