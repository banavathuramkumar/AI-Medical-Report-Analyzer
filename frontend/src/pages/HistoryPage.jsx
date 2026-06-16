import { useEffect, useState } from "react";
import { FileText, Calendar, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { reportService } from "@/services/reportService";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getReportsHistory();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load history.");
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex-grow container py-12">
        <div className="max-w-2xl mx-auto bg-card border border-border/50 rounded-2xl p-6 shadow-soft animate-slide-up">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Analysis History</h3>
              <p className="text-xs text-muted-foreground">Browse your previously analyzed reports</p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-lg bg-health-critical-bg p-4 text-health-critical">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">No Reports Found</p>
                <p className="text-xs text-muted-foreground">Your processed reports will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <div 
                    key={report._id || report.id}
                    onClick={() => navigate(`/analysis/${report._id || report.id}`)}
                    className="group flex cursor-pointer items-start gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-soft transition-all duration-200 hover:border-primary/30 hover:bg-accent/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {report.fileName || "Medical Report"}
                      </h4>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(report.uploadedAt || report.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          report.status === "completed" 
                            ? "bg-health-normal/10 text-health-normal" 
                            : "bg-health-warning/10 text-health-warning"
                        }`}>
                          {report.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Ready
                            </>
                          ) : (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Analyzing
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HistoryPage;
