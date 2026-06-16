import { Navigate } from "react-router-dom";
import { authService } from "@/services/authService";

const ProtectedRoute = ({ children }) => {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
