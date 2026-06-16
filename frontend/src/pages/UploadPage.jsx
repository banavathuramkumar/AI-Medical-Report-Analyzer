import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ReportUpload from "@/components/ReportUpload";
import Footer from "@/components/Footer";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const UploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleAnalysisComplete = (report) => {
    toast({
      title: "Analysis Completed",
      description: `Report "${report.fileName}" analyzed successfully.`,
    });
    navigate(`/analysis/${report._id || report.id}`);
  };

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header 
        isLoggedIn={true}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-grow">
        <ReportUpload onAnalysisComplete={handleAnalysisComplete} />
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;
