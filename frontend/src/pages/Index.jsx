import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
    
    const handleAuthChange = () => {
      const logged = authService.isLoggedIn();
      setIsLoggedIn(logged);
      if (logged) {
        fetchUserProfile();
      } else {
        setUser(null);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [isLoggedIn]);

  const fetchUserProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-grow">
        <Hero />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
