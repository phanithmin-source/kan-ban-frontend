import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks";
import { AppLoading } from "@/components";

interface ProtectedRouteProps {
  roles?: ("USER" | "MANAGER" | "ADMIN")[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
