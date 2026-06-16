import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ReportUpload from "@/components/ReportUpload";
import ReportAnalysis from "@/components/ReportAnalysis";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import HistoryDrawer from "@/components/HistoryDrawer";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState(null);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [user, setUser] = useState(null);
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

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
        setReportData(null); // Clear active report on logout
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

  const handleAnalysisComplete = (report) => {
    setReportData(report);
    toast({
      title: "Analysis Completed",
      description: `Report "${report.fileName}" analyzed successfully.`,
    });
  };

  const handleSelectReport = (report) => {
    setReportData(report);
    toast({
      title: "Report Loaded",
      description: `Loaded "${report.fileName}" from history.`,
    });
  };

  const handleReset = () => {
    setReportData(null);
  };

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    toast({
      title: "Success",
      description: `Signed in successfully. Welcome, ${userData.name}!`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenHistory={() => setHistoryDrawerOpen(true)}
        onLogout={handleLogout}
      />
      
      {!reportData ? (
        <>
          <Hero />
          <ReportUpload onAnalysisComplete={handleAnalysisComplete} />
        </>
      ) : (
        <ReportAnalysis 
          report={reportData} 
          onReset={handleReset}
        />
      )}
      
      <Footer />

      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* History Slide-over Drawer */}
      <HistoryDrawer 
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        onSelectReport={handleSelectReport}
      />
    </div>
  );
};

export default Index;
