import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportService } from "@/services/reportService";
import { authService } from "@/services/authService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReportAnalysis from "@/components/ReportAnalysis";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    let intervalId;

    const fetchReport = async () => {
      try {
        const data = await reportService.getReportStatus(id);
        setReport(data);
        setIsLoading(false);

        if (data.status === "processing") {
          intervalId = setInterval(async () => {
            try {
              const updated = await reportService.getReportStatus(id);
              if (updated.status === "completed") {
                setReport(updated);
                clearInterval(intervalId);
              } else if (updated.status === "failed") {
                setReport(updated);
                setError("AI Analysis failed. Please check the report contents.");
                clearInterval(intervalId);
              }
            } catch (err) {
              clearInterval(intervalId);
            }
          }, 2000);
        } else if (data.status === "failed") {
          setError("AI Analysis failed. Please check the report contents.");
        }
      } catch (err) {
        setError("Failed to fetch report analysis.");
        setIsLoading(false);
      }
    };

    fetchReport();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const handleReset = () => {
    navigate("/upload");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header 
        isLoggedIn={true}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-grow">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading report analysis...</p>
          </div>
        ) : error ? (
          <div className="container py-12">
            <div className="max-w-md mx-auto flex items-center gap-2 rounded-lg bg-health-critical-bg p-4 text-health-critical">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : report.status === "processing" ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-foreground">AI engine is analyzing and structuring values...</p>
              <p className="mt-2 text-xs text-muted-foreground">This may take up to a minute</p>
            </div>
          </div>
        ) : (
          <ReportAnalysis report={report} onReset={handleReset} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnalysisPage;
