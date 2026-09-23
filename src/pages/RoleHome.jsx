import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ui/LoadingState";

// Sends "/" to the right place: admins to /admin, everyone else to
// /dashboard, unauthenticated visitors to /login.
export default function RoleHome() {
  const { status, isAdmin } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingState label="Loading…" />
      </div>
    );
  }

  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
}
