import { Shield, FileText, History, LogOut, LogIn, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

const Header = ({ isLoggedIn, user, onLogout }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* App Brand */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Medical Report Analyzer</h1>
            <p className="text-xs text-muted-foreground">Private & Secure Analysis</p>
          </div>
        </Link>
        
        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <Shield className="h-4 w-4 text-health-normal" />
            <span>Secure AI Processing</span>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/upload")}
                className="flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/history")}
                className="flex items-center gap-1.5"
              >
                <History className="h-4 w-4" />
                History
              </Button>
              <div className="hidden text-xs text-muted-foreground md:block">
                Signed in as <span className="font-semibold text-foreground">{user?.name || "User"}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
